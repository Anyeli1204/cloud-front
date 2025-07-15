import React, { useEffect, useState, useRef, useLayoutEffect } from "react";
import { useAuthContext } from "@contexts/AuthContext";
import { userInfo } from "@services/user-admin-info/UserInfo";
import { adminInfo } from "@services/user-admin-info/AdminInfo";
import type { UserInfoResponse } from "@interfaces/user-info/UserInfoResponse";
import type { AdminInformationResponse } from "@interfaces/admin-info/AdminInformationResponse";
import type { QuestionAnswerResponse } from "@interfaces/QA/QuestionAnswerResponse";
import {
	User,
	Shield,
	MessageCircle,
	Bell,
	Mail,
} from "lucide-react";
import { QuestionDetailModal } from "@components/QuestionDetailModal";
import EditProfileModal from "@components/EditProfileModal";

function useRandomAvatar(username: string | undefined | null, role: string) {
	const [avatar, setAvatar] = useState<string>("");

	useEffect(() => {
		if (!username) return;

		const key = `avatar_${role.toLowerCase()}_${username}`;
		const saved = localStorage.getItem(key);

		if (saved) {
			setAvatar(saved);
		} else {
			fetch("https://randomuser.me/api/")
				.then((res) => res.json())
				.then((data) => {
					const url = data.results[0].picture.large;
					localStorage.setItem(key, url);
					setAvatar(url);
				})
				.catch(() => {
					const fallback = `https://ui-avatars.com/api/?name=${username}&background=eee&color=7f00ff`;
					localStorage.setItem(key, fallback);
					setAvatar(fallback);
				});
		}
	}, [username, role]);

	return avatar;
}

