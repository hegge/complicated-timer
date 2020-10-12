import { SET_SESSIONS, ADD_SESSION, SET_LOADING } from '../types'

import {
    Session,
  } from '../Session'

export function setSessions(sessions: Session[]) {
    return {
        type: SET_SESSIONS,
        sessions: sessions,
    };
}

export function addSession(session: Session) {
    return {
        type: ADD_SESSION,
        session: session,
    };
}

export function setLoading(isLoading: boolean) {
    return {
        type: SET_LOADING,
        isLoading: isLoading,
    };
}