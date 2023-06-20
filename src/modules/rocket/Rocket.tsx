import React, { Component } from "react";
import SceneView from "./c/SceneView";

class Rocket extends Component {
    view: SceneView | null = null;
    rootElement: HTMLElement | null = null;
    loading: boolean = true;
    gameStarted: boolean = false;

    componentDidMount() {
        if (this.rootElement) {
            this.view = new SceneView(this.rootElement);
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
                ) : !this.gameStarted ? (
                    <div
                        className="button"
                        onClick={() => {
                            if (this.view) {
                                this.view.startGame();
                                this.gameStarted = true;
                                this.forceUpdate();
                            }
                        }}
                    >
                        Start Game
                    </div>
                ) : null}
            </div>
        );
    }
}

export default Rocket;
