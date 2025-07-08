import React, { useEffect, useState } from "react";
import {
	MessageCircle,
	Send,
	CheckCircle,
	User,
	Shield,
	ChevronDown,
	X,
	Phone,
	AlarmClock,
} from "lucide-react";
import { useAuthContext } from "@contexts/AuthContext";
import { 
	getQuestionsPaged, 
	getAnsweredQuestionsPaged, 
	getPendingQuestionsPaged, 
	getQuestionsCount 
} from "@services/QA/getAllQuestions";
import { makeQuestion } from "@services/QA/userMakeQuestion";
import { answerQuestion } from "@services/QA/adminAnswerQuestion";
import type { QuestionAnswerResponse } from "@interfaces/QA/QuestionAnswerResponse";
import CommonQuestions from "@components/CommonQuestions";
import QuestionSearchBar from "@components/QuestionSearchBar";
import AskQuestionForm from "@components/AskQuestionForm";

export default function QuestionsAnswersPage() {
	const { id, role } = useAuthContext();

	const [activeTab, setActiveTab] = useState<"FAQ" | "QNA" | "ASK">("FAQ");
	const [questions, setQuestions] = useState<QuestionAnswerResponse[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [answer, setAnswer] = useState("");
	const [answeringId, setAnsweringId] = useState<number | null>(null);
	const [successMsg, setSuccessMsg] = useState<string | null>(null);
	const [filter, setFilter] = useState<"ALL" | "ANSWERED" | "PENDING">("ALL");
	const [sortOrder, setSortOrder] = useState<"NEWEST" | "OLDEST">("NEWEST");
	const [dropdownOpen, setDropdownOpen] = useState(false);
	const [hashtagFilter, setHashtagFilter] = useState<string[]>([]);
	const [hashtagDropdownOpen, setHashtagDropdownOpen] = useState(false);
	const [manualHashtag, setManualHashtag] = useState("");
	const [page, setPage] = useState(0);
	const [hasMore, setHasMore] = useState(true);
	const [searchText, setSearchText] = useState("");
	const [stats, setStats] = useState({ total: 0, answered: 0, pending: 0 });
	const PAGE_SIZE = 10;

	const estadoFiltros: Array<"ALL" | "ANSWERED" | "PENDING"> = [
		"ALL",
		"ANSWERED",
		"PENDING",
	];

	const loadMoreQuestions = async () => {
		if (filter === "PENDING") return;
		if (loading || !hasMore) return;
		setLoading(true);
		try {
			let res;
			const typedFilter = filter as "ALL" | "ANSWERED" | "PENDING";
			if (typedFilter === "ANSWERED") {
				res = await getAnsweredQuestionsPaged(page, PAGE_SIZE);
			} else if (typedFilter === "PENDING") {
				res = await getPendingQuestionsPaged(page, PAGE_SIZE);
			} else {
				res = await getQuestionsPaged(page, PAGE_SIZE);
			}
			const data = res.data as unknown as { content: QuestionAnswerResponse[]; last: boolean };
			const newQuestions = data.content;
			setQuestions((prev: QuestionAnswerResponse[]) => [...prev, ...newQuestions]);
			setPage((prev: number) => prev + 1);
			setHasMore(!data.last);
		} catch {
			setError("Error al cargar más preguntas");
		} finally {
			setLoading(false);
		}
	};

	const loadQuestions = async () => {
		if (filter === "PENDING") return;
		setLoading(true);
		setError(null);
		try {
			let res;
			const typedFilter = filter as "ALL" | "ANSWERED" | "PENDING";
			if (typedFilter === "ANSWERED") {
				res = await getAnsweredQuestionsPaged(0, PAGE_SIZE);
			} else if (typedFilter === "PENDING") {
				res = await getPendingQuestionsPaged(0, PAGE_SIZE);
			} else {
				res = await getQuestionsPaged(0, PAGE_SIZE);
			}
			const data = res.data as unknown as { content: QuestionAnswerResponse[]; last: boolean };
			const newQuestions = data.content;
			setQuestions(newQuestions);
			setPage(1);
			setHasMore(!data.last);
		} catch {
			setError("Error al cargar las preguntas");
		} finally {
			setLoading(false);
		}
	};

	const loadQuestionsCount = async () => {
		try {
			const res = await getQuestionsCount();
			setStats(res.data as unknown as { total: number; answered: number; pending: number });
		} catch {
			// Silenciar error del contador para no afectar la UX
		}
	};

	// Llamar a loadQuestionsCount al montar el componente y cuando se envía una pregunta o respuesta
	useEffect(() => {
		loadQuestionsCount();
	}, [activeTab, successMsg]);

	// useEffect para cargar preguntas según el filtro activo
	useEffect(() => {
		if (activeTab === "QNA") {
			const fetchQuestions = async () => {
				setLoading(true);
				setError(null);
				try {
					const res = await getQuestionsPaged(0, 1000);
					const all: QuestionAnswerResponse[] = (res.data as any).content || [];
					let filtered: QuestionAnswerResponse[] = all;
					const typedFilter = filter as "ALL" | "ANSWERED" | "PENDING";
					if (typedFilter === "ANSWERED") {
						filtered = all.filter((q) => q.status === "ANSWERED");
					} else if (typedFilter === "PENDING") {
						filtered = all.filter((q) => q.status === "PENDING");
					}
					setQuestions(filtered);
					setPage(1);
					setHasMore(false);
				} catch {
					setError("Error al cargar las preguntas");
					setQuestions([]);
				} finally {
					setLoading(false);
				}
			};
			fetchQuestions();
		}
	}, [activeTab, filter]);

	// Recargar preguntas solo cuando se cambia a la pestaña QNA
	useEffect(() => {
		if (activeTab === "QNA") {
			loadQuestions();
			// Limpiar filtros al cambiar a QNA
			setSearchText("");
			setHashtagFilter([]);
			setFilter("ALL");
			setSortOrder("NEWEST");
		}
	}, [activeTab]);

	// Recargar preguntas cuando se envía una respuesta
	const handleSendAnswer = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!answer.trim() || answeringId == null) return;
		try {
			await answerQuestion({
				status: "ANSWERED",
				questionId: answeringId,
				adminId: id!,
				answerDescription: answer,
			});
			setAnswer("");
			setAnsweringId(null);
			setSuccessMsg("¡Respuesta enviada!");
			// Recargar todas las preguntas para mostrar el cambio
			loadQuestions();
			setTimeout(() => setSuccessMsg(null), 3000);
		} catch {
			setError("Error al enviar la respuesta");
		}
	};

	const handleSendQuestion = async (questionText: string) => {
		try {
			await makeQuestion({ userId: id!, questionDescription: questionText });
			setSuccessMsg("¡Pregunta enviada!");
			loadQuestions();
			setTimeout(() => setSuccessMsg(null), 3000);
		} catch {
			setError("Error al enviar la pregunta");
		}
	};

	const handleSearch = (text: string) => {
		setSearchText(text);
	};

	// Aplicar filtros y búsqueda
	const filteredQuestions = questions
		.filter((q: QuestionAnswerResponse) => {
			// Filtro por estado
			const typedFilter = filter as "ALL" | "ANSWERED" | "PENDING";
			if (typedFilter === "ANSWERED" && q.status !== "ANSWERED") return false;
			if (typedFilter === "PENDING" && q.status !== "PENDING") return false;
			
			// Filtro por búsqueda de texto
			if (searchText.trim()) {
				const textoSinHashtags = q.questionDescription.replace(/#[\wáéíóúÁÉÍÓÚñÑ]+/g, "").trim();
				if (!textoSinHashtags.toLowerCase().includes(searchText.toLowerCase())) {
					return false;
				}
			}
			
			// Filtro por hashtags
			if (hashtagFilter.length > 0) {
				const hashtags = q.questionDescription.match(/#[\wáéíóúÁÉÍÓÚñÑ]+/g) || [];
				if (!hashtags.some((tag) => hashtagFilter.includes(tag))) {
					return false;
				}
			}
			
			return true;
		})
		.sort((a: QuestionAnswerResponse, b: QuestionAnswerResponse) => {
			// Mejorar el manejo de fechas para evitar errores
			try {
				const dateA = new Date(`${a.questionDate}T${a.questionHour || '00:00:00'}`);
				const dateB = new Date(`${b.questionDate}T${b.questionHour || '00:00:00'}`);
				
				// Verificar que las fechas son válidas
				if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
					return 0; // Si hay fechas inválidas, mantener el orden original
				}
				
				return sortOrder === "NEWEST"
					? dateB.getTime() - dateA.getTime()
					: dateA.getTime() - dateB.getTime();
			} catch {
				return 0; // En caso de error, mantener el orden original
			}
		});

	const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
		const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
		if (scrollHeight - scrollTop <= clientHeight + 100 && hasMore && !loading) {
			loadMoreQuestions();
		}
	};

	// Cerrar dropdowns cuando se hace clic fuera
	useEffect(() => {
		const handleClickOutside = () => {
			setDropdownOpen(false);
			setHashtagDropdownOpen(false);
		};

		document.addEventListener('click', handleClickOutside);
		return () => {
			document.removeEventListener('click', handleClickOutside);
		};
	}, []);

	// Al montar el componente, obtener todas las preguntas para el panel de estadísticas
	useEffect(() => {
		const fetchStats = async () => {
			try {
				const res = await getQuestionsPaged(0, 1000);
				const all = (res.data as any).content || [];
				setStats({
					total: all.length,
					answered: all.filter((q: any) => q.status === "ANSWERED").length,
					pending: all.filter((q: any) => q.status === "PENDING").length,
				});
			} catch {
				setStats({ total: 0, answered: 0, pending: 0 });
			}
		};
		fetchStats();
	}, []);

	return (
		<div className="w-screen min-h-screen bg-gradient-to-br from-white to-pink-100 dark:bg-gradient-to-br dark:from-violet-900 dark:to-black text-gray-900 dark:text-white flex justify-center">
			<div className="flex-1 flex justify-center w-full">
				<div className="mx-auto bg-white dark:bg-white/70 rounded-t-3xl px-4 md:px-8 py-6 md:py-8 w-full max-w-[1100px] flex flex-col mt-8 shadow-none">	
					<h1 className="w-full text-4xl font-extrabold mb-8 text-purple-800 flex items-center justify-center gap-2">
						Centro de Ayuda
					</h1>

					<div className="flex justify-center mb-10 gap-4">
						{["FAQ", "QNA"]
							.concat(role === "USER" ? ["ASK"] : [])
							.map((tab) => (
								<button
									key={tab}
									onClick={() => setActiveTab(tab as "FAQ" | "QNA" | "ASK")}
									className={`px-6 py-2 rounded-full font-semibold ${
										activeTab === tab
											? "bg-purple-600 text-white shadow"
											: "bg-gray-100 text-purple-600 hover:bg-gray-200"
									}`}
								>
									{tab === "FAQ" && "Preguntas frecuentes"}
									{tab === "QNA" && "Preguntas y respuestas"}
									{tab === "ASK" && "Haz una pregunta"}
								</button>
							))}
					</div>

					{activeTab === "FAQ" && <CommonQuestions />}

					{activeTab === "ASK" && role === "USER" && (
						<AskQuestionForm
							onSubmit={handleSendQuestion}
							loading={loading}
							error={error}
							success={successMsg}
						/>
					)}
					<div className="mt-8" />

					{activeTab === "QNA" && (
						<>
							{/* Mensaje de éxito */}
							{successMsg && (
								<div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center gap-2">
									<CheckCircle size={20} />
									<span className="font-semibold">{successMsg}</span>
								</div>
							)}
							
							{/* Mensaje de error */}
							{error && (
								<div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center gap-2">
									<X size={20} />
									<span className="font-semibold">{error}</span>
									<button 
										onClick={() => setError(null)}
										className="ml-auto text-red-500 hover:text-red-700"
									>
										<X size={16} />
									</button>
								</div>
							)}
							
							{/* Contador de preguntas para administradores */}
							{role === "ADMIN" && (
								<div className="mb-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
									<div className="flex justify-between items-center">
										<div className="flex gap-6">
											<div className="text-center">
												<div className="text-2xl font-bold text-purple-600">{stats.pending}</div>
												<div className="text-sm text-gray-600">Pendientes</div>
											</div>
											<div className="text-center">
												<div className="text-2xl font-bold text-green-600">{stats.answered}</div>
												<div className="text-sm text-gray-600">Respondidas</div>
											</div>
											<div className="text-center">
												<div className="text-2xl font-bold text-blue-600">{stats.total}</div>
												<div className="text-sm text-gray-600">Total</div>
											</div>
										</div>
										<div className="text-right">
											<div className="text-sm text-gray-500">Panel de Administrador</div>
											<div className="text-xs text-gray-400">Gestiona las preguntas de los usuarios</div>
										</div>
									</div>
								</div>
							)}
							
							<div className="flex flex-wrap justify-between items-center mb-6 gap-4">
								<div className="flex gap-2">
									{estadoFiltros.map((f) => {
										const count = questions.filter(q => {
											if (f === "ALL") return true;
											if (f === "ANSWERED") return q.status === "ANSWERED";
											if (f === "PENDING") return q.status === "PENDING";
											return true;
										}).length;
										
										return (
											<button
												key={f}
												className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
													filter === f
														? "bg-purple-600 text-white shadow-lg"
														: "bg-gray-100 text-gray-700 hover:bg-gray-200"
												}`}
												onClick={() => setFilter(f)}
											>
												{f === "ALL" && `Todas (${count})`}
												{f === "ANSWERED" && `Respondidas (${count})`}
												{f === "PENDING" && `No respondidas (${count})`}
											</button>
										);
									})}
								</div>
								<div className="relative flex flex-col items-start">
									<div className="relative w-full">
										<button
											type="button"
											className="flex items-center gap-2 px-4 py-2 rounded-full font-semibold border border-purple-300 text-purple-700 bg-white hover:bg-purple-50 transition-all dark:bg-white/80 w-full"
											onClick={() => setHashtagDropdownOpen((open) => !open)}
										>
											Filtrar por palabras clave
											<svg
												className="w-4 h-4"
												fill="none"
												stroke="currentColor"
												strokeWidth="2"
												viewBox="0 0 24 24"
											>
												<path
													strokeLinecap="round"
													strokeLinejoin="round"
													d="M19 9l-7 7-7-7"
												/>
											</svg>
										</button>
										{hashtagDropdownOpen && (
											<div className="absolute left-0 top-full w-full bg-white border border-purple-200 rounded-lg shadow-lg z-50 p-2 dark:bg-white/80">
												<div className="flex flex-col gap-2 w-full">
													<input
														type="text"
														value={manualHashtag}
														onChange={(e) => setManualHashtag(e.target.value)}
														placeholder="Buscar palabra clave..."
														className="w-full px-3 py-2 border border-purple-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white text-gray-900 placeholder-gray-400"
													/>
													<button
														className="w-full bg-purple-600 text-white px-3 py-2 rounded text-sm font-semibold hover:bg-purple-700"
														onClick={() => {
															const tag = `#${manualHashtag.trim()}`;
															if (tag.length > 1 && !hashtagFilter.includes(tag)) {
																setHashtagFilter([...hashtagFilter, tag]);
															}
															setManualHashtag("");
															setHashtagDropdownOpen(false);
														}}
														disabled={!manualHashtag.trim()}
													>
														Buscar
													</button>
												</div>
											</div>
										)}
									</div>
									{hashtagFilter.length > 0 && (
										<div className="mt-2 flex flex-wrap gap-2">
											{hashtagFilter.map((tag: string) => (
												<span
													key={tag}
													className="inline-flex items-center bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-semibold shadow"
												>
													{tag}
													<button
														type="button"
														className="ml-2 rounded-full hover:bg-purple-200 p-1 transition"
														onClick={() => {
															setHashtagFilter(hashtagFilter.filter((t: string) => t !== tag));
														}}
														aria-label="Quitar filtro"
													>
														<X size={16} />
													</button>
												</span>
											))}
										</div>
									)}
								</div>
								<div className="relative">
									<button
										onClick={(e) => {
											e.stopPropagation();
											setDropdownOpen(!dropdownOpen);
										}}
										className="flex items-center justify-between gap-2 bg-white border border-purple-300 text-purple-700 px-4 py-2 rounded-md shadow-sm hover:bg-purple-50 transition-all dark:bg-white/80"
									>
										<span className="font-semibold">Ordenar:</span>
										<span>{sortOrder === "NEWEST" ? "Más recientes" : "Más antiguas"}</span>
										<ChevronDown size={16} className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
									</button>

									{dropdownOpen && (
										<div className="absolute right-0 mt-2 w-48 bg-white border border-purple-200 rounded-md shadow-lg z-50">
											<button
												onClick={(e) => {
													e.stopPropagation();
													setSortOrder("NEWEST");
													setDropdownOpen(false);
												}}
												className={`w-full text-left px-4 py-3 text-purple-700 hover:bg-purple-50 transition-colors ${
													sortOrder === "NEWEST"
														? "bg-purple-100 font-semibold border-l-4 border-purple-500"
														: ""
												}`}
											>
												<div className="flex items-center gap-2">
													<span>Más recientes</span>
													{sortOrder === "NEWEST" && <CheckCircle size={16} className="text-purple-600" />}
												</div>
											</button>
											<button
												onClick={(e) => {
													e.stopPropagation();
													setSortOrder("OLDEST");
													setDropdownOpen(false);
												}}
												className={`w-full text-left px-4 py-3 text-purple-700 hover:bg-purple-50 transition-colors ${
													sortOrder === "OLDEST"
														? "bg-purple-100 font-semibold border-l-4 border-purple-500"
														: ""
												}`}
											>
												<div className="flex items-center gap-2">
													<span>Más antiguas</span>
													{sortOrder === "OLDEST" && <CheckCircle size={16} className="text-purple-600" />}
												</div>
											</button>
										</div>
									)}
								</div>
							</div>

							<QuestionSearchBar onSearch={handleSearch} />

							{/* Indicador de resultados */}
							<div className="mb-4 text-sm text-gray-600">
								Mostrando {filteredQuestions.length} de {
									filter === "ALL"
										? stats.total
										: filter === "ANSWERED"
											? stats.answered
											: stats.pending
								} preguntas
								{searchText.trim() && ` que coinciden con "${searchText}"`}
								{hashtagFilter.length > 0 && ` con las palabras clave seleccionadas`}
							</div>

							<div
								className="flex flex-col gap-6 overflow-y-auto max-h-[500px] pr-2"
								onScroll={handleScroll}
								style={{ scrollbarGutter: 'stable' }}
							>
								{filteredQuestions.length === 0 && !loading && (
									<div className="text-center py-8">
										<div className="text-gray-400 text-lg mb-2">
											{filter === "ALL" && "No hay preguntas registradas."}
											{filter === "ANSWERED" && "No hay preguntas respondidas."}
											{filter === "PENDING" && "No hay preguntas pendientes."}
										</div>
										{searchText.trim() && (
											<div className="text-sm text-gray-500">
												No se encontraron resultados para: "{searchText}"
											</div>
										)}
									</div>
								)}
								{filteredQuestions.map((q: QuestionAnswerResponse) => {
									const hashtagRegex = /#[\wáéíóúÁÉÍÓÚñÑ]+/g;
									const hashtags =
										q.questionDescription.match(hashtagRegex) || [];
									const textWithoutHashtags = q.questionDescription
										.replace(hashtagRegex, "")
										.trim();
									const isPending = q.status === "PENDING";
									const isReplying = answeringId === q.id;

									return (
										<div
											key={q.id}
											className={`bg-white rounded-2xl shadow-lg p-6 border-2 transition hover:shadow-2xl dark:bg-white/80 ${
												q.status === "ANSWERED"
													? "border-green-200 bg-green-50/30"
													: "border-yellow-200 bg-yellow-50/30"
											}`}
										>
											{/* Fecha y estado */}
											<div className="flex items-center justify-between mb-3">
												<div className="flex items-center gap-2">
													<User size={18} className="text-purple-400" />
													<span className="text-sm text-gray-500">
														{q.questionDate} {q.questionHour}
													</span>
												</div>
												<span
													className={`px-3 py-1 rounded-full text-xs font-bold ${
														q.status === "ANSWERED"
															? "bg-green-500 text-white shadow-sm"
															: "bg-yellow-500 text-white shadow-sm"
													}`}
												>
													{q.status === "ANSWERED" ? (
														<CheckCircle
															size={14}
															className="inline mr-1 align-middle"
														/>
													) : (
														<AlarmClock
															size={14}
															className="inline mr-1 align-middle"
														/>
													)}
													{q.status === "ANSWERED"
														? "RESPONDIDA"
														: "PENDIENTE"}
												</span>
											</div>

											{/* Pregunta */}
											<div className="ml-7 mb-2 flex items-center">
												<span className="font-bold text-purple-700 mr-2">
													Pregunta:
												</span>
												<span className="text-gray-800">
													{textWithoutHashtags}
												</span>
											</div>

											{/* Hashtags */}
											{hashtags.length > 0 && (
												<div className="ml-7 flex flex-wrap gap-1 mb-2">
													{hashtags.map((tag: string, idx: number) => (
														<span
															key={idx}
															className="inline-block bg-purple-100 text-purple-700 rounded px-2 py-0.5 text-xs font-semibold shadow-sm"
														>
															{tag}
														</span>
													))}
												</div>
											)}
											{q.status === "ANSWERED" && (
												<div className="ml-7 mt-2 bg-green-50 border-l-4 border-green-400 p-3 rounded">
													<div className="flex items-center gap-2 text-green-700 font-semibold mb-1">
														<Shield size={16} /> Respuesta:
													</div>
													<div className="text-gray-800">
														{q.answerDescription}
													</div>
												</div>
											)}

											{/* —— BLOQUE INLINE DE RESPUESTA —— */}
											{role === "ADMIN" && isPending && (
												<div className="ml-7">
													{isReplying ? (
														<form
															onSubmit={handleSendAnswer}
															className="
																w-full max-w-4xl mx-auto
																bg-white dark:bg-black/30
																p-6 rounded-2xl
																shadow-lg dark:shadow-2xl
																border border-purple-100 dark:border-white/10
																flex flex-col gap-3
															"
														>
															<input
																type="text"
																value={answer}
																onChange={(e) => setAnswer(e.target.value)}
																placeholder="Escribe tu respuesta..."
																className="
																	w-full px-4 py-3
																	border-2 border-purple-200 dark:border-neutral-700
																	rounded-lg shadow-sm
																	focus:outline-none focus:ring-2 focus:ring-purple-500
																	text-sm
																	bg-white dark:bg-neutral-900/70
																	text-gray-900 dark:text-gray-100
																	placeholder-gray-400 dark:placeholder-gray-400
																"
															/>
															<button
																type="submit"
																className="
																	px-6 py-2 rounded-lg flex items-center gap-2
																	bg-purple-600 hover:bg-purple-700 text-white
																	dark:bg-purple-700 dark:hover:bg-purple-800
																	transition
																"
															>
																<Send size={16} /> Responder
															</button>
															<button
																type="button"
																onClick={() => {
																	setAnsweringId(null);
																	setAnswer("");
																}}
																className="bg-gray-200 text-gray-700 px-3 py-2 rounded hover:bg-gray-300 transition"
															>
																Cancelar
															</button>
														</form>
													) : (
														<button
															onClick={() => setAnsweringId(q.id)}
															className="
																px-6 py-3 rounded-lg flex items-center gap-2
																bg-yellow-500 hover:bg-yellow-600 text-white
																dark:bg-yellow-600 dark:hover:bg-yellow-700
																transition-all shadow-lg hover:shadow-xl
																font-semibold
															"
														>
															<MessageCircle size={18} /> Responder Pregunta
														</button>
													)}
												</div>
											)}
										</div>
									);
								})}
							</div>
						</>
					)}
					{activeTab !== "QNA" && (
						<div className="mx-auto w-full max-w-[1100px] bg-gradient-to-r from-purple-700 to-fuchsia-600 dark:bg-gradient-to-r dark:from-purple-800 dark:via-purple-900 dark:to-gray-800 py-3 rounded-b-3xl"
						>
							<div className="w-full flex flex-col md:flex-row items-center justify-between gap-6 text-white dark:text-white px-6"
							>
								<div className="flex items-center gap-3">
									<Phone className="w-6 h-6 text-orange-300 dark:text-white" />
									<div className="flex flex-col text-sm">
										<span className="font-semibold">Información de contacto</span>
										<span className="opacity-90">+51 999 888 777</span>
									</div>
								</div>
								<div className="hidden md:block h-8 border-l border-white/30 dark:border-gray-300/30 mx-4" />
								<div className="flex items-center gap-3">
									<AlarmClock className="w-6 h-6 text-yellow-200 dark:text-white" />
									<div className="flex flex-col text-sm">
										<span className="font-semibold">Horarios</span>
										<span className="opacity-90">L-V 9:00-18:00</span>
									</div>
								</div>
								<div className="hidden md:block h-8 border-l border-white/30 dark:border-gray-300/30 mx-4" />
								<div className="flex items-center gap-3">
									<AlarmClock className="w-6 h-6 text-yellow-200 dark:text-white" />
									<div className="flex flex-col text-sm">
										<span className="font-semibold">Preguntas técnicas</span>
										<span className="opacity-90">24h máx.</span>
									</div>
								</div>
							</div>
						</div>
					)}
					{activeTab === "QNA" && loading ? (
						questions.length === 0 ? (
							<div className="text-center py-4 text-gray-500">Cargando preguntas...</div>
						) : (
							<div className="text-center py-4 text-purple-500">Cargando más preguntas...</div>
						)
					) : null}
					{activeTab === "QNA" && !hasMore && questions.length > 0 && (
						<div className="text-center py-4 text-gray-400">No hay más preguntas.</div>
					)}
				</div>
			</div>
		</div>
	);
}
