import React, { Component } from "react";
import "./assets/scss/app.scss";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
//@ts-ignore
import particleFire from "three-particle-fire";
import { Clock } from "three";
import logo from "./assets/images/logo.svg";

particleFire.install({ THREE: THREE });
const clock = new Clock();

class App extends Component<any> {
    rootElement: HTMLElement | null = null;
    initialised = false;

    componentDidMount() {
        const camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.01,
            100
        );
        camera.position.z = 1;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x000011);

        const loader = new GLTFLoader();
        let rocket: THREE.Group | null = null;
        loader.load("/static/models/rocket.gltf", gltf => {
            const object = (rocket = gltf.scene);
            object.rotation.z = -Math.PI / 2;
            object.position.x = -0.3;
            object.castShadow = true;
            object.receiveShadow = true;

            scene.add(object);
        });

        //FIRE
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
        fireMaterial.setPerspective(camera.fov, options.height);
        const fireMesh = new THREE.Points(fireGeometry, fireMaterial);
        fireMesh.rotation.z = Math.PI / 2;
        fireMesh.position.x = -0.3;
        scene.add(fireMesh);
        //FIRE

        const geometry = new THREE.BoxGeometry(0.05, 0.05, 0.05);
        const material = new THREE.MeshLambertMaterial({
            color: 0x00ff00,
            opacity: 0,
            transparent: true
        });

        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        // LIGHTS
        let hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 1);
        hemiLight.color.setRGB(0.2, 0.52, 1);
        hemiLight.groundColor.setRGB(1, 0.78, 0.5);
        hemiLight.position.set(0, 50, 0);
        scene.add(hemiLight);

        let dirLight = new THREE.DirectionalLight(0xffffff, 1);
        dirLight.color.setRGB(1, 0.96, 0.9);
        dirLight.position.set(2, 2, 2);
        dirLight.position.multiplyScalar(1);
        dirLight.target = mesh;
        scene.add(dirLight);

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

        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setAnimationLoop(animation);

        if (this.rootElement && !this.initialised) {
            this.initialised = true;
            this.rootElement.appendChild(renderer.domElement);
        }

        // animation
        function animation(time: number) {
            const delta = clock.getDelta();
            fireMesh.material.update(delta);

            if (rocket) {
                rocket.rotation.x = time / 2000;
            }

            renderer.render(scene, camera);
        }
    }

    render() {
        return (
            <div className="App">
                <div className="rocket" ref={el => (this.rootElement = el)} />
                <div className="logo">
                    <img src={logo} alt="Logo" />
                </div>
                <div className="message">Site under construction!</div>
            </div>
        );
    }
}

export default App;
