import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Clock, Mesh } from "three";
//@ts-ignore
import particleFire from "three-particle-fire";
import TweenServer from "../misc/TweenServer";

particleFire.install({ THREE: THREE });
const tweenServer = new TweenServer();

class RocketView {
    root: HTMLElement;
    clock: Clock = new Clock();
    textureLoader: THREE.TextureLoader = new THREE.TextureLoader();
    modelLoader: GLTFLoader = new GLTFLoader();
    scene: THREE.Scene = new THREE.Scene();
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    fireMesh: THREE.Points | null = null;
    rocket: THREE.Group | null = null;
    rocketContainer: THREE.Group = new THREE.Group();
    earthContainer: THREE.Group = new THREE.Group();
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
        this.root.appendChild(this.renderer.domElement);
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        window.addEventListener("resize", this.resizeFn);
    }

    async init() {
        this.camera.position.z = 1;
        // this.scene.background = new THREE.Color(0x000011);

        await this.loadRocket();
        await this.createPlanet();
        this.createLight();
        this.renderer.setAnimationLoop(this.animation);
    }

    createFire() {
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
        fireMaterial.setPerspective(this.camera.fov, options.height);
        this.fireMesh = new THREE.Points(fireGeometry, fireMaterial);
        this.fireMesh.rotation.z = Math.PI / 2;
        // this.fireMesh.position.x = -0.3;
        this.rocketContainer.add(this.fireMesh);
    }

    createPlanet() {
        return this.textureLoader
            .loadAsync("/static/textures/earth.webp")
            .then(texture => {
                const earthGeometry = new THREE.SphereGeometry(4, 64, 64);
                texture.anisotropy = 16;
                const earthMaterial = new THREE.MeshPhongMaterial({
                    map: texture,
                    color: 0xffffff,
                    opacity: 1,
                    transparent: false
                });
                const earth = new THREE.Mesh(earthGeometry, earthMaterial);
                this.earthContainer.add(earth);

                const atmGeometry = new THREE.SphereGeometry(4.05, 64, 64);
                const atmMaterial = new THREE.MeshPhongMaterial({
                    color: 0xffffff,
                    opacity: 0.1,
                    transparent: true
                });
                const atm = new THREE.Mesh(atmGeometry, atmMaterial);
                this.earthContainer.add(atm);

                this.createStars();

                this.earthContainer.position.y = -4.5;
                this.earthContainer.rotation.y = Math.PI / 6;

                this.scene.add(this.earthContainer);
            });
    }

    createStars() {
        for (let i = 0; i < 1000; i++) {
            const geometry = new THREE.PlaneGeometry(0.01, 0.01, 1);
            const material = new THREE.MeshBasicMaterial({
                color: 0xffffff,
                opacity: 1,
                transparent: false
            });
            const star = new THREE.Mesh(geometry, material);
            star.position.x = (Math.random() - 0.5) * 15;
            star.position.y = (Math.random() - 0.5) * 15;
            star.position.z = (Math.random() - 0.5) * 15;
            this.earthContainer.add(star);
        }
    }

    loadGltf(url: string): Promise<THREE.Group> {
        return new Promise(resolve =>
            this.modelLoader.load(url, gltf => {
                const object = gltf.scene;
                resolve(object);
            })
        );
    }

    loadRocket() {
        return this.loadGltf("/static/models/rocket.gltf").then(object => {
            this.rocket = object;
            this.rocket.rotation.z = -Math.PI / 2;
            this.rocket.castShadow = true;
            this.rocket.receiveShadow = true;
            this.scene.add(this.rocketContainer);

            this.rocketContainer.position.x = -0.3;
            this.rocketContainer.rotation.y = Math.PI / 12;
            this.rocketContainer.add(this.rocket);

            this.createFire();
        });
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
                earth_rotation: this.earthContainer.rotation.y,
                rocket_rotation: this.rocketContainer.rotation.y
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
                this.earthContainer.rotation.y = res.earth_rotation;
                this.rocketContainer.rotation.y = res.rocket_rotation;
            }
        );

        this.gameMode = true;
        this.root.addEventListener("mousemove", this.onMouseMove);
    }

    onMouseMove = (e: MouseEvent) => {
        if (this.gameMode) {
            const [maxX, minX, maxY, minY] = [3, -3, 2, 0];
            const x = e.clientX / window.innerWidth;
            const y = e.clientY / window.innerHeight;
            this.rocketContainer.position.x = minX + (maxX - minX) * x;
            this.rocketContainer.position.y = minY + (maxY - minY) * y * -1 + 2;
            this.rocketContainer.rotation.z =
                (this.rocketContainer.position.x * -Math.PI) / 16;
        }
    };

    createAsteroid() {
        const geometry = new THREE.ConeGeometry(0.1, 0.1, 3);
        const material = new THREE.MeshPhongMaterial({
            color: 0x666666,
            opacity: 1,
            transparent: false
        });
        const asteroid = new THREE.Mesh(geometry, material);
        const angle = this.earthContainer.rotation.z;
        const x_coord = (Math.random() + 0.5) * 5;
        asteroid.position.x = x_coord * Math.cos(angle);
        asteroid.position.y = -x_coord * Math.sin(angle);
        asteroid.position.z = this.rocketContainer.position.z;

        this.asteroids.push(asteroid);
        this.earthContainer.add(asteroid);
    }

    removeAsteroids() {
        this.asteroids.forEach(asteroid => {
            const position = new THREE.Vector3();
            asteroid.getWorldPosition(position);
            if (position.x < 0 && position.y < -4.5) {
                this.earthContainer.remove(asteroid);
                this.asteroids.splice(this.asteroids.indexOf(asteroid), 1);
            }
        });
    }

    animation = (time: number) => {
        const delta = this.clock.getDelta();
        if (tweenServer.tweens.length > 0) {
            tweenServer.tweens.forEach(tween => {
                tween.update(time);
            });
        }

        if (this.fireMesh)
            //@ts-ignore
            this.fireMesh.material.update(delta);

        if (this.rocket) {
            this.rocket.rotation.x = time / 2000;
        }

        if (this.earthContainer) {
            this.earthContainer.rotation.z = (time / 10000) % (Math.PI * 2);
        }

        if (this.gameMode) {
            if (time % 1000 > 950) {
                this.createAsteroid();
                this.removeAsteroids();
            }

            this.asteroids.forEach(asteroid => {
                asteroid.rotation.z = (time / 10000) * asteroid.position.x;
                asteroid.rotation.y = (time / 10000) * asteroid.position.x;
            });
        }

        this.renderer.render(this.scene, this.camera);
    };

    destroy() {
        window.removeEventListener("resize", this.resizeFn);
    }
}

export default RocketView;
