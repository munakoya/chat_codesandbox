import React, { useEffect, useRef, useState } from "react";
import {
  Sidebar,
  Menu,
  Divider,
  Button,
  Modal,
  Icon,
  Label,
  Segment
} from "semantic-ui-react";
import { SliderPicker } from "react-color";
import { useSelector } from "react-redux";

import firebase from "../../firebase";
import { useActions } from "../../hooks/useActions";

const ColorPanel = () => {
  // local state
  const [modal, setModal] = useState(false);
  const [primaryColor, setPrimaryColor] = useState("");
  const [secondaryColor, setSecondaryColor] = useState("");
  const [userColors, setUserColors] = useState([]);

  // rexud global mathod and state
  const { setColor } = useActions();
  const { currentUser } = useSelector((state) => state.user);

  // database reference
  const usersRef = firebase.database().ref("users");

  // responsible for setting up listeners when the user present, then removing them on unmounting
  useEffect(() => {
    if (currentUser) {
      addListeners();
    }
    return () => removeListeners();
  }, [currentUser]);

  // listeners definition - determines if user has any specific app coloration preferences saved in the database
  //  if so, it pushes them into state
  const addListeners = () => {
    const userColorsArr = [];
    usersRef.child(`${currentUser.uid}/colors`).on("child_added", (snap) => {
      userColorsArr.unshift(snap.val());
      setUserColors(userColorsArr);
    });
  };

  // removes previously set listener
  const removeListeners = () => {
    usersRef.child(`${currentUser.uid}/colors`).off();
  };

  // responsible for pushing colors selected by user into the database
  const handleSave = () => {
    if (primaryColor && secondaryColor) {
      usersRef
        .child(`${currentUser.uid}/colors`)
        .push()
        .update({ primaryColor, secondaryColor })
        .then(setModal(!modal))
        .catch((err) => console.error(err));
    }
  };

  // used to display the list of user's color sets with the ability to apply them by updating the global redux state
  const displayUserColors = () => {
    return (
      userColors &&
      userColors.map((color, i) => {
        return (
          <React.Fragment key={i}>
            <Divider />
            <div
              className="color_container"
              onClick={() => setColor(color.primaryColor, color.secondaryColor)}
            >
              <div
                className="color_square"
                style={{ background: color.primaryColor }}
              >
                <div
                  className="color_overlay"
                  style={{ background: color.secondaryColor }}
                ></div>
              </div>
            </div>
          </React.Fragment>
        );
      })
    );
  };

  // component responsible for rendering the color selection panel of the main app, it also renders a modal for chosing colors
  return (
    <Sidebar
      as={Menu}
      icon="labeled"
      inverted
      vertical
      visible
      width="very thin"
    >
      <Divider />
      <Button
        icon="add"
        size="small"
        color="blue"
        onClick={() => setModal(!modal)}
      />
      {displayUserColors()}

      {/* modal */}
      <Modal basic open={modal}>
        <Modal.Header>Choose app colors</Modal.Header>

        <Modal.Content>
          <Segment inverted>
            <Label content="Primary color" />
            <SliderPicker
              color={primaryColor}
              onChange={(color) => setPrimaryColor(color.hex)}
            />
          </Segment>
          <Segment inverted>
            <Label content="Secondary color" />
            <SliderPicker
              color={secondaryColor}
              onChange={(color) => setSecondaryColor(color.hex)}
            />
          </Segment>
        </Modal.Content>

        <Modal.Actions>
          <Button color="green" inverted onClick={() => handleSave()}>
            <Icon name="checkmark" /> Save
          </Button>
          <Button color="red" inverted onClick={() => setModal(!modal)}>
            <Icon name="remove" /> Cancel
          </Button>
        </Modal.Actions>
      </Modal>
    </Sidebar>
  );
};

export default ColorPanel;
