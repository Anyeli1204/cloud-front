import React from "react";
import {
	Home,
	Database,
	Music,
	User,
	LogOut,
	MessageCircle,
} from "lucide-react";

const options = [
	{ key: "global", label: "Daily Top Global", icon: <Home size={18} /> },
	{ key: "apify", label: "Apify Call", icon: <Music size={18} /> },
	{ key: "queries", label: "Database Queries", icon: <Database size={18} /> },
	{
		key: "qa",
		label: "Preguntas y Respuestas",
		icon: <MessageCircle size={18} />,
	},
	{ key: "users", label: "User Information", icon: <User size={18} /> },
];

export function NavBar({
	active,
	onSelect,
	onLogout,
}: {
	active: string;
	onSelect: (key: string) => void;
	onLogout: () => void;
}) {
	return (
		<nav className="w-full bg-white shadow flex justify-center space-x-6 px-4 py-2">
			{options.map((opt) => (
				<button
					key={opt.key}
					onClick={() => onSelect(opt.key)}
					className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition ${
						active === opt.key
							? "bg-purple-600 text-white"
							: "text-gray-700 hover:bg-gray-100"
					}`}
				>
					{opt.icon}
					<span className="font-medium">{opt.label}</span>
				</button>
			))}
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
