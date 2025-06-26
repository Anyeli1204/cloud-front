import React, { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export function Input({ className = "", ...props }: InputProps) {
	return (
		<input
			{...props}
			className={`
        w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-500
        focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
        transition
        ${className}
      `}
		/>
	);
}
