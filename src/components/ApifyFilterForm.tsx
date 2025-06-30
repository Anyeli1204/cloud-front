// src/components/ApifyFilterForm.tsx
import React, { useState } from "react";
import Swal from "sweetalert2";
import type { AdminApifyRequest } from "@interfaces/apify-call/AdminApifyRequest";
import { Hash, Edit3 } from "lucide-react";

interface ApifyFilterFormProps {
	onSubmit: (filters: AdminApifyRequest) => void;
	loading: boolean;
}

export function ApifyFilterForm({ onSubmit, loading }: ApifyFilterFormProps) {
	const [hashtags, setHashtags] = useState("");
	const [keyWords, setKeyWords] = useState("");

	const handleClick = () => {
		if (!hashtags.trim() && !keyWords.trim()) {
			Swal.fire({
				icon: "error",
				iconHtml: "❌",
				title: "<strong>¡Filtros inválidos!</strong>",
				html: `
          <div style="text-align:left; font-size:1.125rem; line-height:1.6;">
            <p>• <strong>Obligatorios:</strong> Fechas y # Últimos N Post.</p>
            <p>• <strong>Elegir uno:</strong> Hashtags o Keywords.</p>
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
		onSubmit({ hashtags, keyWords });
	};

	const handleClear = () => {
		setHashtags("");
		setKeyWords("");
	};

	return (
		<div className="w-full bg-gradient-to-br from-white to-gray-100 rounded-2xl shadow-lg p-6 mb-6">
			<div className="flex flex-wrap items-center gap-4">
				<div className="flex-1 min-w-[200px] relative">
					<label className="sr-only">Hashtags</label>
					<Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
					<input
						type="text"
						value={hashtags}
						onChange={(e) => setHashtags(e.target.value)}
						placeholder="#cocina, #futbol"
						className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-200 transition"
					/>
				</div>
				<div className="flex-1 min-w-[200px] relative">
					<label className="sr-only">Key Words</label>
					<Edit3 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
					<input
						type="text"
						value={keyWords}
						onChange={(e) => setKeyWords(e.target.value)}
						placeholder="viajes, gastronomía"
						className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring focus:ring-blue-200 transition"
					/>
				</div>
				<button
					onClick={handleClick}
					disabled={loading}
					className="flex-none inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-lg transition disabled:opacity-50"
				>
					{loading && (
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
								d="M4 12a8 8 0 018-8v8H4z"
							/>
						</svg>
					)}
					<span>{loading ? "Cargando…" : "Buscar"}</span>
				</button>
				<button
					onClick={handleClear}
					className="flex-none bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium px-5 py-2 rounded-lg transition"
				>
					Limpiar
				</button>
			</div>
		</div>
	);
}
