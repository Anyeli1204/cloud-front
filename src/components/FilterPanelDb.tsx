// src/components/FilterPanelDb.tsx
import React, { useState } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { User, Hash, Globe, Calendar, Link as LinkIcon } from "lucide-react";
import type { UserDBQueryRequest } from "@interfaces/db-queries/UserDBQueryRequest";

const MySwal = withReactContent(Swal);

interface FilterPanelDbProps {
	onApply: (filters: UserDBQueryRequest) => void;
	onReset?: () => void;
}

type NumericField =
	| "minViews"
	| "maxViews"
	| "minLikes"
	| "maxLikes"
	| "minEngagement"
	| "maxEngagement"
	| "minTotalInteractions"
	| "maxTotalInteractions";

const numericFields: Array<{
	key: NumericField;
	max: NumericField;
	label: string;
	step?: number;
}> = [
	{ key: "minViews", max: "maxViews", label: "Vistas" },
	{ key: "minLikes", max: "maxLikes", label: "Likes" },
	{
		key: "minEngagement",
		max: "maxEngagement",
		label: "Engagement",
		step: 0.01,
	},
	{
		key: "minTotalInteractions",
		max: "maxTotalInteractions",
		label: "Interacciones",
	},
];

export function FilterPanelDb({ onApply, onReset }: FilterPanelDbProps) {
	const initial: UserDBQueryRequest = {
		userId: 0,
		tiktokUsernames: "",
		postId: "",
		regionPost: "",
		datePostedFrom: "",
		datePostedTo: "",
		minViews: undefined,
		maxViews: undefined,
		minLikes: undefined,
		maxLikes: undefined,
		minEngagement: undefined,
		maxEngagement: undefined,
		minTotalInteractions: undefined,
		maxTotalInteractions: undefined,
		hashtags: "",
		soundId: "",
		soundURL: "",
	};
	const [f, setF] = useState<UserDBQueryRequest>(initial);

	const handleChange = <K extends keyof UserDBQueryRequest>(
		key: K,
		value: UserDBQueryRequest[K],
	) => {
		if (key === "tiktokUsernames") {
			setF((p) => ({ ...p, tiktokUsernames: value as string, hashtags: "" }));
		} else if (key === "hashtags") {
			setF((p) => ({ ...p, hashtags: value as string, tiktokUsernames: "" }));
		} else {
			setF((p) => ({ ...p, [key]: value }));
		}
	};

	const inputCls =
		"w-full border-2 border-purple-200 bg-white pl-10 pr-3 py-1.5 rounded-lg focus:outline-none focus:ring-purple-300 transition text-sm text-gray-900";

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const hasUsers = !!f.tiktokUsernames!.trim();
		const hasTags = !!f.hashtags!.trim();

		if (!(hasUsers !== hasTags)) {
			MySwal.fire({
				icon: "error",
				iconHtml: "❌",
				title: "<strong>¡Filtros inválidos!</strong>",
				html: `
          <div style="text-align:left; font-size:1.125rem; line-height:1.3;">
            <p>• <strong>Elegir uno:</strong> TikTok Usernames o Hashtags.</p>
          </div>
        `,
				background: "#fff",
				backdrop: "rgba(0,0,0,0.7)",
				customClass: {
					popup: "rounded-2xl shadow-2xl p-8 max-w-lg",
					title: "text-3xl text-red-600 mb-4",
					htmlContainer: "mt-2",
					confirmButton:
						"bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg text-lg",
				},
				showCloseButton: true,
				confirmButtonText: "Entendido",
				allowOutsideClick: false,
			});
			return;
		}

		onApply(f);
	};

	const handleReset = () => {
		setF(initial);
		onReset?.();
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="bg-white rounded-2xl shadow-lg p-8 mb-6 w-full dark:bg-white/80"
		>
			<h2 className="text-3xl font-bold mb-6 text-center text-purple-800">
				Filtros Database Queries
			</h2>

			{/* FILA 1 */}
			<div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-6">
				{/* TikTok Usernames */}
				<div>
					<label className="block mb-1 font-medium text-gray-700">
						TikTok Usernames
					</label>
					<div className="relative">
						<User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
						<input
							type="text"
							placeholder="user1,user2"
							value={f.tiktokUsernames}
							onChange={(e) => handleChange("tiktokUsernames", e.target.value)}
							className={inputCls}
						/>
					</div>
				</div>

				{/* Hashtags */}
				<div>
					<label className="block mb-1 font-medium text-gray-700">
						Hashtags
					</label>
					<div className="relative">
						<Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
						<input
							type="text"
							placeholder="#tag1,#tag2"
							value={f.hashtags}
							onChange={(e) => handleChange("hashtags", e.target.value)}
							className={inputCls}
						/>
					</div>
				</div>

				{/* Región */}
				<div>
					<label className="block mb-1 font-medium text-gray-700">Región</label>
					<div className="relative">
						<Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
						<input
							type="text"
							placeholder="US, EU..."
							value={f.regionPost}
							onChange={(e) => handleChange("regionPost", e.target.value)}
							className={inputCls}
						/>
					</div>
				</div>

				{/* Post ID */}
				<div>
					<label className="block mb-1 font-medium text-gray-700">
						Post ID
					</label>
					<div className="relative">
						<LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
						<input
							type="text"
							placeholder="123,456"
							value={f.postId}
							onChange={(e) => handleChange("postId", e.target.value)}
							className={inputCls}
						/>
					</div>
				</div>

				{/* Fecha Desde */}
				<div>
					<label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">
						Fecha Desde
					</label>
					<div className="relative">
						<Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
						<input
							type="date"
							value={f.datePostedFrom}
							onChange={(e) => handleChange("datePostedFrom", e.target.value)}
							className={inputCls + " dark:placeholder-gray-500"}
						/>
					</div>
				</div>

				{/* Fecha Hasta */}
				<div>
					<label className="block mb-1 font-medium text-gray-700 dark:text-gray-300">
						Fecha Hasta
					</label>
					<div className="relative">
						<Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
						<input
							type="date"
							value={f.datePostedTo}
							onChange={(e) => handleChange("datePostedTo", e.target.value)}
							className={inputCls + " dark:placeholder-gray-500"}
						/>
					</div>
				</div>
			</div>

			{/* FILA 2 */}
			<div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-6">
				{numericFields.map(({ key, max, label, step }) => (
					<div key={key}>
						<label className="block mb-1 font-medium text-gray-700">
							{label}
						</label>
						<div className="flex gap-2">
							<input
								type="number"
								step={step ?? 1}
								placeholder="Min"
								value={f[key] ?? ""}
								onChange={(e) => handleChange(key, e.target.valueAsNumber)}
								className="w-1/2 border-2 border-purple-200 bg-white px-3 py-1.5 rounded-lg focus:outline-none focus:ring-purple-300 transition text-sm text-gray-900"
							/>
							<input
								type="number"
								step={step ?? 1}
								placeholder="Max"
								value={f[max] ?? ""}
								onChange={(e) => handleChange(max, e.target.valueAsNumber)}
								className="w-1/2 border-2 border-purple-200 bg-white px-3 py-1.5 rounded-lg focus:outline-none focus:ring-purple-300 transition text-sm text-gray-900"
							/>
						</div>
					</div>
				))}

				{/* Sound ID */}
				<div>
					<label className="block mb-1 font-medium text-gray-700">
						Sound ID
					</label>
					<div className="relative">
						<LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
						<input
							type="text"
							placeholder="sound1"
							value={f.soundId}
							onChange={(e) => handleChange("soundId", e.target.value)}
							className={inputCls}
						/>
					</div>
				</div>

				{/* URL Sound */}
				<div>
					<label className="block mb-1 font-medium text-gray-700">
						URL Sound
					</label>
					<div className="relative">
						<LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
						<input
							type="text"
							placeholder="https://..."
							value={f.soundURL}
							onChange={(e) => handleChange("soundURL", e.target.value)}
							className={inputCls}
						/>
					</div>
				</div>
			</div>

			{/* Botones */}
			<div className="flex justify-center gap-4">
				<button
					type="button"
					onClick={handleReset}
					className="bg-white border-2 border-purple-300 text-purple-700 px-6 py-2 rounded-lg hover:bg-purple-50 transition"
				>
					Limpiar
				</button>
				<button
					type="submit"
					className="px-6 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition"
				>
					Aplicar
				</button>
			</div>
		</form>
	);
}
