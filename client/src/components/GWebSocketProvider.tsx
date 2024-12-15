import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

interface WebSocketContextType {
    socket: WebSocket | null;
    subscribe: (callback: (message: string) => void) => () => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const subscribers = useRef<Array<(message: string) => void>>([]);

    useEffect(() => {
        // WebSocket 연결 설정
        const ws = new WebSocket(`${process.env.REACT_APP_WS_URI}/ws/cgame/`); // WebSocket 서버 URL
        setSocket(ws);

        ws.onopen = () => {
            console.log('GameWebSocket connected');
        };

        ws.onmessage = (event) => {

            // 구독자들에게 메시지 전달
            subscribers.current.forEach((callback) => callback(event.data));
        };

        ws.onclose = () => {
            console.log('GameWebSocket disconnected');
            setSocket(null);
        };

    }, []);

    // 메시지 구독 및 구독 취소 함수
    const subscribe = (callback: (message: string) => void): (() => void) => {
        subscribers.current.push(callback);

        // 구독 취소 함수 반환
        return () => {
            subscribers.current = subscribers.current.filter((cb) => cb !== callback);
        };
    };

    return (
        <WebSocketContext.Provider value={{ socket: socket, subscribe }}>
            {children}
        </WebSocketContext.Provider>
    );
};

// WebSocketContext 사용을 위한 커스텀 훅
export const useWebSocket = (): WebSocketContextType => {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error('useWebSocket must be used within a WebSocketProvider');
    }
    return context;
};