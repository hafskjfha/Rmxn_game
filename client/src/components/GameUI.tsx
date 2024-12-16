import React, { useState, useEffect } from "react";
import "./css/WordChainGameUI.css";
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
}

const WordChainGameUI: React.FC = () => {
    const {socket, subscribe} = useWebSocket();
    const [inputValue, setInputValue] = useState("");
    const [timeLeft, setTimeLeft] = useState(10); // 초기 시간 설정 (10초)
    const [barWidth, setBarWidth] = useState(100); // 시간 막대의 너비 (퍼센트)
    const [inText, setText] = useState<string>("텍스트 한 줄 표시 영역");
    const [chain,setChain] = useState<number>(0);
    const [currentTurn,setTurn] = useState<boolean>(false);
    const [usedq,setq] = useState<string[]>([]);
    const [isError, setIsError] = useState(false);

    useEffect(() => {
        const unsubscribe = subscribe((message) => {
            const j:wsjson = JSON.parse(message) ;
            console.log('B received message:', j,performance.now());
            if (j.type==="game_start"){
                setText(j.start_letter as string);
                setTimeLeft(j.time_limit as number);
                setBarWidth(100);
                console.log(j.player_turn)
                if (!j.player_turn){
                    console.log(socket)
                    socket?.send(JSON.stringify({command:"compin"}))
                }
            }
            else if(j.type==="cturn_yes"){
                setText(j.word as string);
                setChain(j.chain as number);
                setq([...usedq, j.message as string]);
            }
            else if(j.type==="cturn_no"){
                setText(j.word as string)
            }
            else if(j.type==="pturn_start"){
                const timer = setTimeout(()=>{
                    setText(j.letter as string);
                    setTimeLeft(j.time_limit as number);
                    setBarWidth(100);
                },700)
            }
            else if (j.type==="pturn_no"){
                setText(`${j.word} ; ${j.message}`);
                setIsError(true);
                setTimeout(() => {
                    setIsError(false); // 1초 후 원래 상태로 복구
                    setText(j.letter as string);
                    //setInputValue("");
                }, 1000);
            }
            else if (j.type === "pturn_yes") {
                setText(j.word as string);
                setTimeLeft(j.time_limit as number);
                setBarWidth(100);
                //setInputValue("");
            
                setTimeout(() => {
                    setText(j.letter as string);
                }, 1000); 
            }
            

        });
        console.log('f')
        return unsubscribe;
    }, [subscribe])

    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft((prev) => Math.max(0, prev - 1)); // 매 초 감소
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [timeLeft]);

    useEffect(() => {
        // `timeLeft`가 변할 때마다 막대 너비 업데이트
        setBarWidth((timeLeft / 30) * 100); // 퍼센트 계산
    }, [timeLeft]);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(event.target.value);
    };

    const handleConfirm = () => {
        //console.log("입력한 단어:", inputValue);
        socket?.send(JSON.stringify({command:'user_input',input:inputValue}))
        // setText(inputValue);
        setInputValue(""); // 입력값 초기화
        // setTimeLeft(10); // 시간 초기화
        // setBarWidth(100); // 막대 너비 초기화
    };

    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter") {
            handleConfirm();
        }
    };

    return (
        <div className="word-chain-container flex flex-col items-center justify-center h-screen bg-gray-100 w-full">
            {/* 중앙 본 박스 */}
            <div className="main-box-container flex flex-col items-center bg-white shadow-lg border-2 border-black rounded-xl p-4 w-full max-w-2xl relative">
                {/* 본 박스 내용 */}
                <div className={`main-box-content text-center text-xl font-bold ${isError ? "text-red-500" : "text-gray-800"}`}>
                    {inText}
                </div>

                {/* 체인 */}
                <div className="chain-circle bg-blue-300 text-white text-xl font-bold w-12 h-12 flex items-center justify-center rounded-full absolute top-1/2 right-[-60px] transform -translate-y-1/2">
                    {chain}
                </div>
            </div>

            {/* 턴 시간바 */}
            <div className="time-bar-container w-full max-w-2xl mt-4 h-4 bg-gray-300 rounded-full">
                <div
                    className="time-bar bg-blue-500 h-full rounded-full"
                    style={{
                        width: `${barWidth}%`,
                        transition: "width 1s linear", // 부드러운 애니메이션
                    }}
                ></div>
            </div>

            {/* 최근 단어 큐 */}
            <div className="recent-words-queue w-full max-w-2xl flex justify-between items-center mt-6 mb-6">
                {"단어1 단어2 단어3 단어4".split(" ").map((word, index) => (
                    <div
                        key={index}
                        className="recent-word bg-gray-200 text-gray-800 text-sm font-semibold px-3 py-2 rounded-md"
                    >
                        {word}
                    </div>
                ))}
            </div>

            {/* 입력창 및 버튼 */}
            <div className="input-section w-full max-w-2xl flex items-center">
            <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyPress}
                placeholder="단어를 입력하세요"
                className="word-input flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
                onCopy={(e) => e.preventDefault()} // 복사 차단
                onPaste={(e) => e.preventDefault()} // 붙여넣기 차단
            />
                <button
                    onClick={handleConfirm}
                    className="confirm-button ml-4 px-4 py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300"
                >
                    확인
                </button>
            </div>
        </div>
    );
};

export default WordChainGameUI;
