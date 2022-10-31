import React from "react";
import moment from "moment";
import { useSelector } from "react-redux";
import { Comment, Image } from "semantic-ui-react";

const Message = ({ message }) => {
  // redux global state
  const { currentUser } = useSelector((state) => state.user);

  // message prop destructurization
  const { content, timestamp, user, image } = message;

  // checks if the given message is sent by the currently logged in user
  // changes it's style if it is
  const isOwnMessage = () => {
    return user.id === currentUser.uid ? "message_self" : "";
  };

  // calculates the timestamp for the message
  const timeFromNow = () => {
    return moment(timestamp).fromNow();
  };

  // verifies wether the message contains an image in order to adjist it's content
  const isImage = () => {
    return (
      message.hasOwnProperty("image") && !message.hasOwnProperty("content")
    );
  };

  // component respinsible for rendering a message
  return (
    <Comment>
      <Comment.Avatar src={user.avatar} />
      <Comment.Content className={isOwnMessage()}>
        <Comment.Author as="a">{user.name}</Comment.Author>
        <Comment.Metadata>{timeFromNow()}</Comment.Metadata>
        {isImage() ? (
          <Image src={image} className={"message_image"} />
        ) : (
          <Comment.Text>{content}</Comment.Text>
        )}
      </Comment.Content>
    </Comment>
  );
};

export default Message;
