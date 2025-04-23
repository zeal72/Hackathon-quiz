// utilities.js
export function calculateResults(questions = [], selectedOptions = {}) {
	let score = 0;
	const results = questions.map((question, index) => {
		const userAnswerIndex = Number(selectedOptions[String(index)]);
		const correctAnswer = Number(question.correctAnswer);
		const isCorrect = userAnswerIndex === correctAnswer;
		if (isCorrect) score++;
		return {
			question: question.question,
			options: question.options,
			userAnswer: question.options[userAnswerIndex] || 'Not answered',
			correctAnswer: question.options[correctAnswer],
			isCorrect,
		};
	});
	return { score, results };
}

export function getPerformanceMessage(score, total) {
	const percentage = total > 0 ? (score / total) * 100 : 0;

	if (percentage >= 90) return 'Excellent work! You nailed it! 🎉';
	if (percentage >= 75) return 'Great job! You did really well! 👍';
	if (percentage >= 50) return 'Good effort! Keep practicing! 💪';
	if (percentage >= 25) return 'Keep trying! You can do better! ✨';
	return 'Don\'t give up! Review and try again! 📚';
}