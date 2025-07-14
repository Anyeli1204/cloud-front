// src/components/FilterPanel.tsx
import React, { useState, useMemo, useRef, useEffect } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import type { UserApifyCallRequest } from "@interfaces/apify-call/UserApifyCallRequest";
import { Tag, User, Pencil, RefreshCw, Search, ChevronLeft, ChevronRight } from "lucide-react";
// Importo el logo real del robot
import ScrapiLogo from "@assets/ScrapiLogo.png";
import { recommendContent } from "@services/ia/recommendContent";

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
  // 1: Solo la pregunta
  {
    title: "¿Cómo uso los filtros para scrapear en ScrapeTok?",
    subtitle: "",
    text: "",
    emoji: "",
  },
  // 2: Explicación
  {
    title: "",
    subtitle: "Te guiamos paso a paso para que encuentres contenido viral de TikTok con precisión.",
    text: "",
    emoji: "🚀",
  },
  // 3
  {
    title: "Filtra por Hashtags",
    subtitle: "",
    text: "Escribe hashtags separados por comas (#cocina, #futbol) o haz clic en los sugeridos para agregarlos.",
    emoji: "📌",
  },
  // 4
  {
    title: "Usuarios de TikTok",
    subtitle: "",
    text: "Agrega nombres de usuario (usuario1, usuario2) para analizar su contenido viral.",
    emoji: "👤🔍",
  },
  // 5
  {
    title: "Palabras Clave",
    subtitle: "",
    text: "Usa conceptos como \"pizza\", \"recetas\", \"viajes\" para encontrar lo más relevante.",
    emoji: "🧠🗝️",
  },
  
  // 6
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
  // 8
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
  // 9
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
	const [showTooltip, setShowTooltip] = useState(false);
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
      // setScrapiCircle((prev) => (prev === 'emoji' ? 'text' : 'emoji')); // This line was removed
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Referencias para igualar altura
  const filterPanelRef = useRef<HTMLDivElement>(null);
  const helpPanelRef = useRef<HTMLDivElement>(null);
  const [helpHeight, setHelpHeight] = useState<number | undefined>(undefined);

  // Cargar filtros guardados en sessionStorage al montar el componente
  useEffect(() => {
    const storedFilters = sessionStorage.getItem("apifyScrapeFilters");
    if (storedFilters) {
      try {
        const parsedFilters = JSON.parse(storedFilters);
        setFilters(prev => ({
          ...prev,
          ...parsedFilters
        }));
        
        // Determinar qué tab activar basado en los filtros cargados
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
		
		// Limpiar sessionStorage
		sessionStorage.removeItem("apifyScrapeFilters");
		
		onReset?.();
	};

	// Función para manejar el autocompletado y cambiar al tab correspondiente
	const handleAutocomplete = (tab: 'hashtags' | 'palabras' | 'usuarios', value: string) => {
		if (tab === 'hashtags') {
			setFilters(f => ({ ...f, hashtags: value, tiktokAccount: '', keyWords: '' }));
			setActiveTab('hashtags');
		} else if (tab === 'palabras') {
			setFilters(f => ({ ...f, hashtags: '', tiktokAccount: '', keyWords: value }));
			setActiveTab('palabras');
		} else if (tab === 'usuarios') {
			setFilters(f => ({ ...f, hashtags: '', tiktokAccount: value, keyWords: '' }));
			setActiveTab('usuarios');
		}
	};

	// Cambiar de tab y guardar el anterior si vamos a 'basico'
	const handleTabChange = (tab: 'hashtags' | 'usuarios' | 'palabras' | 'basico') => {
		if (tab === 'basico' && activeTab !== 'basico') {
			// Guardar el tab anterior
			if (activeTab === 'hashtags' || activeTab === 'usuarios' || activeTab === 'palabras') {
				setPreviousTab(activeTab);
			}
		}
		setActiveTab(tab);
	};

	return (
		<div className="w-full max-w-7xl mx-auto p-6">
			{/* Layout principal: dos columnas en desktop, apilado en mobile */}
			<div className="flex flex-col lg:flex-row gap-6">
				{/* Columna izquierda: Carrusel de ayuda (más angosto) */}
				<div className="lg:w-80 lg:flex-shrink-0 h-full flex items-center justify-center">
					<div
						ref={helpPanelRef}
						className="relative w-full max-w-sm mx-auto bg-white/80 backdrop-blur rounded-2xl shadow-xl px-10 py-8 flex flex-col justify-center items-center transition-all duration-500"
						style={{ height: helpHeight ? helpHeight : undefined, minHeight: '320px' }}
					>
						{/* Flecha izquierda */}
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
						{/* Flecha derecha */}
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
						{/* Contenido de la tarjeta */}
						<div
							className={`flex flex-col items-center justify-center w-full h-full space-y-2 transition-all duration-300
								${helpIndex === 0 ? 'animate-pop' : ''}
								${fade === 'out' ? 'opacity-0' : 'opacity-100'}`}
							key={helpIndex}
						>
							{HELP_CARDS[helpIndex].emoji && (
								<span className="text-4xl mb-1 animate-fade-in" style={{transitionDelay:'100ms'}}>{HELP_CARDS[helpIndex].emoji}</span>
							)}
							{HELP_CARDS[helpIndex].title && (
								<h2 className={`font-extrabold text-center mb-1 text-purple-800 ${helpIndex === 0 ? 'text-2xl md:text-3xl animate-pop' : 'text-lg md:text-xl'}`}>{HELP_CARDS[helpIndex].title}</h2>
							)}
							{HELP_CARDS[helpIndex].subtitle && (
								<h3 className={`font-medium text-gray-700 text-center mb-1 animate-fade-in ${helpIndex === 0 ? 'text-base md:text-lg' : 'text-sm md:text-base'}`} style={{transitionDelay:'150ms'}}>{HELP_CARDS[helpIndex].subtitle}</h3>
							)}
							{HELP_CARDS[helpIndex].text && (
								<p className={`text-gray-600 text-center animate-fade-in ${helpIndex === 0 ? 'text-base' : 'text-xs md:text-sm'}`} style={{transitionDelay:'200ms'}}>{HELP_CARDS[helpIndex].text}</p>
							)}
						</div>
						{/* Dots de navegación */}
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

				{/* Columna derecha: Panel de filtros (más ancho) */}
				<div className="flex-1 lg:flex-[3] h-full relative">
					<div ref={filterPanelRef} className="bg-white/80 backdrop-blur rounded-2xl shadow-lg p-6 min-h-[340px] h-full flex flex-col justify-center dark:bg-white/80 transition-all duration-500">
						<div className="mx-auto max-w-2xl w-full px-2">
							{/* Header alineado: título a la izquierda, botones a la derecha */}
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

							{/* Tabs superiores unificados con iconos de línea */}
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

							{/* Contenido de las pestañas */}
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
											{/* Elimino el div y contenido del panel desplegable Scrapi que quedó huérfano */}
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
        {/* Globo rectangular más pequeño */}
        <rect x="10" y="-10" rx="16" ry="16" width="260" height="80" fill="url(#bubble-gradient)" filter="url(#bubble-shadow)" />
        {/* Flecha del globo, apuntando al robot a la derecha */}
        <polygon points="270,40 310,55 270,55" fill="url(#bubble-gradient)" />
        {/* Texto principal */}
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
          Scrapetok AI
        </text>
        {/* Pregunta en dos líneas */}
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
      {/* Imagen de Scrapi con tooltip personalizado */}
      <div className="relative flex items-center">
        <img
          src={ScrapiLogo}
          alt="Scrapi IA"
          className="w-16 h-16 ml-1 drop-shadow-xl cursor-pointer"
          style={{ marginBottom: '8px' }}
          onClick={async () => {
            const { value: userMessage } = await MySwal.fire({
              title: 'Scrapetok AI',
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
                if (parsed && (parsed.hashtags || parsed.keywords || parsed.usernames)) {
                  // Generar HTML de tabs y chips + botón autocompletar
                  const tabHtml = `
                    <div style="display:flex;gap:8px;justify-content:center;margin-bottom:16px;">
                      <button id='tab-hashtags' class='swal2-tab-btn swal2-tab-active' style='padding:6px 16px;border-radius:8px 8px 0 0;background:#a78bfa;color:#fff;font-weight:bold;border:none;cursor:pointer;'>Hashtags</button>
                      <button id='tab-keywords' class='swal2-tab-btn' style='padding:6px 16px;border-radius:8px 8px 0 0;background:#e0e7ff;color:#3b82f6;font-weight:bold;border:none;cursor:pointer;'>Palabras clave</button>
                      <button id='tab-users' class='swal2-tab-btn' style='padding:6px 16px;border-radius:8px 8px 0 0;background:#e0ffe0;color:#16a34a;font-weight:bold;border:none;cursor:pointer;'>Cuentas</button>
                    </div>
                    <div id='tab-content-hashtags'>
                      ${(parsed.hashtags||[]).map((h: string) => `<span style='display:inline-block;margin:4px 4px 4px 0;padding:4px 10px;border-radius:999px;background:#a78bfa;color:#fff;font-weight:500;font-size:0.95rem;'>${h}</span>`).join('') || '<span style="color:#888">Sin hashtags</span>'}
                    </div>
                    <div id='tab-content-keywords' style='display:none;'>
                      ${(parsed.keywords||[]).map((k: string) => `<span style='display:inline-block;margin:4px 4px 4px 0;padding:4px 10px;border-radius:999px;background:#dbeafe;color:#2563eb;font-weight:500;font-size:0.95rem;'>${k}</span>`).join('') || '<span style="color:#888">Sin palabras clave</span>'}
                    </div>
                    <div id='tab-content-users' style='display:none;'>
                      ${(parsed.usernames||[]).map((u: string) => `<span style='display:inline-block;margin:4px 4px 4px 0;padding:4px 10px;border-radius:999px;background:#bbf7d0;color:#15803d;font-weight:500;font-size:0.95rem;'>${u}</span>`).join('') || '<span style="color:#888">Sin cuentas</span>'}
                    </div>
                    <div style='display:flex;justify-content:center;gap:16px;margin-top:24px;'>
                      <button id='btn-autocompletar' style='padding:10px 28px;font-size:1rem;font-weight:bold;border-radius:12px;background:#a78bfa;color:#fff;border:none;box-shadow:0 2px 8px #a78bfa22;cursor:pointer;'>Autocompletar</button>
                      <button id='btn-cerrar' style='padding:10px 28px;font-size:1rem;font-weight:bold;border-radius:12px;background:#a78bfa;color:#fff;border:none;box-shadow:0 2px 8px #a78bfa22;cursor:pointer;'>Cerrar</button>
                    </div>
                    <style>
                      .swal2-tab-btn.swal2-tab-active { filter: brightness(1.1) drop-shadow(0 2px 6px #a78bfa33); }
                    </style>
                  `;
                  await MySwal.fire({
                    title: 'Respuesta de Scrapetok AI',
                    html: tabHtml,
                    background: '#fff',
                    showConfirmButton: false,
                    showCancelButton: false,
                    customClass: {
                      popup: 'rounded-2xl shadow-2xl p-8 max-w-lg',
                      title: 'text-2xl text-purple-700 mb-2',
                    },
                    didOpen: () => {
                      // Tabs interactividad
                      const $ = (s: string) => document.querySelector(s) as HTMLElement | null;
                      let currentTab: 'hashtags' | 'keywords' | 'users' = 'hashtags';
                      const showTab = (tab: 'hashtags' | 'keywords' | 'users') => {
                        ($('#tab-content-hashtags') as HTMLElement)!.style.display = tab === 'hashtags' ? '' : 'none';
                        ($('#tab-content-keywords') as HTMLElement)!.style.display = tab === 'keywords' ? '' : 'none';
                        ($('#tab-content-users') as HTMLElement)!.style.display = tab === 'users' ? '' : 'none';
                        $('#tab-hashtags')!.classList.toggle('swal2-tab-active', tab === 'hashtags');
                        $('#tab-keywords')!.classList.toggle('swal2-tab-active', tab === 'keywords');
                        $('#tab-users')!.classList.toggle('swal2-tab-active', tab === 'users');
                        currentTab = tab;
                      };
                      $('#tab-hashtags')?.addEventListener('click', () => showTab('hashtags'));
                      $('#tab-keywords')?.addEventListener('click', () => showTab('keywords'));
                      $('#tab-users')?.addEventListener('click', () => showTab('users'));
                      // Autocompletar
                      $('#btn-autocompletar')?.addEventListener('click', () => {
                        if (currentTab === 'hashtags') {
                          handleAutocomplete('hashtags', (parsed.hashtags || []).join(', '));
                        } else if (currentTab === 'keywords') {
                          handleAutocomplete('palabras', (parsed.keywords || []).join(', '));
                        } else if (currentTab === 'users') {
                          handleAutocomplete('usuarios', (parsed.usernames || []).join(', '));
                        }
                        MySwal.close();
                      });
                      // Cerrar
                      $('#btn-cerrar')?.addEventListener('click', () => MySwal.close());
                    },
                  });
                } else {
                  MySwal.fire({
                    title: 'Respuesta de Scrapetok AI',
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
                MySwal.fire({
                  icon: 'error',
                  title: 'Error',
                  text: res.error || 'Error desconocido',
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
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        />
        {showTooltip && (
          <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-white text-purple-700 text-xs px-3 py-1 rounded-lg shadow-lg z-30 whitespace-nowrap flex flex-col items-center">
            ¡Haz clic para pedir ayuda a la IA!
            <span className="w-2 h-2 bg-white rotate-45 -mt-1 shadow-lg"></span>
          </div>
        )}
      </div>
    </div>
  </div>
) : (
  null
)}
					</div>
				</div>
			</div>
		</div>
	);
}