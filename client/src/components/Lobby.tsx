import React, { useState, useEffect, useRef } from 'react';
import "./css/Lobby.css";
import "./css/RoomCard.css";
import { useNavigate } from 'react-router-dom';

interface RoomCardProps {
  roomName: string;
  roomNumber: number;
  gameSettings: string;
  isPlaying: boolean;
}

const RoomCard: React.FC<RoomCardProps> = ({ roomNumber, roomName, gameSettings, isPlaying }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/game/${roomNumber}`);
  };

  return (
    <div
      className={`room-card ${isPlaying ? "playing" : "not-playing"}`}
      onClick={handleClick}
      style={{ cursor: "pointer" }}
    >
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

interface ChatMessage {
  nickname: string;
  message: string;
}

const Lobby: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState("");
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    const nickname = localStorage.getItem("nickname") || "Guest";
    if (!localStorage.getItem("nickname")){
      alert('로그인을 해주세요');
      navigate('/');
    }
    const ws = new WebSocket(`ws://127.0.0.1:8000/ws/lobby/?nickname=${encodeURIComponent(nickname)}`);
    setSocket(ws);
    ws.onopen = () =>{
      console.log('ws open!');
    }
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log(data);
      // 메시지 타입이 "chat"인 경우만 처리
      if (data.message_type === "chat" && data.name && data.message) {
        setMessages((prev) => [...prev, { nickname: data.name, message: data.message }]);
      }
    };

    ws.onclose = () => {
      console.log("WebSocket closed");
    };

    return () => {
      ws.close();
    };
  }, []);

  const sendMessage = () => {
    const name = localStorage.getItem("nickname") || "Guest";
    if (socket && message.trim()) {
      socket.send(JSON.stringify({ commend: "chat", message,name }));
      setMessage("");
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

      {/* 방 목록 및 채팅 */}
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

        {/* 로비 채팅 */}
        <div className="chat-container">
          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div key={index} className="chat-message">
                <strong>{msg.nickname}</strong>: {msg.message}
              </div>
            ))}
            <div ref={messagesEndRef}></div>
          </div>
          <div className="chat-input">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="메시지를 입력하세요..."
            />
            <button onClick={sendMessage}>전송</button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Lobby;
