import React, { Component } from "react";
import RocketView from "./RocketView";

class Rocket extends Component {
    view: RocketView | null = null;
    rootElement: HTMLElement | null = null;
    loading: boolean = true;

    componentDidMount() {
        console.log("App mounted");

        if (this.rootElement) {
            this.view = new RocketView(this.rootElement);
            this.view.init().then(() => {
                this.loading = false;
                this.forceUpdate();
            });
        }
    }
    render() {
        return (
            <div>
                <div className="rocket" ref={el => (this.rootElement = el)} />
                {this.loading ? (
                    <div className="loading">Loading...</div>
                ) : null}
            </div>
        );
    }
}

export default Rocket;
