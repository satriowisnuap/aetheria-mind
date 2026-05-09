export type OrbConfig = {
  weight: 'heavy' | 'medium' | 'light';
  color: string;
  glowColor: string;
  borderColor: string;
  size: number;
};

const HEAVY_WORDS = [
  'kerja', 'laporan', 'tagihan', 'deadline', 'meeting', 'hutang', 'tugas',
  'ujian', 'pajak', 'stress', 'masalah', 'krisis', 'penting', 'urgent', 'due',
  'report', 'bill', 'debt', 'exam', 'work', 'task', 'problem', 'busy', 'overdue',
  'pressure', 'anxiety', 'overwhelmed', 'struggling', 'difficult', 'hard',
];

const LIGHT_WORDS = [
  'main', 'tidur', 'hobi', 'santai', 'liburan', 'musik', 'kopi', 'jalan',
  'teman', 'makan', 'nonton', 'game', 'chill', 'sleep', 'hobby', 'vacation',
  'coffee', 'movie', 'fun', 'relax', 'dream', 'sunset', 'smile', 'laugh', 'peace',
  'joy', 'happy', 'love', 'grateful', 'bliss', 'calm', 'serene', 'play',
];

export function analyzeEmotion(text: string): OrbConfig {
  const lower = text.toLowerCase();
  const words = lower.split(/\s+/);

  let heavyScore = 0;
  let lightScore = 0;

  for (const word of words) {
    if (HEAVY_WORDS.some((hw) => word.includes(hw) || hw.includes(word))) {
      heavyScore++;
    }
    if (LIGHT_WORDS.some((lw) => word.includes(lw) || lw.includes(word))) {
      lightScore++;
    }
  }

  if (heavyScore > lightScore) {
    return {
      weight: 'heavy',
      color: '#2D0A4E',
      glowColor: '#A855F7',
      borderColor: '#7C3AED',
      size: 80,
    };
  }

  if (lightScore > heavyScore) {
    return {
      weight: 'light',
      color: '#2D2000',
      glowColor: '#FDE047',
      borderColor: '#CA8A04',
      size: 56,
    };
  }

  return {
    weight: 'medium',
    color: '#002D33',
    glowColor: '#22D3EE',
    borderColor: '#0E7490',
    size: 66,
  };
}
