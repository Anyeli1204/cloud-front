import React from "react";
import {
	Home,
	User,
	LogOut,
	MessageCircle,
	Sun,
	Moon,
	UserPlus,
} from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { useAuthContext } from "@contexts/AuthContext";

const baseOptions = [
	{ key: "global", label: "Daily Top Global", icon: <Home size={18} /> },
	{ key: "apify", label: "Apify Call", icon: null },
	{ key: "queries", label: "Database Queries", icon: null },
	{
		key: "qa",
		label: "Preguntas y Respuestas",
		icon: <MessageCircle size={18} />,
	},
	{ key: "users", label: "Account Information", icon: <User size={18} /> },
];

export default function NavBar({
	active,
	onSelect,
	onLogout,
	tabs,
}: {
	active: string;
	onSelect: (key: string) => void;
	onLogout: () => void;
	tabs?: { key: string; label: string; icon?: React.ReactNode }[];
}) {
	const { theme, toggleTheme } = useTheme();
	const { role } = useAuthContext();

	let renderTabs = tabs && tabs.length > 0 ? tabs : baseOptions;
	if (role === "ADMIN") {
		// Solo mostrar las tabs permitidas para admin
		renderTabs = [
			{ key: "global", label: "Daily Top Global", icon: <Home size={18} /> },
			{ key: "qa", label: "Preguntas y Respuestas", icon: <MessageCircle size={18} /> },
			{
				key: "admin-users",
				label: "Gestión de Usuarios",
				icon: <UserPlus size={18} className="text-purple-700" />,
			},
			{ key: "users", label: "Account Information", icon: <User size={18} /> },
		];
	}

	// Detectar si estamos en /admin/users para resaltar el tab
	const currentPath = typeof window !== "undefined" ? window.location.pathname : "";
	const isAdminUsersActive = currentPath === "/admin/users";

	return (
		<nav className="w-full bg-white dark:bg-gray-900 shadow flex justify-center space-x-6 px-4 py-2">
			{renderTabs.map((opt) => {
				const isActive =
					(opt.key === "admin-users" && isAdminUsersActive) ||
					(opt.key !== "admin-users" && !isAdminUsersActive && active === opt.key);
				return (
					<button
						key={opt.key}
						onClick={() => {
							if (opt.key === "admin-users") {
								window.location.href = "/admin/users";
							} else {
								onSelect(opt.key);
							}
						}}
						className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
							isActive
								? "bg-purple-600 text-white"
								: opt.key === "admin-users"
								? "text-purple-700 hover:bg-purple-100 font-semibold"
								: "text-gray-700 hover:bg-gray-100"
						}`}
					>
						{opt.icon}
						<span className="font-medium">{opt.label}</span>
					</button>
				);
			})}
			{/* Botón de cambio de tema minimalista */}
			<button
				onClick={toggleTheme}
				className="absolute left-6 flex items-center justify-center w-10 h-10 border-2 border-gray-300 dark:border-gray-600 rounded-full bg-transparent transition hover:border-purple-500 focus:outline-none"
				aria-label="Cambiar tema"
			>
				{theme === "light" ? (
					<Moon size={20} className="text-gray-600" />
				) : (
					<Sun size={20} className="text-yellow-400" />
				)}
			</button>
			{/* Logout al final, posición absolute right */}
			<button
				onClick={onLogout}
				className="absolute right-6 flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-100 transition"
			>
				<LogOut size={18} />
				<span>Logout</span>
			</button>
		</nav>
	);
}
