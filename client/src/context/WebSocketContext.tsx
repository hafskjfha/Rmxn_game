import React, { createContext, useContext, useState, ReactNode } from "react";

// WebSocketContext 생성
const WebSocketContext = createContext<WebSocket | null>(null);

interface WebSocketProviderProps {
  children: ReactNode; // children 속성을 명시적으로 정의
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);

  // 웹소켓을 초기화하는 함수
  const initializeWebSocket = () => {
    if (!socket) {
      const nickname = localStorage.getItem("nickname") || "Guest";
      const ws = new WebSocket(
        `${process.env.REACT_APP_WS_URI}/ws/lobby/?nickname=${encodeURIComponent(nickname)}`
      );

      ws.onopen = () => console.log("WebSocket connected");
      ws.onclose = () => console.log("WebSocket disconnected");
      setSocket(ws);
    }
  };

  return (
    <WebSocketContext.Provider value={socket}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);
