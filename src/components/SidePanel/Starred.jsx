import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Icon, Menu } from "semantic-ui-react";

import { useActions } from "../../hooks/useActions";

const Starred = () => {
  // global redux methods and state
  const { setCurrentChannel, setPrivateChannel } = useActions();
  const { starredChannelList } = useSelector((state) => state.user);
  const { currentChannel } = useSelector((state) => state.channel);

  // responsible for rendering the list of fhannels that user has starred
  const displayChannels = () => {
    return (
      starredChannelList &&
      starredChannelList.map((channel) => (
        <Menu.Item
          key={channel.id}
          onClick={() => changeChannel(channel)}
          name={channel.name}
          style={{ opacity: 0.7 }}
          active={currentChannel && channel.id === currentChannel.id}
        >
          # {channel.name}
        </Menu.Item>
      ))
    );
  };

  // run after clicking an a starred channel
  const changeChannel = (channel) => {
    setCurrentChannel(channel);
    setPrivateChannel(false);
  };

  // component responsible for rendering a starred channels list
  return (
    <Menu.Menu className="menu">
      <Menu.Item>
        <span>
          <Icon name="star" /> STARRED
        </span>{" "}
        ({starredChannelList && starredChannelList.length})
      </Menu.Item>
      {displayChannels()}
    </Menu.Menu>
  );
};

export default Starred;
