// src/pages/DatabaseQueriesPage.tsx
import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import Swal from "sweetalert2";
import type { UserDBQueryRequest } from "@interfaces/db-queries/UserDBQueryRequest";
import type {
	UserDbPost,
	DbMetric,
	MetricByHashtag,
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

	// When filters change, fetch from API
	useEffect(() => {
		if (!filters) {
			setPosts([]);
			setMetrics([]);
			return;
		}
		(async () => {
			try {
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
				Swal.close();
				setLoading(false);
			}
		})();
	}, [filters]);

	// Separate metrics by type
	const byHashtag = metrics.filter(
		(m): m is MetricByHashtag => m.type === "MetricByHashtag",
	);
	const byDay = metrics.filter(
		(m): m is MetricByDayOfWeek => m.type === "byDayOfWeek",
	);

	const charts = [
		{
			key: "h-views",
			title: "Hashtags vs Views",
			data: byHashtag.map((m) => ({
				category: m.category,
				value: m.views,
			})),
			bars: [{ dataKey: "value" }],
			xKey: "category",
		},
		{
			key: "h-likes",
			title: "Hashtags vs Likes",
			data: byHashtag.map((m) => ({
				category: m.category,
				value: m.likes,
			})),
			bars: [{ dataKey: "value" }],
			xKey: "category",
		},
		{
			key: "h-eng",
			title: "Hashtags vs Avg Engagement",
			data: byHashtag.map((m) => ({
				category: m.category,
				value: m.avgEngagement,
			})),
			bars: [{ dataKey: "value" }],
			xKey: "category",
		},
		{
			key: "h-int",
			title: "Hashtags vs Interactions",
			data: byHashtag.map((m) => ({
				category: m.category,
				value: m.interactions,
			})),
			bars: [{ dataKey: "value" }],
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
			bars: [{ dataKey: "value" }],
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
		<div className="p-6 space-y-6 bg-gray-50 min-h-screen">
			<FilterPanelDb onApply={setFilters} onReset={() => setFilters(null)} />
			{error && (
				<div className="text-red-600 text-center font-medium">{error}</div>
			)}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{charts.map(renderChart)}
			</div>

			{/* TABLA DE POSTS */}
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
									Sin datos
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
										{row.views?.toLocaleString() ?? "0"}
									</td>
									<td className="px-4 py-2 text-sm">
										{row.likes?.toLocaleString() ?? "0"}
									</td>
									<td className="px-4 py-2 text-sm">
										{row.comments?.toLocaleString() ?? "0"}
									</td>
									<td className="px-4 py-2 text-sm">
										{row.reposts?.toLocaleString() ?? "0"}
									</td>
									<td className="px-4 py-2 text-sm">
										{row.saves?.toLocaleString() ?? "0"}
									</td>
									<td className="px-4 py-2 text-sm">
										{row.engagement.toFixed(2)}%
									</td>
									<td className="px-4 py-2 text-sm">
										{row.totalInteractions?.toLocaleString() ?? "0"}
									</td>
									<td className="px-4 py-2 text-sm">{row.hashtags || "–"}</td>
									<td className="px-4 py-2 text-sm">
										{row.numberHashtags?.toString() ?? "0"}
									</td>
									<td className="px-4 py-2 text-sm">{row.soundId || "–"}</td>
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
