import React from 'react';
import EnergyIndicator from './overlay/energy-indicator';
import CrossHair from './overlay/cross-hair';

import { useStamina } from '../state/global-state';
import RadarOverlay from './hud/radar-overlay';
import MessagePanel from './hud/message-panel';
import StatusDisplay from './hud/status-display';

const InterfaceManager: React.FC = () => {
    const { current_energy } = useStamina();

    return (
        <>
            <div style={{ zIndex: 2, position: "absolute", width: "100vw", height: "100vh" }} >
                <MessagePanel/>
                <RadarOverlay />
                <CrossHair />
                <EnergyIndicator stamina={current_energy} />
                <StatusDisplay />
            </div>
        </>
    );
};

export default InterfaceManager;