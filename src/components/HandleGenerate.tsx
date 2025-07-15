import Api from "@services/api";
import { AiResponse } from "@interfaces/AiResponse";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

export const isValidHashtagFormat = (input: string): boolean => {
	const tags = input
		.split(",")
		.map(tag => tag.trim())
		.filter(tag => tag.length > 0);

	if (tags.length === 0) return false;

	return tags.every(tag => /^#[\wáéíóúüñÁÉÍÓÚÜÑ-]+$/i.test(tag));
};

interface HandleGenerateParams {
	hashtags: string;
	setLoading: (val: boolean) => void;
	setAiResponse: (val: AiResponse | null) => void;
	setErrorMessage: (val: string) => void; // solo usado para validaciones iniciales
}

export const handleGenerate = async ({
	hashtags,
	setLoading,
	setAiResponse,
	setErrorMessage,
}: HandleGenerateParams): Promise<void> => {
	if (!hashtags.trim()) {
		setErrorMessage("❗ Por favor, ingresa al menos un hashtag.");
		return;
	}

	if (!isValidHashtagFormat(hashtags)) {
		setErrorMessage("❗ Formato inválido. Usa hashtags como: #marketing, #ia, #viral");
		return;
	}

	setLoading(true);
	setAiResponse(null);

	try {
		console.log("📤 Enviando al backend:", { message: hashtags });

		const api = await Api.getInstance();

		const response = await api.post<{ message: string }, any>(
			{ message: hashtags },
			{
				url: "/user/ia/chat/idea3",
			}
		);

		console.log("🔽 Respuesta cruda:", response.data.response);

		if (!response.data.response) {
			throw new Error("NO_RESPONSE");
		}

		const parsed: AiResponse = JSON.parse(response.data.response);
		console.log("✅ Objeto parseado:", parsed);

		setAiResponse(parsed);
	} catch (error: any) {
		console.error("❌ Error al consumir la API:", error);

		let userFriendlyMessage =
			"Lo que buscas va en contra de la política de uso de la IA. Reformula tu mensaje sin contenido ofensivo, violento o que infrinja nuestras normas: https://go.microsoft.com/fwlink/?linkid=2198766";

		if (error.message !== "NO_RESPONSE") {
			try {
				const backendError = error?.response?.data?.error;
				console.log("📛 error?.response?.data?.error:", backendError);

				if (typeof backendError === "string" && backendError.includes("{")) {
					const match = backendError.match(/"({.+})"/);
					if (match && match[1]) {
						const parsedError = JSON.parse(match[1]);
						console.log("📦 parsedError:", parsedError);

						const inner = parsedError?.error;

						if (
							inner?.code === "content_filter" ||
							inner?.innererror?.code === "ResponsibleAIPolicyViolation"
						) {
							userFriendlyMessage =
								"Lo que buscas va en contra de la política de uso de la IA. Reformula tu mensaje sin contenido ofensivo, violento o que infrinja nuestras normas: https://go.microsoft.com/fwlink/?linkid=2198766";
						} else if (inner?.message) {
							userFriendlyMessage = inner.message;
						}
					}
				}
			} catch (e) {
				console.error("⚠️ No se pudo interpretar el error filtrado:", e);
			}
		}

		await MySwal.fire({
			icon: "error",
			title: "Mensaje bloqueado",
			text: userFriendlyMessage,
			background: "#fff",
			confirmButtonText: "Cerrar",
			customClass: {
				popup: "rounded-2xl shadow-2xl p-8 max-w-lg",
				title: "text-2xl text-red-700 mb-2",
				confirmButton: "bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg text-lg",
			},
		});
	} finally {
		setLoading(false);
	}
};
