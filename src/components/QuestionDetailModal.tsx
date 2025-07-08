import React from "react";
import { QuestionAnswerResponse } from "@interfaces/QA/QuestionAnswerResponse";
import {
	XIcon,
	MessageCircle,
	CheckCircle,
	Clock,
	Calendar,
	UserCheck,
	User2Icon,
	User,
} from "lucide-react";
import ReactDOM from "react-dom";

interface Props {
	question: QuestionAnswerResponse;
	onClose: () => void;
	showIds?: boolean;
	hideDate?: boolean;
}

export const QuestionDetailModal = ({
	question,
	onClose,
	showIds = false,
	hideDate = false,
}: Props) => {
	return ReactDOM.createPortal(
		<>
			<div className="fixed inset-0 z-[99999] flex items-center justify-center bg-gradient-to-br from-pink-200/70 via-purple-200/70 to-sky-200/70 backdrop-blur-md">
				<div className="bg-white border-2 border-purple-200 rounded-3xl shadow-2xl max-w-lg w-full p-8 relative flex flex-col gap-6 dark:bg-white/80">
					<button
						onClick={onClose}
						className="absolute top-6 right-6 text-purple-400 hover:text-purple-700 bg-white rounded-full shadow p-2 transition-colors dark:bg-white/80"
					>
						<XIcon className="w-7 h-7" />
					</button>
					<h2 className="text-2xl font-extrabold mb-4 text-center text-purple-700 tracking-tight flex items-center gap-2 justify-center">
						<MessageCircle className="w-7 h-7 text-purple-400" /> Detalle de la
						Pregunta
					</h2>
					<div className="space-y-3 text-base text-gray-700">
						{/* Solo mostrar IDs si showIds es true */}
						{showIds && (
							<>
								<div className="flex items-center gap-2">
									<User2Icon className="w-5 h-5 text-sky-400" />
									<span className="font-semibold">ID Usuario:</span>{" "}
									{question.userId}
								</div>
								{question.adminId && (
									<div className="flex items-center gap-2">
										<User className="w-5 h-5 text-purple-400" />
										<span className="font-semibold">ID Admin:</span>{" "}
										{question.adminId}
									</div>
								)}
							</>
						)}

						{/* Pregunta */}
						<div>
							<div className="flex items-center gap-2 mb-1">
								<MessageCircle className="w-5 h-5 text-purple-400" />
								<span className="font-semibold">Pregunta:</span>
							</div>
							<div className="ml-8 text-gray-800 whitespace-pre-line">
								{question.questionDescription}
							</div>
						</div>
						{/* Estado solo si está pendiente */}
						{question.status === "PENDING" && (
							<div className="flex items-center gap-2">
								<CheckCircle className="w-5 h-5 text-yellow-400" />
								<span className="font-semibold">Estado:</span> Pendiente
							</div>
						)}
						{/* Respuesta */}
						{question.answerDescription && (
							<div>
								<div className="flex items-center gap-2 mb-1">
									<UserCheck className="w-5 h-5 text-purple-600" />
									<span className="font-semibold">Respuesta:</span>
								</div>
								<div className="ml-8 mt-1 whitespace-pre-line text-gray-800">
									{question.answerDescription}
								</div>
							</div>
						)}
						{question.answerDate && question.answerHour && !hideDate && (
							<div className="flex items-center gap-2">
								<Clock className="w-5 h-5 text-blue-400" />
								<span className="font-semibold">Fecha de Respuesta:</span>{" "}
								{question.answerDate} - {question.answerHour}
							</div>
						)}
					</div>
				</div>
			</div>
		</>,
		document.body,
	);
};
