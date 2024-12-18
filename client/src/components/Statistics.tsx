import React from "react";

interface StatisticsProps {
    computerWin: number;
    userWin: number;
}

const Statistics: React.FC<StatisticsProps> = ({ computerWin, userWin }) => {
    const totalGames = computerWin + userWin;
    const computerWinRate = totalGames > 0 ? ((computerWin / totalGames) * 100).toFixed(2) : "0.00";
    const userWinRate = totalGames > 0 ? ((userWin / totalGames) * 100).toFixed(2) : "0.00";

    // 통계 데이터를 정렬
    const stats = [
        { name: "컴퓨터", wins: computerWin, rate: computerWinRate, color: "blue" },
        { name: "유저", wins: userWin, rate: userWinRate, color: "green" },
    ].sort((a, b) => b.wins - a.wins); // 승리 수 기준 내림차순 정렬

    return (
        <aside className="users-section w-1/8 p-4 bg-gray-100 border-r border-gray-300">
            <h2 className="text-xl font-bold mb-4">게임 통계</h2>
            <div className="space-y-4">
                {stats.map((stat, index) => (
                    <div
                        key={index}
                        className={`p-4 bg-${stat.color}-50 rounded-lg shadow-md`}
                    >
                        <h3 className={`text-lg font-semibold text-${stat.color}-700`}>
                            {stat.name}
                        </h3>
                        <p className="mt-2 text-gray-700">
                            승리 수: <span className="font-bold">{stat.wins}</span>
                        </p>
                        <p className="text-gray-700">
                            승률: <span className="font-bold">{stat.rate}%</span>
                        </p>
                    </div>
                ))}
            </div>
        </aside>
    );
};

export default Statistics;
