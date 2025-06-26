// src/components/FilterPanel.tsx
import React, { useState } from "react";
import type { UserApifyCallRequest } from "@interfaces/apify-call/UserApifyCallRequest";

interface FilterPanelProps {
	onApply: (filters: UserApifyCallRequest) => void;
	onReset?: () => void;
}

const POPULAR_HASHTAGS = [
	"#fitness",
	"#cooking",
	"#travel",
	"#tech",
	"#beauty",
];
const POPULAR_USERS = ["@cooking_master", "@travel_vibes", "@tech_tips"];
const POPULAR_KEYWORDS = ["pizza", "recetas", "cocina", "viajes", "deporte"];

export function FilterPanel({ onApply, onReset }: FilterPanelProps) {
	const [filters, setFilters] = useState<UserApifyCallRequest>({
		userId: 0,
		hashtags: "",
		keyWords: "",
		dateFrom: "",
		dateTo: "",
		nlastPostByHashtags: undefined,
		tiktokAccount: "",
	});

	const handleChange = <K extends keyof UserApifyCallRequest>(
		key: K,
		value: UserApifyCallRequest[K],
	) => setFilters((f) => ({ ...f, [key]: value }));

	const apply = () => onApply(filters);
	const reset = () => {
		setFilters({
			userId: 0,
			hashtags: "",
			keyWords: "",
			dateFrom: "",
			dateTo: "",
			nlastPostByHashtags: undefined,
			tiktokAccount: "",
		});
		onReset?.();
	};

	const addHashtag = (tag: string) => {
		const arr = filters
			.hashtags!.split(",")
			.map((h) => h.trim())
			.filter(Boolean);
		if (!arr.includes(tag)) handleChange("hashtags", [...arr, tag].join(", "));
	};
	const addUser = (user: string) => {
		const arr = filters
			.tiktokAccount!.split(",")
			.map((u) => u.trim())
			.filter(Boolean);
		if (!arr.includes(user))
			handleChange("tiktokAccount", [...arr, user].join(", "));
	};
	const addKeyword = (kw: string) => {
		const arr = filters
			.keyWords!.split(",")
			.map((k) => k.trim())
			.filter(Boolean);
		if (!arr.includes(kw)) handleChange("keyWords", [...arr, kw].join(", "));
	};

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				apply();
			}}
			className="bg-gradient-to-br from-purple-50 to-white rounded-2xl shadow-lg p-8 mb-6 w-full"
		>
			<h2 className="text-2xl font-bold text-center text-purple-700 mb-8">
				Filtros de búsqueda
			</h2>

			{/* Primera fila: Hashtags | Usuarios | # Últimos Posts/Hashtag */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
				{/* Hashtags */}
				<div>
					<label className="block mb-1 font-medium text-gray-700">
						Hashtags
					</label>
					<input
						type="text"
						placeholder="#cocina,#futbol"
						value={filters.hashtags}
						onChange={(e) => handleChange("hashtags", e.target.value)}
						className="w-full border-2 border-purple-200 bg-white px-3 py-2 rounded-lg focus:outline-none focus:ring-purple-300"
					/>
					<div className="mt-2 flex flex-wrap gap-2">
						{POPULAR_HASHTAGS.map((tag) => (
							<button
								key={tag}
								type="button"
								onClick={() => addHashtag(tag)}
								className="text-sm px-2 py-1 bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200"
							>
								{tag}
							</button>
						))}
					</div>
				</div>

				{/* Usuarios */}
				<div>
					<label className="block mb-1 font-medium text-gray-700">
						Usuarios de TikTok
					</label>
					<input
						type="text"
						placeholder="@usuario1,@usuario2"
						value={filters.tiktokAccount}
						onChange={(e) => handleChange("tiktokAccount", e.target.value)}
						className="w-full border-2 border-purple-200 bg-white px-3 py-2 rounded-lg focus:outline-none focus:ring-purple-300"
					/>
					<div className="mt-2 flex flex-wrap gap-2">
						{POPULAR_USERS.map((user) => (
							<button
								key={user}
								type="button"
								onClick={() => addUser(user)}
								className="text-sm px-2 py-1 bg-green-100 text-green-700 rounded-full hover:bg-green-200"
							>
								{user}
							</button>
						))}
					</div>
				</div>
				{/* Palabras clave */}
				<div>
					<label className="block mb-1 font-medium text-gray-700">
						Palabras clave
					</label>
					<input
						type="text"
						placeholder="ej: pizza, recetas"
						value={filters.keyWords}
						onChange={(e) => handleChange("keyWords", e.target.value)}
						className="w-full border-2 border-purple-200 bg-white px-3 py-2 rounded-lg focus:outline-none focus:ring-purple-300"
					/>
					<div className="mt-2 flex flex-wrap gap-2">
						{POPULAR_KEYWORDS.map((kw) => (
							<button
								key={kw}
								type="button"
								onClick={() => addKeyword(kw)}
								className="text-sm px-2 py-1 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200"
							>
								{kw}
							</button>
						))}
					</div>
				</div>
			</div>

			{/* Segunda fila: Fecha Desde | Fecha Hasta | Palabras clave */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
				{/* Fecha Desde */}
				<div>
					<label className="block mb-1 font-medium text-gray-700">
						Fecha Desde
					</label>
					<input
						type="date"
						value={filters.dateFrom}
						onChange={(e) => handleChange("dateFrom", e.target.value)}
						className="w-full border-2 border-purple-200 bg-white px-3 py-2 rounded-lg focus:outline-none focus:ring-purple-300"
					/>
				</div>

				{/* Fecha Hasta */}
				<div>
					<label className="block mb-1 font-medium text-gray-700">
						Fecha Hasta
					</label>
					<input
						type="date"
						value={filters.dateTo}
						onChange={(e) => handleChange("dateTo", e.target.value)}
						className="w-full border-2 border-purple-200 bg-white px-3 py-2 rounded-lg focus:outline-none focus:ring-purple-300"
					/>
				</div>

				{/* # Últimos Posts/Hashtag */}
				<div>
					<label className="block mb-1 font-medium text-gray-700">
						# Últimos Posts/Hashtag
					</label>
					<input
						type="number"
						placeholder="Ej: 5"
						value={filters.nlastPostByHashtags ?? ""}
						onChange={(e) =>
							handleChange(
								"nlastPostByHashtags",
								e.target.value ? Number(e.target.value) : undefined,
							)
						}
						className="w-full border-2 border-purple-200 bg-white px-3 py-2 rounded-lg focus:outline-none focus:ring-purple-300"
					/>
				</div>
			</div>

			{/* Botones centrados */}
			<div className="flex justify-center gap-4">
				<button
					type="button"
					onClick={reset}
					className="bg-white border-2 border-purple-300 text-purple-700 px-6 py-2 rounded-lg hover:bg-purple-50"
				>
					Limpiar
				</button>
				<button
					type="submit"
					className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg"
				>
					Aplicar Filtros
				</button>
			</div>
		</form>
	);
}
