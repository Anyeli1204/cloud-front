import React, { useState } from "react";
import { Send, MessageSquare } from "lucide-react";

interface Props {
	onSubmit: (questionText: string) => void;
	suggestedTags?: string[];
	loading?: boolean;
	error?: string | null;
	success?: string | null;
}

export default function AskQuestionForm({
	onSubmit,
	suggestedTags = [
		"web scraping",
		"tiktok",
		"api",
		"educación",
		"métricas",
		"social media",
		"mobile",
	],
	loading = false,
	error,
	success,
}: Props) {
	const [question, setQuestion] = useState("");
	const [selectedTags, setSelectedTags] = useState<string[]>([]);
	const [localError, setLocalError] = useState("");
	const [customTag, setCustomTag] = useState("");
	const [allTags, setAllTags] = useState<string[]>(suggestedTags);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!question.trim()) {
			setLocalError("La pregunta no puede estar vacía.");
			return;
		}
		const hashtags = selectedTags.map((tag) => `#${tag}`);
		const finalQuestion =
			hashtags.length > 0
				? `${question.trim()} ${hashtags.join(" ")}`
				: question.trim();
		onSubmit(finalQuestion);
		setQuestion("");
		setSelectedTags([]);
		setLocalError("");
	};

	const displayError = localError || error;

	const handleTagClick = (tag: string) => {
		if (selectedTags.includes(tag)) {
			setSelectedTags(selectedTags.filter((t) => t !== tag));
		} else {
			setSelectedTags([...selectedTags, tag]);
		}
	};

	const handleAddCustomTag = () => {
		const cleanTag = customTag.trim().replace(/^#/, "");
		if (cleanTag && !allTags.includes(cleanTag)) {
			setAllTags([...allTags, cleanTag]);
			setSelectedTags([...selectedTags, cleanTag]);
			setCustomTag("");
		}
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="w-full max-w-4xl mx-auto bg-white dark:bg-white/80 dark:backdrop-blur-md p-6 rounded-2xl shadow-md dark:shadow-lg border border-purple-100 dark:border-white/30 flex flex-col gap-3"
		>
			<h2 className="text-2xl font-bold text-center text-purple-700 dark:text-purple-900">
				Haz una pregunta
			</h2>

			<div className="flex items-center gap-4 mb-2 bg-purple-100/70 dark:bg-purple-100/20 rounded-lg px-4 py-3">
				<MessageSquare size={32} color="#9333ea" className="flex-shrink-0" />
				<div className="flex-1">
					<span className="block font-semibold text-purple-700 dark:text-purple-900 text-base mb-1">
						¿No encuentras lo que buscas?
					</span>
					<span className="text-purple-600 dark:text-purple-800 text-sm">
						Nuestro equipo de soporte está disponible para ayudarte. Envía tu
						pregunta y te responderemos en menos de 24 horas.
					</span>
				</div>
			</div>

			{success && (
				<div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-400 text-green-700 dark:text-green-300 px-4 py-3 rounded-lg text-sm">
					{success}
				</div>
			)}

			<input
				type="text"
				value={question}
				onChange={(e) => {
					setQuestion(e.target.value);
					if (localError) setLocalError("");
				}}
				placeholder="Escribe tu pregunta..."
				className="w-full px-4 py-3 border-2 border-purple-200 dark:border-white/30 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm bg-white dark:bg-white/80 text-gray-900 dark:text-gray-900 placeholder-gray-400 dark:placeholder-gray-600"
				disabled={loading}
			/>

			{displayError && (
				<div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm">
					{displayError}
				</div>
			)}

			{/* Sugerencias centradas */}
			<div>
				<p className="text-sm text-gray-500 dark:text-purple-900 mb-4 text-center">
					Sugerencias de palabras clave:
				</p>
				<div className="flex flex-wrap gap-2 justify-center mb-2">
					{allTags.map((tag) => (
						<button
							key={tag}
							type="button"
							className={`px-3 py-1 rounded-full border text-sm transition ${
								selectedTags.includes(tag)
									? "bg-purple-600 text-white border-purple-600"
									: "bg-white dark:bg-white/80 text-purple-600 dark:text-purple-900 border-purple-300 dark:border-white/30 hover:bg-purple-50 dark:hover:bg-white/90"
							} ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
							onClick={() => !loading && handleTagClick(tag)}
							disabled={loading}
						>
							{tag}
						</button>
					))}
				</div>
				<div className="flex gap-2 items-center justify-center">
					<input
						type="text"
						value={customTag}
						onChange={(e) => setCustomTag(e.target.value.replace(/^#/, ""))}
						placeholder="Añadir palabra clave"
						className="px-3 py-1 border border-purple-200 dark:border-white/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white dark:bg-white/80 text-gray-900 dark:text-gray-900 placeholder-gray-400 dark:placeholder-gray-600"
						disabled={loading}
						maxLength={30}
					/>
					<button
						type="button"
						className="px-3 py-1 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 disabled:opacity-50 dark:bg-purple-700 dark:hover:bg-purple-800 dark:text-white"
						disabled={loading || !customTag.trim() || customTag.length > 30}
						onClick={handleAddCustomTag}
					>
						Añadir palabra
					</button>
				</div>
			</div>

			{/* Botón centrado */}
			<button
				type="submit"
				disabled={loading}
				className={`self-center px-6 py-2 rounded-lg flex items-center gap-2 transition ${
					loading
						? "bg-gray-400 cursor-not-allowed dark:bg-gray-700"
						: "bg-purple-600 hover:bg-purple-700 text-white dark:bg-purple-700 dark:hover:bg-purple-800 dark:text-white"
				}`}
			>
				<Send size={18} />
				{loading ? "Enviando..." : "Enviar"}
			</button>
		</form>
	);
}
