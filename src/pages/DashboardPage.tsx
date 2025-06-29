import React, { useState } from "react";
import Swal from "sweetalert2";
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	Tooltip,
	ResponsiveContainer,
	Legend,
} from "recharts";
import { Maximize2 } from "lucide-react";

import { useAuthContext } from "@contexts/AuthContext";
import { adminApify } from "@services/apifyCall/adminApifyCall";
import type { AdminApifyRequest } from "@interfaces/apify-call/AdminApifyRequest";
import type { ApifyCallResponse } from "@interfaces/apify-call/ApifyCallResponse";
import { mapRawToApifyResponse } from "@interfaces/apify-call/ApifyCallResponse";
import { ApifyFilterForm } from "@components/ApifyFilterForm";

export default function DashboardPage() {
	const { id: adminId } = useAuthContext();
	const [loading, setLoading] = useState(false);
	const [hashtagData, setHashtagData] = useState<
		{ hashtag: string; views: number }[]
	>([]);
	const [soundData, setSoundData] = useState<
		{ soundId: string; totalViews: number }[]
	>([]);
	const [fullScreenChart, setFullScreenChart] = useState<string | null>(null);

	const handleApify = async (filters: AdminApifyRequest) => {
		setLoading(true);
		// pop-up de carga
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
			const posts: ApifyCallResponse[] = (
				rawPosts as Record<string, any>[]
			).map(mapRawToApifyResponse);

			// vistas por hashtag
			const hMap = new Map<string, number>();
			posts.forEach((p) =>
				p.hashtags
					.split(",")
					.map((h) => h.trim())
					.forEach((tag) => {
						if (!tag) return;
						hMap.set(tag, (hMap.get(tag) || 0) + p.views);
					}),
			);
			setHashtagData(
				Array.from(hMap, ([hashtag, views]) => ({ hashtag, views })),
			);

			// vistas por soundId
			const sMap = new Map<string, number>();
			posts.forEach((p) =>
				sMap.set(p.soundId, (sMap.get(p.soundId) || 0) + p.views),
			);
			setSoundData(
				Array.from(sMap, ([soundId, totalViews]) => ({
					soundId,
					totalViews,
				})),
			);

			Swal.close();
		} catch (err) {
			Swal.close();
			console.error("Error adminApify:", err);
			Swal.fire("Error", "No se pudieron obtener los datos.", "error");
		} finally {
			setLoading(false);
		}
	};

	// muestra max 15 al azar
	const sample = <T,>(arr: T[]): T[] =>
		arr.length <= 15
			? arr
			: [...arr].sort(() => Math.random() - 0.5).slice(0, 15);

	const renderBar = <T,>(
		key: string,
		title: string,
		data: T[],
		xKey: keyof T,
		barKey: keyof T,
		color: string,
	) => {
		const toPlot = sample(data);
		return (
			<div key={key} className="relative bg-white rounded shadow p-4">
				<div className="flex justify-between items-center mb-2">
					<h3 className="font-semibold">{title}</h3>
					<button
						onClick={() =>
							setFullScreenChart((prev) => (prev === key ? null : key))
						}
						className="p-1 rounded hover:bg-gray-100"
					>
						<Maximize2 size={18} />
					</button>
				</div>
				<ResponsiveContainer width="100%" height={250}>
					<BarChart data={toPlot as any}>
						<XAxis dataKey={xKey as string} />
						<YAxis />
						<Tooltip />
						<Legend />
						<Bar dataKey={barKey as string} fill={color} />
					</BarChart>
				</ResponsiveContainer>
			</div>
		);
	};

	return (
		<div className="min-h-screen bg-gray-50 p-6">
			<h1 className="text-3xl font-bold mb-4 text-center">
				Dashboard ScrapeTok
			</h1>

			<ApifyFilterForm onSubmit={handleApify} loading={loading} />

			{hashtagData.length + soundData.length === 0 && !loading ? (
				<div className="text-center text-gray-600 mt-12">
					No data available yet.
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
					{renderBar(
						"hashtags",
						"Vistas vs Hashtag",
						hashtagData,
						"hashtag",
						"views",
						"#4f46e5",
					)}
					{renderBar(
						"sounds",
						"Total Views vs Sound ID",
						soundData,
						"soundId",
						"totalViews",
						"#f472b6",
					)}
				</div>
			)}

			{fullScreenChart && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
					<div className="relative bg-white rounded-xl shadow-xl w-11/12 h-5/6 p-6 overflow-auto">
						<button
							className="absolute top-4 right-4 p-2 rounded hover:bg-gray-100"
							onClick={() => setFullScreenChart(null)}
						>
							✕
						</button>
						{fullScreenChart === "hashtags" &&
							renderBar(
								"hashtags",
								"Vistas vs Hashtag",
								hashtagData,
								"hashtag",
								"views",
								"#4f46e5",
							)}
						{fullScreenChart === "sounds" &&
							renderBar(
								"sounds",
								"Total Views vs Sound ID",
								soundData,
								"soundId",
								"totalViews",
								"#f472b6",
							)}
					</div>
				</div>
			)}
		</div>
	);
}
