import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import VsComputerLobby from "./ComputerGame";
import { useWebSocket } from "./GWebSocketProvider";

const ComputerGameLobby: React.FC = () => {
    const { socket } = useWebSocket();
    const [isConnected, setIsConnected] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (socket) {
            const handleOpen = () => setIsConnected(true);
            const handleClose = () => setIsConnected(false);

            socket.addEventListener("open", handleOpen);
            socket.addEventListener("close", handleClose);

            return () => {
                socket.removeEventListener("open", handleOpen);
                socket.removeEventListener("close", handleClose);
                socket.close();
            };
        }
    }, [socket]);

    const handleCancel = () => {
        socket?.close(); // WebSocket 연결 종료
        navigate(-1); // 이전 페이지로 이동
    };

    if (!isConnected) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-800">
                <div className="text-center">
                    <div className="text-2xl font-semibold text-white mb-4">게임 연결 중...</div>
                    <div className="w-10 h-10 border-4 border-t-transparent border-white rounded-full animate-spin mb-6"></div>
                    <button
                        onClick={handleCancel}
                        className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                    >
                        연결 취소
                    </button>
                </div>
            </div>
        );
    }

    return <VsComputerLobby />;
};

export default ComputerGameLobby;
