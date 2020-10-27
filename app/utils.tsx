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
  var count = 0;

  for (var i = 0; i < session.length; i++) {
    var entry = session[i];

    if (entry.type !== "repeat") {
      if (callback(entry, count++, [])) {
        return;
      }
    } else {
      for (var ii = 0; ii < entry.repetitions; ii++) {
        for (var j = 0; j < entry.group.length; j++) {
          var subEntry = entry.group[j];

          if (subEntry.type !== "repeat") {
            if (!isSkipped(subEntry, entry, ii) && callback(subEntry, count++, [{ current: ii, total: entry.repetitions }])) {
              return;
            }
          } else {
            for (var jj = 0; jj < subEntry.repetitions; jj++) {
              for (var k = 0; k < subEntry.group.length; k++) {
                var subSubEntry = subEntry.group[k];

                if (subSubEntry.type !== "repeat") {
                  if (!isSkipped(subSubEntry, subEntry, jj) && callback(subSubEntry, count++, [{ current: ii, total: entry.repetitions }, { current: jj, total: subEntry.repetitions }])) {
                    return;
                  }
                } else {
                  throw new Error("Deep nesting not supported");
                }
              }
            }
          }
        }
      }
    }
  }
  callback(doneSessionEntry, count++, []);
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
  var flattened = [];
  for (let entry of session) {
    flattened.push(extend(entry, { nested: 0 }));

    if ('group' in entry) {
      let flattenedGroup = flattenGroup(entry.group, 1);
      flattened.push(...flattenedGroup);
    }
  }
  return flattened;
}

const flattenGroup = (group: Entry[], nested: number): (Entry & NestedEntry)[] => {
  var flattened = [];
  for (let entry of group) {
    flattened.push(extend(entry, { nested: nested }));

    if ('group' in entry) {
      let flattenedGroup = flattenGroup(entry.group, nested + 1);
      flattened.push(...flattenedGroup);
    }
  }
  return flattened;
}
