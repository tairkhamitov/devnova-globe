declare module "three/examples/jsm/controls/OrbitControls" {
  import { Camera } from "three";
  import { EventDispatcher } from "three";
  import { WebGLRenderer } from "three";

  export class OrbitControls extends EventDispatcher {
    constructor(object: Camera, domElement?: HTMLElement);
    enabled: boolean;
    target: THREE.Vector3;
    minDistance: number;
    maxDistance: number;
    update(): void;
    dispose(): void;
  }
}