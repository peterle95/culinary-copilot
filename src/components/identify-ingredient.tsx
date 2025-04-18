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
} from "@/components/ui/alert-dialog";
import {Input} from "@/components/ui/input";

interface IdentifyIngredientProps {
  onIngredientIdentified: (ingredient: string) => void;
}

export const IdentifyIngredient: React.FC<IdentifyIngredientProps> = ({onIngredientIdentified}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean>(false);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(true);
  const [identifiedIngredient, setIdentifiedIngredient] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [isIdentifying, setIsIdentifying] = useState(true);
  const [manualIngredient, setManualIngredient] = useState<string>(''); // New state for manual ingredient input
  const [showManualInput, setShowManualInput] = useState<boolean>(false); // New state to control visibility of manual input
  const confidenceThreshold = 0.7; // Adjust this value as needed

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

    if (isCameraActive && hasCameraPermission && isIdentifying) {
      recognitionInterval = setInterval(async () => {
        const frame = captureFrame();
        if (frame) {
          try {
            const result = await identifyIngredient({photoUrl: frame});
            if (result && result.ingredientName && result.confidence >= confidenceThreshold) {
              setIdentifiedIngredient(result.ingredientName);
              setShowManualInput(false);
              setOpen(true); // Open the confirmation dialog
            } else {
              console.log(`Low confidence: ${result?.confidence}.  AI is not confident so not prompting user.`);
              //Only shows if the confidence is low.  Otherwise do nothing.
              setShowManualInput(true); // Show manual input
              setIdentifiedIngredient(null);
            }
          } catch (error) {
            console.error('Error identifying ingredient:', error);
            toast({
              variant: 'destructive',
              title: 'Error Identifying Ingredient',
              description: 'There was an error processing the image. Please try again.',
            });
            setShowManualInput(true); // Show manual input
            setIdentifiedIngredient(null);
          }
        }
      }, 3000); // Check every 3 seconds
    }

    return () => clearInterval(recognitionInterval);
  }, [isCameraActive, hasCameraPermission, onIngredientIdentified, isIdentifying, confidenceThreshold]);

  const handleConfirmation = (confirm: boolean | 'manual') => {
    setOpen(false);

    if (confirm === true) {
      if (identifiedIngredient) {
        onIngredientIdentified(identifiedIngredient);
        setIdentifiedIngredient(null);
        setManualIngredient('');
        setIsIdentifying(true); // Start identifying again
        setShowManualInput(false);
      }
    } else if (confirm === 'manual') {
      setShowManualInput(true);
      setIdentifiedIngredient(null);
      setIsIdentifying(false); //Pause AI scanning until manually entered and confirmed
    } else {
      toast({
        title: 'Try again!',
        description: 'Please reposition the ingredient for better identification or enter the ingredient manually.',
      });
      setIsIdentifying(true);
      setShowManualInput(false);
      setIdentifiedIngredient(null);
    }
  };

  const handleManualInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setManualIngredient(e.target.value);
  };

  const handleManualConfirmation = () => {
    if (manualIngredient.trim() !== '') {
      onIngredientIdentified(manualIngredient);
      setManualIngredient('');
      setShowManualInput(false);
      setIsIdentifying(true); // Resume AI after confirmation
      toast({
        title: 'Ingredient Added',
        description: `${manualIngredient} has been added to the list.`,
      });
    } else {
      toast({
        title: 'Please Enter an Ingredient',
        description: 'The ingredient field cannot be empty.',
        variant: "destructive",
      });
      setIsIdentifying(false);
    }
    setOpen(false);
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

      {showManualInput && (
        <div className="mt-4">
          <Input
            type="text"
            placeholder="Enter ingredient name"
            value={manualIngredient}
            onChange={handleManualInputChange}
            className="w-full"
          />
          <Button onClick={handleManualConfirmation} className="mt-2 w-full">
            Confirm Manually Entered Ingredient
          </Button>
        </div>
      )}

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Ingredient</AlertDialogTitle>
            <AlertDialogDescription>
              Is this ingredient a <span className="font-medium">{identifiedIngredient}</span>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => handleConfirmation(false)}>Try Again</Button>
            <Button
              variant="secondary"
              onClick={() => handleConfirmation('manual')}
            >
              Import Manually
            </Button>
            <Button onClick={() => handleConfirmation(true)}>Confirm</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <p className="mt-2 text-sm text-muted-foreground">Point the camera at an ingredient to identify it.</p>
    </div>
  );
};
