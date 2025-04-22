// utils/getRandomQuestions.js
export const getRandomQuestions = (allQuestions) => {
	const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
	const selected = shuffled.slice(0, 20);
	const page1 = selected.slice(0, 10);
	const page2 = selected.slice(10, 20);

	return { page1, page2 };
};
