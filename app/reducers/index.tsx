import { combineReducers } from 'redux';
import sessionListReducer from './sessionListReducer';

const allReducers = combineReducers({
    sessionList: sessionListReducer,
});

export default allReducers;