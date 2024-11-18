import React, { useEffect, useRef, useState } from 'react';

interface ChatRoomProps {
  roomName: string;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ roomName }) => {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState<string>('');
  const [connectionStatus, setConnectionStatus] = useState<string>('Connecting...'); // 연결 상태 관리
  const [error, setError] = useState<string | null>(null); // 오류 메시지 관리
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const chatSocket = new WebSocket(`ws://127.0.0.1:8000/ws/chat/${roomName}/`);
    socketRef.current = chatSocket;

    chatSocket.onopen = () => {
      setConnectionStatus('Connected'); // 연결 성공
    };

    chatSocket.onmessage = (e) => {
      const data = JSON.parse(e.data);
      setMessages((prevMessages) => [...prevMessages, data.message]);
    };

    chatSocket.onerror = (e) => {
      setError(`An error occurred while connecting to the WebSocket. ${e.type}`);
      setConnectionStatus('Error'); // 연결 오류
    };

    chatSocket.onclose = (e) => {
      setConnectionStatus('Disconnected'); // 연결 종료
      setError(`WebSocket connection closed unexpectedly. ${e.code}`);
    };

    return () => {
      chatSocket.close();
    };
  }, [roomName]);

  const sendMessage = () => {
    if (socketRef.current && input.trim()) {
      socketRef.current.send(JSON.stringify({ message: input }));
      setInput(''); // 입력 필드 초기화
    }
  };

  return (
    <div>
      <h1>Room: {roomName}</h1>
      {/* 연결 상태 표시 */}
      <div style={{ marginBottom: '10px', color: connectionStatus === 'Error' ? 'red' : 'green' }}>
        Connection Status: {connectionStatus}
      </div>
      {/* 오류 메시지 표시 */}
      {error && <div style={{ marginBottom: '10px', color: 'red' }}>{error}</div>}
      <div
        style={{
          border: '1px solid #ccc',
          padding: '10px',
          height: '300px',
          overflowY: 'scroll',
          marginBottom: '10px',
        }}
      >
        {messages.map((msg, index) => (
          <div key={index}>{msg}</div>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter your message..."
        style={{ width: '80%' }}
      />
      <button onClick={sendMessage} style={{ width: '18%' }}>
        Send
      </button>
    </div>
  );
};

export default ChatRoom;
