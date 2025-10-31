import * as THREE from 'three';
import { useRef, useEffect, useState } from 'react';
import { useCylinder } from '@react-three/cannon';
import { useFrame, useThree } from '@react-three/fiber';
import { usePlayerControls } from '../tools/input-handler';
import AvatarMesh from './avatar-mesh';
import { useRoom } from '../network/session-provider';
import { useStamina } from '../state/global-state';
import { MOVEMENT, CAMERA, NETWORK } from '../definitions/constants';

interface EntityControllerProps {
  position: [number, number, number];
  rotation: [number, number, number];
  canJump: boolean;
}

const EntityController: React.FC<EntityControllerProps> = (props) => {
  const movement_direction = new THREE.Vector3();
  const forward_vector = new THREE.Vector3();
  const side_vector = new THREE.Vector3();
    const { camera } = useThree();
  const [ref, api] = useCylinder(() => ({
    mass: 1,
    position: props.position,
    rotation: props.rotation,
    args: [0.45, 0.45, 1.5, 8],
    lockRotation: true,
  }));

  const velocity = useRef([0, 0, 0]);
  useEffect(() => api.velocity.subscribe((v) => (velocity.current = v)), [api.velocity]);

  const position = useRef([0, 0, 0]);
  useEffect(() => api.position.subscribe((p) => (position.current = p)), [api.position]);

  const rotation = useRef([0, 0, 0]);
  useEffect(() => api.rotation.subscribe((r: [number, number, number]) => (rotation.current = r)), [api.rotation]);
  const last_sent_time = useRef<number>(Date.now());
  const previous_location = useRef<THREE.Vector3>(new THREE.Vector3(...props.position));
  const previous_rotation = useRef<THREE.Quaternion>(new THREE.Quaternion());

    
  const { room } = useRoom();
  const { current_energy, update_energy } = useStamina();
  const { forward, backward, left, right, jump, sprint, camera_toggle, kill } = usePlayerControls();

  const [is_third_person, set_is_third_person] = useState(false);
  const [my_role, set_my_role] = useState<string>("crewmate");
  const [is_dead, set_is_dead] = useState<boolean>(false);
  const kill_pressed = useRef<boolean>(false);

  const initial_rotation = new THREE.Euler(...props.rotation);

  useEffect(() => {
    camera.layers.enableAll();
    camera.rotation.set(initial_rotation.x, initial_rotation.y, initial_rotation.z);
    const offset = is_third_person ? new THREE.Vector3(0, 0, 10) : new THREE.Vector3(0, 0, 0);
    const camera_position = new THREE.Vector3(...props.position).add(offset.applyQuaternion(camera.quaternion));
    camera.position.set(camera_position.x, camera_position.y, camera_position.z);
      }, []);

  useEffect(() => {
    set_is_third_person(camera_toggle);
  }, [camera_toggle]);

    useEffect(() => {
    if (!room) return;

    const my_session_id = room.sessionId;
    const my_player = room.state.players.get(my_session_id);

    if (my_player) {
      set_my_role(my_player.role);
      set_is_dead(my_player.isDead);

      const handle_player_change = () => {
        set_my_role(my_player.role);
        set_is_dead(my_player.isDead);
      };

      my_player.onChange = handle_player_change;

            const handle_player_killed = (message: { killerId: string; victimId: string }) => {
        if (message.victimId === my_session_id) {
          console.log("i was killed");
          set_is_dead(true);
        }
      };

      room.onMessage("entity_eliminated", handle_player_killed);

      return () => {
        my_player.onChange = undefined;
      };
    }
  }, [room]);

    useEffect(() => {
    if (!room || my_role !== "imposter" || is_dead) return;

    if (kill && !kill_pressed.current) {
      kill_pressed.current = true;

            if (!ref.current) return;
      const my_position = new THREE.Vector3().fromArray(position.current);
      let nearest_player: { id: string; distance: number } | null = null;

      room.state.players.forEach((player: any, sessionId: string) => {
        if (sessionId === room.sessionId) return;         if (player.isDead) return; 
        const dx = player.position.x - my_position.x;
        const dy = player.position.y - my_position.y;
        const dz = player.position.z - my_position.z;
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (distance <= 3 && (nearest_player === null || distance < nearest_player.distance)) {
          nearest_player = { id: sessionId, distance };
        }
      });

      if (nearest_player) {
        const victim = nearest_player as { id: string; distance: number };
        console.log(`attempting to kill player ${victim.id} at distance ${victim.distance.toFixed(2)}`);
        room.send("action", { targetId: victim.id });
      } else {
        console.log("no players in kill range");
      }
    } else if (!kill) {
      kill_pressed.current = false;
    }
  }, [kill, room, my_role, is_dead]);

  useEffect(() => {
    const isMoving = forward || backward || left || right;
    const isSprinting = sprint && isMoving;

    if (isSprinting) {
      if (current_energy > 0) {
        const drainTimer = setTimeout(() => {
          const newEnergy = current_energy - 10;
          update_energy(newEnergy < 0 ? 0 : newEnergy);
        }, 1000);
        return () => clearTimeout(drainTimer);
      }
    } else {
      if (current_energy < 100) {
        const regenTimer = setTimeout(() => {
          const newEnergy = current_energy + 15;
          update_energy(newEnergy > 100 ? 100 : newEnergy);
        }, 500);
        return () => clearTimeout(regenTimer);
      }
    }
  }, [sprint, forward, backward, left, right, current_energy, update_energy]);

  useFrame(() => {
    if (!ref.current) return;

    const current_pos = new THREE.Vector3().fromArray(position.current);
    const current_quaternion = new THREE.Quaternion().setFromEuler(new THREE.Euler().fromArray(rotation.current as [number, number, number]));

        if (is_dead) {
      api.velocity.set(0, 0, 0);
      
            const target_rotation = new THREE.Euler(Math.PI / 3, camera.rotation.y, 0);       camera.rotation.x = THREE.MathUtils.lerp(camera.rotation.x, target_rotation.x, 0.05);

            const death_camera_position = new THREE.Vector3(current_pos.x, current_pos.y + 0.2, current_pos.z);
      const death_lerp_factor = CAMERA.DEATH_LERP_FACTOR;
      camera.position.x += (death_camera_position.x - camera.position.x) * death_lerp_factor;
      camera.position.y += (death_camera_position.y - camera.position.y) * death_lerp_factor;
      camera.position.z += (death_camera_position.z - camera.position.z) * death_lerp_factor;
      
      return;
    }

    const offset = is_third_person ? new THREE.Vector3(0, 0, 10) : new THREE.Vector3(0, 0, 0);
    const camera_position = new THREE.Vector3(current_pos.x, current_pos.y + 0.5, current_pos.z).add(offset.applyQuaternion(camera.quaternion));
    const follow_lerp_factor = CAMERA.FOLLOW_LERP_FACTOR;
    camera.position.x += (camera_position.x - camera.position.x) * follow_lerp_factor;
    camera.position.y += (camera_position.y - camera.position.y) * follow_lerp_factor;
    camera.position.z += (camera_position.z - camera.position.z) * follow_lerp_factor;

    forward_vector.set(0, 0, Number(backward) - Number(forward));
    side_vector.set(Number(left) - Number(right), 0, 0);
      movement_direction.subVectors(forward_vector, side_vector).normalize().multiplyScalar(sprint && current_energy > 0 ? MOVEMENT.SPRINT_SPEED : MOVEMENT.WALK_SPEED).applyEuler(camera.rotation);

    const current_velocity = velocity.current;

    const vel_x = movement_direction.x;
    const vel_y = current_velocity[1];
    const vel_z = movement_direction.z;
    api.velocity.set(vel_x, vel_y, vel_z);

    if (props.canJump && jump && Math.abs(current_velocity[1]) < 0.05) {
      const jump_vel_x = current_velocity[0];
      const jump_vel_y = MOVEMENT.JUMP_FORCE;
      const jump_vel_z = current_velocity[2];
      api.velocity.set(jump_vel_x, jump_vel_y, jump_vel_z);
    }

    const camera_quaternion = new THREE.Quaternion();
    camera.getWorldQuaternion(camera_quaternion);
    const camera_euler = new THREE.Euler().setFromQuaternion(camera_quaternion, 'YXZ');
    const yaw_quaternion = new THREE.Quaternion();
    yaw_quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), camera_euler.y);
    const lerp_factor = CAMERA.FOLLOW_LERP_FACTOR;
    const current_yaw = rotation.current[1];
    const target_yaw = camera_euler.y;

        let new_yaw = current_yaw + (target_yaw - current_yaw) * lerp_factor;

    api.rotation.set(0, new_yaw, 0);

    const now = Date.now();
    const position_diff = previous_location.current.distanceTo(current_pos);
    const rotation_diff = previous_rotation.current.angleTo(current_quaternion);

    let state = "idle";
    if (Math.abs(movement_direction.x) > 0 || Math.abs(movement_direction.z) > 0) {
      state = sprint && current_energy > 0 ? "run" : "walk";
    }

    if (room && now - last_sent_time.current > NETWORK.SYNC_INTERVAL && (position_diff > 0.01 || rotation_diff > 0.01)) {
      const euler: any = new THREE.Euler().setFromQuaternion(current_quaternion, 'YXZ');
      room.send('entity_update', { position: current_pos, rotation: { x: euler.x, y: euler.y, z: euler.z }, state });
      previous_location.current.copy(current_pos);
      previous_rotation.current.copy(current_quaternion);
      last_sent_time.current = now;
    } else if (room && now - last_sent_time.current > NETWORK.SYNC_FALLBACK) {
      const euler: any = new THREE.Euler().setFromQuaternion(current_quaternion, 'YXZ');
      room.send('entity_update', { position: current_pos, rotation: { x: euler.x, y: euler.y, z: euler.z }, state });
    }
  });

  return (
    <mesh ref={ref}>
      <AvatarMesh visibility={camera_toggle} isDead={is_dead} />
    </mesh>
  );
};

export default EntityController;
