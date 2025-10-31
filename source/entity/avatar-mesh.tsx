import React, { useMemo, useRef, useEffect, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame, useGraph } from '@react-three/fiber';

import ModelUrl from "../resources/meshes/avatar.glb";
import { SkeletonUtils } from 'three-stdlib';

const AvatarMesh: React.FC<{ visibility: boolean; isDead?: boolean }> = (props) => {

    const { scene: originalScene }: any = useGLTF(ModelUrl);
    const clonedScene = React.useMemo(() => originalScene.clone(), [originalScene]);

    return (
        <>
            {clonedScene && (
                <Model visibility={props.visibility} isDead={props.isDead} />
            )}
        </>
    );
};

export default AvatarMesh;

export function Model(props: any) {
    const { scene, materials }: any = useGLTF(ModelUrl);
    const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
    const { nodes }: any = useGraph(clone);
    
        const [deathProgress, setDeathProgress] = useState(0);
    const wasDeadRef = useRef(false);

        useEffect(() => {
        if (props.isDead && materials) {
                        Object.values(materials).forEach((material: any) => {
                material.transparent = true;
                material.opacity = 0.5;
                material.emissive?.setHex(0x330000);             });
        }
    }, [props.isDead, materials]);

        useEffect(() => {
        if (props.isDead && !wasDeadRef.current) {
            setDeathProgress(0);
            wasDeadRef.current = true;
        } else if (!props.isDead) {
            wasDeadRef.current = false;
            setDeathProgress(0);
        }
    }, [props.isDead]);

        useFrame((state, delta) => {
        if (props.isDead && deathProgress < 1) {
                        setDeathProgress(prev => Math.min(prev + delta / 1.5, 1));
        }
    });

        const easeProgress = deathProgress * deathProgress; 
        const targetRotation = props.isDead ? Math.PI / 2 + Math.PI / 2 : Math.PI / 2;
    const currentRotation = Math.PI / 2 + (targetRotation - Math.PI / 2) * easeProgress;
    const groupRotation: [number, number, number] = [currentRotation, 0, 0];

    const targetY = props.isDead ? -0.5 : -1.2;
    const currentY = -1.2 + (targetY - (-1.2)) * easeProgress;
    const groupPosition: [number, number, number] = [0, currentY, 0];

    return (
        <group layers={1} visible={props.visibility} position={groupPosition} scale={[2.2, 2.2, 2.2]} rotation={[0, -Math.PI, 0]}>
            <group layers={1} name="Scene">
                <group layers={1} name="Armature" rotation={groupRotation as any}>
                    <group layers={1} name="Astronaut">
                        <skinnedMesh
                            layers={1}
                            name="Astronautmesh"
                            geometry={nodes.Astronautmesh.geometry}
                            material={materials.SecondaryMaterial}
                            skeleton={nodes.Astronautmesh.skeleton}
                        />
                        <skinnedMesh
                            layers={1}
                            name="Astronautmesh_1"
                            geometry={nodes.Astronautmesh_1.geometry}
                            material={materials.BaseMaterial}
                            skeleton={nodes.Astronautmesh_1.skeleton}
                        />
                        <skinnedMesh
                            layers={1}
                            name="Astronautmesh_2"
                            geometry={nodes.Astronautmesh_2.geometry}
                            material={materials.BeltMaterial}
                            skeleton={nodes.Astronautmesh_2.skeleton}
                        />
                    </group>
                    <primitive object={nodes.mixamorigHips} />
                </group>
            </group>
        </group>
    );
};