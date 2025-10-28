import React, { useState, useEffect } from "react";
import { FilterPanel } from "@components/FilterPanel";
import type { ApifyCallResponse } from "@interfaces/apify-call/ApifyCallResponse";
import { mapRawToApifyResponse } from "@interfaces/apify-call/ApifyCallResponse";
import { userApify } from "@services/apifyCall/userApifyCall";
import Swal from "sweetalert2";
import { PostDetailModal } from "@components/PostDetailModal";
import { TikTokProfileModal } from "@components/TikTokProfileModal";
import type { UserApifyCallRequest } from "@interfaces/apify-call/UserApifyCallRequest";
import { getTikTokProfile } from "@services/tiktokProfile/tiktokProfileService";

export default function ApifyCallPage() {
	const [data, setData] = useState<ApifyCallResponse[]>([]);
	const [savedFilters, setSavedFilters] =
		useState<Partial<UserApifyCallRequest> | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [selectedPost, setSelectedPost] = useState<ApifyCallResponse | null>(
		null,
	); // ESTADO NUEVO
	const [selectedUsername, setSelectedUsername] = useState<string | null>(null);
	const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
	const [profileAvatars, setProfileAvatars] = useState<Record<string, string>>(
		{},
	);

	// Al cargar la página, intenta restaurar los datos del sessionStorage
	useEffect(() => {
		const stored = sessionStorage.getItem("apifyScrapeData");
		const storedFilters = sessionStorage.getItem("apifyScrapeFilters");
		if (stored) {
			try {
				setData(JSON.parse(stored));
			} catch {
				/* ignore */
			}
		}
		if (storedFilters) {
			try {
				setSavedFilters(JSON.parse(storedFilters));
			} catch {
				/* ignore */
			}
		}
	}, []);

	const handleApplyFilters = async (filters: unknown) => {
		Swal.fire({
			title: "Cargando…",
			html: "Obteniendo datos de TikTok, por favor espera.",
			allowOutsideClick: false,
			didOpen: () => Swal.showLoading(),
		});
		setLoading(true);
		setError(null);
		try {
			const raw = await userApify(
				filters as Omit<UserApifyCallRequest, "userId">,
			);
			console.log(raw);
			const mapped = raw.map(mapRawToApifyResponse);
			setData(mapped);
			console.log(mapped);

			// Obtener fotos de perfil para todos los usuarios únicos
			const uniqueUsernames = [
				...new Set(mapped.map((item) => item.usernameTiktokAccount)),
			];
			fetchProfileAvatars(uniqueUsernames);

			// Guarda en sessionStorage
			sessionStorage.setItem("apifyScrapeData", JSON.stringify(mapped));
			sessionStorage.setItem("apifyScrapeFilters", JSON.stringify(filters));
			setSavedFilters(filters as Partial<UserApifyCallRequest>);

			// Also post a historial record to the Content service (MS2)
			(async function postHistorial() {
				try {
					const MS2_URL = import.meta.env.VITE_CONTENT_SERVICE_URL;
					if (!MS2_URL) return;
					const userId = sessionStorage.getItem("id") ?? "";
					const userRole = sessionStorage.getItem("role") ?? "";
					const body = {
						filters: filters,
						results: mapped.length,
						timestamp: new Date().toISOString(),
					};
					const res = await fetch(`${MS2_URL}/historial`, {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							"x-user-id": String(userId),
							"x-user-role": String(userRole),
						},
						body: JSON.stringify(body),
					});
					if (!res.ok) {
						console.warn("historial POST failed", res.status);
					} else {
						console.log("historial recorded");
					}
				} catch (e) {
					console.warn("Error posting historial", e);
				}
			})();
		} catch (err: unknown) {
			let message = "Ocurrió un error al obtener los datos de TikTok.";
			if (typeof err === "object" && err !== null && "response" in err) {
				const response = (err as { response?: { data?: { message?: string } } })
					.response;
				if (response && response.data && response.data.message) {
					message = response.data.message;
				}
			}
			setError(message);
			setData([]);
		} finally {
			setLoading(false);
			Swal.close();
		}
	};

	const handleReset = () => {
		setData([]);
		setError(null);
		setProfileAvatars({});
		sessionStorage.removeItem("apifyScrapeData");
		sessionStorage.removeItem("apifyScrapeFilters");
		setSavedFilters(null);
	};

	// Función para obtener fotos de perfil (optimizada con Promise.all)
	const fetchProfileAvatars = async (usernames: string[]) => {
		console.log("ApifyCallPage - Iniciando carga de avatars para:", usernames);

		// Crear promesas para todos los usernames en paralelo
		const avatarPromises = usernames.map(async (username) => {
			try {
				const profile = await getTikTokProfile(username);
				if (profile.avatarLarger) {
					console.log(
						`ApifyCallPage - Avatar obtenido para ${username}:`,
						profile.avatarLarger,
					);
					return { username, avatar: profile.avatarLarger };
				}
			} catch {
				console.log(
					`ApifyCallPage - No se pudo obtener avatar para ${username}`,
				);
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
			console.log("ApifyCallPage - Avatars obtenidos:", newAvatars);
			setProfileAvatars((prev) => ({ ...prev, ...newAvatars }));
		}
	};

	// Debug: mostrar el estado de profileAvatars
	console.log(
		"ApifyCallPage - Estado actual de profileAvatars:",
		profileAvatars,
	);

	// Definimos aquí todas las cabeceras, incluyendo User y Admin opcionales
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
	];

	return (
		<div className="min-h-screen bg-gradient-to-br from-white to-pink-100 dark:bg-gradient-to-br dark:from-violet-900 dark:to-black text-gray-900 dark:text-white p-4 lg:p-6 space-y-4 lg:space-y-6 relative">
			<FilterPanel
				onApply={handleApplyFilters}
				onReset={handleReset}
				initialFilters={savedFilters}
			/>

			{error && <div className="text-red-600 text-center">{error}</div>}

			<div className="bg-white rounded-lg shadow overflow-x-auto dark:bg-white/80">
				<div className="min-w-full">
					<table className="w-full divide-y divide-gray-200">
						<thead className="bg-purple-600">
							<tr>
								{headers.map((h) => (
									<th
										key={h}
										className="px-2 lg:px-4 py-2 lg:py-3 text-left text-xs font-semibold text-white uppercase tracking-wider"
									>
										{h}
									</th>
								))}
							</tr>
						</thead>

						<tbody className="divide-y divide-gray-200 bg-white dark:bg-white/80">
							{loading ? (
								<tr>
									<td colSpan={headers.length} className="p-4 text-center">
										Cargando…
									</td>
								</tr>
							) : data.length === 0 ? (
								<tr>
									<td colSpan={headers.length} className="p-8 text-center">
										<div className="flex flex-col items-center justify-center gap-4">
											<div className="rounded-full bg-purple-400/30 flex items-center justify-center w-24 h-24 mb-2">
												<svg
													className="w-16 h-16 text-white/70"
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
								data.map((row, i) => (
									<tr
										key={`${row.postId}-${i}`}
										className={
											i % 2 === 0 ? "bg-gray-50" : "bg-white dark:bg-white/80"
										}
										onClick={() => setSelectedPost(row)}
									>
										<td className="px-2 lg:px-4 py-2 text-sm font-medium text-gray-900">
											{profileAvatars[row.usernameTiktokAccount] ? (
												<img
													src={profileAvatars[row.usernameTiktokAccount]}
													alt={`Avatar de ${row.usernameTiktokAccount}`}
													className="w-8 h-8 rounded-full object-cover"
													onError={(e) => {
														console.log(
															`ApifyCallPage - Error cargando imagen para ${row.usernameTiktokAccount}`,
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
										<td className="px-2 lg:px-4 py-2 text-sm text-gray-900">
											{row.postURL ? (
												<a
													href={row.postURL}
													target="_blank"
													rel="noopener noreferrer"
													className="text-purple-600 hover:underline"
												>
													{row.postURL.split("/").pop() ?? "–"}
												</a>
											) : (
												"–"
											)}
										</td>
										<td className="px-2 lg:px-4 py-2 text-sm text-gray-900">
											{row.views?.toLocaleString() ?? "0"}
										</td>
										<td className="px-2 lg:px-4 py-2 text-sm text-gray-900">
											{row.likes?.toLocaleString() ?? "0"}
										</td>
										<td className="px-2 lg:px-4 py-2 text-sm text-gray-900">
											{row.engagement?.toFixed(2) ?? "0.00"}%
										</td>
										<td className="px-2 lg:px-4 py-2 text-sm text-gray-900">
											{row.totalInteractions?.toLocaleString() ?? "0"}
										</td>
										<td className="px-2 lg:px-4 py-2 text-sm text-gray-900">
											{row.hashtags ?? "–"}
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</div>

			{selectedPost && (
				<PostDetailModal
					post={selectedPost}
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
