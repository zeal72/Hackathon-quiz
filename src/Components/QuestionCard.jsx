// QuestionCard.js
import React from 'react';

function QuestionCard({ question, options, qIndex, selected, onSelect, disabled }) {
	const handleClick = (optionIndex) => {
		if (!disabled) {
			onSelect(qIndex, optionIndex);
		}
	};

	return (
		<div className="bg-white/5 p-6 rounded-xl shadow-md backdrop-blur-md">
			<h2 className="text-xl font-semibold mb-4">{question}</h2>
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				{options.map((opt, i) => {
					const isSelected = i === selected;
					return (
						<button
							type="button"
							key={i}
							onClick={() => handleClick(i)}
							disabled={disabled}
							className={`py-3 px-4 rounded-lg border transition-colors text-left ${disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-purple-700/20'
								} ${isSelected
									? 'bg-purple-600/80 border-purple-400 text-white'
									: 'bg-white/10 border-white/20'
								}`}
							aria-label={`Option ${i + 1}`}
						>
							{opt}
						</button>
					);
				})}
			</div>
		</div>
	);
}

export default QuestionCard;