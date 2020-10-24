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
} from '../session'

import {
  flattenSession,
} from '../utils';

import { createSelector } from 'reselect'

export interface EditState {
  session: Session,
}

const initialState: EditState = {
  session: emptySession(),
};

export const sessionSelector = (state: EditState) => state.session.session
export const flattenedSessionSelector = (state: EditState) => flattenSession(state.session.session)
export const sessionNameSelector = (state: EditState) => state.session.name
export const sessionDescriptionSelector = (state: EditState) => state.session.description

const entryIndexSelector = (state: EditState, props) => props.route.params.index;

export const repetitionsSelector = createSelector(
  flattenedSessionSelector,
  entryIndexSelector,
  (flattenedSession, entryIndex) => flattenedSession[entryIndex].repetitions
)

export const durationSelector = createSelector(
  flattenedSessionSelector,
  entryIndexSelector,
  (flattenedSession, entryIndex) => flattenedSession[entryIndex].duration
)

export const categorySelector = createSelector(
  flattenedSessionSelector,
  entryIndexSelector,
  (flattenedSession, entryIndex) => flattenedSession[entryIndex].category
)

export default function (state = initialState, action: any): EditState {
  switch (action.type) {
    case SET_SESSION:
      return Object.assign({}, state, {
        session: action.session,
      })
    case ADD_SESSION_ENTRY:
      return {
        ...state,
        session: {
          ...state.session,
          session: [
            ...state.session.session,
            action.entry
          ]
        }
      }
    case SET_SESSION_NAME:
      return {
        ...state,
        session: {
          ...state.session,
          name: action.name
        }
      }
    case SET_SESSION_DESCRIPTION:
      return {
        ...state,
        session: {
          ...state.session,
          description: action.description
        }
      }

    case SET_REPETITIONS:
    //action.index
    //action.repetitions
    case SET_DURATION:
    //action.duration
    case SET_CATEGORY:
    //action.category
    case MOVE_UP:
    case MOVE_DOWN:
    case DELETE:
  }
  return state;
}
