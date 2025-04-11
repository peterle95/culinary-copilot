"use client";
import { useEffect, useRef } from 'react';

interface IdentifyIngredientProps {
  onIngredientIdentified: (ingredient: string) => void;
}

export const IdentifyIngredient: React.FC<IdentifyIngredientProps> = ({ onIngredientIdentified }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
      }
    };

    startCamera();

    // TODO: Implement real-time ingredient recognition logic here
    // This is a placeholder that simulates ingredient identification
    const recognitionTimeout = setTimeout(() => {
      const ingredients = ['Tomato', 'Basil', 'Mozzarella'];
      const randomIndex = Math.floor(Math.random() * ingredients.length);
      onIngredientIdentified(ingredients[randomIndex]);
    }, 5000);

    return () => {
      clearTimeout(recognitionTimeout);
      // Stop the camera when the component unmounts
      const stream = videoRef.current?.srcObject as MediaStream | null;
      stream?.getTracks().forEach(track => track.stop());
    };
  }, [onIngredientIdentified]);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Ingredient Identifier</h2>
      <video ref={videoRef} autoPlay className="w-full h-48 bg-gray-100 rounded-md"></video>
      <p className="mt-2 text-sm text-muted-foreground">Point the camera at an ingredient to identify it.</p>
    </div>
  );
};
