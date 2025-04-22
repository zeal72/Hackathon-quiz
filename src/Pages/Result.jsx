import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle } from 'lucide-react';

// QuestionResultCard component for displaying answers on the results page
function QuestionResultCard({ question, options, selectedOption, correctOption }) {
	const isCorrect = selectedOption === correctOption;

	return (
		<div className={`bg-white/5 p-6 rounded-xl shadow-md backdrop-blur-md ${isCorrect ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500'}`}>
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
					// Default styling for unselected options
					let buttonStyle = "py-3 px-4 rounded-lg border bg-white/10 border-white/20";

					// If this is the correct option, mark it green
					if (i === correctOption) {
						buttonStyle = "py-3 px-4 rounded-lg border bg-green-600 border-green-400 text-white";
					}

					// If this is the option the user selected and it was wrong, mark it red
					if (i === selectedOption && !isCorrect) {
						buttonStyle = "py-3 px-4 rounded-lg border bg-red-600 border-red-400 text-white";
					}

					return (
						<button
							key={i}
							className={buttonStyle}
							disabled={true}
						>
							{opt}
						</button>
					);
				})}
			</div>
		</div>
	);
}

export default function ResultsPage() {
	const location = useLocation();
	const navigate = useNavigate();
	const { username, score, selectedOptions, questions: allQuestions = [] } = location.state || {};

	// For debugging
	console.log('Selected Options:', selectedOptions);
	console.log('All Questions:', allQuestions);

	// Calculate results if not passed in state (fallback from localStorage)
	const { score: calculatedScore, results } = calculateResults(allQuestions, selectedOptions || {});
	const finalScore = score || calculatedScore || 0;

	return (
		<div className="min-h-screen bg-gradient-to-br from-[#1E1B4B] to-[#0F172A] text-white">
			{/* Header */}
			<header className="bg-[#1E293B]/90 backdrop-blur-sm shadow-lg">
				<div className="container mx-auto px-4 py-6">
					<div className="flex flex-col items-center text-center">
						<h1 className="text-3xl font-bold mb-2">
							Quiz Results, <span className="text-purple-300">{username || 'User'}</span>
						</h1>
						<div className="text-4xl font-bold mb-4">
							Score: <span className="text-yellow-400">{finalScore}</span>/{allQuestions.length || 0}
						</div>
						<div className="w-full max-w-md bg-gray-800 rounded-full h-4 mb-2">
							<div
								className="bg-gradient-to-r from-green-500 to-yellow-500 h-4 rounded-full"
								style={{ width: `${(finalScore / (allQuestions.length || 1)) * 100}%` }}
							></div>
						</div>
						<p className="text-gray-300">
							{getPerformanceMessage(finalScore, allQuestions.length || 0)}
						</p>
					</div>
				</div>
			</header>

			{/* Results Section */}
			<main className="container mx-auto px-4 py-8">
				<div className="bg-[#1E293B] rounded-xl shadow-xl overflow-hidden">
					{/* Results Summary */}
					<div className="p-6 border-b border-gray-700">
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
							<div className="bg-green-900/30 p-4 rounded-lg">
								<div className="text-2xl font-bold text-green-400">{finalScore}</div>
								<div className="text-gray-300">Correct</div>
							</div>
							<div className="bg-red-900/30 p-4 rounded-lg">
								<div className="text-2xl font-bold text-red-400">
									{(allQuestions.length || 0) - finalScore}
								</div>
								<div className="text-gray-300">Incorrect</div>
							</div>
							<div className="bg-blue-900/30 p-4 rounded-lg">
								<div className="text-2xl font-bold text-blue-400">
									{Math.round((finalScore / (allQuestions.length || 1)) * 100)}%
								</div>
								<div className="text-gray-300">Percentage</div>
							</div>
							<div className="bg-purple-900/30 p-4 rounded-lg">
								<div className="text-2xl font-bold text-purple-400">
									{allQuestions.length || 0}
								</div>
								<div className="text-gray-300">Total Questions</div>
							</div>
						</div>
					</div>

					{/* Detailed Results using QuestionResultCard */}
					<div className="p-6 space-y-6">
						{allQuestions.map((question, index) => {
							// Convert selectedOptions to numbers if they're strings
							const userSelectedOption = typeof selectedOptions[index] === 'string'
								? parseInt(selectedOptions[index], 10)
								: selectedOptions[index];

							return (
								<motion.div
									key={index}
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.3, delay: index * 0.05 }}
								>
									<QuestionResultCard
										question={question.question}
										options={question.options}
										selectedOption={userSelectedOption}
										correctOption={question.correctAnswer}
									/>
								</motion.div>
							);
						})}
					</div>
				</div>

				{/* Action Buttons */}
				<div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
					<button
						onClick={() => navigate('/quizpage')}
						className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors"
					>
						Back to Home
					</button>
					<button
						onClick={() => navigate('/quizpage', { state: { username } })}
						className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors"
					>
						Retry Quiz
					</button>
				</div>
			</main>
		</div>
	);
}

// Helper functions
function calculateResults(questions = [], selectedOptions = {}) {
	let score = 0;
	const results = questions.map((question, index) => {
		const userAnswerIndex = selectedOptions[index];
		const isCorrect = userAnswerIndex === question.correctAnswer;

		if (isCorrect) score++;

		return {
			question: question.question,
			options: question.options,
			userAnswer: question.options[userAnswerIndex] || 'Not answered',
			correctAnswer: question.options[question.correctAnswer],
			isCorrect
		};
	});

	return { score, results };
}

function getPerformanceMessage(score, total) {
	const percentage = (score / total) * 100;

	if (percentage >= 90) return 'Excellent work! You nailed it! 🎉';
	if (percentage >= 75) return 'Great job! You did really well! 👍';
	if (percentage >= 50) return 'Good effort! Keep practicing! 💪';
	if (percentage >= 25) return 'Keep trying! You can do better! ✨';
	return 'Don\'t give up! Review and try again! 📚';
}