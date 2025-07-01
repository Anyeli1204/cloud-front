import React, { useEffect, useState } from "react";
import { useAuthContext } from "@contexts/AuthContext";
import { userInfo } from "@services/user-admin-info/UserInfo";
import { adminInfo } from "@services/user-admin-info/AdminInfo";
import type { UserInfoResponse } from "@interfaces/user-info/UserInfoResponse";
import type { AdminInformationResponse } from "@interfaces/admin-info/AdminInformationResponse";
import type { QuestionAnswerResponse } from "@interfaces/question-answer/QuestionAnswerResponse";
import {
	User,
	Shield,
	MessageCircle,
	Bell,
	BadgeCheck,
	Mail,
} from "lucide-react";
import CommonQuestions from "@components/CommonQuestions";
import QuestionSearchBar from "@components/QuestionSearchBar";
import { Button } from "@components/Button";
import { QuestionDetailModal } from "@components/QuestionDetailModal";
const TABS_USER = [
	{ key: "perfil", label: "Perfil", icon: <User size={18} /> },
	{
		key: "historial",
		label: "Historial de Scrapeo",
		icon: <Shield size={18} />,
	},
	{ key: "cuentas", label: "Cuentas Scrapeadas", icon: <Mail size={18} /> },
];

const TABS_ADMIN = [
	{ key: "perfil", label: "Perfil", icon: <User size={18} /> },
	{
		key: "qa",
		label: "Preguntas y Respuestas",
		icon: <MessageCircle size={18} />,
	},
	{ key: "alertas", label: "Alertas Emitidas", icon: <Bell size={18} /> },
];

function Badge({ active }: { active: boolean }) {
	return (
		<span
			className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
		>
			{active ? <BadgeCheck size={14} className="mr-1" /> : null}
			{active ? "Activo" : "Inactivo"}
		</span>
	);
}

