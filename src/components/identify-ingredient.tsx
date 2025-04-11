"use client";
import {useEffect, useRef, useState} from 'react';
import {Button} from "@/components/ui/button";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {Camera, CameraOff} from "lucide-react";
import {identifyIngredient} from '@/ai/flows/identify-ingredient';
import {toast} from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface IdentifyIngredientProps {
  onIngredientIdentified: (ingredient: string) => void;
}

export const IdentifyIngredient: React.FC<IdentifyIngredientProps> = ({onIngredientIdentified}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean>(false);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(true);
  const [identifiedIngredient, setIdentifiedIngredient] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

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
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to use this app.',
        });
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
  }, [isCameraActive]);

  const toggleCamera = () => {
    setIsCameraActive(prev => !prev);
  };

  const captureFrame = () => {
    if (!videoRef.current) return null;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx?.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg');
  };


  useEffect(() => {
    let recognitionInterval: NodeJS.Timeout;

    if (isCameraActive && hasCameraPermission) {
      recognitionInterval = setInterval(async () => {
        const frame = captureFrame();
        if (frame) {
          try {
            const result = await identifyIngredient({photoUrl: frame});
            if (result && result.ingredientName) {
              setIdentifiedIngredient(result.ingredientName);
              setOpen(true); // Open the confirmation dialog
            } else {
              toast({
                title: 'Could not identify ingredient',
                description: 'Please try again.',
              });
            }
          } catch (error) {
            console.error('Error identifying ingredient:', error);
            toast({
              variant: 'destructive',
              title: 'Error Identifying Ingredient',
              description: 'There was an error processing the image. Please try again.',
            });
          }
        }
      }, 3000); // Check every 3 seconds
    }

    return () => clearInterval(recognitionInterval);
  }, [isCameraActive, hasCameraPermission, onIngredientIdentified]);

  const handleConfirmation = (confirm: boolean) => {
    setOpen(false);
    if (confirm && identifiedIngredient) {
      onIngredientIdentified(identifiedIngredient);
      setIdentifiedIngredient(null);
    } else {
      toast({
        title: 'Try again!',
        description: 'Please reposition the ingredient for better identification.',
      });
    }
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

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Ingredient</AlertDialogTitle>
            <AlertDialogDescription>
              Is this ingredient a <span className="font-medium">{identifiedIngredient}</span>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => handleConfirmation(false)}>Try Again</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleConfirmation(true)}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <p className="mt-2 text-sm text-muted-foreground">Point the camera at an ingredient to identify it.</p>
    </div>
  );
};

    