import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import checker from "vite-plugin-checker";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	server: {
		proxy: {
			"/api": {
				// NO HARDCODEARLO
				target: "http://localhost:8080",
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/api/, ""),
			},
		},
	},
	plugins: [
		react(),
		tsconfigPaths(),
		checker({
			typescript: true,
		}),
	],
});
