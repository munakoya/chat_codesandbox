import "emoji-mart/css/emoji-mart.css";

import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Segment, Button, Input } from "semantic-ui-react";
import { Picker, emojiIndex } from "emoji-mart";
import { v4 as uuidv4 } from "uuid";

import firebase from "../../firebase";
import FileModal from "./FileModal";
import ProgressBar from "./ProgressBar";

const MessagesForm = ({ messagesRef }) => {
  // local state
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [modal, setModal] = useState(false);
  const [uploadState, setUploadState] = useState("");
  const [percentageUploaded, setPercentageUploaded] = useState(0);
  const [emojiPicker, setEmojiPicker] = useState(false);

  // hook used to grab a DOM node
  const messageInput = useRef();

  // database location references
  const storageRef = firebase.storage().ref();
  const typingRef = firebase.database().ref("typing");
  // dependant on the passed prop
  const ref = messagesRef();

  // redux methods and state
  const { currentChannel, isPrivateChannel } = useSelector(
    (state) => state.channel
  );
  const { currentUser } = useSelector((state) => state.user);

  // [MESSAGE CREATION AND SENDING SECTION]

  // creates a message template using current user info from database
  // determines it's form basing on the presence of a media file
  const createMessage = (URL = null) => {
    const messageContents = {
      timestamp: firebase.database.ServerValue.TIMESTAMP,
      user: {
        id: currentUser.uid,
        name: currentUser.displayName,
        avatar: currentUser.photoURL
      }
    };
    if (URL !== null) {
      messageContents["image"] = URL;
    } else {
      messageContents["content"] = message;
    }

    return messageContents;
  };

  // sends out the message to the database
  // removes current user's typing record the the
  const sendMessage = () => {
    if (message) {
      setLoading(true);
      ref
        .child(currentChannel.id)
        .push()
        .set(createMessage())
        .then(() => {
          setLoading(false);
          typingRef.child(currentChannel.id).child(currentUser.uid).remove();
          setMessage("");
          setErrors([]);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
          setErrors(errors.concat(err));
        });
    } else {
      setErrors(errors.concat({ message: "Add a message" }));
    }
  };

  // allowas for sending the message after pressing "Enter"
  const handleKeyDown = (e) => {
    if (e.keyCode === 13) {
      sendMessage();
    }

    if (message) {
      typingRef
        .child(currentChannel.id)
        .child(currentUser.uid)
        .set(currentUser.displayName);
    } else {
      typingRef.child(currentChannel.id).child(currentUser.uid).remove();
    }
  };

  // [FILE UPLOAD SECTION]

  // determines the upload path basing on the privacy setup
  const getUploadPath = () => {
    if (isPrivateChannel) {
      return `chat/private/${currentChannel.id}`;
    } else {
      return "chat/public";
    }
  };

  // uploads file into the firebase storage
  // allows for file upload percentage to be tracked and pushed into the local state
  const uploadFile = (file, metadata) => {
    const filePath = `${getUploadPath()}/${uuidv4()}.jpg`;

    setUploadState("uploading");
    const uploadTask = storageRef.child(filePath).put(file, metadata);
    uploadTask.on(
      "state_changed",
      (snap) => {
        const percentageUpload = Math.round(
          (snap.bytesTransferred / snap.totalBytes) * 100
        );
        setPercentageUploaded(percentageUpload);
      },
      (error) => {
        setErrors(error.concat(error));
        setUploadState("error");
      },
      () => {
        // gets uploaded file from the storage and performs a callback on it
        uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
          sendFileMessage(downloadURL);
        });
      }
    );
  };

  // pushes a file mesage into the current channel's database location
  const sendFileMessage = (URL) => {
    ref
      .child(currentChannel.id)
      .push()
      .set(createMessage(URL))
      .then(setUploadState("done"))
      .catch((err) => {
        console.error(err);
        setErrors(errors.concat(err));
      });
  };

  // [EMOJI SECTION]

  // run after picking an amoji form the memu
  const handleEmojiPick = (emoji) => {
    const oldMessage = message;
    const newMessage = colonToUnicode(`${oldMessage} ${emoji.colons}`);
    setMessage(newMessage);
    setEmojiPicker(false);
    messageInput.current.focus();
  };

  // when passed an emoji from the picker replaces the text with an actual emojis
  const colonToUnicode = (message) => {
    return message.replace(/:[A-Za-z0-9_+-]+:/g, (x) => {
      x = x.replace(/:/g, "");
      let emoji = emojiIndex.emojis[x];
      if (typeof emoji !== "undefined") {
        let unicode = emoji.native;
        if (typeof unicode !== "undefined") {
          return unicode;
        }
      }
      x = ":" + x + ":";
      return x;
    });
  };

  // [RENDER SECTION]

  // component respinsible for rendering the message input form
  return (
    <Segment className="message__form">
      {emojiPicker && (
        <Picker
          set="apple"
          onSelect={(e) => handleEmojiPick(e)}
          className="emoji-picker"
          title="Pick an emoji"
          emoji="point_up"
        />
      )}
      <Input
        ref={messageInput}
        value={message}
        onChange={(e) => {
          setMessage(e.target.value);
        }}
        onKeyDown={(e) => handleKeyDown(e)}
        fluid="true"
        name="message"
        style={{ marginBottom: "0.7em" }}
        label={
          <Button
            icon={emojiPicker ? "close" : "add"}
            content={emojiPicker ? "Close" : null}
            onClick={() => setEmojiPicker(!emojiPicker)}
          />
        }
        labelPosition="left"
        placeholder="Write you message..."
        className={
          errors.some((error) => error.message.includes("message"))
            ? "error"
            : ""
        }
      />
      <Button.Group icon widths="2">
        <Button
          onClick={() => sendMessage()}
          disabled={loading}
          color="orange"
          content="Add Reply"
          labelPosition="left"
          icon="edit"
        />
        <Button
          onClick={() => setModal(true)}
          disabled={uploadState === "uploading"}
          color="teal"
          content="Media"
          labelPosition="right"
          icon="cloud upload"
        />
      </Button.Group>

      <FileModal modal={modal} setModal={setModal} uploadFile={uploadFile} />

      {/* progress bar present when uploading a file */}
      <ProgressBar
        uploadState={uploadState}
        percentageUploaded={percentageUploaded}
      />
    </Segment>
  );
};

export default MessagesForm;
