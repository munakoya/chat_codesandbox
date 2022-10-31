import React from "react";
import { Menu } from "semantic-ui-react";

import UserPanel from "./UserPanel";
import Channels from "./Channels";
import DirectMessages from "./DirectMessages";
import Starred from "./Starred";
import { useSelector } from "react-redux";

const SidePanel = () => {
  // global reduc state
  const { selectedColors } = useSelector((state) => state.user);

  // component responsible for rendering side panel section of the app
  return (
    <Menu
      size="large"
      inverted
      fixed="left"
      vertical
      style={{
        backgroundColor: selectedColors && selectedColors.primaryColor,
        fontSize: "1.2rem"
      }}
    >
      <UserPanel />
      <Starred />
      <Channels />
      <DirectMessages />
    </Menu>
  );
};

export default SidePanel;
