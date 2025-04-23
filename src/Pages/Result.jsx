// ResultsPage.js
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle } from 'lucide-react';
import { calculateResults, getPerformanceMessage } from '../utilis/utilities';

function QuestionResultCard({ question, options, selectedOption, correctOption }) {
	const isCorrect = Number(selectedOption) === Number(correctOption);

	useEffect(() => {
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}, [currentPage]);

	return (
		<div className={`bg-white/5 p-6 rounded-xl shadow-md backdrop-blur-md ${isCorrect ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500'
			}`}>
			<div className="flex items-start gap-4 mb-4">
				<div className="pt-1">
					{isCorrect ? (
						<CheckCircle2 className="text-green-500 w-6 h-6" />
					) : (
						<XCircle className="text-red-500 w-6 h-6" />
					)}
				</div>
				<h2 className="text-xl font-semibold">{question}</h2>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				{options.map((opt, i) => {
					let buttonStyle = "py-3 px-4 rounded-lg border bg-white/10 border-white/20";
					if (i === correctOption) buttonStyle = "py-3 px-4 rounded-lg border bg-green-600/80 border-green-400 text-white";
					if (i === selectedOption && !isCorrect) buttonStyle = "py-3 px-4 rounded-lg border bg-red-600/80 border-red-400 text-white";

					return (
						<div
							key={i}
							className={buttonStyle}
							role="option"
							aria-selected={i === selectedOption}
						>
							{opt}
						</div>
					);
				})}
			</div>
		</div>
	);
}

export default function ResultsPage() {
	const location = useLocation();
	const navigate = useNavigate();
	const { state } = location;

	// Normalize data from state or localStorage
	const rawData = state || JSON.parse(localStorage.getItem('latestQuizResult')) || {};

	// Convert data types
	const normalizedQuestions = (rawData.questions || []).map(q => ({
		...q,
		correctAnswer: Number(q.correctAnswer)
	}));

	const normalizedSelectedOptions = Object.entries(rawData.selectedOptions || {})
		.reduce((acc, [key, value]) => ({
			...acc,
			[String(key)]: Number(value)
		}), {});

	// Calculate results
	const { score } = calculateResults(normalizedQuestions, normalizedSelectedOptions);
	const totalQuestions = normalizedQuestions.length || 0;
	const calculatedScore = score || 0;

	return (
		<div className="min-h-screen bg-gradient-to-br from-[#1E1B4B] to-[#0F172A] text-white">
			<header className="bg-[#1E293B]/90 backdrop-blur-sm shadow-lg">
				<div className="container mx-auto px-4 py-6">
					<div className="flex flex-col items-center text-center">
						<h1 className="text-3xl font-bold mb-2">
							Quiz Results, <span className="text-purple-300">{rawData.username || 'User'}</span>
						</h1>
						<div className="text-4xl font-bold mb-4">
							Score: <span className="text-yellow-400">{calculatedScore}</span>/{totalQuestions}
						</div>
						<div className="w-full max-w-md bg-gray-800 rounded-full h-4 mb-2">
							<div
								className="bg-gradient-to-r from-green-500 to-yellow-500 h-4 rounded-full"
								style={{ width: `${(calculatedScore / (totalQuestions || 1)) * 100}%` }}
							/>
						</div>
						<p className="text-gray-300">
							{getPerformanceMessage(calculatedScore, totalQuestions)}
						</p>
					</div>
				</div>
			</header>

			<main className="container mx-auto px-4 py-8">
				<div className="bg-[#1E293B] rounded-xl shadow-xl overflow-hidden">
					<div className="p-6 border-b border-gray-700">
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
							<div className="bg-green-900/30 p-4 rounded-lg">
								<div className="text-2xl font-bold text-green-400">{calculatedScore}</div>
								<div className="text-gray-300">Correct</div>
							</div>
							<div className="bg-red-900/30 p-4 rounded-lg">
								<div className="text-2xl font-bold text-red-400">
									{totalQuestions - calculatedScore}
								</div>
								<div className="text-gray-300">Incorrect</div>
							</div>
							<div className="bg-blue-900/30 p-4 rounded-lg">
								<div className="text-2xl font-bold text-blue-400">
									{Math.round((calculatedScore / (totalQuestions || 1)) * 100)}%
								</div>
								<div className="text-gray-300">Percentage</div>
							</div>
							<div className="bg-purple-900/30 p-4 rounded-lg">
								<div className="text-2xl font-bold text-purple-400">
									{totalQuestions}
								</div>
								<div className="text-gray-300">Total Questions</div>
							</div>
						</div>
					</div>

					<div className="p-6 space-y-6">
						{normalizedQuestions.map((question, index) => (
							<motion.div
								key={index}
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.3, delay: index * 0.05 }}
							>
								<QuestionResultCard
									question={question.question}
									options={question.options}
									selectedOption={normalizedSelectedOptions[index]}
									correctOption={question.correctAnswer}
								/>
							</motion.div>
						))}
					</div>
				</div>

				<div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
					<button
						onClick={() => navigate('/')}
						className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors"
					>
						Back to Home
					</button>
					<button
						onClick={() => navigate('/quizpage', { state: { username: rawData.username } })}
						className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors"
					>
						Retry Quiz
					</button>
				</div>
			</main>
		</div>
	);
}