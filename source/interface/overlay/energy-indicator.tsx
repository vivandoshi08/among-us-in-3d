import React from 'react';

const EnergyIndicator: React.FC<{ stamina: number }> = ({ stamina }) => {
    const radius = 105;
    const circumference = Math.PI * radius;
    const energy_percent = stamina;
    const offset = ((100 - energy_percent) / 100) * circumference;

    return (
        <svg
            width="230"
            height="120"
            style={{
                position: "absolute",
                top: -5,
                left: -5,
                pointerEvents: "none",
                transform: "rotateX(180deg) rotateZ(45deg)",
                transformOrigin: "bottom",
            }}
        >
            <path
                d={`M 10,115 A 107.55,105 1 0,1 225,115`}
                fill="none"
                stroke="rgba(255, 255, 255, 0.2)"
                strokeWidth="8"
                strokeDasharray={circumference}
            />
            <path
                d={`M 10,115 A 107.55,105 1 0,1 225,115`}
                fill="none"
                stroke={energy_percent > 30 ? "#4caf50" : "#f44336"}
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                style={{
                    transition: "stroke-dashoffset 0.3s ease, stroke 0.3s ease",
                }}
            />
        </svg>
    );
};

export default EnergyIndicator;
