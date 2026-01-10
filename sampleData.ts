
import { Question } from './types';

export const INITIAL_QUESTIONS: Question[] = Array.from({ length: 100 }).map((_, i) => ({
  id: `${i + 1}`,
  number: i + 1,
  prompt: `Namuna savol №${i + 1}: Ushbu ilovaning asosiy vazifasi nima?`,
  options: [
    "Sekin o'qish",
    "Vizual yodlash va tezkor takrorlash",
    "Faqat o'yin",
    "Ijtimoiy tarmoq"
  ],
  correctIndex: 1
}));
