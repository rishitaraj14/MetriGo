import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface ThreeCanvasProps {
  mode: 'auto' | 'cab' | 'public' | null;
}

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({ mode }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [speed, setSpeed] = useState<number>(1); // 1 = normal, 2 = fast, 0 = stopped

  useEffect(() => {
    if (!containerRef.current) return;

    // 1. Scene Setup
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0c0c16);
    scene.fog = new THREE.FogExp2(0x0c0c16, 0.08);

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    // Side angle view looking down at the vehicle
    camera.position.set(7, 5, 10);
    camera.lookAt(0, 1.2, 0);

    // 3. Renderer Setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = false;
    container.appendChild(renderer.domElement);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(10, 20, 10);
    dirLight.castShadow = false;
    scene.add(dirLight);

    const headlightLight = new THREE.SpotLight(0xffea00, 2, 15, Math.PI / 6, 0.5, 1);
    headlightLight.position.set(-1.8, 1.1, 0);
    headlightLight.target.position.set(-10, 0.5, 0);
    scene.add(headlightLight);
    scene.add(headlightLight.target);

    // 5. Environment (Road & Background elements)
    const roadGroup = new THREE.Group();
    scene.add(roadGroup);

    // Road surface
    const roadGeo = new THREE.PlaneGeometry(80, 6);
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x22222a, roughness: 0.8 });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.rotation.x = -Math.PI / 2;
    road.receiveShadow = false;
    roadGroup.add(road);

    // Road dash lines
    const lineGeo = new THREE.PlaneGeometry(2, 0.2);
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const roadLines: THREE.Mesh[] = [];

    for (let i = 0; i < 15; i++) {
      const line = new THREE.Mesh(lineGeo, lineMat);
      line.rotation.x = -Math.PI / 2;
      line.position.set(-30 + i * 5, 0.01, 0);
      roadGroup.add(line);
      roadLines.push(line);
    }

    // Side grass edges
    const grassGeo = new THREE.PlaneGeometry(80, 20);
    const grassMat = new THREE.MeshStandardMaterial({ color: 0x0a140a, roughness: 0.9 });
    const grassFar = new THREE.Mesh(grassGeo, grassMat);
    grassFar.rotation.x = -Math.PI / 2;
    grassFar.position.set(0, -0.05, -13);
    roadGroup.add(grassFar);

    const grassNear = new THREE.Mesh(grassGeo, grassMat);
    grassNear.rotation.x = -Math.PI / 2;
    grassNear.position.set(0, -0.05, 13);
    roadGroup.add(grassNear);

    // Animated scenery (Trees & Poles)
    const sceneryItems: { mesh: THREE.Group; type: string }[] = [];
    
    const createTree = (x: number, z: number) => {
      const tree = new THREE.Group();
      
      // Trunk
      const trunkGeo = new THREE.CylinderGeometry(0.15, 0.15, 1.2);
      const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5c4033 });
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = 0.6;
      tree.add(trunk);

      // Leaves
      const leavesGeo = new THREE.ConeGeometry(0.8, 2, 5);
      const leavesMat = new THREE.MeshStandardMaterial({ color: 0x2e8b57, flatShading: true });
      const leaves = new THREE.Mesh(leavesGeo, leavesMat);
      leaves.position.y = 1.8;
      tree.add(leaves);

      tree.position.set(x, 0, z);
      scene.add(tree);
      sceneryItems.push({ mesh: tree, type: 'tree' });
    };

    // Spawn initial trees
    for (let i = 0; i < 8; i++) {
      createTree(-25 + i * 8, -5 - Math.random() * 3);
      createTree(-21 + i * 8, 5 + Math.random() * 3);
    }

    // 6. Creating Vehicle Mesh programmatically (Low-poly)
    const vehicleGroup = new THREE.Group();
    scene.add(vehicleGroup);

    let wheels: THREE.Mesh[] = [];

    const buildAutoRickshaw = () => {
      // Clear previous vehicle
      while(vehicleGroup.children.length > 0){
        vehicleGroup.remove(vehicleGroup.children[0]);
      }
      wheels = [];

      // Base/Chassis
      const baseGeo = new THREE.BoxGeometry(2.4, 0.3, 1.2);
      const baseMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.5 });
      const base = new THREE.Mesh(baseGeo, baseMat);
      base.position.y = 0.55;
      base.castShadow = false;
      vehicleGroup.add(base);

      // Yellow canopy/top
      const topGeo = new THREE.BoxGeometry(1.6, 1.1, 1.15);
      const topMat = new THREE.MeshStandardMaterial({ color: 0xffcc00, roughness: 0.3 }); // Rickshaw Gold
      const topMesh = new THREE.Mesh(topGeo, topMat);
      topMesh.position.set(0.2, 1.2, 0);
      topMesh.castShadow = false;
      vehicleGroup.add(topMesh);

      // Front driver cabin (Black)
      const cabinGeo = new THREE.BoxGeometry(0.8, 0.9, 1.15);
      const cabinMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.5 });
      const cabin = new THREE.Mesh(cabinGeo, cabinMat);
      cabin.position.set(-0.8, 1.0, 0);
      cabin.castShadow = true;
      vehicleGroup.add(cabin);

      // Windshield
      const glassGeo = new THREE.BoxGeometry(0.1, 0.6, 1.0);
      const glassMat = new THREE.MeshStandardMaterial({ color: 0x88ccff, transparent: true, opacity: 0.6 });
      const glass = new THREE.Mesh(glassGeo, glassMat);
      glass.position.set(-1.21, 1.1, 0);
      vehicleGroup.add(glass);

      // Wheels
      const wheelGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.25, 12);
      const wheelMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.9 });

      // Back wheels (left & right)
      const wheelBL = new THREE.Mesh(wheelGeo, wheelMat);
      wheelBL.rotation.x = Math.PI / 2;
      wheelBL.position.set(0.6, 0.35, 0.6);
      wheelBL.castShadow = true;
      vehicleGroup.add(wheelBL);
      wheels.push(wheelBL);

      const wheelBR = new THREE.Mesh(wheelGeo, wheelMat);
      wheelBR.rotation.x = Math.PI / 2;
      wheelBR.position.set(0.6, 0.35, -0.6);
      wheelBR.castShadow = true;
      vehicleGroup.add(wheelBR);
      wheels.push(wheelBR);

      // Front wheel (centered)
      const wheelF = new THREE.Mesh(wheelGeo, wheelMat);
      wheelF.rotation.x = Math.PI / 2;
      wheelF.position.set(-0.8, 0.35, 0);
      wheelF.castShadow = true;
      vehicleGroup.add(wheelF);
      wheels.push(wheelF);
    };

    const buildCab = () => {
      // Clear previous vehicle
      while(vehicleGroup.children.length > 0){
        vehicleGroup.remove(vehicleGroup.children[0]);
      }
      wheels = [];

      // Car body bottom (Cyan/Blue)
      const baseGeo = new THREE.BoxGeometry(2.8, 0.5, 1.3);
      const baseMat = new THREE.MeshStandardMaterial({ color: 0x4facfe, roughness: 0.2 });
      const base = new THREE.Mesh(baseGeo, baseMat);
      base.position.y = 0.65;
      base.castShadow = true;
      vehicleGroup.add(base);

      // Car cabin top
      const topGeo = new THREE.BoxGeometry(1.6, 0.6, 1.25);
      const topMat = new THREE.MeshStandardMaterial({ color: 0x11111d, roughness: 0.4 });
      const topMesh = new THREE.Mesh(topGeo, topMat);
      topMesh.position.set(-0.1, 1.15, 0);
      topMesh.castShadow = true;
      vehicleGroup.add(topMesh);

      // Windows
      const glassGeo = new THREE.BoxGeometry(1.4, 0.45, 1.26);
      const glassMat = new THREE.MeshStandardMaterial({ color: 0x88ccff, transparent: true, opacity: 0.5 });
      const glass = new THREE.Mesh(glassGeo, glassMat);
      glass.position.set(-0.1, 1.15, 0);
      vehicleGroup.add(glass);

      // Wheels
      const wheelGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.25, 12);
      const wheelMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.9 });

      const positions = [
        [-0.8, 0.35, 0.65],
        [-0.8, 0.35, -0.65],
        [0.8, 0.35, 0.65],
        [0.8, 0.35, -0.65]
      ];

      positions.forEach(([x, y, z]) => {
        const wheel = new THREE.Mesh(wheelGeo, wheelMat);
        wheel.rotation.x = Math.PI / 2;
        wheel.position.set(x, y, z);
        wheel.castShadow = true;
        vehicleGroup.add(wheel);
        wheels.push(wheel);
      });
    };

    // Render corresponding vehicle based on selection
    if (mode === 'cab') {
      buildCab();
      headlightLight.color.setHex(0xe0f2fe);
    } else {
      buildAutoRickshaw();
      headlightLight.color.setHex(0xffea00);
    }

    // 7. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const currentSpeed = speed * (mode === 'cab' ? 22 : 14); // Cab is faster than auto

      // 1. Move Road Lines (infinite loop effect)
      roadLines.forEach(line => {
        line.position.x -= currentSpeed * delta;
        if (line.position.x < -30) {
          line.position.x += 75; // Recycle back to start of road visibility
        }
      });

      // 2. Move Scenery (infinite loop effect)
      sceneryItems.forEach(item => {
        item.mesh.position.x -= currentSpeed * delta;
        if (item.mesh.position.x < -35) {
          item.mesh.position.x = 35 + Math.random() * 5;
        }
      });

      // 3. Rotate Wheels
      wheels.forEach(wheel => {
        wheel.rotation.y -= currentSpeed * 1.8 * delta;
      });

      // 4. Subtle vibrating/bumping motion for vehicle to represent road physics
      const time = clock.getElapsedTime();
      const vibration = Math.sin(time * (mode === 'cab' ? 15 : 28)) * (mode === 'cab' ? 0.015 : 0.035);
      vehicleGroup.position.y = vibration;

      // 5. Swaying tilt as if hitting micro-bumps
      vehicleGroup.rotation.z = Math.sin(time * 8) * (mode === 'cab' ? 0.005 : 0.015);

      renderer.render(scene, camera);
    };

    animate();

    // 8. Window resizing handler
    const handleResize = () => {
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (renderer && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      scene.clear();
    };
  }, [mode, speed]);

  return (
    <div className="canvas-container" ref={containerRef}>
      <div className="canvas-overlay">
        <h4>MetriGo Drive 3D</h4>
        <span>
          {mode === 'cab' ? 'Cab Cruiser' : mode === 'public' ? 'Public Transit' : 'Yellow Rickshaw'} Simulation
        </span>
      </div>

      <div className="canvas-controls">
        <button
          className="canvas-btn"
          style={{ borderColor: speed === 0 ? 'var(--accent-red)' : '' }}
          onClick={() => setSpeed(0)}
        >
          Stop
        </button>
        <button
          className="canvas-btn"
          style={{ borderColor: speed === 1 ? 'var(--accent-cyan)' : '' }}
          onClick={() => setSpeed(1)}
        >
          Cruise
        </button>
        <button
          className="canvas-btn"
          style={{ borderColor: speed === 2 ? 'var(--accent-cyan)' : '' }}
          onClick={() => setSpeed(2)}
        >
          Turbo
        </button>
      </div>
    </div>
  );
};
