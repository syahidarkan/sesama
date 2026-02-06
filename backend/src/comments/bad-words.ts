// Daftar kata kasar dan SARA dalam Bahasa Indonesia
// Filter ini bersifat case-insensitive

const BAD_WORDS: string[] = [
  // Kata kasar umum
  'anjing', 'anjir', 'anj', 'bangsat', 'brengsek', 'bajingan',
  'keparat', 'kampret', 'kontol', 'memek', 'ngentot', 'entot',
  'jancok', 'jancuk', 'cok', 'asu', 'goblok', 'goblog', 'tolol',
  'idiot', 'bego', 'bodoh', 'dungu', 'pantek', 'pantat',
  'tai', 'taik', 'tahi', 'babi', 'monyet', 'setan', 'iblis',
  'laknat', 'sialan', 'bedebah', 'celaka', 'jahanam',
  'pepek', 'titit', 'pelacur', 'sundal', 'lonte', 'jablay',
  'kimak', 'pukimak', 'cuki', 'cukimai', 'bacot', 'bacod',
  'bangke', 'perek', 'pecun', 'bitch', 'fuck', 'shit', 'ass',
  'damn', 'bastard', 'dick', 'pussy', 'slut', 'whore',

  // SARA - Suku, Agama, Ras, Antargolongan
  'kafir', 'kaf1r', 'k4fir',
  'cina', 'c1na', 'ch1na',  // slur context
  'pribumi',  // slur context
  'yahudi',  // slur context
  'zionis',
  'teroris',
  'radikalis',
  'rasis',
  'komunis',
  'atheis',
];

// Variasi dengan angka pengganti huruf
const LEET_MAP: Record<string, string> = {
  '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's', '7': 't', '@': 'a',
};

function normalizeLeet(text: string): string {
  let normalized = text.toLowerCase();
  for (const [key, value] of Object.entries(LEET_MAP)) {
    normalized = normalized.split(key).join(value);
  }
  // Remove repeated characters (e.g., "anjiiiing" -> "anjing")
  normalized = normalized.replace(/(.)\1{2,}/g, '$1$1');
  return normalized;
}

export function containsBadWords(text: string): { hasBadWords: boolean; matchedWord?: string } {
  const normalized = normalizeLeet(text);
  // Also check without spaces (e.g., "a n j i n g")
  const noSpaces = normalized.replace(/\s+/g, '');

  for (const word of BAD_WORDS) {
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    if (regex.test(normalized) || noSpaces.includes(word)) {
      return { hasBadWords: true, matchedWord: word };
    }
  }

  return { hasBadWords: false };
}
