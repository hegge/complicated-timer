import { combineReducers } from 'redux';
import sessionsReducer from './sessionsReducer';

const allReducers = combineReducers({
    sessions: sessionsReducer,
});

export default allReducers;