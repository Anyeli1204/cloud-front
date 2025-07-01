import React, { useEffect, useState } from "react";
import {
	MessageCircle,
	Send,
	CheckCircle,
	User,
	Shield,
	ChevronDown,
} from "lucide-react";
import { useAuthContext } from "@contexts/AuthContext";
import { getQuestions } from "@services/QA/getAllQuestions";
import { makeQuestion } from "@services/QA/userMakeQuestion";
import { answerQuestion } from "@services/QA/adminAnswerQuestion";
import type { QuestionAnswerResponse } from "@interfaces/QA/QuestionAnswerResponse";
import CommonQuestions from "@components/CommonQuestions";
import QuestionSearchBar from "@components/QuestionSearchBar";
import AskQuestionForm from "@components/AskQuestionForm";
import { QuestionDetailModal } from "@components/QuestionDetailModal";

export default function QuestionsAnswersPage() {
	const { id, role } = useAuthContext();

	const [activeTab, setActiveTab] = useState<"FAQ" | "QNA" | "ASK">("FAQ");
	const [questions, setQuestions] = useState<QuestionAnswerResponse[]>([]);
	const [allQuestions, setAllQuestions] = useState<QuestionAnswerResponse[]>(
		[],
	);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [answer, setAnswer] = useState("");
	const [answeringId, setAnsweringId] = useState<number | null>(null);
	const [successMsg, setSuccessMsg] = useState<string | null>(null);
	const [filter, setFilter] = useState<"ALL" | "ANSWERED" | "PENDING">("ALL");
	const [sortOrder, setSortOrder] = useState<"NEWEST" | "OLDEST">("NEWEST");
	const [dropdownOpen, setDropdownOpen] = useState(false);
	const [hashtagFilter, setHashtagFilter] = useState<string | null>(null);
	const [hashtagDropdownOpen, setHashtagDropdownOpen] = useState(false);
	const [manualHashtag, setManualHashtag] = useState("");
	const [selectedQuestion, setSelectedQuestion] = useState<QuestionAnswerResponse | null>(null);

	const estadoFiltros: Array<"ALL" | "ANSWERED" | "PENDING"> = [
		"ALL",
		"ANSWERED",
		"PENDING",
	];

	const fetchQuestions = async () => {
		setLoading(true);
		try {
			const res = await getQuestions();
			const loaded = Array.isArray(res.data) ? res.data : [res.data];
			setQuestions(loaded);
			setAllQuestions(loaded);
		} catch {
			setError("Error al cargar las preguntas");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchQuestions();
	}, []);

	const handleSendQuestion = async (questionText: string) => {
		try {
			await makeQuestion({ userId: id!, questionDescription: questionText });
			setSuccessMsg("¡Pregunta enviada!");
			fetchQuestions();
			setTimeout(() => setSuccessMsg(null), 3000);
		} catch {
			setError("Error al enviar la pregunta");
		}
	};

	const handleSendAnswer = async (e: React.FormEvent) => {
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
			fetchQuestions();
		} catch {
			setError("Error al enviar la respuesta");
		}
	};

	const handleSearch = (text: string) => {
		const filtered = allQuestions.filter((q) =>
			q.questionDescription.toLowerCase().includes(text.toLowerCase()),
		);
		setQuestions(filtered);
	};

	const allHashtags = Array.from(
		new Set(
			allQuestions.flatMap(
				(q) => q.questionDescription.match(/#[\wáéíóúÁÉÍÓÚñÑ]+/g) || [],
			),
		),
	);

	const filteredQuestions = questions
		.filter((q) => {
			if (filter === "ANSWERED" && q.status !== "ANSWERED") return false;
			if (filter === "PENDING" && q.status !== "PENDING") return false;
			if (hashtagFilter) {
				const hashtags =
					q.questionDescription.match(/#[\wáéíóúÁÉÍÓÚñÑ]+/g) || [];
				return (hashtags as string[]).includes(hashtagFilter as string);
			}
			return true;
		})
		.sort((a, b) => {
			const dateA = new Date(`${a.questionDate}T${a.questionHour}`);
			const dateB = new Date(`${b.questionDate}T${b.questionHour}`);
			return sortOrder === "NEWEST"
				? dateB.getTime() - dateA.getTime()
				: dateA.getTime() - dateB.getTime();
		});

	return (
		<div className="min-h-screen bg-gradient-to-br from-white to-pink-100 p-6 space-y-6 flex flex-col">
			<div className="flex-1">
				<div className="max-w-6xl mx-auto bg-white rounded-xl p-8 shadow-xl">
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
							<div className="flex flex-wrap justify-between items-center mb-6 gap-4">
								<div className="flex gap-2">
									{estadoFiltros.map((f) => (
										<button
											key={f}
											className={`px-4 py-2 rounded-full text-sm font-semibold ${
												filter === f
													? "bg-purple-600 text-white"
													: "bg-gray-100 text-gray-700"
											}`}
											onClick={() => setFilter(f)}
										>
											{f === "ALL" && "Todas"}
											{f === "ANSWERED" && "Respondidas"}
											{f === "PENDING" && "No respondidas"}
										</button>
									))}
								</div>
								<div className="relative">
									<button
										type="button"
										className="flex items-center gap-2 px-4 py-2 rounded-full font-semibold border border-purple-300 text-purple-700 bg-white hover:bg-purple-50 transition-all"
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
										<div className="absolute left-0 mt-2 w-56 bg-white border border-purple-200 rounded-lg shadow-lg z-50 p-2">
											{/* Solo input de búsqueda de palabra clave, sin menú desplegable ni lista */}
											<div className="flex flex-col gap-2 w-56">
												<input
													type="text"
													value={manualHashtag}
													onChange={(e) => setManualHashtag(e.target.value)}
													placeholder="Buscar palabra clave..."
													className="px-3 py-2 border border-purple-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
												/>
												<button
													className="bg-purple-600 text-white px-3 py-2 rounded text-sm font-semibold hover:bg-purple-700"
													onClick={() => setHashtagFilter(`#${manualHashtag.trim()}`)}
													disabled={!manualHashtag.trim()}
												>
													Buscar
												</button>
											</div>
										</div>
									)}
								</div>
								<div className="relative">
									<button
										onClick={() => setDropdownOpen(!dropdownOpen)}
										className="flex items-center justify-between gap-2 bg-white border border-purple-300 text-purple-700 px-4 py-2 rounded-md shadow-sm hover:bg-purple-50 transition-all"
									>
										Ordenar:{" "}
										{sortOrder === "NEWEST" ? "Más recientes" : "Más antiguas"}
										<ChevronDown size={16} />
									</button>

									{dropdownOpen && (
										<div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
											<button
												onClick={() => {
													setSortOrder("NEWEST");
													setDropdownOpen(false);
												}}
												className={`w-full text-left px-4 py-2 hover:bg-purple-100 ${
													sortOrder === "NEWEST"
														? "bg-purple-50 font-semibold text-purple-700"
														: ""
												}`}
											>
												Más recientes
											</button>
											<button
												onClick={() => {
													setSortOrder("OLDEST");
													setDropdownOpen(false);
												}}
												className={`w-full text-left px-4 py-2 hover:bg-purple-100 ${
													sortOrder === "OLDEST"
														? "bg-purple-50 font-semibold text-purple-700"
														: ""
												}`}
											>
												Más antiguas
											</button>
										</div>
									)}
								</div>
							</div>

							<QuestionSearchBar onSearch={handleSearch} />

							{loading ? (
								<div className="text-center text-gray-500">
									Cargando preguntas…
								</div>
							) : filteredQuestions.length === 0 ? (
								<div className="text-gray-400">
									No hay preguntas registradas.
								</div>
							) : (
								<div className="space-y-6">
									{filteredQuestions.map((q) => {
										const hashtagRegex = /#[\wáéíóúÁÉÍÓÚñÑ]+/g;
										const hashtags =
											q.questionDescription.match(hashtagRegex) || [];
										const textWithoutHashtags = q.questionDescription
											.replace(hashtagRegex, "")
											.trim();
										const isSelected = selectedQuestion && selectedQuestion.id === q.id;
										return (
											<div
												key={q.id}
												className={`bg-white rounded-xl shadow p-4 border border-purple-100 cursor-pointer transition-all duration-200 ${isSelected ? "ring-2 ring-purple-400 bg-purple-50" : "hover:bg-purple-50"}`}
												onClick={() => setSelectedQuestion(q)}
											>
												<div className="flex items-center gap-2 mb-1">
													<User size={18} className="text-purple-400" />
													<span className="text-sm text-gray-500">{q.questionDate} {q.questionHour}</span>
													<span
														className={`ml-4 px-2 py-0.5 rounded text-xs font-semibold ${
															q.status === "ANSWERED"
																? "bg-green-100 text-green-700"
																: "bg-yellow-100 text-yellow-700"
														}`}
													>
														{q.status === "ANSWERED" && (
															<CheckCircle size={14} className="inline mr-1" />
														)}
														{q.status === "ANSWERED" ? "Respondida" : "Pendiente"}
													</span>
												</div>
												<div className="ml-7 mb-1 flex items-center">
													<span className="font-bold text-purple-700 mr-2">
														Pregunta:
													</span>
													<span className="text-gray-800">
														{textWithoutHashtags}
													</span>
												</div>
												{/* Tercera línea: hashtags */}
												{hashtags.length > 0 && (
													<div className="ml-7 flex flex-wrap gap-1 mt-1">
														{hashtags.map((tag, idx) => (
															<span
																key={idx}
																className="inline-block bg-purple-100 text-purple-700 rounded px-2 py-0.5 text-xs font-semibold shadow-sm"
															>
																{tag}
															</span>
														))}
													</div>
												)}
											</div>
										);
									})}
									{selectedQuestion && (
										<QuestionDetailModal question={selectedQuestion} onClose={() => setSelectedQuestion(null)} showIds={true} />
									)}
								</div>
							)}
						</>
					)}
					{activeTab !== "QNA" && (
						<footer className="w-full bg-purple-700 py-4 px-6 md:px-12 rounded-b-2xl mt-8">
							<div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center md:justify-between gap-4 text-white">
								<div className="flex items-center gap-2">
									<span className="text-2xl">📞</span>
									<span className="font-semibold">Información Contacto:</span>
									<span className="ml-2">+51 999 888 777</span>
								</div>
								<span className="hidden md:inline text-white/50">|</span>
								<div className="flex items-center gap-2 whitespace-nowrap">
									<span className="text-2xl">⏰</span>
									<span>Horarios: L-V 9:00-18:00</span>
								</div>
								<span className="hidden md:inline text-white/50">|</span>
								<div className="flex items-center gap-2">
									<span className="text-2xl">⏰</span>
									<span>Preguntas técnicas: 24h máx.</span>
								</div>
							</div>
						</footer>
					)}
				</div>
			</div>
		</div>
	);
}
