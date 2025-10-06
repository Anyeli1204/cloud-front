import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { ApifyCallResponse } from "@interfaces/apify-call/ApifyCallResponse";
import {
	XIcon,
	User2Icon,
	CalendarIcon,
	HeartIcon,
	MessageCircleIcon,
	EyeIcon,
	BookmarkIcon,
	Repeat2Icon,
	BarChart2Icon,
	HashIcon,
	MusicIcon,
	LinkIcon,
	Globe2Icon,
	ClockIcon,
	UserCircle2Icon,
	ShieldCheckIcon,
} from "lucide-react";
import TikTokEmbed from "./TikTokEmbedProps";

interface Props {
	post: ApifyCallResponse;
	onClose: () => void;
}

export const PostDetailModal = ({ post, onClose }: Props) => {
	// Prevenir scroll del body cuando el modal está abierto
	useEffect(() => {
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = "unset";
		};
	}, []);

	// Manejar cierre con ESC
	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				onClose();
			}
		};
		document.addEventListener("keydown", handleEscape);
		return () => document.removeEventListener("keydown", handleEscape);
	}, [onClose]);

	return ReactDOM.createPortal(
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-pink-200/60 via-purple-200/60 to-sky-200/60 backdrop-blur-sm p-4 overflow-y-auto">
			<div className="scale-95 origin-center w-full">
				<div className="flex flex-col-reverse md:flex-row items-stretch justify-center gap-4 w-full max-w-6xl bg-transparent mx-auto">
					<div className="bg-white border-2 border-purple-200 rounded-3xl shadow-2xl w-full md:w-[58%] p-6 relative flex flex-col dark:bg-white/80 overflow-y-auto max-h-[45vh] md:max-h-[90vh] self-center">
						<div className="flex justify-between items-center mb-6">
							<h2 className="text-2xl font-extrabold text-purple-700 tracking-tight">
								Detalles del Post
							</h2>
							<button
								onClick={onClose}
								className="text-purple-400 hover:text-purple-700 bg-white rounded-full shadow p-2 transition-colors dark:bg-white/80 z-10"
							>
								<XIcon className="w-6 h-6" />
							</button>
						</div>

						<div className="space-y-6 text-sm text-gray-700">
							<div>
								<h3 className="text-lg font-semibold text-purple-600 mb-2">
									Datos generales
								</h3>
								<div className="flex flex-wrap gap-x-6 gap-y-1 items-center text-sm">
									<p className="flex items-center">
										<User2Icon className="inline w-4 h-4 text-sky-400 mr-1" />
										<strong>Usuario:</strong>&nbsp;{post.usernameTiktokAccount}
									</p>
									<p className="flex items-center">
										<CalendarIcon className="inline w-4 h-4 text-pink-400 mr-1" />
										<strong>Fecha:</strong>&nbsp;{post.datePosted} -{" "}
										{post.hourPosted}
									</p>
									<p className="flex items-center">
										<Globe2Icon className="inline w-4 h-4 text-green-400 mr-1" />
										<strong>Región:</strong>&nbsp;{post.regionPost}
									</p>
								</div>
								<hr className="my-4 border-purple-200" />
							</div>

							<div>
								<h3 className="text-lg font-semibold text-purple-600 mb-2">
									Estadísticas
								</h3>
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-8">
									<p>
										<HeartIcon className="inline w-4 h-4 text-rose-400 mr-1" />
										<strong>Likes:</strong> {post.likes}
									</p>
									<p>
										<BookmarkIcon className="inline w-4 h-4 text-yellow-400 mr-1" />
										<strong>Guardados:</strong> {post.saves}
									</p>
									<p>
										<MessageCircleIcon className="inline w-4 h-4 text-purple-400 mr-1" />
										<strong>Comentarios:</strong> {post.comments}
									</p>
									<p>
										<Repeat2Icon className="inline w-4 h-4 text-green-400 mr-1" />
										<strong>Reposteado:</strong> {post.reposts ? "Sí" : "No"}
									</p>
									<p>
										<EyeIcon className="inline w-4 h-4 text-blue-400 mr-1" />
										<strong>Vistas:</strong> {post.views}
									</p>
									<p>
										<BarChart2Icon className="inline w-4 h-4 text-indigo-400 mr-1" />
										<strong>Interacciones:</strong> {post.totalInteractions}
									</p>
								</div>
								<hr className="my-4 border-purple-200" />
							</div>

							<div>
								<h3 className="text-lg font-semibold text-purple-600 mb-2">
									Hashtags
								</h3>
								<div className="flex flex-wrap gap-1">
									{post.hashtags
										.split(/[\s,]+/)
										.filter(Boolean)
										.map((tag, idx) => (
											<span
												key={idx}
												className="bg-purple-100 text-purple-700 rounded px-2 py-0.5 text-xs font-semibold shadow-sm"
											>
												#{tag.replace(/^#/, "")}
											</span>
										))}
								</div>
								<p className="mt-1">
									<HashIcon className="inline w-4 h-4 text-purple-300 mr-1" />
									<strong>Cantidad:</strong> {post.numberHashtags}
								</p>
								<hr className="my-4 border-purple-200" />
							</div>

							<div>
								<h3 className="text-lg font-semibold text-purple-600 mb-2">
									Audio
								</h3>
								<p>
									<MusicIcon className="inline w-4 h-4 text-pink-400 mr-1" />
									<strong>ID:</strong> {post.soundId}
								</p>
								<p>
									<MusicIcon className="inline w-4 h-4 text-sky-400 mr-1" />
									<strong>URL:</strong>{" "}
									<a
										href={post.soundURL}
										target="_blank"
										className="text-purple-600 underline break-all"
									>
										{post.soundURL}
									</a>
								</p>
								<hr className="my-4 border-purple-200" />
							</div>

							<div>
								<h3 className="text-lg font-semibold text-purple-600 mb-2">
									Enlaces y seguimiento
								</h3>
								<p>
									<LinkIcon className="inline w-4 h-4 text-purple-400 mr-1" />
									<strong>Post:</strong>{" "}
									<a
										href={post.postURL}
										target="_blank"
										className="text-purple-600 underline break-all"
									>
										{post.postURL}
									</a>
								</p>
								<p>
									<CalendarIcon className="inline w-4 h-4 text-purple-300 mr-1" />
									<strong>Track Date:</strong> {post.timeTracking}
								</p>
								<p>
									<ClockIcon className="inline w-4 h-4 text-blue-400 mr-1" />
									<strong>Track Time:</strong> {post.timeTracking}
								</p>
								<p>
									<UserCircle2Icon className="inline w-4 h-4 text-sky-400 mr-1" />
									<strong>Usuario (scrapeo):</strong> {post.userId}
								</p>
								{post.adminId && (
									<p>
										<ShieldCheckIcon className="inline w-4 h-4 text-purple-500 mr-1" />
										<strong>Admin:</strong> {post.adminId}
									</p>
								)}
							</div>
						</div>
					</div>

					<div className="bg-white rounded-3xl shadow-md w-full md:w-[33%] dark:bg-white/80 self-center flex items-center justify-center p-1.5 overflow-y-auto max-h-[45vh] md:max-h-[90vh]">
						<div className="w-full max-w-[400px] flex items-center justify-center">
							<TikTokEmbed url={post.postURL} />
						</div>
					</div>
				</div>
			</div>
		</div>,
		document.body,
	);
};
