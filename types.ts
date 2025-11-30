export interface BookPageProps {
  pageNumber: number;
  width: number;
  height: number;
}

export interface GestureState {
  isDetected: boolean;
  lastGesture: string | null;
  swipeDirection: 'left' | 'right' | null;
}

export enum AppMode {
  UPLOAD = 'UPLOAD',
  READING = 'READING',
}
