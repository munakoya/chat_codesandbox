import "semantic-ui-css/semantic.min.css";

import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  withRouter
} from "react-router-dom";
import { Provider, useSelector } from "react-redux";

import { store } from "./state";
import firebase from "./firebase";
import App from "./components/App";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import { useActions } from "./hooks/useActions";
import Spinner from "./components/Spinner";

const Root = (props) => {
  // redux global methods and state
  const { setUser, clearUser } = useActions();
  const { isLoading } = useSelector((state) => state.user);

  // determines wether there is a user logged ind and redirects accordingly
  useEffect(() => {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        props.history.push("/");
      } else {
        props.history.push("/login");
        clearUser();
      }
    });
  }, []);

  // react-router-dom path definitions
  return isLoading ? (
    <Spinner />
  ) : (
    <Switch>
      <Route exact path="/" component={App} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
    </Switch>
  );
};

// HOC used for passing "history" prop to the Root component
const RootWithAuth = withRouter(Root);

ReactDOM.render(
  <Provider store={store}>
    <Router>
      <RootWithAuth />
    </Router>
  </Provider>,
  document.getElementById("root")
);
