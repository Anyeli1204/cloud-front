// src/pages/DatabaseQueriesPage.tsx
import React, { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import { Maximize2 } from "lucide-react";
import { downloadExcel } from "@services/excelService/ExcelFetch";

import type { UserDBQueryRequest } from "@interfaces/db-queries/UserDBQueryRequest";
import type {
	UserDbPost,
	DbMetric,
	MetricByHashtag,
	MetricByUsername,
	MetricByDayOfWeek,
} from "@interfaces/db-queries/UserDbQueryResponse";
import { dbQueries } from "@services/db-queries/UserDbQueries";
import html2canvas from "html2canvas";

import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	Tooltip,
	ResponsiveContainer,
	Legend,
} from "recharts";

import { FilterPanelDb } from "@components/FilterPanelDb";
import { PostDetailModal } from "@components/PostDetailModal";
import { TikTokProfileModal } from "@components/TikTokProfileModal";
import { getTikTokProfile } from "@services/tiktokProfile/tiktokProfileService";

const PAGE_WINDOW_SIZE = 10;

export default function DatabaseQueriesPage() {
	const chartRefs = useRef<Record<string, HTMLDivElement | null>>({
		"p-views": null,
		"p-likes": null,
		"p-eng": null,
		"p-int": null,
		"d-lv": null,
		"d-eng": null,
	});

	const [filters, setFilters] = useState<UserDBQueryRequest | null>(null);
	const [posts, setPosts] = useState<UserDbPost[]>([]);
	const [metrics, setMetrics] = useState<DbMetric[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [fullScreenChart, setFullScreenChart] = useState<string | null>(null);
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [selectedPost, setSelectedPost] = useState<UserDbPost | null>(null);
	const [loadingExcel, setLoadingExcel] = useState(false);
	const [selectedUsername, setSelectedUsername] = useState<string | null>(null);
	const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
	const [profileAvatars, setProfileAvatars] = useState<Record<string, string>>(
		{},
	);

	const handleDownloadChartImage = async (key: string, fileName: string) => {
		const graphDiv = chartRefs.current[key];
		if (!graphDiv) return;

		const now = new Date();
		await html2canvas(graphDiv, {
			backgroundColor: "#fff",
			scale: 3,
			useCORS: true,
			windowWidth: graphDiv.scrollWidth * 3,
			windowHeight: graphDiv.scrollHeight * 3,
		}).then((canvas) => {
			const link = document.createElement("a");
			link.href = canvas.toDataURL("image/png", 1.0);
			const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}_${String(now.getHours()).padStart(2, "0")}-${String(now.getMinutes()).padStart(2, "0")}-${String(now.getSeconds()).padStart(2, "0")}`;
			link.download = `${fileName}_${timestamp}.png`;
			link.click();
		});
	};
	// Función para obtener fotos de perfil (optimizada con Promise.all)
	const fetchProfileAvatars = async (usernames: string[]) => {
		console.log("Iniciando carga de avatars para:", usernames);

		// Crear promesas para todos los usernames en paralelo
		const avatarPromises = usernames.map(async (username) => {
			try {
				const profile = await getTikTokProfile(username);
				if (profile.avatarLarger) {
					console.log(
						`Avatar obtenido para ${username}:`,
						profile.avatarLarger,
					);
					return { username, avatar: profile.avatarLarger };
				}
			} catch {
				console.log(`No se pudo obtener avatar para ${username}`);
			}
			return null;
		});

		// Esperar todas las promesas en paralelo
		const results = await Promise.all(avatarPromises);
		const newAvatars: Record<string, string> = {};

		results.forEach((result) => {
			if (result) {
				newAvatars[result.username] = result.avatar;
			}
		});

		if (Object.keys(newAvatars).length > 0) {
			console.log("Avatars obtenidos:", newAvatars);
			setProfileAvatars((prev) => ({ ...prev, ...newAvatars }));
		}
	};

	useEffect(() => {
		if (!filters) {
			setPosts([]);
			setMetrics([]);
			return;
		}
		(async () => {
			try {
				setLoading(true);
				Swal.fire({
					title: "Cargando…",
					html: "Obteniendo datos de TikTok, por favor espera.",
					allowOutsideClick: false,
					didOpen: () => Swal.showLoading(),
				});

				const [postList, metricList] = await dbQueries(filters);
				setPosts(postList);
				setMetrics(metricList);
				setError(null);
				setTotalPages(Math.ceil(postList.length / PAGE_WINDOW_SIZE));

				// Obtener fotos de perfil para todos los usuarios únicos
				const uniqueUsernames = [
					...new Set(postList.map((item) => item.usernameTiktokAccount)),
				];
				console.log("Usernames únicos encontrados:", uniqueUsernames);
				fetchProfileAvatars(uniqueUsernames);
			} catch (e: unknown) {
				console.error(e);
				setError((e as Error).message || "Error al solicitar datos");
				setPosts([]);
				setMetrics([]);
			} finally {
				setLoading(false);
				Swal.close();
			}
		})();
	}, [filters]);

	const handleDownloadExcel = async () => {
		if (!posts || posts.length === 0) {
			await Swal.fire({
				icon: "warning",
				title: "No hay datos",
				text: "Primero debes ejecutar una consulta.",
				confirmButtonColor: "#8B5CF6",
			});
			return;
		}
		setLoadingExcel(true);
		try {
			const requestBody = posts.map((item) => ({
				postCode: item.postId,
				tiktokAccountUsername: item.usernameTiktokAccount,
				postLink: item.postURL,
				datePosted: item.datePosted,
				timePosted: item.hourPosted,
				hashtags: item.hashtags,
				numberOfHashtags: item.numberHashtags,
				views: item.views,
				likes: item.likes,
				comments: item.comments,
				interactions: item.totalInteractions,
				engagementRate: item.engagement,
				reposted: item.reposts,
				saves: item.saves,
				regionOfPosting: item.regionPost,
				soundId: item.soundId,
				soundUrl: item.soundURL,
				trackingDate: item.dateTracking,
				trackingTime: item.timeTracking,
				user: item.userId,
			}));
			const blob = await downloadExcel(requestBody);
			const url = window.URL.createObjectURL(blob);
			const now = new Date();
			const timestamp =
				now.getFullYear() +
				"-" +
				String(now.getMonth() + 1).padStart(2, "0") +
				"-" +
				String(now.getDate()).padStart(2, "0") +
				"_" +
				String(now.getHours()).padStart(2, "0") +
				"-" +
				String(now.getMinutes()).padStart(2, "0") +
				"-" +
				String(now.getSeconds()).padStart(2, "0");
			const fileName = `db_tiktok_videos_${timestamp}.xlsx`;
			const a = document.createElement("a");
			a.href = url;
			a.download = fileName;
			document.body.appendChild(a);
			a.click();
			setTimeout(() => {
				document.body.removeChild(a);
				window.URL.revokeObjectURL(url);
			}, 100);
			await Swal.fire({
				icon: "success",
				title: "¡Archivo exportado!",
				text: "El archivo Excel fue exportado correctamente.",
				confirmButtonColor: "#10B981", // verde chillón
			});
		} catch (error) {
			console.error(error);
			await Swal.fire({
				icon: "error",
				title: "Error al exportar",
				text: "Ocurrió un error al exportar el archivo Excel.",
				confirmButtonColor: "#EF4444",
			});
		} finally {
			setLoadingExcel(false);
		}
	};

	// === split metrics & fallback para usernames inexistentes ===
	const primaryMetrics = (() => {
		if (filters?.hashtags?.trim()) {
			return metrics.filter(
				(m): m is MetricByHashtag => m.type === "MetricByHashtag",
			);
		} else if (filters?.tiktokUsernames?.trim()) {
			return metrics.filter(
				(m): m is MetricByUsername => m.type === "metricsByUsername",
			);
		} else {
			return [];
		}
	})();

	// fallback: si filtramos por username y no hay métricas, inyectamos un dummy cero por cada username
	let effectivePrimary = primaryMetrics;
	if (filters?.tiktokUsernames?.trim() && primaryMetrics.length === 0) {
		const names = filters.tiktokUsernames.split(",").map((u) => u.trim());
		effectivePrimary = names.map((category) => ({
			type: "metricsByUsername" as const,
			category,
			views: 0,
			likes: 0,
			avgEngagement: 0,
			interactions: 0,
		}));
	}

	const byDay = metrics.filter(
		(m): m is MetricByDayOfWeek => m.type === "byDayOfWeek",
	);

	const primaryLabel =
		effectivePrimary[0]?.type === "metricsByUsername"
			? "Usernames"
			: "Hashtags";

	// build charts (siempre 6, porque en fallback habrá al menos 1 primaria)
	const charts = [
		{
			key: "p-views",
			title: `${primaryLabel} vs Views`,
			data: effectivePrimary.map((m) => ({
				category: m.category,
				value: m.views,
			})),
			bars: [{ dataKey: "value", name: "Views" }],
			xKey: "category",
		},
		{
			key: "p-likes",
			title: `${primaryLabel} vs Likes`,
			data: effectivePrimary.map((m) => ({
				category: m.category,
				value: m.likes,
			})),
			bars: [{ dataKey: "value", name: "Likes" }],
			xKey: "category",
		},
		{
			key: "p-eng",
			title: `${primaryLabel} vs Avg Engagement`,
			data: effectivePrimary.map((m) => ({
				category: m.category,
				value: m.avgEngagement,
			})),
			bars: [{ dataKey: "value", name: "Engagement" }],
			xKey: "category",
		},
		{
			key: "p-int",
			title: `${primaryLabel} vs Interactions`,
			data: effectivePrimary.map((m) => ({
				category: m.category,
				value: m.interactions,
			})),
			bars: [{ dataKey: "value", name: "Interactions" }],
			xKey: "category",
		},
		{
			key: "d-lv",
			title: "Día vs Views & Likes",
			data: byDay.map((m) => ({
				category: m.category,
				views: m.views,
				likes: m.likes,
			})),
			bars: [
				{ dataKey: "views", name: "Views" },
				{ dataKey: "likes", name: "Likes" },
			],
			xKey: "category",
		},
		{
			key: "d-eng",
			title: "Día vs Avg Engagement",
			data: byDay.map((m) => ({
				category: m.category,
				value: m.avgEngagement,
			})),
			bars: [{ dataKey: "value", name: "Engagement" }],
			xKey: "category",
		},
	];

	const PALETTE = [
		"#EF4444",
		"#EC4899",
		"#8B5CF6",
		"#3B82F6",
		"#10B981",
		"#F43F5E",
		"#6366F1",
	];
	function shuffle<T>(arr: T[]): T[] {
		return [...arr].sort(() => Math.random() - 0.5);
	}

	type ChartData = {
		key: string;
		title: string;
		data: Record<string, unknown>[];
		bars: { dataKey: string; name?: string }[];
		xKey: string;
	};

	const renderChart = ({ key, title, data, bars, xKey }: ChartData) => {
		const colors = shuffle(PALETTE);
		return (
			<div
				key={key}
				ref={(el) => {
					chartRefs.current[key] = el;
				}}
				className="bg-white rounded-xl shadow-lg p-4 dark:bg-white/80"
				style={{ height: fullScreenChart === key ? "92%" : "auto" }}
			>
				<div className="flex justify-between items-center mb-2">
					<h4 className="font-semibold text-gray-900">{title}</h4>
					<div className="flex gap-2">
						<button
							className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white text-xs font-bold py-1 px-3 rounded shadow transition-all duration-150"
							onClick={() =>
								handleDownloadChartImage(key, title.replace(/\s+/g, "_"))
							}
						>
							<svg
								className="w-4 h-4 mr-1"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3"
								/>
							</svg>
							Descargar
						</button>

						<button
							onClick={() =>
								setFullScreenChart((prev) => (prev === key ? null : key))
							}
							className="p-1 rounded hover:bg-gray-100"
							title="Ver pantalla completa"
						>
							<Maximize2 size={16} />
						</button>
					</div>
				</div>
				<ResponsiveContainer
					width="100%"
					height={fullScreenChart === key ? "92%" : 220}
				>
					<BarChart data={data}>
						<XAxis dataKey={xKey} />
						<YAxis
							width={["p-eng", "d-eng"].includes(key) ? 60 : 108}
							tickFormatter={(value: number | undefined) =>
								typeof value === "number" ? value.toLocaleString() : ""
							}
						/>
						<Tooltip />
						<Legend />
						{bars.map((b, i) => (
							<Bar
								key={b.dataKey}
								dataKey={b.dataKey}
								name={b.name}
								fill={colors[i % colors.length]}
								radius={[4, 4, 0, 0]}
								barSize={60}
							/>
						))}
					</BarChart>
				</ResponsiveContainer>
			</div>
		);
	};

	function mapUserDbPostToApifyCallResponse(post: UserDbPost) {
		return {
			postCode: post.postId,
			datePosted: post.datePosted,
			timePosted: post.hourPosted,
			tiktokAccountUsername: post.usernameTiktokAccount,
			postLink: post.postURL,
			views: post.views,
			likes: post.likes,
			comments: post.comments,
			saves: post.saves,
			reposted: post.reposts,
			interactions: post.totalInteractions,
			engagementRate: post.engagement,
			numberOfHashtags: post.numberHashtags,
			hashtags: post.hashtags,
			soundId: post.soundId,
			soundUrl: post.soundURL,
			regionOfPosting: post.regionPost,
			trackingDate: post.dateTracking,
			trackingTime: post.timeTracking,
			user:
				post.userId !== undefined && post.userId !== null
					? String(post.userId)
					: undefined,
			admin: undefined,
		};
	}

	const headers = [
		"Avatar",
		"Date Posted",
		"Username",
		"Post URL",
		"Views",
		"Likes",
		"Engagement %",
		"Interactions",
		"Hashtags",
		"Sound URL",
		"Track Date",
	];

	// Justo antes del return, calcula los posts a mostrar en la página actual
	const paginatedPosts = posts.slice(
		(page - 1) * PAGE_WINDOW_SIZE,
		page * PAGE_WINDOW_SIZE,
	);

	// Debug: mostrar el estado de profileAvatars
	console.log("Estado actual de profileAvatars:", profileAvatars);

	return (
		<div className="min-h-screen bg-gradient-to-br from-white to-pink-100 dark:bg-gradient-to-br dark:from-violet-900 dark:to-black text-gray-900 dark:text-white p-4 lg:p-6 space-y-4 lg:space-y-6">
			<FilterPanelDb onApply={setFilters} onReset={() => {
				setFilters(null);
				setProfileAvatars({});
			}} />
			{error && (
				<div className="text-red-600 text-center font-medium">{error}</div>
			)}

			{/* Renderizar solo cuando loading es false */}
			{filters !== null && !loading && (
				<>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{charts.map(renderChart)}
					</div>

					{fullScreenChart && (
						<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
							<div className="relative bg-white rounded-xl shadow-xl w-11/12 h-5/6 p-6 overflow-auto dark:bg-white/80">
								<button
									className="absolute top-4 right-4 p-2 rounded hover:bg-gray-100"
									onClick={() => setFullScreenChart(null)}
								>
									✕
								</button>
								{/* renderizamos de nuevo sólo el chart seleccionado */}
								{charts
									.filter((c) => c.key === fullScreenChart)
									.map(renderChart)}
							</div>
						</div>
					)}
				</>
			)}
			{/* POSTS TABLE solo cuando loading es false */}
			{!loading && (
							<div className="bg-white rounded-lg shadow overflow-x-auto dark:bg-white/80">
				<div className="min-w-full">
					<table className="w-full divide-y divide-gray-200">
						<thead className="bg-purple-600">
							<tr>
								{headers.map((h) => (
									<th
										key={h}
										className="px-2 lg:px-4 py-2 lg:py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider bg-purple-100"
									>
										{h}
									</th>
								))}
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-200 bg-white dark:bg-white/80">
							{posts.length === 0 ? (
								<tr>
									<td colSpan={headers.length} className="p-8 text-center">
										<div className="flex flex-col items-center justify-center gap-4">
											<div className="rounded-full bg-purple-200 flex items-center justify-center w-16 h-16 mb-2">
												<svg
													className="w-8 h-8 text-white/80"
													fill="none"
													stroke="currentColor"
													strokeWidth="2.5"
													viewBox="0 0 24 24"
												>
													<circle
														cx="11"
														cy="11"
														r="8"
														stroke="currentColor"
														strokeWidth="2.5"
													/>
													<line
														x1="21"
														y1="21"
														x2="16.65"
														y2="16.65"
														stroke="currentColor"
														strokeWidth="2.5"
														strokeLinecap="round"
													/>
												</svg>
											</div>
											<div className="text-2xl font-bold text-gray-700">
												No hay datos aún
											</div>
											<div className="text-gray-500 text-base mb-2">
												Configura tus filtros y ejecuta el scraping para ver los
												resultados
											</div>
										</div>
									</td>
								</tr>
							) : (
								paginatedPosts.map((row, i) => (
									<tr
										key={`${row.postId}-${i}`}
										className={
											i % 2 === 0 ? "bg-gray-50" : "bg-white dark:bg-white/80"
										}
										onClick={() => setSelectedPost(row)}
										style={{ cursor: "pointer" }}
									>
																			<td className="px-2 lg:px-4 py-2 text-sm text-gray-900">
										{profileAvatars[row.usernameTiktokAccount] ? (
												<img
													src={profileAvatars[row.usernameTiktokAccount]}
													alt={`Avatar de ${row.usernameTiktokAccount}`}
													className="w-8 h-8 rounded-full object-cover"
													onError={(e) => {
														console.log(
															`Error cargando imagen para ${row.usernameTiktokAccount}`,
														);
														e.currentTarget.style.display = "none";
														e.currentTarget.nextElementSibling?.classList.remove(
															"hidden",
														);
													}}
												/>
											) : null}
											<div
												className={`w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center ${profileAvatars[row.usernameTiktokAccount] ? "hidden" : ""}`}
											>
												<span className="text-xs text-gray-600">
													{row.usernameTiktokAccount.charAt(0).toUpperCase()}
												</span>
											</div>
										</td>
																			<td className="px-2 lg:px-4 py-2 text-sm text-gray-900">
										{row.datePosted}
									</td>

																			<td className="px-2 lg:px-4 py-2 text-sm text-gray-900">
										<button
											onClick={(e) => {
												e.stopPropagation();
												setSelectedUsername(row.usernameTiktokAccount);
												setIsProfileModalOpen(true);
											}}
											className="text-purple-600 hover:text-purple-800 hover:underline font-medium cursor-pointer transition-colors"
										>
											{row.usernameTiktokAccount}
										</button>
									</td>
										<td className="px-4 py-2 text-sm text-gray-900">
											{row.postURL ? (
												<a
													href={row.postURL}
													target="_blank"
													rel="noopener noreferrer"
													className="text-purple-600 hover:underline"
												>
													{row.postURL.split("/").pop()}
												</a>
											) : (
												"–"
											)}
										</td>
										<td className="px-4 py-2 text-sm text-gray-900">
											{row.views.toLocaleString()}
										</td>
										<td className="px-4 py-2 text-sm text-gray-900">
											{row.likes.toLocaleString()}
										</td>

										<td className="px-4 py-2 text-sm text-gray-900">
											{row.engagement.toFixed(2)}%
										</td>
										<td className="px-4 py-2 text-sm text-gray-900">
											{row.totalInteractions.toLocaleString()}
										</td>
										<td className="px-4 py-2 text-sm text-gray-900">
											{row.hashtags || "–"}
										</td>

										<td className="px-4 py-2 text-sm text-gray-900">
											{row.soundURL ? (
												<a
													href={row.soundURL}
													target="_blank"
													rel="noopener noreferrer"
													className="text-purple-600 hover:underline"
												>
													{row.soundURL.split("/").pop()}
												</a>
											) : (
												"–"
											)}
										</td>

										<td className="px-4 py-2 text-sm text-gray-900">
											{row.dateTracking}
										</td>
									</tr>
								))
							)}
						</tbody>
											</table>
					</div>
				</div>
			)}
			{posts.length > 0 && (
				<div className="mt-4 flex flex-col md:flex-row items-center justify-center gap-4">
					{/* Paginador */}
					<div className="flex items-center gap-0.5 bg-purple-100 p-2 rounded-xl">
						<button
							onClick={() => {
								if (page > 1) setPage(page - 1);
							}}
							className="px-4 py-2 bg-purple-600 text-white rounded-l disabled:opacity-50"
							disabled={page === 1}
						>
							Previous
						</button>
						<span className="px-4 py-2 bg-white border-t border-b border-purple-600 text-purple-600 font-semibold">
							Página {page} de {totalPages}
						</span>
						<button
							onClick={() => {
								if (page < totalPages) setPage(page + 1);
							}}
							className="px-4 py-2 bg-purple-600 text-white rounded-r disabled:opacity-50"
							disabled={page === totalPages}
						>
							Next
						</button>
					</div>

					{/* Botón Exportar */}
					<button
						onClick={handleDownloadExcel}
						className={`flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-xl shadow transition-all duration-150 disabled:opacity-70`}
						disabled={loadingExcel}
					>
						{loadingExcel && (
							<svg
								className="animate-spin w-5 h-5 mr-2 text-white"
								fill="none"
								viewBox="0 0 24 24"
							>
								<circle
									className="opacity-25"
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									strokeWidth="4"
								></circle>
								<path
									className="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8v8z"
								></path>
							</svg>
						)}
						{loadingExcel ? "Exportando..." : "Exportar a Excel"}
					</button>
				</div>
			)}

			{selectedPost && (
				<PostDetailModal
					post={mapUserDbPostToApifyCallResponse(selectedPost)}
					onClose={() => setSelectedPost(null)}
				/>
			)}

			{selectedUsername && (
				<TikTokProfileModal
					username={selectedUsername}
					isOpen={isProfileModalOpen}
					onClose={() => {
						setIsProfileModalOpen(false);
						setSelectedUsername(null);
					}}
				/>
			)}
		</div>
	);
}
