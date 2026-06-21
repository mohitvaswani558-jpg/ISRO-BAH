import { useEffect, useRef } from "react";
import * as THREE from "three";

/** Futuristic holographic Earth — wireframe + glowing atmosphere + orbiting satellites. */
export function Globe3D({ className = "", size = 320 }: { className?: string; size?: number }) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current!;
    const width = mount.offsetWidth || size;
    const height = mount.offsetHeight || size;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 3.4;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(width, height);
    mount.appendChild(renderer.domElement);

    const earth = new THREE.Group();
    scene.add(earth);

    // Solid glowing core
    const core = new THREE.Mesh(
      new THREE.SphereGeometry(1, 48, 48),
      new THREE.MeshPhongMaterial({
        color: new THREE.Color("#0b3a66"),
        emissive: new THREE.Color("#082338"),
        shininess: 40,
        transparent: true,
        opacity: 0.92,
      })
    );
    earth.add(core);

    // Lat/long wireframe (cyan holographic)
    const wire = new THREE.Mesh(
      new THREE.SphereGeometry(1.005, 36, 24),
      new THREE.MeshBasicMaterial({ color: new THREE.Color("#22d3ee"), wireframe: true, transparent: true, opacity: 0.45 })
    );
    earth.add(wire);

    // Atmosphere glow shell
    const atmo = new THREE.Mesh(
      new THREE.SphereGeometry(1.18, 48, 48),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color("#38bdf8"),
        transparent: true,
        opacity: 0.12,
        side: THREE.BackSide,
      })
    );
    earth.add(atmo);

    // India marker dot (approx lon/lat)
    const marker = new THREE.Mesh(
      new THREE.SphereGeometry(0.03, 16, 16),
      new THREE.MeshBasicMaterial({ color: new THREE.Color("#facc15") })
    );
    const llToVec = (lon: number, lat: number, r = 1.02) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
    };
    const indiaPos = llToVec(78.96, 20.59);
    marker.position.copy(indiaPos);
    earth.add(marker);

    // pulse ring around india
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.06, 0.085, 32),
      new THREE.MeshBasicMaterial({ color: new THREE.Color("#facc15"), transparent: true, opacity: 0.7, side: THREE.DoubleSide })
    );
    ring.position.copy(indiaPos);
    ring.lookAt(0, 0, 0);
    earth.add(ring);

    // Orbiting satellites
    const sats: { mesh: THREE.Mesh; orbit: THREE.Group }[] = [];
    for (let i = 0; i < 3; i++) {
      const orbit = new THREE.Group();
      orbit.rotation.x = Math.random() * Math.PI;
      orbit.rotation.z = Math.random() * Math.PI;
      const sat = new THREE.Mesh(
        new THREE.SphereGeometry(0.025, 12, 12),
        new THREE.MeshBasicMaterial({ color: new THREE.Color("#a5f3fc") })
      );
      const trail = new THREE.Mesh(
        new THREE.RingGeometry(0.028, 0.05, 24),
        new THREE.MeshBasicMaterial({ color: new THREE.Color("#22d3ee"), transparent: true, opacity: 0.4, side: THREE.DoubleSide })
      );
      sat.position.set(1.35 + i * 0.08, 0, 0);
      trail.position.copy(sat.position);
      trail.lookAt(0, 0, 0);
      orbit.add(sat); orbit.add(trail);
      earth.add(orbit);
      sats.push({ mesh: sat, orbit });
    }

    // Stars
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(200 * 3);
    for (let i = 0; i < 200; i++) {
      starPos[i * 3] = (Math.random() - 0.5) * 14;
      starPos[i * 3 + 1] = (Math.random() - 0.5) * 14;
      starPos[i * 3 + 2] = (Math.random() - 0.5) * 14;
    }
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: new THREE.Color("#bae6fd"), size: 0.03, transparent: true, opacity: 0.7 })));

    const light = new THREE.DirectionalLight(0xffffff, 1.1);
    light.position.set(5, 3, 5);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x88c4ff, 0.6));

    let raf = 0;
    let t = 0;
    const animate = () => {
      t += 0.01;
      earth.rotation.y += 0.0028;
      sats.forEach((s, i) => { s.orbit.rotation.y += 0.006 + i * 0.001; });
      const pulse = 1 + Math.sin(t * 3) * 0.4;
      ring.scale.set(pulse, pulse, pulse);
      (ring.material as THREE.MeshBasicMaterial).opacity = 0.7 - Math.sin(t * 3) * 0.4;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    animate();

    const onResize = () => {
      const w = mount.offsetWidth || size, h = mount.offsetHeight || size;
      camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
      scene.traverse((o) => { if ((o as THREE.Mesh).geometry) (o as THREE.Mesh).geometry.dispose(); });
    };
  }, [size]);

  return (
    <div className={className} style={{ width: size, height: size }}>
      <div ref={mountRef} className="h-full w-full" />
    </div>
  );
}
