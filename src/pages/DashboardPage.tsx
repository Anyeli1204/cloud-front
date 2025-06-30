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
import chunk from "lodash/chunk";

import { useAuthContext } from "@contexts/AuthContext";
import { adminApify } from "@services/apifyCall/adminApifyCall";
import type { AdminApifyRequest } from "@interfaces/apify-call/AdminApifyRequest";
import type { ApifyCallResponse } from "@interfaces/apify-call/ApifyCallResponse";
import { mapRawToApifyResponse } from "@interfaces/apify-call/ApifyCallResponse";
import { ApifyFilterForm } from "@components/ApifyFilterForm";

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

	useEffect(() => {
		if (!isAdmin) {
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
	}, [isAdmin]);

	const handlePublish = () => {
		if (!lastFilters) {
			Swal.fire("Atención", "No hay datos para publicar aún.", "warning");
			return;
		}
		const payload = { posts, hashtagData, soundData, lastFilters };
		localStorage.setItem("publishedData", JSON.stringify(payload));
		const raw = localStorage.getItem("publishedData");
		if (raw) {
			const data = JSON.parse(raw);
			console.log("Datos publicados:", data);
		}
		Swal.fire("Publicado", "Los datos se guardaron correctamente.", "success");
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
			console.log(mapped);

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
			<div key={key} className="relative bg-white rounded shadow p-4">
				<div className="flex justify-between items-center mb-2">
					<h3 className="font-semibold">{title}</h3>
					<button
						onClick={() =>
							setFullScreenChart((prev) => (prev === key ? null : key))
						}
						className="p-1 rounded hover:bg-gray-100"
					>
						<Maximize2 size={18} />
					</button>
				</div>
				<ResponsiveContainer width="100%" height={250}>
					<BarChart data={toPlot as any}>
						<XAxis dataKey={xKey as string} />
						<YAxis />
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
		const terms = lastFilters.hashtags
			? lastFilters.hashtags
					.split(",")
					.map((t) => t.trim())
					.filter(Boolean)
			: lastFilters.keyWords
				? lastFilters.keyWords
						.split(",")
						.map((t) => t.trim())
						.filter(Boolean)
				: [];

		return (
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
				{terms.map((term) => {
					// Filtra todos los posts que incluyan este término
					const candidates = posts.filter((p) =>
						p.hashtags
							.split(",")
							.map((h) => h.trim())
							.includes(term),
					);
					if (candidates.length === 0) return null;
					// Ordena y toma top 3
					const top3 = candidates.sort((a, b) => b.views - a.views).slice(0, 3);

					return (
						<div key={term} className="bg-white rounded-lg shadow p-4">
							<h4 className="text-xl font-semibold mb-4">🎯 {term}</h4>
							<ul className="space-y-4">
								{top3.map((p) => (
									<li
										key={p.postCode}
										className="border-b pb-3 last:border-none"
									>
										<a
											href={p.postLink}
											target="_blank"
											className="font-medium text-blue-600 hover:underline"
										>
											{p.postCode}
										</a>
										<p className="text-sm text-gray-600">
											📅 {p.datePosted} | 👤 {p.tiktokAccountUsername}
										</p>
										<div className="mt-2 flex gap-4 text-sm">
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
		<div className="min-h-screen bg-gradient-to-br from-white to-pink-100 p-6 space-y-6">
			<h1 className="text-5xl font-bold mt-2 text-center">
				Dashboard ScrapeTok
			</h1>
			<h2 className="text-base font-light mb-1 text-center text-gray-600 ">
				🔥 ¿Buscas lo más trending? seleccionamos para ti los 3 vídeos más
				virales de cada hashtag a nivel global 🌎
			</h2>

			{/* Si es ADMIN, muestro el form; si no, solo le enseño lo publicado */}
			{isAdmin ? (
				<div className="mt-8">
					<ApifyFilterForm
						onSubmit={handleApify}
						loading={loading}
						onPublish={handlePublish}
					/>
				</div>
			) : null}

			{posts.length > 0 && renderCards()}

			{hashtagData.length + soundData.length === 0 && !loading ? (
				<div className="text-center text-gray-600 mt-12">
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
					<div className="relative bg-white rounded-xl shadow-xl w-11/12 h-5/6 p-6 overflow-auto">
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
