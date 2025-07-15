import React from "react";
import { YouTubeAudioCard } from "./YouTubeAudioCard";

interface Sound {
  nombre: string;
  url: string;
}

interface AudioGalleryProps {
  sonidos: Sound[];
}

export const AudioGallery: React.FC<AudioGalleryProps> = ({ sonidos }) => {
  return (
    <div className="flex flex-wrap gap-6 justify-center">
      {sonidos.map((s, idx) => (
        <YouTubeAudioCard key={idx} name={s.nombre} url={s.url} />
      ))}
    </div>
  );
}; 