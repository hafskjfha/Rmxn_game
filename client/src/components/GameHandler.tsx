import React, { useState, useEffect } from "react";
import "./css/GameHandler.css";
import PlayerCard from "./GplayerCard";
import WordChainGameUI from "./GameUI";
import VsComputerLobby from "./ComputerGame";
import { useWebSocket } from "./GWebSocketProvider";

interface wsjson{
    type: string;
    player_turn?: boolean;
    start_letter?: string;
    start_time?: string;
    time_limit?: number;
    message?: string;
    chain?: number;
    letter?: string;
    word?: string;
    winner?: boolean;
}

const GameHandler: React.FC = () => {
    const { socket, subscribe } = useWebSocket();
    const [currentTurn, setCurrentTurn] = useState<"user" | "computer">("user");
    const [p, setp] = useState<boolean>(true);
    const [unsubscribe, setUnsubscribe] = useState<(() => void) | null>(null);
    const [showModal, setShowModal] = useState<boolean>(false); // 모달 표시 상태
    const [winner, setWinner] = useState<boolean>(false); // 승리 여부 상태
    const [ok,setOK] = useState<boolean>(false);

    const nickname = localStorage.getItem("nickname") || "Guest";

    useEffect(() => {
        const unsubscribeFunc = subscribe((message) => {
            const j:wsjson = JSON.parse(message);
            console.log("A received message:", j);
            if (j.type==="game_start"){
                setCurrentTurn(j.player_turn ? "user" : "computer")
            }
            else if(j.type==="pturn_start"){
                setCurrentTurn(j.player_turn ? "user" : "computer")
            }
            else if(j.type==="pturn_yes"){
                setCurrentTurn("computer")
            }else if (j.type === "game_end") {
                setWinner(j.winner || false); // 승리 여부 설정
                setShowModal(true); // 모달 표시
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
            socket?.send(JSON.stringify({command:'exit'}));
            console.log(socket);
            unsubscribe();
        }
        setp(false); // 로비 화면으로 전환
    };

    const closeModalAndNavigate = () => {
        setShowModal(false);
        setOK(true);
        if (unsubscribe){
            console.log('Unsubscribing from WebSocket...');
            unsubscribe();
        }
    };

    if (!p || ok) {
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

            {/* 승리/패배 모달 */}
            {showModal && (
                <div className="modal-overlay fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="modal-content bg-white p-6 rounded-lg shadow-lg text-center">
                        <h2 className="text-2xl font-bold mb-4">{winner ? "🎉 승리했습니다!" : "😢 패배했습니다."}</h2>
                        <button
                            onClick={closeModalAndNavigate}
                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none"
                        >
                            확인
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GameHandler;
