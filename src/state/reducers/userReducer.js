import { ActionType } from "../action-types";

const initialState = {
  currentUser: null,
  isLoading: true,
  starredChannelList: [],
  selectedColors: {
    primaryColor: "#4c3c4c",
    secondaryColor: "#eee"
  }
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case ActionType.SET_USER:
      return {
        currentUser: action.payload.currentUser,
        isLoading: false
      };
    case ActionType.CLEAR_USER:
      return {
        ...initialState,
        isLoading: false
      };
    case ActionType.SET_STARRED_CHANNELS:
      return {
        ...state,
        starredChannelList: action.payload
      };
    case ActionType.SET_COLOR:
      return {
        ...state,
        selectedColors: {
          primaryColor: action.payload.primaryColor,
          secondaryColor: action.payload.secondaryColor
        }
      };
    default:
      return state;
  }
};

export default reducer;
