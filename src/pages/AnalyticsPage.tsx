import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { getUsersList, getAdminMetrics } from "@services/analytics/analyticsService";
import type {
	UserBasic,
	AdminMetrics,
	UsersListResponse,
	AdminMetricsResponse,
} from "@interfaces/analytics/AnalyticsInterfaces";

const AnalyticsPage: React.FC = () => {
	const [users, setUsers] = useState<UserBasic[]>([]);
	const [adminMetrics, setAdminMetrics] = useState<AdminMetrics[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [activeTab, setActiveTab] = useState<"users" | "admins">("users");

	useEffect(() => {
		loadData();
	}, []);

	const loadData = async () => {
		setLoading(true);
		setError(null);

		try {
			const [usersResponse, adminResponse] = await Promise.all([
				getUsersList(),
				getAdminMetrics(),
			]);

			if (usersResponse.data.success) {
				setUsers(usersResponse.data.data);
			} else {
				throw new Error("Error loading users");
			}

			if (adminResponse.data.success) {
				setAdminMetrics(adminResponse.data.data);
			} else {
				throw new Error("Error loading admin metrics");
			}
		} catch (err) {
			const errorMsg = err instanceof Error ? err.message : "Error loading data";
			setError(errorMsg);
			Swal.fire({
				title: "Error",
				text: errorMsg,
				icon: "error",
			});
		} finally {
			setLoading(false);
		}
	};

	const formatNumber = (num: number | undefined | null): string => {
		if (!num && num !== 0) return "N/A";
		return num.toLocaleString("en-US");
	};

	const formatDate = (dateStr: string | undefined | null): string => {
		if (!dateStr) return "N/A";
		try {
			return new Date(dateStr).toLocaleDateString("en-US", {
				year: "numeric",
				month: "short",
				day: "numeric",
			});
		} catch {
			return dateStr;
		}
	};

	if (loading && users.length === 0 && adminMetrics.length === 0) {
		return (
			<div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
				<div className="text-center">
					<div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto"></div>
					<p className="mt-4 text-gray-600 font-medium">Loading analytics data...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-8">
			<div className="max-w-7xl mx-auto">
				{/* Header */}
				<div className="mb-8">
					<h1 className="text-4xl font-bold text-gray-800 mb-2">
						📊 ScrapeTok Analytics
					</h1>
					<p className="text-gray-600">
						Insights powered by AWS Athena - Microservice 6
					</p>
				</div>

				{/* Error Alert */}
				{error && (
					<div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
						<div className="flex">
							<div className="flex-shrink-0">
								<svg
									className="h-5 w-5 text-red-500"
									viewBox="0 0 20 20"
									fill="currentColor"
								>
									<path
										fillRule="evenodd"
										d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
										clipRule="evenodd"
									/>
								</svg>
							</div>
							<div className="ml-3">
								<p className="text-sm text-red-700">{error}</p>
							</div>
						</div>
					</div>
				)}

				{/* Tabs */}
				<div className="mb-6">
					<div className="flex border-b border-gray-300">
						<button
							onClick={() => setActiveTab("users")}
							className={`px-6 py-3 font-semibold transition-colors ${
								activeTab === "users"
									? "border-b-2 border-purple-600 text-purple-600"
									: "text-gray-600 hover:text-purple-600"
							}`}
						>
							👥 Users ({users.length})
						</button>
						<button
							onClick={() => setActiveTab("admins")}
							className={`px-6 py-3 font-semibold transition-colors ${
								activeTab === "admins"
									? "border-b-2 border-purple-600 text-purple-600"
									: "text-gray-600 hover:text-purple-600"
							}`}
						>
							🎯 Admin Metrics ({adminMetrics.length})
						</button>
					</div>
				</div>

				{/* Refresh Button */}
				<div className="mb-6">
					<button
						onClick={loadData}
						disabled={loading}
						className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
					>
						{loading ? (
							<>
								<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
								Refreshing...
							</>
						) : (
							<>
								🔄 Refresh Data
							</>
						)}
					</button>
				</div>

				{/* Users Tab */}
				{activeTab === "users" && (
					<div className="space-y-4">
						{users.length === 0 ? (
							<div className="bg-white rounded-lg shadow-md p-8 text-center">
								<p className="text-gray-500">No users found</p>
							</div>
						) : (
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
								{users.map((user) => (
									<div
										key={user.id}
										className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow border-t-4 border-purple-500"
									>
										<div className="flex items-center justify-between mb-4">
											<div className="flex items-center gap-3">
												<div className="bg-purple-100 rounded-full p-3">
													<svg
														className="h-6 w-6 text-purple-600"
														fill="none"
														viewBox="0 0 24 24"
														stroke="currentColor"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
														/>
													</svg>
												</div>
												<div>
													<h3 className="font-bold text-gray-800 text-lg">
														{user.username || "N/A"}
													</h3>
													<p className="text-sm text-gray-500">
														ID: {user.id}
													</p>
												</div>
											</div>
										</div>

										<div className="space-y-2">
											<div className="flex justify-between items-center">
												<span className="text-gray-600 text-sm">First Name:</span>
												<span className="font-medium text-gray-800 text-sm truncate ml-2 max-w-[180px]">
													{user.firstname || "N/A"}
												</span>
											</div>
											<div className="flex justify-between items-center">
												<span className="text-gray-600 text-sm">Last Name:</span>
												<span className="font-medium text-gray-800 text-sm truncate ml-2 max-w-[180px]">
													{user.lastname || "N/A"}
												</span>
											</div>
											<div className="flex justify-between items-center">
												<span className="text-gray-600 text-sm">Created:</span>
												<span className="font-medium text-gray-800 text-sm">
													{formatDate(user.creation_date)}
												</span>
											</div>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				)}

				{/* Admins Tab */}
				{activeTab === "admins" && (
					<div className="space-y-4">
						{adminMetrics.length === 0 ? (
							<div className="bg-white rounded-lg shadow-md p-8 text-center">
								<p className="text-gray-500">No admin metrics found</p>
							</div>
						) : (
							<div className="grid grid-cols-1 gap-6">
								{adminMetrics.map((admin, index) => (
									<div
										key={index}
										className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow border-l-4 border-blue-500"
									>
										<div className="flex items-start justify-between mb-4">
											<div className="flex items-center gap-3">
												<div className="bg-blue-100 rounded-full p-3">
													<svg
														className="h-6 w-6 text-blue-600"
														fill="none"
														viewBox="0 0 24 24"
														stroke="currentColor"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
														/>
													</svg>
												</div>
												<div>
													<h3 className="font-bold text-gray-800 text-xl">
														@{admin.usernameTiktokAccount || "N/A"}
													</h3>
													<p className="text-sm text-gray-500">
														TikTok Admin Account
													</p>
												</div>
											</div>
											<div className="text-right">
												<div className="text-3xl font-bold text-blue-600">
													{formatNumber(Number(admin.total_posts))}
												</div>
												<div className="text-xs text-gray-500 uppercase">
													Total Posts
												</div>
											</div>
										</div>

										<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
											<div className="bg-purple-50 rounded-lg p-4 text-center">
												<div className="text-2xl font-bold text-purple-600">
													{formatNumber(Number(admin.total_views))}
												</div>
												<div className="text-xs text-gray-600 mt-1">
													👁️ Total Views
												</div>
											</div>
											<div className="bg-green-50 rounded-lg p-4 text-center">
												<div className="text-2xl font-bold text-green-600">
													{formatNumber(Number(admin.total_likes))}
												</div>
												<div className="text-xs text-gray-600 mt-1">
													👍 Total Likes
												</div>
											</div>
											<div className="bg-pink-50 rounded-lg p-4 text-center">
												<div className="text-2xl font-bold text-pink-600">
													{formatNumber(Number(admin.avg_views))}
												</div>
												<div className="text-xs text-gray-600 mt-1">
													� Avg Views
												</div>
											</div>
											<div className="bg-orange-50 rounded-lg p-4 text-center">
												<div className="text-2xl font-bold text-orange-600">
													{formatNumber(Number(admin.total_comments))}
												</div>
												<div className="text-xs text-gray-600 mt-1">
													💬 Total Comments
												</div>
											</div>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
};

export default AnalyticsPage;
