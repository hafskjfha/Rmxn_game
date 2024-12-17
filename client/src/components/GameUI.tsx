import React, { useState, useEffect } from "react";
import "./css/WordChainGameUI.css";
import { useWebSocket } from "./GWebSocketProvider";
import { useNavigate } from "react-router-dom"; // 페이지 이동을 위한 import
import VsComputerLobby from "./ComputerGame";

interface wsjson {
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

const WordChainGameUI: React.FC = () => {
    const { socket, subscribe } = useWebSocket();
    const [inputValue, setInputValue] = useState("");
    const [timeLeft, setTimeLeft] = useState(10);
    const [barWidth, setBarWidth] = useState(100);
    const [inText, setText] = useState<string>("텍스트 한 줄 표시 영역");
    const [chain, setChain] = useState<number>(0);
    const [currentTurn, setTurn] = useState<boolean>(false);
    const [usedq, setq] = useState<{ word: string; meaning: string }[]>([]);
    const [isError, setIsError] = useState(false);
    const [unsubscribe, setUnsubscribe] = useState<(() => void) | null>(null);

    useEffect(() => {
        const unsubscribe = subscribe((message) => {
            const j: wsjson = JSON.parse(message);
            console.log("B received message:", j, performance.now());
            if (j.type === "game_start") {
                setText(j.start_letter as string);
                setTimeLeft(j.time_limit as number);
                setBarWidth(100);
                setTurn(j.player_turn ? true : false);
                if (!j.player_turn) {
                    setTimeout(() => {
                        socket?.send(JSON.stringify({ command: "compin" }));
                    }, 400);
                }
            } else if (j.type === "cturn_yes") {
                setText(j.word as string);
                setChain(j.chain as number);
                setq((prev) => {
                    const updated = [...prev, { word: j.word as string, meaning: j.message as string }];
                    return updated.slice(-4);
                });
                setTurn(false);
            } else if (j.type === "cturn_no") {
                setText(j.word as string);
                setIsError(true);
                setTurn(false);
            } else if (j.type === "pturn_start") {
                setTimeout(() => {
                    setText(j.letter as string);
                    setTimeLeft(j.time_limit as number);
                    setBarWidth(100);
                    setTurn(j.player_turn ? true : false);
                }, 700);
            } else if (j.type === "pturn_no") {
                setText(`${j.word} ; ${j.message}`);
                setIsError(true);
                setTimeout(() => {
                    setIsError(false);
                    setText(j.letter as string);
                }, 1000);
            } else if (j.type === "pturn_yes") {
                setText(j.word as string);
                setTimeLeft(j.time_limit as number);
                setBarWidth(100);
                setTurn(false);
                setq((prev) => {
                    const updated = [...prev, { word: j.word as string, meaning: j.message as string }];
                    return updated.slice(-4);
                });
                setTimeout(() => {
                    setText(j.letter as string);
                    setTimeout(() => {
                        socket?.send(JSON.stringify({ command: "compin" }));
                    }, 400);
                }, 1000);
            }
        });
        setUnsubscribe(() => unsubscribe);
        console.log('www')
        return unsubscribe;
    }, [subscribe]);

    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft((prev) => Math.max(0, prev - 1));
            }, 1000);

            return () => clearInterval(timer);
        } else if (timeLeft === 0) {
            socket?.send(JSON.stringify({ command: "turn_timeout" }));
            setTurn(false);
        }
    }, [timeLeft, currentTurn]);

    useEffect(() => {
        setBarWidth((timeLeft / 30) * 100);
    }, [timeLeft]);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(event.target.value);
    };

    const handleConfirm = () => {
        if (!currentTurn) return;
        socket?.send(JSON.stringify({ command: "user_input", input: inputValue }));
        setInputValue("");
    };

    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter" && currentTurn) {
            handleConfirm();
        }
    };

    

    return (
        <div className="word-chain-container flex flex-col items-center justify-center h-screen bg-gray-100 w-full">
            {/* 메인 게임 UI */}
            <div className="main-box-container flex flex-col items-center bg-white shadow-lg border-2 border-black rounded-xl p-4 w-full max-w-2xl relative">
                <div className={`main-box-content text-center text-xl font-bold ${isError ? "text-red-500" : "text-gray-800"}`}>
                    {inText}
                </div>
                <div className="chain-circle bg-blue-300 text-white text-xl font-bold w-12 h-12 flex items-center justify-center rounded-full absolute top-1/2 right-[-60px] transform -translate-y-1/2">
                    {chain}
                </div>
            </div>

            {/* 시간바 */}
            <div className="time-bar-container w-full max-w-2xl mt-4 h-4 bg-gray-300 rounded-full">
                <div className="time-bar bg-blue-500 h-full rounded-full" style={{ width: `${barWidth}%`, transition: "width 1s linear" }}></div>
            </div>

            <div className="recent-words-queue w-full max-w-2xl flex justify-start items-center mt-6 mb-6">
                {usedq.slice().reverse().map((item, index) => (
                    <div key={index} className="relative group mr-2">
                        {/* 단어와 뜻이 표시되는 메인 박스 */}
                        <div
                            className="recent-word bg-gray-200 text-gray-800 text-sm font-semibold px-3 py-2 rounded-md text-center"
                            style={{
                                maxWidth: "150px", // 가로 길이 늘림
                                minWidth: "150px",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                            }}
                        >
                            <span className="font-bold">
                                {item.word.length > 10 ? `${item.word.slice(0, 10)}...` : item.word}
                            </span>
                            <br />
                            <span
                                className="text-xs"
                                dangerouslySetInnerHTML={{
                                    __html:
                                        item.meaning.length > 20
                                            ? `${item.meaning.slice(0, 20)}...`
                                            : item.meaning,
                                }}
                            />
                        </div>
                        {/* 호버 시 상세 정보 */}
                        <div
                            className="absolute hidden group-hover:flex flex-col bg-white text-gray-900 border border-gray-400 p-2 rounded-md shadow-lg -top-16 left-0 z-10 max-w-xs word-wrap break-words"
                            style={{ minWidth: "200px", wordWrap: "break-word" }}
                        >
                            <div className="font-bold">{item.word}</div>
                            <div
                                className="text-sm"
                                dangerouslySetInnerHTML={{ __html: item.meaning }}
                            />
                        </div>
                    </div>
                ))}
            </div>



            {/* 입력창 */}
            <div className="input-section w-full max-w-2xl flex items-center mt-6">
                <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyPress}
                    placeholder="단어를 입력하세요"
                    className="word-input flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
                />
                <button onClick={handleConfirm} disabled={!currentTurn} className="ml-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                    확인
                </button>
            </div>
        </div>
    );
};

export default WordChainGameUI;
