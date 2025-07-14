import Api from "@services/api";
import { AiResponse } from "@interfaces/AiResponse";

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
	setErrorMessage: (val: string) => void;
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
	setAiResponse(null); // Limpia respuesta anterior

	try {
		console.log("📤 Enviando al backend:", { message: hashtags });

		const api = await Api.getInstance();

		const response = await api.post<{ message: string }, { response: string }>(
			{ message: hashtags },
			{
				url: "/user/ia/chat/idea3",
			}
		);

		console.log("🔽 Respuesta cruda:", response.data.response);

		const parsed: AiResponse = JSON.parse(response.data.response);

		console.log("✅ Objeto parseado:", parsed);

		setAiResponse(parsed);
	} catch (error: any) {
		console.error("❌ Error al consumir la API:", error);
		setErrorMessage("❌ Hubo un error: " + (error.message || "Error desconocido."));
	} finally {
		setLoading(false);
	}
};
