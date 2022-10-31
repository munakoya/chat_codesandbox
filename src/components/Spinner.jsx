import React from "react";
import { Loader, Dimmer } from "semantic-ui-react";

// component used to display a spinner while the app is loading
const Spinner = () => (
  <Dimmer active>
    <Loader size="huge" content={"Loading..."} />
  </Dimmer>
);

export default Spinner;
