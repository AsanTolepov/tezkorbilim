
export type Question = {
  id: string;            // question number as string, e.g. "1"
  number: number;        // numeric order
  prompt: string;        // question text
  options: [string, string, string, string]; // a,b,c,d
  correctIndex?: 0 | 1 | 2 | 3; // optional until answer key is imported
};

export type Progress = {
  attempts: number;
  correctAttempts: number;
  lastResult: "correct" | "wrong" | "none";
  starred: boolean;
  lastSeenAt: number;
};

export type ProgressMap = Record<string, Progress>;

export type PracticeRange = {
  start: number;
  end: number;
  shuffle?: boolean;
  shuffleOptions?: boolean;
  timeLimit?: number; // minutes
};

export enum AppScreen {
  HOME = 'HOME',
  PRACTICE = 'PRACTICE',
  STATS = 'STATS',
  IMPORT_QUESTIONS = 'IMPORT_QUESTIONS',
  IMPORT_ANSWERS = 'IMPORT_ANSWERS',
  RESULTS = 'RESULTS'
}

export enum PracticeMode {
  ALL = 'ALL',
  STARRED = 'STARRED',
  WRONG = 'WRONG',
  SMART = 'SMART',
  RANGE = 'RANGE'
}