export default function UserInformationPage() {
	const { id, role } = useAuthContext();
	const [userData, setUserData] = useState<UserInfoResponse | null>(null);
	const [adminData, setAdminData] = useState<AdminInformationResponse | null>(
		null,
	);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const scrapeosPorPagina = 3;
	const [paginaActual, setPaginaActual] = useState(1);
	const [cuentasPorPagina, setCuentasPorPagina] = useState(9);
	const [paginaCuentas, setPaginaCuentas] = useState(1);
	const cuentasContainerRef = useRef<HTMLDivElement>(null);
	const [editOpen, setEditOpen] = useState(false);
	const [editOpenAdmin, setEditOpenAdmin] = useState(false);

	// Ajuste responsivo de cuentas por página
	useLayoutEffect(() => {
		function calcularCuentasPorPagina() {
			const container = cuentasContainerRef.current;
			if (!container) return;
			const containerWidth = container.offsetWidth;
			// Tamaño estimado de cada chip (incluyendo gap)
			const chipWidth = 90; // px (más compacto)
			const gapX = 8; // px (gap-2)
			const chipsPorFila = Math.max(1, Math.floor(containerWidth / (chipWidth + gapX)));
			const filas = 2; // máximo 2 filas
			const total = chipsPorFila * filas;
			setCuentasPorPagina(total);
		}
		calcularCuentasPorPagina();
		window.addEventListener("resize", calcularCuentasPorPagina);
		return () => window.removeEventListener("resize", calcularCuentasPorPagina);
	}, []);

	// Hooks para paginación y modal
	const [paginaPreguntas, setPaginaPreguntas] = useState(1);
	const preguntasPorPagina = 3;
	const [preguntaSeleccionada, setPreguntaSeleccionada] =
		useState<QuestionAnswerResponse | null>(null);

	const [paginaAlertas, setPaginaAlertas] = useState(1);
	const alertasPorPagina = 6;
	const alertasPagina =
		adminData?.emmitedAlerts?.slice(
			(paginaAlertas - 1) * alertasPorPagina,
			paginaAlertas * alertasPorPagina,
		) || [];

	useEffect(() => {
		async function fetchData() {
			setLoading(true);
			setError(null);
			try {
				if (role === "ADMIN") {
					const res = await adminInfo({ adminId: id! });
					setAdminData(res.data);
				} else if (role === "USER") {
					const res = await userInfo({ userId: id! });
					setUserData(res.data);
				}
			} catch {
				setError("Error al cargar la información del usuario");
			} finally {
				setLoading(false);
			}
		}
		if (id && role) fetchData();
	}, [id, role]);

	const username =
		role === "USER" && userData
			? userData.username
			: role === "ADMIN" && adminData
				? adminData.username
				: "";

	const avatarUrl = useRandomAvatar(username || "default", role || "USER");

	if (loading) {
		return (
			<div className="flex justify-center items-center min-h-screen">
				Cargando...
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex justify-center items-center min-h-screen text-red-600">
				{error}
			</div>
		);
	}

	// USER VIEW
	if (role === "USER" && userData) {
		const totalScrapeos = userData.filters?.length || 0;
		const totalPaginas = Math.ceil(totalScrapeos / scrapeosPorPagina);
		const scrapeosPagina =
			userData.filters?.slice(
				(paginaActual - 1) * scrapeosPorPagina,
				paginaActual * scrapeosPorPagina,
			) || [];

		// Función para mostrar solo 5 botones de paginación en historial de scrapeo
		const getPaginationRange = () => {
			const total = totalPaginas;
			const current = paginaActual;
			const maxVisible = 5;
			let start = Math.max(1, current - Math.floor(maxVisible / 2));
			let end = start + maxVisible - 1;
			if (end > total) {
				end = total;
				start = Math.max(1, end - maxVisible + 1);
			}
			return Array.from({ length: end - start + 1 }, (_, i) => start + i);
		};

		// Función para mostrar solo 5 botones de paginación en cuentas scrapeadas
		const totalPaginasCuentas = Math.ceil((userData.tiktokUsernameScraped?.length || 0) / cuentasPorPagina);
		const getPaginationRangeCuentas = () => {
			const total = totalPaginasCuentas;
			const current = paginaCuentas;
			const maxVisible = 5;
			let start = Math.max(1, current - Math.floor(maxVisible / 2));
			let end = start + maxVisible - 1;
			if (end > total) {
				end = total;
				start = Math.max(1, end - maxVisible + 1);
			}
			return Array.from({ length: end - start + 1 }, (_, i) => start + i);
		};

		return (
			<div className="min-h-screen bg-gradient-to-br from-white to-pink-100 dark:bg-gradient-to-br dark:from-violet-900 dark:to-black text-gray-900 dark:text-white p-6 space-y-6">
				<div className="max-w-6xl mx-auto px-4 py-6">
					<h1 className="w-full text-4xl font-extrabold mb-8 text-purple-800 dark:text-white flex items-center justify-center gap-2">
						<User size={28} className="text-purple-800 dark:text-white" />
						Información de Usuario
					</h1>
					<div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
					<div className="backdrop-blur-md bg-white/80 dark:bg-white/30 rounded-3xl shadow-2xl p-8 flex flex-col items-center gap-4 w-[300px] h-full min-h-[480px] self-stretch border-2 border-purple-100 mx-auto md:col-span-1">
					<div className="relative mb-6">
								<div className="w-40 h-40 rounded-full bg-gradient-to-tr from-purple-400 via-pink-400 to-blue-400 p-1 animate-spin-slow">
									<div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
										<img
											src={avatarUrl}
											alt="Avatar"
											className="rounded-full w-38 h-38 object-cover border-4 border-white shadow-lg"
										/>
									</div>
								</div>
								<div className="flex justify-center mt-2">
									<span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 shadow-sm">
										<svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
										Activo
									</span>
								</div>
							</div>
							<div className="flex flex-col items-center gap-1 w-full">
								<span className="text-gray-400 text-sm">Nombre</span>
								<span className="text-2xl font-extrabold text-gray-800 dark:text-white text-center">{userData.firstname} {userData.lastname}</span>
								<hr className="w-2/3 my-2 border-purple-100" />
								<span className="text-gray-400 text-sm">Usuario</span>
								<span className="text-base font-semibold text-purple-700 bg-purple-100 rounded-full px-4 py-1 mb-2 shadow">@{userData.username}</span>
								<span className="text-gray-400 text-sm">Email</span>
								<span className="flex items-center gap-2 text-base text-gray-700 dark:text-gray-200 truncate max-w-full">
									<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12H8m8 0a4 4 0 11-8 0 4 4 0 018 0zm0 0v1a4 4 0 01-8 0v-1" /></svg>
									<span className="truncate">{userData.email}</span>
								</span>
								<button
									onClick={() => setEditOpen(true)}
									className="mt-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-2 px-6 rounded-full shadow-lg hover:scale-105 hover:shadow-xl transition-all flex items-center gap-2"
									>
									<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0-1.104.896-2 2-2s2 .896 2 2-.896 2-2 2-2-.896-2-2z" /></svg>
									Editar perfil
								</button>
							</div>
						</div>
						<div className="md:col-span-3 flex flex-col gap-4 h-full justify-between w-full mt-8 md:mt-0 md:ml-8">
							<div className="bg-white/90 dark:bg-white/60 rounded-2xl shadow-2xl p-4 border-2 border-blue-100 animate-fade-in w-full">
								<h2 className="text-xl font-bold mb-4 mt-4 flex items-center gap-2 text-blue-700">
									<Shield size={28} className="text-blue-500" /> Historial de Scrapeo
								</h2>
								<div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8 text-sm items-start">
									{scrapeosPagina.length > 0 ? (
										scrapeosPagina.map((f, i) => (
										<div key={i} className="bg-blue-50 rounded-xl p-2 shadow-md flex flex-col gap-1 border border-blue-100 max-w-xs w-full mx-auto min-h-40">
											{f["Date From"] && (
												<div className="flex items-center gap-2 text-blue-900 text-sm">
													<svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> <span className="font-semibold">Fecha desde:</span> {f["Date From"]}
												</div>
											)}
											{f["Date to"] && (
												<div className="flex items-center gap-2 text-blue-900 text-sm">
													<svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> <span className="font-semibold">Fecha hasta:</span> {f["Date to"]}
												</div>
											)}
											{f["Key Word"] && (
												<div className="flex items-center gap-2 text-blue-900 text-sm">
													<svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12H8m8 0a4 4 0 11-8 0 4 4 0 018 0zm0 0v1a4 4 0 01-8 0v-1" /></svg> <span className="font-semibold">Palabra clave:</span> {f["Key Word"]}
												</div>
											)}
											{f["N Last Post By Hashtags"] && (
												<div className="flex items-center gap-2 text-blue-900 text-sm">
													<svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2a2 2 0 012-2h2a2 2 0 012 2v2m-6 4h6a2 2 0 002-2v-5a2 2 0 00-2-2H7a2 2 0 00-2 2v5a2 2 0 002 2z" /></svg> <span className="font-semibold">N° de posts:</span> {f["N Last Post By Hashtags"]}
												</div>
											)}
											{f["Execution Time"] && (
												<div className="flex items-center gap-2 text-blue-900 text-sm">
													<svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" /></svg> <span className="font-semibold">Tiempo de ejecución:</span> {f["Execution Time"]}
												</div>
											)}
											{(() => {
												const hashtagsRaw = f.hashtags || f.Hashtags || f["hashtags"] || f["Hashtags"] || "";
												if (typeof hashtagsRaw === "string" && hashtagsRaw.trim().length > 0) {
													return (
														<div className="flex flex-wrap gap-1 mt-2 items-center text-blue-900 text-sm">
															<span className="font-semibold">Hashtags:</span>
															{hashtagsRaw
																.split(",")
																.filter((tag: string) => tag && tag.trim() !== "null" && tag.trim() !== "undefined")
																.map((tag: string, idx: number) => {
																	const cleanTag = tag.trim().startsWith("#") ? tag.trim() : `#${tag.trim()}`;
																	return (
																		<span
																			key={idx}
																			className="inline-block bg-white text-blue-700 border border-blue-300 rounded-full px-2 py-0.5 text-xs font-semibold shadow-sm"
																		>
																			{cleanTag}
																		</span>
																	);
																})}
														</div>
													);
												}
												return null;
											})()}
										</div>
									))
									) : (
										<div className="col-span-3 flex flex-col items-center justify-center py-6">
											<div className="w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center mb-3">
												<svg className="w-6 h-6 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
													<path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2"/>
												</svg>
											</div>
											<p className="text-gray-500 text-center text-base">
												Todavía no se realiza ningún scrapeo.
											</p>
										</div>
									)}
								</div>
								<div className="flex justify-center gap-2 mt-2 mb-6">
									<button
										className="px-2 py-1 rounded bg-[#e3f0fa] text-blue-800 hover:bg-blue-800 hover:text-white disabled:opacity-50"
										onClick={() =>
											setPaginaActual((p) => Math.max(1, p - 1))
										}
										disabled={paginaActual === 1}
									>
										&lt;
									</button>
									{getPaginationRange().map((num) => (
										<button
											key={num}
											className={`px-3 py-1 rounded-full font-semibold text-sm ${
												paginaActual === num
													? "bg-blue-800 text-white"
													: "bg-[#e3f0fa] text-blue-800 hover:bg-blue-800 hover:text-white"
											}`}
											onClick={() => setPaginaActual(num)}
										>
											{num}
										</button>
									))}
									<button
										className="px-2 py-1 rounded bg-[#e3f0fa] text-blue-800 hover:bg-blue-800 hover:text-white disabled:opacity-50"
										onClick={() =>
											setPaginaActual((p) => Math.min(totalPaginas, p + 1))
										}
										disabled={paginaActual === totalPaginas}
									>
										&gt;
									</button>
								</div>
							</div>
							<div className="bg-white/90 dark:bg-white/60 rounded-2xl shadow-2xl p-4 border-2 border-pink-100 animate-fade-in w-full">
								<h2 className="text-2xl font-bold mb-6 mt-6 flex items-center gap-3 text-pink-600">
									<Mail size={28} className="text-pink-400" /> Cuentas Scrapeadas
								</h2>
								<div ref={cuentasContainerRef} className="flex flex-wrap gap-2 mb-6 text-sm justify-start overflow-hidden" style={{maxHeight: '4.5rem'}}>
									{userData.tiktokUsernameScraped && userData.tiktokUsernameScraped.length > 0 ? (
										userData.tiktokUsernameScraped?.slice((paginaCuentas-1)*cuentasPorPagina, paginaCuentas*cuentasPorPagina).map((acc, i) => (
										<span key={i} title={acc} className="inline-flex items-center bg-pink-100 text-pink-700 px-2 py-0 rounded-full text-sm font-semibold shadow hover:bg-pink-200 transition-all cursor-pointer h-auto">
											{acc}
										</span>
									))
									) : (
										<div className="w-full flex items-center justify-center py-6">
											<div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mr-4">
												<svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
												</svg>
											</div>
											<p className="text-gray-500 text-base">
												Todavía no existen cuentas scrapeadas.
											</p>
										</div>
									)}
								</div>
								<div className="flex justify-center gap-2 mt-2">
									<button
										className="px-2 py-1 rounded bg-[#ffe3ed] text-[#FF00CC] hover:bg-[#FF00CC] hover:text-white disabled:opacity-50"
										onClick={() =>
											setPaginaCuentas((p) => Math.max(1, p - 1))
										}
										disabled={paginaCuentas === 1}
									>
										&lt;
									</button>
									{getPaginationRangeCuentas().map((num) => (
										<button
											key={num}
											className={`px-3 py-1 rounded-full font-semibold text-sm ${paginaCuentas === num ? "bg-[#FF00CC] text-white" : "bg-[#ffe3ed] text-[#FF00CC] hover:bg-[#FF00CC] hover:text-white"}`}
											onClick={() => setPaginaCuentas(num)}
										>
											{num}
										</button>
									))}
									<button
										className="px-2 py-1 rounded bg-[#ffe3ed] text-[#FF00CC] hover:bg-[#FF00CC] hover:text-white disabled:opacity-50"
										onClick={() =>
											setPaginaCuentas((p) =>
												Math.min(
													Math.ceil(
														(userData.tiktokUsernameScraped?.length || 0) /
															cuentasPorPagina,
													),
													p + 1,
												),
											)
										}
										disabled={
											paginaCuentas ===
											Math.ceil(
												(userData.tiktokUsernameScraped?.length || 0) /
													cuentasPorPagina,
											)
										}
									>
										&gt;
									</button>
								</div>
							</div>
						</div>
					</div>
				{editOpen && (
					<EditProfileModal
						userId={id!}
						initialData={{
						firstname: userData.firstname,
						lastname: userData.lastname,
						username: userData.username,
						}}
						onClose={() => setEditOpen(false)}
						onSuccess={() => {
						window.location.reload(); // O puedes volver a llamar a fetchData si no quieres recargar
						}}
					/>
				)}
				</div>
			</div>
		);
	}

	if (role === "ADMIN" && adminData) {
		const totalPreguntas = adminData.questionAndAnswer?.length || 0;
		const totalPaginasPreguntas = Math.ceil(totalPreguntas / preguntasPorPagina);
		const preguntasPagina =
			adminData.questionAndAnswer?.slice(
				(paginaPreguntas - 1) * preguntasPorPagina,
				paginaPreguntas * preguntasPorPagina,
			) || [];

		return (
			<div className="min-h-screen bg-gradient-to-br from-white to-pink-100 dark:bg-gradient-to-br dark:from-violet-900 dark:to-black text-gray-900 dark:text-white p-6 space-y-6">
				<div className="max-w-6xl mx-auto px-4 py-8">
					<h1 className="w-full text-4xl font-extrabold mb-8 text-purple-800 dark:text-white flex items-center justify-center gap-2">
						<Shield size={28} className="text-purple-800 dark:text-white" />
						Información de Administrador
					</h1>
					<div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-stretch">
						<div className="backdrop-blur-md bg-white/80 dark:bg-white/30 rounded-3xl shadow-2xl p-8 flex flex-col items-center gap-4 w-[300px] h-full min-h-[480px] self-stretch border-2 border-purple-100 mx-auto md:col-span-1">
							<div className="relative mb-6">
								<div className="w-40 h-40 rounded-full bg-gradient-to-tr from-purple-400 via-pink-400 to-blue-400 p-1 animate-spin-slow">
									<div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
										<img
											src={avatarUrl}
											alt="Avatar"
											className="rounded-full w-38 h-38 object-cover border-4 border-white shadow-lg"
										/>
									</div>
								</div>
							</div>
							<div className="flex flex-col items-center gap-1 w-full">
								<span className="text-gray-400 text-sm">Nombre</span>
								<span className="text-2xl font-extrabold text-gray-800 dark:text-white text-center">
									{adminData.firstname} {adminData.lastname}
								</span>
								<hr className="w-2/3 my-2 border-purple-100" />
								<span className="text-gray-400 text-sm">Usuario</span>
								<span className="text-base font-semibold text-purple-700 bg-purple-100 rounded-full px-4 py-1 mb-2 shadow">
									{adminData.username}
								</span>
								<span className="text-gray-400 text-sm">Email</span>
								<span className="flex items-center gap-2 text-base text-gray-700 dark:text-gray-200 truncate max-w-full">
									<Mail className="h-5 w-5 text-purple-400" />
									<span className="truncate">{adminData.email}</span>
								</span>
								<button
									onClick={() => setEditOpenAdmin(true)}
									className="mt-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-2 px-6 rounded-full shadow-lg hover:scale-105 hover:shadow-xl transition-all flex items-center gap-2"
									>
									<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0-1.104.896-2 2-2s2 .896 2 2-.896 2-2 2-2-.896-2-2z" />
									</svg>
									Editar perfil
								</button>
							</div>
						</div>
						<div className="md:col-span-3 flex flex-col gap-4 h-full justify-between w-full mt-8 md:mt-0 md:ml-8">
							<div className="bg-white/80 rounded-2xl shadow-xl p-6 border border-pink-100">
								<h2 className="font-bold text-xl mb-4 flex items-center gap-2 text-blue-800">
									<MessageCircle size={20} />
									Preguntas Respondidas
								</h2>
								<div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8 text-sm items-start">
									{preguntasPagina.length > 0 ? (
										preguntasPagina.map((qa, idx) => {
											const pregunta = Object.keys(qa)[0];
											const respuesta = qa[pregunta];
											const preguntaSinHashtags = pregunta.replace(/#[\wáéíóúÁÉÍÓÚñÑ]+/g, '').trim();
											const hashtags = pregunta.match(/#[\wáéíóúÁÉÍÓÚñÑ]+/g) || [];
											return (
												<div
													key={idx}
													className="bg-blue-50 dark:bg-blue-100 rounded-xl p-4 shadow-md flex flex-col gap-2 border border-blue-100 dark:border-blue-200 w-full max-w-xs mx-auto cursor-pointer hover:scale-105 transition break-words"
													onClick={() =>
														setPreguntaSeleccionada({
															id: Number(qa.id),
															questionDescription: preguntaSinHashtags,
															answerDescription: respuesta,
															userId: 1,
															status: "ANSWERED",
															answerDate: qa.answerDate || "",
															answerHour: qa.answerHour || "",
															adminId: qa.adminId ? Number(qa.adminId) : null,
														})
													}
												>
													<div className="text-left">
														<span className="font-semibold text-blue-800">Pregunta:</span>
														<div className="text-blue-800">
															{preguntaSinHashtags}
															<div className="flex flex-wrap gap-1 mt-1">
																{hashtags.map((tag, i) => (
																	<span
																		key={i}
																		className="inline-block bg-blue-100 dark:bg-blue-200 text-blue-700 dark:text-blue-400 rounded-full px-2 py-0.5 text-xs font-semibold shadow-sm"
																	>
																		{tag}
																	</span>
																))}
															</div>
														</div>
													</div>
												</div>
											);
										})
									) : (
										<div className="col-span-3 flex flex-col items-center justify-center py-6">
											<div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
												<svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
												</svg>
											</div>
											<p className="text-gray-500 text-center text-base">
												Todavía no hay preguntas respondidas.
											</p>
										</div>
									)}
								</div>
								<div className="flex justify-center gap-2 mt-2 mb-6">
									<button
										className="px-2 py-1 rounded bg-[#e3f0fa] text-blue-800 hover:bg-blue-800 hover:text-white disabled:opacity-50"
										onClick={() => setPaginaPreguntas((p) => Math.max(1, p - 1))}
										disabled={paginaPreguntas === 1}
									>
										&lt;
									</button>
									{Array.from({ length: totalPaginasPreguntas }, (_, i) => i + 1).map((num) => (
										<button
											key={num}
											className={`px-3 py-1 rounded-full font-semibold text-sm ${
												paginaPreguntas === num
													? "bg-blue-800 text-white"
													: "bg-[#e3f0fa] text-blue-800 hover:bg-blue-800 hover:text-white"
											}`}
											onClick={() => setPaginaPreguntas(num)}
										>
											{num}
										</button>
									))}
									<button
										className="px-2 py-1 rounded bg-[#e3f0fa] text-blue-800 hover:bg-blue-800 hover:text-white disabled:opacity-50"
										onClick={() =>
											setPaginaPreguntas((p) =>
												Math.min(totalPaginasPreguntas, p + 1),
											)
										}
										disabled={paginaPreguntas === totalPaginasPreguntas}
									>
										&gt;
									</button>
								</div>
							</div>
							<div className="bg-white/80 rounded-2xl shadow-xl p-6 border border-pink-100">
								<h2 className="font-bold text-xl mb-4 flex items-center gap-2 text-[#FF00CC] dark:text-[#FF00CC]">
									<Bell size={20} />
									Alertas Emitidas
								</h2>
								{alertasPagina.length > 0 ? (
									<>
										<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-4">
											{alertasPagina.map((alerta, idx) => {
												const [id, fecha] = Object.entries(alerta)[0];
												let fechaFormateada = "Sin fecha";
												if (fecha) {
													const [year, month, day] = fecha.split("-");
													const nombreMes = [
														"enero", "febrero", "marzo", "abril", "mayo", "junio",
														"julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
													][Number(month) - 1];
													fechaFormateada = `${Number(day)} de ${nombreMes} de ${year}`;
												}
												return (
													<div
														key={idx}
														className="flex items-center gap-2 bg-pink-100/60 border border-pink-200 rounded-lg px-3 py-2 shadow-sm hover:scale-105 hover:shadow-md transition-all duration-200 text-sm"
													>
														<span className="flex items-center gap-1 text-pink-600 font-semibold">
															<Bell size={14} className="text-pink-400" />
															ID: {id}
														</span>
														<span className="flex items-center gap-1 text-pink-700 font-normal ml-2">
															<svg className="w-4 h-4 text-pink-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
																<rect x="3" y="4" width="18" height="18" rx="2" strokeWidth="2" />
																<path d="M16 2v4M8 2v4M3 10h18" strokeWidth="2" />
															</svg>
															{fechaFormateada}
														</span>
													</div>
												);
											})}
										</div>
										<div className="flex justify-center gap-1 mt-2">
											<button
												className="px-2 py-1 rounded bg-[#ffe3ed] text-[#FF00CC] hover:bg-[#FF00CC] hover:text-white disabled:opacity-50 text-xs"
												onClick={() => setPaginaAlertas((p) => Math.max(1, p - 1))}
												disabled={paginaAlertas === 1}
											>
												&lt;
											</button>
											{Array.from({ length: Math.ceil((adminData?.emmitedAlerts?.length || 0) / alertasPorPagina) }, (_, i) => i + 1).map((num) => (
												<button
													key={num}
													className={`px-2 py-1 rounded-full font-semibold text-xs ${paginaAlertas === num ? "bg-[#FF00CC] text-white" : "bg-[#ffe3ed] text-[#FF00CC] hover:bg-[#FF00CC] hover:text-white"}`}
													onClick={() => setPaginaAlertas(num)}
												>
													{num}
												</button>
											))}
											<button
												className="px-2 py-1 rounded bg-[#ffe3ed] text-[#FF00CC] hover:bg-[#FF00CC] hover:text-white disabled:opacity-50 text-xs"
												onClick={() => setPaginaAlertas((p) => Math.min(Math.ceil((adminData?.emmitedAlerts?.length || 0) / alertasPorPagina), p + 1))}
												disabled={paginaAlertas === Math.ceil((adminData?.emmitedAlerts?.length || 0) / alertasPorPagina)}
											>
												&gt;
											</button>
										</div>
									</>
								) : (
									<div className="flex flex-col items-center justify-center py-6">
										<div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mb-3">
											<svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
											</svg>
										</div>
										<p className="text-gray-500 text-center text-base">
											Todavía no hay alertas emitidas.
										</p>
									</div>
								)}
							</div>
						</div>
					</div>
					{editOpenAdmin && (
						<EditProfileModal
							userId={id!}
							initialData={{
							firstname: adminData.firstname,
							lastname: adminData.lastname,
							username: adminData.username,
							}}
							onClose={() => setEditOpenAdmin(false)}
							onSuccess={() => {
							window.location.reload(); // O llama a fetchData() si lo tienes extraído
							}}
						/>
					)}
				</div>
				{preguntaSeleccionada && (
					<QuestionDetailModal
						question={preguntaSeleccionada}
						onClose={() => setPreguntaSeleccionada(null)}
						showIds={role === "ADMIN"}
						hideDate={role !== "ADMIN"}
					/>
				)}
			</div>
		);
	}
}
