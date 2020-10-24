import {
  SET_SESSION,
  ADD_SESSION_ENTRY,
  SET_SESSION_NAME,
  SET_SESSION_DESCRIPTION,
  MOVE_UP,
  MOVE_DOWN,
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

export function moveUpPressed(index: number) {
  return {
    type: MOVE_UP,
    index: index,
  };
}

export function moveDownPressed(index: number) {
  return {
    type: MOVE_DOWN,
    index: index,
  };
}
