import "./App.css";

import React from "react";
import { Grid } from "semantic-ui-react";

import ColorPanel from "./ColorPanel/ColorPanel";
import Messages from "./Messages/Messages";
import MetaPanel from "./MetaPanel/MetaPanel";
import SidePanel from "./SidePanel/SidePanel";
import { useSelector } from "react-redux";

const App = () => {
  // redux global state
  const { selectedColors } = useSelector((state) => state.user);

  // component responsible for rendering the main page od the app
  return (
    <Grid
      columns="equal"
      className="app"
      style={{
        backgroundColor: selectedColors && selectedColors.secondaryColor
      }}
    >
      <ColorPanel />

      <SidePanel />

      <Grid.Column style={{ marginLeft: 320 }}>
        <Messages />
      </Grid.Column>

      <Grid.Column width={4}>
        <MetaPanel />
      </Grid.Column>
    </Grid>
  );
};

export default App;
