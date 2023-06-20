import { Clock } from "three";

export class AnimationController {
    clock: Clock = new Clock();
    animationCallbacks: Array<Function> = [];

    add(callback: Function) {
        this.animationCallbacks = [...this.animationCallbacks, callback];
    }

    rem(callback: Function) {
        this.animationCallbacks = this.animationCallbacks.filter(
            cb => cb !== callback
        );
    }

    animation = (time: number) => {
        const delta = this.clock.getDelta();
        this.animationCallbacks.forEach(cb => cb(time, delta));
    };

    static instance: AnimationController;

    static getInstance(): AnimationController {
        if (!AnimationController.instance) {
            AnimationController.instance = new AnimationController();
        }
        return AnimationController.instance;
    }
}
