import LoadingBar from "./loadingBar";
import { useEffect, useState } from "react";
import { useGLTF } from "@react-three/drei";

import mapModel from "../resources/meshes/terrain.glb";
import mapColliderModel from "../resources/meshes/collision-mesh.glb";
import characterModel from "../resources/meshes/avatar.glb";

const AssetLoader: React.FC = () => {
    const [progress, setProgress] = useState(0);
    const [finished, setFinished] = useState(false);

    useEffect(() => {
        const assets = [mapModel, characterModel, mapColliderModel];

        const loadAssets = () => {
            assets.forEach(url => useGLTF.preload(url));

                        let currentProgress = 0;
            const interval = setInterval(() => {
                currentProgress += 10;
                setProgress(currentProgress);
                if (currentProgress >= 100) {
                    clearInterval(interval);
                    setTimeout(() => {
                        setFinished(true);
                    }, 500);                 }
            }, 200);
        };

        loadAssets();
    }, []);

    if (finished) {
        return null;
    }

    return (
        <div className="bootstrap-screen" onClick={(e) => { e.stopPropagation() }}>
            <LoadingBar progress={progress} />
        </div>
    );
};

export default AssetLoader;
