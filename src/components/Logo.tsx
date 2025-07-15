import React from "react";
import logoLogin from "../assets/LogoBlanco.png";
import { motion } from "framer-motion";

interface LogoProps {
	mode: "login" | "register";
	animate?: boolean;
	className?: string;
}

export function Logo({ mode, animate = true, className = "" }: LogoProps) {
	const src = mode === "login" ? logoLogin : logoLogin;
	const alt =
		mode === "login" ? "Logo ScrapeTok Login" : "Logo ScrapeTok Register";

	if (!animate) {
		return (
			<img src={src} alt={alt} className={`object-contain ${className}`} />
		);
	}

	return (
		<motion.img
			src={src}
			alt={alt}
			className={`object-contain ${className}`}
			initial={{ rotate: 0 }}
			animate={{ rotate: 360 }}
			transition={{
				duration: 5,
				repeat: Infinity,
				ease: "linear",
			}}
		/>
	);
}
