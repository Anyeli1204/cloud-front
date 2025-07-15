import React from 'react';

interface Sound {
  nombre: string;
  url: string;
  imagen: string;
}

interface SoundListProps {
  sonidos: Sound[];
}

export const SoundList: React.FC<SoundListProps> = ({ sonidos }) => {
  return (
    <div className="w-full max-w-lg space-y-4">
      {sonidos.map((sonido, index) => (
        <div key={index} className="p-4 text-sm text-gray-700 text-justify bg-white rounded-lg shadow-sm">
          <span className="font-semibold text-green-700">Sonido {index + 1}:</span> {sonido.nombre}
        </div>
      ))}
    </div>
  );
}; 