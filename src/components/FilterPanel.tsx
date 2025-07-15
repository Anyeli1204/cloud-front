import React, { useState, useMemo, useRef, useEffect } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import type { UserApifyCallRequest } from "@interfaces/apify-call/UserApifyCallRequest";
import { Tag, User, Pencil, RefreshCw, Search, ChevronLeft, ChevronRight } from "lucide-react";
import ScrapiLogo from "@assets/ScrapiLogo.png";
import { recommendContent } from "@services/ia/recommendContent";
import { isScrapiResponseEmpty, MODERATION_MESSAGE } from "../utils/aiModeration";

const MySwal = withReactContent(Swal);

const POPULAR_HASHTAGS = [
	"#fitness",
	"#cooking",
	"#travel",
	"#tech",
	"#beauty",
	"#parati",
];
const POPULAR_USERS = ["charlidamelio", "khaby.lame", "bellapoarch", "addisonre"];
const POPULAR_KEYWORDS = ["pizza", "recetas", "cocina", "viajes", "deporte", "universidad"];

const HELP_CARDS = [
	{
		title: "¿Cómo uso los filtros para scrapear en ScrapeTok?",
		subtitle: "",
		text: "",
		emoji: "",
	},
	{
		title: "",
		subtitle: "Te guiamos paso a paso para que encuentres contenido viral de TikTok con precisión.",
		text: "",
		emoji: "🚀",
	},
	{
		title: "Filtra por Hashtags",
		subtitle: "",
		text: "Escribe hashtags separados por comas (#cocina, #futbol) o haz clic en los sugeridos para agregarlos.",
		emoji: "📌",
	},
	{
		title: "Usuarios de TikTok",
		subtitle: "",
		text: "Agrega nombres de usuario (usuario1, usuario2) para analizar su contenido viral.",
		emoji: "👤🔍",
	},
	{
		title: "Palabras Clave",
		subtitle: "",
		text: "Usa conceptos como \"pizza\", \"recetas\", \"viajes\" para encontrar lo más relevante.",
		emoji: "🧠🗝️",
	},

	{
		title: "Solo una categoría",
		subtitle: "Recuerda que solo puedes scrapear una categoría por vez: hashtags, palabras clave o usuarios.",
		text: "",
		emoji: "⚠️",
	},
	{
		title: "¿No sabes qué hashtags, palabras clave o usuarios scrapear?",
		subtitle: "",
		text: "",
		emoji: "🤔",
	},
	{
		title: "Scrapi",
		subtitle: "Consulta el tema que deseas analizar, con nuestro asistente de IA: Scrapi.",
		text: "¡Te ayudará al instante!",
		emoji: "🤖",
	},
	
	{
		title: "Filtros obligatorios",
		subtitle: "",
		text: "Los filtros obligatorios son: Fechas y # Últimos N Post.",
		emoji: "🚨",
	},
	{
		title: "Fechas",
		subtitle: "",
		text: "Selecciona una fecha de inicio y una fecha final de las publicaciones para enfocarte en un rango específico. ",
		emoji: "📅",
	},
	{
		title: "Número de Posts",
		subtitle: "",
		text: "Ejemplo: 5 vídeos más virales por cada hashtag, palabra clave o usuario.",
		emoji: "🧾✨",
	},
	{
		title: "Ejecuta o reinicia",
		subtitle: "",
		text: "Haz clic en Aplicar Filtros para buscar o Limpiar para reiniciar tu formulario.",
		emoji: "🟣✅",
	},
];

interface FilterPanelProps {
	onApply: (filters: UserApifyCallRequest) => void;
	onReset?: () => void;
	initialFilters?: Partial<UserApifyCallRequest> | null;
}

