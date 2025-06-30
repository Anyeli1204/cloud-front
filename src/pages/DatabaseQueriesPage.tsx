// src/pages/DatabaseQueriesPage.tsx
import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import Swal from "sweetalert2";

import type { UserDBQueryRequest } from "@interfaces/db-queries/UserDBQueryRequest";
import type {
	UserDbPost,
	DbMetric,
	MetricByHashtag,
	MetricByUsername,
	MetricByDayOfWeek,
} from "@interfaces/db-queries/UserDbQueryResponse";
import { dbQueries } from "@services/db-queries/UserDbQueries";

import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	Tooltip,
	ResponsiveContainer,
	Legend,
} from "recharts";

import { FilterPanelDb } from "@components/FilterPanelDb";

type OutletContext = { activeTab: "global" | "queries" | "apify" | "users" };

export default function DatabaseQueriesPage() {
	const { activeTab } = useOutletContext<OutletContext>();

	const [filters, setFilters] = useState<UserDBQueryRequest | null>(null);
	const [posts, setPosts] = useState<UserDbPost[]>([]);
	const [metrics, setMetrics] = useState<DbMetric[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (!filters) {
			setPosts([]);
			setMetrics([]);
			return;
		}
		(async () => {
			try {
				setLoading(true);
				Swal.fire({
					title: "Cargando…",
					html: "Obteniendo datos de TikTok, por favor espera.",
					allowOutsideClick: false,
					didOpen: () => Swal.showLoading(),
				});

				const [postList, metricList] = await dbQueries(filters);
				setPosts(postList);
				setMetrics(metricList);
				setError(null);
			} catch (e: any) {
				console.error(e);
				setError(e.message || "Error al solicitar datos");
				setPosts([]);
				setMetrics([]);
			} finally {
				setLoading(false);
				Swal.close();
			}
		})();
	}, [filters]);

	// === split metrics & fallback para usernames inexistentes ===
	const primaryMetrics = (() => {
		if (filters?.hashtags?.trim()) {
			return metrics.filter(
				(m): m is MetricByHashtag => m.type === "MetricByHashtag",
			);
		} else if (filters?.tiktokUsernames?.trim()) {
			return metrics.filter(
				(m): m is MetricByUsername => m.type === "metricsByUsername",
			);
		} else {
			return [];
		}
	})();

	// fallback: si filtramos por username y no hay métricas, inyectamos un dummy cero por cada username
	let effectivePrimary = primaryMetrics;
	if (filters?.tiktokUsernames?.trim() && primaryMetrics.length === 0) {
		const names = filters.tiktokUsernames.split(",").map((u) => u.trim());
		effectivePrimary = names.map((category) => ({
			type: "metricsByUsername" as const,
			category,
			views: 0,
			likes: 0,
			avgEngagement: 0,
			interactions: 0,
		}));
	}

	const byDay = metrics.filter(
		(m): m is MetricByDayOfWeek => m.type === "byDayOfWeek",
	);

	const hasPrimary = effectivePrimary.length > 0;
	const primaryLabel =
		effectivePrimary[0]?.type === "metricsByUsername"
			? "Usernames"
			: "Hashtags";

	// build charts (siempre 6, porque en fallback habrá al menos 1 primaria)
	const charts = [
		{
			key: "p-views",
			title: `${primaryLabel} vs Views`,
			data: effectivePrimary.map((m) => ({
				category: m.category,
				value: m.views,
			})),
			bars: [{ dataKey: "value", name: "Views" }],
			xKey: "category",
		},
		{
			key: "p-likes",
			title: `${primaryLabel} vs Likes`,
			data: effectivePrimary.map((m) => ({
				category: m.category,
				value: m.likes,
			})),
			bars: [{ dataKey: "value", name: "Likes" }],
			xKey: "category",
		},
		{
			key: "p-eng",
			title: `${primaryLabel} vs Avg Engagement`,
			data: effectivePrimary.map((m) => ({
				category: m.category,
				value: m.avgEngagement,
			})),
			bars: [{ dataKey: "value", name: "Engagement" }],
			xKey: "category",
		},
		{
			key: "p-int",
			title: `${primaryLabel} vs Interactions`,
			data: effectivePrimary.map((m) => ({
				category: m.category,
				value: m.interactions,
			})),
			bars: [{ dataKey: "value", name: "Interactions" }],
			xKey: "category",
		},
		{
			key: "d-lv",
			title: "Día vs Views & Likes",
			data: byDay.map((m) => ({
				category: m.category,
				views: m.views,
				likes: m.likes,
			})),
			bars: [
				{ dataKey: "views", name: "Views" },
				{ dataKey: "likes", name: "Likes" },
			],
			xKey: "category",
		},
		{
			key: "d-eng",
			title: "Día vs Avg Engagement",
			data: byDay.map((m) => ({
				category: m.category,
				value: m.avgEngagement,
			})),
			bars: [{ dataKey: "value", name: "Engagement" }],
			xKey: "category",
		},
	];

	const PALETTE = [
		"#EF4444",
		"#EC4899",
		"#8B5CF6",
		"#3B82F6",
		"#10B981",
		"#F43F5E",
		"#6366F1",
	];
	function shuffle<T>(arr: T[]): T[] {
		return [...arr].sort(() => Math.random() - 0.5);
	}

	const renderChart = ({
		key,
		title,
		data,
		bars,
		xKey,
	}: {
		key: string;
		title: string;
		data: any[];
		bars: { dataKey: string; name?: string }[];
		xKey: string;
	}) => {
		const colors = shuffle(PALETTE);
		return (
			<div key={key} className="bg-white rounded-xl shadow-lg p-4">
				<h4 className="font-semibold mb-2">{title}</h4>
				<ResponsiveContainer width="100%" height={220}>
					<BarChart data={data}>
						<XAxis dataKey={xKey} />
						<YAxis />
						<Tooltip />
						<Legend />
						{bars.map((b, i) => (
							<Bar
								key={b.dataKey}
								dataKey={b.dataKey}
								name={b.name}
								fill={colors[i % colors.length]}
								radius={[4, 4, 0, 0]}
								barSize={60}
							/>
						))}
					</BarChart>
				</ResponsiveContainer>
			</div>
		);
	};

	if (activeTab !== "queries") return null;

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
		<div className="min-h-screen bg-gradient-to-br from-white to-pink-100 p-6 space-y-6">
			<FilterPanelDb onApply={setFilters} onReset={() => setFilters(null)} />

			{error && (
				<div className="text-red-600 text-center font-medium">{error}</div>
			)}

			{/* si aún no se ha aplicado filtro */}
			{filters === null ? null : (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{charts.map(renderChart)}
				</div>
			)}

			{/* POSTS TABLE */}
			<div className="bg-white rounded-lg shadow overflow-x-auto">
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
					<tbody className="divide-y divide-gray-200 bg-white">
						{loading ? (
							<tr>
								<td colSpan={headers.length} className="p-4 text-center">
									Cargando…
								</td>
							</tr>
						) : posts.length === 0 ? (
							<tr>
								<td colSpan={headers.length} className="p-4 text-center">
									No data yet
								</td>
							</tr>
						) : (
							posts.map((row, i) => (
								<tr
									key={`${row.postId}-${i}`}
									className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}
								>
									<td className="px-4 py-2 text-sm font-medium text-gray-800">
										{row.postId}
									</td>
									<td className="px-4 py-2 text-sm">{row.datePosted}</td>
									<td className="px-4 py-2 text-sm">{row.hourPosted}</td>
									<td className="px-4 py-2 text-sm">
										{row.usernameTiktokAccount}
									</td>
									<td className="px-4 py-2 text-sm">
										{row.postURL ? (
											<a
												href={row.postURL}
												target="_blank"
												rel="noopener noreferrer"
												className="text-purple-600 hover:underline"
											>
												{row.postURL.split("/").pop()}
											</a>
										) : (
											"–"
										)}
									</td>
									<td className="px-4 py-2 text-sm">
										{row.views.toLocaleString()}
									</td>
									<td className="px-4 py-2 text-sm">
										{row.likes.toLocaleString()}
									</td>
									<td className="px-4 py-2 text-sm">
										{row.comments.toLocaleString()}
									</td>
									<td className="px-4 py-2 text-sm">
										{row.reposts.toLocaleString()}
									</td>
									<td className="px-4 py-2 text-sm">
										{row.saves.toLocaleString()}
									</td>
									<td className="px-4 py-2 text-sm">
										{row.engagement.toFixed(2)}%
									</td>
									<td className="px-4 py-2 text-sm">
										{row.totalInteractions.toLocaleString()}
									</td>
									<td className="px-4 py-2 text-sm">{row.hashtags || "–"}</td>
									<td className="px-4 py-2 text-sm">
										{row.numberHashtags.toString()}
									</td>
									<td className="px-4 py-2 text-sm">{row.soundId}</td>
									<td className="px-4 py-2 text-sm">
										{row.soundURL ? (
											<a
												href={row.soundURL}
												target="_blank"
												rel="noopener noreferrer"
												className="text-purple-600 hover:underline"
											>
												{row.soundURL.split("/").pop()}
											</a>
										) : (
											"–"
										)}
									</td>
									<td className="px-4 py-2 text-sm">{row.regionPost}</td>
									<td className="px-4 py-2 text-sm">{row.dateTracking}</td>
									<td className="px-4 py-2 text-sm">{row.timeTracking}</td>
									<td className="px-4 py-2 text-sm">{row.userId}</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}
