// src/services/ia/recommendContent.ts
import Api from '../api';

export interface RecommendContentRequest {
  message: string;
}

export interface RecommendContentResponse {
  response?: string;
  error?: string;
}

function isAxiosErrorWithErrorField(error: unknown): error is { response: { data: { error: string } } } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as any).response === 'object' &&
    (error as any).response !== null &&
    'data' in (error as any).response &&
    typeof (error as any).response.data === 'object' &&
    (error as any).response.data !== null &&
    'error' in (error as any).response.data &&
    typeof (error as any).response.data.error === 'string'
  );
}

/**
 * Solicita recomendaciones de contenido a la IA de ScrapeTok.
 * @param message Temática o categoría para la recomendación.
 */
export async function recommendContent(request: RecommendContentRequest): Promise<RecommendContentResponse> {
  try {
    const api = await Api.getInstance();
    const response = await api.post<RecommendContentRequest, RecommendContentResponse>(
      request,
      { url: '/user/ia/chat/idea1' }
    );
    return response.data;
  } catch (error: unknown) {
    let msg = 'Error al conectar con la IA';
    if (isAxiosErrorWithErrorField(error)) {
      msg = error.response.data.error;
    }
    return { error: msg };
  }
} 