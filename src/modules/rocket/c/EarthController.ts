import { THREEUtils } from "../../misc/THREEUtils";
import * as THREE from "three";

export class EarthController {
    container: THREE.Group = new THREE.Group();

    init() {
        return this.createPlanet().then(() => {
            return this.container;
        });
    }

    createPlanet() {
        return THREEUtils.getInstance()
            .textureLoader.loadAsync("/static/textures/earth.webp")
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
                this.container.add(earth);

                const atmGeometry = new THREE.SphereGeometry(4.05, 64, 64);
                const atmMaterial = new THREE.MeshPhongMaterial({
                    color: 0xffffff,
                    opacity: 0.1,
                    transparent: true
                });
                const atm = new THREE.Mesh(atmGeometry, atmMaterial);
                this.container.add(atm);

                this.createStars();

                this.container.position.y = -4.5;
                this.container.rotation.y = Math.PI / 6;
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
            this.container.add(star);
        }
    }
}
