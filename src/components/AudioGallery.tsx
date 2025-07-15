import React from "react";
import { YouTubeAudioCard } from "./YouTubeAudioCard";
import { SoundThumbnail } from "./SoundThumbnail";
import { SoundList } from "./SoundList";
import { useSoundAvailability } from "../hooks/useSoundAvailability";
import { Loader2 } from "lucide-react";

interface Sound {
  nombre: string;
  url: string;
  imagen: string;
}

interface AudioGalleryProps {
  sonidos: Sound[];
  variant?: 'default' | 'thumbnail';
  onSoundClick?: (sound: Sound) => void;
}

export const AudioGallery: React.FC<AudioGalleryProps> = ({ 
  sonidos, 
  variant = 'default',
  onSoundClick 
}) => {
  const { workingSounds, nonWorkingSounds, isLoading } = useSoundAvailability(sonidos);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center gap-2 text-gray-600">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      </div>
    );
  }

  // Si no hay sonidos que funcionen, mostrar todos en lista
  if (workingSounds.length === 0 && nonWorkingSounds.length > 0) {
    return <SoundList sonidos={sonidos} />;
  }

  // Si hay sonidos que funcionan, mostrar galería + lista
  return (
    <div className="space-y-6">
      {/* Galería de sonidos que funcionan */}
      {workingSounds.length > 0 && (
        <div>
          <h3 className="text-base font-bold mb-4 text-gray-800">Sonidos disponibles en YouTube</h3>
          {variant === 'thumbnail' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {workingSounds.map((s, idx) => (
                <SoundThumbnail
                  key={idx}
                  name={s.nombre}
                  url={s.url}
                  imagen={s.imagen}
                  onClick={() => onSoundClick?.(s)}
                  className="w-full"
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-6 justify-center">
              {workingSounds.map((s, idx) => (
                <YouTubeAudioCard key={idx} name={s.nombre} url={s.url} imagen={s.imagen} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Lista de sonidos que no funcionan */}
      {nonWorkingSounds.length > 0 && (
        <div>
          <h3 className="text-base font-bold mb-4 text-gray-800">Otros sonidos sugeridos</h3>
          <SoundList sonidos={nonWorkingSounds} />
        </div>
      )}
    </div>
  );
}; 