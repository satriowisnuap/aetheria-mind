'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';

export default function AuthButton() {
  const { user, loading, signIn, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (loading) return null;

  const displayName = user?.displayName ? (user.displayName.length > 12 ? user.displayName.slice(0, 12) + '...' : user.displayName) : '';

  if (!user) {
    return (
      <motion.button
        whileHover={{ scale: 1.02 }}
        onClick={signIn}
        className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 rounded-full font-sans text-[13px] backdrop-blur-md border border-[var(--glass-border)] bg-[var(--glass-white)] text-[var(--text-primary)] hover:border-white/30 transition-colors shadow-lg"
        style={{ fontFamily: 'var(--font-dm-sans, "DM Sans", sans-serif)' }}
      >
        <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Sign in with Google
      </motion.button>
    );
  }

  return (
    <div className="fixed top-6 left-6 z-50">
      <motion.button
        whileHover={{ scale: 1.02 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full font-sans text-[13px] backdrop-blur-md border border-[var(--glass-border)] bg-[var(--glass-white)] text-[var(--text-primary)] hover:border-white/30 transition-colors shadow-lg"
        style={{ fontFamily: 'var(--font-dm-sans, "DM Sans", sans-serif)' }}
      >
        {user.photoURL && (
          <img 
            src={user.photoURL} 
            alt="User avatar" 
            className="w-6 h-6 rounded-full"
            referrerPolicy="no-referrer"
          />
        )}
        <span>{displayName}</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 mt-2 p-3 min-w-[200px] rounded-2xl backdrop-blur-md border border-[var(--glass-border)] bg-[var(--glass-white)] text-[var(--text-primary)] shadow-xl flex flex-col gap-3"
            style={{ fontFamily: 'var(--font-dm-sans, "DM Sans", sans-serif)' }}
          >
            <div className="text-xs opacity-70 px-1 truncate">
              signed in as {user.email}
            </div>
            <button
              onClick={() => {
                signOut();
                setIsOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-2 text-sm rounded-xl hover:bg-white/10 transition-colors text-red-400"
            >
              Sign Out
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
