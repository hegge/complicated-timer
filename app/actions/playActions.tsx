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
  Session,
} from '../session'

export function setSession(session: Session) {
  return {
    type: SET_SESSION,
    session: session,
  };
}

export function intervalTick() {
  return {
    type: INTERVAL_TICK,
  };
}

export function playPressed() {
  return {
    type: PLAY_PRESSED,
  };
}

export function pausePressed() {
  return {
    type: PAUSE_PRESSED,
  };
}

export function restartPressed() {
  return {
    type: RESTART_PRESSED,
  };
}

export function reversePressed() {
  return {
    type: REVERSE_PRESSED,
  };
}

export function forwardPressed() {
  return {
    type: FORWARD_PRESSED,
  };
}

export function backPressed() {
  return {
    type: BACK_PRESSED,
  };
}

export function nextPressed() {
  return {
    type: NEXT_PRESSED,
  };
}

export function stepSliderChanged(value: number) {
  return {
    type: STEP_SLIDER_CHANGED,
    value: value,
  };
}

export function sessionSliderChanged(value: number) {
  return {
    type: SESSION_SLIDER_CHANGED,
    value: value,
  };
}
