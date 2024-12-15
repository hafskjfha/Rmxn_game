import React, { useState, useEffect } from "react";
import "./css/GameHandler.css";
import PlayerCard from "./GplayerCard";
import WordChainGameUI from "./GameUI";
import VsComputerLobby from "./ComputerGame";
import { useWebSocket } from "./GWebSocketProvider";

const GameHandler: React.FC = () => {
    const { socket, subscribe } = useWebSocket();
    const [currentTurn, setCurrentTurn] = useState<"user" | "computer">("user");
    const [p, setp] = useState<boolean>(true);
    const [unsubscribe, setUnsubscribe] = useState<(() => void) | null>(null);

    const nickname = localStorage.getItem("nickname") || "Guest";

    useEffect(() => {
        const unsubscribeFunc = subscribe((message) => {
            const j = JSON.parse(message);
            console.log("A received message:", j);
            if (j.type==="game_start"){
                setCurrentTurn(j.player_turn ? "user" : "computer")
            }
        });
        setUnsubscribe(() => unsubscribeFunc);

        console.log("e");

        return () => {
            console.log("Unsubscribing...");
            unsubscribeFunc();
        };
    }, [subscribe]);

    const handleExit = () => {
        if (unsubscribe) {
            console.log("Unsubscribing from WebSocket...");
            unsubscribe();
        }
        setp(false); // 로비 화면으로 전환
    };

    if (!p) {
        return <VsComputerLobby />;
    }

    return (
        <div className="game-handler-container flex flex-col items-center justify-center h-screen bg-gradient-to-br from-gray-100 to-blue-50">
            <div className="absolute top-4 right-4">
                <button
                    onClick={handleExit}
                    className="exit-button px-4 py-2 bg-red-500 text-white font-semibold rounded-md hover:bg-red-600 focus:outline-none focus:ring focus:ring-red-300"
                >
                    나가기
                </button>
            </div>

            {/* Game UI */}
            <WordChainGameUI />

            {/* Players */}
            <div className="players w-full max-w-lg bg-white shadow-lg rounded-xl p-6 mb-8">
                <div className="flex justify-between items-center">
                    <PlayerCard
                        name={nickname}
                        icon="person"
                        isActive={currentTurn === "user"}
                        bgColor="bg-blue-50"
                        textColor="text-blue-700"
                    />
                    <PlayerCard
                        name="컴퓨터"
                        icon="computer"
                        isActive={currentTurn === "computer"}
                        bgColor="bg-green-50"
                        textColor="text-green-700"
                    />
                </div>
            </div>
        </div>
    );
};

export default GameHandler;
