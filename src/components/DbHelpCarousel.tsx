import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const steps = [
	{
		title: "¿Cómo uso los filtros para Database Queries?",
		content: "",
		emoji: "",
	},
	{
		title: "",
		content:
			"Usa los tabs para elegir el tipo de filtro: básicos, engagement, avanzados o por fecha",
		emoji: "❓",
	},
	{
		title: "Filtros básicos",
		content:
			"Filtra por usernames de TikTok o hashtags. Solo uno a la vez 🧑‍💻 #️⃣",
		emoji: "#️⃣",
	},
	{
		title: "Engagement",
		content:
			"Limita los resultados por vistas, likes, engagement o interacciones ",
		emoji: "📊",
	},
	{
		title: "Avanzado",
		content: "Filtra por ID de post, región o ID de sonido 🔗",
		emoji: "🌎",
	},
	{
		title: "Fecha",
		content: "Selecciona un rango de fechas para los posts",
		emoji: "📅",
	},
	{
		title: "Recuerda",
		content:
			"Haz clic en 'Aplicar' para ver los resultados. Usa 'Limpiar' para reiniciar los filtros",
		emoji: "✨",
	},
];

export default function DbHelpCarousel() {
	const [step, setStep] = useState(0);

	const goPrev = () => setStep((s) => (s > 0 ? s - 1 : s));
	const goNext = () => setStep((s) => (s < steps.length - 1 ? s + 1 : s));

	return (
		<div className="w-full h-full flex flex-col justify-center items-center select-none transition-all duration-500">
			<div className="flex flex-1 w-full items-center justify-center relative">
				<button
					onClick={goPrev}
					disabled={step === 0}
					className="absolute left-0 md:-left-8 w-7 h-7 flex items-center justify-center rounded-full bg-white shadow text-purple-500 hover:bg-purple-100 transition disabled:opacity-40 z-10"
					aria-label="Anterior"
				>
					<ChevronLeft className="w-5- h-5 text-purple-500" />
				</button>
				<div className="flex flex-col items-center justify-center w-full px-2">
					{steps[step].emoji && (
						<span
							className="text-4xl mb-2 animate-fade-in"
							style={{ transitionDelay: "100ms" }}
						>
							{steps[step].emoji}
						</span>
					)}
					{steps[step].title && (
						<h2
							className="font-extrabold text-center mb-2 text-purple-800 text-2xl md:text-3xl"
							style={{ fontFamily: "Nunito, sans-serif" }}
						>
							{steps[step].title}
						</h2>
					)}
					{steps[step].content && (
						<p
							className="text-gray-700 text-center text-lg md:text-xl mb-2 max-w-xs md:max-w-sm"
							style={{ lineHeight: "1.4" }}
						>
							{steps[step].content}
						</p>
					)}
				</div>
				{/* Flecha derecha */}
				<button
					onClick={goNext}
					disabled={step === steps.length - 1}
					className="absolute right-0 md:-right-8 w-7 h-7 flex items-center justify-center rounded-full bg-white shadow text-purple-500 hover:bg-purple-100 transition disabled:opacity-40 z-10"
					aria-label="Siguiente"
				>
					<ChevronRight className="w-5 h-5 text-purple-500" />
				</button>
			</div>
			{/* Dots de navegación */}
			<div className="flex items-center justify-center gap-2 w-full mt-4 mb-2">
				{steps.map((_, i) => (
					<span
						key={i}
						className={`w-3 h-3 rounded-full border-2 ${step === i ? "bg-white border-purple-500 shadow" : "bg-purple-100 border-purple-200"} transition`}
					/>
				))}
			</div>
		</div>
	);
}
