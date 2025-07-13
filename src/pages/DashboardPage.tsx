import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	Tooltip,
	ResponsiveContainer,
	Legend,
} from "recharts";
import { Maximize2 } from "lucide-react";

import { useAuthContext } from "@contexts/AuthContext";
import { adminApify } from "@services/apifyCall/adminApifyCall";
import type { AdminApifyRequest } from "@interfaces/apify-call/AdminApifyRequest";
import type { ApifyCallResponse } from "@interfaces/apify-call/ApifyCallResponse";
import { mapRawToApifyResponse } from "@interfaces/apify-call/ApifyCallResponse";
import { sendTopGlobalEmail } from "@services/TopGlobalEmail/sendEmailTG";
import type { TopGlobalesEmailRequest } from "@interfaces/send-email-topGlobales/TopGlobalesEmailRequest";
import type { DashboardInfo } from "@interfaces/dashboard/DashboardInfo";
import type { TopGlobalEmailDTO } from "@interfaces/send-email-topGlobales/TopGlobalEmailDTO";
import { getDashboardInfo } from "@services/dashboard/getDashboardInfo";

// Tipo unión para manejar tanto datos de scraping como datos publicados
type PostData = ApifyCallResponse | DashboardInfo;

// Funciones helper para acceder a propiedades de manera segura
const isApifyData = (post: PostData): post is ApifyCallResponse => {
	return 'hashtags' in post && 'postCode' in post;
};

const getPostId = (post: PostData): string => {
	return isApifyData(post) ? post.postCode : post.postId;
};

const getPostLink = (post: PostData): string => {
	return isApifyData(post) ? post.postLink : post.postURL;
};

const getUsername = (post: PostData): string => {
	return isApifyData(post) ? post.tiktokAccountUsername : post.usernameTiktokAccount;
};

const getHashtags = (post: PostData): string => {
	return isApifyData(post) ? post.hashtags : post.usedHashTag;
};

const getEngagement = (post: PostData): number => {
	return isApifyData(post) ? post.engagementRate : post.engagement;
};

