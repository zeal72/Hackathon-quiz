// QuizPage.js
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getDatabase, ref, push, set } from 'firebase/database';
import QuestionCard from '../Components/QuestionCard';
import ProgressBar from '../Components/ProgressBar';
import AllQuestionsData from '../../public/Questions.json';
import { getRandomQuestions } from '../utilis/randomquestions';

const QUESTIONS_PER_PAGE = 10;
const TOTAL_PAGES = 2;
const TOTAL_TIME = 300;

const formatTime = (seconds) => {
	const mins = Math.floor(seconds / 60);
	const secs = seconds % 60;
	return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export default function QuizPage() {
	const location = useLocation();
	const navigate = useNavigate();
	const username = location.state?.username || 'User';

	// Convert correct answers to numbers
	const allQuestionsWithNumbers = (AllQuestionsData || []).map(q => ({
		...q,
		correctAnswer: Number(q.correctAnswer)
	}));

	const [currentPage, setCurrentPage] = useState(0);
	const [selectedOptions, setSelectedOptions] = useState({});
	const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
	const [isSubmitted, setIsSubmitted] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Initialize questions state - only do this once on component mount
	const [quizQuestions, setQuizQuestions] = useState(() => {
		try {
			const { allSelectedQuestions } = getRandomQuestions(
				allQuestionsWithNumbers,
				QUESTIONS_PER_PAGE,
				TOTAL_PAGES
			);

			console.log('Quiz questions initialized:', allSelectedQuestions.length);
			return allSelectedQuestions;
		} catch (error) {
			console.error('Error initializing questions:', error);
			return allQuestionsWithNumbers.slice(0, QUESTIONS_PER_PAGE * TOTAL_PAGES);
		}
	});

	// Get current page questions
	const currentQuestions = quizQuestions.slice(
		currentPage * QUESTIONS_PER_PAGE,
		(currentPage * QUESTIONS_PER_PAGE) + QUESTIONS_PER_PAGE
	);

	useEffect(() => {
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}, [currentPage]);

	useEffect(() => {
		if (timeLeft > 0 && !isSubmitted) {
			const timer = setInterval(() => {
				setTimeLeft((t) => {
					if (t <= 1) {
						handleSubmitQuiz();
						return 0;
					}
					return t - 1;
				});
			}, 1000);
			return () => clearInterval(timer);
		}
	}, [timeLeft, isSubmitted]);

	const answeredCount = Object.keys(selectedOptions).length;
	const progress = (answeredCount / quizQuestions.length) * 100;

	const isCurrentPageComplete = () => {
		// Get the starting index for the current page
		const startIdx = currentPage * QUESTIONS_PER_PAGE;

		// Double check we have questions
		if (!currentQuestions || currentQuestions.length === 0) {
			console.error('No questions found for current page:', currentPage);
			return false;
		}

		// Check if all questions on this page have answers
		for (let i = 0; i < currentQuestions.length; i++) {
			const questionIdx = startIdx + i;
			if (!selectedOptions.hasOwnProperty(questionIdx)) {
				console.log(`Question ${questionIdx} not answered yet`);
				return false;
			}
		}

		console.log(`All questions on page ${currentPage} answered!`);
		return true;
	};

	const handleOptionSelect = (questionIndex, optionIndex) => {
		console.log(`Selecting option ${optionIndex} for question ${questionIndex}`);

		setSelectedOptions(prev => {
			const updated = { ...prev, [questionIndex]: optionIndex };
			console.log('Updated selections:', updated);
			return updated;
		});
	};

	const calculateScore = () => Object.entries(selectedOptions).reduce(
		(sum, [idx, sel]) => {
			const questionIndex = Number(idx);
			const question = quizQuestions[questionIndex];

			if (!question) {
				console.error(`Question at index ${questionIndex} not found`);
				return sum;
			}

			return sum + (Number(sel) === question.correctAnswer ? 1 : 0);
		},
		0
	);

	const saveResults = async (resultsData) => {
		try {
			const resultsRef = ref(getDatabase(), 'quizResults');
			const newRef = push(resultsRef);
			await set(newRef, resultsData);

			// Update local storage
			const history = JSON.parse(localStorage.getItem('quizResults') || '[]');
			localStorage.setItem('quizResults', JSON.stringify([...history, resultsData]));
			localStorage.setItem('latestQuizResult', JSON.stringify(resultsData));
		} catch (e) {
			console.error('Save error:', e);
		}
	};

	const handleFormSubmit = (e) => {
		e.preventDefault();

		// This prevents accidental form submissions
		if (!isCurrentPageComplete() || currentPage !== TOTAL_PAGES - 1) {
			console.log('Cannot submit: Not all questions answered or not on last page');
			return;
		}

		handleSubmitQuiz();
	};

	const handleSubmitQuiz = async () => {
		// Guard against duplicate submissions
		if (isSubmitted || isSubmitting) {
			console.log('Quiz already submitted or submitting');
			return;
		}

		setIsSubmitting(true);

		try {
			const score = calculateScore();
			const resultsData = {
				username,
				score,
				totalQuestions: quizQuestions.length,
				selectedOptions: Object.fromEntries(
					Object.entries(selectedOptions).map(([k, v]) => [k, Number(v)])
				),
				questions: quizQuestions,
				timestamp: new Date().toISOString(),
			};

			await saveResults(resultsData);
			setIsSubmitted(true);
			navigate('/resultpage', { state: resultsData });
		} catch (err) {
			console.error('Error submitting quiz:', err);
			alert('Error saving results. Using local storage.');

			const score = calculateScore();
			const resultsData = {
				username,
				score,
				totalQuestions: quizQuestions.length,
				selectedOptions: Object.fromEntries(
					Object.entries(selectedOptions).map(([k, v]) => [k, Number(v)])
				),
				questions: quizQuestions,
				timestamp: new Date().toISOString(),
			};

			setIsSubmitted(true);
			navigate('/resultpage', { state: resultsData });
		} finally {
			setIsSubmitting(false);
		}
	};

	// For debugging
	console.log(`Current page: ${currentPage}, Questions: ${currentQuestions.length}, Answered: ${answeredCount}/${quizQuestions.length}`);

	return (
		<div className="min-h-screen bg-gradient-to-br from-[#1E1B4B] to-[#0F172A] text-white">
			<header className="sticky top-2 z-50 bg-[#1E293B]/90 backdrop-blur-sm shadow-lg w-[90%] mx-auto rounded-b-xl">
				<div className="container mx-auto px-4 py-3 flex flex-col md:flex-row md:justify-between items-center gap-4">
					<h1 className="text-2xl font-bold">
						Welcome, <span className="text-purple-300">{username}</span> 👋
					</h1>
					<div className="flex items-center gap-4 w-full md:w-auto">
						<div className="flex items-center gap-2 bg-black/20 px-4 py-2 rounded-lg">
							<span className="font-medium">Time:</span>
							<span className="font-mono text-yellow-400">{formatTime(timeLeft)}</span>
						</div>
						<div className="flex-1 min-w-[200px]">
							<ProgressBar progress={progress} />
							<div className="text-xs text-gray-300 text-right mt-1">
								{answeredCount}/{quizQuestions.length} answered
							</div>
						</div>
					</div>
				</div>
			</header>

			<main className="container md:w-[92%] mx-auto px-4 py-8">
				<form onSubmit={handleFormSubmit} className="bg-[#1E293B] rounded-xl shadow-xl overflow-hidden">
					<div className="p-6 space-y-6">
						{currentQuestions.length > 0 ? (
							currentQuestions.map((q, idx) => {
								const absoluteIndex = currentPage * QUESTIONS_PER_PAGE + idx;
								return (
									<motion.div
										key={absoluteIndex}
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: idx * 0.05 }}
									>
										<QuestionCard
											question={q.question}
											options={q.options}
											qIndex={absoluteIndex}
											selected={selectedOptions[absoluteIndex]}
											onSelect={handleOptionSelect}
											disabled={isSubmitted}
										/>
									</motion.div>
								);
							})
						) : (
							<div className="text-center py-8">
								<p className="text-xl text-red-400">No questions available for this page.</p>
							</div>
						)}
					</div>

					<div className="bg-[#1E293B]/80 border-t border-gray-700 p-4 flex justify-between">
						<button
							type="button"
							onClick={() => setCurrentPage(p => Math.max(p - 1, 0))}
							disabled={isSubmitted || currentPage === 0 || isSubmitting}
							className={`px-6 py-2 rounded-lg font-medium transition ${isSubmitted || currentPage === 0 || isSubmitting
									? 'bg-gray-700 text-gray-400 cursor-not-allowed'
									: 'bg-gray-600 hover:bg-gray-500 text-white'
								}`}
						>
							← Previous
						</button>

						{currentPage < TOTAL_PAGES - 1 ? (
							<button
								type="button"
								onClick={() => {
									if (isCurrentPageComplete()) {
										setCurrentPage(p => p + 1);
									} else {
										alert("Please answer all questions on this page before proceeding.");
									}
								}}
								disabled={!isCurrentPageComplete() || isSubmitted || isSubmitting}
								className={`px-6 py-2 rounded-lg font-medium transition ${!isCurrentPageComplete() || isSubmitted || isSubmitting
										? 'bg-purple-700 text-purple-300 cursor-not-allowed'
										: 'bg-purple-600 hover:bg-purple-500 text-white'
									}`}
							>
								Next →
							</button>
						) : (
							<button
								type="button" // Changed from type="submit" to allow custom validation
								onClick={() => {
									if (isCurrentPageComplete()) {
										handleSubmitQuiz();
									} else {
										alert("Please answer all questions on this page before submitting.");
									}
								}}
								disabled={!isCurrentPageComplete() || isSubmitted || isSubmitting}
								className={`px-6 py-2 rounded-lg font-medium transition ${!isCurrentPageComplete() || isSubmitted || isSubmitting
										? 'bg-purple-700 text-purple-300 cursor-not-allowed'
										: 'bg-purple-600 hover:bg-purple-500 text-white'
									}`}
							>
								{isSubmitting ? 'Submitting...' : 'Submit Quiz'}
							</button>
						)}
					</div>
				</form>
			</main>
		</div>
	);
}