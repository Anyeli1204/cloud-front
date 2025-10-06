import Navbar from "@components/Navbar";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuthContext } from "@contexts/AuthContext";

export default function App() {
	const { role, logout, session } = useAuthContext();
	const location = useLocation();
	const navigate = useNavigate();

	// Mapeo de rutas a keys de tabs
	const pathToTab: Record<string, string> = {
		"/dashboard": "global",
		"/apify-call": "apify",
		"/queries": "queries",
		"/qa": "qa",
		"/ai": "ai", // ✅ agregado
		"/orchestrator": "orchestrator",
		"/admin/users": "admin-users",
		"/users": "users",
	};
	const activeTab = pathToTab[location.pathname] || "";

	const handleSelect = (key: string) => {
		switch (key) {
			case "global":
				navigate("/dashboard");
				break;
			case "apify":
				navigate("/apify-call");
				break;
			case "queries":
				navigate("/queries");
				break;
			case "qa":
				navigate("/qa");
				break;
			case "ai": // ✅ agregado
				navigate("/ai");
				break;
			case "orchestrator":
				navigate("/orchestrator");
				break;
			case "admin-users":
				navigate("/admin/users");
				break;
			case "users":
				navigate("/users");
				break;
			default:
				navigate("/dashboard");
		}
	};

	// Oculta la NavBar en login y register
	const hideNavbar = location.pathname === "/" || location.pathname === "/auth" || !session;

	return (
		<div className="min-h-screen bg-gradient-to-br from-white to-pink-100 dark:bg-gradient-to-br dark:from-violet-900 dark:to-black text-gray-900 dark:text-white">
			{!hideNavbar && (
				<Navbar
					active={activeTab}
					onSelect={handleSelect}
					onLogout={logout}
					isAdmin={role === "ADMIN"}
				/>
			)}
			<Outlet />
		</div>
	);
}

