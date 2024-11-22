import React, { useState, useEffect } from 'react';
import { createBrowserRouter, RouterProvider, useNavigate } from 'react-router-dom';
import ChatRoom from './components/ChatRoom';
import Lobby from './components/Lobby';
import GameLobby from './components/RoomLobby';
import axios from 'axios';
import './App.css';

// const Home: React.FC = () => {
//   const [roomNumber, setRoomNumber] = useState('');
//   const navigate = useNavigate();

//   const handleJoinRoom = () => {
//     if (roomNumber.trim()) {
//       navigate(`/chat/${roomNumber}`);
//     } else {
//       alert('방 번호를 입력해주세요!');
//     }
//   };

//   return (
//     <div style={{ textAlign: 'center', marginTop: '50px' }}>
//       <h1>채팅 방에 들어가기</h1>
//       <input
//         type="text"
//         placeholder="방 번호를 입력하세요"
//         value={roomNumber}
//         onChange={(e) => setRoomNumber(e.target.value)}
//         style={{ padding: '10px', fontSize: '16px' }}
//       />
//       <button onClick={handleJoinRoom} style={{ padding: '10px', marginLeft: '10px' }}>
//         입장
//       </button>
//     </div>
//   );
// };

// const router = createBrowserRouter(
//   [
//     { path: "/", element: <Home /> },
//     { path: "/chat/:roomName", element: <ChatRoom /> },
//   ],
//   {
//     future: {
//         v7_fetcherPersist: true,
//         v7_normalizeFormMethod: true,
//         v7_partialHydration: true,
//         v7_relativeSplatPath: true,
//         v7_skipActionErrorRevalidation: true,
//     },
//   }
// );

// const App: React.FC = () => {
//   return <RouterProvider router={router} future={{v7_startTransition:true,}}/>;
// };



//const response={status:201}

const Home: React.FC = () => {
  const [nickname, setNickname] = useState<string>('');
  const [isNicknameValid, setIsNicknameValid] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isLobbyButtonEnabled, setIsLobbyButtonEnabled] = useState<boolean>(false);
  const navigate = useNavigate()

  useEffect(() => {
    const storedNickname = localStorage.getItem('nickname');
    if (storedNickname) {
      setNickname(storedNickname);
      setIsLobbyButtonEnabled(true);
    }
  }, []);

  const handleNicknameSubmit = async () => {
    try {
      setErrorMessage('');
      //const response = await axios.post('/api/guest', { nickname });
      const response={status:201}
      if (response.status === 201) {
        localStorage.setItem('nickname', nickname);
        setIsLobbyButtonEnabled(true);
      }
    } catch (error: any) {
      if (error.response) {
        const { status, data } = error.response;
        if (status === 409) {
          setErrorMessage('중복된 닉네임입니다.');
        } else if (status === 400) {
          setErrorMessage('부적절한 닉네임입니다.');
        } else {
          setErrorMessage('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        }
      } else {
        setErrorMessage('네트워크 오류가 발생했습니다.');
      }
    }
  };

  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNickname(value);
    setIsNicknameValid(value.length >= 3 && value.length <= 20);
  };

  const handleLogout = async () => {
    try {
      // 서버에 닉네임 삭제 요청
      //await axios.delete('/api/guest', { data: { nickname } });
      // 로컬스토리지에서 닉네임 삭제
      localStorage.removeItem('nickname');
      setNickname('');
      setIsLobbyButtonEnabled(false);
    } catch (error: any) {
      setErrorMessage('로그아웃 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  return (
    <div>
      <h1>🌟 HOME 🌟</h1>
      <h2>welcome 그투!</h2>
      {!isLobbyButtonEnabled ? (
        <div className="container">
          <input
            type="text"
            value={nickname}
            onChange={handleNicknameChange}
            placeholder="닉네임을 입력하세요"
          />
          <button onClick={handleNicknameSubmit} disabled={!isNicknameValid}>
            닉네임 설정
          </button>
          {errorMessage && <p className="error-message">{errorMessage}</p>}
        </div>
      ) : (
        <div className="container">
          <p className="nickname-display">안녕하세요, {nickname}님!</p>
          <button
            className="lobby-button"
            onClick={() => navigate('/lobby')}
          >
            로비 입장
          </button>
          <button className="logout-button" onClick={handleLogout}>
            로그아웃
          </button>
        </div>
        
      )}
    </div>
  );
};
const router = createBrowserRouter(
  [
    { path: "/", element: <Home /> },
    { path: "/chat/:roomName", element: <ChatRoom /> },
    { path: "/lobby", element: <Lobby />},
    { path: "/game/:id", element: <GameLobby roomId={1} roomName="방제목" settings="dd" isHost={true}/> }
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
