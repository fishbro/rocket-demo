import * as THREE from "three";
import { Mesh } from "three";
import TweenServer from "../../misc/TweenServer";
import { RocketController } from "./RocketController";
import { EarthController } from "./EarthController";
import { AnimationController } from "./AnimationController";

const tweenServer = new TweenServer();

class SceneView {
    root: HTMLElement;
    scene: THREE.Scene = new THREE.Scene();
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    rocketController: RocketController;
    earthController: EarthController;
    animationController: AnimationController;
    gameMode: boolean = false;
    asteroids: Array<Mesh> = [];

    constructor(root: HTMLElement) {
        this.root = root;
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.01,
            100
        );
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });
        this.rocketController = new RocketController(this.camera);
        this.earthController = new EarthController();
        this.animationController = AnimationController.getInstance();
        this.root.appendChild(this.renderer.domElement);
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        window.addEventListener("resize", this.resizeFn);
    }

    async init() {
        this.camera.position.z = 1;
        // this.scene.background = new THREE.Color(0x000011);
        await this.rocketController.init().then(() => {
            this.scene.add(this.rocketController.container);
        });
        await this.earthController.init().then(() => {
            this.scene.add(this.earthController.container);
        });
        this.createLight();

        this.renderer.setAnimationLoop(this.animationController.animation);
        this.animationController.add(() => {
            this.renderer.render(this.scene, this.camera);
        });
        this.animationController.add(this.animation);
    }

    createLight() {
        let hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 1);
        hemiLight.color.setRGB(0.2, 0.52, 1);
        hemiLight.groundColor.setRGB(1, 0.78, 0.5);
        hemiLight.position.set(0, 50, 0);
        this.scene.add(hemiLight);

        const geometry = new THREE.BoxGeometry(0.05, 0.05, 0.05);
        const material = new THREE.MeshLambertMaterial({
            color: 0x00ff00,
            opacity: 0,
            transparent: true
        });

        const mesh = new THREE.Mesh(geometry, material);
        this.scene.add(mesh);

        let dirLight = new THREE.DirectionalLight(0xffffff, 1);
        dirLight.color.setRGB(1, 0.96, 0.9);
        dirLight.position.set(2, 2, 2);
        dirLight.position.multiplyScalar(1);
        dirLight.target = mesh;
        this.scene.add(dirLight);

        dirLight.castShadow = true;
        dirLight.shadow.mapSize.width = 1024;
        dirLight.shadow.mapSize.height = 1024;

        let d = 150;

        dirLight.shadow.camera.left = -d;
        dirLight.shadow.camera.right = d;
        dirLight.shadow.camera.top = d;
        dirLight.shadow.camera.bottom = -d;

        dirLight.shadow.camera.far = 2600;
        dirLight.shadow.bias = -0.0001;
    }

    resizeFn = () => {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    };

    startGame() {
        tweenServer.setTween(
            {
                camera_z: this.camera.position.z,
                camera_y: this.camera.position.y,
                earth_rotation: this.earthController.container.rotation.y,
                rocket_rotation: this.rocketController.container.rotation.y
            },
            {
                camera_z: 3,
                camera_y: 1,
                earth_rotation: 0,
                rocket_rotation: 0
            },
            1000,
            res => {
                this.camera.position.z = res.camera_z;
                this.camera.position.y = res.camera_y;
                this.earthController.container.rotation.y = res.earth_rotation;
                this.rocketController.container.rotation.y =
                    res.rocket_rotation;
            }
        );

        this.root.tabIndex = 0;
        this.root.focus();
        this.gameMode = true;
        this.animationController.add(this.gameLoop);
        this.root.addEventListener("mousedown", this.turnOn);
        this.root.addEventListener("mouseup", this.turnOff);
        this.root.addEventListener("keydown", this.turnOn);
        this.root.addEventListener("keyup", this.turnOff);
    }

    turnOn = () => {
        this.rocketController.flyUp();
    };

    turnOff = () => {
        this.rocketController.flyDown();
    };

    createAsteroid() {
        const geometry = new THREE.ConeGeometry(0.1, 0.1, 3);
        const material = new THREE.MeshPhongMaterial({
            color: 0x666666,
            opacity: 1,
            transparent: false
        });
        const asteroid = new THREE.Mesh(geometry, material);
        const angle = this.earthController.container.rotation.z;
        const x_coord = (Math.random() + 0.5) * 5;
        asteroid.position.x = x_coord * Math.cos(angle);
        asteroid.position.y = -x_coord * Math.sin(angle);
        asteroid.position.z = this.rocketController.container.position.z;

        this.asteroids.push(asteroid);
        this.earthController.container.add(asteroid);
    }

    removeAsteroids() {
        this.asteroids.forEach(asteroid => {
            const position = new THREE.Vector3();
            asteroid.getWorldPosition(position);
            if (position.x < 0 && position.y < -4.5) {
                this.earthController.container.remove(asteroid);
                this.asteroids.splice(this.asteroids.indexOf(asteroid), 1);
            }
        });
    }

    collisionDetection() {
        const rocket = this.rocketController.model;
        if (!rocket) return;
        const rocketPosition = new THREE.Vector3();
        rocket.getWorldPosition(rocketPosition);
        rocketPosition.x += 0.4;

        const earthPosition = new THREE.Vector3();
        this.earthController.container.getWorldPosition(earthPosition);
        if (rocketPosition.distanceTo(earthPosition) < 4) {
            this.gameOver();
        }

        this.asteroids.forEach(asteroid => {
            const asteroidPosition = new THREE.Vector3();
            asteroid.getWorldPosition(asteroidPosition);
            if (rocketPosition.distanceTo(asteroidPosition) < 0.2) {
                this.gameOver();
            }
        });
    }

    animation = (time: number) => {
        if (tweenServer.tweens.length > 0) {
            tweenServer.tweens.forEach(tween => {
                tween.update(time);
            });
        }

        if (this.earthController.container) {
            this.earthController.container.rotation.z =
                (time / 10000) % (Math.PI * 2);
        }
    };

    gameLoop = (time: number) => {
        if (time % 1000 > 950) {
            this.createAsteroid();
            this.removeAsteroids();
        }

        this.asteroids.forEach(asteroid => {
            asteroid.rotation.z = (time / 10000) * asteroid.position.x;
            asteroid.rotation.y = (time / 10000) * asteroid.position.x;
        });

        this.collisionDetection();
    };

    gameOver() {
        alert("Game Over");
        this.gameMode = false;
        this.animationController.rem(this.gameLoop);
        this.root.removeEventListener("mousedown", this.turnOn);
        this.root.removeEventListener("mouseup", this.turnOff);
        this.root.removeEventListener("keydown", this.turnOn);
        this.root.removeEventListener("keyup", this.turnOff);
        this.rocketController.stopGame();
        this.asteroids.forEach(asteroid => {
            this.earthController.container.remove(asteroid);
        });

        tweenServer.setTween(
            {
                camera_z: this.camera.position.z,
                camera_y: this.camera.position.y,
                earth_rotation: this.earthController.container.rotation.y,
                rocket_rotation: this.rocketController.container.rotation.y,
                rocket_y: this.rocketController.container.position.y
            },
            {
                camera_z: 1,
                camera_y: 0,
                earth_rotation: Math.PI / 6,
                rocket_rotation: Math.PI / 12,
                rocket_y: 0
            },
            1000,
            res => {
                this.camera.position.z = res.camera_z;
                this.camera.position.y = res.camera_y;
                this.earthController.container.rotation.y = res.earth_rotation;
                this.rocketController.container.rotation.y =
                    res.rocket_rotation;
                this.rocketController.container.position.y = res.rocket_y;
            }
        );
    }

    destroy() {
        window.removeEventListener("resize", this.resizeFn);
    }
}

export default SceneView;
