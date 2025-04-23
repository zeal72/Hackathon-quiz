import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaCrown, FaMedal, FaTrophy, FaUserAlt } from 'react-icons/fa';
import { getDatabase, ref as dbRef, onValue, off } from 'firebase/database';
import { db } from '../../Firebase.config';  // adjust path to your config

// helper: format seconds → "mm:ss"
function formatTime(seconds = 0) {
	const m = Math.floor(seconds / 60).toString().padStart(2, '0');
	const s = (seconds % 60).toString().padStart(2, '0');
	return `${m}:${s}`;
}
// helper: format ISO → "Apr 21, 2025"
function formatDate(iso = '') {
	const d = new Date(iso);
	return d.toLocaleDateString(undefined, {
		month: 'short', day: 'numeric', year: 'numeric'
	});
}

export default function Leaderboard() {
	const navigate = useNavigate();
	const [data, setData] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	useEffect(() => {
		const db = getDatabase();
		const leaderboardRef = dbRef(db, 'leaderboard');

		const handleValue = (snapshot) => {
			const entries = [];
			snapshot.forEach(child => {
				const val = child.val();
				entries.push({
					id: child.key,
					username: val.username,
					score: Number(val.score),
					totalQuestions: Number(val.totalQuestions),
					accuracy: Number(val.accuracy),
					timeTaken: Number(val.timeTaken),
					timestamp: val.timestamp,
				});
			});
			// sort: score ↓, accuracy ↓, timeTaken ↑ (fastest)
			entries.sort((a, b) => {
				if (b.score !== a.score) return b.score - a.score;
				if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
				return a.timeTaken - b.timeTaken;
			});
			setData(entries);
			setLoading(false);
		};

		onValue(leaderboardRef, handleValue, (err) => {
			console.error(err);
			setError('Failed to load leaderboard.');
			setLoading(false);
		});

		return () => off(leaderboardRef, 'value', handleValue);
	}, []);

	const getRankBadge = (rank) => {
		switch (rank) {
			case 1: return <FaTrophy className="w-8 h-8 text-yellow-400 mr-4" />;
			case 2: return <FaMedal className="w-8 h-8 text-gray-300 mr-4" />;
			case 3: return <FaMedal className="w-8 h-8 text-amber-600 mr-4" />;
			default:
				return <span className="text-xl font-bold text-gray-400 mr-4 w-8">#{rank}</span>;
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen text-white">
				<div className="animate-spin h-10 w-10 border-4 border-purple-500 border-t-transparent rounded-full"></div>
			</div>
		);
	} if (error) {
		return (
			<div className="fixed top-4 inset-x-0 mx-auto max-w-lg px-4">
				<div className="flex items-center justify-between bg-red-700/80 backdrop-blur-sm text-white rounded-xl shadow-lg py-3 px-5">
					<div className="flex items-center space-x-2">
						<svg
							className="w-6 h-6 text-red-200 flex-shrink-0"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M12 9v2m0 4h.01M5.07 12a7 7 0 0113.86 0 7 7 0 01-13.86 0z"
							/>
						</svg>
						<span className="font-medium">{error}</span>
					</div>
					<button
						onClick={() => setError('')}
						className="text-red-200 hover:text-white transition-colors"
						aria-label="Dismiss"
					>
						✕
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-[#1E1B4B] to-[#0F172A] text-white">
			<header className="sticky top-0 z-50 bg-[#1E293B]/90 backdrop-blur-sm shadow-lg">
				<div className="container mx-auto px-4 py-6 text-center">
					<h1 className="text-3xl font-bold mb-1 flex items-center justify-center">
						<FaCrown className="mr-3 text-yellow-400" /> Leaderboard
					</h1>
					<p className="text-gray-300">Top performers of the week</p>
				</div>
			</header>

			<main className="container mx-auto px-4 py-8">
				<div className="bg-[#1E293B]/90 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden">
					{/* Table Header */}
					<div className="hidden md:grid grid-cols-12 gap-4 mb-4 px-4 py-3 bg-[#0F172A] rounded-lg text-gray-400">
						<div className="col-span-1 text-center">Rank</div>
						<div className="col-span-6">Player</div>
						<div className="col-span-2 text-center">Score</div>
						<div className="col-span-1 text-center">Acc%</div>
						<div className="col-span-1 text-center">Time</div>
						<div className="col-span-1 text-center">Date</div>
					</div>

					{/* Leaderboard Items */}
					{data.map((user, i) => (
						<motion.div
							key={user.id}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: i * 0.05 }}
							className="group hover:bg-[#2E3B4E] transition-colors mb-2 last:mb-0"
						>
							<div className="grid grid-cols-12 gap-4 items-center px-4 py-5 rounded-lg">
								{/* Rank */}
								<div className="col-span-2 md:col-span-1 flex justify-center">
									{getRankBadge(i + 1)}
								</div>

								{/* Player */}
								<div className="col-span-8 md:col-span-6 flex items-center">
									<div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center mr-4">
										<FaUserAlt className="w-5 h-5" />
									</div>
									<div>
										<h3 className="font-semibold">{user.username}</h3>
										<div className="md:hidden text-sm text-gray-400">
											{user.score} pts | {formatTime(user.timeTaken)}
										</div>
									</div>
								</div>

								{/* Score */}
								<div className="hidden md:flex col-span-2 justify-center">
									{user.score}
								</div>
								{/* Accuracy */}
								<div className="hidden md:flex col-span-1 justify-center">
									{user.accuracy}%
								</div>
								{/* Time */}
								<div className="hidden md:flex col-span-1 justify-center text-purple-300">
									{formatTime(user.timeTaken)}
								</div>
								{/* Date */}
								<div className="hidden md:flex col-span-1 justify-center text-gray-400 text-sm">
									{formatDate(user.timestamp)}
								</div>
							</div>
						</motion.div>
					))}
				</div>

				{/* Action Buttons */}
				<div className="flex justify-center gap-4 mt-8">
					<button
						onClick={() => navigate('/quizpage')}
						className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors"
					>
						Back to Home
					</button>
					<button
						onClick={() => window.scrollTo(0, 0)}
						className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors"
					>
						Scroll to Top
					</button>
				</div>
			</main>
		</div>
	);
}
