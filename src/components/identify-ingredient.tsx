"use client";
import {useEffect, useRef, useState} from 'react';
import {Button} from "@/components/ui/button";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {Camera, CameraOff} from "lucide-react";

interface IdentifyIngredientProps {
  onIngredientIdentified: (ingredient: string) => void;
}

export const IdentifyIngredient: React.FC<IdentifyIngredientProps> = ({onIngredientIdentified}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean>(false);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(true);

  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({video: true});
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
      }
    };

    if (isCameraActive) {
      getCameraPermission();
    } else {
      // Stop the camera when it's toggled off
      const stream = videoRef.current?.srcObject as MediaStream | null;
      stream?.getTracks().forEach(track => track.stop());
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    }

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
  }, [onIngredientIdentified, isCameraActive]);

  const toggleCamera = () => {
    setIsCameraActive(prev => !prev);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Ingredient Identifier</h2>

      <video ref={videoRef} className="w-full aspect-video rounded-md" autoPlay muted/>

      {!hasCameraPermission && (
        <Alert variant="destructive">
          <AlertTitle>Camera Access Required</AlertTitle>
          <AlertDescription>
            Please allow camera access to use this feature.
          </AlertDescription>
        </Alert>
      )
      }

      <div className="flex justify-center mt-4">
        <Button onClick={toggleCamera} variant="outline">
          {isCameraActive ? (
            <>
              <CameraOff className="mr-2 h-4 w-4"/>
              Turn Camera Off
            </>
          ) : (
            <>
              <Camera className="mr-2 h-4 w-4"/>
              Turn Camera On
            </>
          )}
        </Button>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">Point the camera at an ingredient to identify it.</p>
    </div>
  );
};
