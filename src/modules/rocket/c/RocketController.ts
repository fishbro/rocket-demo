import * as THREE from "three";
import { THREEUtils } from "../../misc/THREEUtils";
//@ts-ignore
import particleFire from "three-particle-fire";
import { AnimationController } from "./AnimationController";

particleFire.install({ THREE: THREE });

export class RocketController {
    model: THREE.Group | null = null;
    container: THREE.Group = new THREE.Group();
    isFlying: boolean = false;
    flyVelocity: number = 0.015;
    currentFlyVelocity: number = 0.015;
    engine: THREE.Points<any, any> | null = null;

    constructor(private camera: THREE.PerspectiveCamera) {}

    init() {
        return this.loadRocket().then(() => {
            this.createFire(this.camera);
            this.engine = this.createFire(this.camera, { color: 0x0000ff });
            this.engine.visible = false;
            const animationController = AnimationController.getInstance();
            animationController.add(this.baseAnimation);

            return this.container;
        });
    }

    loadRocket() {
        return THREEUtils.loadGltf("/static/models/rocket.gltf").then(
            object => {
                this.model = object;
                this.model.rotation.z = -Math.PI / 2;
                this.model.castShadow = true;
                this.model.receiveShadow = true;
                // this.scene.add(this.container);

                this.container.position.x = -0.3;
                this.container.rotation.y = Math.PI / 12;
                this.container.add(this.model);
            }
        );
    }

    createFire(camera: THREE.PerspectiveCamera, _options?: any) {
        const options = {
            fireRadius: 0.025,
            fireHeight: 1,
            particleCount: 100,
            height: 200
        };
        const fireGeometry = new particleFire.Geometry(
            options.fireRadius,
            options.fireHeight,
            options.particleCount
        );
        const fireMaterial = new particleFire.Material({
            color: _options?.color || 0xff2200
        });
        fireMaterial.setPerspective(camera.fov, options.height);
        const fireMesh = new THREE.Points(fireGeometry, fireMaterial);
        fireMesh.rotation.z = Math.PI / 2;
        // fireMesh.position.x = -0.3;
        this.container.add(fireMesh);

        const animationController = AnimationController.getInstance();
        animationController.add((_time: number, delta: number) => {
            fireMesh.material.update(delta);
        });

        return fireMesh;
    }

    baseAnimation = (time: number, _delta: number) => {
        if (this.model) {
            this.model.rotation.x = time / 2000;
        }
    };

    flyUp = () => {
        if (!this.isFlying) {
            this.isFlying = true;
            if (this.engine) this.engine.visible = true;
        }
    };

    flyDown = () => {
        if (this.isFlying) {
            this.isFlying = false;
            if (this.engine) this.engine.visible = false;
        }
    };

    flyAnimation = (time: number, _delta: number) => {
        if (this.container) {
            this.container.position.y += this.currentFlyVelocity;
            this.container.rotation.z = this.currentFlyVelocity * 10;

            if (this.container.position.y > 2.3) {
                this.container.position.y = 2.3;
                this.currentFlyVelocity = 0;
            }
        }

        if (this.isFlying) {
            this.currentFlyVelocity +=
                this.currentFlyVelocity > this.flyVelocity ? 0 : 0.00015;
        } else {
            this.currentFlyVelocity -=
                this.currentFlyVelocity < this.flyVelocity * -2 ? 0 : 0.0002;
        }
    };

    startGame = () => {
        this.isFlying = false;
        this.currentFlyVelocity = this.flyVelocity;
        const animationController = AnimationController.getInstance();
        animationController.add(this.flyAnimation);
    };

    stopGame = () => {
        const animationController = AnimationController.getInstance();
        animationController.rem(this.flyAnimation);
        if (this.engine) this.engine.visible = false;
    };
}
