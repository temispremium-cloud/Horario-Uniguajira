/**
 * Utility functions for clean human typography and text formatting
 */

/**
 * Converts ALL-CAPS strings into clean Title Case with proper capitalization for Spanish.
 * e.g. "APRENDIZAJE Y MODELOS PEDAGOGICOS" -> "Aprendizaje y Modelos Pedagógicos"
 * e.g. "YOHANA ARIAS RODRIGUEZ" -> "Yohana Arias Rodriguez"
 */
const LOWERCASE_WORDS = new Set([
  'y', 'e', 'o', 'u', 'de', 'del', 'a', 'en', 'la', 'las', 'el', 'los', 'con', 'para', 'por', 'ii', 'iii', 'iv'
]);

const ROMAN_NUMERALS: Record<string, string> = {
  'ii': 'II',
  'iii': 'III',
  'iv': 'IV',
  'i': 'I'
};

export function toHumanTitleCase(text: string): string {
  if (!text) return '';
  // If it's already mixed case (not all uppercase), return as is unless it looks strictly uppercase
  const isAllUpper = text === text.toUpperCase() && /[A-Z]/.test(text);
  if (!isAllUpper) return text;

  const words = text.toLowerCase().split(/\s+/);
  return words
    .map((word, index) => {
      // Check Roman numerals
      if (ROMAN_NUMERALS[word]) {
        return ROMAN_NUMERALS[word];
      }
      // Lowercase connectives (unless first word)
      if (index > 0 && LOWERCASE_WORDS.has(word)) {
        return word;
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

/**
 * Normalizes time ranges for human scanning
 * e.g. "2:45 PM A 5:00 PM" -> "2:45 PM – 5:00 PM"
 */
export function formatCleanTimeRange(timeRange: string): string {
  if (!timeRange) return '';
  return timeRange
    .replace(/\s+A\s+/i, ' – ')
    .replace(/\s+a\s+/i, ' – ')
    .trim();
}
