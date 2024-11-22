import React, { useState, useEffect } from 'react';
import "./css/Lobby.css"
import "./css/RoomCard.css"
import { useNavigate } from 'react-router-dom';

interface RoomCardProps {
    roomName: string;
    roomNumber:number;
    gameSettings:string;
    isPlaying:boolean;
  }

const RoomCard:React.FC<RoomCardProps> = ({ roomNumber, roomName, gameSettings, isPlaying }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/game/${roomNumber}`);
      };
    return (
      <div className={`room-card ${isPlaying ? "playing" : "not-playing"}`} onClick={handleClick} style={{ cursor: "pointer" }} >
        <div className="room-header">
          <span className="room-number">방 #{roomNumber}</span>
          <span className="room-name">{roomName}</span>
        </div>
        <div className="room-footer">
          <span className="game-settings">{gameSettings}</span>
        </div>
      </div>
    );
  };


const Lobby: React.FC = () => {
    const rooms = [
        { id: 1, name: "초보자 방", settings: "3인용, 2분 제한", isPlaying: false },
        { id: 2, name: "고수 방", settings: "4인용, 5분 제한", isPlaying: true },
        { id: 3, name: "친구와 함께", settings: "2인용, 무제한", isPlaying: false },
      ];
    return (
        <div className="lobby-container">
      {/* 접속 중인 유저 목록 */}
      <aside className="users-section">
        <h2>접속 중인 유저</h2>
        {/* 이후 유저 목록 표시 로직 추가 */}
      </aside>

      {/* 방 목록 */}
      <main className="rooms-section">
        <h2>방 목록</h2>
        {rooms.map((room) => (
        <RoomCard
          key={room.id}
          roomNumber={room.id}
          roomName={room.name}
          gameSettings={room.settings}
          isPlaying={room.isPlaying}
        />
      ))}
      </main>
    </div>
    )
}

export default Lobby;