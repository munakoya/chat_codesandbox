import { combineReducers } from "redux";

import userReducer from "./userReducer";
import channelReducer from "./channelReducer";

const reducers = combineReducers({
  user: userReducer,
  channel: channelReducer
});

export default reducers;
