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

import firebase from "../../firebase";

const Login = () => {
  // local state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  // run after submitting the signin form
  const handleSubmit = (e) => {
    e.preventDefault();
    if (isFormValid()) {
      setErrors([]);
      setLoading(true);
      firebase
        .auth()
        .signInWithEmailAndPassword(email, password)
        .then(() => {
          setLoading(false);
        })
        .catch((err) => {
          console.log(err);
          setErrors(errors.concat(err));
          setLoading(false);
        });
    }
  };

  // used for signin form validation
  const isFormValid = () => {
    return email && password;
  };

  // used for highlighting input fields that are involved in an error
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

  // component responsible for rendering the signin form
  return (
    <Grid textAlign="center" verticalAlign="middle" className="app">
      <Grid.Column style={{ maxWidth: 450 }}>
        <Header sa="h1" color="violet" textAlign="center">
          <Icon name="code branch" color="violet" />
          Login to MyChat
        </Header>

        <Form onSubmit={(e) => handleSubmit(e)}>
          <Segment stacked>
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

            <Button
              disabled={loading}
              className={loading ? "loading" : ""}
              color="violet"
              fluid
              size="large"
            >
              Log In
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
          Don't have an account? <Link to="/register"> Register</Link>
        </Message>
      </Grid.Column>
    </Grid>
  );
};

export default Login;
