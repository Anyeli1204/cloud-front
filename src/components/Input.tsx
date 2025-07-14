import React, { InputHTMLAttributes } from "react";

export function Input({ className = "", ...props }: InputHTMLAttributes<HTMLInputElement>) {
	return (
		<input
			{...props}
			className={`
        w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm text-gray-700 bg-gray-50 placeholder-gray-500
        focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-300
        transition-all duration-300 ease-in-out
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
		/>
	);
}
