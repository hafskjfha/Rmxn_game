import React, { useState,useEffect } from "react";
import RoomInfoCard from "./RoomInfoCard";
import ParticipantList from "./ParticipantList";
import GameHandler from "./GameHandler";
import { useNavigate } from "react-router-dom";
import { useWebSocket } from "./GWebSocketProvider";

const VsComputerLobby: React.FC = () => {
    const navigate = useNavigate();
    const {socket} = useWebSocket();
    const nickname = localStorage.getItem("nickname") || "Guest";

    const [isGameStarted, setIsGameStarted] = useState(false);

    const [gameSettings] = useState({
        roomName: "VS 컴퓨터",
        settings: "한방 단어 허용, 시작 시간 = 30초",
    });

    const participants = [
        { nickname: nickname, isHost: true, isReady: false },
        { nickname: "컴퓨터", isReady: true },
    ];

    const handleExit = () =>{
        navigate('/lobby')
    }

    if (isGameStarted) {
        socket?.send(JSON.stringify({command:"game_start"}));
        return (
            <GameHandler />
        );
    }

    return (
        <div className="vs-computer-lobby-container flex flex-col items-center justify-center h-screen bg-gradient-to-br from-blue-100 to-gray-100">
            <div className="absolute top-4 right-4">
                <button
                    onClick={handleExit}
                    className="exit-button px-4 py-2 bg-red-500 text-white font-semibold rounded-md hover:bg-red-600 focus:outline-none focus:ring focus:ring-red-300"
                >
                    나가기
                </button>
            </div>
            
            <RoomInfoCard
                roomName={gameSettings.roomName}
                settings={gameSettings.settings}
            />
            <ParticipantList participants={participants} />
            <div className="text-center">
                <button
                    onClick={() => setIsGameStarted(true)}
                    className="px-8 py-3 bg-blue-500 text-white font-bold text-lg rounded-md hover:bg-blue-600 transition-transform transform hover:scale-105 shadow-lg"
                >
                    게임 시작
                </button>
            </div>
        </div>
    );
};

export default VsComputerLobby;
