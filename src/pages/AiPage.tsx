import React, { useState, useEffect, useRef } from "react";
import { Sparkles, Hash, Music, Target, Search, Loader2, Lightbulb } from "lucide-react";
import { handleGenerate } from "@components/HandleGenerate";
import ScrapiLogo from "@assets/ScrapiLogo.png";
import { AiResponse } from "@interfaces/AiResponse";
import { AudioGallery } from "@components/AudioGallery";
import { recommendContent } from "@services/ia/recommendContent";
import { MODERATION_MESSAGE } from "../utils/aiModeration";

export default function AiPage() {
  const [hashtags, setHashtags] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [aiResponse, setAiResponse] = useState<AiResponse | null>(null);
  const [activeTab, setActiveTab] = useState("hashtags");

  // Estados para autocompletado de hashtags
  const [suggestedHashtags, setSuggestedHashtags] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [recommendationText, setRecommendationText] = useState("");
  const [isSubmittingRecommendation, setIsSubmittingRecommendation] = useState(false);
  const [scrapiResponse, setScrapiResponse] = useState<{
    hashtags?: string[];
  } | null>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Función para obtener sugerencias de hashtags de la IA
  const getHashtagSuggestions = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSuggestedHashtags([]);
      return;
    }

    setIsLoadingSuggestions(true);
    try {
      const response = await recommendContent({ message: query });
      if (response.response) {
        try {
          const data = JSON.parse(response.response);
          // Verificar si la respuesta está vacía (indicando moderación)
          if (!data || !data.hashtags || data.hashtags.length === 0) {
            setErrorMessage(MODERATION_MESSAGE);
            return;
          }
          if (data.hashtags && Array.isArray(data.hashtags)) {
            setSuggestedHashtags(data.hashtags);
            setShowSuggestions(true);
          }
        } catch (parseError) {
          console.error("Error parsing AI response:", parseError);
        }
      }
    } catch (error) {
      console.error("Error getting hashtag suggestions:", error);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  // Debounce para las sugerencias
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (inputValue.trim()) {
        getHashtagSuggestions(inputValue);
      } else {
        setSuggestedHashtags([]);
        setShowSuggestions(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [inputValue]);

  // Cerrar sugerencias al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setHashtags(value);
  };

  const handleSuggestionClick = (suggestion: string) => {
    const cleanSuggestion = suggestion.replace(/^#/, "");
    const currentHashtags = hashtags.split(",").map(tag => tag.trim()).filter(Boolean);

    if (!currentHashtags.includes(cleanSuggestion)) {
      const newHashtags = currentHashtags.length > 0
        ? `${hashtags}, ${cleanSuggestion}`
        : cleanSuggestion;
      setHashtags(newHashtags);
      setInputValue(newHashtags);
    }

    setShowSuggestions(false);
  };

  const handleSubmitRecommendation = async () => {
    if (!recommendationText.trim()) {
      setErrorMessage("Por favor, describe lo que quieres scrapear.");
      return;
    }

    setIsSubmittingRecommendation(true);
    setScrapiResponse(null);
    try {
      const response = await recommendContent({ message: recommendationText });
      if (response.response) {
        try {
          const data = JSON.parse(response.response);
          
          // Verificar si la respuesta está vacía (indicando moderación)
          if (!data || !data.hashtags || data.hashtags.length === 0) {
            setErrorMessage(MODERATION_MESSAGE);
            return;
          }
          
          setScrapiResponse({
            hashtags: data.hashtags || []
          });
          setErrorMessage(null);
        } catch (parseError) {
          console.error("Error parsing Scrapi response:", parseError);
          setErrorMessage("Error al procesar la respuesta de la IA.");
        }
      } else if (response.error) {
        setErrorMessage(response.error);
      }
    } catch {
      setErrorMessage("Error al consultar con Scrapi IA. Inténtalo de nuevo.");
    } finally {
      setIsSubmittingRecommendation(false);
    }
  };

  const handleClick = () => {
    console.log("🔹 Botón clickeado con hashtags:", hashtags);
    handleGenerate({
      hashtags,
      setLoading,
      setErrorMessage,
      setAiResponse,
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6 min-h-screen">
      {/* Banner moderno */}
      <div className="w-full rounded-2xl bg-white shadow-md flex items-center px-6 py-6 gap-6 mb-6 relative overflow-hidden">
        {/* Robot icon */}
        <img
          src={ScrapiLogo}
          alt="Scrapi IA"
          className="w-16 h-16 z-10 animate-bounce-slow"
          style={{ filter: "drop-shadow(0 0 4px #e0e0e0)" }}
        />
        {/* Text */}
        <div className="z-10">
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-purple-600 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent mb-1">
            AI Content Creator
          </h1>
          <p className="text-sm text-gray-600 font-medium">
            Genera contenido optimizado para <span className="font-semibold text-purple-600">TikTok</span> con sugerencias impulsadas por IA.
          </p>
        </div>
      </div>

      {/* Popup de error */}
      {errorMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-xl max-w-sm w-full relative text-center">
            <button
              onClick={() => setErrorMessage(null)}
              className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-xl"
            >
              ×
            </button>
            <p className="text-red-600 dark:text-red-400 font-semibold">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Tarjetas */}
      <div className="flex flex-col md:flex-row gap-6 items-stretch">
        {/* Formulario */}
        <div className="bg-white rounded-2xl shadow-lg p-6 flex-1 border border-purple-100 min-h-[400px] flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <Hash className="text-purple-400" size={24} />
            <h2 className="text-2xl font-extrabold text-gray-900">Hashtags y Contenido</h2>
          </div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Hashtags iniciales</label>
          <div className="relative mb-3">
            <input
              ref={inputRef}
              type="text"
              placeholder="#marketing, #viral, #trending..."
              value={inputValue}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border-2 border-purple-100 rounded-lg focus:ring-2 focus:ring-purple-200 focus:border-purple-400 text-gray-900 text-sm bg-gray-50"
            />
            {isLoadingSuggestions && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
              </div>
            )}

            {/* Dropdown de sugerencias */}
            {showSuggestions && suggestedHashtags.length > 0 && (
              <div
                ref={suggestionsRef}
                className="absolute top-full left-0 right-0 bg-white border-2 border-purple-200 rounded-lg shadow-lg z-50 mt-1 max-h-48 overflow-y-auto"
              >
                <div className="p-2">
                  <div className="text-xs text-purple-600 font-semibold mb-2 flex items-center gap-1">
                    <Search className="w-3 h-3" />
                    Sugerencias de IA
                  </div>
                  {suggestedHashtags.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-purple-50 rounded-md transition-colors flex items-center gap-2"
                    >
                      <Hash className="w-3 h-3 text-purple-400" />
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          {/* Chips sugeridos */}

          {/* Formulario de Scrapi IA */}
          <div className="bg-purple-50 rounded-lg p-4 mb-4 border border-purple-100">
            <h3 className="text-sm font-semibold text-purple-800 mb-2 flex items-center gap-1">
              <Sparkles className="w-4 h-4" />
              Scrapi IA - Asistente de Scraping
            </h3>
            <p className="text-xs text-purple-600 mb-3">
              Describe el contenido que deseas hacer y te daré recomendaciones inteligentes
            </p>
            <div className="space-y-3">
              <textarea
                value={recommendationText}
                onChange={(e) => setRecommendationText(e.target.value)}
                placeholder="Ej: Quiero crear contenido de cocina saludable, recetas veganas y tips de nutrición..."
                className="w-full px-3 py-2 border border-purple-200 rounded-lg text-sm bg-white text-gray-900 placeholder-gray-400 resize-none focus:ring-2 focus:ring-purple-200 focus:border-purple-400"
                rows={3}
                maxLength={300}
                disabled={isSubmittingRecommendation}
              />
              <div className="flex justify-between items-center">
                <span className="text-xs text-purple-500">
                  {recommendationText.length}/300 caracteres
                </span>
                <button
                  type="button"
                  onClick={handleSubmitRecommendation}
                  disabled={isSubmittingRecommendation || !recommendationText.trim()}
                  className="px-3 py-1 bg-purple-600 text-white rounded-lg text-xs font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                >
                  {isSubmittingRecommendation ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Consultando IA...
                    </>
                  ) : (
                    "Consultar Scrapi"
                  )}
                </button>
              </div>
            </div>

            {/* Resultados de la IA */}
            {scrapiResponse && (
              <div className="mt-4 space-y-3">
                {/* Hashtags */}
                {scrapiResponse.hashtags && scrapiResponse.hashtags.length > 0 && (
                  <div className="bg-white rounded-lg p-3 border border-purple-200">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-semibold text-purple-700">Hashtags sugeridos:</h4>
                      <button
                        type="button"
                        onClick={() => {
                          const hashtagsString = scrapiResponse.hashtags!.join(", ");
                          setHashtags(hashtagsString);
                          setInputValue(hashtagsString);
                        }}
                        className="px-2 py-1 bg-purple-600 text-white rounded text-xs font-semibold hover:bg-purple-700 transition-colors"
                      >
                        Autocompletar
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {scrapiResponse.hashtags.map((tag, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleSuggestionClick(tag)}
                          className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold hover:bg-purple-200 transition-colors"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}


              </div>
            )}
          </div>
          <div className="flex gap-2 w-full mt-auto">
            <button
              onClick={() => {
                setHashtags("");
                setInputValue("");
                setRecommendationText("");
                setScrapiResponse(null);
                setAiResponse(null);
                setActiveTab("hashtags");
                setShowSuggestions(false);
                setSuggestedHashtags([]);
              }}
              className="w-full sm:w-auto border-2 border-purple-400 text-purple-700 font-bold rounded-lg px-3 py-2 bg-white hover:bg-purple-50 transition shadow flex items-center justify-center gap-2 text-sm"
              type="button"
              disabled={loading && !hashtags.trim()}
            >
              <span className="text-lg">↺</span> Limpiar
            </button>
            <button
              onClick={handleClick}
              className="w-full sm:w-auto py-2 px-4 bg-gradient-to-r from-purple-400 to-pink-300 text-white font-bold rounded-lg shadow-lg hover:from-purple-500 hover:to-pink-400 flex items-center justify-center gap-2 text-sm transition disabled:opacity-50"
              disabled={loading || !hashtags.trim()}
              type="button"
            >
              <span>⚡</span> {loading ? "Generando..." : "Generar contenido"}
            </button>
          </div>
        </div>
        {/* Panel derecho: resultados IA */}
        <div className="flex-1 min-h-[400px]">
          {aiResponse ? (
            <>
              {/* Tabs */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-purple-100 h-full flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="text-purple-400" size={24} />
                  <h2 className="text-2xl font-extrabold text-gray-900">¿Listo para crear?</h2>
                </div>
                <p className="text-sm text-gray-600 mb-4 text-center max-w-lg">Descubre las sugerencias optimizadas para tu video de TikTok.</p>
                {/* Tabs */}
                <div className="flex justify-center mb-4">
                  <button
                    className={`px-4 py-1 rounded-t-lg font-semibold text-sm transition border-b-4 ${activeTab === "hashtags" ? "border-purple-400 bg-purple-50 text-purple-700" : "border-transparent text-gray-400 bg-gray-50"}`}
                    onClick={() => setActiveTab("hashtags")}
                  >
                    Hashtags
                  </button>
                  <button
                    className={`px-4 py-1 rounded-t-lg font-semibold text-sm transition border-b-4 ${activeTab === "caption" ? "border-purple-400 bg-purple-50 text-purple-700" : "border-transparent text-gray-400 bg-gray-50"}`}
                    onClick={() => setActiveTab("caption")}
                  >
                    Caption
                  </button>
                  <button
                    className={`px-4 py-1 rounded-t-lg font-semibold text-sm transition border-b-4 ${activeTab === "descripciones" ? "border-pink-400 bg-pink-50 text-pink-700" : "border-transparent text-gray-400 bg-gray-50"}`}
                    onClick={() => setActiveTab("descripciones")}
                  >
                    Descripciones
                  </button>
                  <button
                    className={`px-4 py-1 rounded-t-lg font-semibold text-sm transition border-b-4 ${activeTab === "tips" ? "border-purple-400 bg-purple-50 text-purple-700" : "border-transparent text-gray-400 bg-gray-50"}`}
                    onClick={() => setActiveTab("tips")}
                  >
                    Tips
                  </button>
                  <button
                    className={`px-4 py-1 rounded-t-lg font-semibold text-sm transition border-b-4 ${activeTab === "sounds" ? "border-green-400 bg-green-50 text-green-700" : "border-transparent text-gray-400 bg-gray-50"}`}
                    onClick={() => setActiveTab("sounds")}
                  >
                    Sonidos
                  </button>
                </div>
                {/* Tab content */}
                <div className="flex-1">
                  {activeTab === "hashtags" && (
                    <div>
                      <h3 className="text-base font-bold mb-2 text-gray-800">Hashtags sugeridos</h3>
                      <div className="flex flex-wrap gap-2">
                        {aiResponse.hashtags?.map((tag, idx) => (
                          <span
                            key={idx}
                            className="bg-purple-100 text-purple-700 font-semibold px-2 py-1 rounded-full text-sm"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {activeTab === "caption" && (
                    <div className="bg-orange-50 rounded-2xl shadow-lg p-6 border border-orange-100 flex flex-col items-center">
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="text-orange-500" size={20} />
                        <h2 className="text-lg font-extrabold text-orange-800">Caption sugerida</h2>
                      </div>
                      <div className="w-full max-w-lg space-y-4">
                        {aiResponse.titulo.split(',').map((titulo, index) => (
                          <div key={index} className="p-4 text-sm text-gray-700 text-justify bg-white rounded-lg shadow-sm">
                            <span className="font-semibold text-orange-700">Título {index + 1}:</span> {titulo.trim()}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {activeTab === "descripciones" && (
                    <div className="bg-pink-50 rounded-2xl shadow-lg p-6 border border-pink-100 flex flex-col items-center">
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="text-pink-500" size={20} />
                        <h2 className="text-lg font-extrabold text-pink-800">Descripciones sugeridas</h2>
                      </div>
                      <div className="w-full max-w-lg space-y-4">
                        {(() => {
                          // Función para separar por comas solo cuando la siguiente palabra comience con mayúscula
                          const splitDescriptions = (text: string) => {
                            const regex = /,\s*([A-Z][a-z]*)/g;
                            const matches = [...text.matchAll(regex)];
                            const descriptions = [];
                            let lastIndex = 0;

                            matches.forEach((match) => {
                              const matchIndex = match.index!;

                              // Agregar la parte antes de la coma (sin la coma)
                              const beforeComma = text.substring(lastIndex, matchIndex).trim();
                              if (beforeComma) {
                                descriptions.push(beforeComma);
                              }

                              // Actualizar el índice para incluir la palabra con mayúscula en la siguiente descripción
                              lastIndex = matchIndex + 1; // Solo avanzar después de la coma, manteniendo la palabra
                            });

                            // Agregar la parte final (que incluye todas las palabras con mayúscula)
                            const finalPart = text.substring(lastIndex).trim();
                            if (finalPart) {
                              descriptions.push(finalPart);
                            }

                            return descriptions;
                          };

                          const descriptions = splitDescriptions(aiResponse.descripcion);

                          return descriptions.map((descripcion, index) => (
                            <div key={index} className="p-4 text-sm text-gray-700 text-justify bg-white rounded-lg shadow-sm">
                              <span className="font-semibold text-pink-700">Descripción {index + 1}:</span> {descripcion}
                            </div>
                          ));
                        })()}
                      </div>
                    </div>
                  )}
                  {activeTab === "tips" && (
                    <div className="bg-blue-50 rounded-2xl shadow-lg p-6 border border-blue-100 flex flex-col items-center">
                      <div className="flex items-center gap-2 mb-3">
                        <Target className="text-blue-500" size={20} />
                        <h2 className="text-lg font-extrabold text-blue-800">Tips de alcance</h2>
                      </div>
                      <div className="w-full max-w-lg">
                        <div className="p-4 text-sm text-gray-700 text-justify">
                          {aiResponse.recomendacion}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "sounds" &&
                    Array.isArray(aiResponse.sonidos_sugeridos) &&
                    aiResponse.sonidos_sugeridos.length > 0 && (
                      <div className="bg-green-50 rounded-2xl shadow-lg p-6 border border-green-100 flex flex-col items-center">
                        <div className="flex items-center gap-2 mb-3">
                          <Music className="text-green-500" size={20} />
                          <h2 className="text-lg font-extrabold text-green-800">
                            Sonidos Virales Recomendados
                          </h2>
                        </div>

                        {/* Galería de sonidos con separación automática */}
                        <div className="w-full max-w-4xl">
                          <AudioGallery 
                            sonidos={aiResponse.sonidos_sugeridos} 
                            variant="thumbnail"
                            onSoundClick={(sound) => {
                              // Opcional: Aquí podrías agregar lógica adicional cuando se hace clic en un sonido
                              console.log('Sonido seleccionado:', sound.nombre);
                            }}
                          />
                        </div>
                      </div>
                    )}


                </div>
              </div>
            </>
          ) : (
            // Panel inicial
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-purple-100 h-full flex flex-col items-center justify-center">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="text-purple-400" size={24} />
                <h2 className="text-2xl font-extrabold text-gray-900">¿Listo para crear?</h2>
              </div>
              <p className="text-sm text-gray-600 mb-6 text-center max-w-lg">Describe tu idea de contenido y deja que nuestra IA genere sugerencias optimizadas para tu video de TikTok.</p>
              <div className="flex flex-col items-center justify-center flex-1">
                <div className="rounded-full bg-pink-50 p-6 mb-4">
                  <Lightbulb className="text-pink-400" size={32} />
                </div>
                <p className="text-sm text-gray-400 text-center mb-4">Completa los campos y genera contenido para ver sugerencias personalizadas</p>
                <div className="flex gap-6 mt-2 justify-center">
                  <div className="flex flex-col items-center text-center">
                    <Hash className="text-blue-400 mb-1" size={24} />
                    <span className="font-semibold text-gray-800 text-sm">Hashtags inteligentes</span>
                    <span className="text-xs text-gray-400">Tendencias y etiquetas virales</span>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <Music className="text-purple-400 mb-1" size={24} />
                    <span className="font-semibold text-gray-800 text-sm">Sonidos virales</span>
                    <span className="text-xs text-gray-400">Audios recomendados</span>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <Target className="text-green-400 mb-1" size={24} />
                    <span className="font-semibold text-gray-800 text-sm">Tips de alcance</span>
                    <span className="text-xs text-gray-400">Estrategias para más vistas</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
