import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import TikTokEmbed from "@components/TikTokEmbedProps";

import { useAuthContext } from "@contexts/AuthContext";
import { adminApify } from "@services/apifyCall/adminApifyCall";
import type { AdminApifyRequest } from "@interfaces/apify-call/AdminApifyRequest";
import type { ApifyCallResponse } from "@interfaces/apify-call/ApifyCallResponse";
import { mapRawToApifyResponse } from "@interfaces/apify-call/ApifyCallResponse";
import { sendTopGlobalEmail } from "@services/TopGlobalEmail/sendEmailTG";
import type { TopGlobalesEmailRequest } from "@interfaces/send-email-topGlobales/TopGlobalesEmailRequest";
import type { DashboardInfo } from "@interfaces/dashboard/DashboardInfo";
import { getDashboardInfo } from "@services/dashboard/getDashboardInfo";

// Tipo unión para manejar tanto datos de scraping como datos publicados
type PostData = ApifyCallResponse | DashboardInfo;
interface RenderUniversalCardsProps {
	data: PostData[];
	pageIndices?: Record<string, number>;
	setModalUrl?: (url: string) => void;
	setShowModal?: (show: boolean) => void;
	showEmbeds?: boolean;
}

// Funciones helper para acceder a propiedades de manera segura
const isApifyData = (post: PostData): post is ApifyCallResponse => {
	return "hashtags" in post && "postCode" in post;
};

const getPostId = (post: PostData): string => {
	return isApifyData(post) ? post.postCode : post.postId;
};

const getPostLink = (post: PostData): string => {
	return isApifyData(post) ? post.postLink : post.postURL;
};

