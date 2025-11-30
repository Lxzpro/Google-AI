import React, { useEffect, useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { initializeGestureRecognizer, detectGesture } from '../services/gestureService';
import { Camera, CameraOff, Hand, Activity } from 'lucide-react';

interface GestureControllerProps {
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  isEnabled: boolean;
  toggleEnabled: () => void;
}

const GestureController: React.FC<GestureControllerProps> = ({ onSwipeLeft, onSwipeRight, isEnabled, toggleEnabled }) => {
  const webcamRef = useRef<Webcam>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [handDetected, setHandDetected] = useState(false);
  const [lastX, setLastX] = useState<number | null>(null);
  const [cooldown, setCooldown] = useState(false);
  
  // Initialize MediaPipe
  useEffect(() => {
    initializeGestureRecognizer().then((success) => {
      setIsLoaded(success);
    });
  }, []);

  const processFrame = useCallback(() => {
    if (!isEnabled || !isLoaded || !webcamRef.current || !webcamRef.current.video || cooldown) return;

    const video = webcamRef.current.video;
    if (video.readyState !== 4) return;

    const result = detectGesture(video);

    if (result) {
      setHandDetected(true);
      const currentX = result.x;

      if (lastX !== null) {
        // Calculate delta. Note: Webcam is mirrored by default usually.
        // Moving hand RIGHT (in world) -> moves LEFT in mirrored video (x decreases)
        // Moving hand LEFT (in world) -> moves RIGHT in mirrored video (x increases)
        // Let's assume non-mirrored logic for calculations or adjust based on UX preference.
        // Standard "Swipe Left" gesture usually means moving hand Right-to-Left.
        
        const delta = currentX - lastX;
        const threshold = 0.15; // Sensitivity

        // If delta is positive significantly -> Moved Right
        if (delta > threshold) {
           // User swiped RIGHT (Hand moved Left->Right on screen) -> Prev Page
           onSwipeRight();
           triggerCooldown();
        } else if (delta < -threshold) {
           // User swiped LEFT (Hand moved Right->Left on screen) -> Next Page
           onSwipeLeft();
           triggerCooldown();
        }
      }
      setLastX(currentX);
    } else {
      setHandDetected(false);
      setLastX(null);
    }
  }, [isEnabled, isLoaded, lastX, cooldown, onSwipeLeft, onSwipeRight]);

  const triggerCooldown = () => {
    setCooldown(true);
    setLastX(null);
    setTimeout(() => setCooldown(false), 1200); // 1.2s debounce to prevent double flips
  };

  useEffect(() => {
    const interval = setInterval(processFrame, 100); // 10FPS check is enough for gestures
    return () => clearInterval(interval);
  }, [processFrame]);

  if (!isLoaded) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {isEnabled && (
        <div className="relative overflow-hidden rounded-xl border border-cyan-500/30 bg-black/80 shadow-[0_0_20px_rgba(6,182,212,0.2)] transition-all duration-300 w-48 aspect-video">
             <Webcam
                ref={webcamRef}
                audio={false}
                mirrored={true}
                className="w-full h-full object-cover opacity-60"
             />
             
             {/* HUD Overlay */}
             <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                {handDetected ? (
                    <div className="absolute inset-0 border-2 border-cyan-400 animate-pulse rounded-xl opacity-50" />
                ) : (
                    <div className="text-cyan-500/50 text-xs font-mono">SCANNING...</div>
                )}
                
                {cooldown && (
                    <div className="absolute inset-0 bg-cyan-500/20 flex items-center justify-center">
                        <Activity className="w-8 h-8 text-cyan-400 animate-spin" />
                    </div>
                )}
             </div>

             <div className="absolute top-2 left-2 flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${handDetected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-[10px] text-white/80 font-mono">
                    {handDetected ? 'TGT_LOCKED' : 'NO_TARGET'}
                </span>
             </div>
        </div>
      )}

      <button
        onClick={toggleEnabled}
        className={`flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md border transition-all duration-300 ${
          isEnabled 
            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-100 hover:bg-cyan-500/30' 
            : 'bg-slate-800/80 border-slate-600 text-slate-400 hover:bg-slate-700/80'
        }`}
      >
        {isEnabled ? <Camera className="w-4 h-4" /> : <CameraOff className="w-4 h-4" />}
        <span className="text-xs font-bold tracking-wider">
            {isEnabled ? 'GESTURE ACTIVE' : 'GESTURE OFF'}
        </span>
      </button>
      
      {isEnabled && (
          <div className="bg-black/60 backdrop-blur text-[10px] text-slate-400 p-2 rounded border border-white/10 max-w-[200px] text-right">
             <div className="flex items-center justify-end gap-1 mb-1">
                 <Hand className="w-3 h-3" />
                 <span>CONTROLS</span>
             </div>
             Swipe <span className="text-cyan-400 font-bold">LEFT</span> to Next Page<br/>
             Swipe <span className="text-cyan-400 font-bold">RIGHT</span> to Prev Page
          </div>
      )}
    </div>
  );
};

export default GestureController;
