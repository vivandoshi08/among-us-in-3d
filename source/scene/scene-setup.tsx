import React from 'react';
import Lights from './lights';
import { Environment } from '@react-three/drei';

const SceneSetup: React.FC = () => {
    return (
        <>
            <Lights />
            <fog attach="fog" args={['black', 0.005, 30]} />
            <Environment preset='city' />
        </>
    );
};

export default SceneSetup;