const getUsername = (post: PostData): string => {
	return isApifyData(post)
		? post.tiktokAccountUsername
		: post.usernameTiktokAccount;
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
	// Al inicio del componente
	const [showModal, setShowModal] = useState(false);
	const [modalUrl, setModalUrl] = useState<string | null>(null);

	const [pageIndices, setPageIndices] = useState<Record<string, number>>({});
	const { id: adminId, role } = useAuthContext();
	const isAdmin = role === "ADMIN";
	const [loading, setLoading] = useState(false);
	const [posts, setPosts] = useState<PostData[]>([]);
	const [lastFilters, setLastFilters] = useState<AdminApifyRequest | null>(
		null,
	);

	const [showSuccessAlert, setShowSuccessAlert] = useState(false);
	const [showPublishedList, setShowPublishedList] = useState(false);
	const [publishedPosts, setPublishedPosts] = useState<DashboardInfo[]>([]);

	useEffect(() => {
		fetchPublishedPosts();
		setShowPublishedList(true);
	}, []);

	const handlePublish = async () => {
		if (!lastFilters) {
			Swal.fire("Atención", "No hay datos para publicar aún.", "warning");
			return;
		}

		try {
			// Muestra el loading mientras enviamos el correo
			Swal.fire({
				title: "Enviando correo…",
				html: "Por favor, espera.",
				allowOutsideClick: false,
				didOpen: () => Swal.showLoading(),
			});
			if (Array.isArray(posts) && posts.length > 0) {
				// Obtener solo los datos que se muestran en las tarjetas (top 3 por hashtag/palabra clave)
				const emailReqs: TopGlobalesEmailRequest[] = [];

				// Obtener los términos (hashtags y palabras clave)
				const hashtags = lastFilters.hashtags
					? lastFilters.hashtags
							.split(",")
							.map((t) => t.trim())
							.filter(Boolean)
					: [];
				const keyWords = lastFilters.keyWords
					? lastFilters.keyWords
							.split(",")
							.map((t) => t.trim())
							.filter(Boolean)
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
					const top3 = candidates.sort((a, b) => b.views - a.views).slice(0, 3);

					// Convertir a formato TopGlobalesEmailRequest
					top3.forEach((p) => {
						emailReqs.push({
							adminId: Number(adminId),
							usedHashTag: term.startsWith("#") ? term : `#${term}`,
							postId: getPostId(p),
							datePosted: p.datePosted.split("T")[0],
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
				}
			}
			Swal.close();
			setShowPublishedList(true);
			setShowSuccessAlert(true);
		} catch (error) {
			Swal.close();
			console.error("Error al enviar emails o al navegar:", error);
			Swal.fire(
				"Error",
				"Ocurrió un error inesperado. Revisa la consola para más detalles.",
				"error",
			);
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
			console.log(posts);
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
			console.log(hMap);

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

	const renderUniversalCards = ({
		data,
		pageIndices = {},
		setModalUrl,
		setShowModal,
		showEmbeds = true, // puedes poner false si solo quieres lista
	}: RenderUniversalCardsProps) => {
		if (!Array.isArray(data) || data.length === 0)
			return <div className="text-center mt-12">No hay datos.</div>;

		// Agrupa TODOS los términos (hashtags o keywords) presentes
		const terms = Array.from(
			new Set(
				data.flatMap(
					(p) =>
						getHashtags(p)
							?.split(",")
							.map((h) => h.trim())
							.filter(Boolean) || [],
				),
			),
		).filter(Boolean);

		return (
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
				{terms.map((term) => {
					// Agrupa posts que contengan ese término
					const group = data.filter((p) => {
						const hashtags =
							getHashtags(p)
								?.split(",")
								.map((h) => h.trim().replace(/^#/, "").toLowerCase()) || [];
						return hashtags.includes(term.replace(/^#/, "").toLowerCase());
					});

					if (group.length === 0) return null;
					const top3 = group.sort((a, b) => b.views - a.views).slice(0, 3);

					return (
						<div
							key={term}
							className="bg-gradient-to-br from-white via-gray-50 to-gray-200 dark:bg-none dark:bg-white/80 border border-transparent dark:border-white/30 rounded-3xl shadow-2xl p-6 flex flex-col items-start transition-all duration-300"
						>
							<h4 className="text-lg font-semibold mb-3 uppercase tracking-wide flex items-center gap-2 text-gray-900">
								<span className="text-2xl text-gray-900">🎯</span>
								<span className="bg-purple-200 text-purple-800 font-bold rounded-full px-4 py-1 text-base shadow-sm uppercase tracking-wide">
									{term.toUpperCase()}
								</span>
							</h4>
							{top3.map((p, idx) => (
								<div
									key={getPostId(p) || idx}
									className="mb-4 last:mb-0 w-full"
								>
									<div className="flex items-center gap-2 font-extrabold text-lg mb-1 text-gray-900 dark:text-white">
										<span
											className={`
                      flex items-center justify-center
                      rounded-full font-bold text-xs
                      backdrop-blur-md shadow
                      ${
												idx === 0
													? "bg-yellow-300 text-yellow-900"
													: idx === 1
														? "bg-gray-400 text-gray-700"
														: "bg-yellow-800 text-white"
											}
                      px-2 py-1 border border-white/60
                    `}
											style={{
												minWidth: 22,
												minHeight: 22,
												fontSize: 12,
												marginRight: 6,
											}}
										>
											{idx + 1}
										</span>
										{getPostId(p)}
									</div>
									<div className="flex items-center gap-1 font-medium text-xs mb-0.5 text-gray-700 dark:text-gray-200">
										<span>📅 {p.datePosted}</span>
										<span>| 👤 {getUsername(p)}</span>
									</div>
									<div className="flex items-center gap-4 text-sm font-semibold text-gray-900 dark:text-white">
										<span>👁️ {p.views?.toLocaleString?.() || p.views}</span>
										<span>❤️ {p.likes?.toLocaleString?.() || p.likes}</span>
										<span>📊 {(getEngagement(p) * 100).toFixed(2)}%</span>
									</div>
									<hr className="my-4 border-purple-200 dark:border-violet-600" />
								</div>
							))}
							{showEmbeds && setModalUrl && setShowModal && (
								<div className="flex w-full mt-4">
									{top3.map((p, i) => (
										<div
											key={i}
											className="relative rounded-2xl overflow-hidden shadow-lg bg-gray-100 flex justify-center items-end cursor-pointer"
											style={{
												width: "33.333%",
												height: 195,
												minWidth: 0,
												position: "relative",
											}}
											onClick={() => {
												setModalUrl(getPostLink(p));
												setShowModal(true);
											}}
											title="Haz clic para ver y escuchar el video"
										>
											{/* BADGE */}
											<div
												className={`
                        absolute top-2 left-4 z-10
                        flex items-center justify-center
                        rounded-full font-bold text-xs
                        backdrop-blur-md shadow
                        ${
													i === 0
														? "bg-yellow-300 text-yellow-900"
														: i === 1
															? "bg-gray-400 text-gray-700"
															: "bg-yellow-800 text-white"
												}
                        px-2 py-1 border border-white/60
                      `}
												style={{
													minWidth: 22,
													minHeight: 22,
													boxShadow: "0 2px 10px rgba(0,0,0,0.10)",
												}}
											>
												{i + 1}
											</div>
											<div
												style={{
													position: "absolute",
													bottom: 0,
													left: "50%",
													width: 325,
													height: 576,
													transform: "translateX(-50%) scale(0.34)",
													transformOrigin: "bottom center",
													pointerEvents: "none",
												}}
											>
												<TikTokEmbed url={getPostLink(p)} />
											</div>
										</div>
									))}
								</div>
							)}
						</div>
					);
				})}
			</div>
		);
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-white to-pink-100 dark:bg-gradient-to-br dark:from-violet-900 dark:to-black text-gray-900 dark:text-white p-6 space-y-6 mt-8">
			{/* Título principal con degradado morado más oscuro en modo claro y pastel en modo oscuro */}
			<h1
				className="text-5xl md:text-5xl font-extrabold text-center mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-900 via-purple-800 to-purple-900 dark:from-pink-200 dark:via-purple-200 dark:to-blue-200"
				style={{ fontFamily: "Nunito, sans-serif" }}
			>
				Dashboard ScrapeTok
			</h1>
			<h2 className="mb-1 text-center animate-fade-in">
				<div className="flex items-center justify-center gap-2 mb-2 w-full">
					<span className="text-base md:text-lg">🧠</span>
					<span
						className="text-lg md:text-2xl font-extrabold drop-shadow-sm dark:text-white text-gray-900"
						style={{ fontFamily: "Montserrat, Nunito, sans-serif" }}
					>
						Lo trending, al instante. Lo relevante, al alcance.
					</span>
					<span className="text-base md:text-lg">📊</span>
				</div>
				<span
					className="text-xs md:text-sm font-semibold w-full text-center max-w-3xl mx-auto block dark:text-gray-200 text-gray-800"
					style={{ fontFamily: "Nunito, Montserrat, sans-serif" }}
				>
					🎬 Accede a los videos, hashtags, sonidos y métricas que están
					marcando el ritmo digital global en TikTok 🌎
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
							onChange={(e) =>
								setLastFilters({ ...lastFilters, hashtags: e.target.value })
							}
						/>
					</div>
					<div className="flex items-center w-full md:w-1/2 bg-gray-100 dark:bg-gray-800 rounded-xl px-3 py-2 shadow-inner gap-2">
						<span className="text-lg text-gray-400">
							{/* Icono de lupa simple */}
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-4 w-4"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<circle
									cx="11"
									cy="11"
									r="8"
									stroke="currentColor"
									strokeWidth="2"
									fill="none"
								/>
								<line
									x1="21"
									y1="21"
									x2="16.65"
									y2="16.65"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
								/>
							</svg>
						</span>
						<input
							className="bg-transparent flex-1 outline-none text-base text-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 placeholder:text-sm"
							placeholder="Palabras clave (separadas por comas)"
							value={lastFilters?.keyWords || ""}
							onChange={(e) =>
								setLastFilters({ ...lastFilters, keyWords: e.target.value })
							}
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
									title: "¿Estás seguro?",
									text: "Esta acción limpiará todos los datos y filtros actuales. ¿Deseas continuar?",
									icon: "warning",
									showCancelButton: true,
									confirmButtonText: "Sí, limpiar",
									cancelButtonText: "Cancelar",
									confirmButtonColor: "#6366f1",
									cancelButtonColor: "#d1d5db",
									reverseButtons: true,
								});
								if (result.isConfirmed) {
									setPosts([]);

									setLastFilters(null);
									localStorage.removeItem("publishedData");
									Swal.fire(
										"¡Limpieza exitosa!",
										"Los datos han sido eliminados.",
										"success",
									);
								}
							}}
						>
							Limpiar
						</button>
					</div>
				</div>
			)}

			{showPublishedList
				? renderUniversalCards({
						data: publishedPosts,
						pageIndices,
						setModalUrl,
						setShowModal,
					})
				: renderUniversalCards({ data: posts, setModalUrl, setShowModal })}

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
							<svg
								className="w-16 h-16 mb-4 text-green-500"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<circle
									cx="12"
									cy="12"
									r="10"
									stroke="currentColor"
									strokeWidth="2"
									fill="none"
								/>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M8 12l2 2l4-4"
								/>
							</svg>
							<h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
								¡Publicado!
							</h2>
							<p className="text-gray-700 dark:text-gray-200 text-center">
								Puedes ver la alerta en tu perfil.
							</p>
						</div>
					</div>
				</div>
			)}
			{showModal && modalUrl && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
					<div
						className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl relative flex flex-col items-center justify-center"
						style={{
							padding: "1.5rem 1.5rem 1.5rem 1.5rem",
							boxSizing: "border-box",
							width: 360,
							minHeight: 576 + 48, // alto video + padding-top/bottom + boton X
							display: "flex",
							justifyContent: "center",
							alignItems: "center",
						}}
					>
						{/* Botón de cerrar */}
						<button
							onClick={() => setShowModal(false)}
							className="absolute top-3 right-5 text-3xl font-bold text-gray-500 hover:text-red-600"
							aria-label="Cerrar"
							style={{ zIndex: 10 }}
						>
							×
						</button>
						{/* Video TikTok, centrado, nunca cortado */}
						<div
							style={{
								width: 325,
								height: 576,
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
							}}
						>
							<TikTokEmbed url={modalUrl} />
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
