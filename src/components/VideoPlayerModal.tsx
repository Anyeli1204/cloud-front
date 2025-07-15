import React, { useState, useEffect } from 'react';
import { X, Play, Image as ImageIcon } from 'lucide-react';
import { extractVideoId, isValidYouTubeUrl } from '../utils/youtubeUtils';

interface VideoPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string;
  title: string;
  imagen?: string;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  isOpen,
  onClose,
  videoUrl,
  title,
  imagen
}) => {
  const [videoError, setVideoError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const videoId = extractVideoId(videoUrl);
  const isYouTubeVideo = isValidYouTubeUrl(videoUrl);

  useEffect(() => {
    if (isOpen) {
      setVideoError(false);
      setIsLoading(true);
    }
  }, [isOpen]);

  const handleVideoError = () => {
    setVideoError(true);
    setIsLoading(false);
  };

  const handleVideoLoad = () => {
    setIsLoading(false);
  };

  const handleShowImage = () => {
    setVideoError(true);
    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="relative w-full max-w-4xl mx-4 bg-white rounded-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-gray-50 border-b">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Area */}
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
          {videoError && imagen ? (
            // Mostrar imagen de la IA cuando hay error en el video
            <div className="absolute top-0 left-0 w-full h-full bg-gray-900 flex items-center justify-center">
              <div className="text-center">
                <img 
                  src={imagen} 
                  alt={title}
                  className="max-w-full max-h-full object-contain rounded-lg"
                  onError={() => {
                    // Si la imagen también falla, mostrar mensaje de error
                    setVideoError(true);
                  }}
                />
                <p className="text-white mt-4 text-sm">
                  Imagen de portada - Video no disponible
                </p>
              </div>
            </div>
          ) : videoError ? (
            // Error sin imagen disponible
            <div className="absolute top-0 left-0 w-full h-full bg-gray-900 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ImageIcon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Video no disponible</h3>
                <p className="text-gray-300">Este video no está disponible.</p>
                {imagen && (
                  <button
                    onClick={handleShowImage}
                    className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Ver imagen de portada
                  </button>
                )}
              </div>
            </div>
          ) : isYouTubeVideo && videoId ? (
            // Reproductor de YouTube
            <>
              {isLoading && (
                <div className="absolute inset-0 bg-gray-900 flex items-center justify-center z-10">
                  <div className="text-white text-center">
                    <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p>Cargando video...</p>
                  </div>
                </div>
              )}
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
                title={title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute top-0 left-0 w-full h-full"
                onError={handleVideoError}
                onLoad={handleVideoLoad}
              />
            </>
          ) : (
            // No es un video de YouTube válido
            <div className="absolute top-0 left-0 w-full h-full bg-gray-900 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Play className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold mb-2">URL no válida</h3>
                <p className="text-gray-300">La URL proporcionada no es un video de YouTube válido.</p>
                {imagen && (
                  <button
                    onClick={handleShowImage}
                    className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Ver imagen de portada
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t">
          <p className="text-sm text-gray-600">
            {videoError ? 'Mostrando imagen de portada' : 'Reproduciendo desde YouTube'}
          </p>
        </div>
      </div>
    </div>
  );
}; 