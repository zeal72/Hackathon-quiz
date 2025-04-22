export default function QuestionCard({
	question,
	options,
	qIndex,
	selected,
	onSelect,
}) {
	return (
		<div className="bg-white/5 p-6 rounded-xl shadow-md backdrop-blur-md">
			<h2 className="text-xl font-semibold mb-4">{question}</h2>
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				{options.map((opt, i) => (
					<button
						key={i}
						onClick={() => onSelect(qIndex, opt)}
						className={`py-3 px-4 rounded-lg border ${selected === opt
								? 'bg-purple-600 border-purple-400 text-white'
								: 'bg-white/10 border-white/20 hover:bg-white/20'
							} transition-all`}
					>
						{opt}
					</button>
				))}
			</div>
		</div>
	);
}
