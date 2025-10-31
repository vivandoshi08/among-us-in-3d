import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';

const RadarView: React.FC = () => {
    const { scene, camera } = useThree();
    const minimapCamera = useRef<THREE.OrthographicCamera | null>(null);
    const minimapRenderer = useRef<THREE.WebGLRenderer | null>(null);

    useEffect(() => {
        const miniMap = document.getElementById('mini_map');
        if (!miniMap) return;

        const minimapWidth = miniMap.offsetWidth;
        const minimapHeight = miniMap.offsetHeight;

        const aspect = minimapWidth / minimapHeight;
        const size = 7.5;
        minimapCamera.current = new THREE.OrthographicCamera(-size * aspect, size * aspect, size, -size, 0.1, 500);
        minimapRenderer.current = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        minimapRenderer.current.setSize(minimapWidth, minimapHeight);
        miniMap.appendChild(minimapRenderer.current.domElement);

        minimapCamera.current.layers.disableAll();
        minimapCamera.current.layers.enable(0);

        return () => {
            if (minimapRenderer.current) {
                miniMap?.removeChild(minimapRenderer.current.domElement);
                minimapRenderer.current.dispose();
            }
        };
    }, []);

    useEffect(() => {
        const renderMinimap = () => {
            if (minimapCamera.current && minimapRenderer.current) {
                const mainCamera = camera as THREE.PerspectiveCamera;
                minimapCamera.current.position.set(mainCamera.position.x, 1, mainCamera.position.z);
                minimapCamera.current.lookAt(new THREE.Vector3(mainCamera.position.x, 0, mainCamera.position.z));

                minimapRenderer.current.render(scene, minimapCamera.current);
            }
        };

        const intervalId = setInterval(() => {
            renderMinimap();
        }, 66);

        return () => clearInterval(intervalId);
    }, [scene, camera]);

    return null;
};

export default RadarView;
