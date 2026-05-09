'use client';

import { useState, useEffect, useRef } from 'react';

export type GestureType = 'point' | 'pinch' | 'palm' | 'none';

export interface HandTrackingState {
  isTracking: boolean;
  isLoading: boolean;
  error: string | null;
  fingerPosition: { x: number; y: number } | null;
  thumbPosition: { x: number; y: number } | null;
  activeGesture: GestureType;
  rawResults: any | null;
}

export function useHandTracking(active: boolean) {
  const [state, setState] = useState<HandTrackingState>({
    isTracking: false,
    isLoading: false,
    error: null,
    fingerPosition: null,
    thumbPosition: null,
    activeGesture: 'none',
    rawResults: null,
  });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const handsRef = useRef<any>(null);
  const requestRef = useRef<number>();

  useEffect(() => {
    if (!active) {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
      if (handsRef.current) {
        handsRef.current.close();
        handsRef.current = null;
      }
      setState(s => ({
        ...s,
        isTracking: false,
        isLoading: false,
        fingerPosition: null,
        thumbPosition: null,
        activeGesture: 'none',
        rawResults: null
      }));
      return;
    }

    let isMounted = true;

    const initializeHands = async () => {
      setState(s => ({ ...s, isLoading: true, error: null }));
      
      try {
        const { Hands } = await import('@mediapipe/hands');
        
        const hands = new Hands({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        });

        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 0,
          minDetectionConfidence: 0.7,
          minTrackingConfidence: 0.5
        });

        hands.onResults((results) => {
          if (!isMounted) return;
          
          if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const landmarks = results.multiHandLandmarks[0];
            const vpWidth = window.innerWidth;
            const vpHeight = window.innerHeight;
            
            const indexTip = landmarks[8];
            const thumbTip = landmarks[4];
            
            // Mirror X because front camera is mirrored
            const fingerPos = { x: (1 - indexTip.x) * vpWidth, y: indexTip.y * vpHeight };
            const thumbPos = { x: (1 - thumbTip.x) * vpWidth, y: thumbTip.y * vpHeight };
            
            const dist2D = Math.sqrt(Math.pow(indexTip.x - thumbTip.x, 2) + Math.pow(indexTip.y - thumbTip.y, 2));
            
            let detectedGesture: GestureType = 'none';
            
            if (dist2D < 0.05) {
              detectedGesture = 'pinch';
            } else {
              const isIndexExtended = landmarks[8].y < landmarks[6].y;
              const isMiddleExtended = landmarks[12].y < landmarks[10].y;
              const isRingExtended = landmarks[16].y < landmarks[14].y;
              const isPinkyExtended = landmarks[20].y < landmarks[18].y;
              
              if (isIndexExtended && isMiddleExtended && isRingExtended && isPinkyExtended) {
                detectedGesture = 'palm';
              } else if (isIndexExtended && !isMiddleExtended) {
                detectedGesture = 'point';
              }
            }
            
            setState(s => ({
              ...s,
              fingerPosition: fingerPos,
              thumbPosition: thumbPos,
              activeGesture: detectedGesture,
              rawResults: results
            }));
          } else {
            setState(s => ({
              ...s,
              fingerPosition: null,
              thumbPosition: null,
              activeGesture: 'none',
              rawResults: null
            }));
          }
        });

        handsRef.current = hands;

        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480, facingMode: 'user' } });
        if (!isMounted) return;

        const video = document.createElement('video');
        video.srcObject = stream;
        video.playsInline = true;
        videoRef.current = video;

        await new Promise<void>((resolve) => {
          video.onloadedmetadata = () => resolve();
        });
        
        video.play();
        setState(s => ({ ...s, isLoading: false, isTracking: true }));

        const detectFrame = async () => {
          if (videoRef.current && handsRef.current && videoRef.current.readyState >= 2) {
            await handsRef.current.send({ image: videoRef.current });
          }
          if (isMounted && active) {
            requestRef.current = requestAnimationFrame(detectFrame);
          }
        };
        detectFrame();

      } catch (err) {
        console.error("Hand tracking initialization error:", err);
        setState(s => ({
          ...s,
          error: "Camera access denied. Enable camera to use hand tracking.",
          isLoading: false
        }));
      }
    };

    initializeHands();

    return () => {
      isMounted = false;
    };
  }, [active]);

  return state;
}
