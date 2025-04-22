import { motion } from 'framer-motion';
import { FiLock, FiMail } from 'react-icons/fi';
import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../Firebase.config';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import globalStyles from './Globalstyles';

export default function LoginPage() {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();

	const handleLogin = async (e) => {
		e.preventDefault();
		if (!email || !password) {
			toast.warning('Please fill in both fields');
			return;
		}

		setLoading(true);
		setError('');
		try {
			await signInWithEmailAndPassword(auth, email, password);
			toast.success('Login successful!');
			setTimeout(() => {
				toast.info('Redirecting...');
				navigate('/quizpage');
			}, 2000);
		} catch (err) {
			const message = err.message.includes('auth/user-not-found')
				? 'User not found. Please sign up.'
				: err.message.includes('auth/wrong-password')
					? 'Incorrect password.'
					: 'Login failed. Please check your credentials!';
			setError(message);
			toast.error(message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<style>{globalStyles}</style>

			<div className="min-h-screen bg-gradient-to-br from-[#2A0944] via-[#3B185F] to-[#125B50] relative overflow-hidden flex items-center justify-center p-4">
				{/* Floating Blobs */}
				<div className="absolute w-full h-full inset-0">
					<div className="animate-float absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-purple-500/20 to-teal-400/20 rounded-full blur-2xl" />
					<div className="animate-float animation-delay-2000 absolute top-60 right-32 w-48 h-48 bg-gradient-to-r from-pink-400/20 to-blue-400/20 rounded-full blur-xl" />
				</div>

				{/* Login Card */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="bg-white rounded-2xl border border-gray-200 shadow-xl w-full max-w-lg py-8 px-4 md:py-8 md:px-8 relative"
				>
					{/* Navigation Button */}
					<button
						onClick={() => navigate('/signup')}
						className="absolute top-4 left-4 text-gray-500 hover:text-purple-600 transition-all text-sm font-medium flex items-center space-x-1"
					>
						<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
						</svg>
						<span>Sign up instead?</span>
					</button>

					{/* Header */}
					<div className="text-center mb-8">
						<h1 className="text-4xl font-bold bg-gradient-to-r from-purple-500 to-teal-500 bg-clip-text text-transparent font-[Poppins]">
							HackQuiz
						</h1>
						<p className="text-gray-600 mt-2 text-sm">Welcome back!</p>
					</div>

					{/* Form */}
					<form onSubmit={handleLogin}>
						{/* Email Input */}
						<div className="relative group mb-6">
							<label htmlFor="email" className="text-gray-500 transition-all pointer-events-none group-focus-within:text-sm group-focus-within:text-purple-800">
								Email
							</label>
							<input
								id="email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="w-full bg-gray-50 border border-gray-300 rounded-xl py-4 px-6 pr-12 text-gray-800 placeholder-transparent focus:outline-none focus:border-purple-800 focus:ring-2 focus:ring-purple-300 transition-all"
								placeholder="Email"
							/>
							<div className="absolute right-4 bottom-5 text-gray-400">
								<FiMail />
							</div>
						</div>

						{/* Password Input */}
						<div className="relative group mb-6">
							<label htmlFor="password" className="text-gray-500 transition-all pointer-events-none group-focus-within:text-sm group-focus-within:text-purple-800">
								Password
							</label>
							<input
								id="password"
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="w-full bg-gray-50 border border-gray-300 rounded-xl py-4 px-6 pr-12 text-gray-800 placeholder-transparent focus:outline-none focus:border-purple-800 focus:ring-2 focus:ring-purple-300 transition-all"
								placeholder="Password"
							/>
							<div className="absolute right-4 bottom-5 text-gray-400">
								<FiLock />
							</div>
						</div>

						{/* Login Button */}
						<motion.button
							type="submit"
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							disabled={loading}
							className="w-full bg-gradient-to-r from-purple-500 to-teal-400 text-white py-4 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all relative"
						>
							{loading ? (
								<div className="flex items-center justify-center space-x-2">
									<div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
									<span>Logging in...</span>
								</div>
							) : (
								'Login'
							)}
						</motion.button>

						{/* Error Message */}
						{error && <p className="text-red-500 text-center mt-4">{error}</p>}
					</form>
				</motion.div>

				{/* Mascot */}
				<motion.div
					className="hidden lg:block absolute right-20 xl:right-40"
					initial={{ opacity: 0, x: 20 }}
					animate={{ opacity: 1, x: 0 }}
				>
					<svg className="w-64 h-64" viewBox="0 0 200 200">
						{/* Add mascot SVG here */}
					</svg>
				</motion.div>
			</div>

			{/* Toast Container */}
			<ToastContainer />
		</>
	);
}
