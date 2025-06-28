// src/components/FilterPanel.tsx
import React, { useState, useMemo } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import type { UserApifyCallRequest } from "@interfaces/apify-call/UserApifyCallRequest";

const MySwal = withReactContent(Swal);

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
		tiktokAccount: "",
		keyWords: "",
		dateFrom: "",
		dateTo: "",
		nlastPostByHashtags: undefined,
	});

	const handleChange = <K extends keyof UserApifyCallRequest>(
		key: K,
		value: UserApifyCallRequest[K],
	) => {
		if (key === "hashtags") {
			setFilters((f) => ({
				...f,
				hashtags: value as string,
				tiktokAccount: "",
				keyWords: "",
			}));
		} else if (key === "tiktokAccount") {
			setFilters((f) => ({
				...f,
				tiktokAccount: value as string,
				hashtags: "",
				keyWords: "",
			}));
		} else if (key === "keyWords") {
			setFilters((f) => ({
				...f,
				keyWords: value as string,
				hashtags: "",
				tiktokAccount: "",
			}));
		} else {
			setFilters((f) => ({ ...f, [key]: value }));
		}
	};

	const mainCount = useMemo(
		() =>
			[filters.hashtags, filters.tiktokAccount, filters.keyWords].filter(
				(v) => v && v.trim(),
			).length,
		[filters],
	);

	const mandatoryFilled =
		!!filters.dateFrom &&
		!!filters.dateTo &&
		filters.nlastPostByHashtags !== undefined;

	const isValid = mainCount === 1 && mandatoryFilled;

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!isValid) {
			MySwal.fire({
				icon: "error",
				iconHtml: "❌",
				title: "<strong>¡Filtros inválidos!</strong>",
				html: `
    <div style="text-align:left; font-size:1.125rem; line-height:1.6;">
      <p>• <strong>Obligatorios: </strong> Fechas y # Últimos N Post.</p>
      <p>• <strong>Elegir uno: </strong> Hashtags o Usuarios o Keywords.</p>
    </div>
  `,
				background: "#fff",
				backdrop: "rgba(0,0,0,0.7)",
				customClass: {
					popup: "rounded-2xl shadow-2xl p-8 max-w-lg", // <-- ancho mayor
					title: "text-3xl text-red-600 mb-4", // <-- título más grande
					htmlContainer: "mt-2", // margen superior más pequeño
					confirmButton:
						"bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg text-lg", // botón más grande
				},
				showCloseButton: true,
				confirmButtonText: "Entendido",
				allowOutsideClick: false,
			});

			return;
		}

		onApply(filters);
	};

	const handleReset = () => {
		setFilters({
			userId: 0,
			hashtags: "",
			tiktokAccount: "",
			keyWords: "",
			dateFrom: "",
			dateTo: "",
			nlastPostByHashtags: undefined,
		});
		onReset?.();
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="bg-gradient-to-br from-purple-50 to-white rounded-2xl shadow-lg p-6 mb-6 w-full"
		>
			<h2 className="text-2xl font-bold text-center text-purple-700 mb-8">
				Filtros Apify Call
			</h2>

			{/* Filtros principales */}
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
								onClick={() => handleChange("hashtags", tag)}
								className="text-sm px-2 py-1 bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200"
							>
								{tag}
							</button>
						))}
					</div>
				</div>

				{/* Usuarios de TikTok */}
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
						{POPULAR_USERS.map((u) => (
							<button
								key={u}
								type="button"
								onClick={() => handleChange("tiktokAccount", u)}
								className="text-sm px-2 py-1 bg-green-100 text-green-700 rounded-full hover:bg-green-200"
							>
								{u}
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
								onClick={() => handleChange("keyWords", kw)}
								className="text-sm px-2 py-1 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200"
							>
								{kw}
							</button>
						))}
					</div>
				</div>
			</div>

			{/* Campos obligatorios */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
				<div>
					<label className="block mb-1 font-medium text-gray-700">
						Fecha Desde *
					</label>
					<input
						type="date"
						value={filters.dateFrom}
						onChange={(e) => handleChange("dateFrom", e.target.value)}
						className="w-full border-2 border-purple-200 bg-white px-3 py-2 rounded-lg focus:outline-none focus:ring-purple-300"
					/>
				</div>
				<div>
					<label className="block mb-1 font-medium text-gray-700">
						Fecha Hasta *
					</label>
					<input
						type="date"
						value={filters.dateTo}
						onChange={(e) => handleChange("dateTo", e.target.value)}
						className="w-full border-2 border-purple-200 bg-white px-3 py-2 rounded-lg focus:outline-none focus:ring-purple-300"
					/>
				</div>
				<div>
					<label className="block mb-1 font-medium text-gray-700">
						# Últimos N Post
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

			{/* Botones */}
			<div className="flex justify-center gap-4">
				<button
					type="button"
					onClick={handleReset}
					className="bg-white border-2 border-purple-300 text-purple-700 px-6 py-2 rounded-lg hover:bg-purple-50"
				>
					Limpiar
				</button>
				<button
					type="submit"
					className="px-6 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700"
				>
					Aplicar Filtros
				</button>
			</div>
		</form>
	);
}
