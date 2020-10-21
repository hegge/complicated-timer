import {
  SET_SESSION,
  INTERVAL_TICK,
  PLAY_PRESSED,
  PAUSE_PRESSED,
  RESTART_PRESSED,
  REVERSE_PRESSED,
  FORWARD_PRESSED,
  BACK_PRESSED,
  NEXT_PRESSED,
  STEP_SLIDER_CHANGED,
  SESSION_SLIDER_CHANGED,
} from '../types'

import {
  emptySession,
  Session,
} from '../session'

import {
  getSessionProgress,
  getSessionEntry,
  getSessionEntryCount,
} from '../utils';

export interface PlayState {
  session: Session,
  currentStepCount: number,
  timerValue: number,
  isRunning: boolean,
}

const initialState: PlayState = {
  session: emptySession(),
  currentStepCount: 0,
  timerValue: 0,
  isRunning: false,
};

const sessionSelector = (state: PlayState) => state.session.session
const currentStepCountSelector = (state: PlayState) => state.currentStepCount

export const currentStepSelector = createSelector(
    sessionSelector,
    currentStepCountSelector,
    (session, currentStepCount) => getSessionEntry(session, currentStepCount)
)
export const prevStepSelector = createSelector(
  sessionSelector,
  currentStepCountSelector,
  (session, currentStepCount) => getSessionEntry(session, currentStepCount - 1)
)
export const nextStepSelector = createSelector(
  sessionSelector,
  currentStepCountSelector,
  (session, currentStepCount) => getSessionEntry(session, currentStepCount + 1)
)
export const progressSelector = createSelector(
  sessionSelector,
  currentStepCountSelector,
  (session, currentStepCount) => getSessionProgress(session, currentStepCount)
)
export const getProgress = (state: PlayState) => {
  return getSessionProgress(sessionSelector(state), state.currentStepCount);
}
export const entryCountSelector = createSelector(
  sessionSelector,
  (session) => getSessionEntryCount(session)
)

export default function (state = initialState, action: any) {
  switch (action.type) {
    case SET_SESSION: {
      const currentStep = getSessionEntry(action.session.session, 0);
      return Object.assign({}, state, {
        session: action.session,
        timerValue: currentStep?.duration,
        isRunning: false,
      })
    }
    case INTERVAL_TICK: {
      const currentStep = currentStepSelector(state);
      if (state.isRunning && currentStep!.category === "done") {
        return Object.assign({}, state, {
          isRunning: false,
          timerValue: 0
        })
      } else if (state.timerValue <= 0.1) {
        const nextStep = nextStepSelector(state)
        return Object.assign({}, state, {
          timerValue: nextStep?.duration,
          currentStepCount: state.currentStepCount + 1,
        })
      } else {
        return Object.assign({}, state, {
          timerValue: state.timerValue - 0.1
        })
      }
    }
    case PLAY_PRESSED:
      return Object.assign({}, state, {
        isRunning: true,
      })
    case PAUSE_PRESSED:
      return Object.assign({}, state, {
        isRunning: false,
      })
    case RESTART_PRESSED: {
      const currentStep = getSessionEntry(sessionSelector(state), 0);
      return Object.assign({}, state, {
        currentStepCount: 0,
        timerValue: currentStep?.duration,
        isRunning: true,
      })
    }
    case REVERSE_PRESSED:
      const currentStep = currentStepSelector(state);
      return Object.assign({}, state, {
        timerValue: Math.min(state.timerValue + 1, currentStep!.duration)
      })
    case FORWARD_PRESSED:
      return Object.assign({}, state, {
        timerValue: state.timerValue - 1
      })
    case BACK_PRESSED: {
      if (state.currentStepCount === 0) {
        const currentStep = currentStepSelector(state);
        return Object.assign({}, state, {
          timerValue: currentStep?.duration,
          isRunning: false,
        })
      } else {
        const prevStep = prevStepSelector(state)

        return Object.assign({}, state, {
          currentStepCount: state.currentStepCount - 1,
          timerValue: prevStep?.duration,
          isRunning: false,
        })
      }
    }
    case NEXT_PRESSED: {
      const nextStep = nextStepSelector(state)
      if (nextStep?.category !== "done") {
        return Object.assign({}, state, {
          currentStepCount: state.currentStepCount + 1,
          timerValue: nextStep?.duration,
        })
      } else {
        return state;
      }
    }
    case STEP_SLIDER_CHANGED:
      return Object.assign({}, state, {
        timerValue: action.value
      })
    case SESSION_SLIDER_CHANGED: {
      const currentStep = getSessionEntry(sessionSelector(state), action.value);
      return Object.assign({}, state, {
        currentStepCount: action.value,
        timerValue: currentStep?.duration,
      })
    }
  }
  return state;
}
