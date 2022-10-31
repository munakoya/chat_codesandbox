import React, { useState } from "react";
import { Modal, Input, Button, Icon } from "semantic-ui-react";

const FileModal = ({ modal, setModal, uploadFile }) => {
  // local state
  const [file, setFile] = useState(null);

  // local variable
  const authorized = ["image/jpeg", "image/png"];

  // sets selected file into the local state
  const addFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
    }
  };

  // run after the selected file submision
  // passes the file along with it's metadata to the aprent component
  const sendFile = () => {
    if (file !== null) {
      if (isAuthorized(file.type)) {
        const metadata = { contentType: file.type };
        uploadFile(file, metadata);
        setModal(false);
        setFile(null);
      }
    }
  };

  // file type verification
  const isAuthorized = (fileType) => {
    return authorized.includes(fileType);
  };

  // component responsible for rendering a modal while user wants to send a ile as a message
  return (
    <Modal basic open={modal}>
      <Modal.Header>Select an image file...</Modal.Header>
      <Modal.Content>
        <Input
          onChange={(e) => addFile(e)}
          fluid
          label="File types: jpg, png"
          name="file"
          type="file"
        />
      </Modal.Content>
      <Modal.Actions>
        <Button onClick={() => sendFile()} color="green" inverted>
          <Icon name="checkmark" /> Send
        </Button>
        <Button onClick={() => setModal(false)} color="red" inverted>
          <Icon name="remove" /> Cancel
        </Button>
      </Modal.Actions>
    </Modal>
  );
};

export default FileModal;
