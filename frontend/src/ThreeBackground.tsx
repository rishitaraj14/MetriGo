import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const ThreeBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = window.innerWidth;
    const height = window.innerHeight;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x06060c, 0.035);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 12, 40);
    camera.lookAt(0, 3, 0);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // 3. Lights
    const ambientLight = new THREE.AmbientLight(0x0a0a1a, 1.2);
    scene.add(ambientLight);

    const blueLight = new THREE.DirectionalLight(0xbf5af2, 0.8); // Violet
    blueLight.position.set(-20, 40, -10);
    scene.add(blueLight);

    const warmLight = new THREE.DirectionalLight(0xff2d55, 0.4); // Pink
    warmLight.position.set(20, 20, 20);
    scene.add(warmLight);

    // 4. City Skyscrapers
    const buildingsGroup = new THREE.Group();
    scene.add(buildingsGroup);

    const buildingMaterials = [
      new THREE.MeshStandardMaterial({ color: 0x111122, roughness: 0.8, metalness: 0.2 }), // Dark Grey
      new THREE.MeshStandardMaterial({ color: 0x0a0a15, roughness: 0.9, metalness: 0.1 }), // Very Dark Blue
    ];

    // Windows Material (Glowing Amber and Pink)
    const windowGeo = new THREE.BoxGeometry(0.15, 0.15, 0.15);
    const yellowWindowMat = new THREE.MeshBasicMaterial({ color: 0xffb300 });
    const cyanWindowMat = new THREE.MeshBasicMaterial({ color: 0xff2d55 });

    const createBuilding = (x: number, z: number, bWidth: number, bHeight: number, bDepth: number) => {
      const bGeo = new THREE.BoxGeometry(bWidth, bHeight, bDepth);
      const bMat = buildingMaterials[Math.floor(Math.random() * buildingMaterials.length)];
      const building = new THREE.Mesh(bGeo, bMat);
      building.position.set(x, bHeight / 2 - 10, z); // Starts below viewport ground
      buildingsGroup.add(building);

      // Add small glowing window meshes scattered randomly on the side faces of the buildings
      // This matches the glowing city windows in the user's photo!
      const windowCount = Math.floor(bHeight * 2);
      for (let w = 0; w < windowCount; w++) {
        const winMat = Math.random() > 0.45 ? yellowWindowMat : cyanWindowMat;
        const windowMesh = new THREE.Mesh(windowGeo, winMat);
        
        // Random face selector (Left, Right, Front, Back)
        const face = Math.floor(Math.random() * 4);
        const winY = (Math.random() - 0.5) * (bHeight - 2) + (bHeight / 2 - 10);
        
        if (face === 0) { // Front face
          windowMesh.position.set(
            x + (Math.random() - 0.5) * (bWidth - 0.8),
            winY,
            z + bDepth / 2 + 0.05
          );
        } else if (face === 1) { // Back face
          windowMesh.position.set(
            x + (Math.random() - 0.5) * (bWidth - 0.8),
            winY,
            z - bDepth / 2 - 0.05
          );
        } else if (face === 2) { // Left face
          windowMesh.position.set(
            x - bWidth / 2 - 0.05,
            winY,
            z + (Math.random() - 0.5) * (bDepth - 0.8)
          );
        } else { // Right face
          windowMesh.position.set(
            x + bWidth / 2 + 0.05,
            winY,
            z + (Math.random() - 0.5) * (bDepth - 0.8)
          );
        }
        
        buildingsGroup.add(windowMesh);
      }
    };

    // Generate Skyscrapers grid surrounding the highways
    const buildingParams = [
      // Left side rows
      { x: -35, z: -40, w: 10, h: 45, d: 10 },
      { x: -22, z: -55, w: 12, h: 55, d: 12 },
      { x: -28, z: -20, w: 8, h: 30, d: 8 },
      { x: -32, z: 0, w: 12, h: 40, d: 10 },
      { x: -25, z: 25, w: 10, h: 35, d: 10 },
      
      // Right side rows
      { x: 30, z: -50, w: 14, h: 50, d: 14 },
      { x: 25, z: -25, w: 10, h: 45, d: 10 },
      { x: 35, z: -5, w: 12, h: 35, d: 12 },
      { x: 28, z: 15, w: 8, h: 30, d: 8 },
      { x: 32, z: 35, w: 14, h: 40, d: 12 },
      
      // Deep background center
      { x: -10, z: -70, w: 16, h: 65, d: 12 },
      { x: 10, z: -70, w: 14, h: 60, d: 14 },
    ];

    buildingParams.forEach(p => createBuilding(p.x, p.z, p.w, p.h, p.d));

    // 5. Curved Highways & Glowing Traffic Light Trails
    // We define bezier curves winding through the city skyscrapers representing elevated roads
    const curves: THREE.CatmullRomCurve3[] = [];
    
    // Left-to-right highway (Main curved elevated road)
    curves.push(new THREE.CatmullRomCurve3([
      new THREE.Vector3(-45, -2, -30),
      new THREE.Vector3(-25, 1, -15),
      new THREE.Vector3(-5, 0, 5),
      new THREE.Vector3(15, -2, 20),
      new THREE.Vector3(45, -4, 35)
    ]));

    // Right-to-left highway (Cross highway under or over the main one)
    curves.push(new THREE.CatmullRomCurve3([
      new THREE.Vector3(45, -4, -40),
      new THREE.Vector3(20, -1, -20),
      new THREE.Vector3(0, -3, 0),
      new THREE.Vector3(-20, -5, 15),
      new THREE.Vector3(-45, -6, 25)
    ]));

    // Highway roads styling (Grey flat paths drawn below trails)
    curves.forEach(curve => {
      const roadGeo = new THREE.TubeGeometry(curve, 64, 1.2, 8, false);
      const roadMat = new THREE.MeshStandardMaterial({ color: 0x1a1a24, roughness: 0.8 });
      const roadMesh = new THREE.Mesh(roadGeo, roadMat);
      scene.add(roadMesh);
    });

    // Light trails setup
    // Representing headlamps (Yellow/White) and taillamps (Red) moving along curves
    const trailCount = 80;
    const trails: {
      mesh: THREE.Mesh;
      curve: THREE.CatmullRomCurve3;
      speed: number;
      offset: number;
    }[] = [];

    const trailGeo = new THREE.BoxGeometry(1.8, 0.08, 0.08); // Sleek horizontal light lines
    const whiteTrailMat = new THREE.MeshBasicMaterial({ color: 0xfff2a3 }); // Headlights
    const redTrailMat = new THREE.MeshBasicMaterial({ color: 0xff3b30 });   // Taillights
    const blueTrailMat = new THREE.MeshBasicMaterial({ color: 0xbf5af2 });  // Electric/Cab lights

    for (let i = 0; i < trailCount; i++) {
      // Pick random highway curve
      const curve = curves[Math.floor(Math.random() * curves.length)];
      
      // Determine direction (speed sign) and color
      const isTaillight = Math.random() > 0.5;
      const mat = isTaillight 
        ? redTrailMat 
        : Math.random() > 0.8 
        ? blueTrailMat 
        : whiteTrailMat;

      const trailMesh = new THREE.Mesh(trailGeo, mat);
      scene.add(trailMesh);

      trails.push({
        mesh: trailMesh,
        curve: curve,
        speed: (0.05 + Math.random() * 0.08) * (isTaillight ? 1 : -1), // Reverse speeds for opposing lanes
        offset: Math.random() // Start at random point along highway
      });
    }

    // 6. Animation loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // 1. Animate camera slowly (swaying back and forth for floating feeling)
      camera.position.x = Math.sin(time * 0.1) * 6;
      camera.position.y = 12 + Math.cos(time * 0.15) * 2;
      camera.position.z = 40 + Math.sin(time * 0.08) * 3;
      camera.lookAt(0, 3, 0);

      // 2. Animate traffic light trails along the highway curves
      trails.forEach(trail => {
        // Increment offset along curve (wrapping around 0-1)
        trail.offset += trail.speed * delta;
        if (trail.offset > 1) trail.offset = 0;
        if (trail.offset < 0) trail.offset = 1;

        // Get coordinates along curve
        const pos = trail.curve.getPointAt(trail.offset);
        trail.mesh.position.copy(pos);

        // Orient light boxes to face the direction of highway flow
        const tangent = trail.curve.getTangentAt(trail.offset);
        const targetPos = pos.clone().add(tangent);
        trail.mesh.lookAt(targetPos);
      });

      // 3. Subtle rotation for skyscrapers
      buildingsGroup.rotation.y = time * 0.005;

      renderer.render(scene, camera);
    };

    animate();

    // 7. Handle window resize
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup WebGL contexts
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (renderer && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      trailGeo.dispose();
      whiteTrailMat.dispose();
      redTrailMat.dispose();
      blueTrailMat.dispose();
      windowGeo.dispose();
      yellowWindowMat.dispose();
      cyanWindowMat.dispose();
      buildingMaterials.forEach(m => m.dispose());
      scene.clear();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -2,
        pointerEvents: 'none',
        opacity: 0.45,
      }}
    />
  );
};
