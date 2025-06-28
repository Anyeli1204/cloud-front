import { createBrowserRouter } from "react-router-dom";
import App from "src/App";
import { ProtectedRoute } from "./ProtectedRoute";
import AuthPage from "src/pages/AuthPage";
import DashboardPage from "src/pages/DashboardPage";
import ApifyCallPage from "src/pages/ApifyCallPage";
import DatabaseQueriesPage from "src/pages/DatabaseQueriesPage";

import NotFoundPage from "src/pages/NotFoundPage";
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
			{
				// 2) Grupo de rutas protegidas SIN `path`, solo actúa como layout
				element: <ProtectedRoute />,
				children: [
					{ path: "dashboard", element: <DashboardPage /> },
					{ path: "apify-call", element: <ApifyCallPage /> },
					{ path: "queries", element: <DatabaseQueriesPage /> },
				],
			},

			{
				path: "*",
				element: <NotFoundPage />,
			},
		],
	},
]);
