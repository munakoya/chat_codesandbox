import React, { useState } from "react";
import { useSelector } from "react-redux";
import {
  Segment,
  Accordion,
  Header,
  Icon,
  Image,
  List
} from "semantic-ui-react";

const MetaPanel = () => {
  // local index
  const [index, setIndex] = useState(0);

  // redux global state
  const { isPrivateChannel, currentChannel, userPosts } = useSelector(
    (state) => state.channel
  );

  // renders top 5 uers who posted messages in current channel
  const displayTopUsers = () => {
    return Object.entries(userPosts)
      .sort((a, b) => b[1] - a[1])
      .map(([key, val], i) => {
        return (
          <List.Item key={i}>
            <Image avatar src={val.avatar} />
            <List.Content>
              <List.Header as="a">{key}</List.Header>
              <List.Description>
                {val.count !== 1 ? `${val.count} posts` : `${val.count} post`}
              </List.Description>
            </List.Content>
          </List.Item>
        );
      })
      .slice(0, 5);
  };

  // component responsible for rendering metadata about the channel, if the channel is private no metabata is rendered
  if (isPrivateChannel) {
    return null;
  }
  return (
    <Segment loading={!currentChannel}>
      <Header as="h3" attached="top">
        About #{currentChannel && currentChannel.name}
      </Header>
      <Accordion styled attached="true">
        {/* channel details */}
        <Accordion.Title
          active={index === 0}
          index={0}
          onClick={() => setIndex(0)}
        >
          <Icon name="dropdown" />
          <Icon name="info" />
          Channel Details
        </Accordion.Title>
        <Accordion.Content active={index === 0}>
          {currentChannel && currentChannel.details}
        </Accordion.Content>

        {/* top cahnnel users */}
        <Accordion.Title
          active={index === 1}
          index={1}
          onClick={() => setIndex(1)}
        >
          <Icon name="dropdown" />
          <Icon name="user circle" />
          Top users
        </Accordion.Title>
        <Accordion.Content active={index === 1}>
          <List>{userPosts && displayTopUsers()}</List>
        </Accordion.Content>

        {/* channel creator */}
        <Accordion.Title
          active={index === 2}
          index={2}
          onClick={() => setIndex(2)}
        >
          <Icon name="dropdown" />
          <Icon name="pencil alternate" />
          Created by
        </Accordion.Title>
        <Accordion.Content active={index === 2}>
          <Header as="h3">
            {currentChannel && (
              <Image circular src={currentChannel.createdBy.avatar} />
            )}
            {currentChannel && currentChannel.createdBy.name}
          </Header>
        </Accordion.Content>
      </Accordion>
    </Segment>
  );
};

export default MetaPanel;
