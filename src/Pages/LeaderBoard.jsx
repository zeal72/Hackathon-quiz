import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaCrown, FaMedal, FaTrophy, FaUserAlt } from 'react-icons/fa';
import { getDatabase, ref as dbRef, onValue, off } from 'firebase/database';
import { db } from '../../Firebase.config';

function formatTime(seconds = 0) {
	const m = Math.floor(seconds / 60).toString().padStart(2, '0');
	const s = (seconds % 60).toString().padStart(2, '0');
	return `${m}:${s}`;
}

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
			const userMap = new Map();
			snapshot.forEach(child => {
				const val = child.val();
				const existing = userMap.get(val.username); // or val.uid if using unique user id
				const current = {
					id: child.key,
					username: val.username,
					score: Number(val.score),
					totalQuestions: Number(val.totalQuestions),
					accuracy: Number(val.accuracy),
					timeTaken: Number(val.timeTaken),
					timestamp: val.timestamp,
				};

				// Only keep the latest entry (based on timestamp)
				if (!existing || new Date(current.timestamp) > new Date(existing.timestamp)) {
					userMap.set(val.username, current);
				}
			});
			const entries = Array.from(userMap.values());

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
			case 1:
				return (
					<div className="relative flex items-center justify-center">
						<div className="absolute -inset-2 bg-gradient-to-r from-yellow-400 to-amber-600 rounded-full blur-md opacity-30 animate-pulse" />
						<FaTrophy className="w-10 h-10 md:w-12 md:h-12 text-amber-500 drop-shadow-gold" />
						<div className="absolute -bottom-1 md:bottom-0 inset-x-0 flex justify-center">
							<div className="h-1 w-6 bg-gradient-to-r from-yellow-400/50 to-amber-600/50 blur-sm" />
						</div>
					</div>
				);
			case 2:
				return (
					<div className="relative flex items-center justify-center">
						<FaMedal className="w-8 h-8 md:w-10 md:h-10 text-gray-300 drop-shadow-silver" />
						<div className="absolute -inset-1 bg-gradient-to-br from-gray-400 to-gray-700 rounded-full blur opacity-20" />
						<div className="absolute -bottom-1 inset-x-0 h-px bg-gray-400/50 blur-sm" />
					</div>
				);
			case 3:
				return (
					<div className="relative flex items-center justify-center">
						<FaMedal className="w-8 h-8 md:w-10 md:h-10 text-amber-600 drop-shadow-bronze" />
						<div className="absolute -inset-1 bg-gradient-to-br from-amber-500 to-amber-800 rounded-full blur opacity-20" />
						<div className="absolute -bottom-1 inset-x-0 h-px bg-amber-600/50 blur-sm" />
					</div>
				);
			default:
				return (
					<div className="relative flex items-center justify-center group">
						<div className="absolute -inset-2 bg-gradient-to-br from-purple-400/20 to-blue-400/20 rounded-full blur opacity-0 group-hover:opacity-40 transition-opacity" />
						<span className="text-xl md:text-2xl font-bold bg-gradient-to-br from-purple-400 to-blue-400 bg-clip-text text-transparent">
							#{rank}
						</span>
						<div className="absolute -bottom-1 inset-x-0 h-px bg-gradient-to-r from-purple-400/30 to-blue-400/30 blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
					</div>
				);
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#0F0A31] to-[#1A1440]">
				<div className="flex flex-col items-center space-y-4">
					<div className="relative">
						<div className="w-16 h-16 border-4 border-purple-500/30 rounded-full" />
						<div className="absolute top-0 left-0 w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
					</div>
					<p className="text-transparent bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text font-medium">
						Loading Champions...
					</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="fixed top-4 inset-x-0 mx-auto max-w-lg px-4 z-50 animate-fade-in-down">
				<div className="flex items-center justify-between bg-red-500/20 backdrop-blur-lg border border-red-400/30 text-white rounded-xl shadow-2xl py-3 px-5">
					<div className="flex items-center space-x-3">
						<div className="bg-red-500/20 p-2 rounded-lg">
							<svg
								className="w-6 h-6 text-red-300"
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
						</div>
						<span className="font-medium">{error}</span>
					</div>
					<button
						onClick={() => setError('')}
						className="p-1 hover:bg-red-500/20 rounded-lg transition-colors"
						aria-label="Dismiss"
					>
						<svg className="w-5 h-5 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-[#0F0A31] to-[#1A1440] text-slate-300">
			<header className="sticky top-0 z-50 bg-[#0F0A31]/90 backdrop-blur-xl shadow-2xl border-b border-purple-500/20">
				<div className="container mx-auto px-4 py-6 text-center">
					<motion.h1
						initial={{ opacity: 0, y: -20 }}
						animate={{ opacity: 1, y: 0 }}
						className="text-4xl font-bold mb-2 flex items-center justify-center space-x-3"
					>
						<motion.h1
							initial={{ opacity: 0, y: -10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, ease: 'easeOut' }}
							className="flex items-center text-2xl font-bold"
						>
							<svg
								stroke="currentColor"
								fill="currentColor"
								strokeWidth="0"
								viewBox="0 0 640 512"
								className="mr-3 text-yellow-400 w-6 h-6"
								xmlns="http://www.w3.org/2000/svg"
								aria-hidden="true"
								focusable="false"
							>
								<path d="M528 448H112c-8.8 0-16 7.2-16 16v16c0 17.7 14.3 32 32 32h384c17.7 
             0 32-14.3 32-32v-16c0-8.8-7.2-16-16-16zm95.7-326.3-56.6-56.6c-9.4-9.4-24.6-9.4-33.9 
             0l-96.2 96.2-96.2-96.2c-9.4-9.4-24.6-9.4-33.9 
             0l-96.2 96.2-96.2-96.2c-9.4-9.4-24.6-9.4-33.9 
             0l-56.6 56.6c-9.4 9.4-9.4 24.6 0 33.9l96.2 96.2-96.2 
             96.2c-9.4 9.4-9.4 24.6 0 33.9l56.6 56.6c9.4 9.4 
             24.6 9.4 33.9 0l96.2-96.2 96.2 96.2c9.4 9.4 24.6 
             9.4 33.9 0l96.2-96.2 96.2 96.2c9.4 9.4 24.6 9.4 
             33.9 0l56.6-56.6c9.4-9.4 9.4-24.6 0-33.9L527.5 
             251.8l96.2-96.2c9.4-9.4 9.4-24.6 0-33.9z"/>
							</svg>
							<span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
								Leaderboard
							</span>
						</motion.h1>

					</motion.h1>
					<p className="text-sm text-purple-300/80">Where Legends Compete</p>
				</div>
			</header>

			<main className="container mx-auto px-4 py-8">
				<div className="bg-gradient-to-br from-[#1A1440]/60 to-[#0F0A31]/60 backdrop-blur-3xl rounded-2xl shadow-2xl border border-purple-500/20 overflow-hidden">
					{/* Table Header */}
					<div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-[#0F0A31]/50 border-b border-purple-500/20">
						<div className="col-span-1 text-center text-purple-300/80 text-sm font-semibold">Rank</div>
						<div className="col-span-6 text-purple-300/80 text-sm font-semibold">Player</div>
						<div className="col-span-2 text-center text-purple-300/80 text-sm font-semibold">Score</div>
						<div className="col-span-1 text-center text-purple-300/80 text-sm font-semibold">Accuracy</div>
						<div className="col-span-1 text-center text-purple-300/80 text-sm font-semibold">Time</div>
						<div className="col-span-1 text-center text-purple-300/80 text-sm font-semibold">Date</div>
					</div>

					{/* Leaderboard Items */}
					{data.map((user, i) => (
						<motion.div
							key={user.id}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: i * 0.05 }}
							className="group relative hover:bg-[#1A1440]/40 transition-colors border-b border-purple-500/10 last:border-0"
						>
							<div className="grid grid-cols-12 gap-4 items-center px-6 py-5">
								{/* Rank */}
								<div className="col-span-2 md:col-span-1 flex justify-center">
									{getRankBadge(i + 1)}
								</div>

								{/* Player */}
								<div className="col-span-8 md:col-span-6 flex items-center space-x-4">
									<div className="relative">
										<div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/30 to-blue-500/30 flex items-center justify-center backdrop-blur-sm">
											<FaUserAlt className="w-5 h-5 text-purple-300/80" />
										</div>
										<div className="absolute inset-0 bg-purple-500/20 rounded-xl blur-md opacity-30" />
									</div>
									<div>
										<h3 className="font-medium text-lg text-transparent bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text">
											{user.username}
										</h3>
										<div className="md:hidden text-sm text-purple-300/60 mt-1">
											{user.accuracy}% • {formatTime(user.timeTaken)}
										</div>
									</div>
								</div>

								{/* Score */}
								<div className="hidden md:flex col-span-2 justify-center">
									<span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent font-semibold">
										{user.score}
									</span>
								</div>

								{/* Accuracy */}
								<div className="hidden md:flex col-span-1 justify-center text-purple-300">
									{user.accuracy}%
								</div>

								{/* Time */}
								<div className="hidden md:flex col-span-1 justify-center text-blue-300">
									{formatTime(user.timeTaken)}
								</div>

								{/* Date */}
								<div className="hidden md:flex col-span-1 justify-center text-sm text-purple-300/60">
									{formatDate(user.timestamp)}
								</div>
							</div>
						</motion.div>
					))}
				</div>

				{/* Action Buttons */}
				<div className="flex justify-center gap-4 mt-8">
					<motion.button
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						onClick={() => navigate('/quizpage')}
						className="px-8 py-3.5 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl font-medium transition-all 
                     shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 flex items-center space-x-2"
					>
						<span>Back to Home</span>
					</motion.button>
					<motion.button
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						onClick={() => window.scrollTo(0, 0)}
						className="px-8 py-3.5 bg-gradient-to-r from-slate-700 to-slate-800 rounded-xl font-medium transition-all 
                     shadow-lg shadow-purple-500/10 hover:shadow-purple-500/20 border border-purple-500/20 flex items-center space-x-2"
					>
						<span>Scroll to Top</span>
					</motion.button>
				</div>
			</main>
		</div>
	);
}