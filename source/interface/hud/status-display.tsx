import React, { useEffect, useState } from "react";
import { useRoom } from "../../network/session-provider";
import "../../resources/styling/hud/status-display.css";

const StatusDisplay: React.FC = () => {
  const { room } = useRoom();
  const [myRole, setMyRole] = useState<string>("crewmate");
  const [isDead, setIsDead] = useState<boolean>(false);
  const [killCooldown, setKillCooldown] = useState<number>(0);

  useEffect(() => {
    if (!room) return;

    const mySessionId = room.sessionId;
    const myPlayer = room.state.players.get(mySessionId);

    if (myPlayer) {
      setMyRole(myPlayer.role);
      setIsDead(myPlayer.isDead);

      const handlePlayerChange = () => {
        setMyRole(myPlayer.role);
        setIsDead(myPlayer.isDead);
      };

      myPlayer.onChange = handlePlayerChange;
    }

    room.onMessage("action_timer", (message: { remaining: number }) => {
      setKillCooldown(message.remaining);
    });

    return () => {
      if (myPlayer) {
        myPlayer.onChange = undefined;
      }
    };
  }, [room]);

  if (!room) return null;

  return (
    <div className="status-overlay">
      <div className={`role-display ${myRole === "imposter" ? "role-imposter" : "role-crewmate"}`}>
        {myRole === "imposter" ? "IMPOSTER" : "CREWMATE"}
      </div>

      {myRole === "imposter" && !isDead && (
        <div className="action-button-area">
          <div className={`action-button ${killCooldown > 0 ? "on-cooldown" : "is-ready"}`}>
            {killCooldown > 0 ? (
              <div className="timer-display">
                <div className="timer-text">{killCooldown}s</div>
                <div
                  className="timer-bar"
                  style={{ width: `${(killCooldown / 30) * 100}%` }}
                />
              </div>
            ) : (
              <div className="ready-prompt">
                <div className="prompt-icon">🔪</div>
                <div className="prompt-text">Press K to Kill</div>
              </div>
            )}
          </div>
        </div>
      )}

      {isDead && (
        <div className="eliminated-overlay">
          <div className="eliminated-message">YOU DIED</div>
          <div className="eliminated-subtitle">You cannot move</div>
        </div>
      )}
    </div>
  );
};

export default StatusDisplay;
