import { useState, useEffect } from 'react';
import { getBestThumbnail, checkImageExists, isValidYouTubeUrl } from '../utils/youtubeUtils';

interface UseYouTubeThumbnailProps {
  videoId: string;
  customImage?: string;
  url: string;
}

export const useYouTubeThumbnail = ({ videoId, customImage, url }: UseYouTubeThumbnailProps) => {
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoAvailable, setVideoAvailable] = useState(true);

  const isYouTubeVideo = isValidYouTubeUrl(url);

  // Verificar si el video está disponible
  useEffect(() => {
    const checkVideoAvailability = async () => {
      if (!isYouTubeVideo || !videoId) {
        setVideoAvailable(false);
        return;
      }

      try {
        const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
        if (!response.ok) {
          setVideoAvailable(false);
        } else {
          setVideoAvailable(true);
        }
      } catch {
        setVideoAvailable(false);
      }
    };

    checkVideoAvailability();
  }, [videoId, isYouTubeVideo]);

  useEffect(() => {
    const loadThumbnail = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Si es un video de YouTube válido y está disponible, usar la miniatura de YouTube
        if (isYouTubeVideo && videoId && videoAvailable) {
          const bestThumbnail = await getBestThumbnail(videoId);
          setThumbnailUrl(bestThumbnail);
          setIsLoading(false);
          return;
        }

        // Si no es un video de YouTube válido o no está disponible, usar imagen personalizada
        if (customImage) {
          const customImageExists = await checkImageExists(customImage);
          if (customImageExists) {
            setThumbnailUrl(customImage);
            setIsLoading(false);
            return;
          }
        }

        // Si no hay imagen personalizada o no existe, usar YouTube como fallback
        if (videoId) {
          const bestThumbnail = await getBestThumbnail(videoId);
          setThumbnailUrl(bestThumbnail);
        }
      } catch (err) {
        setError('Error al cargar la imagen');
        console.error('Error loading thumbnail:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadThumbnail();
  }, [videoId, customImage, isYouTubeVideo, videoAvailable]);

  return {
    thumbnailUrl,
    isLoading,
    error,
    videoAvailable
  };
}; 