import { motion } from 'framer-motion';
import { FiUser, FiLock, FiMail, FiEye, FiEyeOff } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi2';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { ref, set } from 'firebase/database';
import { auth, db } from '../../Firebase.config';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import globalStyles from './Globalstyles';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function SignupPage() {
	const [email, setEmail] = useState('');
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);       // ← toggle state
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();

	const handleSignup = async () => {
		setLoading(true);
		setError('');
		try {
			// 1) Create user in Firebase Auth
			const userCred = await createUserWithEmailAndPassword(auth, email, password);
			const user = userCred.user;

			// 2) Set the display name so auth.currentUser.displayName is available
			await updateProfile(user, { displayName: username });

			// 3) Push user details to Realtime Database
			await set(ref(db, `users/${user.uid}`), {
				username,
				email,
				score: 0,          // initial score
			});

			toast.success('Account created successfully!');

			setTimeout(() => {
				toast.info('Redirecting to login...');
				navigate('/login');
			}, 2000);
		} catch (err) {
			console.error(err);
			setError(err.message);
			toast.error('Error: ' + err.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<style>{globalStyles}</style>
			<ToastContainer />

			<div className="min-h-screen bg-gradient-to-br from-[#2A0944] via-[#3B185F] to-[#125B50] flex items-center justify-center p-4 relative overflow-hidden">
				{/* Floating Blobs */}
				<div className="absolute inset-0">
					<div className="animate-float absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-purple-500/20 to-teal-400/20 rounded-full blur-2xl" />
					<div className="animate-float animation-delay-2000 absolute top-60 right-32 w-48 h-48 bg-gradient-to-r from-pink-400/20 to-blue-400/20 rounded-full blur-xl" />
				</div>

				{/* Card */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="relative bg-white rounded-2xl border border-gray-200 shadow-xl w-full max-w-lg p-8"
				>
					{/* Header */}
					<div className="text-center mb-8">
						<h1 className="text-4xl font-bold bg-gradient-to-r from-purple-500 to-teal-500 bg-clip-text text-transparent">
							HackQuiz
						</h1>
						<p className="text-gray-600 mt-2 text-sm">Join the developer challenge</p>
					</div>

					{/* Form */}
					<div className="space-y-6">
						{/* Username */}
						<div className="relative group">
							<label className="text-gray-500 group-focus-within:text-purple-800 transition-all pointer-events-none">
								Username
							</label>
							<input
								type="text"
								value={username}
								onChange={e => setUsername(e.target.value)}
								placeholder="Username"
								className="w-full bg-gray-50 border border-gray-300 rounded-xl py-4 px-6 pr-12 text-gray-800 placeholder-transparent focus:outline-none focus:border-purple-800 focus:ring-2 focus:ring-purple-300 transition-all"
							/>
							<FiUser className="absolute right-4 bottom-6 text-gray-400" />
						</div>

						{/* Email */}
						<div className="relative group">
							<label className="text-gray-500 group-focus-within:text-purple-800 transition-all pointer-events-none">
								Email
							</label>
							<input
								type="email"
								value={email}
								onChange={e => setEmail(e.target.value)}
								placeholder="Email"
								className="w-full bg-gray-50 border border-gray-300 rounded-xl py-4 px-6 pr-12 text-gray-800 placeholder-transparent focus:outline-none focus:border-purple-800 focus:ring-2 focus:ring-purple-300 transition-all"
							/>
							<FiMail className="absolute right-4 bottom-6 text-gray-400" />
						</div>

						{/* Password with Toggle */}
						<div className="relative group">
							<label className="text-gray-500 group-focus-within:text-purple-800 transition-all pointer-events-none">
								Password
							</label>
							<input
								type={showPassword ? 'text' : 'password'}       // ← switch type
								value={password}
								onChange={e => setPassword(e.target.value)}
								placeholder="Password"
								className="w-full bg-gray-50 border border-gray-300 rounded-xl py-4 px-6 pr-12 text-gray-800 placeholder-transparent focus:outline-none focus:border-purple-800 focus:ring-2 focus:ring-purple-300 transition-all"
							/>
							<div
								className="absolute right-4 bottom-6 text-gray-400 cursor-pointer"
								onClick={() => setShowPassword(vis => !vis)}    // ← toggle
							>
								{showPassword ? <FiEyeOff /> : <FiEye />}
							</div>
						</div>

						{/* Signup Button */}
						<motion.button
							onClick={handleSignup}
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							disabled={loading}
							className={`w-full bg-gradient-to-r from-purple-500 to-teal-400 text-white py-4 rounded-xl font-semibold shadow-md transition-all flex items-center justify-center ${loading ? 'opacity-60 cursor-not-allowed' : ''
								}`}
						>
							{loading
								? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
								: <>
									<HiSparkles className="absolute left-4 top-1/2 -translate-y-1/2 animate-pulse text-white text-xl" />
									Create Account
								</>
							}
						</motion.button>

						{/* Login Link */}
						<div className="text-center mt-4">
							<a href="/login" className="text-sm text-gray-600 hover:text-purple-500 transition-all font-medium">
								Already have an account? <span className="underline">Log in</span>
							</a>
						</div>

						{/* Error */}
						{error && <p className="text-red-500 text-center">{error}</p>}
					</div>

					{/* Mascot (optional) */}
					<motion.div
						className="hidden lg:block absolute right-20 xl:right-40"
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
					>
						{/* your SVG here */}
					</motion.div>
				</motion.div>
			</div>
		</>
	);
}
