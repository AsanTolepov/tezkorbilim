
import { Question } from './types';

export const parseWordText = (text: string): { questions: Question[], errors: string[] } => {
  const questions: Question[] = [];
  const errors: string[] = [];

  const parts = text.split(/(?:\n|^)\s*(\d+)\.\s+/).filter(Boolean);
  
  for (let i = 0; i < parts.length; i += 2) {
    const qNumStr = parts[i];
    const qBody = parts[i + 1];
    
    if (!qBody) continue;

    const qNum = parseInt(qNumStr);

    const optRegex = /\s*([a-d])\)\s*([\s\S]*?)(?=\s*[a-d]\)|$)/gi;
    const matches = Array.from(qBody.matchAll(optRegex));

    const promptMatch = qBody.split(/\s*[a-d]\)\s*/i)[0];
    const prompt = promptMatch ? promptMatch.trim() : "";

    if (matches.length < 4) {
      errors.push(`Savol ${qNum}: 4 ta variant (a, b, c, d) topilmadi. (Topildi: ${matches.length})`);
      continue;
    }

    const options: string[] = ["", "", "", ""];
    matches.forEach(m => {
      const letter = m[1].toLowerCase();
      const content = m[2].trim();
      const idx = letter.charCodeAt(0) - 97;
      if (idx >= 0 && idx < 4) {
        options[idx] = content;
      }
    });

    if (options.some(o => o === "")) {
      errors.push(`Savol ${qNum}: Ba'zi variantlar matni bo'sh qolgan.`);
      continue;
    }

    questions.push({
      id: qNumStr,
      number: qNum,
      prompt,
      options: options as [string, string, string, string]
    });
  }

  return { questions, errors };
};

export const parseAnswerKey = (text: string): { answers: Record<string, number>, errors: string[] } => {
  const answers: Record<string, number> = {};
  const errors: string[] = [];

  const lines = text.split(/[\n,;]/);
  
  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) return;

    const match = trimmed.match(/^(\d+)\s*[-.\s:]?\s*([a-d])$/i);
    
    if (match) {
      const qNum = match[1];
      const letter = match[2].toLowerCase();
      const idx = letter.charCodeAt(0) - 97;
      answers[qNum] = idx;
    } else {
      errors.push(`Format xatosi: "${trimmed}" (To'g'ri format: 1-a yoki 1 A)`);
    }
  });

  return { answers, errors };
};
