import * as TWEEN from "@tweenjs/tween.js";

interface TweenObject {
    [key: string]: number;
}
class TweenServer {
    tweens: TWEEN.Tween<any>[] = [];

    setTween(
        from: TweenObject,
        to: TweenObject,
        duration: number,
        callback: (res: TweenObject) => void,
        startImmediately: boolean = true
    ) {
        const tween = new TWEEN.Tween(from, false)
            .to(to, duration)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onUpdate(coords => {
                callback(coords);
            })
            .onComplete(() => {
                this.tweens.splice(this.tweens.indexOf(tween), 1);
            });

        this.tweens.push(tween);
        if (startImmediately) {
            tween.start();
        }
        return tween;
    }
}

export default TweenServer;
