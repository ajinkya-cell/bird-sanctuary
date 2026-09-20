"use client";

import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { MotionValue } from "framer-motion";

interface WaterRippleCanvasProps {
  imageSrc: string;
  progress?: MotionValue<number>;
  className?: string;
  rippleIntensity?: number;
}

interface RippleDrop {
  x: number;
  y: number;
  spawnTime: number;
  intensity: number;
}

const MAX_DROPS = 8;

export default function WaterRippleCanvas({
  imageSrc,
  progress,
  className = "",
  rippleIntensity = 0.016,
}: WaterRippleCanvasProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const isSceneActiveRef = useRef(true);

  // Monitor scene progress to pause WebGL rendering loop when scrolled past Scene 1
  useEffect(() => {
    if (!progress) return;
    const unsub = progress.on("change", (v) => {
      isSceneActiveRef.current = v < 0.18;
    });
    return () => unsub();
  }, [progress]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    // 1. Scene & Orthographic Camera Setup
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    camera.position.z = 1;

    // 2. WebGL Renderer with calibrated premultiplied alpha compositing
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      premultipliedAlpha: true,
      powerPreference: "high-performance",
      precision: "highp",
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.position = "absolute";
    renderer.domElement.style.top = "0";
    renderer.domElement.style.left = "0";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    container.appendChild(renderer.domElement);

    // 3. Drops Management & Uniforms
    let activeDrops: RippleDrop[] = [];
    const dropsArray = new Float32Array(MAX_DROPS * 4); // [x, y, spawnTime, intensity]
    let time = 0;

    const textureLoader = new THREE.TextureLoader();
    const uniforms = {
      uTexture: { value: null as THREE.Texture | null },
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(width, height) },
      uImageResolution: { value: new THREE.Vector2(1919, 1080) },
      uDrops: { value: dropsArray },
      uActiveDrops: { value: 0 },
      uRippleIntensity: { value: rippleIntensity },
    };

    const texture = textureLoader.load(imageSrc, (loadedTex) => {
      loadedTex.colorSpace = THREE.SRGBColorSpace;
      loadedTex.magFilter = THREE.LinearFilter;
      loadedTex.minFilter = THREE.LinearMipmapLinearFilter;
      loadedTex.wrapS = THREE.ClampToEdgeWrapping;
      loadedTex.wrapT = THREE.ClampToEdgeWrapping;
      loadedTex.generateMipmaps = true;
      loadedTex.premultiplyAlpha = false;
      loadedTex.needsUpdate = true;

      if (loadedTex.image) {
        uniforms.uImageResolution.value.set(
          loadedTex.image.width || 1920,
          loadedTex.image.height || 1080
        );
      }
      uniforms.uTexture.value = loadedTex;
    });

    // 4. Custom Vertex & Fragment Shaders (Click-Only Expanding Wave Packets)
    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position.xy, 0.0, 1.0);
      }
    `;

    const fragmentShader = `
      uniform sampler2D uTexture;
      uniform float uTime;
      uniform vec2 uResolution;
      uniform vec2 uImageResolution;
      uniform vec4 uDrops[${MAX_DROPS}];
      uniform int uActiveDrops;
      uniform float uRippleIntensity;
      varying vec2 vUv;

      // Aspect-ratio preserving UV mapping anchored to bottom
      vec2 getCoverUVBottom(vec2 uv, vec2 screenRes, vec2 imgRes) {
        float screenAspect = screenRes.x / screenRes.y;
        float imgAspect = imgRes.x / imgRes.y;
        if (screenAspect >= imgAspect) {
          // Screen wider than image: fill width, crop top, anchor bottom
          float scaleY = imgAspect / screenAspect;
          return vec2(uv.x, uv.y * scaleY);
        } else {
          // Screen taller than image: fill height, crop sides, anchor center horizontally
          float scaleX = screenAspect / imgAspect;
          return vec2((uv.x - 0.5) * scaleX + 0.5, uv.y);
        }
      }

      void main() {
        vec2 baseUV = getCoverUVBottom(vUv, uResolution, uImageResolution);
        vec4 baseWater = texture2D(uTexture, baseUV);

        // If pixel is outside water area, keep canvas completely transparent
        if (baseWater.a <= 0.001) {
          gl_FragColor = vec4(0.0);
          return;
        }

        vec2 totalDisplacement = vec2(0.0);
        float totalHighlight = 0.0;
        float aspect = uResolution.x / uResolution.y;

        // Iterate solely over active click drops
        for (int i = 0; i < ${MAX_DROPS}; i++) {
          if (i >= uActiveDrops) break;

          vec4 drop = uDrops[i];
          float spawnTime = drop.z;
          float intensity = drop.w;
          float dt = uTime - spawnTime;

          if (dt >= 0.0 && dt < 2.0 && intensity > 0.0) {
            vec2 toDrop = vUv - drop.xy;
            toDrop.x *= aspect; // circular wave propagation on any viewport
            float dist = length(toDrop);

            // Expanding wave radius over time: gentle natural water propagation
            float speed = 0.26;
            float radius = dt * speed;
            float waveDist = dist - radius;

            // Concentric capillary ripple envelope: tight, delicate rings with distance damping
            float spatialEnvelope = exp(-waveDist * waveDist * 220.0);
            float distanceFalloff = exp(-radius * 4.2);
            float temporalFalloff = exp(-dt * 2.0);
            float envelope = spatialEnvelope * distanceFalloff * temporalFalloff * intensity;

            // Higher spatial frequency for delicate multi-ring capillary waves
            float wave = sin(waveDist * 85.0 - dt * 6.0) * envelope * uRippleIntensity;

            vec2 dir = (dist > 0.0001) ? (toDrop / dist) : vec2(0.0, 1.0);

            // Convert aspect-corrected direction back to normalized screen UV space
            vec2 screenDir = vec2(dir.x / aspect, dir.y);
            totalDisplacement += screenDir * wave;

            // Subtle light reflection on wave crests
            totalHighlight += max(0.0, wave * 55.0) * distanceFalloff * temporalFalloff;
          }
        }

        // Feather near shoreline to prevent water spilling over land
        float waterMask = smoothstep(0.01, 0.12, baseWater.a);
        vec2 displacedScreenUv = vUv + totalDisplacement * waterMask;
        vec2 finalUV = getCoverUVBottom(displacedScreenUv, uResolution, uImageResolution);
        finalUV = clamp(finalUV, 0.0, 1.0);

        vec4 waterColor = texture2D(uTexture, finalUV);
        waterColor.a *= waterMask;

        // Delicate liquid light catch on ripple crests
        waterColor.rgb += vec3(totalHighlight * 0.12 * waterMask);

        // Calibrated premultiplied alpha output for accurate HTML5 canvas compositing across all GPUs
        gl_FragColor = vec4(waterColor.rgb * waterColor.a, waterColor.a);
      }
    `;

    // 5. Plane Mesh
    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      transparent: true,
      blending: THREE.NoBlending,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // 6. Click / Tap Event Handler (Spawns expanding ripple solely on click)
    const handlePointerDown = (e: PointerEvent) => {
      // Capture primary click / touch
      if (e.button !== 0 && e.pointerType === "mouse") return;

      const rect = renderer.domElement.getBoundingClientRect();
      const clickX = (e.clientX - rect.left) / rect.width;
      const clickY = 1.0 - (e.clientY - rect.top) / rect.height; // WebGL Y is inverted

      const newDrop: RippleDrop = {
        x: clickX,
        y: clickY,
        spawnTime: time,
        intensity: 1.0,
      };

      activeDrops.push(newDrop);
      if (activeDrops.length > MAX_DROPS) {
        activeDrops.shift();
      }
    };

    const handleResize = () => {
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const newWidth = Math.round(rect.width || container.clientWidth);
      const newHeight = Math.round(rect.height || container.clientHeight);
      if (newWidth > 0 && newHeight > 0 && (newWidth !== width || newHeight !== height)) {
        width = newWidth;
        height = newHeight;
        renderer.setSize(width, height);
        uniforms.uResolution.value.set(width, height);
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(container);

    const domElement = renderer.domElement;
    domElement.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("resize", handleResize);

    // 7. Render Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!isSceneActiveRef.current) return;

      time += 0.016;
      uniforms.uTime.value = time;

      // Filter out expired drops (> 2.0 seconds)
      activeDrops = activeDrops.filter((d) => time - d.spawnTime < 2.0);

      // Pack active drops into uniform buffer
      for (let i = 0; i < MAX_DROPS; i++) {
        const offset = i * 4;
        if (i < activeDrops.length) {
          const drop = activeDrops[i];
          dropsArray[offset] = drop.x;
          dropsArray[offset + 1] = drop.y;
          dropsArray[offset + 2] = drop.spawnTime;
          dropsArray[offset + 3] = drop.intensity;
        } else {
          dropsArray[offset] = 0;
          dropsArray[offset + 1] = 0;
          dropsArray[offset + 2] = -100;
          dropsArray[offset + 3] = 0;
        }
      }

      uniforms.uActiveDrops.value = activeDrops.length;
      renderer.render(scene, camera);
    };
    animate();

    // 8. Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      domElement.removeEventListener("pointerdown", handlePointerDown);
      resizeObserver.disconnect();
      window.removeEventListener("resize", handleResize);

      if (container.contains(domElement)) {
        container.removeChild(domElement);
      }
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      texture.dispose();
    };
  }, [imageSrc, rippleIntensity]);

  return (
    <div
      ref={mountRef}
      className={`absolute inset-0 w-full h-full overflow-hidden select-none pointer-events-auto ${className}`}
    />
  );
}
