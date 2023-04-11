import React, { Component } from "react";
import "./assets/scss/app.scss";
import logo from "./assets/images/logo.svg";
import RocketView from "./modules/rocket/RocketView";

class App extends Component<any> {
    view: RocketView;
    rootElement: HTMLElement | null = null;
    loading: boolean = true;

    constructor(props: App) {
        super(props);
        this.view = new RocketView();
        this.view.init().then(() => {
            this.loading = false;
            this.forceUpdate();
        });
    }

    componentDidUpdate() {
        if (this.rootElement && !this.loading) {
            this.rootElement.appendChild(this.view.renderer.domElement);
        }
    }

    render() {
        return (
            <div className="App">
                <div className="rocket" ref={el => (this.rootElement = el)} />
                {this.loading ? (
                    <div className="loading">Loading...</div>
                ) : null}
                <div className="logo">
                    <img src={logo} alt="Logo" />
                </div>
                <div className="message">Site under construction!</div>
            </div>
        );
    }
}

export default App;
