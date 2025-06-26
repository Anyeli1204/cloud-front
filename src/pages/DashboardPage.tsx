import React, { useState } from "react";
import { NavBar } from "@components/Navbar";
import { useOutletContext } from "react-router-dom";

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

type OutletContext = { activeTab: "global" | "queries" | "apify" | "users" };

export default function DashboardPage() {
	const [fullScreenChart, setFullScreenChart] = useState<string | null>(null);
	const { activeTab } = useOutletContext<OutletContext>();

	// Datos de ejemplo (reemplaza con tu fetch)
	const dataRegion = [
		{ region: "Americas", count: 120 },
		{ region: "Europe", count: 80 },
	];
	const dataHashtags = [
		{ tag: "#react", views: 50000 },
		{ tag: "#tailwind", views: 30000 },
	];
	const dataSounds = [
		{ sound: "soundA", views: 45000 },
		{ sound: "soundB", views: 22000 },
	];
	const dataLikesViews = [
		{ region: "Americas", likes: 8000, views: 120000 },
		{ region: "Europe", likes: 6000, views: 80000 },
	];

	const charts = [
		{
			key: "r1",
			title: "Region vs Count",
			data: dataRegion,
			xKey: "region",
			bars: [{ dataKey: "count", fill: "#7f00ff" }],
		},
		{
			key: "r2",
			title: "Hashtags vs Total Views",
			data: dataHashtags,
			xKey: "tag",
			bars: [{ dataKey: "views", fill: "#e100ff" }],
		},
		{
			key: "r3",
			title: "SoundId vs Views",
			data: dataSounds,
			xKey: "sound",
			bars: [{ dataKey: "views", fill: "#ff0080" }],
		},
		{
			key: "r4",
			title: "Likes & Views by Region",
			data: dataLikesViews,
			xKey: "region",
			bars: [
				{ dataKey: "likes", fill: "#00d4ff" },
				{ dataKey: "views", fill: "#7f00ff" },
			],
		},
	];

	const renderChartCard = (cfg: (typeof charts)[0]) => (
		<div
			key={cfg.key}
			className="relative bg-white rounded-xl shadow p-4 flex flex-col"
		>
			<div className="flex justify-between items-center mb-2">
				<h4 className="text-lg font-semibold text-gray-800">{cfg.title}</h4>
				<button
					onClick={() =>
						setFullScreenChart((prev) => (prev === cfg.key ? null : cfg.key))
					}
					className="p-1 rounded hover:bg-gray-100"
				>
					<Maximize2 size={18} />
				</button>
			</div>
			<div className="flex-1">
				<ResponsiveContainer width="100%" height={200}>
					<BarChart data={cfg.data}>
						<XAxis dataKey={cfg.xKey} />
						<YAxis />
						<Tooltip />
						<Legend />
						{cfg.bars.map((bar) => (
							<Bar key={bar.dataKey} dataKey={bar.dataKey} fill={bar.fill} />
						))}
					</BarChart>
				</ResponsiveContainer>
			</div>
		</div>
	);

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Encabezado de bienvenida */}
			<div className="px-6 py-4 flex flex-col items-center justify-cente">
				<h1 className="text-3xl font-bold text-gray-800">
					Bienvenido a ScrapeTok
				</h1>
				<p className="mt-2 text-gray-600">
					Estos son los vídeos más virales diarios relacionados a palabras clave
					como cocina, fútbol, etc.
				</p>
			</div>

			{/* Gráficas en grid 2x2 */}
			<div className="p-6">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{charts.map(renderChartCard)}
				</div>
			</div>

			{/* Modal full-screen */}
			{fullScreenChart && (
				<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
					<div className="relative bg-white rounded-xl shadow-xl w-11/12 h-5/6 p-6">
						<button
							className="absolute top-4 right-4 p-2 rounded hover:bg-gray-100"
							onClick={() => setFullScreenChart(null)}
						>
							✕
						</button>
						{renderChartCard(charts.find((c) => c.key === fullScreenChart)!)}
					</div>
				</div>
			)}
		</div>
	);
}
