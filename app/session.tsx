export interface Session {
  name: string,
  description: string,
  entries: Entry[],
  id?: string,
}

export type Entry = RepeatEntry | CountdownEntry;

export interface RepeatEntry {
  type: string,
  repetitions: number,
  group: Entry[],
}

export interface CountdownEntry {
  type: string,
  category: string,
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