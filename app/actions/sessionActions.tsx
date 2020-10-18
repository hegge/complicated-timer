import {
    SET_SESSIONS,
    ADD_SESSION,
    DUPLICATE_SESSION,
    DELETE_SESSION,
    SET_LOADING,
} from '../types'

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

export function duplicateSession(index: number) {
    return {
        type: DUPLICATE_SESSION,
        index: index,
    };
}

export function deleteSession(index: number) {
    return {
        type: DELETE_SESSION,
        index: index,
    };
}

export function setLoading(isLoading: boolean) {
    return {
        type: SET_LOADING,
        isLoading: isLoading,
    };
}