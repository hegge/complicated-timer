import {
  SET_SESSIONS,
  ADD_SESSION,
  DUPLICATE_SESSION,
  DELETE_SESSION,
  SET_LOADING,
} from '../types'

const initialState = {
  sessions: [],
  isLoading: false,
};

export default function (state = initialState, action: any) {
  switch (action.type) {
    case SET_SESSIONS:
      return Object.assign({}, state, {
        sessions: action.sessions
      })
    case ADD_SESSION:
      return Object.assign({}, state, {
        sessions: [...state.sessions, action.session]
      })
    case DUPLICATE_SESSION: {
      let newSessions = state.sessions.slice();
      newSessions.splice(action.index + 1, 0, state.sessions[action.index]);
      return Object.assign({}, state, {
        sessions: newSessions
      })
    }
    case DELETE_SESSION: {
      let newSessions = state.sessions.slice();
      newSessions.splice(action.index, 1);
      return Object.assign({}, state, {
        sessions: newSessions
      })
    }
    case SET_LOADING:
      return Object.assign({}, state, {
        isLoading: action.isLoading
      })
  }
  return state;
}