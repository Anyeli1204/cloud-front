import { Navigate } from "react-router-dom";
import { useAuthContext } from "@contexts/AuthContext";
import * as React from "react";
import { jwtDecode } from "jwt-decode";

interface MyJwtPayload {
	role: string;
}

interface ProtectedRouteProps {
	element: React.ReactElement;
	roles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element, roles }) => {
	const { session, isLoading } = useAuthContext();

	if (isLoading) return null;
	if (!session) return <Navigate to="/auth" replace />;

	let role = "";
	try {
		const decoded = jwtDecode<MyJwtPayload>(session);
		role = decoded.role;
	} catch {
		// Si falla el decode, el rol queda vacío y no pasa la protección de roles
	}

	if (roles && !roles.includes(role)) {
		return <Navigate to="/" replace />;
	}

	return element;
};
