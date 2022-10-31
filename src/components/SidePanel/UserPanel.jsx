import React, { useEffect, useRef, useState } from "react";
import firebase from "../../firebase";
import {
  Button,
  Dropdown,
  Grid,
  Header,
  Icon,
  Image,
  Input,
  Modal
} from "semantic-ui-react";
import { useSelector } from "react-redux";
import AvatarEditor from "react-avatar-editor";

const UserPanel = () => {
  // local state
  const [modal, setModal] = useState(false);
  const [previewImage, setPreviewImage] = useState(false);
  const [croppedImage, setCroppedImage] = useState();
  const [blob, setBlob] = useState();
  const [uploadedCroppedImage, setUploadedCroppedImage] = useState(null);

  // local variable
  const metadata = {
    contentType: "image/jpeg"
  };

  // hook storing a DOM node
  const avatarEditor = useRef();

  // database location references
  const storageRef = firebase.storage().ref();
  const usersRef = firebase.database().ref(`users`);

  // redux global state
  const { currentUser } = useSelector((state) => state.user);

  // [USER DROPDOWN SECTION]

  // renders a dropdown list after clicking on a username
  const dropdownOptions = () => [
    {
      key: "avatar",
      text: <span onClick={() => setModal(!modal)}>Change Avatar</span>
    },
    {
      key: "signout",
      text: <span onClick={() => handleSignout()}>Sign Out</span>
    }
  ];

  // logs out the currently signed in user
  const handleSignout = () => {
    firebase.auth().signOut();
  };

  // [AVATAR CHANGE SECTION]

  // run after selecting a file into the input
  // pushes uploaded file into the local state
  const handleChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    if (file) {
      reader.readAsDataURL(file);
      reader.addEventListener("load", () => {
        setPreviewImage(reader.result);
      });
    }
  };

  // runs avaterEditor methods on currently selecter image
  // pushes cropped image and blob into local state
  const handleImageCrop = () => {
    if (avatarEditor) {
      avatarEditor.current.getImageScaledToCanvas().toBlob((blob) => {
        let imageURL = URL.createObjectURL(blob);
        setCroppedImage(imageURL);
        setBlob(blob);
      });
    }
  };

  // run after submitting croped image
  // pushes it into database storage and it's URL into the local state
  const uploadCroppedImage = () => {
    storageRef
      .child(`avatars/users/${currentUser.uid}`)
      .put(blob, metadata)
      .then((snap) =>
        snap.ref.getDownloadURL().then((downloadURL) => {
          setUploadedCroppedImage(downloadURL);
        })
      );
  };

  useEffect(() => {
    changeAvatar();
  }, [uploadedCroppedImage]);

  // run after cropped image URL changes
  // changes current user avatar in the database
  const changeAvatar = () => {
    if (uploadedCroppedImage) {
      firebase
        .auth()
        .currentUser.updateProfile({
          photoURL: uploadedCroppedImage
        })
        .then(setModal(!modal), setCroppedImage(null), setPreviewImage(null))
        .catch((err) => {
          console.error(err);
        });

      usersRef
        .child(currentUser.uid)
        .update({ avatar: uploadedCroppedImage })
        .catch((err) => {
          console.error(err);
        });
    }
  };

  // [RENDER SECTION]

  // component respinsible for rendering apps header and user options
  return (
    <Grid>
      <Grid.Column>
        <Grid.Row style={{ padding: "1em", margin: 0 }}>
          {/* app header */}
          <Header inverted as="h2">
            <Icon name="mail" />
            <Header.Content>MyChat</Header.Content>
          </Header>

          {/* UserDropdown */}
          <Header style={{ margin: 0 }} as="h4" inverted>
            <Dropdown
              trigger={
                <span>
                  <Image src={currentUser.photoURL} spaced="right" avatar />
                  {currentUser.displayName}
                </span>
              }
              options={dropdownOptions()}
            />
          </Header>
        </Grid.Row>

        {/* avatar change modal */}
        <Modal basic open={modal}>
          <Modal.Header>Change Avatar</Modal.Header>
          <Modal.Content>
            <Input
              onChange={(e) => handleChange(e)}
              fluid="true"
              type="file"
              label="New Avatar"
              name="previeImage"
            />
            <Grid centered stackable columns={2}>
              <Grid.Row centered>
                <Grid.Column className="ui center alighrd grid">
                  {previewImage && (
                    <AvatarEditor
                      image={previewImage}
                      ref={avatarEditor}
                      width={120}
                      height={120}
                      border={50}
                      scale={1.2}
                    />
                  )}
                </Grid.Column>
                <Grid.Column>
                  {croppedImage && (
                    <Image
                      style={{ margin: "3.5em auto" }}
                      width={100}
                      height={100}
                      src={croppedImage}
                    />
                  )}
                </Grid.Column>
              </Grid.Row>
            </Grid>
          </Modal.Content>
          <Modal.Actions>
            {croppedImage && (
              <Button
                color="green"
                inverted
                onClick={() => uploadCroppedImage()}
              >
                <Icon name="save" /> Change Avatar
              </Button>
            )}
            <Button color="green" inverted onClick={() => handleImageCrop()}>
              <Icon name="image" /> Preview
            </Button>
            <Button color="red" inverted onClick={() => setModal(!modal)}>
              <Icon name="remove" /> Cancel
            </Button>
          </Modal.Actions>
        </Modal>
      </Grid.Column>
    </Grid>
  );
};

export default UserPanel;
