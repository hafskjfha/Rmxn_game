import React, { useState } from 'react';
import { createBrowserRouter, RouterProvider, useNavigate } from 'react-router-dom';
import ChatRoom from './components/ChatRoom';

const Home: React.FC = () => {
  const [roomNumber, setRoomNumber] = useState('');
  const navigate = useNavigate();

  const handleJoinRoom = () => {
    if (roomNumber.trim()) {
      navigate(`/chat/${roomNumber}`);
    } else {
      alert('방 번호를 입력해주세요!');
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>채팅 방에 들어가기</h1>
      <input
        type="text"
        placeholder="방 번호를 입력하세요"
        value={roomNumber}
        onChange={(e) => setRoomNumber(e.target.value)}
        style={{ padding: '10px', fontSize: '16px' }}
      />
      <button onClick={handleJoinRoom} style={{ padding: '10px', marginLeft: '10px' }}>
        입장
      </button>
    </div>
  );
};

const router = createBrowserRouter(
  [
    { path: "/", element: <Home /> },
    { path: "/chat/:roomName", element: <ChatRoom /> },
  ],
  {
    future: {
        v7_fetcherPersist: true,
        v7_normalizeFormMethod: true,
        v7_partialHydration: true,
        v7_relativeSplatPath: true,
        v7_skipActionErrorRevalidation: true,
    },
  }
);

const App: React.FC = () => {
  return <RouterProvider router={router} future={{v7_startTransition:true,}}/>;
};

export default App;
