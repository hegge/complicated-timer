export interface Session {
  name: string,
  description: string,
  entries: Entry[],
  id?: string,
}

export type Entry = RepeatEntry | CountdownEntry;

export type RepeatType = 'repeat';
export type CountdownType = 'countdown';

export type CountdownCategory = 'work' | 'pause' | 'prepare' | 'done';

export interface RepeatEntry {
  type: RepeatType,
  repetitions: number,
  group: Entry[],
}

export interface CountdownEntry {
  type: CountdownType,
  category: CountdownCategory,
  duration: number,
  skip?: number[],
  pauseWhenComplete?: boolean,
  countdownBell?: boolean,
}

export const emptySession = (): Session => {
  return (
    {
      name: "",
      description: "",
      entries: []
    }
  );
}