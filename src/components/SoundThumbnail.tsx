import React, { useState } from 'react';
import { Music, Play } from 'lucide-react';
import { useYouTubeThumbnail } from '../hooks/useYouTubeThumbnail';
import { extractVideoId, isValidYouTubeUrl } from '../utils/youtubeUtils';
import { VideoPlayerModal } from './VideoPlayerModal';

interface SoundThumbnailProps {
  name: string;
  url: string;
  imagen: string;
  onClick?: () => void;
  className?: string;
}

export const SoundThumbnail: React.FC<SoundThumbnailProps> = ({ 
  name, 
  url, 
  imagen, 
  onClick,
  className = "" 
}) => {
  const [showVideoModal, setShowVideoModal] = useState(false);
  const videoId = extractVideoId(url);
  const isYouTubeVideo = isValidYouTubeUrl(url);
  
  const { thumbnailUrl, isLoading, error, videoAvailable } = useYouTubeThumbnail({ 
    videoId, 
    customImage: imagen,
    url
  });

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isYouTubeVideo && videoId) {
      setShowVideoModal(true);
    } else if (onClick) {
      onClick();
    }
  };

  const handleCloseModal = () => {
    setShowVideoModal(false);
  };

  return (
    <>
      <div 
        className={`relative group cursor-pointer rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 ${className}`}
        onClick={onClick}
      >
        {/* Contenido principal */}
        <div className="relative w-full h-32 bg-gradient-to-br from-purple-100 to-pink-100">
          {thumbnailUrl && !error ? (
            // Mostrar miniatura de YouTube o imagen personalizada
            <>
              {isLoading && (
                <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
              <img 
                src={thumbnailUrl} 
                alt={`Portada de ${name}`}
                className={`w-full h-full object-cover ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
              />
            </>
          ) : (
            // Fallback con icono de música
            <div className="w-full h-full flex items-center justify-center">
              <Music className="w-8 h-8 text-purple-400" />
            </div>
          )}
          
          {/* Overlay con botón de reproducción */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button
                onClick={handlePlayClick}
                className="w-12 h-12 bg-white bg-opacity-90 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-colors"
              >
                <Play className="w-6 h-6 text-purple-600 ml-1" />
              </button>
            </div>
          </div>
        </div>

        {/* Información del sonido */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
          <h3 className="text-white text-sm font-semibold truncate">
            {name}
          </h3>
          <p className="text-white/80 text-xs truncate">
            {isYouTubeVideo ? (videoAvailable ? 'YouTube' : 'Video no disponible') : 'Audio'}
          </p>
        </div>

        {/* Indicador de carga */}
        {isLoading && (
          <div className="absolute top-2 right-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {/* Modal de video */}
      <VideoPlayerModal
        isOpen={showVideoModal}
        onClose={handleCloseModal}
        videoUrl={url}
        title={name}
        imagen={imagen}
      />
    </>
  );
}; 