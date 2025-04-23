// utilities.js
import { getDatabase, ref, push, set } from 'firebase/database';

export function calculateResults(questions = [], selectedOptions = {}, username, timeTaken) {
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

	// Save results to Firebase for leaderboard
	saveQuizResults({
		username,
		score,
		totalQuestions: questions.length,
		timeTaken,
		timestamp: new Date().toISOString()
	});

	return { score, results };
}

async function saveQuizResults(resultsData) {
	try {
		const db = getDatabase();
		const leaderboardRef = ref(db, 'leaderboard');
		const newEntryRef = push(leaderboardRef);

		await set(newEntryRef, {
			username: resultsData.username,
			score: resultsData.score,
			totalQuestions: resultsData.totalQuestions,
			accuracy: ((resultsData.score / resultsData.totalQuestions) * 100).toFixed(1),
			timeTaken: resultsData.timeTaken,
			timestamp: resultsData.timestamp
		});

		console.log('Leaderboard data saved successfully');
	} catch (error) {
		console.error('Error saving to leaderboard:', error);
		throw error;
	}
}

export function getPerformanceMessage(score, total) {
	const percentage = total > 0 ? (score / total) * 100 : 0;

	if (percentage >= 90) return 'Excellent work! You nailed it! 🎉';
	if (percentage >= 75) return 'Great job! You did really well! 👍';
	if (percentage >= 50) return 'Good effort! Keep practicing! 💪';
	if (percentage >= 25) return 'Keep trying! You can do better! ✨';
	return 'Don\'t give up! Review and try again! 📚';
}