import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Header, Segment, Input, Icon } from "semantic-ui-react";

import firebase from "../../firebase";
import { useActions } from "../../hooks/useActions";

const MessagesHeader = ({
  uniqueUsers,
  handleSearchTermChange,
  searchLoading
}) => {
  // local state
  const [starredChannels, setStarredChannels] = useState([]);
  const [isStarred, setIsStarred] = useState(false);

  // redux global methods and state
  const { setStarredChannelList } = useActions();
  const { currentUser } = useSelector((state) => state.user);
  const { currentChannel, isPrivateChannel } = useSelector(
    (state) => state.channel
  );

  // database location reference
  const usersRef = firebase.database().ref("users");

  // run after clicking the star icon
  const handleStarClick = () => {
    // iterates over state variable to verify if current channel id already in the array
    const index = starredChannels.findIndex(
      (channel) => channel.id === currentChannel.id
    );

    // if it is not, the database location referring to user's starred channels gets updated with clicked channel's info
    if (index === -1) {
      usersRef.child(`${currentUser.uid}/starred`).update({
        [currentChannel.id]: {
          name: currentChannel.name,
          details: currentChannel.details,
          id: currentChannel.id,
          createdBy: {
            name: currentChannel.createdBy.name,
            avatar: currentChannel.createdBy.avatar
          }
        }
      });
      // if it is, the channel info gets remover from the database location referring to user's starred channels
    } else {
      usersRef
        .child(`${currentUser.uid}/starred`)
        .child(currentChannel.id)
        .remove((err) => {
          if (err !== null) {
            console.error(err);
          }
        });
    }
  };

  // sets listeners on the current user's starred channels list
  useEffect(() => {
    let starred = [];
    setStarredChannels([]);

    usersRef.child(`${currentUser.uid}/starred`).on("child_added", (snap) => {
      if (snap.val() !== null) {
        starred.push(snap.val());
        setStarredChannels(starred);
        setStarredChannelList(starred);
      }
    });

    usersRef.child(`${currentUser.uid}/starred`).on("child_removed", (snap) => {
      const index = starredChannels.findIndex(
        (channel) => channel.id === snap.val().id
      );
      if (snap.val() !== null) {
        starred.splice(index, 1);
        setStarredChannels(starred);
        setStarredChannelList(starred);
      }
    });
  }, [currentUser]);

  // respinsible for setting apripriate style for the star icon basing on wether the channels is starred
  const isCurrentChannelStarred = () => {
    const index = starredChannels.findIndex(
      (channel) => channel.id === currentChannel.id
    );

    if (index !== -1) {
      setIsStarred(true);
    } else {
      setIsStarred(false);
    }
  };

  useEffect(() => {
    if (currentChannel) {
      isCurrentChannelStarred();
    }
  }, [currentChannel, starredChannels]);

  // component responsible fom rendering the header of messages section
  return (
    <Segment clearing>
      {/* Channel title */}
      <Header fluid as="h2" floated="left" style={{ marginBottom: 0 }}>
        <span>
          {currentChannel
            ? `${isPrivateChannel ? "@" : "#"}${currentChannel.name}`
            : ""}
          {!isPrivateChannel && (
            <Icon
              onClick={() => {
                handleStarClick();
                isCurrentChannelStarred();
              }}
              name={isStarred ? "star" : "star outline"}
              color={isStarred ? "yellow" : "black"}
            />
          )}
        </span>
        {!isPrivateChannel && (
          <Header.Subheader>
            {uniqueUsers} user{uniqueUsers !== 1 ? "s" : ""}
          </Header.Subheader>
        )}
      </Header>

      {/* Channel search input */}
      <Header floated="right">
        <Input
          loading={searchLoading}
          onChange={handleSearchTermChange}
          size="mini"
          icon="search"
          name="searchTerm"
          placeholder="Search messages..."
        />
      </Header>
    </Segment>
  );
};

export default MessagesHeader;
