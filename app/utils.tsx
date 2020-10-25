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
  traverseSession(session, (entry, count, rep1, total1, rep2, total2) => {
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

export const getSessionProgress = (session: Entry[], index: number) => {
  var progress = "";
  traverseSession(session, (entry, count, rep1, total1, rep2, total2) => {
    if (total1 === 0) {
      progress = "";
    } else if (total2 === 0) {
      progress = (rep1 + 1) + "/" + total1;
    } else {
      progress = (rep1 + 1) + "/" + total1 + " " + (rep2 + 1) + "/" + total2;
    }
    if (index === count) {
      return true;
    } else {
      return false;
    }
  });
  return progress
}

type EntryCallback = (entry: CountdownEntry, count: number, rep1: number, total1: number, rep2: number, total2: number) => boolean

export const getSessionEntry = (session: Entry[], index: number): CountdownEntry | null => {
  var entryAtIndex = null;
  traverseSession(session, (entry, count, rep1, total1, rep2, total2) => {
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
  traverseSession(session, (entry, count, rep1, total1, rep2, total2) => {
    if (entry.type === "done") {
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
      if (callback(entry, count++, 0, 0, 0, 0)) {
        return;
      }
    } else {
      for (var ii = 0; ii < entry.repetitions; ii++) {
        for (var j = 0; j < entry.group.length; j++) {
          var subEntry = entry.group[j];

          if (subEntry.type !== "repeat") {
            if (!isSkipped(subEntry, entry, ii) && callback(subEntry, count++, ii, entry.repetitions, 0, 0)) {
              return;
            }
          } else {
            for (var jj = 0; jj < subEntry.repetitions; jj++) {
              for (var k = 0; k < subEntry.group.length; k++) {
                var subSubEntry = subEntry.group[k];

                if (subSubEntry.type !== "repeat") {
                  if (!isSkipped(subSubEntry, subEntry, jj) && callback(subSubEntry, count++, ii, entry.repetitions, jj, subEntry.repetitions)) {
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
  callback(doneSessionEntry, count++, 0, 0, 0, 0);
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

export const flattenSession = (session: Entry[]): (CountdownEntry & RepeatEntry & NestedEntry)[] => {
  var flattened = [];
  for (var i = 0; i < session.length; i++) {
    var entry = session[i];
    flattened.push(entry);

    if ('group' in entry) {
      for (var j = 0; j < entry.group.length; j++) {
        var subEntry = entry.group[j];
        flattened.push(extend(subEntry, { nested: 1 }));

        if ('group' in subEntry) {
          for (var k = 0; k < subEntry.group.length; k++) {
            var subSubEntry = subEntry.group[k];
            flattened.push(extend(subSubEntry, { nested: 2 }));

            if (subSubEntry.type === "repeat") {
              throw new Error("Deep nesting not supported");
            }
          }
        }
      }
    }
  }
  return flattened;
}
