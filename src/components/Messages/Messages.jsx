import React, { useEffect, useRef, useState } from "react";
import { Segment, Comment, Header } from "semantic-ui-react";
import { useSelector } from "react-redux";

import firebase from "../../firebase";
import MessagesHeader from "./MessagesHeader";
import MessageForm from "./MessagesForm";
import Message from "./Message";
import Typing from "./Typing";
import { useActions } from "../../hooks/useActions";
import Spinner from "../Spinner";

const Messages = () => {
  // local state
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [uniqueUsersCount, setUniquiUsersCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [listeners, setListeners] = useState([]);

  // hook used to grab a DOM node
  const messagesEnd = useRef();

  // redux global method and state
  const { setUserPosts } = useActions();
  const { currentChannel, isPrivateChannel } = useSelector(
    (state) => state.channel
  );
  const { currentUser } = useSelector((state) => state.user);

  // database location references
  const messagesRef = firebase.database().ref("messages");
  const privateMessagesRef = firebase.database().ref("privateMessages");
  const typingRef = firebase.database().ref("typing");
  const connectedRef = firebase.database().ref(".info/connected");

  // [INITIALIZATION SECTION]

  // method responsible for setting up listeners, removing them and clearing up the messages each time channel or user change
  useEffect(() => {
    if (currentChannel && currentUser) {
      setMessages([]);
      addListeners();
    }
    return () => removeListeners();
  }, [currentChannel, currentUser]);

  // used for running messages and typing notification listeners
  const addListeners = () => {
    addMessageListener();
    addTypingListener();
  };

  // responsible for removing all listeners
  const removeListeners = () => {
    connectedRef.off();
    listeners.forEach((listener) => {
      listener.ref.child(listener.id).off(listener.event);
    });
  };

  // used to help with gathering every listener data into the local state
  const addToListeners = (id, ref, event) => {
    const index = listeners.findIndex((listener) => {
      return (
        listener.id === id && listener.ref === ref && listener.event === event
      );
    });
    if (index === -1) {
      const newListener = { id, ref, event };
      setListeners(listeners.concat(newListener));
    }
  };

  // [MESSAGE LOADING AND DISPLAY SECTION]

  // listener respnsible for downloading current channel's messages from database and pushing then into the local state,
  // runs for each message present and while new ones are added
  const addMessageListener = () => {
    let loadedMessages = [];
    getMessagesRef()
      .child(currentChannel.id)
      .on("child_added", (snap) => {
        loadedMessages.push(snap.val());
        setMessages([...loadedMessages]);
        setMessagesLoading(false);
      });
    // collectiong listeners info into the local state
    addToListeners(currentChannel.id, getMessagesRef, "child_added");
  };

  // determines wether current message is supposed to be private or public
  const getMessagesRef = () => {
    return isPrivateChannel ? privateMessagesRef : messagesRef;
  };

  // responsible for rendering all messages in a given channel
  const displayMessages = (input) => {
    return input.map((message) => {
      return <Message key={message.timestamp} message={message} />;
    });
  };

  // [USERS TYPING INFO SECTION]

  // listener responsible for pushing typing records into the local state,
  // run each time any user starts or stops typing
  const addTypingListener = () => {
    let typingUsersArr = [];

    // run when someone starts typing
    typingRef.child(currentChannel.id).on("child_added", (snap) => {
      if (snap.key !== currentUser.uid) {
        typingUsersArr = typingUsersArr.concat({
          id: snap.key,
          name: snap.val()
        });
        setTypingUsers(typingUsersArr);
      }
    });
    // collectiong listeners info into the local state
    addToListeners(currentChannel.id, typingRef, "child_added");

    // run when someone stops typing
    typingRef.child(currentChannel.id).on("child_removed", (snap) => {
      const index = typingUsers.findIndex((user) => user.id === snap.key);

      if (index !== -1) {
        typingUsersArr = typingUsersArr.filter((user) => user.id !== snap.key);
        setTypingUsers(typingUsersArr);
      }
    });
    // collectiong listeners info into the local state
    addToListeners(currentChannel.id, typingRef, "child_removed");

    // run when currently typing user disconnects from the app
    connectedRef.on("value", (snap) => {
      if (snap.val() === true) {
        typingRef
          .child(currentChannel.id)
          .child(currentUser.uid)
          .onDisconnect()
          .remove((err) => {
            if (err !== null) {
              console.error(err);
            }
          });
      }
    });
  };

  // responsible for rendering typing users list
  const displayTypingUsers = () => {
    return (
      typingUsers > 0 &&
      typingUsers.map((user) => {
        return (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "0.2em"
            }}
            key={user.id}
          >
            <span className="user_typing">{user.name} is typing</span>{" "}
            <Typing />
          </div>
        );
      })
    );
  };

  // [CHANNEL INFO SECTION]

  // runs each time new messages are added
  useEffect(() => {
    countUniqueUsers();
    countUsersPosts();
    scrollToBottom();
  }, [messages]);

  // goes through all the channel's messages to determine how many unique users have posted a message
  const countUniqueUsers = () => {
    const uniqueUsers = messages.reduce((acc, message) => {
      if (!acc.includes(message.user.name)) {
        acc.push(message.user.name);
      }
      return acc;
    }, []);
    setUniquiUsersCount(uniqueUsers.length);
  };

  // counts how many times each user have posted in a given channel,
  // sends out the info into the global state (later to be used in channel's metadata)
  const countUsersPosts = () => {
    const userPosts = messages.reduce((acc, message) => {
      if (message.user.name in acc) {
        acc[message.user.name].count += 1;
      } else {
        acc[message.user.name] = {
          avatar: message.user.avatar,
          count: 1
        };
      }
      return acc;
    }, {});
    setUserPosts(userPosts);
  };

  // sets the scroll at the btton of the section each time a new message is added
  const scrollToBottom = () => {
    if (messages.length > 0) {
      // DOM node set up at the bottom of the messages section
      messagesEnd.current.scrollIntoView(false);
    }
  };

  // [MESAGE SEARCH SECTION]

  // run after each search term change - sets a new  value and changes the loading state
  const handleSearchTermChange = (event) => {
    setSearchTerm(event.target.value);
    setSearchLoading(true);
  };

  useEffect(() => {
    handleMeaasgeSerch();
  }, [searchTerm]);

  // goes throught the messages to filter out the ones compatible with a given search term
  // also sets the loading state to false after a delay
  const handleMeaasgeSerch = () => {
    const allMessages = [...messages];
    const regex = new RegExp(searchTerm, "gi");
    const filterdMessages = allMessages.reduce((acc, message) => {
      if (
        (message.content && message.content.match(regex)) ||
        message.user.name.match(regex)
      ) {
        acc.push(message);
      }
      return acc;
    }, []);
    setSearchResults(filterdMessages);
    setTimeout(() => {
      setSearchLoading(false);
    }, 1000);
  };

  // [RENDER SECTION]

  // returns a spinner somponent while messages are loading
  const displayMessagesLoading = () => {
    if (messagesLoading) {
      return <Spinner />;
    }
  };

  // component respinsible for rendering the message list
  return (
    <React.Fragment>
      <MessagesHeader
        uniqueUsers={uniqueUsersCount}
        handleSearchTermChange={handleSearchTermChange}
        searchLoading={searchLoading}
      />

      <Segment>
        <Comment.Group className="messages">
          {displayMessagesLoading()}
          {searchTerm
            ? displayMessages(searchResults)
            : displayMessages(messages)}
          {displayTypingUsers()}
          <div ref={messagesEnd}></div>
        </Comment.Group>
      </Segment>

      {/* passing prop dependant on the message privacy factor */}
      <MessageForm messagesRef={getMessagesRef} />
    </React.Fragment>
  );
};

export default Messages;
