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
import { useNavigate } from "react-router-dom";

import { useAuthContext } from "@contexts/AuthContext";
import { adminApify } from "@services/apifyCall/adminApifyCall";
import type { AdminApifyRequest } from "@interfaces/apify-call/AdminApifyRequest";
import type { ApifyCallResponse } from "@interfaces/apify-call/ApifyCallResponse";
import { mapRawToApifyResponse } from "@interfaces/apify-call/ApifyCallResponse";
import { sendTopGlobalEmail } from "@services/TopGlobalEmail/sendEmailTG";
import type { TopGlobalesEmailRequest } from "@interfaces/send-email-topGlobales/TopGlobalesEmailRequest";

const BLUE = "#007BFF"; // un azul vivo
const PURPLE = "#FF4081"; // tu púrpura neón
export default function DashboardPage() {
	const { id: adminId, role } = useAuthContext();
	const isAdmin = role === "ADMIN";
	const [loading, setLoading] = useState(false);
	const [posts, setPosts] = useState<ApifyCallResponse[]>([]);
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
	const navigate = useNavigate();

	useEffect(() => {
		{
			const stored = localStorage.getItem("publishedData");
			if (stored) {
				const { posts, hashtagData, soundData, lastFilters } =
					JSON.parse(stored);
				setPosts(posts);
				setHashtagData(hashtagData);
				setSoundData(soundData);
				setLastFilters(lastFilters);
			}
		}
	}, []);

	const handlePublish = async () => {
		if (!lastFilters) {
			Swal.fire("Atención", "No hay datos para publicar aún.", "warning");
			return;
		}
		const payload = { posts, hashtagData, soundData, lastFilters };
		localStorage.setItem("publishedData", JSON.stringify(payload));
		const raw = localStorage.getItem("publishedData");
		if (raw) {
			const data = JSON.parse(raw);
		}

		// Enviar email a todos los usuarios con todos los posts en un solo request
		try {
			if (Array.isArray(posts) && posts.length > 0) {
				const emailReqs: TopGlobalesEmailRequest[] = posts.map((p) => ({
					adminId: Number(adminId),
					usedHashTag: p.hashtags.split(",")[0]?.replace("#", "") || "",
					datePosted: p.datePosted, // debe ser YYYY-MM-DD
					usernameTiktokAccount: p.tiktokAccountUsername,
					postURL: p.postLink,
					views: Math.round(p.views),
					likes: Math.round(p.likes),
					engagement: Number(p.engagementRate),
				}));
				await sendTopGlobalEmail(emailReqs);
			}
			Swal.fire("¡Publicado!", "Puedes ver la alerta en tu perfil.", "success").then(() => {
				navigate("/users");
			});
		} catch (error) {
			Swal.fire("Error", "Ocurrió un error al enviar los emails.", "error");
		}
	};

	const handleApify = async (filters: AdminApifyRequest) => {
		setLoading(true);
		setLastFilters(filters);
		// pop-up de carga
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
				rawPosts as Record<string, any>[]
			).map(mapRawToApifyResponse);

			setPosts(mapped);

			// vistas por hashtag
			const hMap = new Map<string, number>();
			mapped.forEach((p) =>
				p.hashtags
					.split(",")
					.map((h) => h.trim())
					.forEach((tag) => {
						if (!tag) return;
						hMap.set(tag, (hMap.get(tag) || 0) + p.views);
					}),
			);
			setHashtagData(
				Array.from(hMap, ([hashtag, views]) => ({ hashtag, views })),
			);

			// vistas por soundId
			const sMap = new Map<string, number>();
			mapped.forEach((p) =>
				sMap.set(p.soundId, (sMap.get(p.soundId) || 0) + p.views),
			);
			setSoundData(
				Array.from(sMap, ([soundId, totalViews]) => ({
					soundId,
					totalViews,
				})),
			);

			Swal.close();
		} catch (err) {
			Swal.close();
			console.error("Error adminApify:", err);
			Swal.fire("Error", "No se pudieron obtener los datos.", "error");
		} finally {
			setLoading(false);
		}
	};

	// muestra max 15 al azar
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

	// Para cada bloque de 6 videos, mostrar top 3 por vistas
	// aquellos que lo incluyan y muestra su top 3 más virales.
	const renderCards = () => {
		if (!lastFilters) return null;
		// Unifica hashtags y palabras clave
		const hashtags = lastFilters.hashtags
			? lastFilters.hashtags.split(",").map((t) => t.trim()).filter(Boolean)
			: [];
		const keyWords = lastFilters.keyWords
			? lastFilters.keyWords.split(",").map((t) => t.trim()).filter(Boolean)
			: [];
		const terms = [...hashtags, ...keyWords];

		return (
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
				{terms.map((term) => {
					// Filtra posts que incluyan el término en hashtags o en la descripción
					const candidates = posts.filter((p) =>
						p.hashtags
							.split(",")
							.map((h) => h.trim().replace(/^#/, "").toLowerCase())
							.includes(term.replace(/^#/, "").toLowerCase()) ||
						(p.hashtags && p.hashtags.toLowerCase().includes(term.replace(/^#/, "").toLowerCase()))
					);
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
										key={`${p.postCode}-${idx}`}
										className="border-b border-purple-100 dark:border-violet-600 pb-3 last:border-none w-full"
									>
										<a
											href={p.postLink}
											target="_blank"
											className="font-bold text-gray-900 hover:underline text-base"
										>
											{p.postCode}
										</a>
										<p className="text-xs text-gray-800 mt-1">
											📅 {p.datePosted} | 👤 {p.tiktokAccountUsername}
										</p>
										<div className="mt-2 flex gap-4 text-xs text-gray-900">
											<span>👁️ {p.views.toLocaleString()}</span>
											<span>❤️ {p.likes.toLocaleString()}</span>
											<span>📊 {p.engagementRate}%</span>
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

	return (
		<div className="min-h-screen bg-gradient-to-br from-white to-pink-100 dark:bg-gradient-to-br dark:from-violet-900 dark:to-black text-gray-900 dark:text-white p-6 space-y-6">
			<h1 className="text-5xl font-bold mt-2 text-center drop-shadow-[0_4px_24px_rgba(127,0,255,0.15)] animate-fade-in text-purple-700 dark:text-white">
				Dashboard ScrapeTok
			</h1>
			<h2 className="text-base font-light mb-1 text-center text-gray-600 dark:text-white flex items-center justify-center gap-2 animate-fade-in">
				<span className="text-2xl animate-bounce">🔥</span>
				¿Buscas lo más trending? seleccionamos para ti los 3 vídeos más virales de cada hashtag a nivel global
				<span className="text-2xl animate-pulse">🌍</span>
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
							className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-bold shadow-lg hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-pink-400 animate-pulse"
							onClick={handlePublish}
						>
							Publicar
						</button>
						<button
							className="px-6 py-3 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white font-bold shadow hover:bg-gray-300 dark:hover:bg-gray-600 transition-all focus:outline-none"
							onClick={() => setLastFilters({ ...lastFilters, hashtags: '', keyWords: '' })}
						>
							Limpiar
						</button>
					</div>
				</div>
			)}

			{posts.length > 0 && renderCards()}

			{hashtagData.length + soundData.length === 0 && !loading ? (
				<div className="text-center text-gray-700 dark:text-gray-100 mt-12">
					No data available yet.
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
					{renderBar(
						"hashtags",
						"Vistas vs Hashtag",
						// si está full screen, mostrar hasta 12; si no, hasta 6
						hashtagData.slice(0, fullScreenChart === "hashtags" ? 10 : 6),
						"hashtag",
						"views",
						BLUE,
					)}
					{renderBar(
						"sounds",
						"Total Views vs Sound ID",
						// si está full screen, mostrar hasta 8; si no, hasta 4
						soundData.slice(0, fullScreenChart === "sounds" ? 6 : 3),
						"soundId",
						"totalViews",
						PURPLE,
					)}
				</div>
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
		</div>
	);
}
