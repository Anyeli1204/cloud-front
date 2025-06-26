import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import type { UserDBQueryRequest } from "@interfaces/db-queries/UserDBQueryRequest";
import type { UserDbQueryResponse } from "@interfaces/db-queries/UserDbQueryResponse";

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

// Mock data for simulation
const mockData: UserDbQueryResponse[] = [
	{
		id: 1,
		userId: 101,
		postId: "123",
		datePosted: "2025-06-20",
		hourPosted: "14:30",
		usernameTiktokAccount: "@user1",
		postURL: "https://tiktok.com/post/123",
		views: 1000,
		likes: 150,
		comments: 20,
		saves: 10,
		reposts: 5,
		totalInteractions: 185,
		engagement: 0.185,
		numberHashtags: 2,
		hashtags: "#fun,#react",
		soundId: "sound1",
		soundURL: "https://tiktok.com/sound/1",
		regionPost: "US",
		dateTracking: "2025-06-21",
		timeTracking: "09:00",
	},
	{
		id: 2,
		userId: 102,
		postId: "456",
		datePosted: "2025-06-22",
		hourPosted: "16:45",
		usernameTiktokAccount: "@user2",
		postURL: "https://tiktok.com/post/456",
		views: 2000,
		likes: 300,
		comments: 50,
		saves: 20,
		reposts: 10,
		totalInteractions: 380,
		engagement: 0.19,
		numberHashtags: 2,
		hashtags: "#react,#typescript",
		soundId: "sound2",
		soundURL: "https://tiktok.com/sound/2",
		regionPost: "EU",
		dateTracking: "2025-06-23",
		timeTracking: "11:15",
	},
	// Agrega más objetos según necesites...
];

export default function DatabaseQueriesPage() {
	const { activeTab } = useOutletContext<OutletContext>();
	const [filters, setFilters] = useState<UserDBQueryRequest | null>(null);
	const [data, setData] = useState<UserDbQueryResponse[]>([]);

	// Simulación de petición al cambiar filtros
	useEffect(() => {
		if (filters) {
			const filtered = mockData.filter((d) => {
				if (filters.datePostedFrom && d.datePosted < filters.datePostedFrom)
					return false;
				if (filters.datePostedTo && d.datePosted > filters.datePostedTo)
					return false;
				return true;
			});
			setData(filtered);
		} else {
			setData([]);
		}
	}, [filters]);

	// Datasets para las gráficas
	const [dataRegion, setDataRegion] = useState<
		{ region: string; count: number }[]
	>([]);
	const [dataHashtags, setDataHashtags] = useState<
		{ tag: string; views: number }[]
	>([]);
	const [dataSounds, setDataSounds] = useState<
		{ sound: string; views: number }[]
	>([]);
	const [dataLikesViews, setDataLikesViews] = useState<
		{ region: string; likes: number; views: number }[]
	>([]);

	// Procesar datos para gráficas
	useEffect(() => {
		const regionMap = new Map<string, number>();
		data.forEach((d) => {
			regionMap.set(d.regionPost, (regionMap.get(d.regionPost) ?? 0) + 1);
		});
		setDataRegion(
			Array.from(regionMap).map(([region, count]) => ({ region, count })),
		);

		const tagMap = new Map<string, number>();
		data.forEach((d) => {
			d.hashtags
				.split(",")
				.map((tag) => tag.trim())
				.filter(Boolean)
				.forEach((tag) => {
					tagMap.set(tag, (tagMap.get(tag) ?? 0) + d.views);
				});
		});
		setDataHashtags(Array.from(tagMap).map(([tag, views]) => ({ tag, views })));

		const soundMap = new Map<string, number>();
		data.forEach((d) => {
			soundMap.set(d.soundId, (soundMap.get(d.soundId) ?? 0) + d.views);
		});
		setDataSounds(
			Array.from(soundMap).map(([sound, views]) => ({ sound, views })),
		);

		const lvMap = new Map<string, { likes: number; views: number }>();
		data.forEach((d) => {
			const cur = lvMap.get(d.regionPost) ?? { likes: 0, views: 0 };
			cur.likes += d.likes;
			cur.views += d.views;
			lvMap.set(d.regionPost, cur);
		});
		setDataLikesViews(
			Array.from(lvMap).map(([region, { likes, views }]) => ({
				region,
				likes,
				views,
			})),
		);
	}, [data]);

	const charts = [
		{
			key: "q1",
			title: "Region vs #Posts",
			data: dataRegion,
			xKey: "region",
			bars: [{ dataKey: "count" }],
		},
		{
			key: "q2",
			title: "Hashtags vs Total Views",
			data: dataHashtags,
			xKey: "tag",
			bars: [{ dataKey: "views" }],
		},
		{
			key: "q3",
			title: "SoundId vs Views",
			data: dataSounds,
			xKey: "sound",
			bars: [{ dataKey: "views" }],
		},
		{
			key: "q4",
			title: "Likes & Views by Region",
			data: dataLikesViews,
			xKey: "region",
			bars: [{ dataKey: "likes" }, { dataKey: "views" }],
		},
	];

	const renderChart = (cfg: (typeof charts)[0]) => (
		<div key={cfg.key} className="bg-white rounded-xl shadow p-4">
			<h4 className="font-semibold mb-2">{cfg.title}</h4>
			<ResponsiveContainer width="100%" height={200}>
				<BarChart data={cfg.data}>
					<XAxis dataKey={cfg.xKey} />
					<YAxis />
					<Tooltip />
					<Legend />
					{cfg.bars.map((bar) => (
						<Bar key={bar.dataKey} dataKey={bar.dataKey} />
					))}
				</BarChart>
			</ResponsiveContainer>
		</div>
	);

	if (activeTab !== "queries") return null;
	return (
		<div className="p-6">
			<FilterPanelDb onApply={setFilters!} onReset={() => setFilters(null)} />
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{charts.map(renderChart)}
			</div>
		</div>
	);
}
