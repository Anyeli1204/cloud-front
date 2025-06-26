import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { NavBar } from "@components/Navbar";
import { useAuthContext } from "@contexts/AuthContext";
import React, { useState } from "react";

export function ProtectedRoute() {
	const navigate = useNavigate();
	const [activeTab, setActiveTab] = useState<
		"global" | "queries" | "apify" | "users"
	>("global");

	const { logout, session } = useAuthContext(); // asumo que tienes un método logout en tu contexto
	if (!session) {
		return <Navigate to="/auth" replace />;
	}
	const handleLogout = () => {
		logout(); // limpia token / sessionStorage
		navigate("/auth"); // lleva al login/register
	};

	const handleSelect = (key: string) => {
		setActiveTab(key as any);

		// Navega según la pestaña clicada
		switch (key) {
			case "global":
				navigate("/dashboard");
				break;
			case "queries":
				navigate("/queries");
				break;
			case "apify":
				navigate("/apify-call");
				break;
			case "users":
				navigate("/users");
				break;
			default:
				navigate("/dashboard");
		}
	};
	return (
		<>
			<NavBar
				active={activeTab}
				onSelect={handleSelect}
				onLogout={handleLogout}
			/>
			<Outlet context={{ activeTab }} />
		</>
	);
}
