import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Sample data (you would replace this with real data)
const generateTimeData = (range) => {
  const data = [];
  const now = new Date();
  for (let i = 0; i < (range === 'day' ? 24 : range === 'week' ? 7 : 30); i++) {
    data.push({
      label: range === 'day' ? `${i}:00` : new Date(now.getTime() - i * 86400000).toLocaleDateString(),
      hours: Math.random() * 5
    });
  }
  return data.reverse();
};

const streakData = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  streak: Math.floor(Math.random() * 2),
  points: (i + 1) * 10
}));

function Streak() {
  const [showTime, setShowTime] = useState(true);
  const [timeRange, setTimeRange] = useState('week');
  const [showDropdown, setShowDropdown] = useState(false);

  const timeData = generateTimeData(timeRange);
  const totalPoints = streakData.reduce((sum, day) => sum + day.points, 0);

  return (
    <div className="p-5 h-[35vh]">
      <div className="shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]  w-full h-full rounded-lg border-black border-2 p-4 overflow-hidden">
        <h2 className="text-sm 400px:text-xl font-bold mb-2">Website Activity</h2>
        
        {/* Toggle Bar */}
        <div className="flex mb-4 bg-gray-200 rounded-lg p-1 ">
          <button
            className={`flex-1 py-1 px-2 rounded-md text-xs 400px:text-base ${showTime ? 'bg-blue-500 text-white' : 'bg-transparent'}`}
            onClick={() => setShowTime(true)}
          >
            Time Spent
          </button>
          <button
            className={`flex-1 py-1 px-2 rounded-md text-xs 400px:text-base ${!showTime ? 'bg-green-500 text-white' : 'bg-transparent'}`}
            onClick={() => setShowTime(false)}
          >
            Streak
          </button>
        </div>

        {showTime ? (
          <>
            {/* Time Range Buttons */}
            <div className="flex mb-2 space-x-1 text-xs">
              {['day', 'week', 'month'].map((range) => (
                <button
                  key={range}
                  className={`py-1 px-2 rounded-md border border-black ${timeRange === range ? 'bg-blue-500 text-white' : 'bg-white'}`}
                  onClick={() => setTimeRange(range)}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </button>
              ))}
            </div>

            {/* Time Spent Graph */}
            <div className="h-[18vh]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timeData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" tick={{fontSize: 10}} />
                  <YAxis tick={{fontSize: 10}} />
                  <Tooltip contentStyle={{ backgroundColor: '#FFF', border: '1px solid #000' }} />
                  <Bar dataKey="hours" fill="#FE90E7" stroke="#000000" strokeWidth={1} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        ) : (
          <>
            {/* Streak Maintenance View */}
            <div className="mb-2 text-sm">
              <span className="font-bold">Total Points: {totalPoints}</span>
            </div>
            <div className="h-[18vh] overflow-y-auto">
              <table className="w-full border-collapse border border-black text-xs">
                <thead>
                  <tr className="bg-green-300">
                    <th className="border border-black p-1">Day</th>
                    <th className="border border-black p-1">Streak</th>
                    <th className="border border-black p-1">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {streakData.map((day) => (
                    <tr key={day.day} className="even:bg-pink-100">
                      <td className="border border-black p-1">{day.day}</td>
                      <td className="border border-black p-1">{day.streak ? '✅' : '❌'}</td>
                      <td className="border border-black p-1">{day.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Streak;