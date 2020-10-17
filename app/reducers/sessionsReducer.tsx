import { SET_SESSIONS, ADD_SESSION, SET_LOADING } from '../types'

const initialState = {
  sessions: [],
  isLoading: false,
};

export default function (state = initialState, action) {
  switch (action.type) {
    case SET_SESSIONS:
      return Object.assign({}, state, {
        sessions: action.sessions
      })
    case ADD_SESSION:
      return Object.assign({}, state, {
        sessions: [...state.sessions, action.session]
      })
    case SET_LOADING:
      return Object.assign({}, state, {
        isLoading: action.isLoading
      })
  }
  return state;
}