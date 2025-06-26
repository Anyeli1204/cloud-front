import React from "react";
import { useNavigate } from "react-router-dom";

interface ButtonProps {
	to?: string;
	onClick?: () => void;
	variant?: "primary" | "secondary";
	disabled?: boolean;
	children: React.ReactNode;
}

export function Button({
	to,
	onClick,
	variant = "primary",
	disabled = false,
	children,
}: ButtonProps) {
	const navigate = useNavigate();
	const base = "px-6 py-3 rounded-xl font-semibold transition";
	const styles = {
		primary: "w-full bg-purple-600 text-white hover:bg-purple-700",
		secondary:
			"w-full bg-white text-purple-600 hover:bg-gray-100 border border-gray-200",
	};

	const handleClick = () => {
		if (disabled) return;
		if (onClick) onClick();
		else if (to) navigate(to);
	};

	return (
		<button
			onClick={handleClick}
			disabled={disabled}
			className={`${base} ${styles[variant]} ${
				disabled ? "opacity-50 cursor-not-allowed hover:bg-none" : ""
			}`.trim()}
		>
			{children}
		</button>
	);
}
