import React, { useState, useEffect } from "react";
import { 
	TrendingUp, 
	Users, 
	BarChart3, 
	Eye, 
	Heart, 
	RefreshCw,
	Filter,
	Activity,
	Award,
	Hash
} from "lucide-react";
import { getConsolidatedDashboard } from "@services/orchestrator/getConsolidatedDashboard";
import { getConsolidatedSummary } from "@services/orchestrator/getConsolidatedSummary";
import type { ConsolidatedDashboardResponse } from "@interfaces/orchestrator/ConsolidatedDashboard";
import type { ConsolidatedSummaryResponse } from "@interfaces/orchestrator/ConsolidatedSummary";
import { useAuthContext } from "@contexts/AuthContext";
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
	LineChart,
	Line,
	PieChart,
	Pie,
	Cell,
} from "recharts";

const COLORS = ["#007BFF", "#FF4081", "#4CAF50", "#FFC107", "#9C27B0"];

export default function OrchestratorPage() {
	const { id: userId, role } = useAuthContext();
	const [loading, setLoading] = useState(false);
	const [dashboardData, setDashboardData] = useState<ConsolidatedDashboardResponse | null>(null);
	const [summaryData, setSummaryData] = useState<ConsolidatedSummaryResponse | null>(null);
	const [filterUserId, setFilterUserId] = useState<string>("");
	const [activeView, setActiveView] = useState<"consolidated" | "summary" | "rankings">("consolidated");

	useEffect(() => {
		loadData();
	}, []);

	const loadData = async (userFilter?: number) => {
		setLoading(true);
		try {
			const [dashboard, summary] = await Promise.all([
				getConsolidatedDashboard(userFilter),
				getConsolidatedSummary(userFilter)
			]);
			setDashboardData(dashboard);
			setSummaryData(summary);
		} catch (error) {
			console.error("Error loading orchestrator data:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleFilter = () => {
		const userId = filterUserId.trim() ? parseInt(filterUserId) : undefined;
		loadData(userId);
	};

	const handleRefresh = () => {
		setFilterUserId("");
		loadData();
	};

	const formatNumber = (num: number): string => {
		if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
		if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
		return num.toString();
	};

	const renderServiceStatus = () => {
		if (!dashboardData?.metadata?.services_status) return null;

		const statuses = dashboardData.metadata.services_status;
		return (
			<div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
				{Object.entries(statuses).map(([service, status]) => (
					<div
						key={service}
						className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg p-3 border border-gray-200 dark:border-gray-700"
					>
						<div className="flex items-center justify-between">
							<span className="text-xs font-medium text-gray-600 dark:text-gray-400">
								{service.replace("microservice", "MS")}
							</span>
							<div
								className={`w-2 h-2 rounded-full ${
									status === "ok" ? "bg-green-500" : "bg-red-500"
								}`}
							/>
						</div>
					</div>
				))}
			</div>
		);
	};

	const renderStatsCards = () => {
		if (!summaryData?.summary) return null;

		const stats = [
			{
				icon: <Users className="w-6 h-6" />,
				label: "Total Users",
				value: summaryData.summary.total_users,
				color: "from-blue-500 to-blue-600",
			},
			{
				icon: <Hash className="w-6 h-6" />,
				label: "Total Accounts",
				value: summaryData.summary.total_accounts,
				color: "from-purple-500 to-purple-600",
			},
			{
				icon: <Eye className="w-6 h-6" />,
				label: "Total Views",
				value: formatNumber(summaryData.summary.total_views),
				color: "from-pink-500 to-pink-600",
			},
			{
				icon: <Heart className="w-6 h-6" />,
				label: "Total Likes",
				value: formatNumber(summaryData.summary.total_likes),
				color: "from-red-500 to-red-600",
			},
			{
				icon: <Activity className="w-6 h-6" />,
				label: "Avg Engagement",
				value: `${summaryData.summary.average_engagement.toFixed(1)}%`,
				color: "from-green-500 to-green-600",
			},
			{
				icon: <TrendingUp className="w-6 h-6" />,
				label: "Growth Rate",
				value: `${summaryData.trends.growth_rate.toFixed(1)}%`,
				color: "from-yellow-500 to-yellow-600",
			},
		];

		return (
			<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
				{stats.map((stat, index) => (
					<div
						key={index}
						className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300"
					>
						<div
							className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3 text-white`}
						>
							{stat.icon}
						</div>
						<p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
							{stat.value}
						</p>
						<p className="text-xs text-gray-600 dark:text-gray-400">
							{stat.label}
						</p>
					</div>
				))}
			</div>
		);
	};

	const renderMetricsChart = () => {
		if (!dashboardData?.metrics?.dashboard) return null;

		const chartData = dashboardData.metrics.dashboard.map(item => ({
			name: item.metric,
			posts: item.totalPosts,
			views: item.totalViews / 1000, // Convertir a miles para mejor visualización
			likes: item.totalLikes / 1000,
			engagement: item.avgEngagement,
		}));

		return (
			<div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 mb-6">
				<h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
					<BarChart3 className="w-6 h-6 text-blue-500" />
					Metrics Overview
				</h3>
				<ResponsiveContainer width="100%" height={300}>
					<BarChart data={chartData}>
						<CartesianGrid strokeDasharray="3 3" stroke="#374151" />
						<XAxis dataKey="name" stroke="#9CA3AF" />
						<YAxis stroke="#9CA3AF" />
						<Tooltip
							contentStyle={{
								backgroundColor: "#1F2937",
								border: "1px solid #374151",
								borderRadius: "8px",
								color: "#fff",
							}}
						/>
						<Legend />
						<Bar dataKey="posts" fill="#007BFF" name="Posts" />
						<Bar dataKey="views" fill="#FF4081" name="Views (K)" />
						<Bar dataKey="likes" fill="#4CAF50" name="Likes (K)" />
					</BarChart>
				</ResponsiveContainer>
			</div>
		);
	};

	const renderTopUsers = () => {
		if (!summaryData?.rankings?.top_users?.length) return null;

		return (
			<div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 mb-6">
				<h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
					<Award className="w-6 h-6 text-yellow-500" />
					Top Users by Account Count
				</h3>
				<div className="space-y-3">
					{summaryData.rankings.top_users.map((user, index) => (
						<div
							key={user.user_id}
							className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 rounded-lg"
						>
							<div className="flex items-center gap-3">
								<div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
									{index + 1}
								</div>
								<div>
									<p className="font-semibold text-gray-900 dark:text-white">
										{user.email}
									</p>
									<p className="text-sm text-gray-600 dark:text-gray-400">
										User ID: {user.user_id}
									</p>
								</div>
							</div>
							<div className="text-right">
								<p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
									{user.accounts_count}
								</p>
								<p className="text-xs text-gray-600 dark:text-gray-400">accounts</p>
							</div>
						</div>
					))}
				</div>
			</div>
		);
	};

	const renderTopAccounts = () => {
		if (!summaryData?.rankings?.top_accounts?.length) return null;

		return (
			<div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 mb-6">
				<h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
					<TrendingUp className="w-6 h-6 text-green-500" />
					Top Accounts by Performance
				</h3>
				<div className="space-y-3">
					{summaryData.rankings.top_accounts.map((account, index) => (
						<div
							key={account.account}
							className="p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-gray-700 dark:to-gray-600 rounded-lg"
						>
							<div className="flex items-center justify-between mb-2">
								<div className="flex items-center gap-3">
									<div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center text-white font-bold">
										{index + 1}
									</div>
									<p className="font-semibold text-gray-900 dark:text-white text-lg">
										{account.account}
									</p>
								</div>
								<div className="text-right">
									<p className="text-sm text-gray-600 dark:text-gray-400">
										{account.post_count} posts
									</p>
								</div>
							</div>
							<div className="grid grid-cols-3 gap-4 mt-3">
								<div>
									<p className="text-xs text-gray-600 dark:text-gray-400">Views</p>
									<p className="font-bold text-blue-600 dark:text-blue-400">
										{formatNumber(account.total_views)}
									</p>
								</div>
								<div>
									<p className="text-xs text-gray-600 dark:text-gray-400">Likes</p>
									<p className="font-bold text-pink-600 dark:text-pink-400">
										{formatNumber(account.total_likes)}
									</p>
								</div>
								<div>
									<p className="text-xs text-gray-600 dark:text-gray-400">Engagement</p>
									<p className="font-bold text-green-600 dark:text-green-400">
										{account.total_engagement.toFixed(1)}%
									</p>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		);
	};

	const renderBestEngagement = () => {
		if (!summaryData?.rankings?.best_engagement?.length) return null;

		return (
			<div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 mb-6">
				<h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
					<Activity className="w-6 h-6 text-purple-500" />
					Best Engagement Posts
				</h3>
				<div className="space-y-3">
					{summaryData.rankings.best_engagement.map((post, index) => (
						<div
							key={post.post_id}
							className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-700 dark:to-gray-600 rounded-lg"
						>
							<div className="flex items-center justify-between mb-2">
								<div className="flex items-center gap-3">
									<div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
										{index + 1}
									</div>
									<div>
										<p className="font-semibold text-gray-900 dark:text-white">
											{post.account}
										</p>
										<p className="text-xs text-gray-600 dark:text-gray-400">
											Post ID: {post.post_id}
										</p>
									</div>
								</div>
								<div className="text-right">
									<p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
										{post.engagement.toFixed(1)}%
									</p>
									<p className="text-xs text-gray-600 dark:text-gray-400">engagement</p>
								</div>
							</div>
							<div className="grid grid-cols-2 gap-4 mt-3">
								<div className="flex items-center gap-2">
									<Eye className="w-4 h-4 text-blue-500" />
									<span className="text-sm text-gray-600 dark:text-gray-400">
										{formatNumber(post.views)} views
									</span>
								</div>
								<div className="flex items-center gap-2">
									<Heart className="w-4 h-4 text-pink-500" />
									<span className="text-sm text-gray-600 dark:text-gray-400">
										{formatNumber(post.likes)} likes
									</span>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		);
	};

	const renderRecentPosts = () => {
		if (!dashboardData?.metrics?.items?.length) return null;

		const recentPosts = dashboardData.metrics.items.slice(0, 10);

		return (
			<div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 mb-6">
				<h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
					<BarChart3 className="w-6 h-6 text-blue-500" />
					Recent Posts
				</h3>
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead>
							<tr className="border-b border-gray-200 dark:border-gray-700">
								<th className="text-left py-3 px-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
									Account
								</th>
								<th className="text-left py-3 px-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
									Post ID
								</th>
								<th className="text-right py-3 px-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
									Views
								</th>
								<th className="text-right py-3 px-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
									Likes
								</th>
								<th className="text-right py-3 px-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
									Engagement
								</th>
								<th className="text-left py-3 px-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
									Date
								</th>
							</tr>
						</thead>
						<tbody>
							{recentPosts.map((post, index) => (
								<tr
									key={`${post.postId}-${index}`}
									className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
								>
									<td className="py-3 px-2 text-sm text-gray-900 dark:text-white font-medium">
										{post.usernameTiktokAccount}
									</td>
									<td className="py-3 px-2 text-sm text-gray-600 dark:text-gray-400">
										{String(post.postId).substring(0, 10)}...
									</td>
									<td className="py-3 px-2 text-sm text-right text-blue-600 dark:text-blue-400 font-semibold">
										{formatNumber(post.views)}
									</td>
									<td className="py-3 px-2 text-sm text-right text-pink-600 dark:text-pink-400 font-semibold">
										{formatNumber(post.likes)}
									</td>
									<td className="py-3 px-2 text-sm text-right text-green-600 dark:text-green-400 font-semibold">
										{post.engagement.toFixed(1)}%
									</td>
									<td className="py-3 px-2 text-sm text-gray-600 dark:text-gray-400">
										{new Date(post.datePosted).toLocaleDateString()}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		);
	};

	if (loading && !dashboardData) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<RefreshCw className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
					<p className="text-lg font-semibold text-gray-900 dark:text-white">
						Loading orchestrator data...
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen p-6">
			<div className="max-w-7xl mx-auto">
				{/* Header */}
				<div className="mb-8">
					<h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
						Consolidated Dashboard
					</h1>
					<p className="text-gray-600 dark:text-gray-400">
						Microservice 5 - Orchestrator | Data from all services
					</p>
				</div>

				{/* Filter Section */}
				<div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-gray-200 dark:border-gray-700 mb-6">
					<div className="flex flex-col md:flex-row gap-4 items-end">
						<div className="flex-1">
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
								Filter by User ID
							</label>
							<input
								type="number"
								value={filterUserId}
								onChange={(e) => setFilterUserId(e.target.value)}
								placeholder="Enter user ID (optional)"
								className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							/>
						</div>
						<div className="flex gap-2">
							<button
								onClick={handleFilter}
								disabled={loading}
								className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-2"
							>
								<Filter className="w-4 h-4" />
								Apply Filter
							</button>
							<button
								onClick={handleRefresh}
								disabled={loading}
								className="px-6 py-2 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg font-semibold hover:from-gray-600 hover:to-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-2"
							>
								<RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
								Refresh
							</button>
						</div>
					</div>
				</div>

				{/* Service Status */}
				{renderServiceStatus()}

			{/* View Toggle */}
			<div className="flex gap-2 mb-6">
				<button
					onClick={() => setActiveView("consolidated")}
					className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 ${
						activeView === "consolidated"
							? "bg-gradient-to-r from-blue-500 to-purple-500 text-white"
							: "bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
					}`}
				>
					<BarChart3 className="w-4 h-4" />
					Consolidated Dashboard
				</button>
				<button
					onClick={() => setActiveView("summary")}
					className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 ${
						activeView === "summary"
							? "bg-gradient-to-r from-green-500 to-teal-500 text-white"
							: "bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
					}`}
				>
					<Activity className="w-4 h-4" />
					Dashboard Summary
				</button>
				<button
					onClick={() => setActiveView("rankings")}
					className={`px-6 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 ${
						activeView === "rankings"
							? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
							: "bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
					}`}
				>
					<Award className="w-4 h-4" />
					Rankings
				</button>
			</div>			{/* Content based on active view */}
			{activeView === "consolidated" && (
				<>
					<h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
						<BarChart3 className="w-6 h-6 text-blue-500" />
						Consolidated Dashboard - All Microservices Data
					</h2>
					{renderMetricsChart()}
					{renderRecentPosts()}
				</>
			)}

			{activeView === "summary" && (
				<>
					<h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
						<Activity className="w-6 h-6 text-green-500" />
						Dashboard Summary - Key Metrics Overview
					</h2>
					{renderStatsCards()}
					<div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 mb-6">
						<h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Summary Information</h3>
						{summaryData && (
							<div className="grid grid-cols-2 md:grid-cols-4 gap-6">
								<div className="text-center">
									<p className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
										{summaryData.summary.total_users}
									</p>
									<p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
								</div>
								<div className="text-center">
									<p className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">
										{summaryData.summary.total_accounts}
									</p>
									<p className="text-sm text-gray-600 dark:text-gray-400">Total Accounts</p>
								</div>
								<div className="text-center">
									<p className="text-4xl font-bold text-pink-600 dark:text-pink-400 mb-2">
										{formatNumber(summaryData.summary.total_views)}
									</p>
									<p className="text-sm text-gray-600 dark:text-gray-400">Total Views</p>
								</div>
								<div className="text-center">
									<p className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
										{summaryData.summary.average_engagement.toFixed(1)}%
									</p>
									<p className="text-sm text-gray-600 dark:text-gray-400">Avg Engagement</p>
								</div>
							</div>
						)}
					</div>
					<div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
						<h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Trends & Additional Metrics</h3>
						{summaryData && (
							<div className="grid grid-cols-2 md:grid-cols-4 gap-6">
								<div className="text-center">
									<p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mb-2">
										{summaryData.trends.growth_rate.toFixed(1)}%
									</p>
									<p className="text-sm text-gray-600 dark:text-gray-400">Growth Rate</p>
								</div>
								<div className="text-center">
									<p className="text-2xl font-bold text-teal-600 dark:text-teal-400 mb-2">
										{summaryData.trends.engagement_trend}
									</p>
									<p className="text-sm text-gray-600 dark:text-gray-400">Engagement Trend</p>
								</div>
								<div className="text-center">
									<p className="text-3xl font-bold text-red-600 dark:text-red-400 mb-2">
										{formatNumber(summaryData.summary.total_likes)}
									</p>
									<p className="text-sm text-gray-600 dark:text-gray-400">Total Likes</p>
								</div>
								<div className="text-center">
									<p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
										{formatNumber(summaryData.summary.total_interactions)}
									</p>
									<p className="text-sm text-gray-600 dark:text-gray-400">Total Interactions</p>
								</div>
							</div>
						)}
					</div>
				</>
			)}

			{activeView === "rankings" && (
				<>
					<h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
						<Award className="w-6 h-6 text-purple-500" />
						Rankings - Top Performers
					</h2>
					<div className="grid md:grid-cols-2 gap-6">
						<div>{renderTopUsers()}</div>
						<div>{renderTopAccounts()}</div>
					</div>
					{renderBestEngagement()}
				</>
			)}				{/* Metadata Footer */}
				{dashboardData?.metadata && (
					<div className="mt-6 p-4 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-gray-700">
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
							<div>
								<p className="text-xs text-gray-600 dark:text-gray-400">Total Users</p>
								<p className="text-lg font-bold text-gray-900 dark:text-white">
									{dashboardData.metadata.total_users}
								</p>
							</div>
							<div>
								<p className="text-xs text-gray-600 dark:text-gray-400">Total Accounts</p>
								<p className="text-lg font-bold text-gray-900 dark:text-white">
									{dashboardData.metadata.total_accounts}
								</p>
							</div>
							<div>
								<p className="text-xs text-gray-600 dark:text-gray-400">Posts Analyzed</p>
								<p className="text-lg font-bold text-gray-900 dark:text-white">
									{dashboardData.metadata.total_posts_analyzed}
								</p>
							</div>
							<div>
								<p className="text-xs text-gray-600 dark:text-gray-400">Last Updated</p>
								<p className="text-xs font-semibold text-gray-900 dark:text-white">
									{new Date(dashboardData.metadata.timestamp).toLocaleString()}
								</p>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
