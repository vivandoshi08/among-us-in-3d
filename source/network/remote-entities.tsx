import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRoom } from "./session-provider";

import ModelUrl from "../resources/meshes/avatar.glb";
import { useCylinder } from "@react-three/cannon";
import { useAnimations, useGLTF } from "@react-three/drei";

import { SkeletonUtils } from 'three-stdlib'
import { useGraph, useFrame } from '@react-three/fiber';

interface Player {
    id: string;
    position: [number, number, number];
    rotation: [number, number, number];
    state: string;
    isDead: boolean;
}

const RemoteEntities: React.FC = () => {
    const { room } = useRoom();
    const [players, setPlayers] = useState<Player[]>([]);

    useEffect(() => {
        if (!room) return;

                const onAddPlayer = (player: any, key: string) => {
            if (key === room.sessionId) return;
            setPlayers((prev) => [
                ...prev,
                {
                    id: key,
                    position: [player.position.x, player.position.y, player.position.z],
                    rotation: [player.rotation.x, player.rotation.y, player.rotation.z],
                    state: "idle",
                    isDead: player.isDead || false
                },
            ]);

                        player.onChange = () => {
                setPlayers((prev) =>
                    prev.map((p) =>
                        p.id === key
                            ? { ...p, isDead: player.isDead }
                            : p
                    )
                );
            };
        };

                const onRemovePlayer = (_player: any, key: string) => {
            setPlayers((prev) => prev.filter((p) => p.id !== key));
        };

                const on_player_move = (e: any) => {
            const { id, position, rotation, state } = e;
            setPlayers((prev) =>
                prev.map((player) =>
                    player.id === id
                        ? { ...player, position: [position.x, position.y, position.z], rotation: [rotation.x, rotation.y, rotation.z], state: state }
                        : player
                )
            );
        };

                const onKick = (code: number) => {
            console.log("disconnected from room:", code);
            if (code === 1005) {
                const shouldLeave = window.confirm("You have been removed from the game.");
                if (shouldLeave) {
                    room.leave();
                }
            }
        }

                const on_player_killed = (message: { killerId: string; victimId: string }) => {
            console.log(`player killed event: ${message.victimId}`);
            setPlayers((prev) =>
                prev.map((p) =>
                    p.id === message.victimId
                        ? { ...p, isDead: true }
                        : p
                )
            );
        };

        room.state.players.onAdd(onAddPlayer);
        room.state.players.onRemove(onRemovePlayer);
        (room as any).onMessage("entity_moved", on_player_move);
        (room as any).onMessage("entity_eliminated", on_player_killed);
        (room as any).onLeave(onKick)

        return () => {
            room.state.players.off("add", onAddPlayer);
            room.state.players.off("remove", onRemovePlayer);
            (room as any).offMessage("entity_moved", on_player_move);
            (room as any).offMessage("entity_eliminated", on_player_killed);
            (room as any).offMessage("kick", onKick);
        };
    }, [room]);

    return (
        <>
            {players.map((player) => (
                <RemotePlayer key={player.id} player={player} />
            ))}
        </>
    );
};

export default RemoteEntities;

const RemotePlayer: React.FC<{ player: Player }> = ({ player }) => {
    const [ref, api] = useCylinder(() => ({
        mass: 1,
        type: 'Kinematic',
        position: player.position,
        rotation: player.rotation,
        args: [0.45, 0.45, 1.5, 8],
    }));

    useEffect(() => {
        api.position.set(player.position[0], player.position[1], player.position[2]);
        api.rotation.set(player.rotation[0], player.rotation[1], player.rotation[2]);
    }, [player.position, player.rotation, api]);

    return (
        <mesh ref={ref}>
            <Model state={player.state} isDead={player.isDead} />
        </mesh>
    );
};


export function Model(props: any) {
    const group = useRef<any>();
    const { scene, animations, materials }: any = useGLTF(ModelUrl);
    const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
    const { nodes }: any = useGraph(clone);
    const { actions } = useAnimations(animations, group);
    
        const [deathProgress, setDeathProgress] = useState(0);
    const wasDeadRef = useRef(false);

    useEffect(() => {
        if (actions) {
            const actionKeys = Object.keys(actions);
            if (actionKeys.length > 0) {
                actions["idle"]?.reset().play();

                const fadeDuration = 0.2;

                if (props.state === "idle") {
                    actions["idle"]?.reset().fadeIn(fadeDuration).play();
                    actions["walk"]?.fadeOut(fadeDuration);
                    actions["run"]?.fadeOut(fadeDuration);
                } else if (props.state === "walk") {
                    actions["walk"]?.reset().fadeIn(fadeDuration).play();
                    actions["idle"]?.fadeOut(fadeDuration);
                    actions["run"]?.fadeOut(fadeDuration);
                } else if (props.state === "run") {
                    actions["run"]?.reset().fadeIn(fadeDuration).play();
                    actions["idle"]?.fadeOut(fadeDuration);
                    actions["walk"]?.fadeOut(fadeDuration);
                }
            }
        }
    }, [actions, props.state]);

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
        <group layers={1} position={groupPosition} scale={[2.2, 2.2, 2.2]} rotation={[0, -Math.PI, 0]} ref={group} {...props} dispose={null}>
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