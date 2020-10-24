import {
  SET_SESSION,
  ADD_SESSION_ENTRY,
  SET_SESSION_NAME,
  SET_SESSION_DESCRIPTION,
  SET_REPETITIONS,
  SET_DURATION,
  SET_CATEGORY,
  MOVE_UP,
  MOVE_DOWN,
  DELETE,
} from '../types'

import {
  Session,
  Entry,
} from '../session'

export function setSession(session: Session) {
  return {
    type: SET_SESSION,
    session: session,
  };
}

export function addSessionEntry(entry: Entry) {
  return {
    type: ADD_SESSION_ENTRY,
    entry: entry,
  };
}

export function setSessionName(name: string) {
  return {
    type: SET_SESSION_NAME,
    name: name,
  };
}

export function setSessionDescription(description: string) {
  return {
    type: SET_SESSION_DESCRIPTION,
    description: description,
  };
}

export function setRepetitions(index: number, repetitions: number) {
  return {
    type: SET_REPETITIONS,
    index: index,
    repetitions: repetitions,
  };
}

export function setDuration(index: number, duration: number) {
  return {
    type: SET_DURATION,
    index: index,
    duration: duration,
  };
}

export function setCategory(index: number, category: string) {
  return {
    type: SET_CATEGORY,
    index: index,
    category: category,
  };
}

export function moveEntryUp(index: number) {
  return {
    type: MOVE_UP,
    index: index,
  };
}

export function moveEntryDown(index: number) {
  return {
    type: MOVE_DOWN,
    index: index,
  };
}

export function deleteEntry(index: number) {
  return {
    type: DELETE,
    index: index,
  };
}
