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
  formatProgress,
  getSessionEntry,
  getSessionEntryCount,
  doneSessionEntry,
} from '../utils';

import { createSelector } from 'reselect'

export interface PlayState {
  session: Session,
  currentStepCount: number,
  timerValueMillis: number,
  isRunning: boolean,
}

const initialState: PlayState = {
  session: emptySession(),
  currentStepCount: 0,
  timerValueMillis: 0,
  isRunning: false,
};

const sessionSelector = (state: PlayState) => state.session.entries
export const timerValueSecondsSelector = (state: PlayState) => state.timerValueMillis / 1000
const currentStepCountSelector = (state: PlayState) => state.currentStepCount
export const sessionNameSelector = (state: PlayState) => state.session.name

export const currentStepSelector = createSelector(
    sessionSelector,
    currentStepCountSelector,
    (session, currentStepCount) => {
      let entry = getSessionEntry(session, currentStepCount);
      return entry === null ? doneSessionEntry : entry;
    }
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
  (session, currentStepCount) => {
    let progress = getSessionProgress(session, currentStepCount);
    return formatProgress(progress);
  }
)
export const getProgress = (state: PlayState) => {
  return getSessionProgress(sessionSelector(state), state.currentStepCount);
}
export const entryCountSelector = createSelector(
  sessionSelector,
  (session) => getSessionEntryCount(session)
)

export default function (state = initialState, action: any): PlayState {
  switch (action.type) {
    case SET_SESSION: {
      const currentStep = getSessionEntry(action.session.entries, 0);
      return Object.assign({}, state, {
        session: action.session,
        currentStepCount: 0,
        timerValueMillis: currentStep!.duration * 1000,
        isRunning: false,
      })
    }
    case INTERVAL_TICK: {
      const currentStep = currentStepSelector(state);
      if (state.isRunning && currentStep!.category === "done") {
        return Object.assign({}, state, {
          timerValueMillis: 0,
          isRunning: false,
        })
      } else if (state.timerValueMillis - action.tickLength < 0) {
        const nextStep = nextStepSelector(state)
        return Object.assign({}, state, {
          currentStepCount: state.currentStepCount + 1,
          timerValueMillis: nextStep !== null ? nextStep.duration * 1000 : 0,
          isRunning: !currentStep.pauseWhenComplete,
        })
      } else {
        return Object.assign({}, state, {
          timerValueMillis: state.timerValueMillis - action.tickLength
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
        timerValueMillis: currentStep!.duration * 1000,
        isRunning: true,
      })
    }
    case REVERSE_PRESSED:
      const currentStep = currentStepSelector(state);
      return Object.assign({}, state, {
        timerValueMillis: Math.min(state.timerValueMillis + 1000, currentStep!.duration * 1000)
      })
    case FORWARD_PRESSED:
      return Object.assign({}, state, {
        timerValueMillis: state.timerValueMillis - 1000
      })
    case BACK_PRESSED: {
      if (state.currentStepCount === 0) {
        const currentStep = currentStepSelector(state);
        return Object.assign({}, state, {
          timerValueMillis: currentStep?.duration * 1000,
        })
      } else {
        const prevStep = prevStepSelector(state)
        return Object.assign({}, state, {
          currentStepCount: state.currentStepCount - 1,
          timerValueMillis: prevStep !== null ? prevStep.duration * 1000 : 0,
        })
      }
    }
    case NEXT_PRESSED: {
      const nextStep = nextStepSelector(state)
      if (nextStep?.category !== "done") {
        return Object.assign({}, state, {
          currentStepCount: state.currentStepCount + 1,
          timerValueMillis: nextStep !== null ? nextStep.duration * 1000 : 0,
        })
      } else {
        return state;
      }
    }
    case STEP_SLIDER_CHANGED:
      return Object.assign({}, state, {
        timerValueMillis: action.value * 1000
      })
    case SESSION_SLIDER_CHANGED: {
      const currentStep = getSessionEntry(sessionSelector(state), action.value);
      return Object.assign({}, state, {
        currentStepCount: action.value,
        timerValueMillis: currentStep!.duration * 1000,
        isRunning: false,
      })
    }
  }
  return state;
}
