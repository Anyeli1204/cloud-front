import { AuthProvider } from "@contexts/AuthContext";
import { router } from "@router/routes";
import "@styles/App.css";
import "@styles/index.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { ThemeProvider } from "@contexts/ThemeContext";

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<ThemeProvider>
			<AuthProvider>
				<RouterProvider router={router} />
			</AuthProvider>
		</ThemeProvider>
	</StrictMode>,
);
