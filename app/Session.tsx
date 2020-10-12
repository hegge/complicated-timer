export interface Session {
  name: string,
  description: string,
  session: Entry[],
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
  skip?: string,
  countdownBell?: boolean,
}