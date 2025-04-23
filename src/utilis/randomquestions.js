export const getRandomQuestions = (allQuestions, questionsPerPage = 10, totalPages = 2) => {
	// Create a deep copy of the questions array to avoid mutations
	const shuffled = JSON.parse(JSON.stringify(allQuestions)).sort(() => 0.5 - Math.random());

	// Select enough questions for all pages
	const totalQuestionsNeeded = questionsPerPage * totalPages;
	const selected = shuffled.slice(0, totalQuestionsNeeded);

	// Make sure we have enough questions
	if (selected.length < totalQuestionsNeeded) {
		console.warn(`Warning: Not enough questions available. Needed ${totalQuestionsNeeded}, got ${selected.length}`);
	}

	// Distribute questions to pages
	const pages = [];
	for (let i = 0; i < totalPages; i++) {
		const startIndex = i * questionsPerPage;
		pages.push(selected.slice(startIndex, startIndex + questionsPerPage));
	}

	return {
		allSelectedQuestions: selected,
		questionsByPage: pages
	};
};