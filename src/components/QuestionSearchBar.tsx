import React from "react";

interface Props {
	onSearch: (text: string) => void;
}

export default function QuestionSearchBar({ onSearch }: Props) {
	return (
		<div className="mb-8">
			<input
				type="text"
				onChange={(e) => onSearch(e.target.value)}
				placeholder="Buscar entre las preguntas..."
				className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 placeholder-gray-400"
			/>
		</div>
	);
}
