// QuizPage.js - Modified version with proper database initialization and localStorage handling

import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getDatabase } from 'firebase/database'
import { ref, push, set } from 'firebase/database';
import QuestionCard from '../Components/QuestionCard';
import ProgressBar from '../Components/ProgressBar';
import AllQuestions from '../../public/Questions.json';

const questionsPerPage = 10;
const totalTimeInSeconds = 300;

const formatTime = (seconds) => {
	const mins = Math.floor(seconds / 60);
	const secs = seconds % 60;
	return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export default function QuizPage() {
	const location = useLocation();
	const navigate = useNavigate();
	const username = location.state?.username || 'User';
	const allQuestions = AllQuestions || [];

	const [currentPage, setCurrentPage] = useState(0);
	const [selectedOptions, setSelectedOptions] = useState({});
	const [timeLeft, setTimeLeft] = useState(totalTimeInSeconds);
	const [isSubmitted, setIsSubmitted] = useState(false);

	// Initialize database reference
	const database = getDatabase();

	const currentQuestions = allQuestions.slice(
		currentPage * questionsPerPage,
		(currentPage + 1) * questionsPerPage
	);

	useEffect(() => {
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}, [currentPage]);


	const answeredCount = Object.keys(selectedOptions).length;
	const progress = (answeredCount / allQuestions.length) * 100;

	const isCurrentPageComplete = () => {
		const startIndex = currentPage * questionsPerPage;
		const endIndex = Math.min(startIndex + questionsPerPage, allQuestions.length);
		for (let i = startIndex; i < endIndex; i++) {
			if (!(i in selectedOptions)) return false;
		}
		return true;
	};

	const handleOptionSelect = (questionIndex, optionIndex) => {
		setSelectedOptions(prev => ({
			...prev,
			[questionIndex]: optionIndex
		}));
	};

	const handlePrev = () => {
		if (currentPage > 0) {
			setCurrentPage(currentPage - 1);
		}
	};

	const handleNext = () => {
		if (isCurrentPageComplete() && currentPage < Math.ceil(allQuestions.length / questionsPerPage) - 1) {
			setCurrentPage(currentPage + 1);
		}
	};

	const calculateScore = () => {
		return Object.entries(selectedOptions).reduce((score, [index, selected]) => {
			const correctIndex = allQuestions[index].correctAnswer;
			return score + (selected === correctIndex ? 1 : 0);
		}, 0);
	};

	const saveResults = async (score) => {
		// Prepare comprehensive results data
		const resultsData = {
			username,
			score,
			totalQuestions: allQuestions.length,
			selectedOptions,
			questions: allQuestions, // Include full questions for complete local storage
			timestamp: new Date().toISOString()
		};

		const firebaseData = {
			username,
			score,
			totalQuestions: allQuestions.length,
			selectedOptions,
			timestamp: new Date().toISOString()
		};

		// Save to Firebase
		try {
			const resultsRef = ref(database, 'quizResults');
			const newResultRef = push(resultsRef);
			await set(newResultRef, firebaseData);
			console.log("Results saved to Firebase");
		} catch (error) {
			console.error("Error saving to Firebase:", error);
		}

		// Always save to localStorage
		try {
			// Save latest result separately for easy access
			localStorage.setItem('latestQuizResult', JSON.stringify(resultsData));

			// Also keep history of results
			const existingResults = JSON.parse(localStorage.getItem('quizResults')) || [];
			localStorage.setItem('quizResults', JSON.stringify([...existingResults, resultsData]));
			console.log("Results saved to localStorage");
		} catch (error) {
			console.error("Error saving to localStorage:", error);
		}

		return resultsData;
	}; const handleSubmit = async () => {
		setIsSubmitted(true);
		const score = calculateScore();
		const timestamp = new Date().toISOString();

		// Make sure all required props are included
		const resultsData = {
			username,
			score,
			totalQuestions: allQuestions.length,
			selectedOptions,
			questions: allQuestions,
			timestamp,
		};

		// Save to Firebase
		try {
			const resultsRef = ref(database, 'quizResults');
			const newResultRef = push(resultsRef);
			await set(newResultRef, {
				username,
				score,
				totalQuestions: allQuestions.length,
				selectedOptions,
				timestamp,
			});
			console.log("Results saved to Firebase");
		} catch (error) {
			console.error("Error saving to Firebase:", error);
		}

		// Save to localStorage
		try {
			localStorage.setItem('latestQuizResult', JSON.stringify(resultsData));
			const existingResults = JSON.parse(localStorage.getItem('quizResults')) || [];
			localStorage.setItem('quizResults', JSON.stringify([...existingResults, resultsData]));
			console.log("Results saved to localStorage");
		} catch (error) {
			console.error("Error saving to localStorage:", error);
		}

		// Navigate and pass data to results page
		navigate('/resultpage', { state: resultsData });
	};


	useEffect(() => {
		if (timeLeft > 0 && !isSubmitted) {
			const timer = setInterval(() => {
				setTimeLeft((prev) => {
					if (prev <= 1) {
						handleSubmit();
						return 0;
					}
					return prev - 1;
				});
			}, 1000);
			return () => clearInterval(timer);
		}
	}, [timeLeft, isSubmitted]);

	return (
		<div className="min-h-screen bg-gradient-to-br from-[#1E1B4B] to-[#0F172A] text-white">
			{/* Sticky Header */}
			<header className="sticky top-2 z-50 bg-[#1E293B]/90 backdrop-blur-sm shadow-lg w-[90%] mx-auto rounded-b-xl">
				<div className="container mx-auto px-4 py-3">
					<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
						<h1 className="text-2xl font-bold text-white">
							Welcome, <span className="text-purple-300">{username}</span> 👋
						</h1>

						<div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8 w-full md:w-auto">
							<div className="flex items-center gap-2 bg-black/20 px-4 py-2 rounded-lg">
								<span className="font-medium">Time:</span>
								<span className="font-mono text-yellow-400 text-lg">
									{formatTime(timeLeft)}
								</span>
							</div>

							<div className="flex-1 min-w-[200px]">
								<ProgressBar progress={progress} />
								<div className="text-xs md:text-sm text-gray-300 text-right mt-1">
									{answeredCount}/{allQuestions.length} answered
								</div>
							</div>
						</div>
					</div>
				</div>
			</header>

			{/* Main Content */}
			<main className="container md:w-[92%] mx-auto px-4 py-8">
				<div className="bg-[#1E293B] rounded-xl shadow-xl overflow-hidden">
					{/* Questions */}
					<div className="p-6 space-y-6">
						{currentQuestions.map((q, index) => {
							const absoluteIndex = index + currentPage * questionsPerPage;
							return (
								<motion.div
									key={absoluteIndex}
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.3, delay: index * 0.05 }}
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
						})}
					</div>

					{/* Navigation */}
					<div className="bg-[#1E293B]/80 border-t border-gray-700 p-4">
						<div className="flex justify-between">
							<button
								onClick={handlePrev}
								className={`px-6 py-2 rounded-lg font-medium transition-all ${isSubmitted || currentPage === 0
									? 'bg-gray-700 text-gray-400 cursor-not-allowed'
									: 'bg-gray-600 hover:bg-gray-500 text-white'
									}`}
								disabled={isSubmitted || currentPage === 0}
							>
								← Previous
							</button>

							<button
								onClick={
									currentPage < Math.ceil(allQuestions.length / questionsPerPage) - 1
										? handleNext
										: handleSubmit
								}
								className={`px-6 py-2 rounded-lg font-medium transition-all ${(!isCurrentPageComplete() || isSubmitted)
									? 'bg-purple-700 text-purple-300 cursor-not-allowed'
									: 'bg-purple-600 hover:bg-purple-500 text-white'
									}`}
								disabled={!isCurrentPageComplete() || isSubmitted}
							>
								{currentPage < Math.ceil(allQuestions.length / questionsPerPage) - 1 ? 'Next →' : 'Submit Quiz'}
							</button>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}