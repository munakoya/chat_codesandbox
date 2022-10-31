import React, { useState } from "react";
import {
  Grid,
  Form,
  Segment,
  Button,
  Header,
  Message,
  Icon
} from "semantic-ui-react";
import { Link } from "react-router-dom";
import md5 from "md5";

import firebase from "../../firebase";

const Register = () => {
  // local state
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  // database reference
  const usersRef = firebase.database().ref("users");

  // run after submitting the registration form
  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors([]);
    if (isFormValid()) {
      setLoading(true);
      firebase
        .auth()
        .createUserWithEmailAndPassword(email, password)
        .then((createdUser) => {
          createdUser.user
            .updateProfile({
              displayName: username,
              photoURL: `http://gravatar.com/avatar/${md5(
                createdUser.user.email
              )}?d=identicon`
            })
            .then(() => {
              saveUser(createdUser).then(() => {
                setLoading(false);
              });
            })
            .catch((err) => {
              console.log(err);
              setErrors(errors.concat(err));
              setLoading(false);
            });
        })
        .catch((err) => {
          setErrors(errors.concat(err));
          setLoading(false);
        });
    }
  };

  // used for validating the registration form
  const isFormValid = () => {
    let errors = [];
    let error;

    // runs check if all the conditions are satisfied
    if (isFormEmpty(username, email, password, passwordConfirmation)) {
      error = { message: "Fill in all fields" };
      setErrors(errors.concat(error));
      return false;
    } else if (isPasswordValid(password, passwordConfirmation)) {
      error = { message: "Password is invalid" };
      setErrors(errors.concat(error));
      return false;
    } else {
      // form valid
      return true;
    }
  };

  // form condition check
  const isFormEmpty = (username, email, password, passwordConfirmation) => {
    return (
      !username.length ||
      !email.length ||
      !password.length ||
      !passwordConfirmation.length
    );
  };

  // length and password confirmation match check
  const isPasswordValid = (password, passwordConfirmation) => {
    if (password.length < 6 || passwordConfirmation.length < 6) {
      return true;
    } else if (password !== passwordConfirmation) {
      return true;
    } else {
      return false;
    }
  };

  // run after new user registration to save the data into the database
  const saveUser = (createdUser) => {
    return usersRef.child(createdUser.user.uid).set({
      name: createdUser.user.displayName,
      avatar: createdUser.user.photoURL
    });
  };

  // method used for highlighting input fields that are involved in an error
  const handleInputError = (inputName) => {
    return errors.some((error) =>
      error.message.toLowerCase().includes(inputName)
    )
      ? "error"
      : "";
  };

  // used for displaying errors if any are present
  const displayErrors = (errors) =>
    errors.map((error, i) => <p key={i}>{error.message}</p>);

  // component responsible for rendering the registration form
  return (
    <Grid textAlign="center" verticalAlign="middle" className="app">
      <Grid.Column style={{ maxWidth: 450 }}>
        <Header sa="h1" color="orange" textAlign="center">
          <Icon name="puzzle piece" color="orange" />
          Register for MyChat
        </Header>

        <Form onSubmit={(e) => handleSubmit(e)}>
          <Segment stacked>
            <Form.Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              fluid
              icon="user"
              iconPosition="left"
              placeholder="Username"
              type="text"
            ></Form.Input>

            <Form.Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fluid
              name="Email"
              icon="mail"
              iconPosition="left"
              placeholder="Email address"
              type="email"
              className={handleInputError("email")}
            ></Form.Input>

            <Form.Input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fluid
              icon="lock"
              iconPosition="left"
              placeholder="Password"
              type="password"
              className={handleInputError("password")}
            ></Form.Input>

            <Form.Input
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              fluid
              icon="repeat"
              iconPosition="left"
              placeholder="Password Confirmation"
              type="password"
              className={handleInputError("password")}
            ></Form.Input>

            <Button
              disabled={loading}
              className={loading ? "loading" : ""}
              color="orange"
              fluid
              size="large"
            >
              Submit
            </Button>
          </Segment>
        </Form>

        {errors.length > 0 && (
          <Message error>
            <h3>Error</h3>
            {displayErrors(errors)}
          </Message>
        )}

        <Message>
          Already a user? <Link to="/login"> Log In</Link>
        </Message>
      </Grid.Column>
    </Grid>
  );
};

export default Register;
