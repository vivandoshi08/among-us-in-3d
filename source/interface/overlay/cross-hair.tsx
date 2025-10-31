import React from 'react';

const CrossHair: React.FC = () => {
    const crossHairStyle: React.CSSProperties = {
        position: "absolute",
        top: "50%",
        left: "50%",
        width: "10px",
        height: "10px",
        borderRadius: "50%",
        transform: "translate3d(-50%, -50%, 0)",
        border: "2px solid white",
    };

    return (
        <div style={crossHairStyle} className="dot" />
    );
};

export default CrossHair;