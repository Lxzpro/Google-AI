import { FilesetResolver, GestureRecognizer, GestureRecognizerResult } from "@mediapipe/tasks-vision";

let gestureRecognizer: GestureRecognizer | null = null;
let runningMode: "IMAGE" | "VIDEO" = "VIDEO";

export const initializeGestureRecognizer = async (): Promise<boolean> => {
  try {
    // Explicitly use version 0.10.14 to match the package in importmap
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
    );
    
    gestureRecognizer = await GestureRecognizer.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
        // Removing explicit delegate: 'GPU' allows it to fallback to CPU (XNNPACK) 
        // without throwing errors if WebGL is finicky, or use GPU if available.
        // The "INFO: Created TensorFlow Lite XNNPACK delegate for CPU" is normal if it chooses CPU.
        delegate: "GPU" 
      },
      runningMode: runningMode,
      numHands: 1
    });
    console.log("Gesture Recognizer initialized successfully");
    return true;
  } catch (error) {
    console.error("Failed to initialize gesture recognizer:", error);
    return false;
  }
};

export const detectGesture = (video: HTMLVideoElement): { x: number; gesture: string } | null => {
  if (!gestureRecognizer) return null;

  try {
    const results: GestureRecognizerResult = gestureRecognizer.recognizeForVideo(video, Date.now());
    
    if (results.landmarks && results.landmarks.length > 0) {
      // Get the first hand
      const landmarks = results.landmarks[0];
      // Index finger tip is index 8
      const indexTip = landmarks[8];
      
      // Determine gesture category (e.g. "Open_Palm", "Closed_Fist")
      const gesture = results.gestures.length > 0 ? results.gestures[0][0].categoryName : "Unknown";

      return {
        x: indexTip.x, // Normalized 0-1
        gesture: gesture
      };
    }
  } catch (e) {
    // Ignore frame errors which can happen during rapid updates
  }
  return null;
};