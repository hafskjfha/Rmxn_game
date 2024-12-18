import React, { useState} from "react";
import "./css/GameLobby.css";
import { useNavigate } from "react-router-dom";

interface GameLobbyProps {
  roomId: number;
  roomName: string;
  settings: string;
  isHost: boolean; // 방장 여부
}

interface HeaderProps {
  roomId: number;
  roomName: string;
  settings: string;
}

interface User {
  name: string;
  status: string;
  isHost: boolean;
}

interface UserListProps {
  users: User[];
}

interface UserItemProps {
  user: User;
}

const Header: React.FC<HeaderProps> = ({ roomId, roomName, settings }) => {
  return (
    <div className="header">
      <h2>{`Room ${roomId}: ${roomName}`}</h2>
      <p>{`Settings: ${settings}`}</p>
    </div>
  );
};

const UserList: React.FC<UserListProps> = ({ users }) => {
  return (
    <div className="user-list">
      <h3>Users in the Room</h3>
      <ul>
        {users.map((user, index) => (
          <UserItem key={index} user={user} />
        ))}
      </ul>
    </div>
  );
};

const UserItem: React.FC<UserItemProps> = ({ user }) => {
  return (
    <li className="user-item">
      <span className="user-name">{user.name}</span>
      <span
        className={`user-status ${
          user.isHost ? "host" : user.status === "Ready" ? "ready" : ""
        }`}
      >
        {user.isHost ? "Host" : user.status}
      </span>
    </li>
  );
};

const GameLobby: React.FC<GameLobbyProps> = ({
  roomId,
  roomName,
  settings,
  isHost,
}) => {
  const [users, setUsers] = useState<User[]>([
    { name: "HostUser", status: "Ready", isHost: true },
    { name: "User1", status: "Ready", isHost: false },
    { name: "User2", status: "Not Ready", isHost: false },
  ]);

  const [isReady, setIsReady] = useState(false); // 현재 유저의 준비 상태
  const [isOpen, setIsOpen] = useState(false);  // 모달 상태
  const [message, setMessage] = useState('');   // 모달 메시지
  const navigate = useNavigate()
  const toggleReady = () => {
    setIsReady((prev) => !prev);

    // 자신의 상태를 업데이트
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.name === "User2" // User2를 현재 유저라고 가정
          ? { ...user, status: isReady ? "Not Ready" : "Ready" }
          : user
      )
    );
  };

  const startGame = () => {
    if (isHost) {
      alert("게임을 시작합니다!");
      // 게임 시작 로직 추가
    }
  };

  const leaveRoom = () => {
    //alert("방을 나갑니다.");
    navigate('/lobby')
    
    // 방 나가기 로직 추가
  };

  const openModal = (msg:string) => {
    setMessage(msg);  // 전달받은 메시지를 모달에 표시
    setIsOpen(true);   // 모달 열기
  };

  const closeModal = (confirm:boolean) => {
    setIsOpen(false); // 모달 닫기
    if (confirm) {
      leaveRoom();
    } 
  };

  return (
    <div className="lobby">
      <Header roomId={roomId} roomName={roomName} settings={settings} />
      <UserList users={users} />
      <div className="actions">
        {isHost ? (
          <button className="start-button" onClick={startGame}>
            Start Game
          </button>
        ) : (
          <button className="ready-button" onClick={toggleReady}>
            {isReady ? "Cancel Ready" : "Ready"}
          </button>
        )}
        <button className="leave-button" onClick={() => openModal('방을 나가시겠습니까?')}>
          Leave Room
        </button>
        {isOpen && (
        <div className="modal">
          <div className="modal-content">
            <p>{message}</p>
            <button onClick={() => closeModal(true)}>확인</button>
            <button onClick={() => closeModal(false)}>취소</button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default GameLobby;
