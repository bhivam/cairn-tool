
'use client';

import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, OrthographicCamera } from '@react-three/drei';
import { MOUSE, TOUCH, Texture, TextureLoader } from 'three';
import { useEffect, useState } from 'react';

function MapPlane({
  texture,
  imageSize,
}: {
  texture: Texture;
  imageSize: [number, number];
}) {
  const { camera, size: { height, width } } = useThree();

  const [w, h] = imageSize;
  const aspect = w / h;
  const planeHeight = 10;
  const planeWidth = planeHeight * aspect;

  useEffect(() => {
    if (camera) {
      camera.zoom = height / planeHeight;
      camera.updateProjectionMatrix();
    }
  }, [camera, height, planeHeight]);

  return (
    <mesh>
      <planeGeometry args={[planeWidth, planeHeight]} />
      <meshBasicMaterial map={texture} />
    </mesh>
  );
}

export default function InteractiveMap() {
  const [texture, setTexture] = useState<Texture | null>(null);
  const [imageSize, setImageSize] = useState<[number, number] | null>(null);

  useEffect(() => {
    const loader = new TextureLoader();
    loader.load("/map.png", (loadedTexture: Texture) => {
      setTexture(loadedTexture);
      const image = loadedTexture.image as HTMLImageElement | undefined;
      setImageSize([
        image?.width ?? 0,
        image?.height ?? 0,
      ]);
    });
  }, []);


  return (
    <div
      className="h-full w-full"
    >
      <Canvas orthographic>
        <OrthographicCamera
          makeDefault
          position={[0, 0, 10]}
        />
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
        {texture && imageSize && (
          <MapPlane texture={texture} imageSize={imageSize} />
        )}
      </Canvas>
    </div>
  );
}

