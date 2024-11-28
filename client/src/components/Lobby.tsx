import React, { useState, useEffect, useRef } from "react";
import "./css/Lobby.css";
import "./css/RoomCard.css";
import { useNavigate } from "react-router-dom";
import Modal from "./Modal";

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
interface roominfo {
  id:number;
  name:string;
  settings:string;
  isPlaying:boolean;
}
const Lobby: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState("");
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [rooms, setRooms] = useState<roominfo[]>([]);
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false);
  const [showDictionaryModal, setShowDictionaryModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [roomTitle, setRoomTitle] = useState("");
  const [useOneWord, setUseOneWord] = useState(false);
  const [initialTime, setInitialTime] = useState<string>("60");
  const navigate = useNavigate();

  useEffect(() => {
    const nickname = localStorage.getItem("nickname") || "Guest";
    if (!localStorage.getItem("nickname")) {
      alert("로그인을 해주세요");
      navigate("/");
    }
    const ws = new WebSocket(
      `ws://127.0.0.1:8000/ws/lobby/?nickname=${encodeURIComponent(nickname)}`
    );
    setSocket(ws);

    ws.onopen = () => {
      console.log("WebSocket open!");
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log(data);

      if (data.message_type === "chat" && data.name && data.message) {
        setMessages((prev) => [
          ...prev,
          { nickname: data.name, message: data.message },
        ]);
      }

      if (data.message_type === "room_create" && data.room_name && data.room_number && data.room_setting) {
        // Add the new room to the list
        setRooms((prev) => [
          ...prev,
          {
            id: data.room_number,
            name: data.room_name,
            settings: data.room_setting,
            isPlaying: false,
          },
        ]);
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
    const name = localStorage.getItem("nickname") || "";
    if (socket && message.trim()) {
      socket.send(JSON.stringify({ commend: "chat", message, name }));
      setMessage("");
    }
  };

  const handleCreateRoom = () => {
    if (socket) {
      const setting = useOneWord ? `${initialTime}초` : `매너/${initialTime}초`;
      socket.send(
        JSON.stringify({ commend: "room_create", name: roomTitle, setting })
      );
      setShowCreateRoomModal(false); // Close modal after creation
      setRoomTitle(""); // Reset the room title
      setUseOneWord(false); // Reset checkbox
      setInitialTime("60"); // Reset initial time
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="lobby-container">
      <aside className="users-section">
        <h2>접속 중인 유저</h2>
      </aside>

      <main className="rooms-section">
        <h2>방 목록</h2>
        <div className="rooms-list">
          {rooms.map((room) => (
            <RoomCard
              key={room.id}
              roomNumber={room.id}
              roomName={room.name}
              gameSettings={room.settings}
              isPlaying={room.isPlaying}
            />
          ))}
        </div>

        <div className="buttons-section">
          <button onClick={() => setShowCreateRoomModal(true)}>방 만들기</button>
          <button onClick={() => setShowDictionaryModal(true)}>사전</button>
        </div>

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

      {/* Modals */}
      {showCreateRoomModal && (
        <Modal onClose={() => setShowCreateRoomModal(false)}>
          <h2>방 만들기</h2>
          <div className="form-group">
            <label htmlFor="room-title">방 제목</label>
            <input
              id="room-title"
              type="text"
              placeholder="방 제목 입력"
              value={roomTitle}
              onChange={(e) => setRoomTitle(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>설정</label>
            <div>
              <label>
                <input
                  type="checkbox"
                  checked={useOneWord}
                  onChange={(e) => setUseOneWord(e.target.checked)}
                />
                한방 단어 허용
              </label>
            </div>
            <div>
              <span>처음 시간 설정:</span>
              <label>
                <input
                  type="radio"
                  name="initial-time"
                  value="60"
                  checked={initialTime === "60"}
                  onChange={(e) => setInitialTime(e.target.value)}
                />
                60초
              </label>
              <label>
                <input
                  type="radio"
                  name="initial-time"
                  value="30"
                  checked={initialTime === "30"}
                  onChange={(e) => setInitialTime(e.target.value)}
                />
                30초
              </label>
              <label>
                <input
                  type="radio"
                  name="initial-time"
                  value="10"
                  checked={initialTime === "10"}
                  onChange={(e) => setInitialTime(e.target.value)}
                />
                10초
              </label>
            </div>
          </div>
          <button
            onClick={handleCreateRoom}
            disabled={!roomTitle.trim()}
          >
            확인
          </button>
        </Modal>
      )}

      {showDictionaryModal && (
        <Modal onClose={() => setShowDictionaryModal(false)}>
          <h2>사전</h2>
          <input type="text" placeholder="단어 입력" />
          <div>결과: </div>
        </Modal>
      )}
    </div>
  );
};

export default Lobby;

