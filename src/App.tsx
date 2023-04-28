import React, { Component } from "react";
import "./assets/scss/app.scss";
import logo from "./assets/images/logo.svg";
import Rocket from "./modules/rocket/Rocket";

class App extends Component<any> {
    render() {
        return (
            <div className="App">
                <Rocket />
                <div className="logo">
                    <img src={logo} alt="Logo" />
                </div>
                <div className="message">Site under construction!</div>
            </div>
        );
    }
}

export default App;
