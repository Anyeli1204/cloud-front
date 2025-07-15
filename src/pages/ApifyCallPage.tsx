import React, { useState, useEffect } from "react";
import { FilterPanel } from "@components/FilterPanel";
import type { ApifyCallResponse } from "@interfaces/apify-call/ApifyCallResponse";
import { mapRawToApifyResponse } from "@interfaces/apify-call/ApifyCallResponse";
import { userApify } from "@services/apifyCall/userApifyCall";
import Swal from "sweetalert2";
import { PostDetailModal } from "@components/PostDetailModal";
import { TikTokProfileModal } from "@components/TikTokProfileModal";
import type { UserApifyCallRequest } from "@interfaces/apify-call/UserApifyCallRequest";
import { downloadExcel } from "@services/excelService/ExcelFetch";
import { getTikTokProfile } from "@services/tiktokProfile/tiktokProfileService";

export default function ApifyCallPage() {
	const [loadingExcel, setIsLoadingExcel] = useState(false);
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
	const [profileAvatars, setProfileAvatars] = useState<Record<string, string>>({});

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

	const handleDownloadExcel = async () => {
		if (!data) {
			Swal.fire({
				icon: "warning",
				title: "No hay datos",
				text: "⚠️ Debes realizar la consulta primero.",
				confirmButtonColor: "#7c3aed",
			});
			return;
		}
		setIsLoadingExcel(true);
		try {
			const requestBody = data.map((item) => ({
				postCode: item.postCode,
				tiktokAccountUsername: item.tiktokAccountUsername,
				postLink: item.postLink,

				datePosted: item.datePosted,
				timePosted: item.timePosted,

				hashtags: item.hashtags,
				numberOfHashtags: item.numberOfHashtags,

				views: item.views,
				likes: item.likes,
				comments: item.comments,
				interactions: item.interactions,
				engagementRate: item.engagementRate,

				reposted: item.reposted,
				saves: item.saves,

				regionOfPosting: item.regionOfPosting,

				soundId: item.soundId,
				soundUrl: item.soundUrl,

				trackingDate: item.trackingDate,
				trackingTime: item.trackingTime,

				user: item.user,
				admin: item.admin,
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
			const fileName = `tiktok_videos_${timestamp}.xlsx`; // Nombre generado en frontend
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
				text: "✅ El archivo Excel fue exportado con éxito.",
				confirmButtonColor: "#22c55e", // verde
			});
		} catch {
			await Swal.fire({
				icon: "error",
				title: "Error al descargar",
				text: "❌ Hubo un error descargando el archivo Excel.",
				confirmButtonColor: "#ef4444", // rojo
			});
		} finally {
			setIsLoadingExcel(false);
		}
	};

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
			const mapped = raw.map(mapRawToApifyResponse);
			setData(mapped);
			
			// Obtener fotos de perfil para todos los usuarios únicos
			const uniqueUsernames = [...new Set(mapped.map(item => item.tiktokAccountUsername))];
			fetchProfileAvatars(uniqueUsernames);
			
			// Guarda en sessionStorage
			sessionStorage.setItem("apifyScrapeData", JSON.stringify(mapped));
			sessionStorage.setItem("apifyScrapeFilters", JSON.stringify(filters));
			setSavedFilters(filters as Partial<UserApifyCallRequest>);
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
					console.log(`ApifyCallPage - Avatar obtenido para ${username}:`, profile.avatarLarger);
					return { username, avatar: profile.avatarLarger };
				}
			} catch {
				console.log(`ApifyCallPage - No se pudo obtener avatar para ${username}`);
			}
			return null;
		});
		
		// Esperar todas las promesas en paralelo
		const results = await Promise.all(avatarPromises);
		const newAvatars: Record<string, string> = {};
		
		results.forEach(result => {
			if (result) {
				newAvatars[result.username] = result.avatar;
			}
		});
		
		if (Object.keys(newAvatars).length > 0) {
			console.log("ApifyCallPage - Avatars obtenidos:", newAvatars);
			setProfileAvatars(prev => ({ ...prev, ...newAvatars }));
		}
	};

	// Debug: mostrar el estado de profileAvatars
	console.log("ApifyCallPage - Estado actual de profileAvatars:", profileAvatars);

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
		<div className="min-h-screen bg-gradient-to-br from-white to-pink-100 dark:bg-gradient-to-br dark:from-violet-900 dark:to-black text-gray-900 dark:text-white p-6 space-y-6 relative">
			<FilterPanel
				onApply={handleApplyFilters}
				onReset={handleReset}
				initialFilters={savedFilters}
			/>

			{error && <div className="text-red-600 text-center">{error}</div>}

			<div className="bg-white rounded-lg shadow overflow-x-auto dark:bg-white/80">
				<table className="min-w-full divide-y divide-gray-200">
					<thead className="bg-purple-600">
						<tr>
							{headers.map((h) => (
								<th
									key={h}
									className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider"
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
									key={`${row.postCode}-${i}`}
									className={
										i % 2 === 0 ? "bg-gray-50" : "bg-white dark:bg-white/80"
									}
									onClick={() => setSelectedPost(row)}
								>
									<td className="px-4 py-2 text-sm font-medium text-gray-900">
										{profileAvatars[row.tiktokAccountUsername] ? (
											<img
												src={profileAvatars[row.tiktokAccountUsername]}
												alt={`Avatar de ${row.tiktokAccountUsername}`}
												className="w-8 h-8 rounded-full object-cover"
												onError={(e) => {
													console.log(`ApifyCallPage - Error cargando imagen para ${row.tiktokAccountUsername}`);
													e.currentTarget.style.display = 'none';
													e.currentTarget.nextElementSibling?.classList.remove('hidden');
												}}
											/>
										) : null}
										<div className={`w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center ${profileAvatars[row.tiktokAccountUsername] ? 'hidden' : ''}`}>
											<span className="text-xs text-gray-600">
												{row.tiktokAccountUsername.charAt(0).toUpperCase()}
											</span>
										</div>
									</td>
									<td className="px-4 py-2 text-sm text-gray-900">
										{row.datePosted}
									</td>
									<td className="px-4 py-2 text-sm text-gray-900">
										<button
											onClick={(e) => {
												e.stopPropagation();
												setSelectedUsername(row.tiktokAccountUsername);
												setIsProfileModalOpen(true);
											}}
											className="text-purple-600 hover:text-purple-800 hover:underline font-medium cursor-pointer transition-colors"
										>
											{row.tiktokAccountUsername}
										</button>
									</td>
									<td className="px-4 py-2 text-sm text-gray-900">
										{row.postLink ? (
											<a
												href={row.postLink}
												target="_blank"
												rel="noopener noreferrer"
												className="text-purple-600 hover:underline"
											>
												{row.postLink.split("/").pop() ?? "–"}
											</a>
										) : (
											"–"
										)}
									</td>
									<td className="px-4 py-2 text-sm text-gray-900">
										{row.views?.toLocaleString() ?? "0"}
									</td>
									<td className="px-4 py-2 text-sm text-gray-900">
										{row.likes?.toLocaleString() ?? "0"}
									</td>
									<td className="px-4 py-2 text-sm text-gray-900">
										{row.engagementRate?.toFixed(2) ?? "0.00"}%
									</td>
									<td className="px-4 py-2 text-sm text-gray-900">
										{row.interactions?.toLocaleString() ?? "0"}
									</td>
									<td className="px-4 py-2 text-sm text-gray-900">
										{row.hashtags ?? "–"}
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>

			{data.length > 0 && (
				<div className="flex justify-center items-center w-full my-4">
					<button
						className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-5 rounded-xl shadow-md transition-all duration-200 text-base disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
						onClick={handleDownloadExcel}
						disabled={loadingExcel}
					>
						{loadingExcel && (
							<svg
								className="animate-spin h-5 w-5 text-white"
								xmlns="http://www.w3.org/2000/svg"
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
								/>
								<path
									className="opacity-75"
									fill="currentColor"
									d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
								/>
							</svg>
						)}
						{loadingExcel ? "Exportando..." : "Exportar a Excel"}
					</button>
				</div>
			)}
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
