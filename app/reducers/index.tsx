import { combineReducers } from 'redux';
import sessionsReducer from './sessionsReducer';

const rootReducer = combineReducers({
    sessions: sessionsReducer,
});

export default rootReducer;