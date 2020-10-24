import {
  SET_SESSION,
  ADD_SESSION_ENTRY,
  SET_SESSION_NAME,
  SET_SESSION_DESCRIPTION,
  MOVE_UP,
  MOVE_DOWN,
} from '../types'

import {
  emptySession,
  Session,
  Entry,
} from '../session'

import { createSelector } from 'reselect'

export interface EditState {
  session: Session,
}

const initialState: EditState = {
  session: emptySession(),
};

export const sessionSelector = (state: EditState) => state.session.session
export const sessionNameSelector = (state: EditState) => state.session.name
export const sessionDescriptionSelector = (state: EditState) => state.session.description

export const sessionSelector2 = createSelector(
  sessionSelector,
  (session) => session
)

export default function (state = initialState, action: any): EditState {
  switch (action.type) {
    case SET_SESSION:
      return Object.assign({}, state, {
        session: action.session,
      })
    case ADD_SESSION_ENTRY:
      return {...state,
        session: {
          ...state.session,
          session: [
            ...state.session.session,
            action.entry
          ]
        }
      }
    case SET_SESSION_NAME:
      return {...state,
        session: {
          ...state.session,
          name: action.name
        }
      }
    case SET_SESSION_DESCRIPTION:
      return {...state,
        session: {
          ...state.session,
          description: action.description
        }
      }
  }
  return state;
}
