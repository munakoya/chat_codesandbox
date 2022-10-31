import { ActionType } from "../action-types";

const initialState = {
  currentChannel: null,
  isPrivateChannel: false,
  userPosts: null
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case ActionType.SET_CURRENT_CHANNEL:
      return {
        ...state,
        currentChannel: action.payload
      };
    case ActionType.SET_PRIVATE_CHANNEL:
      return {
        ...state,
        isPrivateChannel: action.payload
      };
    case ActionType.SET_USER_POSTS:
      return {
        ...state,
        userPosts: action.payload
      };
    default:
      return state;
  }
};

export default reducer;
