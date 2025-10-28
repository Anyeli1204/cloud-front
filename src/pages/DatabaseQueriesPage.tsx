// src/pages/DatabaseQueriesPage.tsx
import React, { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";

import type { UserDBQueryRequest } from "@interfaces/db-queries/UserDBQueryRequest";
import type { UserDbPost } from "@interfaces/db-queries/UserDbQueryResponse";
import { dbQueries } from "@services/db-queries/UserDbQueries";
import { userApify } from "@services/apifyCall/userApifyCall";
import type { ApifyCallResponse } from "@interfaces/apify-call/ApifyCallResponse";
import type { UserApifyCallRequest } from "@interfaces/apify-call/UserApifyCallRequest";

import { FilterPanelDb } from "@components/FilterPanelDb";
import { PostDetailModal } from "@components/PostDetailModal";
import { TikTokProfileModal } from "@components/TikTokProfileModal";
import { getTikTokProfile } from "@services/tiktokProfile/tiktokProfileService";

const PAGE_WINDOW_SIZE = 10;

export default function DatabaseQueriesPage() {
	const [filters, setFilters] = useState<UserDBQueryRequest | null>(null);
	const [posts, setPosts] = useState<UserDbPost[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [selectedPost, setSelectedPost] = useState<UserDbPost | null>(null);
	const [loadingExcel, setLoadingExcel] = useState(false);
	const [selectedUsername, setSelectedUsername] = useState<string | null>(null);
	const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
	const [profileAvatars, setProfileAvatars] = useState<Record<string, string>>(
		{},
	);

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

	// --- Mapeo front -> QueryRequest (CSV strings)
	function mapFiltersToDbQuery(input: any): UserDBQueryRequest {
		// userId: leer del sessionStorage si existe, sino dejar undefined
		const rawId = sessionStorage.getItem("id");
		const userId = rawId ? Number(rawId) : undefined;

		const normalizeToCsv = (
			v: string | string[] | undefined,
		): string | undefined => {
			if (v === undefined || v === null) return undefined;
			if (Array.isArray(v)) {
				const arr = v.map((x) => String(x).trim()).filter(Boolean);
				return arr.length ? arr.join(",") : undefined;
			}
			const s = String(v).trim();
			return s.length ? s : undefined;
		};

		return {
			// el tipo UserDBQueryRequest exige userId number en tu interfaz actual,
			// pero dbQueries sobrescribe el userId (ok). Si tu interfaz lo requiere,
			// puedes forzar con `userId: userId ?? 0` o mejor, actualizar la interfaz TS.
			userId: userId ?? 0,
			tiktokUsernames: normalizeToCsv(input.profiles ?? input.tiktokUsernames),
			postId: normalizeToCsv(input.postId),
			postURL: normalizeToCsv(input.postURL),
			regionPost: normalizeToCsv(input.regionPost),
			datePostedFrom: input.oldestPostDate ?? input.datePostedFrom ?? undefined,
			datePostedTo: input.newestPostDate ?? input.datePostedTo ?? undefined,
			minViews: input.minViews ?? undefined,
			maxViews: input.maxViews ?? undefined,
			minLikes: input.minLikes ?? undefined,
			maxLikes: input.maxLikes ?? undefined,
			minTotalInteractions: input.minTotalInteractions ?? undefined,
			maxTotalInteractions: input.maxTotalInteractions ?? undefined,
			minEngagement: input.minEngagement ?? undefined,
			maxEngagement: input.maxEngagement ?? undefined,
			hashtags: normalizeToCsv(input.hashtags ?? input.searchQueries),
			soundId: normalizeToCsv(input.soundId),
			soundURL: normalizeToCsv(input.soundURL),
		};
	}

	// Mapea una respuesta de Apify (scraping) al formato UserDbPost para reutilizar la misma tabla
	function mapApifyToUserDbPost(item: ApifyCallResponse): UserDbPost {
		return {
			numberHashtags: item.numberHashtags,
			comments: item.comments,
			datePosted: item.datePosted,
			engagement: item.engagement,
			hashtags: item.hashtags,
			totalInteractions: item.totalInteractions,
			likes: item.likes,
			postURL: item.postURL,
			postId: item.postId,
			regionPost: item.regionPost,
			reposts: item.reposts,
			saves: item.saves,
			soundId: item.soundId,
			soundURL: item.soundURL,
			usernameTiktokAccount: item.usernameTiktokAccount,
			hourPosted: item.hourPosted,
			dateTracking: item.dateTracking,
			timeTracking: item.timeTracking,
			userId: item.userId,
			views: item.views,
			adminId: item.adminId,
		};
	}

	useEffect(() => {
		if (!filters) {
			setPosts([]);
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

				// Si el usuario ingresó hashtags en este formulario, preferimos llamar al scraping (MS3 normalized)
				const hasHashtags = !!filters.hashtags && filters.hashtags.trim().length > 0;
				const hasUsernames = !!filters.tiktokUsernames && filters.tiktokUsernames.trim().length > 0;

				// Always call the DB query endpoint for the Queries page
				let postList: UserDbPost[] | [] = (await dbQueries(filters)) as UserDbPost[] | [];

				console.log("postList raw:", postList);

				// seguridad: garantizar que es array
				const safePostList: UserDbPost[] = Array.isArray(postList)
					? postList
					: [];

				setPosts(safePostList);
				setError(null);
				setTotalPages(
					Math.max(1, Math.ceil(safePostList.length / PAGE_WINDOW_SIZE)),
				);
				setPage(1); // resetear paginador al aplicar nuevos filtros

				// Extraer usernames válidos y únicos
				const usernames = safePostList
					.map((p) => p?.usernameTiktokAccount)
					.filter(
						(u): u is string => typeof u === "string" && u.trim().length > 0,
					);

				const uniqueUsernames = Array.from(new Set(usernames));
				console.log("Usernames únicos encontrados:", uniqueUsernames);

				if (uniqueUsernames.length > 0) {
					// fetchProfileAvatars acepta string[]
					await fetchProfileAvatars(uniqueUsernames);
				}
			} catch (err: unknown) {
				console.error(err);
				setError((err as Error)?.message ?? "Error al solicitar datos");
				setPosts([]);
				setTotalPages(1);
			} finally {
				setLoading(false);
				Swal.close();
			}
		})();
	}, [filters]);

	function mapUserDbPostToApifyCallResponse(post: UserDbPost) {
		return {
			postId: post.postId,
			datePosted: post.datePosted,
			hourPosted: post.hourPosted,
			usernameTiktokAccount: post.usernameTiktokAccount, // AGREGAR
			postURL: post.postURL, // AGREGAR ESTA LÍNEA

			views: post.views,
			likes: post.likes,
			comments: post.comments,
			saves: post.saves,
			reposts: post.reposts,
			totalInteractions: post.totalInteractions, // AGREGAR ESTA LÍNEA
			engagement: post.engagement, // AGREGAR ESTA LÍNEA
			regionPost: post.regionPost, // AGREGAR

			numberHashtags: post.numberHashtags,
			hashtags: post.hashtags,
			soundId: post.soundId,
			soundURL: post.soundURL,
			dateTracking: post.dateTracking,
			timeTracking: post.timeTracking,
			userId:
				post.userId !== undefined && post.userId !== null
					? String(post.userId)
					: undefined,
			adminId: undefined,
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
			<FilterPanelDb
				onApply={setFilters}
				onReset={() => {
					setFilters(null);
					setProfileAvatars({});
				}}
			/>
			{error && (
				<div className="text-red-600 text-center font-medium">{error}</div>
			)}

			{/* Renderizar solo cuando loading es false */}

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
													Configura tus filtros y ejecuta el scraping para ver
													los resultados
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
