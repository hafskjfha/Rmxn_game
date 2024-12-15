import React from "react";

interface RoomInfoCardProps {
    roomName: string;
    settings: string;
}

const RoomInfoCard: React.FC<RoomInfoCardProps> = ({ roomName, settings }) => {
    return (
        <div className="room-info w-full max-w-md bg-white shadow-lg rounded-xl p-6 mb-6 border-t-4 border-blue-500">
            <h2 className="text-3xl font-extrabold text-blue-600 mb-2 flex items-center gap-2">
                <span className="material-icons text-blue-400"></span>
                {roomName}
            </h2>
            <p className="text-gray-600 text-lg">
                방 설정: <span className="font-semibold text-blue-700">{settings}</span>
            </p>
        </div>
    );
};

export default RoomInfoCard;
