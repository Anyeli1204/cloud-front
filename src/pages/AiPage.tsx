import React, { useState } from "react";
import { Sparkles, Hash, Music, Target } from "lucide-react";
import { handleGenerate } from "@components/HandleGenerate";
import ScrapiLogo from "@assets/ScrapiLogo.png";
import { AiResponse } from "@interfaces/AiResponse";

export default function AiPage() {
  const [hashtags, setHashtags] = useState("");
  const [aiResponse, setAiResponse] = useState<AiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleClick = () => {
    console.log("🔹 Botón clickeado con hashtags:", hashtags);
    handleGenerate({
      hashtags,
      setLoading,
      setAiResponse,
      setErrorMessage,
    });
  };

  return (
    <div className="px-6 py-10 max-w-7xl mx-auto">
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

      {/* Encabezado con logo */}
      <div className="flex items-center gap-4 mb-4">
        <img src={ScrapiLogo} alt="Logo IA" className="h-16 w-16 object-contain" />
        <h1 className="text-3xl font-bold text-purple-800">AI Content Creator</h1>
      </div>

      <p className="text-lg text-left text-gray-700 dark:text-gray-300 mb-10 max-w-4xl leading-relaxed">
        Genera contenido optimizado para TikTok con sugerencias impulsadas por IA.
      </p>

      {/* Tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Tarjeta Izquierda */}
        <div className="md:col-span-4 bg-white dark:bg-gray-900 shadow-md rounded-xl p-6 flex flex-col items-center justify-center mt-4">
          <div className="w-full max-w-sm flex flex-col items-center gap-6">
            <h2 className="text-lg font-bold text-center text-gray-800 dark:text-white">
              Escribe tus hashtags y obtén recomendaciones optimizadas.
            </h2>

            <div className="w-full">
              <label
                htmlFor="hashtags"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Hashtags
              </label>
              <textarea
                id="hashtags"
                rows={5}
                placeholder="#marketing, #ia, #viral"
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm resize-none"
              />
            </div>

            <button
              onClick={handleClick}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition disabled:opacity-50"
              disabled={loading || !hashtags.trim()}
            >
              {loading ? "Generando..." : "Generar contenido"}
            </button>
          </div>
        </div>

        {/* Tarjeta Derecha */}
        <div className="md:col-span-8 bg-white dark:bg-gray-800 shadow-md rounded-xl p-8 flex flex-col justify-between min-h-[420px] max-h-[90vh] overflow-y-auto">
          <div className="space-y-6">
            {aiResponse && aiResponse.titulo && aiResponse.descripcion && Array.isArray(aiResponse.hashtags) ? (
              <>
                <div>
                  <h2 className="text-xl font-bold text-purple-700 mb-1">🎯 Opciones de titulos </h2>
                  <p className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-line">
                    {aiResponse.titulo}
                  </p>
                </div>

                <div>
                  <h2 className="text-xl font-bold text-purple-700 mb-1">📝 Descripción</h2>
                  <p className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-line">
                    {aiResponse.descripcion}
                  </p>
                </div>

                <div>
                  <h2 className="text-xl font-bold text-purple-700 mb-1">📈 Hashtags</h2>
                  <div className="flex flex-wrap gap-2">
                    {aiResponse.hashtags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium dark:bg-purple-900 dark:text-white"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {Array.isArray(aiResponse.sonidos_sugeridos) && (
                  <div>
                    <h2 className="text-xl font-bold text-purple-700 mb-1">🎵 Sonidos sugeridos</h2>
                    <ul className="list-disc list-inside text-gray-800 dark:text-gray-200">
                      {aiResponse.sonidos_sugeridos.map((s, idx) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <h2 className="text-xl font-bold text-purple-700 mb-1">📊 Recomendación</h2>
                  <p className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-line">
                    {aiResponse.recomendacion}
                  </p>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                  <Sparkles size={24} className="text-purple-600" />
                  ¿Listo para crear?
                </h2>

                <p className="text-gray-600 dark:text-gray-300 text-base max-w-4xl leading-relaxed mb-10">
                  Describe tu idea de contenido y deja que nuestra IA genere sugerencias optimizadas para tu video de TikTok.
                </p>

                <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
                  <div>
                    <Hash className="mx-auto text-blue-500 mb-2" size={36} />
                    <p className="font-semibold text-gray-800 dark:text-white">Hashtags inteligentes</p>
                    <p className="text-sm text-gray-500 mt-1">Tendencias y etiquetas virales</p>
                  </div>
                  <div>
                    <Music className="mx-auto text-purple-500 mb-2" size={36} />
                    <p className="font-semibold text-gray-800 dark:text-white">Sonidos virales</p>
                    <p className="text-sm text-gray-500 mt-1">Audios recomendados</p>
                  </div>
                  <div>
                    <Target className="mx-auto text-green-500 mb-2" size={36} />
                    <p className="font-semibold text-gray-800 dark:text-white">Tips de alcance</p>
                    <p className="text-sm text-gray-500 mt-1">Estrategias para más vistas</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
