import React from 'react';


const RadarOverlay: React.FC = () => {
    return (
        <div id="mini_map" style={{ position: "absolute", top: 10, left: 10, width: 200, height: 200, border: "1px solid #000", overflow: "hidden", backgroundColor: "rgba(0, 0, 0, 0.5)", borderRadius: "50%", boxShadow: "0 0 10px rgba(0, 0, 0, 0.5)", }} >
            <div style={{ position: "absolute", top: "50%", left: "50%", width: 10, height: 10, backgroundColor: "red", borderRadius: "50%", transform: "translate(-50%, -50%)", zIndex: 10, }} />
        </div>
    );
};

export default RadarOverlay;