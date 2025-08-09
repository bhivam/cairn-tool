"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, OrthographicCamera, useTexture, Preload } from "@react-three/drei";
import { MOUSE, NoToneMapping, SRGBColorSpace, TOUCH } from "three";
import { useEffect } from "react";
import { useMapSettings } from "../providers/map-settings";

function MapLayer({ textureUrl, visible = true }: { textureUrl: string; visible?: boolean }) {
  const {
    camera,
    size: { height },
  } = useThree();

  const texture = useTexture(textureUrl);
  texture.colorSpace = SRGBColorSpace;

  const image = texture.image as HTMLImageElement | undefined;
  const [w, h] = [image?.width ?? 0, image?.height ?? 0];
  const aspect = w / h;
  const planeHeight = 10; // ???
  const planeWidth = planeHeight * aspect;

  useEffect(() => {
    if (camera) {
      camera.zoom = height / planeHeight;
      camera.updateProjectionMatrix();
    }
  }, [camera, height, planeHeight]);

  return (
    <mesh visible={visible}>
      <planeGeometry args={[planeWidth, planeHeight]} />
      <meshBasicMaterial map={texture} transparent />
    </mesh>
  );
}

export default function InteractiveMap() {
  const { showTerritories } = useMapSettings();
  return (
    <div className="h-full w-full">
      <Canvas
        onCreated={({ gl }) => {
          gl.outputColorSpace = SRGBColorSpace;
          gl.toneMapping = NoToneMapping;
        }}
      >
        <OrthographicCamera makeDefault position={[0, 0, 10]} />
        <OrbitControls
          enableRotate={false}
          zoomToCursor
          mouseButtons={{
            LEFT: MOUSE.PAN,
          }}
          touches={{
            ONE: TOUCH.PAN,
            TWO: TOUCH.DOLLY_PAN,
          }}
        />
        {/*         <MapLayer textureUrl={"/map.png"} />
        <MapLayer textureUrl={"/legend.png"} />
        <MapLayer textureUrl={"/settlements.png"} />
        <MapLayer textureUrl={"/labels.png"} />
        <MapLayer textureUrl={"/landscape.png"} /> */}
        <MapLayer textureUrl="full_map.png" />
        <MapLayer textureUrl="territories.png" visible={showTerritories} />
        <Preload all />
      </Canvas>
    </div>
  );
}
