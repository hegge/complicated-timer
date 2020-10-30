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
  emptySession,
  Session,
  Entry,
  CountdownEntry,
  RepeatEntry,
} from '../session'

import {
  flattenSession,
  getEntryPath,
} from '../utils';

import { createSelector } from 'reselect'
import update from 'immutability-helper';

export interface EditState {
  session: Session,
}

const initialState: EditState = {
  session: emptySession(),
};

export const sessionSelector = (state: EditState) => state.session
export const entriesSelector = (state: EditState) => state.session.entries
export const flattenedSessionSelector = (state: EditState) => flattenSession(state.session.entries)
export const sessionNameSelector = (state: EditState) => state.session.name
export const sessionDescriptionSelector = (state: EditState) => state.session.description

const entryIndexSelector = (state: EditState, props) => props.route.params.index;

export const repetitionsSelector = createSelector(
  flattenedSessionSelector,
  entryIndexSelector,
  (flattenedSession, entryIndex) => {
    let entry = flattenedSession[entryIndex] as RepeatEntry;
    return entry.repetitions;
  }
)

export const durationSelector = createSelector(
  flattenedSessionSelector,
  entryIndexSelector,
  (flattenedSession, entryIndex) => {
    let entry = flattenedSession[entryIndex] as CountdownEntry;
    return entry.duration;
  }
)

export const categorySelector = createSelector(
  flattenedSessionSelector,
  entryIndexSelector,
  (flattenedSession, entryIndex) => {
    let entry = flattenedSession[entryIndex] as CountdownEntry;
    return entry.category;
  }
)

const updateAtPath = (state: EditState, path: number[], property: string, value: any) => {
  if (path.length === 1) {
    return update(state, { session: { entries: { [path[0]]: { [property]: { $set: value } } } } });
  } else if (path.length === 2) {
    return update(state, { session: { entries: { [path[0]]: { group: { [path[1]]: { [property]: { $set: value } } } } } } });
  } else if (path.length === 3) {
    return update(state, { session: { entries: { [path[0]]: { group: { [path[1]]: { group: { [path[2]]: { [property]: { $set: value } } } } } } } } });
  } else {
    throw new Error("Deep nesting not supported");
  }
}

const insertAtPath = (state: EditState, path: number[], value: any) => {
  if (path.length === 1) {
    return update(state, { session: { entries: { $splice: [[path[0], 0, value]] } } });
  } else if (path.length === 2) {
    return update(state, { session: { entries: { [path[0]]: { group: { $splice: [[path[1], 0, value]] } } } } });
  } else if (path.length === 3) {
    return update(state, { session: { entries: { [path[0]]: { group: { [path[1]]: { group: { $splice: [[path[2], 0, value]] } } } } } } });
  } else {
    throw new Error("Deep nesting not supported");
  }
}

const deleteAtPath = (state: EditState, path: number[]) => {
  if (path.length === 1) {
    return update(state, { session: { entries: { $splice: [[path[0], 1]] } } });
  } else if (path.length === 2) {
    return update(state, { session: { entries: { [path[0]]: { group: { $splice: [[path[1], 1]] } } } } });
  } else if (path.length === 3) {
    return update(state, { session: { entries: { [path[0]]: { group: { [path[1]]: { group: { $splice: [[path[2], 1]] } } } } } } });
  } else {
    throw new Error("Deep nesting not supported");
  }
}

export default function (state = initialState, action: any): EditState {
  switch (action.type) {
    case SET_SESSION:
      return update(state, { session: { $set: action.session } });
    case ADD_SESSION_ENTRY:
      return update(state, { session: { entries: { $push: [action.entry] } } });
    case SET_SESSION_NAME:
      return update(state, { session: { name: { $set: action.name } } });
    case SET_SESSION_DESCRIPTION:
      return update(state, { session: { description: { $set: action.description } } });
    case SET_REPETITIONS: {
      let path = getEntryPath(entriesSelector(state), action.index);
      return updateAtPath(state, path, "repetitions", action.repetitions);
    }
    case SET_DURATION: {
      let path = getEntryPath(entriesSelector(state), action.index);
      return updateAtPath(state, path, "duration", action.duration);
    }
    case SET_CATEGORY: {
      let path = getEntryPath(entriesSelector(state), action.index);
      return updateAtPath(state, path, "category", action.category);
    }
    case MOVE_UP:{
      let path = getEntryPath(entriesSelector(state), action.index);
      let newPath = getEntryPath(entriesSelector(state), action.index - 1);
      let entry = flattenedSessionSelector(state)[action.index];
      console.group(path, newPath, entry);
      return insertAtPath(deleteAtPath(state, path), newPath, entry);
    }
    case MOVE_DOWN:{
      let path = getEntryPath(entriesSelector(state), action.index);
      let newPath = getEntryPath(entriesSelector(state), action.index + 1);
      let entry = flattenedSessionSelector(state)[action.index];
      console.group(path, newPath, entry);
      return insertAtPath(deleteAtPath(state, path), newPath, entry);
    }
    case DELETE: {
      let path = getEntryPath(entriesSelector(state), action.index);
      return deleteAtPath(state, path);
    }
  }
  return state;
}
