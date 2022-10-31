import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Menu, Icon } from "semantic-ui-react";

import firebase from "../../firebase";
import { useActions } from "../../hooks/useActions";

const DirectMessages = () => {
  // local state
  const [users, setUsers] = useState([]);
  const [activeChannel, setActiveChannel] = useState([]);

  // reduc global methods and state
  const { setCurrentChannel, setPrivateChannel } = useActions();
  const { currentUser } = useSelector((state) => state.user);
  const { isPrivateChannel } = useSelector((state) => state.channel);

  // database location references
  const usersRef = firebase.database().ref("users");
  const connectedRef = firebase.database().ref(".info/connected");
  const presenceRef = firebase.database().ref("presence");

  // [INITIALIZATION SECTION]

  useEffect(() => {
    if (currentUser) {
      addListeners();
    }
    return () => removeListeners();
  }, []);

  // sets up listeners on database
  const addListeners = () => {
    const loadedUsers = [];
    // adds all database registered users intol local state user list
    usersRef.on("child_added", (snap) => {
      if (currentUser.uid !== snap.key) {
        let user = snap.val();
        user["uid"] = snap.key;
        user["status"] = "offline";
        loadedUsers.push(user);
        setUsers([...loadedUsers]);
      }
    });

    // sets up a presence location in database to keep record of all currently logged in users
    connectedRef.on("value", (snap) => {
      if (snap.val() === true) {
        presenceRef.child(currentUser.uid).set(true);
        presenceRef.onDisconnect().remove((err) => {
          if (err !== null) {
            console.error(err);
          }
        });
      }
    });

    // performs a callback on a user object when it's added in the database
    presenceRef.on("child_added", (snap) => {
      if (currentUser.uid !== snap.key) {
        addStatusToUser(snap.key);
      }
    });

    // performs a callback on a user object when it's removed from the database
    presenceRef.on("child_removed", (snap) => {
      if (currentUser.uid !== snap.key) {
        addStatusToUser(snap.key, false);
      }
    });
  };

  // removes set up listeners
  const removeListeners = () => {
    usersRef.off();
    connectedRef.off();
    presenceRef.off();
  };

  // [USER PRESENCE SECTION]

  // callback performed on all users currently logged in
  // assignes an online/offline status
  const addStatusToUser = (userID, connected = true) => {
    const updatedUsers = users.reduce((acc, user) => {
      if (user.uid === userID) {
        user["status"] = `${connected ? "online" : "offline"}`;
      }
      return acc.concat(user);
    }, []);
    setUsers(updatedUsers);
  };

  // [PRIVATE CAHNNEL SECTION]

  // run when clicking on a username in the direct mesages section
  const changeChannel = (user) => {
    const channelID = getChannelID(user);
    const channelData = {
      id: channelID,
      name: user.name
    };
    setCurrentChannel(channelData);
    setPrivateChannel(true);
    setActiveChannel(user.uid);
  };

  // creates a custom channel id basing on user ids
  const getChannelID = (user) => {
    return user.uid < currentUser.uid
      ? `${user.uid}/${currentUser.uid}`
      : `${currentUser.uid}/${user.uid}`;
  };

  // [RENDER SECTION]

  // component responsible for rendering a direct message section
  return (
    <Menu.Menu className="menu">
      {/* count of logged users */}
      <Menu.Item>
        <span>
          <Icon name="mail" /> ACTIVE USERS
        </span>{" "}
        (
        {users.reduce((acc, user) => {
          if (user.status === "online") {
            return acc + 1;
          }
          return acc;
        }, 0)}
        )
      </Menu.Item>
      {/* logged users list */}
      {users.map((user) => {
        return (
          <Menu.Item
            active={isPrivateChannel && user.uid === activeChannel}
            key={user.uid}
            onClick={() => changeChannel(user)}
            style={{ opacity: 0.7, fontStyle: "italic" }}
          >
            <Icon
              name="circle"
              color={user.status === "online" ? "green" : "red"}
            />{" "}
            @{user.name}
          </Menu.Item>
        );
      })}
    </Menu.Menu>
  );
};

export default DirectMessages;
