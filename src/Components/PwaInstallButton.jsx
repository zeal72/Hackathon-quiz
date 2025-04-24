// Components/PwaInstallButton.jsx
import React, { useEffect, useState } from 'react';

const PWAInstallButton = () => {
	const [deferredPrompt, setDeferredPrompt] = useState(null);
	const [isVisible, setIsVisible] = useState(false);
	useEffect(() => {
		const checkInstallability = () => {
			const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
			const hasTrigger = !!deferredPrompt;
			console.log('[PWA Debug] Standalone:', isStandalone);
			console.log('[PWA Debug] Install Prompt Available:', hasTrigger);
			setIsVisible(hasTrigger && !isStandalone);
		};

		const handler = (e) => {
			e.preventDefault();
			console.log('[PWA Debug] BeforeInstallPrompt triggered');
			setDeferredPrompt(e);
			checkInstallability();
		};

		window.addEventListener('beforeinstallprompt', handler);
		const mediaQuery = window.matchMedia('(display-mode: standalone)');
		mediaQuery.addEventListener('change', checkInstallability);

		return () => {
			window.removeEventListener('beforeinstallprompt', handler);
			mediaQuery.removeEventListener('change', checkInstallability);
		};
	}, []);
	useEffect(() => {
		const handler = (e) => {
			e.preventDefault();
			setDeferredPrompt(e);
			setIsVisible(true);
		};

		window.addEventListener('beforeinstallprompt', handler);

		// Check if already installed
		window.matchMedia('(display-mode: standalone)').addEventListener('change', ({ matches }) => {
			if (matches) setIsVisible(false);
		});

		return () => {
			window.removeEventListener('beforeinstallprompt', handler);
		};
	}, []);

	const handleInstallClick = async () => {
		if (!deferredPrompt) return;

		deferredPrompt.prompt();
		const { outcome } = await deferredPrompt.userChoice;

		if (outcome === 'accepted') {
			console.log('User accepted install');
			setIsVisible(false);
		}

		setDeferredPrompt(null);
	};

	if (!isVisible) return null;

	return (
		<div className="fixed bottom-4 right-4 z-50 animate-fade-in-up">
			<button
				onClick={handleInstallClick}
				className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 
                   text-white font-bold py-3 px-6 rounded-lg shadow-lg transform transition-all duration-200
                   hover:scale-105 hover:shadow-xl border-2 border-purple-300/50 relative group"
			>
				<span className="relative z-10 flex items-center gap-2">
					<svg className="w-5 h-5 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
					</svg>
					Install HackQuiz
				</span>
				<div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500/30 to-blue-400/30 
                        opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
			</button>
		</div>
	);
};

export default PWAInstallButton;