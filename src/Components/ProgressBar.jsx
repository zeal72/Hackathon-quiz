// ProgressBar.jsx
export default function ProgressBar({ progress }) {
	return (
		<div className="w-full bg-gray-700 rounded-full h-4">
			<div
				className="bg-purple-500 h-4 rounded-full transition-all duration-300"
				style={{ width: `${progress}%` }}
			/>
		</div>
	);
}