import firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";
import "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAmDrYnojzBtZAMUsR6-iT0nCqyyzBbpXk",
  databaseURL: "https://chat-76a84-default-rtdb.firebaseio.com/",
  authDomain: "chat-76a84.firebaseapp.com",
  projectId: "chat-76a84",
  storageBucket: "chat-76a84.appspot.com",
  messagingSenderId: "626783339794",
  appId: "1:626783339794:web:efb24ee5d526d8ce04dfcb",
  measurementId: "G-LKS5KM6SEE"
};

firebase.initializeApp(firebaseConfig);

export default firebase;
