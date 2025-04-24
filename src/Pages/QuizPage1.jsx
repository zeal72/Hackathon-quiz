// QuizPage.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getDatabase, ref as dbRef, get, push, set } from 'firebase/database';
import QuestionCard from '../Components/QuestionCard';
import ProgressBar from '../Components/ProgressBar';
import AllQuestionsData from '../../public/Questions.json';
import { getRandomQuestions } from '../utilis/randomquestions';

import { getText } from '../config/strings';
const QUESTIONS_PER_PAGE = 10;
const TOTAL_PAGES = 2;
const TOTAL_TIME = 300;

const formatTime = (seconds) => {
	const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
	const secs = (seconds % 60).toString().padStart(2, '0');
	return `${mins}:${secs}`;
};

export default function QuizPage() {
	const auth = getAuth();
	const db = getDatabase();
	const navigate = useNavigate();

	const text = getText("en");
	const [username, setUsername] = useState('User');
	const [loadingUser, setLoadingUser] = useState(true);
	const [currentPage, setCurrentPage] = useState(0);
	const [selectedOptions, setSelectedOptions] = useState({});
	const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
	const [isSubmitted, setIsSubmitted] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isPageLoading, setIsPageLoading] = useState(false);

	const [quizQuestions] = useState(() => {
		const data = AllQuestionsData.map(q => ({
			...q,
			correctAnswer: Number(q.correctAnswer)
		}));
		try {
			return getRandomQuestions(data, QUESTIONS_PER_PAGE, TOTAL_PAGES)
				.allSelectedQuestions;
		} catch {
			return data.slice(0, QUESTIONS_PER_PAGE * TOTAL_PAGES);
		}
	});

	useEffect(() => {
		const unsub = onAuthStateChanged(auth, async (user) => {
			if (user) {
				try {
					const snapshot = await get(
						dbRef(db, `users/${user.uid}/username`)
					);
					if (snapshot.exists()) {
						setUsername(snapshot.val());
					}
				} catch (e) {
					console.error('Error fetching username:', e);
				}
			}
			setLoadingUser(false);
		});
		return unsub;
	}, [auth, db]);

	useEffect(() => {
		if (timeLeft > 0 && !isSubmitted) {
			const timer = setInterval(() => {
				setTimeLeft(t => {
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

	useEffect(() => {
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}, [currentPage]);

	const answeredCount = Object.keys(selectedOptions).length;
	const progress = (answeredCount / quizQuestions.length) * 100;
	const currentQuestions = quizQuestions.slice(
		currentPage * QUESTIONS_PER_PAGE,
		currentPage * QUESTIONS_PER_PAGE + QUESTIONS_PER_PAGE
	);

	const isPageComplete = () => {
		const start = currentPage * QUESTIONS_PER_PAGE;
		return currentQuestions.every((_, i) =>
			selectedOptions.hasOwnProperty(start + i)
		);
	};

	const handleOptionSelect = (qIdx, optIdx) => {
		setSelectedOptions(prev => ({ ...prev, [qIdx]: optIdx }));
	};

	const calculateScore = () =>
		Object.entries(selectedOptions).reduce((sum, [idx, sel]) => {
			const q = quizQuestions[Number(idx)];
			return sum + (Number(sel) === q.correctAnswer ? 1 : 0);
		}, 0);

	const handleSubmitQuiz = async () => {
		if (isSubmitted || isSubmitting) return;
		setIsSubmitting(true);

		const score = calculateScore();
		const timeTaken = TOTAL_TIME - timeLeft;

		const resultsData = {
			username,
			score,
			totalQuestions: quizQuestions.length,
			selectedOptions: Object.fromEntries(
				Object.entries(selectedOptions).map(([k, v]) => [k, Number(v)])
			),
			questions: quizQuestions,
			timeTaken,
			timestamp: new Date().toISOString()
		};

		const resultsRef = dbRef(db, 'quizResults');
		const newResRef = push(resultsRef);
		await set(newResRef, resultsData).catch(e => console.error(e));

		setIsSubmitted(true);
		navigate('/resultpage', { state: resultsData });
		setIsSubmitting(false);
	};

	const handlePageChange = (direction) => {
		setIsPageLoading(true);
		setTimeout(() => {
			setCurrentPage(p => {
				const newPage = direction === 'next' ? p + 1 : p - 1;
				return Math.max(0, Math.min(newPage, TOTAL_PAGES - 1));
			});
			setIsPageLoading(false);
		}, 300);
	};

	if (loadingUser) {
		return (
			<div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#0F172A] to-[#1E1B4B]">
				<div className="flex flex-col items-center space-y-4">
					{/* Enhanced Spinner */}
					<div className="relative">
						<svg className="animate-spin h-24 w-24 text-[#6366F1]" viewBox="0 0 24 24">
							<circle
								className="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								strokeWidth="4"
								fill="none"
							/>
							<path
								className="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							/>
						</svg>

						{/* Pulsing center dot */}
						<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
							<div className="animate-ping h-4 w-4 rounded-full bg-purple-500 opacity-75"></div>
							<div className="absolute top-0 left-0 h-4 w-4 rounded-full bg-gradient-to-br from-purple-500 to-blue-500"></div>
						</div>
					</div>

					{/* Animated text */}
					<div className="flex flex-col items-center space-y-2">
						<p className="text-transparent bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-lg font-semibold">
							<p className="mt-4 text-purple-300">Loading your profile...</p>
						</p>
						<p className="text-purple-300 text-sm">{text.loading.subtext}</p>
						<div className="flex space-x-2">
							<div className="h-2 w-2 bg-purple-400 rounded-full animate-bounce"></div>
							<div className="h-2 w-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
							<div className="h-2 w-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
						</div>
					</div>
				</div>
			</div>
		);
	}
	return (
		<div className="min-h-screen bg-gradient-to-br from-[#1E1B4B] to-[#0F172A] text-white">
			{isPageLoading && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
					<div className="animate-spin h-12 w-12 border-4 border-purple-500 border-t-transparent rounded-full" />
				</div>
			)}

			<header className="sticky top-2 z-50 bg-[#1E293B]/90 backdrop-blur-sm shadow-lg max-w-[1200px] w-[90%] mx-auto rounded-b-xl">
				<div className="flex flex-wrap items-center justify-between px-4 py-3 gap-4">
					<h1 className="flex-1 text-xl sm:text-2xl font-bold">
						Welcome,{' '}
						<span className="text-purple-300">{username}</span> 👋
					</h1>
					<div className="flex-none w-full sm:w-auto">
						<div className="inline-flex items-center gap-1 bg-black/20 px-3 py-3 rounded-lg">
							<span className="font-medium text-sm sm:text-base">
								Time:
							</span>
							<span className="font-mono text-yellow-400 ml-1 text-sm sm:text-base">
								{formatTime(timeLeft)}
							</span>
						</div>
					</div>
					<div className="flex-1 min-w-[150px] w-full sm:w-auto">
						<ProgressBar progress={progress} />
						<div className="mt-1 text-xs sm:text-sm text-gray-300 text-left">
							{answeredCount}/{quizQuestions.length} answered
						</div>
					</div>
				</div>
			</header>

			<main className="container md:w-[92%] mx-auto px-4 py-8">
				<form className="bg-[#1E293B] rounded-xl shadow-xl overflow-hidden">
					<div className="p-6 space-y-6">
						{currentQuestions.map((q, idx) => {
							const absIdx = currentPage * QUESTIONS_PER_PAGE + idx;
							return (
								<motion.div
									key={absIdx}
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: idx * 0.05 }}
								>
									<QuestionCard
										question={q.question}
										options={q.options}
										qIndex={absIdx}
										selected={selectedOptions[absIdx]}
										onSelect={handleOptionSelect}
										disabled={isSubmitted}
									/>
								</motion.div>
							);
						})}
					</div>

					<div className="bg-[#1E293B]/80 border-t border-gray-700 p-4 flex justify-between">
						<button
							type="button"
							onClick={() => handlePageChange('prev')}
							disabled={currentPage === 0 || isSubmitting}
							className={`px-6 py-2 rounded-lg font-medium transition ${currentPage === 0 || isSubmitting
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
									if (isPageComplete()) handlePageChange('next');
									else alert('Please answer all questions on this page before proceeding.');
								}}
								disabled={!isPageComplete() || isSubmitting}
								className={`px-6 py-2 rounded-lg font-medium transition ${!isPageComplete() || isSubmitting
									? 'bg-purple-700 text-purple-300 cursor-not-allowed'
									: 'bg-purple-600 hover:bg-purple-500 text-white'
									}`}
							>
								Next →
							</button>
						) : (
							<button
								type="button"
								onClick={() => {
									if (isPageComplete()) handleSubmitQuiz();
									else alert('Please answer all questions on this page before submitting.');
								}}
								disabled={!isPageComplete() || isSubmitting}
								className={`px-6 py-2 rounded-lg font-medium transition ${!isPageComplete() || isSubmitting
									? 'bg-purple-700 text-purple-300 cursor-not-allowed'
									: 'bg-purple-600 hover:bg-purple-500 text-white'
									}`}
							>
								{isSubmitting ? (
									<div className="flex items-center gap-2">
										<div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
										Submitting...
									</div>
								) : (
									'Submit Quiz'
								)}
							</button>
						)}
					</div>
				</form>
			</main>
		</div>
	);
}