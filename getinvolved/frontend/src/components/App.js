import { createRoot } from "react-dom/client";
import React, { Component } from "react";
import HomePage from "./HomePage";
import EventCreationPage from "./EventCreationPage";
import EventsPage from "./EventsPage";
import { BrowserRouter as Router, Routes, Route, Link, Redirect } from "react-router-dom";

export default class App extends Component {

 constructor(props) {
  super(props);
  }

  render() {
    return (
      <div>
         <Router>
            <Routes>
                <Route  path='/' Component={HomePage}/>
                <Route  path='/create-event' Component={EventCreationPage}/>
                <Route  path='/events' Component={EventsPage}/>
            </Routes>
        </Router>
      </div>
    );
  }
}



const appDiv = document.getElementById("app");
const root = createRoot(appDiv);
root.render(<App />);
