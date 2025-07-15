import { AiResponse } from "@interfaces/AiResponse";
import { ScrapiResponse } from "@interfaces/AiResponse";

/**
 * Verifica si una respuesta de IA está vacía (indicando moderación)
 */
export const isAiResponseEmpty = (response: AiResponse): boolean => {
  return !response.titulo && 
         !response.descripcion && 
         (!response.hashtags || response.hashtags.length === 0) && 
         (!response.sonidos_sugeridos || response.sonidos_sugeridos.length === 0) && 
         !response.recomendacion;
};

/**
 * Verifica si una respuesta de Scrapi está vacía (indicando moderación)
 */
export const isScrapiResponseEmpty = (response: ScrapiResponse): boolean => {
  return (!response.hashtags || response.hashtags.length === 0) && 
         (!response.keywords || response.keywords.length === 0) && 
         (!response.usernames || response.usernames.length === 0);
};

/**
 * Mensaje estándar para contenido bloqueado por moderación
 */
export const MODERATION_MESSAGE = "🚫 Tu consulta fue bloqueada por violar las políticas de contenido de la IA. Por favor, reformula tu mensaje evitando contenido violento, ofensivo, discriminatorio o inapropiado para plataformas públicas."; 