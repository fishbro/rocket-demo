import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Clock } from "three";
//@ts-ignore
import particleFire from "three-particle-fire";

particleFire.install({ THREE: THREE });

class RocketView {
    root: HTMLElement;
    clock: Clock = new Clock();
    textureLoader: THREE.TextureLoader = new THREE.TextureLoader();
    modelLoader: GLTFLoader = new GLTFLoader();
    scene: THREE.Scene = new THREE.Scene();
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    fireMesh: THREE.Points | null = null;
    rocket: THREE.Group = new THREE.Group();
    earth: THREE.Group = new THREE.Group();

    constructor(root: HTMLElement) {
        this.root = root;
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.01,
            100
        );
        this.renderer = new THREE.WebGLRenderer({
            antialias: true
        });
        this.root.appendChild(this.renderer.domElement);
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        window.addEventListener("resize", this.resizeFn);
    }

    async init() {
        this.camera.position.z = 1;
        this.scene.background = new THREE.Color(0x000011);

        await this.loadRocket();
        await this.createPlanet();
        this.createLight();
        this.renderer.setAnimationLoop(this.animation);
    }

    animation = (time: number) => {
        const delta = this.clock.getDelta();

        if (this.fireMesh)
            //@ts-ignore
            this.fireMesh.material.update(delta);

        if (this.rocket) {
            this.rocket.rotation.x = time / 2000;
        }

        if (this.earth) {
            // this.earth.rotation.y = (time / 30000) % (Math.PI * 2);
            this.earth.rotation.z = (time / 10000) % (Math.PI * 2);
        }

        this.renderer.render(this.scene, this.camera);
    };

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
        const fireMaterial = new particleFire.Material({ color: 0xff2200 });
        fireMaterial.setPerspective(this.camera.fov, options.height);
        this.fireMesh = new THREE.Points(fireGeometry, fireMaterial);
        this.fireMesh.rotation.z = Math.PI / 2;
        // this.fireMesh.position.x = -0.3;
        this.rocket.add(this.fireMesh);
    }

    createPlanet() {
        return this.textureLoader
            .loadAsync("/static/textures/earth.webp")
            .then(texture => {
                const geometry = new THREE.SphereGeometry(4, 64, 64);
                const material = new THREE.MeshPhongMaterial({
                    map: texture,
                    color: 0xffffff,
                    opacity: 1,
                    transparent: false
                });
                const earth = new THREE.Mesh(geometry, material);
                this.earth.add(earth);

                this.earth.position.y = -4.5;
                this.earth.rotation.y = Math.PI / 6;
                this.scene.add(this.earth);
            });
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
            const rocket = object;
            rocket.rotation.z = -Math.PI / 2;
            rocket.castShadow = true;
            rocket.receiveShadow = true;
            this.scene.add(this.rocket);

            this.rocket.position.x = -0.3;
            this.rocket.add(rocket);

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

    destroy() {
        window.removeEventListener("resize", this.resizeFn);
    }
}

export default RocketView;
