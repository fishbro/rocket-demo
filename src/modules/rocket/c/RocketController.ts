import * as THREE from "three";
import { THREEUtils } from "../../misc/THREEUtils";
//@ts-ignore
import particleFire from "three-particle-fire";
import { AnimationController } from "./AnimationController";

particleFire.install({ THREE: THREE });

export class RocketController {
    model: THREE.Group | null = null;
    container: THREE.Group = new THREE.Group();

    constructor(private camera: THREE.PerspectiveCamera) {}

    init() {
        return this.loadRocket().then(() => {
            this.createFire(this.camera);
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

    createFire(camera: THREE.PerspectiveCamera) {
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
            color: 0xff2200
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
    }

    baseAnimation = (time: number, _delta: number) => {
        if (this.model) {
            this.model.rotation.x = time / 2000;
        }
    };
}
