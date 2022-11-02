import firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";
import "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAsIjYroU6D4PGhJOJqfvv9gZYCo6jOSqI",
  databaseURL: "https://chat-76a84-default-rtdb.firebaseio.com/",
  authDomain: "chat-aacd7.firebaseapp.com",
  projectId: "chat-aacd7",
  storageBucket: "chat-aacd7.appspot.com",
  messagingSenderId: "740721597825",
  appId: "1:740721597825:web:5ce874c51626999ad51c80",
  measurementId: "G-ZB0QG6VP62",
};

firebase.initializeApp(firebaseConfig);

export default firebase;
