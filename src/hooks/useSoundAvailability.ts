import { useState, useEffect } from 'react';
import { extractVideoId, isValidYouTubeUrl } from '../utils/youtubeUtils';

interface Sound {
  nombre: string;
  url: string;
  imagen: string;
}

interface SoundAvailability {
  workingSounds: Sound[];
  nonWorkingSounds: Sound[];
  isLoading: boolean;
}

export const useSoundAvailability = (sonidos: Sound[]): SoundAvailability => {
  const [workingSounds, setWorkingSounds] = useState<Sound[]>([]);
  const [nonWorkingSounds, setNonWorkingSounds] = useState<Sound[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSoundAvailability = async () => {
      if (!sonidos || sonidos.length === 0) {
        setWorkingSounds([]);
        setNonWorkingSounds([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const working: Sound[] = [];
      const nonWorking: Sound[] = [];

      // Verificar cada sonido de manera síncrona para evitar problemas con hooks
      for (const sound of sonidos) {
        const videoId = extractVideoId(sound.url);
        const isYouTubeVideo = isValidYouTubeUrl(sound.url);

        if (isYouTubeVideo && videoId) {
          try {
            const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
            if (response.ok) {
              working.push(sound);
            } else {
              nonWorking.push(sound);
            }
          } catch {
            nonWorking.push(sound);
          }
        } else {
          nonWorking.push(sound);
        }
      }

      setWorkingSounds(working);
      setNonWorkingSounds(nonWorking);
      setIsLoading(false);
    };

    checkSoundAvailability();
  }, [sonidos]);

  return {
    workingSounds,
    nonWorkingSounds,
    isLoading
  };
}; 