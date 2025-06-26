// src/components/FilterPanelDb.tsx
import React, { useState } from "react";
import type { UserDBQueryRequest } from "@interfaces/db-queries/UserDBQueryRequest";

interface FilterPanelDbProps {
	onApply: (filters: UserDBQueryRequest) => void;
	onReset?: () => void;
}

// Definimos un tipo que asegure que minKey y maxKey son claves válidas
type MetricKey = {
	label: string;
	minKey: keyof UserDBQueryRequest;
	maxKey: keyof UserDBQueryRequest;
	step?: number;
};

export function FilterPanelDb({ onApply, onReset }: FilterPanelDbProps) {
	const initial: UserDBQueryRequest = {
		tiktokUsernames: "",
		postId: "",
		datePostedFrom: "",
		datePostedTo: "",
		postURL: "",
		minViews: undefined,
		maxViews: undefined,
		minLikes: undefined,
		maxLikes: undefined,
		minTotalInteractions: undefined,
		maxTotalInteractions: undefined,
		minEngagement: undefined,
		maxEngagement: undefined,
		hashtags: "",
		soundId: "",
		soundURL: "",
		regionPost: "",
	};
	const [filters, setFilters] = useState<UserDBQueryRequest>(initial);

	const handleChange = <K extends keyof UserDBQueryRequest>(
		key: K,
		value: UserDBQueryRequest[K],
	) => setFilters((prev) => ({ ...prev, [key]: value }));

	const apply = () => onApply(filters);
	const reset = () => {
		setFilters(initial);
		onReset?.();
	};

	const input =
		"w-full px-2 py-1 rounded border border-purple-300 focus:ring-purple-400 focus:border-transparent transition";

	// Array tipado de métricas
	const metrics: MetricKey[] = [
		{ label: "Vistas", minKey: "minViews", maxKey: "maxViews" },
		{ label: "Likes", minKey: "minLikes", maxKey: "maxLikes" },
		{
			label: "Engagement",
			minKey: "minEngagement",
			maxKey: "maxEngagement",
			step: 0.01,
		},
		{
			label: "Interacciones",
			minKey: "minTotalInteractions",
			maxKey: "maxTotalInteractions",
		},
	];

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				apply();
			}}
			className="bg-purple-50 rounded-xl shadow p-4 mb-4"
		>
			<h2 className="text-xl font-bold text-purple-700 mb-4 text-center">
				🎛️ Filtros Database Queries
			</h2>

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
				{/* Usuarios TikTok */}
				<div className="col-span-1 sm:col-span-2 lg:col-span-1">
					<label className="block text-sm font-medium text-purple-600 mb-1">
						Usuarios
					</label>
					<input
						type="text"
						placeholder="@user1,@user2"
						value={filters.tiktokUsernames}
						onChange={(e) => handleChange("tiktokUsernames", e.target.value)}
						className={input}
					/>
				</div>

				{/* Post ID */}
				<div>
					<label className="block text-sm font-medium text-purple-600 mb-1">
						Post ID
					</label>
					<input
						type="text"
						placeholder="123,456"
						value={filters.postId}
						onChange={(e) => handleChange("postId", e.target.value)}
						className={input}
					/>
				</div>

				{/* Región */}
				<div>
					<label className="block text-sm font-medium text-purple-600 mb-1">
						Región
					</label>
					<input
						type="text"
						placeholder="US, EU..."
						value={filters.regionPost}
						onChange={(e) => handleChange("regionPost", e.target.value)}
						className={input}
					/>
				</div>

				{/* Fechas */}
				<div className="col-span-1 sm:col-span-2 lg:col-span-4 grid grid-cols-2 gap-3">
					<div>
						<label className="block text-sm font-medium text-purple-600 mb-1">
							Desde
						</label>
						<input
							type="date"
							value={filters.datePostedFrom}
							onChange={(e) => handleChange("datePostedFrom", e.target.value)}
							className={input}
						/>
					</div>
					<div>
						<label className="block text-sm font-medium text-purple-600 mb-1">
							Hasta
						</label>
						<input
							type="date"
							value={filters.datePostedTo}
							onChange={(e) => handleChange("datePostedTo", e.target.value)}
							className={input}
						/>
					</div>
				</div>

				{/* Métricas en una fila */}
				<div className="col-span-1 sm:col-span-2 lg:col-span-4 grid grid-cols-2 md:grid-cols-4 gap-3">
					{metrics.map((m, i) => (
						<div key={i} className="space-y-1">
							<label className="block text-sm font-medium text-purple-600">
								{m.label}
							</label>
							<div className="flex gap-2">
								<input
									type="number"
									step={m.step ?? 1}
									placeholder="Min"
									value={(filters[m.minKey] as number) ?? ""}
									onChange={(e) =>
										handleChange(m.minKey, e.target.valueAsNumber as any)
									}
									className={input}
								/>
								<input
									type="number"
									step={m.step ?? 1}
									placeholder="Max"
									value={(filters[m.maxKey] as number) ?? ""}
									onChange={(e) =>
										handleChange(m.maxKey, e.target.valueAsNumber as any)
									}
									className={input}
								/>
							</div>
						</div>
					))}
				</div>

				{/* Hashtags */}
				<div>
					<label className="block text-sm font-medium text-purple-600 mb-1">
						Hashtags
					</label>
					<input
						type="text"
						placeholder="#tag1,#tag2"
						value={filters.hashtags}
						onChange={(e) => handleChange("hashtags", e.target.value)}
						className={input}
					/>
				</div>

				{/* Sonido */}
				<div>
					<label className="block text-sm font-medium text-purple-600 mb-1">
						Sound ID
					</label>
					<input
						type="text"
						placeholder="sound1"
						value={filters.soundId}
						onChange={(e) => handleChange("soundId", e.target.value)}
						className={input}
					/>
				</div>
				<div>
					<label className="block text-sm font-medium text-purple-600 mb-1">
						URL Sound
					</label>
					<input
						type="text"
						placeholder="https://..."
						value={filters.soundURL}
						onChange={(e) => handleChange("soundURL", e.target.value)}
						className={input}
					/>
				</div>
			</div>

			<div className="mt-4 flex justify-end gap-2">
				<button
					type="button"
					onClick={reset}
					className="px-4 py-1 bg-white border border-purple-300 text-purple-600 rounded hover:bg-purple-50 transition"
				>
					Limpiar
				</button>
				<button
					type="submit"
					className="px-4 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
				>
					Aplicar
				</button>
			</div>
		</form>
	);
}