export function FilterPanel({ onApply, onReset, initialFilters }: FilterPanelProps) {

	const [filters, setFilters] = useState<UserApifyCallRequest>({
		userId: 0,
		hashtags: "",
		tiktokAccount: "",
		keyWords: "",
		dateFrom: "",
		dateTo: "",
		nlastPostByHashtags: undefined,
		...(initialFilters || {})
	});

	const [activeTab, setActiveTab] = useState<'hashtags' | 'usuarios' | 'palabras' | 'basico'>('hashtags');
	const [previousTab, setPreviousTab] = useState<'hashtags' | 'usuarios' | 'palabras'>('hashtags');
	const [helpIndex, setHelpIndex] = useState(0);
	const [fade, setFade] = useState<'in' | 'out'>('in');

	useEffect(() => {
		const interval = setInterval(() => {
		}, 2000);
		return () => clearInterval(interval);
	}, []);

	const filterPanelRef = useRef<HTMLDivElement>(null);
	const helpPanelRef = useRef<HTMLDivElement>(null);
	const [helpHeight, setHelpHeight] = useState<number | undefined>(undefined);

	useEffect(() => {
		const storedFilters = sessionStorage.getItem("apifyScrapeFilters");
		if (storedFilters) {
			try {
				const parsedFilters = JSON.parse(storedFilters);
				setFilters(prev => ({
					...prev,
					...parsedFilters
				}));

				if (parsedFilters.hashtags) {
					setActiveTab('hashtags');
				} else if (parsedFilters.tiktokAccount) {
					setActiveTab('usuarios');
				} else if (parsedFilters.keyWords) {
					setActiveTab('palabras');
				} else if (parsedFilters.dateFrom || parsedFilters.dateTo || parsedFilters.nlastPostByHashtags) {
					setActiveTab('basico');
				}
			} catch (error) {
				console.error("Error al cargar filtros del sessionStorage:", error);
			}
		}
	}, []);

	useEffect(() => {
		if (filterPanelRef.current && helpPanelRef.current) {
			const filterHeight = filterPanelRef.current.offsetHeight;
			setHelpHeight(filterHeight);
		}
	}, [activeTab, filters, helpIndex]);

	const handleChange = <K extends keyof UserApifyCallRequest>(
		key: K,
		value: UserApifyCallRequest[K],
	) => {
		const newFilters = { ...filters };

		if (key === "hashtags") {
			newFilters.hashtags = value as string;
			newFilters.tiktokAccount = "";
			newFilters.keyWords = "";
		} else if (key === "tiktokAccount") {
			newFilters.tiktokAccount = value as string;
			newFilters.hashtags = "";
			newFilters.keyWords = "";
		} else if (key === "keyWords") {
			newFilters.keyWords = value as string;
			newFilters.hashtags = "";
			newFilters.tiktokAccount = "";
		} else {
			newFilters[key] = value;
		}

		setFilters(newFilters);

		// Guardar en sessionStorage cada vez que cambien los filtros
		sessionStorage.setItem("apifyScrapeFilters", JSON.stringify(newFilters));
	};

	const mainCount = useMemo(
		() =>
			[filters.hashtags, filters.tiktokAccount, filters.keyWords].filter(
				(v) => v && v.trim(),
			).length,
		[filters],
	);

	const mandatoryFilled =
		!!filters.dateFrom &&
		!!filters.dateTo &&
		filters.nlastPostByHashtags !== undefined;

	const isValid = mainCount === 1 && mandatoryFilled;

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!isValid) {
			MySwal.fire({
				icon: "error",
				iconHtml: "❌",
				title: "<strong>¡Filtros inválidos!</strong>",
				html: `
    <div style="text-align:left; font-size:1.125rem; line-height:1.6;">
      <p>• <strong>Obligatorios: </strong> Fechas y # Últimos N Post.</p>
      <p>• <strong>Elegir uno: </strong> Hashtags, Usuarios o Keywords.</p>
    </div>
  `,
				background: "#fff",
				backdrop: "rgba(0,0,0,0.7)",
				customClass: {
					popup: "rounded-2xl shadow-2xl p-8 max-w-lg",
					title: "text-3xl text-red-600 mb-4",
					htmlContainer: "mt-2",
					confirmButton:
						"bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg text-lg",
				},
				showCloseButton: true,
				confirmButtonText: "Entendido",
				allowOutsideClick: false,
			});

			return;
		}

		onApply(filters);
	};

	const handleReset = () => {
		const resetFilters = {
			userId: 0,
			hashtags: "",
			tiktokAccount: "",
			keyWords: "",
			dateFrom: "",
			dateTo: "",
			nlastPostByHashtags: undefined,
		};
		setFilters(resetFilters);

		sessionStorage.removeItem("apifyScrapeFilters");

		onReset?.();
	};

	const handleTabChange = (tab: 'hashtags' | 'usuarios' | 'palabras' | 'basico') => {
		if (tab === 'basico' && activeTab !== 'basico') {
			if (activeTab === 'hashtags' || activeTab === 'usuarios' || activeTab === 'palabras') {
				setPreviousTab(activeTab);
			}
		}
		setActiveTab(tab);
	};

	return (
		<div className="w-full max-w-7xl mx-auto p-6">
			<div className="flex flex-col lg:flex-row gap-6">
				<div className="lg:w-80 lg:flex-shrink-0 h-full flex items-center justify-center">
					<div
						ref={helpPanelRef}
						className="relative w-full max-w-sm mx-auto bg-white/80 backdrop-blur rounded-2xl shadow-xl px-10 py-8 flex flex-col justify-center items-center transition-all duration-500"
						style={{ height: helpHeight ? helpHeight : undefined, minHeight: '320px' }}
					>
						<button
							disabled={helpIndex === 0}
							onClick={() => {
								setFade('out');
								setTimeout(() => {
									setHelpIndex(i => Math.max(0, i - 1));
									setFade('in');
								}, 200);
							}}
							className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full shadow-md p-0.5 hover:bg-purple-100 transition disabled:opacity-30 disabled:cursor-not-allowed z-10"
							aria-label="Anterior"
						>
							<ChevronLeft className="w-5 h-5 text-purple-400" />
						</button>
						<button
							disabled={helpIndex === HELP_CARDS.length - 1}
							onClick={() => {
								setFade('out');
								setTimeout(() => {
									setHelpIndex(i => Math.min(HELP_CARDS.length - 1, i + 1));
									setFade('in');
								}, 200);
							}}
							className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full shadow-md p-0.5 hover:bg-purple-100 transition disabled:opacity-30 disabled:cursor-not-allowed z-10"
							aria-label="Siguiente"
						>
							<ChevronRight className="w-5 h-5 text-purple-400" />
						</button>
						<div
							className={`flex flex-col items-center justify-center w-full h-full space-y-2 transition-all duration-300
								${helpIndex === 0 ? 'animate-pop' : ''}
								${fade === 'out' ? 'opacity-0' : 'opacity-100'}`}
							key={helpIndex}
						>
							{HELP_CARDS[helpIndex].emoji && (
								<span className="text-4xl mb-1 animate-fade-in" style={{ transitionDelay: '100ms' }}>{HELP_CARDS[helpIndex].emoji}</span>
							)}
							{HELP_CARDS[helpIndex].title && (
								<h2 className={`font-extrabold text-center mb-1 text-purple-800 ${helpIndex === 0 ? 'text-2xl md:text-3xl animate-pop' : 'text-lg md:text-xl'}`}>{HELP_CARDS[helpIndex].title}</h2>
							)}
							{HELP_CARDS[helpIndex].subtitle && (
								<h3 className={`font-medium text-gray-700 text-center mb-1 animate-fade-in ${helpIndex === 0 ? 'text-base md:text-lg' : 'text-sm md:text-base'}`} style={{ transitionDelay: '150ms' }}>{HELP_CARDS[helpIndex].subtitle}</h3>
							)}
							{HELP_CARDS[helpIndex].text && (
								<p className={`text-gray-600 text-center animate-fade-in ${helpIndex === 0 ? 'text-base' : 'text-xs md:text-sm'}`} style={{ transitionDelay: '200ms' }}>{HELP_CARDS[helpIndex].text}</p>
							)}
						</div>
						<div className="flex justify-center mt-4">
							{HELP_CARDS.map((_, idx) => (
								<span
									key={idx}
									className={`mx-1 rounded-full transition-all duration-300 inline-block
										${idx === helpIndex ? 'w-3 h-3 border-2 border-[#5E17EB] bg-white shadow' : 'w-2 h-2 bg-purple-200'}`}
								></span>
							))}
						</div>
					</div>
				</div>

				<div className="flex-1 lg:flex-[3] h-full relative">
					<div ref={filterPanelRef} className="bg-white/80 backdrop-blur rounded-2xl shadow-lg p-6 min-h-[340px] h-full flex flex-col justify-center dark:bg-white/80 transition-all duration-500">
						<div className="mx-auto max-w-2xl w-full px-2">
							<div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
								<h2 className="text-3xl font-extrabold text-left text-purple-800 tracking-tight" style={{ fontFamily: 'Nunito, Montserrat, sans-serif' }}>
									Filtros Apify Call
								</h2>
								<div className="flex gap-3 justify-end">
									<button
										type="button"
										onClick={handleReset}
										className="px-6 py-2 bg-white border-2 border-purple-300 text-purple-700 rounded-lg hover:bg-purple-50 transition-colors font-semibold text-sm flex items-center gap-2"
									>
										<RefreshCw className="w-4 h-4" /> Limpiar
									</button>
									<button
										type="submit"
										form="apify-filters-form"
										className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold shadow-lg text-sm flex items-center gap-2"
									>
										<Search className="w-4 h-4" /> Aplicar Filtros
									</button>
								</div>
							</div>

							<div className="flex mb-8 bg-gray-100 rounded-xl p-1 gap-1">
								<button
									type="button"
									onClick={() => handleTabChange('hashtags')}
									className={`flex-1 flex items-center justify-center gap-1 py-2 px-2 font-medium text-sm transition-all duration-200 rounded-lg focus:outline-none
								${activeTab === 'hashtags' ? 'bg-white text-purple-700 shadow-sm border-b-2 border-purple-600' : 'bg-transparent text-gray-500 hover:text-purple-700'}`}
								>
									<Tag className={`w-4 h-4 ${activeTab === 'hashtags' ? 'text-purple-600' : 'text-gray-400'}`} />
									<span className="hidden sm:inline">Hashtags</span>
								</button>
								<button
									type="button"
									onClick={() => handleTabChange('usuarios')}
									className={`flex-1 flex items-center justify-center gap-1 py-2 px-2 font-medium text-sm transition-all duration-200 rounded-lg focus:outline-none
								${activeTab === 'usuarios' ? 'bg-white text-purple-700 shadow-sm border-b-2 border-purple-600' : 'bg-transparent text-gray-500 hover:text-purple-700'}`}
								>
									<User className={`w-4 h-4 ${activeTab === 'usuarios' ? 'text-purple-600' : 'text-gray-400'}`} />
									<span className="hidden sm:inline">Usuarios</span>
								</button>
								<button
									type="button"
									onClick={() => handleTabChange('palabras')}
									className={`flex-1 flex items-center justify-center gap-1 py-2 px-2 font-medium text-sm transition-all duration-200 rounded-lg focus:outline-none
								${activeTab === 'palabras' ? 'bg-white text-purple-700 shadow-sm border-b-2 border-purple-600' : 'bg-transparent text-gray-500 hover:text-purple-700'}`}
								>
									<Pencil className={`w-4 h-4 ${activeTab === 'palabras' ? 'text-purple-600' : 'text-gray-400'}`} />
									<span className="hidden sm:inline">Palabras Clave</span>
								</button>
							</div>

							<form onSubmit={handleSubmit} id="apify-filters-form" className="space-y-4">
								{activeTab === 'hashtags' && (
									<div className="space-y-3">
										<div>
											<div className="flex items-center justify-between mb-1">
												<label className="font-semibold text-gray-700 text-sm">Hashtags</label>
												{(filters.hashtags || '').trim() && (
													<button
														type="button"
														onClick={() => handleTabChange('basico')}
														className="flex items-center gap-1 text-purple-700 font-semibold text-xs bg-purple-50 border border-purple-200 rounded-full px-3 py-1 shadow-sm hover:bg-purple-100 transition whitespace-nowrap"
													>
														<span>Ir a filtros básicos</span>
														<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
													</button>
												)}
											</div>
											<input
												type="text"
												placeholder="#cocina, #futbol, #tech"
												value={filters.hashtags}
												onChange={(e) => handleChange("hashtags", e.target.value)}
												className="w-full border-2 border-purple-200 bg-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400 text-gray-900 text-sm"
											/>
										</div>
										<div className="flex items-center justify-between flex-wrap gap-2 relative">
											<div>
												<label className="block mb-1 font-medium text-gray-600 text-xs">Sugerencias:</label>
												<div className="flex flex-wrap gap-1">
													{POPULAR_HASHTAGS.map((tag) => (
														<button
															key={tag}
															type="button"
															onClick={() => {
																const current = filters.hashtags?.split(",").map((s) => s.trim()).filter(Boolean) || [];
																const next = current.includes(tag) ? current : [...current, tag];
																handleChange("hashtags", next.join(", "));
															}}
															className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors font-medium"
														>
															{tag}
														</button>
													))}
												</div>
											</div>
										</div>
									</div>
								)}

								{activeTab === 'usuarios' && (
									<div className="space-y-3">
										<div>
											<div className="flex items-center justify-between mb-1">
												<label className="font-semibold text-gray-700 text-sm">Usuarios de TikTok</label>
												{(filters.tiktokAccount || '').trim() && (
													<button
														type="button"
														onClick={() => handleTabChange('basico')}
														className="flex items-center gap-1 text-purple-700 font-semibold text-xs bg-purple-50 border border-purple-200 rounded-full px-3 py-1 shadow-sm hover:bg-purple-100 transition whitespace-nowrap"
													>
														<span>Ir a filtros básicos</span>
														<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
													</button>
												)}
											</div>
											<input
												type="text"
												placeholder="usuario1, usuario2, usuario3"
												value={filters.tiktokAccount}
												onChange={(e) => handleChange("tiktokAccount", e.target.value)}
												className="w-full border-2 border-purple-200 bg-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400 text-gray-900 text-sm"
											/>
										</div>
										<div className="flex items-center justify-between flex-wrap gap-2">
											<div>
												<label className="block mb-1 font-medium text-gray-600 text-xs">Sugerencias:</label>
												<div className="flex flex-wrap gap-1">
													{POPULAR_USERS.map((user) => (
														<button
															key={user}
															type="button"
															onClick={() => {
																const current = filters.tiktokAccount?.split(",").map((s) => s.trim()).filter(Boolean) || [];
																const next = current.includes(user) ? current : [...current, user];
																handleChange("tiktokAccount", next.join(", "));
															}}
															className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors font-medium"
														>
															{user}
														</button>
													))}
												</div>
											</div>
										</div>
									</div>
								)}

								{activeTab === 'palabras' && (
									<div className="space-y-3">
										<div>
											<div className="flex items-center justify-between mb-1">
												<label className="font-semibold text-gray-700 text-sm">Palabras Clave</label>
												{(filters.keyWords || '').trim() && (
													<button
														type="button"
														onClick={() => handleTabChange('basico')}
														className="flex items-center gap-1 text-purple-700 font-semibold text-xs bg-purple-50 border border-purple-200 rounded-full px-3 py-1 shadow-sm hover:bg-purple-100 transition whitespace-nowrap"
													>
														<span>Ir a filtros básicos</span>
														<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
													</button>
												)}
											</div>
											<input
												type="text"
												placeholder="pizza, recetas, viajes"
												value={filters.keyWords}
												onChange={(e) => handleChange("keyWords", e.target.value)}
												className="w-full border-2 border-purple-200 bg-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400 text-gray-900 text-sm"
											/>
										</div>
										<div className="flex items-center justify-between flex-wrap gap-2">
											<div>
												<label className="block mb-1 font-medium text-gray-600 text-xs">Sugerencias:</label>
												<div className="flex flex-wrap gap-1">
													{POPULAR_KEYWORDS.map((keyword) => (
														<button
															key={keyword}
															type="button"
															onClick={() => {
																const current = filters.keyWords?.split(",").map((s) => s.trim()).filter(Boolean) || [];
																const next = current.includes(keyword) ? current : [...current, keyword];
																handleChange("keyWords", next.join(", "));
															}}
															className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors font-medium"
														>
															{keyword}
														</button>
													))}
												</div>
											</div>
										</div>
									</div>
								)}

								{activeTab === 'basico' && (
									<div className="space-y-3">
										<div className="flex flex-col md:flex-row gap-3 w-full">
											<div className="flex-1">
												<label className="font-semibold text-gray-700 text-sm">Fecha desde</label>
												<input
													type="date"
													value={filters.dateFrom}
													onChange={(e) => handleChange("dateFrom", e.target.value)}
													className="w-full border-2 border-purple-200 bg-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400 text-gray-900 text-sm"
												/>
											</div>
											<div className="flex-1">
												<label className="font-semibold text-gray-700 text-sm">Fecha hasta</label>
												<input
													type="date"
													value={filters.dateTo}
													onChange={(e) => handleChange("dateTo", e.target.value)}
													className="w-full border-2 border-purple-200 bg-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400 text-gray-900 text-sm"
												/>
											</div>
											<div className="flex-1">
												<label className="font-semibold text-gray-700 text-sm">Número de Posts</label>
												<input
													type="number"
													placeholder="5"
													value={filters.nlastPostByHashtags}
													onChange={(e) => handleChange("nlastPostByHashtags", parseInt(e.target.value) || undefined)}
													className="w-full border-2 border-purple-200 bg-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400 text-gray-900 text-sm"
												/>
											</div>
										</div>
										<div className="flex justify-end w-full pt-2">
											<button
												type="button"
												onClick={() => handleTabChange(previousTab)}
												className="flex items-center gap-1 text-purple-700 font-bold text-xs bg-purple-100 border border-purple-300 rounded-full px-3 py-1 shadow-lg hover:bg-purple-200 transition-all whitespace-nowrap"
												style={{ minWidth: 110 }}
											>
												Ir a filtros avanzados
												<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
											</button>
										</div>
									</div>
								)}
							</form>
						</div>
						{/* Asistente virtual: Scrapi con globo de diálogo pequeño, cuadrado y pegado al logo */}
						{activeTab !== 'basico' ? (
							<div className="absolute bottom-2 right-8 z-20 max-w-[320px] w-full flex items-end justify-end">
								<div className="relative flex items-end w-full">
									<svg
										viewBox="0 0 320 70"
										width="250"
										height="80"
										className="drop-shadow-lg w-full"
										style={{ minWidth: 210, maxWidth: 210 }}
									>
										<defs>
											<linearGradient id="bubble-gradient" x1="0" y1="0" x2="1" y2="1">
												<stop offset="0%" stopColor="#a78bfa" />
												<stop offset="100%" stopColor="#9333ea" />
											</linearGradient>
											<filter id="bubble-shadow" x="-20%" y="-20%" width="140%" height="140%">
												<feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000" floodOpacity="0.1" />
											</filter>
										</defs>
										<rect x="10" y="-10" rx="16" ry="16" width="260" height="80" fill="url(#bubble-gradient)" filter="url(#bubble-shadow)" />
										<polygon points="270,40 310,55 270,55" fill="url(#bubble-gradient)" />
										<text
											x="140"
											y="25"
											textAnchor="middle"
											fontFamily="'Nunito', sans-serif"
											fontWeight="700"
											fontSize="22"
											fill="#fff"
											dominantBaseline="middle"
										>
											Scrapi AI
										</text>
										<text
											x="140"
											y="50"
											textAnchor="middle"
											fontFamily="'Nunito', sans-serif"
											fontSize="13"
											fill="#ede9fe"
											dominantBaseline="middle"
										>
											¿Necesitas ayuda para generar filtros?
										</text>
									</svg>

									<div className="relative flex items-center">
										<img
											src={ScrapiLogo}
											alt="Scrapi IA"
											className="w-16 h-16 ml-1 drop-shadow-xl cursor-pointer"
											style={{ marginBottom: '8px' }}
											onClick={async () => {
												const { value: userMessage } = await MySwal.fire({
													title: 'Scrapi AI',
													input: 'text',
													inputLabel: '¿Sobre qué tema quieres ideas de filtros?',
													inputPlaceholder: 'Ej: cocina, viajes, tecnología...',
													showCancelButton: true,
													confirmButtonText: 'Pedir recomendación',
													cancelButtonText: 'Cancelar',
													background: '#fff',
													customClass: {
														popup: 'rounded-2xl shadow-2xl p-8 max-w-lg',
														title: 'text-2xl text-purple-700 mb-2',
														confirmButton: 'bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg text-lg',
														cancelButton: 'bg-gray-200 text-gray-700 px-6 py-2 rounded-lg text-lg ml-2',
														input: 'border-2 border-purple-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300',
													},
												});

												if (userMessage) {
													MySwal.fire({
														title: 'Cargando…',
														html: 'Consultando a la IA, por favor espera...',
														allowOutsideClick: false,
														didOpen: () => MySwal.showLoading(),
														showConfirmButton: false,
														background: '#fff',
													});

													const res = await recommendContent({ message: userMessage });
													MySwal.close();

													if (res.response) {
														let parsed;
														try {
															parsed = JSON.parse(res.response);
														} catch {
															parsed = null;
														}

														// Verificar si la respuesta está vacía (indicando moderación)
														if (isScrapiResponseEmpty(parsed)) {
															
															MySwal.fire({
																icon: "error",
																title: "Contenido bloqueado",
																text: MODERATION_MESSAGE,
																background: "#fff",
																confirmButtonText: "Entendido",
																customClass: {
																	popup: "rounded-2xl shadow-2xl p-8 max-w-lg",
																	title: "text-2xl text-red-700 mb-2",
																	confirmButton: "bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg text-lg",
																},
															});
															return;
														}

														if (parsed && (parsed.hashtags || parsed.keywords || parsed.usernames)) {
															// Crear modal con tabs para las sugerencias
															const suggestionsHtml = `
																<div class="space-y-4">
																	<div class="flex bg-gray-100 rounded-lg p-1 gap-1 mb-4">
																		<button id="tab-hashtags" class="flex-1 py-2 px-3 text-sm font-medium rounded-md bg-white text-purple-700 shadow-sm border-b-2 border-purple-600">
																			Hashtags
																		</button>
																		<button id="tab-keywords" class="flex-1 py-2 px-3 text-sm font-medium rounded-md bg-transparent text-gray-500 hover:text-blue-700">
																			Palabras clave
																		</button>
																		<button id="tab-usernames" class="flex-1 py-2 px-3 text-sm font-medium rounded-md bg-transparent text-gray-500 hover:text-green-700">
																			Usuarios
																		</button>
																	</div>
																	
																	<div id="content-hashtags" class="tab-content">
																		<div class="flex flex-wrap gap-2">
																			${parsed.hashtags?.map((tag: string) => `
																				<span class="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
																					${tag}
																				</span>
																			`).join('') || '<p class="text-gray-500">No hay hashtags sugeridos</p>'}
																		</div>
																	</div>
																	
																	<div id="content-keywords" class="tab-content hidden">
																		<div class="flex flex-wrap gap-2">
																			${parsed.keywords?.map((keyword: string) => `
																				<span class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
																					${keyword}
																				</span>
																			`).join('') || '<p class="text-gray-500">No hay palabras clave sugeridas</p>'}
																		</div>
																	</div>
																	
																	<div id="content-usernames" class="tab-content hidden">
																		<div class="flex flex-wrap gap-2">
																			${parsed.usernames?.map((username: string) => `
																				<span class="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
																					${username}
																				</span>
																			`).join('') || '<p class="text-gray-500">No hay usuarios sugeridos</p>'}
																		</div>
																	</div>
																</div>
															`;
															
															await MySwal.fire({
																title: 'Sugerencias de Scrapi AI',
																html: suggestionsHtml,
																background: '#fff',
																showConfirmButton: true,
																showCancelButton: true,
																confirmButtonText: 'Autocompletar',
																cancelButtonText: 'Cerrar',
																customClass: {
																	popup: 'rounded-2xl shadow-2xl p-8 max-w-lg',
																	title: 'text-2xl text-purple-700 mb-2',
																	confirmButton: 'bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg text-lg',
																	cancelButton: 'bg-gray-200 text-gray-700 px-6 py-2 rounded-lg text-lg',
																},
																didOpen: () => {
																	// Funcionalidad de tabs
																	const tabs = ['hashtags', 'keywords', 'usernames'];
																	let activeTab = 'hashtags'; // Tab activo por defecto
																	
																	tabs.forEach(tab => {
																		const tabBtn = document.getElementById(`tab-${tab}`);
																		const content = document.getElementById(`content-${tab}`);
																		
																		if (tabBtn && content) {
																			tabBtn.addEventListener('click', () => {
																				activeTab = tab; // Actualizar tab activo
																				
																				// Ocultar todos los contenidos
																				document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
																				// Remover estilos activos de todos los tabs
																				document.querySelectorAll('[id^="tab-"]').forEach(el => {
																					el.classList.remove('bg-white', 'text-purple-700', 'text-blue-700', 'text-green-700', 'shadow-sm', 'border-b-2', 'border-purple-600', 'border-blue-600', 'border-green-600');
																					el.classList.add('bg-transparent', 'text-gray-500');
																				});
																				
																				// Mostrar contenido activo
																				content.classList.remove('hidden');
																				// Aplicar estilos activos
																				tabBtn.classList.remove('bg-transparent', 'text-gray-500');
																				tabBtn.classList.add('bg-white', 'shadow-sm');
																				
																				if (tab === 'hashtags') {
																					tabBtn.classList.add('text-purple-700', 'border-b-2', 'border-purple-600');
																				} else if (tab === 'keywords') {
																					tabBtn.classList.add('text-blue-700', 'border-b-2', 'border-blue-600');
																				} else if (tab === 'usernames') {
																					tabBtn.classList.add('text-green-700', 'border-b-2', 'border-green-600');
																				}
																			});
																		}
																	});
																	
																	// Funcionalidad del botón Autocompletar
																	const confirmButton = document.querySelector('.swal2-confirm');
																	if (confirmButton) {
																		confirmButton.addEventListener('click', () => {
																			if (activeTab === 'hashtags' && parsed.hashtags) {
																				const hashtagsString = parsed.hashtags.join(', ');
																				handleChange('hashtags', hashtagsString);
																				setActiveTab('hashtags');
																			} else if (activeTab === 'keywords' && parsed.keywords) {
																				const keywordsString = parsed.keywords.join(', ');
																				handleChange('keyWords', keywordsString);
																				setActiveTab('palabras');
																			} else if (activeTab === 'usernames' && parsed.usernames) {
																				const usernamesString = parsed.usernames.join(', ');
																				handleChange('tiktokAccount', usernamesString);
																				setActiveTab('usuarios');
																			}
																		});
																	}
																}
															});
														} else {
															MySwal.fire({
																title: 'Respuesta de Scrapi AI',
																html: `<pre style="white-space:pre-wrap;text-align:left;font-size:1rem;">${res.response}</pre>`,
																background: '#fff',
																confirmButtonText: 'Cerrar',
																customClass: {
																	popup: 'rounded-2xl shadow-2xl p-8 max-w-lg',
																	title: 'text-2xl text-purple-700 mb-2',
																	confirmButton: 'bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg text-lg',
																},
															});
														}
													} else {
														// 🛑 Manejo de errores mejorado
														let userFriendlyMessage = MODERATION_MESSAGE;

														try {
															const errText = typeof res.error === 'string' ? res.error : JSON.stringify(res.error);
															const errJson = JSON.parse(errText);

															const isContentFilter =
																errJson?.error?.code === 'content_filter' ||
																errJson?.error?.innererror?.code === 'ResponsibleAIPolicyViolation';

															if (!isContentFilter && errJson?.error?.message) {
																userFriendlyMessage = errJson.error.message;
															}
														} catch {
															// Si no se puede parsear, dejamos el mensaje predeterminado
														}

														MySwal.fire({
															icon: 'error',
															title: 'Mensaje bloqueado',
															text: userFriendlyMessage,
															background: '#fff',
															confirmButtonText: 'Cerrar',
															customClass: {
																popup: 'rounded-2xl shadow-2xl p-8 max-w-lg',
																title: 'text-2xl text-red-700 mb-2',
																confirmButton: 'bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg text-lg',
															},
														});
													}
												}
											}}
										/>

									</div>
								</div>
							</div>
						) : null}

					</div>
				</div>
			</div>
		</div>
	);
}