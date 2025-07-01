import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import checker from "vite-plugin-checker";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
	server: {
		proxy: {
			"/api": {
				target:
					"https://dbp-backend-springboot.wittysky-1e95b768.centralus.azurecontainerapps.io",
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
