import React, { useState, useEffect, useRef } from "react";
import "./css/Lobby.css";
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
  className={`room-card p-4 border rounded shadow ${
    isPlaying ? "bg-gray-200" : "bg-white"
  }`}
  onClick={handleClick}
  style={{ cursor: "pointer" }}
>
  <div className="room-header flex justify-between items-center">
    <span className="room-number text-sm font-semibold text-gray-500">
      방 #{roomNumber}
    </span>
    <span className="room-name text-lg font-bold text-gray-700">
      {roomName}
    </span>
  </div>
  <div className="room-footer mt-2">
    <span className="game-settings text-sm text-gray-500">{gameSettings}</span>
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
    <div className="lobby-container flex h-screen">
      {/* 접속 중인 유저 섹션 */}
  <aside className="users-section w-1/5 p-4 bg-gray-100 border-r border-gray-300">
    <h2 className="text-xl font-bold mb-4">접속 중인 유저</h2>
    {/* 유저 목록은 여기에 */}
  </aside>

  {/* 메인 섹션 */}
  <main className="rooms-section flex-1 flex flex-col p-4">
    {/* 방 목록 헤더 */}
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-2xl font-bold">방 목록</h2>
      <div className="flex gap-4">
        <button
          onClick={() => setShowCreateRoomModal(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
        >
          방 만들기
        </button>
        <button
          onClick={() => setShowDictionaryModal(true)}
          className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition"
        >
          사전
        </button>
      </div>
    </div>

    {/* 방 목록 */}
    <div className="flex-1 overflow-auto">
      <div className="rooms-list grid grid-cols-2 gap-4">
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
    </div>

    {/* 채팅 섹션 */}
    <div className="chat-container h-1/4 mt-4 border-t border-gray-300 flex flex-col">
      <div className="chat-messages overflow-y-auto h-full p-2 bg-white border border-gray-300 rounded">
        {messages.map((msg, index) => (
          <div key={index} className="chat-message">
            <strong>{msg.nickname}</strong>: {msg.message}
          </div>
        ))}
      </div>
      <div className="chat-input flex mt-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="메시지를 입력하세요..."
          className="flex-1 p-2 border border-gray-300 rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={sendMessage}
          className="px-4 bg-blue-500 text-white rounded-r hover:bg-blue-600"
        >
          전송
        </button>
      </div>
    </div>
  </main>

      {/* 방 만들기 모달 */}
      {showCreateRoomModal && (
        <Modal onClose={() => setShowCreateRoomModal(false)}>
          <h2 className="text-xl font-bold mb-4">방 만들기</h2>
          <div className="mb-4">
            <label htmlFor="room-title" className="block text-sm font-medium">
              방 제목
            </label>
            <input
              id="room-title"
              type="text"
              placeholder="방 제목 입력"
              value={roomTitle}
              onChange={(e) => setRoomTitle(e.target.value)}
              className="w-full p-2 border rounded-md"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium">설정</label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={useOneWord}
                onChange={(e) => setUseOneWord(e.target.checked)}
                className="form-checkbox"
              />
              <span>한방 단어 허용</span>
            </label>
            <div className="mt-2 space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="initial-time"
                  value="60"
                  checked={initialTime === "60"}
                  onChange={(e) => setInitialTime(e.target.value)}
                  className="form-radio"
                />
                <span>60초</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="initial-time"
                  value="30"
                  checked={initialTime === "30"}
                  onChange={(e) => setInitialTime(e.target.value)}
                  className="form-radio"
                />
                <span>30초</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="initial-time"
                  value="10"
                  checked={initialTime === "10"}
                  onChange={(e) => setInitialTime(e.target.value)}
                  className="form-radio"
                />
                <span>10초</span>
              </label>
            </div>
          </div>
          <button
            onClick={handleCreateRoom}
            disabled={!roomTitle.trim()}
            className="w-full px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
          >
            확인
          </button>
        </Modal>
      )}

      {/* 사전 모달 */}
      {showDictionaryModal && (
        <Modal onClose={() => setShowDictionaryModal(false)}>
          <h2 className="text-xl font-bold mb-4">사전</h2>
          <input
            type="text"
            placeholder="단어 입력"
            className="w-full p-2 border rounded-md"
          />
          <div className="mt-2">결과: </div>
        </Modal>
      )}
    </div>
  );
};

export default Lobby;

