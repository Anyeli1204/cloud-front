import React from "react";
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
import ReactDOM from "react-dom";

interface Props {
	post: ApifyCallResponse;
	onClose: () => void;
}

export const PostDetailModal = ({ post, onClose }: Props) => {
	return ReactDOM.createPortal(
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-pink-200/60 via-purple-200/60 to-sky-200/60 backdrop-blur-sm">
			<div className="bg-white border-2 border-purple-200 rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-10 relative flex flex-col justify-between">
				<button
					onClick={onClose}
					className="absolute top-6 right-6 text-purple-400 hover:text-purple-700 bg-white rounded-full shadow p-2 transition-colors"
				>
					<XIcon className="w-7 h-7" />
				</button>
				<h2 className="text-3xl font-extrabold mb-8 text-center text-purple-700 tracking-tight">
					Detalles del Post
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6 text-base text-gray-700">
					<div className="space-y-3">
						<div className="flex items-center gap-2">
							<User2Icon className="w-5 h-5 text-sky-400" />
							<span className="font-semibold">Usuario TikTok:</span>{" "}
							{post.tiktokAccountUsername}
						</div>
						<div className="flex items-center gap-2">
							<CalendarIcon className="w-5 h-5 text-pink-400" />
							<span className="font-semibold">Fecha:</span> {post.datePosted} -{" "}
							{post.timePosted}
						</div>
						<div className="flex items-center gap-2">
							<HeartIcon className="w-5 h-5 text-rose-400" />
							<span className="font-semibold">Likes:</span> {post.likes}
						</div>
						<div className="flex items-center gap-2">
							<MessageCircleIcon className="w-5 h-5 text-purple-400" />
							<span className="font-semibold">Comentarios:</span>{" "}
							{post.comments}
						</div>
						<div className="flex items-center gap-2">
							<EyeIcon className="w-5 h-5 text-blue-400" />
							<span className="font-semibold">Vistas:</span> {post.views}
						</div>
						<div className="flex items-center gap-2">
							<BookmarkIcon className="w-5 h-5 text-yellow-400" />
							<span className="font-semibold">Guardados:</span> {post.saves}
						</div>
						<div className="flex items-center gap-2">
							<Repeat2Icon className="w-5 h-5 text-green-400" />
							<span className="font-semibold">Reposteado:</span>{" "}
							{post.reposted ? "Sí" : "No"}
						</div>
						<div className="flex items-center gap-2">
							<BarChart2Icon className="w-5 h-5 text-indigo-400" />
							<span className="font-semibold">Interacciones:</span>{" "}
							{post.interactions}
						</div>
					</div>
					<div className="space-y-3">
						<div className="flex items-center gap-2">
							<HashIcon className="w-5 h-5 text-purple-400" />
							<span className="font-semibold">Hashtags:</span>
						</div>
						<div className="flex flex-wrap gap-1 mt-1 mb-2">
							{post.hashtags
								.split(/[\s,]+/)
								.filter(Boolean)
								.map((tag, idx) => (
									<span
										key={idx}
										className="inline-block bg-purple-100 text-purple-700 rounded px-2 py-0.5 text-xs font-semibold shadow-sm"
									>
										#{tag.replace(/^#/, "")}
									</span>
								))}
						</div>
						<div className="flex items-center gap-2">
							<HashIcon className="w-5 h-5 text-purple-300" />
							<span className="font-semibold">Cantidad de Hashtags:</span>{" "}
							{post.numberOfHashtags}
						</div>
						<div className="flex items-center gap-2">
							<Globe2Icon className="w-5 h-5 text-green-400" />
							<span className="font-semibold">Región:</span>{" "}
							{post.regionOfPosting}
						</div>
					</div>
					<div className="space-y-3">
						<div className="flex items-center gap-2">
							<MusicIcon className="w-5 h-5 text-pink-400" />
							<span className="font-semibold">Sound ID:</span> {post.soundId}
						</div>
						<div className="flex items-center gap-2">
							<MusicIcon className="w-5 h-5 text-sky-400" />
							<span className="font-semibold">Sound URL:</span>{" "}
							<a
								href={post.soundUrl}
								target="_blank"
								className="text-purple-600 underline break-all"
							>
								{post.soundUrl}
							</a>
						</div>
						<div className="flex items-center gap-2">
							<LinkIcon className="w-5 h-5 text-purple-400" />
							<span className="font-semibold">Post URL:</span>{" "}
							<a
								href={post.postLink}
								target="_blank"
								className="text-purple-600 underline break-all"
							>
								{post.postLink}
							</a>
						</div>
						<div className="flex items-center gap-2">
							<CalendarIcon className="w-5 h-5 text-purple-300" />
							<span className="font-semibold">Track Date:</span>{" "}
							{post.trackingDate}
						</div>
						<div className="flex items-center gap-2">
							<ClockIcon className="w-5 h-5 text-blue-400" />
							<span className="font-semibold">Track Time:</span>{" "}
							{post.trackingTime}
						</div>
						<div className="flex items-center gap-2">
							<UserCircle2Icon className="w-5 h-5 text-sky-400" />
							<span className="font-semibold">Usuario (scrapeo):</span>{" "}
							{post.user}
						</div>
						{post.admin && (
							<div className="flex items-center gap-2">
								<ShieldCheckIcon className="w-5 h-5 text-purple-500" />
								<span className="font-semibold">Admin:</span> {post.admin}
							</div>
						)}
					</div>
				</div>
			</div>
		</div>,
		document.body,
	);
};
