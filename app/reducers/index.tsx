import { combineReducers } from 'redux';
import editReducer, { EditState } from './editReducer';
import playReducer, { PlayState } from './playReducer';
import sessionsReducer, { SessionsState } from './sessionsReducer';

export interface RootState {
  sessions: SessionsState,
  play: PlayState,
  edit: EditState,
}

const rootReducer = combineReducers({
  sessions: sessionsReducer,
  play: playReducer,
  edit: editReducer,
});

export default rootReducer;