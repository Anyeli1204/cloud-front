// src/pages/ApifyCallPage.tsx
import React, { useState, useEffect } from "react";
import { FilterPanel } from "@components/FilterPanel";
import type { ApifyCallResponse } from "@interfaces/apify-call/ApifyCallResponse";
import { mapRawToApifyResponse } from "@interfaces/apify-call/ApifyCallResponse";
import { userApify } from "@services/apifyCall/userApifyCall";
import Swal from "sweetalert2";
import { PostDetailModal } from "@components/PostDetailModal";
import type { UserApifyCallRequest } from "@interfaces/apify-call/UserApifyCallRequest";

export default function ApifyCallPage() {
	const [data, setData] = useState<ApifyCallResponse[]>([]);
	const [savedFilters, setSavedFilters] = useState<Partial<UserApifyCallRequest> | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [selectedPost, setSelectedPost] = useState<ApifyCallResponse | null>(null); // ESTADO NUEVO

	// Al cargar la página, intenta restaurar los datos del sessionStorage
	useEffect(() => {
		const stored = sessionStorage.getItem("apifyScrapeData");
		const storedFilters = sessionStorage.getItem("apifyScrapeFilters");
		if (stored) {
			try {
				setData(JSON.parse(stored));
			} catch {/* ignore */}
		}
		if (storedFilters) {
			try {
				setSavedFilters(JSON.parse(storedFilters));
			} catch {/* ignore */}
		}
	}, []);

	const handleApplyFilters = async (filters: unknown) => {
		// 1) Abrir modal de carga
		Swal.fire({
			title: "Cargando…",
			html: "Obteniendo datos de TikTok, por favor espera.",
			allowOutsideClick: false,
			didOpen: () => Swal.showLoading(),
		});
		setLoading(true);
		setError(null);
		try {
			// Si tu endpoint devuelve objetos "raw", los mapeamos:
			const raw = await userApify(filters as Omit<UserApifyCallRequest, "userId">);
			const mapped = raw.map(mapRawToApifyResponse);
			setData(mapped);
			// Guarda en sessionStorage
			sessionStorage.setItem("apifyScrapeData", JSON.stringify(mapped));
			sessionStorage.setItem("apifyScrapeFilters", JSON.stringify(filters));
			setSavedFilters(filters as Partial<UserApifyCallRequest>);
		} catch (err: unknown) {
			let message = "Ocurrió un error al obtener los datos de TikTok.";
			if (typeof err === 'object' && err !== null && 'response' in err) {
				const response = (err as { response?: { data?: { message?: string } } }).response;
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
		sessionStorage.removeItem("apifyScrapeData");
		sessionStorage.removeItem("apifyScrapeFilters");
		setSavedFilters(null);
	};

	// Definimos aquí todas las cabeceras, incluyendo User y Admin opcionales
	const headers = [
		"Post Code",
		"Date Posted",
		"Username",
		"Post URL",
		"Views",
		"Engagement %",
		"Interactions",
		"Hashtags",
	];

	return (
		<div className="min-h-screen bg-gradient-to-br from-white to-pink-100 dark:bg-gradient-to-br dark:from-violet-900 dark:to-black text-gray-900 dark:text-white p-6 space-y-6 relative">
			<FilterPanel onApply={handleApplyFilters} onReset={handleReset} initialFilters={savedFilters} />

			{error && <div className="text-red-600 text-center">{error}</div>}

			{/* NUEVO: Mensaje cuando no hay datos y no estamos cargando */}

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
											<svg className="w-16 h-16 text-white/70" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
												<circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2.5" />
												<line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
											</svg>
										</div>
										<div className="text-2xl font-bold text-gray-700">No hay datos aún</div>
										<div className="text-gray-500 text-base mb-2">Configura tus filtros y ejecuta el scraping para ver los resultados</div>
										
									</div>
								</td>
							</tr>
						) : (
							data.map((row, i) => (
								<tr
									key={`${row.postCode}-${i}`}
									className={i % 2 === 0 ? "bg-gray-50" : "bg-white dark:bg-white/80"}
									onClick={() => setSelectedPost(row)}
								>
									<td className="px-4 py-2 text-sm font-medium text-gray-900">{row.postCode}</td>
									<td className="px-4 py-2 text-sm text-gray-900">{row.datePosted}</td>
									<td className="px-4 py-2 text-sm text-gray-900">{row.tiktokAccountUsername}</td>
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
									<td className="px-4 py-2 text-sm text-gray-900">{row.views?.toLocaleString() ?? "0"}</td>
									<td className="px-4 py-2 text-sm text-gray-900">{row.engagementRate?.toFixed(2) ?? "0.00"}%</td>
									<td className="px-4 py-2 text-sm text-gray-900">{row.interactions?.toLocaleString() ?? "0"}</td>
									<td className="px-4 py-2 text-sm text-gray-900">{row.hashtags ?? "–"}</td>
								</tr>
							))
						)}
					</tbody>
				</table>	
			</div>	
			{selectedPost && <PostDetailModal post={selectedPost} onClose={() => setSelectedPost(null)} />}

			{/* Logo Scrapi IA flotante en la parte inferior derecha, solo imagen */}
			{/* Elimino la imagen flotante de Scrapi IA en la esquina inferior derecha */}
		</div>
	);
}
