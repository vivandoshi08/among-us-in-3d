import { Canvas } from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';
import { Physics, Debug } from '@react-three/cannon';
import { CAMERA, PHYSICS } from '../definitions/constants';

import * as THREE from 'three';
import EntityController from '../entity/entity-controller';
import { Suspense, useEffect, useState } from 'react';
import SceneSetup from '../scene/scene-setup';
import TerrainLoader from './world/terrain-loader';
import RemoteEntities from '../network/remote-entities';
import RadarView from './world/radar-view';

const SceneManager = () => {
  const [debug, set_debug] = useState(false);
  const [map_loaded, set_map_loaded] = useState(false);

  const spawn_points: [[number, number, number], [number, number, number]][] = [
    [[93.7, 4, -81], [0, -Math.PI, 0]]
  ];

  useEffect(() => {
    const handleDebugToggle = (event: KeyboardEvent) => {
      if (event.key === "`") {
        set_debug(prevDebug => !prevDebug);
      }
    };
    
    window.addEventListener("keydown", handleDebugToggle);
    
    return () => {
      window.removeEventListener("keydown", handleDebugToggle);
    };
  }, []);

  const on_map_loaded = () => {
    set_map_loaded(true);
  };

  return (
    <>
      <Suspense fallback={null} >
        <Canvas
          gl={{ powerPreference: "high-performance" }}
          style={{ width: "100vw", height: "100vh" }}
          shadows
          camera={{ fov: CAMERA.FOV }}
          onCreated={({ scene }) => {
            scene.background = new THREE.Color('black');
          }}
        >
          <SceneSetup />

          <Physics gravity={[0, PHYSICS.GRAVITY, 0]}>
            {debug ? (
              <Debug color="black" scale={1.1}>
                <Suspense fallback={null}>
                  <TerrainLoader onLoad={on_map_loaded} />
                  {map_loaded && (
                    <>
                      <EntityController position={spawn_points[0][0]} rotation={spawn_points[0][1]} canJump={false} />
                      <RemoteEntities />
                    </>
                  )}
                </Suspense>
              </Debug>
            ) : (
              <Suspense fallback={null}>
                <TerrainLoader onLoad={on_map_loaded} />
                {map_loaded && (
                  <>
                    <EntityController position={spawn_points[0][0]} rotation={spawn_points[0][1]} canJump={false} />
                    <RemoteEntities />
                  </>
                )}
              </Suspense>
            )}
          </Physics>

          <PointerLockControls maxPolarAngle={CAMERA.MAX_POLAR_ANGLE} minPolarAngle={CAMERA.MIN_POLAR_ANGLE} />
          <RadarView />
        </Canvas>
      </Suspense>
    </>
  );
};

export default SceneManager;
