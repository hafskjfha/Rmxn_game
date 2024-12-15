import React from "react";

interface Participant {
    nickname: string;
    isHost?: boolean;
    isReady: boolean;
}

interface ParticipantListProps {
    participants: Participant[];
}

const ParticipantList: React.FC<ParticipantListProps> = ({ participants }) => {
    return (
        <div className="participants w-full max-w-md bg-white shadow-lg rounded-xl p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">참여자 목록</h3>
            <ul>
                {participants.map((participant, index) => (
                    <li
                        key={index}
                        className={`flex items-center justify-between p-3 ${participant.isReady ? "bg-green-50" : "bg-blue-50"
                            } rounded-lg shadow-sm mb-3`}
                    >
                        {/* 닉네임 강조 */}
                        <div className="flex items-center gap-4">
                            {/* 아이콘 표시 */}
                            <span
                                className={`material-icons text-3xl ${participant.isHost
                                        ? "text-blue-600"
                                        : participant.isReady
                                            ? "text-green-500"
                                            : "text-gray-400"
                                    }`}
                            >
                                {participant.isHost ? "person" : "computer"}
                            </span>

                            {/* 닉네임 스타일 */}
                            <div
                                className={`text-lg font-bold ${participant.isHost
                                        ? "text-blue-700"
                                        : participant.isReady
                                            ? "text-green-700"
                                            : "text-gray-700"
                                    }`}
                            >
                                {participant.nickname}
                            </div>
                        </div>

                        {/* 상태 표시 */}
                        <span
                            className={`text-sm ${participant.isReady ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                                } px-3 py-1 rounded-full font-medium`}
                        >
                            {participant.isHost ? "호스트" : participant.isReady ? "준비됨" : "대기 중"}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ParticipantList;
