import React, { useState, useEffect } from 'react';
import { createBrowserRouter, RouterProvider, useNavigate } from 'react-router-dom';
import ChatRoom from './components/ChatRoom';
import Lobby from './components/Lobby';
import GameLobby from './components/RoomLobby';
import axios from 'axios';
import './App.css';
import { WebSocketProvider } from './components/GWebSocketProvider';
import ComputerGameLobby from './components/ComputerGameLobby';

//const response={status:201}

const Home: React.FC = () => {
	const [nickname, setNickname] = useState<string>('');
	const [isNicknameValid, setIsNicknameValid] = useState<boolean>(false);
	const [errorMessage, setErrorMessage] = useState<string>('');
	const [isLobbyButtonEnabled, setIsLobbyButtonEnabled] = useState<boolean>(false);
	const navigate = useNavigate();

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
			const response = { status: 201 };
			if (response.status === 201) {
				localStorage.setItem('nickname', nickname);
				setIsLobbyButtonEnabled(true);
			}
		} catch (error: any) {
			setErrorMessage('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
		}
	};

	const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setNickname(value);
		setIsNicknameValid(value.length >= 3 && value.length <= 20);
	};

	const handleLogout = () => {
		localStorage.removeItem('nickname');
		setNickname('');
		setIsLobbyButtonEnabled(false);
	};

	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-500 to-purple-500 text-white">
			<h1 className="text-4xl font-bold mb-4">🌟 HOME 🌟</h1>
			<h2 className="text-xl mb-8">Welcome, 그투!</h2>
			{!isLobbyButtonEnabled ? (
				<div className="flex flex-col items-center space-y-4">
					<input
						type="text"
						value={nickname}
						onChange={handleNicknameChange}
						placeholder="닉네임을 입력하세요"
						className="w-64 p-3 text-white bg-transparent border border-white rounded-md text-center placeholder-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
					/>
					<button
						onClick={handleNicknameSubmit}
						disabled={!isNicknameValid}
						className={`w-64 py-2 px-4 rounded-md text-lg ${isNicknameValid
							? 'bg-green-500 hover:bg-green-600 transition-all'
							: 'bg-gray-500 cursor-not-allowed'
							}`}
					>
						닉네임 설정
					</button>
					{errorMessage && <p className="text-red-300">{errorMessage}</p>}
				</div>
			) : (
				<div className="flex flex-col items-center space-y-4">
					<p className="text-2xl">안녕하세요, {nickname}님!</p>
					<button
						onClick={() => navigate('/lobby')}
						className="w-64 py-2 px-4 rounded-md bg-blue-500 hover:bg-blue-600 text-lg transition-all"
					>
						로비 입장
					</button>
					<button
						onClick={handleLogout}
						className="w-64 py-2 px-4 rounded-md bg-red-500 hover:bg-red-600 text-lg transition-all"
					>
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
		{ path: "/lobby", element: <Lobby /> },
		{ path: "/game/:id", element: <GameLobby roomId={1} roomName="방제목" settings="dd" isHost={true} /> },
		{ path:"/vs-computer",element:<WebSocketProvider><ComputerGameLobby/></WebSocketProvider>}
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
	return <RouterProvider router={router} future={{ v7_startTransition: true, }} />;
};

export default App;
