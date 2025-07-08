// src/pages/ApifyCallPage.tsx
import React, { useState } from "react";
import { FilterPanel } from "@components/FilterPanel";
import type { ApifyCallResponse } from "@interfaces/apify-call/ApifyCallResponse";
import { mapRawToApifyResponse } from "@interfaces/apify-call/ApifyCallResponse";
import { userApify } from "@services/apifyCall/userApifyCall";
import Swal from "sweetalert2";
import { PostDetailModal } from "@components/PostDetailModal";

export default function ApifyCallPage() {
	const [data, setData] = useState<ApifyCallResponse[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [selectedPost, setSelectedPost] = useState<ApifyCallResponse | null>(null); // ESTADO NUEVO

	const handleApplyFilters = async (filters: any) => {
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
			const raw = await userApify(filters);
			const mapped = raw.map(mapRawToApifyResponse);
			setData(mapped);
		} catch (err: any) {
			console.error(err);
			setError(
				err.response?.data?.message ||
					"Ocurrió un error al obtener los datos de TikTok.",
			);
			setData([]);
		} finally {
			setLoading(false);
			// 2) Cerrar modal de carga
			Swal.close();
		}
	};

	const handleReset = () => {
		setData([]);
		setError(null);
	};

	// Definimos aquí todas las cabeceras, incluyendo User y Admin opcionales
	const headers = [
		"Post Code",
		"Date Posted",
		"Time Posted",
		"Username",
		"Post URL",
		"Views",
		"Likes",
		"Comments",
		"Reposts",
		"Saves",
		"Engagement %",
		"Interactions",
		"Hashtags",
		"Amount Hashtags",
		"Sound ID",
		"Sound URL",
		"Region",
		"Track Date",
		"Track Time",
		"User",
	];

	return (
		<div className="min-h-screen bg-gradient-to-br from-white to-pink-100 dark:bg-gradient-to-br dark:from-violet-900 dark:to-black text-gray-900 dark:text-white p-6 space-y-6">
			<FilterPanel onApply={handleApplyFilters} onReset={handleReset} />

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
								<td colSpan={headers.length} className="p-4 text-center text-gray-700">
									No data yet
								</td>
							</tr>
						) : (
							data.map((row, i) => (
								<tr
									key={`${row.postCode}-${i}`}
									className={i % 2 === 0 ? "bg-gray-50" : "bg-white dark:bg-white/80"}
									onClick={() => setSelectedPost(row)}
								>
									<td className="px-4 py-2 text-sm font-medium text-gray-900">
										{row.postCode}
									</td>
									<td className="px-4 py-2 text-sm text-gray-900">{row.datePosted}</td>
									<td className="px-4 py-2 text-sm text-gray-900">{row.timePosted}</td>
									<td className="px-4 py-2 text-sm text-gray-900">
										{row.tiktokAccountUsername}
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
										{row.comments?.toLocaleString() ?? "0"}
									</td>
									<td className="px-4 py-2 text-sm text-gray-900">
										{row.reposted?.toLocaleString() ?? "0"}
									</td>
									<td className="px-4 py-2 text-sm text-gray-900">
										{row.saves?.toLocaleString() ?? "0"}
									</td>
									<td className="px-4 py-2 text-sm text-gray-900">
										{row.engagementRate?.toFixed(2) ?? "0.00"}%
									</td>
									<td className="px-4 py-2 text-sm text-gray-900">
										{row.interactions?.toLocaleString() ?? "0"}
									</td>
									<td className="px-4 py-2 text-sm text-gray-900">{row.hashtags ?? "–"}</td>
									<td className="px-4 py-2 text-sm text-gray-900">
										{row.numberOfHashtags?.toString() ?? "0"}
									</td>
									<td className="px-4 py-2 text-sm text-gray-900">{row.soundId ?? "–"}</td>
									<td className="px-4 py-2 text-sm text-gray-900">
										{row.soundUrl ? (
											<a
												href={row.soundUrl}
												target="_blank"
												rel="noopener noreferrer"
												className="text-purple-600 hover:underline"
											>
												{row.soundUrl.split("/").pop() ?? "–"}
											</a>
										) : (
											"–"
										)}
									</td>
									<td className="px-4 py-2 text-sm text-gray-900">
										{row.regionOfPosting ?? "–"}
									</td>
									<td className="px-4 py-2 text-sm text-gray-900">
										{row.trackingDate ?? "–"}
									</td>
									<td className="px-4 py-2 text-sm text-gray-900">
										{row.trackingTime ?? "–"}
									</td>
									<td className="px-4 py-2 text-sm text-gray-900">{row.user ?? "–"}</td>
								</tr>
							))
						)}
					</tbody>
				</table>	
			</div>	
			{selectedPost && <PostDetailModal post={selectedPost} onClose={() => setSelectedPost(null)} />}
		</div>
	);
}
