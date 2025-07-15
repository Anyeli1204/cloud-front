import React, { useState } from "react";
import { useYouTubeThumbnail } from "../hooks/useYouTubeThumbnail";
import { extractVideoId, isValidYouTubeUrl } from "../utils/youtubeUtils";
import { VideoPlayerModal } from "./VideoPlayerModal";

interface YouTubeAudioCardProps {
  name: string;
  url: string;
  imagen: string;
}

export const YouTubeAudioCard: React.FC<YouTubeAudioCardProps> = ({ name, url, imagen }) => {
  const [showVideoModal, setShowVideoModal] = useState(false);
  const videoId = extractVideoId(url);
  const isYouTubeVideo = isValidYouTubeUrl(url);
  
  const { thumbnailUrl, isLoading, error, videoAvailable } = useYouTubeThumbnail({ 
    videoId, 
    customImage: imagen,
    url
  });

  // Mostrar imagen si no es un video de YouTube válido o si el video no está disponible
  const shouldShowImage = !isYouTubeVideo || !videoAvailable;

  const handleCloseModal = () => {
    setShowVideoModal(false);
  };

  // SafeYouTubePlayer inline implementation
  const SafeYouTubePlayer = ({ videoId }: { videoId: string }) => {
    const [isValid, setIsValid] = useState(true);

    React.useEffect(() => {
      const testVideo = async () => {
        try {
          const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
          if (!response.ok) throw new Error("Invalid video");
          await response.json();
          setIsValid(true);
        } catch {
          setIsValid(false);
        }
      };
      if (videoId) testVideo();
    }, [videoId]);

    if (!isValid) return <p className="text-gray-600 text-sm mt-2">{name}</p>;

    return (
      <div className="aspect-video w-full rounded-xl overflow-hidden">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title="YouTube video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      </div>
    );
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm p-2 w-full max-w-xs">
        <h3 className="text-xs font-semibold mb-1">{name}</h3>
        
        {/* Contenido principal */}
        {shouldShowImage && thumbnailUrl && !error ? (
          // Mostrar imagen de portada
          <div className="mb-2 relative">
            {isLoading && (
              <div className="absolute inset-0 bg-gray-200 rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            <img 
              src={thumbnailUrl} 
              alt={`Portada de ${name}`}
              className={`w-full h-24 object-cover rounded-lg ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
            />
          </div>
        ) : null}
        
        {/* Reproductor tradicional */}
        <SafeYouTubePlayer videoId={videoId} />
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
