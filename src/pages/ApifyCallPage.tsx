import React, { useState } from "react";
import { FilterPanel } from "@components/FilterPanel";
import type { ApifyCallResponse } from "@interfaces/apify-call/ApifyCallResponse";

const demoData: ApifyCallResponse[] = [
	{
		postCode: "POST001",
		datePosted: "2025-06-20",
		timePosted: "14:23",
		tiktokAccountUsername: "chef_carlos",
		postLink: "https://tiktok.com/@chef_carlos/video/313131",
		views: 45230,
		likes: 5234,
		comments: 312,
		reposted: 45,
		saves: 120,
		engagementRate: 11.6,
		interactions: 5674,
		hashtags: "#cocina #recetas",
		numberOfHashtags: 2,
		soundId: "snd_rock01",
		soundUrl: "https://sounds.tiktok.com/313131",
		regionOfPosting: "Americas",
		trackingDate: "2025-06-21",
		trackingTime: "08:00",
	},
	{
		postCode: "POST002",
		datePosted: "2025-06-21",
		timePosted: "09:15",
		tiktokAccountUsername: "futbolmania",
		postLink: "https://tiktok.com/@futbolmania/video/121212",
		views: 78210,
		likes: 9123,
		comments: 756,
		reposted: 98,
		saves: 230,
		engagementRate: 13.2,
		interactions: 10177,
		hashtags: "#futbol #goles",
		numberOfHashtags: 2,
		soundId: "snd_cheer01",
		soundUrl: "https://sounds.tiktok.com/121212",
		regionOfPosting: "Europe",
		trackingDate: "2025-06-22",
		trackingTime: "10:30",
	},
	{
		postCode: "POST003",
		datePosted: "2025-06-22",
		timePosted: "18:47",
		tiktokAccountUsername: "fitnesslife",
		postLink: "https://tiktok.com/@fitnesslife/video/12121",
		views: 35120,
		likes: 4321,
		comments: 210,
		reposted: 30,
		saves: 90,
		engagementRate: 12.3,
		interactions: 4561,
		hashtags: "#gym #workout",
		numberOfHashtags: 2,
		soundId: "snd_beats01",
		soundUrl: "https://sounds.tiktok.com/2121212",
		regionOfPosting: "Asia",
		trackingDate: "2025-06-23",
		trackingTime: "07:10",
	},
	{
		postCode: "POST004",
		datePosted: "2025-06-23",
		timePosted: "12:05",
		tiktokAccountUsername: "travelwithme",
		postLink: "https://tiktok.com/@travelwithme/video/989796",
		views: 90215,
		likes: 10234,
		comments: 845,
		reposted: 120,
		saves: 310,
		engagementRate: 11.4,
		interactions: 11499,
		hashtags: "#viajes #aventura",
		numberOfHashtags: 2,
		soundId: "snd_trip01",
		soundUrl: "https://sounds.tiktok.com/989796",
		regionOfPosting: "Oceania",
		trackingDate: "2025-06-24",
		trackingTime: "16:45",
	},
	{
		postCode: "POST005",
		datePosted: "2025-06-24",
		timePosted: "20:30",
		tiktokAccountUsername: "gurumesa",
		postLink: "https://tiktok.com/@gurumesa/video/909890",
		views: 12345,
		likes: 2345,
		comments: 123,
		reposted: 20,
		saves: 85,
		engagementRate: 10.7,
		interactions: 2545,
		hashtags: "#foodie #delicioso",
		numberOfHashtags: 2,
		soundId: "snd_food01",
		soundUrl: "https://sounds.tiktok.com/989796",
		regionOfPosting: "Americas",
		trackingDate: "2025-06-25",
		trackingTime: "09:00",
	},
];

export default function ApifyCallPage() {
	const [data, setData] = useState<ApifyCallResponse[]>([]);
	const [loading, setLoading] = useState(false);

	const handleApplyFilters = async (filters: any) => {
		// Aquí llamarías tu API; por ahora mantenemos demoData
		setLoading(true);
		setTimeout(() => {
			// Simulamos filtrado local
			setData(demoData.filter((_, idx) => idx % 2 === 0));
			setLoading(false);
		}, 500);
	};

	return (
		<div className="p-6 bg-gray-50 min-h-screen space-y-6">
			<FilterPanel
				onApply={handleApplyFilters}
				onReset={() => setData(demoData)}
			/>

			<div className="bg-white rounded-lg shadow overflow-x-auto">
				<table className="min-w-full divide-y divide-gray-200">
					{/* Encabezado con fondo púrpura y textos blancos */}
					<thead className="bg-purple-600">
						<tr>
							{[
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
							].map((h) => (
								<th
									key={h}
									className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider"
								>
									{h}
								</th>
							))}
						</tr>
					</thead>

					{/* Cuerpo con filas alternas y hover */}
					<tbody className="divide-y divide-gray-200 bg-white">
						{loading ? (
							<tr>
								<td colSpan={19} className="p-4 text-center text-gray-500">
									Cargando…
								</td>
							</tr>
						) : data.length === 0 ? (
							<tr>
								<td colSpan={19} className="p-4 text-center text-gray-500">
									Sin datos
								</td>
							</tr>
						) : (
							data.map((row, i) => (
								<tr
									key={row.postCode}
									className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}
								>
									<td className="px-4 py-2 text-sm font-medium text-gray-800">
										{row.postCode}
									</td>
									<td className="px-4 py-2 text-sm">{row.datePosted}</td>
									<td className="px-4 py-2 text-sm">{row.timePosted}</td>
									<td className="px-4 py-2 text-sm">
										{row.tiktokAccountUsername}
									</td>
									<td className="px-4 py-2 text-sm">
										{(() => {
											const videoId = row.postLink.split("/").pop();
											return (
												<a
													href={row.postLink}
													target="_blank"
													rel="noopener noreferrer"
													className="text-purple-600 hover:underline"
												>
													{videoId}
												</a>
											);
										})()}
									</td>
									<td className="px-4 py-2 text-sm">
										{row.views.toLocaleString()}
									</td>
									<td className="px-4 py-2 text-sm">
										{row.likes.toLocaleString()}
									</td>
									<td className="px-4 py-2 text-sm">{row.comments}</td>
									<td className="px-4 py-2 text-sm">{row.reposted}</td>
									<td className="px-4 py-2 text-sm">{row.saves}</td>
									<td className="px-4 py-2 text-sm">{row.engagementRate}%</td>
									<td className="px-4 py-2 text-sm">{row.interactions}</td>
									<td className="px-4 py-2 text-sm">
										<span className="text-gray-700">{row.hashtags}</span>
									</td>
									<td className="px-4 py-2 text-sm">{row.numberOfHashtags}</td>
									<td className="px-4 py-2 text-sm">{row.soundId}</td>
									<td className="px-4 py-2 text-sm">
										{(() => {
											const soundId = row.soundUrl.split("/").pop();
											return (
												<a
													href={row.soundUrl}
													target="_blank"
													rel="noopener noreferrer"
													className="text-purple-600 hover:underline"
												>
													{soundId}
												</a>
											);
										})()}
									</td>
									<td className="px-4 py-2 text-sm">{row.regionOfPosting}</td>
									<td className="px-4 py-2 text-sm">{row.trackingDate}</td>
									<td className="px-4 py-2 text-sm">{row.trackingTime}</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}
