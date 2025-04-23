// ResultsPage.js
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle } from 'lucide-react';
import { calculateResults, getPerformanceMessage } from '../utilis/utilities';

function QuestionResultCard({ question, options, userAnswer, correctAnswer, isCorrect }) {
	useEffect(() => {
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}, []);

	return (
		<div
			className={`bg-white/5 p-6 rounded-xl shadow-md backdrop-blur-md ${isCorrect ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500'
				}`}
		>
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
					let style = "py-3 px-4 rounded-lg border bg-white/10 border-white/20";
					if (i === correctAnswer) style = "py-3 px-4 rounded-lg border bg-green-600/80 border-green-400 text-white";
					if (i === userAnswer && !isCorrect) style = "py-3 px-4 rounded-lg border bg-red-600/80 border-red-400 text-white";

					return (
						<div key={i} className={style}>
							{opt}
						</div>
					);
				})}
			</div>
		</div>
	);
}

export default function ResultsPage() {
	const { state } = useLocation();
	const navigate = useNavigate();

	// Grab stored data
	const rawData = state
		|| JSON.parse(localStorage.getItem('latestQuizResult') || '{}');

	const {
		questions: rawQuestions = [],
		selectedOptions: rawSelected = {},
		username = 'User',
		timeTaken = 0,         // make sure your submit flow sets this
	} = rawData;

	// Normalize
	const questions = rawQuestions.map(q => ({
		...q,
		correctAnswer: Number(q.correctAnswer),
	}));
	const selectedOptions = Object.fromEntries(
		Object.entries(rawSelected).map(([k, v]) => [k, Number(v)])
	);

	// Now pass username & timeTaken into calculateResults!
	const { score, results } = calculateResults(
		questions,
		selectedOptions,
		username,
		timeTaken
	);

	const total = questions.length;
	const performanceMsg = getPerformanceMessage(score, total);

	return (
		<div className="min-h-screen bg-gradient-to-br from-[#1E1B4B] to-[#0F172A] text-white">
			<header className="bg-[#1E293B]/90 backdrop-blur-sm shadow-lg">
				<div className="container mx-auto px-4 py-6 text-center">
					<h1 className="text-3xl font-bold mb-2">
						Quiz Results, <span className="text-purple-300">{username}</span>
					</h1>
					<div className="text-4xl font-bold mb-4">
						Score: <span className="text-yellow-400">{score}</span>/{total}
					</div>
					<div className="w-full max-w-md bg-gray-800 rounded-full h-4 mb-2">
						<div
							className="bg-gradient-to-r from-green-500 to-yellow-500 h-4 rounded-full"
							style={{ width: `${(score / (total || 1)) * 100}%` }}
						/>
					</div>
					<p className="text-gray-300">{performanceMsg}</p>
				</div>
			</header>

			<main className="container mx-auto px-4 py-8">
				<div className="bg-[#1E293B] rounded-xl shadow-xl overflow-hidden">
					<div className="p-6 border-b border-gray-700">
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
							<div className="bg-green-900/30 p-4 rounded-lg">
								<div className="text-2xl font-bold text-green-400">{score}</div>
								<div className="text-gray-300">Correct</div>
							</div>
							<div className="bg-red-900/30 p-4 rounded-lg">
								<div className="text-2xl font-bold text-red-400">{total - score}</div>
								<div className="text-gray-300">Incorrect</div>
							</div>
							<div className="bg-blue-900/30 p-4 rounded-lg">
								<div className="text-2xl font-bold text-blue-400">
									{Math.round((score / (total || 1)) * 100)}%
								</div>
								<div className="text-gray-300">Percentage</div>
							</div>
							<div className="bg-purple-900/30 p-4 rounded-lg">
								<div className="text-2xl font-bold text-purple-400">{total}</div>
								<div className="text-gray-300">Total Questions</div>
							</div>
						</div>
					</div>

					<div className="p-6 space-y-6">
						{results.map((r, idx) => (
							<motion.div
								key={idx}
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: idx * 0.05 }}
							>
								<QuestionResultCard
									question={r.question}
									options={r.options}
									userAnswer={r.userAnswerIndex}     // if you want index
									correctAnswer={r.correctAnswerIndex} // or text, adjust as needed
									// or supply directly:
									// userAnswer={r.userAnswer}
									// correctAnswer={r.correctAnswer}
									isCorrect={r.isCorrect}
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
						onClick={() => navigate('/quizpage')}
						className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors"
					>
						Retry Quiz
					</button>
					<button
						onClick={() => navigate('/leaderboard')}
						className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors"
					>
						Leaderboard
					</button>
				</div>
			</main>
		</div>
	);
}
