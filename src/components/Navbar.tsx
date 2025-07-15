import React, { useState } from "react";
import {
	Home,
	User,
	LogOut,
	MessageCircle,
	Sun,
	Moon,
	UserPlus,
	Bot,
	Database,
	Menu,
	X,
} from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { useAuthContext } from "@contexts/AuthContext";
import logoBlanco from "../assets/LogoBlanco.png";
import { useRef } from "react";
import clickSound from "../sounds/clicksound.mp3";

const baseOptions = [
	{ key: "global", label: "Daily Top Global", icon: <Home size={18} /> },
	{ key: "apify", label: "Apify Call", icon: <Bot size={18} /> },
	{ key: "queries", label: "Database Queries", icon: <Database size={18} /> },
	{
		key: "qa",
		label: "Preguntas y Respuestas",
		icon: <MessageCircle size={18} />,
	},
	{ key: "ai", label: "AI Content Creator", icon: <Bot size={18} /> },
	{ key: "users", label: "Account Information", icon: <User size={18} /> },
];

export default function NavBar({
	active,
	onSelect,
	onLogout,
	tabs,
	isAdmin,
}: {
	active: string;
	onSelect: (key: string) => void;
	onLogout: () => void;
	tabs?: { key: string; label: string; icon?: React.ReactNode }[];
	isAdmin?: boolean;
}) {
	const audioRef = useRef<HTMLAudioElement | null>(null);
	if (!audioRef.current) {
		audioRef.current = new Audio(clickSound);
	}

	const playSound = () => {
		if (!audioRef.current) return;
		audioRef.current.volume = 0.5;
		audioRef.current.loop = false;
		audioRef.current.currentTime = 0;
		audioRef.current.play();
	};

	const { theme, toggleTheme } = useTheme();
	const { role } = useAuthContext();
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	let renderTabs = tabs && tabs.length > 0 ? tabs : baseOptions;
	if (role === "ADMIN") {
		// Solo mostrar las tabs permitidas para admin
		renderTabs = [
			{ key: "global", label: "Daily Top Global", icon: <Home size={18} /> },
			{
				key: "qa",
				label: "Preguntas y Respuestas",
				icon: <MessageCircle size={18} />,
			},
			{
				key: "admin-users",
				label: "Gestión de Usuarios",
				icon: <UserPlus size={18} className="text-purple-700" />,
			},
			{ key: "users", label: "Account Information", icon: <User size={18} /> },
		];
	}

	// Detectar si estamos en /admin/users para resaltar el tab
	const currentPath =
		typeof window !== "undefined" ? window.location.pathname : "";
	const isAdminUsersActive = currentPath === "/admin/users";

	const handleTabClick = (key: string) => {
    playSound();
		if (key === "admin-users") {
			window.location.href = "/admin/users";
		} else {
			onSelect(key);
		}
		// Cerrar menú móvil después de hacer clic
		setIsMobileMenuOpen(false);
	};

	const handleLogout = () => {
    playSound();
		onLogout();
		setIsMobileMenuOpen(false);
	};

	return (
		<nav className="w-full bg-white dark:bg-gray-900 shadow-lg relative z-50">
			{/* Navbar principal */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center h-20">
					{/* Logo/Brand - visible en desktop */}
					<div className="hidden md:flex items-center">
						<div className="flex-shrink-0 mr-8">
							<img 
								src={logoBlanco} 
								alt="Scrapi Logo" 
								className="h-12 w-auto object-contain"
							/>
						</div>
					</div>

					{/* Navegación desktop */}
					<div className="hidden md:flex items-center space-x-1">
						{renderTabs.map((opt) => {
							const isActive =
								(opt.key === "admin-users" && isAdminUsersActive) ||
								(opt.key !== "admin-users" && !isAdminUsersActive && active === opt.key);
							const iconClass = `${isActive ? 'text-white' : 'text-gray-700 dark:text-white'}`;
							return (
								<button
									key={opt.key}
									onClick={() => handleTabClick(opt.key)}
									className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
										isActive
											? "bg-purple-600 text-white shadow-md"
											: opt.key === "admin-users"
											? "hover:bg-purple-100 font-semibold text-purple-700 dark:text-purple-400"
											: "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
									}`}
								>
									{opt.icon && React.cloneElement(opt.icon as React.ReactElement, { className: iconClass })}
									<span className="font-medium">{opt.label}</span>
								</button>
							);
						})}
					</div>

					{/* Controles de la derecha */}
					<div className="flex items-center space-x-2">
						{/* Botón de cambio de tema */}
						<button
							onClick={()=> {toggleTheme(); playSound();}}
							className="flex items-center justify-center w-10 h-10 border-2 border-gray-300 dark:border-gray-600 rounded-full bg-transparent transition-all duration-200 hover:border-purple-500 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500"
							aria-label="Cambiar tema"
						>
							{theme === "light" ? (
								<Moon size={20} className="text-gray-600 dark:text-gray-400" />
							) : (
								<Sun size={20} className="text-yellow-400" />
							)}
						</button>

						{/* Botón de logout - solo visible en desktop */}
						<button
							onClick={handleLogout}
							className="hidden md:flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 transition-all duration-200"
						>
							<LogOut size={18} />
							<span>Logout</span>
						</button>

						{/* Botón hamburguesa - solo visible en móvil */}
						<button
							onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
							className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200"
							aria-label="Abrir menú"
						>
							{isMobileMenuOpen ? (
								<X size={20} className="text-gray-700 dark:text-gray-300" />
							) : (
								<Menu size={20} className="text-gray-700 dark:text-gray-300" />
							)}
						</button>
					</div>
				</div>
			</div>

			{/* Menú móvil */}
			<div className={`md:hidden fixed top-0 left-0 w-full h-full bg-white dark:bg-gray-900 z-50 transition-all duration-300 ${
				isMobileMenuOpen 
					? 'opacity-100' 
					: 'opacity-0 pointer-events-none'
			}`}>
				<div className="flex flex-col h-full">
					{/* Header del menú móvil */}
					<div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
						<img 
							src={logoBlanco} 
							alt="Scrapi Logo" 
							className="h-8 w-auto object-contain"
						/>
						<button
							onClick={() => setIsMobileMenuOpen(false)}
							className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
						>
							<X size={24} className="text-gray-700 dark:text-gray-300" />
						</button>
					</div>
					
					{/* Tabs en móvil */}
					{renderTabs.map((opt) => {
						const isActive =
							(opt.key === "admin-users" && isAdminUsersActive) ||
							(opt.key !== "admin-users" && !isAdminUsersActive && active === opt.key);
						const iconClass = `${isActive ? 'text-white' : 'text-gray-700 dark:text-white'}`;
						return (
							<button
								key={opt.key}
								onClick={() => handleTabClick(opt.key)}
								className={`w-full flex items-center space-x-3 px-4 py-4 rounded-lg text-base font-medium transition-all duration-200 ${
									isActive
										? "bg-purple-600 text-white shadow-md"
										: opt.key === "admin-users"
										? "hover:bg-purple-100 font-semibold text-purple-700 dark:text-purple-400"
										: "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
								}`}
							>
								{opt.icon && React.cloneElement(opt.icon as React.ReactElement, { className: iconClass })}
								<span className="font-medium">{opt.label}</span>
							</button>
						);
					})}

					{/* Logout en móvil */}
					<div className="pt-4 border-t border-gray-200 dark:border-gray-700">
						<button
							onClick={handleLogout}
							className="w-full flex items-center space-x-3 px-4 py-4 rounded-lg text-base font-medium text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 transition-all duration-200"
						>
							<LogOut size={20} />
							<span>Logout</span>
						</button>
					</div>
				</div>
			</div>

			{/* Overlay para cerrar menú móvil */}
			{isMobileMenuOpen && (
				<div 
					className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
					onClick={() => setIsMobileMenuOpen(false)}
				/>
			)}
		</nav>
	);
}