function Card({ children }: { children: React.ReactNode }) {
	return (
		<div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-purple-100 animate-fade-in">
			{children}
		</div>
	);
}

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
	const [activeTab, setActiveTab] = useState("perfil");
	const [userData, setUserData] = useState<UserInfoResponse | null>(null);
	const [adminData, setAdminData] = useState<AdminInformationResponse | null>(
		null,
	);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const scrapeosPorPagina = 3;
	const [paginaActual, setPaginaActual] = useState(1);
	const cuentasPorPagina = 9;
	const [paginaCuentas, setPaginaCuentas] = useState(1);

	const ordenCampos = [
		{ key: "Date From", label: "Fecha desde" },
		{ key: "Date to", label: "Fecha hasta" },
		{ key: "Tiktok Usernames", label: "Usuarios de TikTok" },
		{ key: "Hashtags", label: "Hashtags" },
		{ key: "Key Word", label: "Palabra clave" },
		{
			key: "N Last Post By Hashtags",
			label: "N° de últimos posts por hashtag",
		},
		{ key: "Execution Time", label: "Tiempo de ejecución" },
	];

	// Hooks para paginación y modal
	const [paginaPreguntas, setPaginaPreguntas] = useState(1);
	const preguntasPorPagina = 3;
	const [preguntaSeleccionada, setPreguntaSeleccionada] = useState<QuestionAnswerResponse | null>(null);

	const [paginaAlertas, setPaginaAlertas] = useState(1);
	const alertasPorPagina = 6;
	const totalAlertas = adminData?.emmitedAlert?.length || 0;
	const totalPaginasAlertas = Math.ceil(totalAlertas / alertasPorPagina);
	const alertasPagina =
		adminData?.emmitedAlert?.slice(
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

		return (
			<div className="min-h-screen bg-gradient-to-br from-white to-pink-100 p-6 space-y-6">
				<div className="max-w-6xl mx-auto px-4 py-6">
					<h1 className="w-full text-4xl font-extrabold mb-8 text-purple-800 flex items-center justify-center gap-2">
						<User size={28} className="text-purple-800" />
						Información de Usuario
					</h1>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
						<div className="bg-white rounded-3xl shadow-xl p-8 flex flex-col items-center transition-transform duration-200 hover:shadow-2xl hover:-translate-y-1 max-w-md w-full h-full self-stretch">
							<div
								className="tiktok-ring mb-6"
								style={{ width: "150px", height: "150px" }}
							>
								<img
									src={avatarUrl}
									alt="Foto de perfil"
									className="tiktok-profile-img rounded-full w-[130px] h-[130px] m-2 object-cover"
									style={{ width: "130px", height: "130px" }}
								/>
							</div>
							<div className="text-center w-full">
								<div className="text-gray-400 text-xs mb-1 tracking-wide">
									Nombre
								</div>
								<div className="font-extrabold text-lg text-gray-800 mb-2">
									{userData.firstname} {userData.lastname}
								</div>
								<div className="border-t border-gray-100 my-2"></div>
								<div className="text-gray-400 text-xs mb-1 tracking-wide">
									Usuario
								</div>
								<div className="font-semibold text-base text-gray-700 mb-2">
									{userData.username}
								</div>
								<div className="border-t border-gray-100 my-2"></div>
								<div className="text-gray-400 text-xs mb-1 tracking-wide">
									Email
								</div>
								<div className="font-semibold text-base text-gray-700 break-all mb-4">
									{userData.email}
								</div>
							</div>
						</div>
						<div className="md:col-span-2 flex flex-col gap-8">
							<div className="bg-white rounded-xl shadow-md p-6">
								<h2 className="font-semibold mb-4 flex items-center gap-2 text-blue-800">
									<Shield size={18} className="text-blue-800" /> Historial de
									Scrapeo
								</h2>
								{scrapeosPagina.length > 0 ? (
									<>
										<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
											{scrapeosPagina.map((filtro, idx) => (
												<div
													key={idx}
													className="rounded-lg p-3 border border-[#e3f0fa] text-xs break-words whitespace-pre-line bg-[#e3f0fa] text-blue-800"
												>
													{ordenCampos.map(({ key, label }) => {
														const valor = filtro[key];
														if (
															valor === null ||
															valor === "null" ||
															valor === undefined ||
															valor === ""
														)
															return null;
														return (
															<div key={key} className="mb-1">
																<span className="font-medium">{label}:</span>{" "}
																{String(valor)}
															</div>
														);
													})}
												</div>
											))}
										</div>
										<div className="flex flex-wrap gap-2 justify-center mt-4">
											<button
												className="px-2 py-1 rounded bg-[#e3f0fa] text-blue-800 hover:bg-blue-800 hover:text-white disabled:opacity-50"
												onClick={() =>
													setPaginaActual((p) => Math.max(1, p - 1))
												}
												disabled={paginaActual === 1}
											>
												&lt;
											</button>
											{Array.from(
												{ length: totalPaginas },
												(_, i) => i + 1,
											).map((num) => (
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
									</>
								) : (
									<div className="text-gray-400">
										No hay historial de scrapeo.
									</div>
								)}
							</div>
							<div className="bg-white rounded-xl shadow-md p-6">
								<h2 className="font-semibold mb-4 flex items-center gap-2 text-[#FF00CC]">
									<Mail size={18} className="text-[#FF00CC]" /> Cuentas
									Scrapeadas
								</h2>
								{(userData.tiktokUsernameScraped ?? []).length > 0 ? (
									<>
										<ul className="flex flex-wrap gap-2">
											{(userData.tiktokUsernameScraped ?? [])
												.slice(
													(paginaCuentas - 1) * cuentasPorPagina,
													paginaCuentas * cuentasPorPagina,
												)
												.map((username, idx) => (
													<li
														key={idx}
														className="bg-[#ffe3ed] text-[#FF00CC] px-3 py-1 rounded-full text-sm font-semibold shadow-sm"
													>
														{username}
													</li>
												))}
										</ul>
										<div className="flex flex-wrap gap-2 justify-center mt-4">
											<button
												className="px-2 py-1 rounded bg-[#ffe3ed] text-[#FF00CC] hover:bg-[#FF00CC] hover:text-white disabled:opacity-50"
												onClick={() =>
													setPaginaCuentas((p) => Math.max(1, p - 1))
												}
												disabled={paginaCuentas === 1}
											>
												&lt;
											</button>
											{Array.from(
												{
													length: Math.ceil(
														(userData.tiktokUsernameScraped ?? []).length /
															cuentasPorPagina,
													),
												},
												(_, i) => i + 1,
											).map((num) => (
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
																(userData.tiktokUsernameScraped ?? []).length /
																	cuentasPorPagina,
															),
															p + 1,
														),
													)
												}
												disabled={
													paginaCuentas ===
													Math.ceil(
														(userData.tiktokUsernameScraped ?? []).length /
															cuentasPorPagina,
													)
												}
											>
												&gt;
											</button>
										</div>
									</>
								) : (
									<div className="text-gray-400">
										No hay cuentas scrapeadas.
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	if (role === "ADMIN" && adminData) {
		const totalPreguntas = adminData.questionAndAnswer?.length || 0;
		const totalPaginasPreguntas = Math.ceil(
			totalPreguntas / preguntasPorPagina,
		);
		const preguntasPagina =
			adminData.questionAndAnswer?.slice(
				(paginaPreguntas - 1) * preguntasPorPagina,
				paginaPreguntas * preguntasPorPagina,
			) || [];

		return (
			<div className="min-h-screen bg-gradient-to-br from-white to-pink-100 p-6 space-y-6">
				<div className="max-w-6xl mx-auto px-4 py-8">
					<h1 className="w-full text-4xl font-extrabold mb-8 text-purple-800 flex items-center justify-center gap-2">
						<Shield size={28} className="text-purple-800" /> Información de
						Administrador
					</h1>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
						<div className="bg-white rounded-3xl shadow-xl p-8 flex flex-col items-center transition-transform duration-200 hover:shadow-2xl hover:-translate-y-1 max-w-md w-full h-full self-stretch mx-auto">
							<div
								className="tiktok-ring mb-6"
								style={{ width: "150px", height: "150px" }}
							>
								<img
									src={avatarUrl}
									alt="Foto de perfil"
									className="tiktok-profile-img rounded-full w-[130px] h-[130px] m-2 object-cover"
									style={{ width: "130px", height: "130px" }}
									onError={(e) =>
										(e.currentTarget.src =
											"https://ui-avatars.com/api/?name=Admin&background=eee&color=7f00ff")
									}
								/>
							</div>
							<div className="text-center w-full">
								<div className="text-gray-400 text-xs mb-1 tracking-wide">
									Nombre
								</div>
								<div className="font-extrabold text-lg text-gray-800 mb-2">
									{adminData.firstname} {adminData.lastname}
								</div>
								<div className="border-t border-gray-100 my-2"></div>
								<div className="text-gray-400 text-xs mb-1 tracking-wide">
									Usuario
								</div>
								<div className="font-semibold text-base text-gray-700 mb-2">
									{adminData.username}
								</div>
								<div className="border-t border-gray-100 my-2"></div>
								<div className="text-gray-400 text-xs mb-1 tracking-wide">
									Email
								</div>
								<div className="font-semibold text-base text-gray-700 break-all mb-4">
									{adminData.email}
								</div>
							</div>
						</div>
						<div className="md:col-span-2 flex flex-col gap-8">
							<div className="bg-white rounded-xl shadow-md p-6">
								<h2 className="w-full font-semibold mb-4 flex items-center justify-center gap-2 text-blue-800">
									<MessageCircle size={18} className="text-blue-800" /> Preguntas Respondidas
								</h2>
								{preguntasPagina.length > 0 ? (
									<>
										<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
											{preguntasPagina.map((qa, idx) => {
												const pregunta = Object.keys(qa)[0];
												const respuesta = qa[pregunta];
												return (
													<button
														key={idx}
														className="rounded-lg p-3 border border-[#e3f0fa] text-xs break-words whitespace-pre-line bg-[#e3f0fa] text-blue-800 font-semibold text-left shadow hover:shadow-md transition"
														onClick={() => {
															setPreguntaSeleccionada({
																questionDescription: pregunta,
																answerDescription: respuesta,
																userId: adminData?.id || "",
																questionDate: qa.questionDate || "-",
																questionHour: qa.questionHour || "",
																status: "ANSWERED",
																answerDate: qa.answerDate || "",
																answerHour: qa.answerHour || "",
																adminId: adminData?.id || "",
															});
														}}
													>
														<span className="font-medium">{pregunta}</span>
													</button>
												);
											})}
										</div>
										<div className="flex flex-wrap gap-2 justify-center mt-4">
											<button
												className="px-2 py-1 rounded bg-[#e3f0fa] text-[#7E22CE] hover:bg-[#7E22CE] hover:text-white disabled:opacity-50"
												onClick={() =>
													setPaginaPreguntas((p) => Math.max(1, p - 1))
												}
												disabled={paginaPreguntas === 1}
											>
												&lt;
											</button>
											{Array.from(
												{ length: totalPaginasPreguntas },
												(_, i) => i + 1,
											).map((num) => (
												<button
													key={num}
													className={`px-3 py-1 rounded-full font-semibold text-sm ${
														paginaPreguntas === num
															? "bg-[#4ba3c7] text-white"
															: "bg-[#e3f0fa] text-blue-800 hover:bg-[#4ba3c7] hover:text-white"
													}`}
													onClick={() => setPaginaPreguntas(num)}
												>
													{num}
												</button>
											))}
											<button
												className="px-2 py-1 rounded bg-[#e3f0fa] text-[#7E22CE] hover:bg-[#7E22CE] hover:text-white disabled:opacity-50"
												onClick={() =>
													setPaginaPreguntas((p) =>
														Math.min(totalPaginasPreguntas, p + 1))
												}
												disabled={paginaPreguntas === totalPaginasPreguntas}
											>
												&gt;
											</button>
										</div>
									</>
								) : (
									<div className="text-gray-400">
										No hay preguntas respondidas.
									</div>
								)}
							</div>
							<div className="bg-white rounded-xl shadow-md p-6">
								<h2 className="font-semibold mb-4 flex items-center gap-2 text-[#FF00CC]">
									<Bell size={18} className="text-[#FF00CC]" /> Alertas Emitidas
								</h2>
								{alertasPagina.length > 0 ? (
									<>
										<ul className="flex flex-wrap gap-2">
											{alertasPagina.map((alerta, idx) => {
												const [id, fecha] = Object.entries(alerta)[0];
												return (
													<li
														key={idx}
														className="bg-[#ffe3ed] text-[#FF00CC] px-3 py-1 rounded-full text-sm font-semibold shadow-sm"
													>
														<span className="font-bold">ID:</span> {id}{" "}
														<span className="ml-2 font-medium">Fecha:</span>{" "}
														{fecha}
													</li>
												);
											})}
										</ul>
										<div className="flex flex-wrap gap-2 justify-center mt-4">
											<button
												className="px-2 py-1 rounded bg-[#ffe3ed] text-[#FF00CC] hover:bg-[#FF00CC] hover:text-white disabled:opacity-50"
												onClick={() =>
													setPaginaAlertas((p) => Math.max(1, p - 1))
												}
												disabled={paginaAlertas === 1}
											>
												&lt;
											</button>
											{Array.from({ length: totalPaginasAlertas }, (_, i) => i + 1).map((num) => (
												<button
													key={num}
													className={`px-3 py-1 rounded-full font-semibold text-sm ${paginaAlertas === num ? "bg-[#FF00CC] text-white" : "bg-[#ffe3ed] text-[#FF00CC] hover:bg-[#FF00CC] hover:text-white"}`}
													onClick={() => setPaginaAlertas(num)}
												>
													{num}
												</button>
											))}
											<button
												className="px-2 py-1 rounded bg-[#ffe3ed] text-[#FF00CC] hover:bg-[#FF00CC] hover:text-white disabled:opacity-50"
												onClick={() =>
													setPaginaAlertas((p) => Math.min(totalPaginasAlertas, p + 1))
												}
												disabled={paginaAlertas === totalPaginasAlertas}
											>
												&gt;
											</button>
										</div>
									</>
								) : (
									<div className="text-gray-400">
										No hay alertas emitidas.
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
				{preguntaSeleccionada && (
					<>
						{console.log("role:", role, "showIds:", role === "ADMIN")}
						<QuestionDetailModal
							question={preguntaSeleccionada}
							onClose={() => setPreguntaSeleccionada(null)}
							showIds={role === "ADMIN"}
							hideDate={role !== "ADMIN"}
						/>
					</>
				)}
			</div>
		);
	}
}