import React, { useEffect, useState } from "react";

export default function PWAInstallButton() {
	const [deferredPrompt, setDeferredPrompt] = useState(null);
	const [showInstall, setShowInstall] = useState(false);

	useEffect(() => {
		const handleBeforeInstallPrompt = (e) => {
			e.preventDefault(); // Prevent the automatic prompt
			setDeferredPrompt(e);
			setShowInstall(true);
		};

		window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

		return () => {
			window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
		};
	}, []);

	const handleInstallClick = () => {
		if (!deferredPrompt) return;
		deferredPrompt.prompt();

		deferredPrompt.userChoice.then((choiceResult) => {
			if (choiceResult.outcome === "accepted") {
				console.log("User accepted the install prompt");
			} else {
				console.log("User dismissed the install prompt");
			}
			setDeferredPrompt(null);
			setShowInstall(false);
		});
	};

	if (!showInstall) return null;

	return (
		<button
			onClick={handleInstallClick}
			className="fixed bottom-5 right-5 px-4 py-2 bg-purple-600 text-white rounded-lg shadow-lg hover:bg-purple-700 transition duration-300 z-50"
		>
			Install App
		</button>
	);
}