const BLUE = "#007BFF"; 
const PURPLE = "#FF4081"; 
export default function DashboardPage() {
	const { id: adminId, role } = useAuthContext();
	const isAdmin = role === "ADMIN";
	const [loading, setLoading] = useState(false);
	const [posts, setPosts] = useState<PostData[]>([]);
	const [lastFilters, setLastFilters] = useState<AdminApifyRequest | null>(
		null,
	);

	const [hashtagData, setHashtagData] = useState<
		{ hashtag: string; views: number }[]
	>([]);
	const [soundData, setSoundData] = useState<
		{ soundId: string; totalViews: number }[]
	>([]);
	const [fullScreenChart, setFullScreenChart] = useState<string | null>(null);
	const [showSuccessAlert, setShowSuccessAlert] = useState(false);
	const [showPublishedList, setShowPublishedList] = useState(false);
	const [publishedPosts, setPublishedPosts] = useState<TopGlobalEmailDTO[]>([]);

	useEffect(() => {
		const stored = localStorage.getItem("publishedData");
		if (stored) {
			const { posts, hashtagData, soundData, lastFilters } =
				JSON.parse(stored);
			setPosts(Array.isArray(posts) ? posts : []);
			setHashtagData(Array.isArray(hashtagData) ? hashtagData : []);
			setSoundData(Array.isArray(soundData) ? soundData : []);
			setLastFilters(lastFilters || null);
		}
	}, []);

	const handlePublish = async () => {
		if (!lastFilters) {
			Swal.fire("Atención", "No hay datos para publicar aún.", "warning");
			return;
		}

		try {
			if (Array.isArray(posts) && posts.length > 0) {
				// Obtener solo los datos que se muestran en las tarjetas (top 3 por hashtag/palabra clave)
				const emailReqs: TopGlobalesEmailRequest[] = [];
				
				// Obtener los términos (hashtags y palabras clave)
				const hashtags = lastFilters.hashtags
					? lastFilters.hashtags.split(",").map((t) => t.trim()).filter(Boolean)
					: [];
				const keyWords = lastFilters.keyWords
					? lastFilters.keyWords.split(",").map((t) => t.trim()).filter(Boolean)
					: [];
				const terms = [...hashtags, ...keyWords];

				// Para cada término, obtener solo los top 3 videos
				terms.forEach((term) => {
					const candidates = posts.filter((p: PostData) => {
						const postHashtags = getHashtags(p);
						return (
							postHashtags &&
							postHashtags
								.split(",")
								.map((h: string) => h.trim().replace(/^#/, "").toLowerCase())
								.includes(term.replace(/^#/, "").toLowerCase())
						);
					});

					// Tomar solo los top 3 videos con más vistas
					const top3 = candidates
						.sort((a, b) => b.views - a.views)
						.slice(0, 3);

					// Convertir a formato TopGlobalesEmailRequest
					top3.forEach((p) => {
						emailReqs.push({
							adminId: Number(adminId),
							usedHashTag: term.startsWith("#") ? term : `#${term}`,
							postId: getPostId(p), // <--- AGREGADO
							datePosted: p.datePosted.split('T')[0], // <--- SOLO FECHA
							usernameTiktokAccount: getUsername(p),
							postURL: getPostLink(p),
							views: Math.round(p.views),
							likes: Math.round(p.likes),
							engagement: Number(getEngagement(p)),
						});
					});
				});

				// Enviar solo los datos de las tarjetas
				if (emailReqs.length > 0) {
					await sendTopGlobalEmail(emailReqs);
					
					// Guardar en localStorage solo los datos de las tarjetas
					const cardData = { 
						posts: emailReqs.map(req => ({
							usedHashTag: req.usedHashTag,
							postId: req.postId, // <--- AGREGADO
							datePosted: req.datePosted,
							usernameTiktokAccount: req.usernameTiktokAccount,
							postURL: req.postURL,
							views: req.views,
							likes: req.likes,
							engagement: req.engagement
						})),
						lastFilters 
					};
					localStorage.setItem("publishedData", JSON.stringify(cardData));
				}
			}
			
			setShowPublishedList(true);
			setShowSuccessAlert(true);
			await fetchPublishedPosts(); // <--- Agrega esta línea aquí
		} catch (error) {
			console.error("Error al enviar emails o al navegar:", error);
			Swal.fire("Error", "Ocurrió un error inesperado. Revisa la consola para más detalles.", "error");
		}
	};
	const handleApify = async (filters: AdminApifyRequest) => {
		setLoading(true);
		setLastFilters(filters);
		Swal.fire({
			title: "Cargando…",
			html: "Obteniendo datos de TikTok, por favor espera.",
			allowOutsideClick: false,
			didOpen: () => Swal.showLoading(),
		});

		try {
			const [rawPosts] = await adminApify({
				...filters,
				adminId: Number(adminId),
			});
			const mapped: ApifyCallResponse[] = (
				rawPosts as unknown as Record<string, unknown>[]
			).map(mapRawToApifyResponse);

			setPosts(mapped);
			setShowPublishedList(false);
			const hMap = new Map<string, number>();
			mapped.forEach((p) =>
				p.hashtags
					.split(",")
					.map((h) => h.trim())
					.forEach((tag) => {
						if (!tag) return;
						hMap.set(tag, (hMap.get(tag) || 0) + p.views);
					})
			);
			setHashtagData(Array.from(hMap, ([hashtag, views]) => ({ hashtag, views })));

			const sMap = new Map<string, number>();
			mapped.forEach((p) =>
				sMap.set(p.soundId, (sMap.get(p.soundId) || 0) + p.views)
			);
			setSoundData(Array.from(sMap, ([soundId, totalViews]) => ({ soundId, totalViews })));

			Swal.close();
		} catch (err) {
			Swal.close();
			console.error("Error adminApify:", err);
			Swal.fire("Error", "No se pudieron obtener los datos.", "error");
		} finally {
			setLoading(false);
		}
	};

	const fetchPublishedPosts = async () => {
		try {
			const data = await getDashboardInfo();
			setPublishedPosts(Array.isArray(data) ? data : []);
		} catch (error) {
			setPublishedPosts([]);
			console.error("Error al obtener datos publicados:", error);
		}
	};

	useEffect(() => {
		if (showPublishedList) {
			fetchPublishedPosts();
		}
		// eslint-disable-next-line
	}, [showPublishedList]);

	const sample = <T,>(arr: T[]): T[] =>
		arr.length <= 15
			? arr
			: [...arr].sort(() => Math.random() - 0.5).slice(0, 15);

	const renderBar = <T,>(
		key: string,
		title: string,
		data: T[],
		xKey: keyof T,
		barKey: keyof T,
		color: string,
	) => {
		const toPlot = sample(data);
		return (
			<div
				key={key}
				className="relative bg-white rounded shadow p-4 dark:bg-white/80"
				style={{ height: fullScreenChart === key ? "92%" : "auto" }}
			>
				<div className="flex justify-between items-center mb-2">
					<h3 className="font-semibold text-gray-900 flex items-center gap-2">{title}</h3>
					<button
						onClick={() =>
							setFullScreenChart((prev) => (prev === key ? null : key))
						}
						className="p-1 rounded hover:bg-gray-100"
					>
						<Maximize2 size={18} className="text-gray-900 dark:text-white" />
					</button>
				</div>
				<ResponsiveContainer
					width="100%"
					height={fullScreenChart === key ? "92%" : 250}
				>
					<BarChart data={toPlot as T[]}>
						<XAxis dataKey={xKey as string} />
						<YAxis
							width={95}
							tickFormatter={(value: number | undefined) =>
								typeof value === "number" ? value.toLocaleString() : ""
							}
						/>
						<Tooltip />
						<Legend />
						<Bar dataKey={barKey as string} fill={color} />
					</BarChart>
				</ResponsiveContainer>
			</div>
		);
	};

	const renderCards = () => {
		if (!Array.isArray(posts) || posts.length === 0) return null;

		// Detecta el tipo de dato
		const isScrapeData = 'hashtags' in posts[0];

		// Obtén los términos a mostrar
		let terms: string[] = [];
		if (isScrapeData) {
			const hashtags = lastFilters?.hashtags
				? lastFilters.hashtags.split(",").map((t) => t.trim()).filter(Boolean)
				: [];
			const keyWords = lastFilters?.keyWords
				? lastFilters.keyWords.split(",").map((t) => t.trim()).filter(Boolean)
				: [];
			terms = [...hashtags, ...keyWords];
		} else {
			terms = Array.from(new Set(posts.map((p: PostData) => getHashtags(p)))).filter(Boolean);
		}

		return (
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
				{terms.map((term) => {
					const candidates = posts.filter((p: PostData) => {
						if (isScrapeData) {
							return (
								getHashtags(p) &&
								getHashtags(p)
									.split(",")
									.map((h: string) => h.trim().replace(/^#/, "").toLowerCase())
									.includes(term.replace(/^#/, "").toLowerCase())
							);
						} else {
							return (
								getHashtags(p) &&
								getHashtags(p).replace(/^#/, "").toLowerCase() === term.replace(/^#/, "").toLowerCase()
							);
						}
					});
					if (candidates.length === 0) return null;
					const top3 = candidates.sort((a, b) => b.views - a.views).slice(0, 3);

					return (
						<div
							key={term}
							className="bg-gradient-to-br from-white via-gray-50 to-gray-200 dark:bg-none dark:bg-white/80 border border-transparent dark:border-white/30 rounded-3xl shadow-2xl p-6 flex flex-col items-start transition-all duration-300"
						>
							<h4 className="text-lg font-semibold mb-3 uppercase tracking-wide flex items-center gap-2 text-gray-900">
								<span className="text-2xl text-gray-900">🎯</span>
								{term.startsWith("#") ? (
									<span className="inline-block bg-purple-100 dark:bg-purple-200 text-purple-800 font-bold rounded-full px-4 py-1 text-base shadow-sm uppercase tracking-wide">
										#{term.replace(/^#/, "").toUpperCase()}
									</span>
								) : (
									<span className="inline-block bg-blue-100 dark:bg-blue-200 text-blue-800 font-semibold rounded-full px-4 py-1 text-base shadow-sm uppercase tracking-wide flex items-center gap-1">
										<svg className="inline h-5 w-5 text-blue-800 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
											<circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" fill="none"/>
											<line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
										</svg>
										{term.toUpperCase()}
									</span>
								)}
							</h4>
							<ul className="space-y-4 w-full">
								{top3.map((p, idx) => (
									<li
										key={`${getPostId(p)}-${idx}`}
										className="border-b border-purple-100 dark:border-violet-600 pb-3 last:border-none w-full"
									>
										<a
											href={getPostLink(p)}
											target="_blank"
											className="font-bold text-gray-900 hover:underline text-base"
										>
											{getPostId(p)}
										</a>
										<p className="text-xs text-gray-800 mt-1">
											📅 {p.datePosted} | 👤 {getUsername(p)}
										</p>
										<div className="mt-2 flex gap-4 text-xs text-gray-900">
											<span>👁️ {p.views.toLocaleString()}</span>
											<span>❤️ {p.likes.toLocaleString()}</span>
											<span>📊 {getEngagement(p)}%</span>
										</div>
									</li>
								))}
							</ul>
						</div>
					);
				})}
			</div>
		);
	};

	const renderPublishedCards = () => {
		if (!Array.isArray(publishedPosts) || publishedPosts.length === 0) {
			return <div className="text-center mt-12">No hay datos publicados.</div>;
		}
		// Palabras clave/hashtags buscados
		const scrapedTags = lastFilters?.hashtags
			? lastFilters.hashtags.split(",").map((t) => t.trim()).filter(Boolean)
			: [];

		return scrapedTags.map((tag) => {
			// Filtra los videos que correspondan a ese tag
			const group = publishedPosts.filter((p: PostData) => {
				// El backend te envía el campo usedHashTag para cada video
				const postTag = getHashtags(p);
				return postTag.replace(/^#/, "").toLowerCase() === tag.replace(/^#/, "").toLowerCase();
			});
			if (!group.length) return null;
			return (
				<div key={tag} className="bg-white/80 dark:bg-white/80 rounded-3xl shadow-2xl p-8">
					<div className="flex items-center gap-2 mb-4">
						<span className="text-2xl">🎯</span>
						<span className="bg-purple-200 text-purple-800 font-bold rounded-full px-4 py-1 text-base shadow-sm uppercase tracking-wide">
							{`#${tag}`.toUpperCase()}
						</span>
					</div>
					{group.slice(0, 3).map((p: PostData, idx: number) => (
						<div key={getPostId(p) || idx} className="mb-8 last:mb-0">
							<div className="font-extrabold text-lg mb-1 text-gray-900 dark:text-white">
								{getPostId(p)}
							</div>
							<div className="flex items-center gap-2 text-gray-700 dark:text-gray-200 text-sm mb-1">
								<span>📅 {p.datePosted}</span>
								<span>| 👤 {getUsername(p)}</span>
							</div>
							<div className="flex items-center gap-6 text-lg font-semibold text-gray-900 dark:text-white">
								<span>👁️ {p.views?.toLocaleString?.() || p.views}</span>
								<span>❤️ {p.likes?.toLocaleString?.() || p.likes}</span>
								<span>📊 {(getEngagement(p) * 100).toFixed(2)}%</span>
							</div>
							<hr className="my-4 border-purple-200 dark:border-violet-600" />
						</div>
					))}
				</div>
			);
		});
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-white to-pink-100 dark:bg-gradient-to-br dark:from-violet-900 dark:to-black text-gray-900 dark:text-white p-6 space-y-6 mt-8">
			{/* Título principal con degradado morado más oscuro en modo claro y pastel en modo oscuro */}
			<h1
				className="text-5xl md:text-5xl font-extrabold text-center mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-900 via-purple-800 to-purple-900 dark:from-pink-200 dark:via-purple-200 dark:to-blue-200"
				style={{ fontFamily: 'Nunito, sans-serif' }}
			>
				Dashboard ScrapeTok
			</h1>
			<h2 className="mb-1 text-center animate-fade-in">
				<div className="flex items-center justify-center gap-2 mb-2 w-full">
					<span className="text-base md:text-lg">🧠</span>
					<span
						className="text-lg md:text-2xl font-extrabold drop-shadow-sm dark:text-white text-gray-900"
						style={{ fontFamily: 'Montserrat, Nunito, sans-serif' }}
					>
						Lo trending, al instante. Lo relevante, al alcance.
					</span>
					<span className="text-base md:text-lg">📊</span>
				</div>
				<span
					className="text-xs md:text-sm font-semibold w-full text-center max-w-3xl mx-auto block dark:text-gray-200 text-gray-800"
					style={{ fontFamily: 'Nunito, Montserrat, sans-serif' }}
				>
					🎬 Accede a los videos, hashtags, sonidos y métricas que están marcando el ritmo digital global en TikTok 🌎
				</span>
			</h2>

			{/* Caja de filtros mejorada */}
			{isAdmin && (
				<div className="w-full max-w-5xl mx-auto mt-8 p-8 rounded-3xl shadow-2xl bg-white/80 dark:bg-white/20 backdrop-blur-md flex flex-col md:flex-row items-center gap-4 animate-fade-in">
					<div className="flex items-center w-full md:w-1/2 bg-gray-100 dark:bg-gray-800 rounded-xl px-3 py-2 shadow-inner gap-2">
						<span className="text-lg text-gray-400">#</span>
						<input
							className="bg-transparent flex-1 outline-none text-base text-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 placeholder:text-sm"
							placeholder="#hashtags (separados por comas)"
							value={lastFilters?.hashtags || ""}
							onChange={e => setLastFilters({ ...lastFilters, hashtags: e.target.value })}
						/>
					</div>
					<div className="flex items-center w-full md:w-1/2 bg-gray-100 dark:bg-gray-800 rounded-xl px-3 py-2 shadow-inner gap-2">
						<span className="text-lg text-gray-400">
							{/* Icono de lupa simple */}
							<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" fill="none"/>
								<line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
							</svg>
						</span>
						<input
							className="bg-transparent flex-1 outline-none text-base text-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 placeholder:text-sm"
							placeholder="Palabras clave (separadas por comas)"
							value={lastFilters?.keyWords || ""}
							onChange={e => setLastFilters({ ...lastFilters, keyWords: e.target.value })}
						/>
					</div>
					<div className="flex gap-2 mt-4 md:mt-0">
						<button
							className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold shadow-lg hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
							onClick={() => lastFilters && handleApify(lastFilters)}
						>
							Buscar
						</button>
						<button
							className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold shadow-lg hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-pink-400"
							onClick={handlePublish}
						>
							Publicar
						</button>
						<button
							className="px-6 py-3 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white font-bold shadow hover:bg-gray-300 dark:hover:bg-gray-600 transition-all focus:outline-none"
							onClick={async () => {
								const result = await Swal.fire({
									title: '¿Estás seguro?',
									text: 'Esta acción limpiará todos los datos y filtros actuales. ¿Deseas continuar?',
									icon: 'warning',
									showCancelButton: true,
									confirmButtonText: 'Sí, limpiar',
									cancelButtonText: 'Cancelar',
									confirmButtonColor: '#6366f1',
									cancelButtonColor: '#d1d5db',
									reverseButtons: true
								});
								if (result.isConfirmed) {
									setPosts([]);
									setHashtagData([]);
									setSoundData([]);
									setLastFilters(null);
									localStorage.removeItem('publishedData');
									Swal.fire('¡Limpieza exitosa!', 'Los datos han sido eliminados.', 'success');
								}
							}}
						>
							Limpiar
						</button>
					</div>
				</div>
			)}

			{posts.length === 0 ? (
				<div className="text-center text-gray-700 dark:text-gray-100 mt-12">
					No data yet.
				</div>
			) : (
				<>
					{showPublishedList ? (
						<div className="w-full grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
							{renderPublishedCards()}
						</div>
					) : renderCards()}
					{hashtagData.length + soundData.length === 0 && !loading && (
						<div className="text-center text-gray-700 dark:text-gray-100 mt-12">
							No data available yet.
						</div>
					)}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
						{renderBar(
							"hashtags",
							"Vistas vs Hashtag",
							hashtagData.slice(0, fullScreenChart === "hashtags" ? 10 : 6),
							"hashtag",
							"views",
							BLUE,
						)}
						{renderBar(
							"sounds",
							"Total Views vs Sound ID",
							soundData.slice(0, fullScreenChart === "sounds" ? 6 : 3),
							"soundId",
							"totalViews",
							PURPLE,
						)}
					</div>
				</>
			)}

			{fullScreenChart && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
					<div className="relative bg-white rounded-xl shadow-xl w-11/12 h-5/6 p-6 overflow-auto dark:bg-white/80">
						<button
							className="absolute top-4 right-4 p-2 rounded hover:bg-gray-100"
							onClick={() => setFullScreenChart(null)}
						>
							✕
						</button>
						{fullScreenChart === "hashtags" &&
							renderBar(
								"hashtags",
								"Vistas vs Hashtag",
								// ampliada: hasta 12
								hashtagData.slice(0, 10),
								"hashtag",
								"views",
								BLUE,
							)}
						{fullScreenChart === "sounds" &&
							renderBar(
								"sounds",
								"Total Views vs Sound ID",
								// ampliada: hasta 8
								soundData.slice(0, 6),
								"soundId",
								"totalViews",
								PURPLE,
							)}
					</div>
				</div>
			)}
			{showSuccessAlert && (
				<div className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50 bg-black/40">
					<div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 max-w-md w-full relative flex flex-col items-center">
						<button
							className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-2xl font-bold focus:outline-none"
							onClick={() => setShowSuccessAlert(false)}
							aria-label="Cerrar alerta"
						>
							×
						</button>
						<div className="flex flex-col items-center">
							<svg className="w-16 h-16 mb-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12l2 2l4-4" />
							</svg>
							<h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">¡Publicado!</h2>
							<p className="text-gray-700 dark:text-gray-200 text-center">Puedes ver la alerta en tu perfil.</p>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
