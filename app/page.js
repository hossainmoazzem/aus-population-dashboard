'use client';
import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/population')
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8 text-center text-xl">Loading Population Metrics...</div>;

  const latestData = data[data.length - 1];

  return (
    <main className="min-h-screen bg-gray-50 p-8 text-gray-900 font-sans">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Australian Population Dashboard</h1>
          <p className="text-gray-500">Live data sourced directly via ABS REST Services</p>
        </header>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 max-w-sm">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Current Population Total</h3>
          <p className="text-4xl font-extrabold text-blue-600 mt-2">{latestData?.populationInMillions}M</p>
          <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded mt-2 inline-block">
            As of {latestData?.quarter}
          </span>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold mb-4">Quarterly Growth Trend</h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="quarter" stroke="#888888" fontSize={12} />
                <YAxis domain={['dataMin - 0.5', 'dataMax + 0.5']} tickFormatter={(val) => `${val}M`} stroke="#888888" fontSize={12} />
                <Tooltip formatter={(value) => [`${value} Million`, 'Population']} />
                <Line type="monotone" dataKey="populationInMillions" stroke="#2563eb" strokeWidth={3} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </main>
  );
}
