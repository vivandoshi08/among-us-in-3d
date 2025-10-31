import { useTrimesh } from "@react-three/cannon";
import { useGLTF } from "@react-three/drei";
import { useEffect } from "react";

import mapModel from "../../resources/meshes/terrain.glb";
import mapColliderModel from "../../resources/meshes/collision-mesh.glb";

const TerrainLoader: React.FC<{ onLoad: () => void }> = ({ onLoad }) => {
    const { scene: mapScene } = useGLTF(mapModel) as any;
    const { scene: colliderScene } = useGLTF(mapColliderModel) as any;

    useEffect(() => {
        if (mapScene && colliderScene) {
            mapScene.traverse((child: any) => {
                if (child.isObject3D) {
                    child.layers.set(0);
                }
            });

            colliderScene.traverse((child: any) => {
                if (child.isObject3D) {
                    child.layers.set(0);
                }
            });

            onLoad();
        }
    }, [mapScene, colliderScene, onLoad]);

    return (
        mapScene && colliderScene && (
            <>
                <mesh scale={[20, 20, 20]} position={[0, 0, 0]} layers={0} castShadow receiveShadow>
                    <primitive object={mapScene} />
                </mesh>
                {colliderScene && <TerrainCollider colliderScene={colliderScene} />}
                            </>
        )
    );
};

export default TerrainLoader;

const TerrainCollider: React.FC<{ colliderScene: any }> = ({ colliderScene }) => {
    const [ref] = useTrimesh(() => ({
        mass: 0,
        type: 'Static',
        args: [colliderScene.children[0].geometry.attributes.position.array, colliderScene.children[0].geometry.attributes.index.array],
        position: [0, 0, 0],
        scale: [20, 20, 20]
    }));

    return <mesh ref={ref} visible={false} />;
};