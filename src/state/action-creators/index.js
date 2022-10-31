import { ActionType } from "../action-types";

// user actions
export const setUser = (user) => {
  return {
    type: ActionType.SET_USER,
    payload: {
      currentUser: user
    }
  };
};

export const clearUser = () => {
  return {
    type: ActionType.CLEAR_USER
  };
};

export const setStarredChannelList = (starredChannels) => {
  return {
    type: ActionType.SET_STARRED_CHANNELS,
    payload: starredChannels
  };
};

export const setColor = (primaryColor, secondaryColor) => {
  return {
    type: ActionType.SET_COLOR,
    payload: {
      primaryColor,
      secondaryColor
    }
  };
};

// channel actions
export const setCurrentChannel = (channel) => {
  return {
    type: ActionType.SET_CURRENT_CHANNEL,
    payload: channel
  };
};

export const setPrivateChannel = (isPrivateChannel) => {
  return {
    type: ActionType.SET_PRIVATE_CHANNEL,
    payload: isPrivateChannel
  };
};

export const setUserPosts = (userPosts) => {
  return {
    type: ActionType.SET_USER_POSTS,
    payload: userPosts
  };
};
