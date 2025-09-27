import React, { useEffect, useState } from "react";
import { getAllUsers } from "@services/upgrade-to-admin/getAllUsers";
import { upgrade } from "@services/upgrade-to-admin/upgrade";
import { useAuthContext } from "@contexts/AuthContext";
import { CheckCircle, UserPlus, Loader2 } from "lucide-react";
import { VisualizeAllUser } from "@interfaces/user-to-admin-Upgrade/VisualizeAllUser";

const PAGE_SIZE = 5;

export default function AdminUsersPage() {
	const { role, id } = useAuthContext();
	const [users, setUsers] = useState<VisualizeAllUser[]>([]);
	const [raw, setRaw] = useState<unknown>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [upgrading, setUpgrading] = useState<number | null>(null);
	const [sortBy, setSortBy] = useState<"username" | "email" | "role">(
		"username",
	);
	const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
	const [page, setPage] = useState(1);
	const [pageWindowStart, setPageWindowStart] = useState(1);

	const sortedUsers = [...users].sort((a, b) => {
		let cmp = 0;
		if (sortBy === "username") cmp = a.username.localeCompare(b.username);
		if (sortBy === "email") cmp = a.email.localeCompare(b.email);
		if (sortBy === "role") cmp = a.role.localeCompare(b.role);
		return sortOrder === "asc" ? cmp : -cmp;
	});
	const totalPages = Math.ceil(sortedUsers.length / PAGE_SIZE);
	const pagedUsers = sortedUsers.slice(
		(page - 1) * PAGE_SIZE,
		page * PAGE_SIZE,
	);
	const PAGE_WINDOW_SIZE = 4;

	useEffect(() => {
		if (role !== "ADMIN") {
			setLoading(false);
			return;
		}
		if (!id) {
			setError("No se encontró el ID del admin actual.");
			setLoading(false);
			return;
		}

		setLoading(true);
		setError(null);

		getAllUsers()
			.then((res) => {
				setRaw(res.data);
				setUsers(res.data);
				setPage(1);
				setPageWindowStart(1);
			})
			.catch((e) => {
				setError("Error al cargar usuarios");
				setRaw(e?.response?.data || e?.message || e);
			})
			.finally(() => {
				setLoading(false);
			});
	}, [role, id]);

	const handleUpgrade = async (user: VisualizeAllUser) => {
		setUpgrading(user.id);
		setError(null);
		try {
			await upgrade({ userId: user.id, adminId: id! });
			setUsers((prev) =>
				prev.map((u) => (u.id === user.id ? { ...u, role: "ADMIN" } : u)),
			);
		} catch (e: unknown) {
			const err = e as {
				response?: { data?: { message?: string } };
				message?: string;
			};
			const backendMsg =
				err?.response?.data?.message || err?.message || "Error desconocido";
			setError("No se pudo actualizar el usuario: " + backendMsg);
		} finally {
			setUpgrading(null);
		}
	};

	const renderPagination = () => {
		let windowStart = pageWindowStart;
		let windowEnd = Math.min(windowStart + PAGE_WINDOW_SIZE - 1, totalPages);
		if (page < windowStart) {
			windowStart = page;
			setPageWindowStart(windowStart);
			windowEnd = Math.min(windowStart + PAGE_WINDOW_SIZE - 1, totalPages);
		} else if (page > windowEnd) {
			windowStart = page - PAGE_WINDOW_SIZE + 1;
			setPageWindowStart(windowStart);
			windowEnd = Math.min(windowStart + PAGE_WINDOW_SIZE - 1, totalPages);
		}
		const pageNumbers = [];
		for (let i = windowStart; i <= windowEnd; i++) {
			pageNumbers.push(i);
		}
		return (
			<div className="flex justify-center items-center gap-2 mt-4">
				<button
					className="px-3 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-50"
					onClick={() => {
						if (windowStart > 1) {
							const newWindowStart = windowStart - PAGE_WINDOW_SIZE;
							setPageWindowStart(newWindowStart);
							setPage(
								Math.min(newWindowStart + PAGE_WINDOW_SIZE - 1, totalPages),
							);
						}
					}}
					disabled={windowStart === 1}
				>
					&lt;
				</button>
				{pageNumbers.map((num) => (
					<button
						key={num}
						className={`px-3 py-1 rounded ${page === num ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-700"}`}
						onClick={() => setPage(num)}
					>
						{num}
					</button>
				))}
				<button
					className="px-3 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-50"
					onClick={() => {
						if (windowEnd < totalPages) {
							const newWindowStart = windowStart + PAGE_WINDOW_SIZE;
							setPageWindowStart(newWindowStart);
							setPage(newWindowStart);
						}
					}}
					disabled={windowEnd === totalPages}
				>
					&gt;
				</button>
			</div>
		);
	};

	if (role !== "ADMIN") {
		return <div className="p-8 text-center text-red-500">Acceso denegado</div>;
	}

	if (!loading && users.length === 0 && !error) {
		return (
			<div className="p-8 text-center text-gray-500">
				No hay usuarios recibidos del backend.
				<br />
				<pre className="text-xs text-left bg-gray-100 p-4 rounded mt-4 overflow-x-auto">
					{JSON.stringify(raw, null, 2)}
				</pre>
			</div>
		);
	}

	return (
		<div className="max-w-5xl mx-auto mt-10 bg-white dark:bg-neutral-900 rounded-3xl shadow-lg p-8">
			<h1 className="text-3xl font-bold mb-8 text-purple-700 dark:text-white flex items-center gap-2">
				<UserPlus /> Gestión de Usuarios
			</h1>
			{error && <div className="mb-4 text-red-500">{error}</div>}
			<div className="overflow-x-auto rounded-xl border border-purple-100 shadow">
				<table className="min-w-full text-sm">
					<thead className="bg-purple-50 dark:bg-neutral-800">
						<tr>
							<th
								className="p-3 cursor-pointer"
								onClick={() => {
									setSortBy("username");
									setSortOrder(sortOrder === "asc" ? "desc" : "asc");
								}}
							>
								Usuario{" "}
								{sortBy === "username" && (sortOrder === "asc" ? "▲" : "▼")}
							</th>
							<th
								className="p-3 cursor-pointer"
								onClick={() => {
									setSortBy("email");
									setSortOrder(sortOrder === "asc" ? "desc" : "asc");
								}}
							>
								Email {sortBy === "email" && (sortOrder === "asc" ? "▲" : "▼")}
							</th>
							<th className="p-3">Nombre</th>
							<th className="p-3">Apellido</th>
							<th
								className="p-3 cursor-pointer"
								onClick={() => {
									setSortBy("role");
									setSortOrder(sortOrder === "asc" ? "desc" : "asc");
								}}
							>
								Rol {sortBy === "role" && (sortOrder === "asc" ? "▲" : "▼")}
							</th>
							<th className="p-3">Acción</th>
						</tr>
					</thead>
					<tbody>
						{loading ? (
							<tr>
								<td colSpan={6} className="text-center py-8">
									<Loader2
										className="animate-spin mx-auto text-purple-500"
										size={32}
									/>
								</td>
							</tr>
						) : pagedUsers.length === 0 ? (
							<tr>
								<td colSpan={6} className="text-center py-8 text-gray-400">
									No hay usuarios registrados.
								</td>
							</tr>
						) : (
							pagedUsers.map((user) => (
								<tr
									key={user.id}
									className="border-b last:border-b-0 hover:bg-purple-50/40 dark:hover:bg-neutral-800/40 transition"
								>
									<td className="p-3 font-semibold">
										<span className="text-purple-700 dark:bg-purple-700 dark:text-white dark:px-3 dark:py-1 dark:rounded-full dark:shadow-sm transition-all">
											{user.username}
										</span>
									</td>
									<td className="p-3">{user.email}</td>
									<td className="p-3">{user.firstname}</td>
									<td className="p-3">{user.lastname}</td>
									<td className="p-3">
										{user.role === "ADMIN" ? (
											<span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
												<CheckCircle size={14} /> Admin
											</span>
										) : (
											<span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold">
												Usuario
											</span>
										)}
									</td>
									<td className="p-3">
										{user.role === "ADMIN" ? (
											<span className="text-green-500 font-bold">—</span>
										) : (
											<button
												className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold flex items-center gap-2 disabled:opacity-60"
												onClick={() => handleUpgrade(user)}
												disabled={upgrading === user.id}
											>
												{upgrading === user.id ? (
													<Loader2 className="animate-spin" size={16} />
												) : (
													<UserPlus size={16} />
												)}
												Hacer admin
											</button>
										)}
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>
			{totalPages > 1 && renderPagination()}
		</div>
	);
}
