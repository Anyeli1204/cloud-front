import { createBrowserRouter } from "react-router-dom";
import App from "src/App";
import { ProtectedRoute } from "./ProtectedRoute";
import AuthPage from "src/pages/AuthPage";
import DashboardPage from "src/pages/DashboardPage";
import ApifyCallPage from "src/pages/ApifyCallPage";
import DatabaseQueriesPage from "src/pages/DatabaseQueriesPage";
import UserInformationPage from "src/pages/UserInformationPage";
import QuestionsAnswersPage from "src/pages/QuestionsAnswersPage";
import AdminUsersPage from "@pages/AdminUsersPage";
import NotFoundPage from "src/pages/NotFoundPage";
import OrchestratorPage from "src/pages/OrchestratorPage";
import AnalyticsPage from "src/pages/AnalyticsPage";

export const router = createBrowserRouter([
	{
		path: "/",
		element: <App />,
		children: [
			{ index: true, element: <AuthPage /> },
			{
				path: "auth",
				element: <AuthPage />,
			},
			{ path: "dashboard", element: <ProtectedRoute element={<DashboardPage />} /> },
			{ path: "apify-call", element: <ProtectedRoute element={<ApifyCallPage />} /> },
			{ path: "queries", element: <ProtectedRoute element={<DatabaseQueriesPage />} /> },
			{ path: "users", element: <ProtectedRoute element={<UserInformationPage />} /> },
			{ path: "qa", element: <ProtectedRoute element={<QuestionsAnswersPage />} /> },
			// AI page removed per request
			{
				path: "/orchestrator",
				element: <ProtectedRoute element={<OrchestratorPage />} />,
			},
			{
				path: "/analytics",
				element: <ProtectedRoute element={<AnalyticsPage />} />,
			},
			{
				path: "/admin/users",
				element: <ProtectedRoute roles={["ADMIN"]} element={<AdminUsersPage />} />,
			},
			{
				path: "*",
				element: <NotFoundPage />,
			},
		],
	},
]);
