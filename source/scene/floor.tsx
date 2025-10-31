import { usePlane } from "@react-three/cannon";

const Floor = () => {
  const [ref] = usePlane(() => ({ rotation: [-Math.PI / 2, 0, 0], type: 'Static' }));

  return (
    <mesh ref={ref} receiveShadow>
      <planeGeometry args={[1000, 1000]} />
      <meshStandardMaterial color="white" />
    </mesh>
  );
};

export default Floor;
