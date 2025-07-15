/**
 * Utilidades para manejar URLs de YouTube
 */

export interface YouTubeInfo {
  videoId: string;
  isValid: boolean;
  thumbnailUrl: string;
}

/**
 * Extrae el ID del video de una URL de YouTube
 */
export const extractVideoId = (youtubeUrl: string): string => {
  if (!youtubeUrl) return '';
  
  // Patrones comunes de URLs de YouTube
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
    /youtu\.be\/([^&\n?#]+)/
  ];

  for (const pattern of patterns) {
    const match = youtubeUrl.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return '';
};

/**
 * Genera la URL de la miniatura de YouTube
 */
export const getYouTubeThumbnail = (
  videoId: string, 
  quality: 'default' | 'sd' | 'hq' | 'maxres' = 'sd'
): string => {
  if (!videoId) return '';
  
  const qualities = {
    default: 'default.jpg',
    sd: 'sddefault.jpg',
    hq: 'hqdefault.jpg',
    maxres: 'maxresdefault.jpg'
  };
  
  return `https://i.ytimg.com/vi/${videoId}/${qualities[quality]}`;
};

/**
 * Verifica si una URL de YouTube es válida
 */
export const isValidYouTubeUrl = (url: string): boolean => {
  const videoId = extractVideoId(url);
  return videoId.length === 11; // Los IDs de YouTube tienen 11 caracteres
};

/**
 * Obtiene información completa de una URL de YouTube
 */
export const getYouTubeInfo = (url: string): YouTubeInfo => {
  const videoId = extractVideoId(url);
  const isValid = videoId.length === 11;
  
  return {
    videoId,
    isValid,
    thumbnailUrl: isValid ? getYouTubeThumbnail(videoId) : ''
  };
};

/**
 * Verifica si una imagen existe
 */
export const checkImageExists = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
};

/**
 * Obtiene la mejor miniatura disponible para un video de YouTube
 */
export const getBestThumbnail = async (videoId: string): Promise<string> => {
  const qualities: Array<'maxres' | 'hq' | 'sd' | 'default'> = ['maxres', 'hq', 'sd', 'default'];
  
  for (const quality of qualities) {
    const thumbnailUrl = getYouTubeThumbnail(videoId, quality);
    const exists = await checkImageExists(thumbnailUrl);
    
    if (exists) {
      return thumbnailUrl;
    }
  }
  
  // Si ninguna funciona, devolver la SD por defecto
  return getYouTubeThumbnail(videoId, 'sd');
}; 