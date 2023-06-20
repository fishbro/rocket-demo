import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

export class THREEUtils {
    modelLoader: GLTFLoader = new GLTFLoader();
    textureLoader: THREE.TextureLoader = new THREE.TextureLoader();
    static loadGltf(url: string): Promise<THREE.Group> {
        return new Promise(resolve =>
            THREEUtils.getInstance().modelLoader.load(url, gltf => {
                const object = gltf.scene;
                resolve(object);
            })
        );
    }

    static instance: THREEUtils;

    static getInstance(): THREEUtils {
        if (!THREEUtils.instance) {
            THREEUtils.instance = new THREEUtils();
        }
        return THREEUtils.instance;
    }
}
