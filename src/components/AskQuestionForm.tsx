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
	suggestedTags = ["scraping", "tiktok", "api", "educación", "métricas"],
	loading = false,
	error,
	success,
}: Props) {
	const [question, setQuestion] = useState("");
	const [selectedTags, setSelectedTags] = useState<string[]>([]);
	const [localError, setLocalError] = useState("");
	const [customTag, setCustomTag] = useState("");
	const [allTags, setAllTags] = useState<string[]>(suggestedTags);
	const [filter, setFilter] = useState<"ALL" | "ANSWERED" | "PENDING">("ALL");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!question.trim()) {
			setLocalError("La pregunta no puede estar vacía.");
			return;
		}
		// Construir la pregunta con hashtags al final
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

	const estadoFiltros: Array<"ALL" | "ANSWERED" | "PENDING"> = [
		"ALL",
		"ANSWERED",
		"PENDING",
	];

	return (
		<form
			onSubmit={handleSubmit}
			className="max-w-2xl mx-auto bg-white p-6 rounded-2xl shadow-md border border-purple-100 flex flex-col gap-4"
		>
			<h2 className="text-2xl font-bold text-center text-purple-700">
				Haz una pregunta
			</h2>

			<div className="flex items-center gap-4 mb-2 bg-purple-100/70 rounded-lg px-4 py-3">
				<MessageSquare size={32} color="#9333ea" className="flex-shrink-0" />
				<div className="flex-1">
					<span className="block font-semibold text-purple-700 text-base mb-1">
						¿No encuentras lo que buscas?
					</span>
					<span className="text-purple-600 text-sm">
						Nuestro equipo de soporte está disponible para ayudarte. Envía tu
						pregunta y te responderemos en menos de 24 horas.
					</span>
				</div>
			</div>

			{success && (
				<div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
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
				className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
				disabled={loading}
			/>

			{displayError && (
				<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
					{displayError}
				</div>
			)}

			<div>
				<p className="text-sm text-gray-500 mb-2">
					Sugerencias de palabras clave:
				</p>
				<div className="flex flex-wrap gap-2 mb-2">
					{allTags.map((tag) => (
						<button
							key={tag}
							type="button"
							className={`px-3 py-1 rounded-full border text-sm transition ${
								selectedTags.includes(tag)
									? "bg-purple-600 text-white border-purple-600"
									: "bg-white text-purple-600 border-purple-300 hover:bg-purple-50"
							} ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
							onClick={() => !loading && handleTagClick(tag)}
							disabled={loading}
						>
							{tag}
						</button>
					))}
				</div>
				<div className="flex gap-2 items-center mt-2">
					<input
						type="text"
						value={customTag}
						onChange={(e) => setCustomTag(e.target.value.replace(/^#/, ""))}
						placeholder="Añadir palabra clave"
						className="px-3 py-1 border border-purple-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
						disabled={loading}
						maxLength={30}
					/>
					<button
						type="button"
						className="px-3 py-1 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 disabled:opacity-50"
						disabled={loading || !customTag.trim() || customTag.length > 30}
						onClick={handleAddCustomTag}
					>
						Añadir palabra
					</button>
				</div>
			</div>

			<button
				type="submit"
				disabled={loading}
				className={`self-end px-6 py-2 rounded-lg flex items-center gap-2 transition ${
					loading
						? "bg-gray-400 cursor-not-allowed"
						: "bg-purple-600 hover:bg-purple-700 text-white"
				}`}
			>
				<Send size={18} />
				{loading ? "Enviando..." : "Enviar"}
			</button>
		</form>
	);
}
