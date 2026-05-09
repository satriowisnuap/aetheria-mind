'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { collection, doc, onSnapshot, setDoc, deleteDoc, updateDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { analyzeEmotion, type OrbConfig } from '@/lib/emotionAnalyzer';
import { generateId } from '@/lib/orbUtils';

const LOCAL_STORAGE_KEY = 'aetheria-orbs-local';

export interface OrbData {
  id: string;
  text: string;
  config: OrbConfig;
  posX: number;
  posY: number;
  createdAt: any;
  merged: boolean;
}

export function useOrbs() {
  const [orbs, setOrbs] = useState<OrbData[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncError, setSyncError] = useState<string | null>(null);
  const { user, loading: authLoading } = useAuth();
  const updateTimeouts = useRef<Record<string, NodeJS.Timeout>>({});

  useEffect(() => {
    if (syncError) {
      const timer = setTimeout(() => setSyncError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [syncError]);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      // User not signed in -> load from localStorage
      const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (localData) {
        try {
          setOrbs(JSON.parse(localData));
        } catch (e) {
          console.error("Failed to parse local orbs", e);
          setOrbs([]);
        }
      } else {
        setOrbs([]);
      }
      setLoading(false);
    } else {
      // User signed in -> use Firestore onSnapshot
      setLoading(true);
      const orbsRef = collection(db, 'users', user.uid, 'orbs');
      const unsubscribe = onSnapshot(orbsRef, (snapshot) => {
        const fetchedOrbs: OrbData[] = [];
        snapshot.forEach((docSnap) => {
          fetchedOrbs.push(docSnap.data() as OrbData);
        });
        setOrbs(fetchedOrbs);
        setLoading(false);
      }, (error) => {
        console.error("Error fetching orbs:", error);
        setSyncError("sync lost — your thoughts are safe locally");
        setLoading(false);
      });

      return () => unsubscribe();
    }
  }, [user, authLoading]);

  const addOrb = useCallback(async (text: string) => {
    const config = analyzeEmotion(text);
    const id = generateId();
    const posX = Math.random() * 70 + 10;
    const posY = Math.random() * 50 + 20;

    const newOrb: OrbData = {
      id,
      text,
      config,
      posX,
      posY,
      createdAt: user ? serverTimestamp() : Date.now(),
      merged: false
    };

    if (user) {
      const orbRef = doc(db, 'users', user.uid, 'orbs', id);
      await setDoc(orbRef, newOrb);
    } else {
      setOrbs(prev => {
        const updated = [...prev, newOrb];
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    }
  }, [user]);

  const updateOrbPosition = useCallback((id: string, x: number, y: number) => {
    if (updateTimeouts.current[id]) {
      clearTimeout(updateTimeouts.current[id]);
    }

    setOrbs((prev) => {
      const updated = prev.map((orb) => 
        orb.id === id ? { ...orb, posX: x, posY: y } : orb
      );
      if (!user) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      }
      return updated;
    });

    if (user) {
      updateTimeouts.current[id] = setTimeout(async () => {
        try {
          const orbRef = doc(db, 'users', user.uid, 'orbs', id);
          await updateDoc(orbRef, { posX: x, posY: y });
        } catch (error) {
          console.error("Error updating orb position:", error);
          setSyncError("sync lost — your thoughts are safe locally");
        }
      }, 400);
    }
  }, [user]);

  const burnOrb = useCallback(async (id: string) => {
    if (user) {
      try {
        const orbRef = doc(db, 'users', user.uid, 'orbs', id);
        await deleteDoc(orbRef);
      } catch (error) {
        console.error("Error burning orb:", error);
      }
    } else {
      setOrbs(prev => {
        const updated = prev.filter(orb => orb.id !== id);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    }
  }, [user]);

  const mergeOrbs = useCallback(async (id1: string, id2: string) => {
    const orb1 = orbs.find(o => o.id === id1);
    const orb2 = orbs.find(o => o.id === id2);
    if (!orb1 || !orb2) return;

    const newText = `${orb1.text} · ${orb2.text}`;
    const weightVal = (w: string) => w === 'heavy' ? 3 : w === 'medium' ? 2 : 1;
    const w1 = weightVal(orb1.config.weight);
    const w2 = weightVal(orb2.config.weight);
    const heavierConfig = w1 >= w2 ? orb1.config : orb2.config;

    const posX = (orb1.posX + orb2.posX) / 2;
    const posY = (orb1.posY + orb2.posY) / 2;
    const newId = generateId();

    const mergedOrb: OrbData = {
      id: newId,
      text: newText,
      config: heavierConfig,
      posX,
      posY,
      createdAt: user ? serverTimestamp() : Date.now(),
      merged: true
    };

    if (user) {
      try {
        const batch = writeBatch(db);
        batch.delete(doc(db, 'users', user.uid, 'orbs', id1));
        batch.delete(doc(db, 'users', user.uid, 'orbs', id2));
        batch.set(doc(db, 'users', user.uid, 'orbs', newId), mergedOrb);
        await batch.commit();
      } catch (error) {
        console.error("Error merging orbs:", error);
        setSyncError("sync lost — your thoughts are safe locally");
      }
    } else {
      setOrbs(prev => {
        const updated = prev.filter(o => o.id !== id1 && o.id !== id2);
        updated.push(mergedOrb);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    }
  }, [user, orbs]);

  return { orbs, addOrb, updateOrbPosition, burnOrb, mergeOrbs, loading, syncError };
}
