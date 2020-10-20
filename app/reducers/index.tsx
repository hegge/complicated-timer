import { combineReducers } from 'redux';
import playReducer, { PlayState } from './playReducer';
import sessionsReducer, { SessionsState } from './sessionsReducer';

export interface RootState {
  sessions: SessionsState,
  play: PlayState
}

const rootReducer = combineReducers({
  sessions: sessionsReducer,
  play: playReducer,
});

export default rootReducer;