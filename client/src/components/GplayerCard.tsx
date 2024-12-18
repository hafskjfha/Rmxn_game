// PlayerCard.tsx
import React from "react";
import { motion } from "framer-motion";

interface PlayerCardProps {
    name: string;
    icon: string;
    isActive: boolean;
    bgColor: string;
    textColor: string;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ name, icon, isActive, bgColor, textColor }) => {
    return (
        <motion.div
            className={`player-card flex items-center p-4 rounded-lg shadow ${bgColor} ${isActive ? 'bg-green-200' : ''}`}
            animate={{ scale: isActive ? 1.05 : 1 }}
            transition={{ duration: 0.5, repeat: isActive ? Infinity : 0 }}
        >
            <span className={`material-icons text-3xl mr-4 ${textColor}`}>{icon}</span>
            <span className="text-lg font-bold text-gray-800">{name}</span>
        </motion.div>
    );
};

export default PlayerCard;
