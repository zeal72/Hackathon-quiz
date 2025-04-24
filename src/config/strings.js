// strings.js
export const appText = {
	en: {
		loading: {
			message: "Preparing Your Experience",
			subtext: "Initializing quantum learning matrix...",
		},
		auth: {
			redirectNotice: "You're being redirected...",
		},
		routes: {
			home: "Home",
			signup: "Create Account",
			login: "Sign In",
			quiz: "Knowledge Challenge",
			results: "Performance Analysis",
			leaderboard: "Global Rankings",
		},
		errors: {
			404: "Reality Not Found",
		},
	},
	// Add other languages as needed
};

export const getText = (lang = "en") => appText[lang];