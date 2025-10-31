import React from 'react';

interface LoadingBarProps {
    progress: number;
}

const LoadingBar: React.FC<LoadingBarProps> = ({ progress }) => {
    return (
        <div className="progress-wrapper">
            <div className="progress-text">{`Loading... ${progress}%`}</div>
            <div className="progress-bar">
                <div
                    className="progress-bar-fill"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
}

export default LoadingBar;