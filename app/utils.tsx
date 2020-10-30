import {
  Session,
  Entry,
  RepeatEntry,
  CountdownEntry,
} from './session'

import SharedStyles from './sharedStyles'

export const capitalize = (str: string) => (
  str.charAt(0).toUpperCase() + str.slice(1)
)

export const formatDuration = (duration: number, compact = false, precise = false) => {
  if (isNaN(duration)) {
    return "";
  }
  if (duration < 60 && compact) {
    if (precise) {
      return new Date(duration * 1000).toISOString().substr(17, 4);
    } else {
      return new Date(duration * 1000).toISOString().substr(17, 2);
    }
  } else if (duration < 3600) {
    return new Date(duration * 1000).toISOString().substr(14, 5);
  } else {
    return new Date(duration * 1000).toISOString().substr(11, 8);
  }
}

export const itemStyle = (category: string) => {
  switch (category) {
    case "work":
      return SharedStyles.work;
    case "pause":
    case "done":
      return SharedStyles.pause;
    case "prepare":
      return SharedStyles.prepare;
  }
}

export const getSessionDuration = (session: Entry[]) => {
  var totalDuration = 0;
  var totalWorkDuration = 0;
  traverseSession(session, (entry, count, progress) => {
    totalDuration += entry.duration;
    if (entry.category === "work") {
      totalWorkDuration += entry.duration;
    }
    return false;
  });
  return { totalDuration, totalWorkDuration };
}

export const doneSessionEntry: CountdownEntry = {
  type: "countdown",
  category: "done",
  duration: 0,
}

export const getSessionProgress = (session: Entry[], index: number): ProgressEntry[] => {
  let sessionProgress = [] as ProgressEntry[];
  traverseSession(session, (entry, count, progress) => {
    if (index === count) {
      sessionProgress = progress;
      return true;
    } else {
      return false;
    }
  });
  return sessionProgress;
}

export const formatProgress = (sessionProgress: ProgressEntry[]): string[] => {
  let progress = [] as string[];
  for (let i = 0; i < sessionProgress.length; i++) {
    let progressEntry = sessionProgress[i];
    progress = [...progress, (progressEntry.current + 1) + "/" + progressEntry.total];
  }
  return progress
}

interface ProgressEntry {
  current: number,
  total: number,
  name?: string,
}

type EntryCallback = (entry: CountdownEntry, count: number, sessionProgress: ProgressEntry[]) => boolean

export const getSessionEntry = (session: Entry[], index: number): CountdownEntry | null => {
  var entryAtIndex = null;
  traverseSession(session, (entry, count, progress) => {
    if (index === count) {
      entryAtIndex = entry;
      return true;
    } else {
      return false;
    }
  });
  return entryAtIndex;
}

export const getSessionEntryCount = (session: Entry[]) => {
  var entryCount = 0;
  traverseSession(session, (entry, count, progress) => {
    if (entry.category === "done") {
      return true;
    } else {
      entryCount++;
      return false;
    }
  });
  return entryCount;
}

const isSkipped = (entry: CountdownEntry, parentEntry: RepeatEntry, repNumber: number) => {
  if (entry.skip === undefined) {
    return false;
  }
  return entry.skip.includes(repNumber + 1) ||
    (entry.skip.includes(-1) && repNumber === (parentEntry.repetitions - 1));
}

export const traverseSession = (session: Entry[], callback: EntryCallback) => {
  const count = {
    count: 0
  }

  for (let entry of session) {
    if (entry.type !== "repeat") {
      if (callback(entry, count.count++, [])) {
        return;
      }
    } else {
      for (let repeat = 0; repeat < entry.repetitions; repeat++) {
        if (traverseGroup(entry.group, entry, count, repeat, [{ current: repeat, total: entry.repetitions }], callback)) {
          return;
        }
      }
    }
  }
  callback(doneSessionEntry, count.count++, []);
}

const traverseGroup = (group: Entry[], parent: RepeatEntry, count: {count: number}, repeat: number, progress: ProgressEntry[], callback: EntryCallback) => {
  for (let entry of group) {
    if (entry.type !== "repeat") {
      if (!isSkipped(entry, parent, repeat) && callback(entry, count.count++, progress)) {
        return true;
      }
    } else {
      for (let repeat = 0; repeat < entry.repetitions; repeat++) {
        if (traverseGroup(entry.group, entry, count, repeat, [...progress, { current: repeat, total: entry.repetitions }], callback)) {
          return true;
        }
      }
    }
  }
  return false;
}

function extend(target: any, source: any): any {
  for (var key in source) {
    target[key] = source[key];
  }
  return target;
}

export interface NestedEntry {
  nested: number,
}

export const flattenSession = (session: Entry[]): (Entry & NestedEntry)[] => {
  return doFlattenSession(session, 0);
}

const doFlattenSession = (group: Entry[], nested: number): (Entry & NestedEntry)[] => {
  let flattened = [];
  for (let entry of group) {
    flattened.push(extend(entry, { nested: nested }));

    if ('group' in entry) {
      let flattenedGroup = doFlattenSession(entry.group, nested + 1);
      flattened.push(...flattenedGroup);
    }
  }
  return flattened;
}

export const getEntryPath = (session: Entry[], index: number): number[] => {
  const count = {
    count: 0
  }

  return doGetEntryPath(session, index, count);
}

const doGetEntryPath = (group: Entry[], index: number, count): number[] => {
  for (let i = 0; i < group.length; i++) {
    let entry = group[i];
    if (count.count++ === index) {
      return [i]
    }
    if ('group' in entry) {
      let pathInGroup = doGetEntryPath(entry.group, index, count);
      if (pathInGroup.length !== 0) {
        return [i, ...pathInGroup];
      }
    }
  }
  return [];
}
