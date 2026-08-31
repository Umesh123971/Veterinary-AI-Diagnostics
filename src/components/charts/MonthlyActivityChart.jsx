import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export const MonthlyActivityChart = () => {
  const data = [
    { month: 'Mar', Babesiosis: 14, Ehrlichiosis: 10, Dirofilariasis: 6, Hepatozoonosis: 4 },
    { month: 'Apr', Babesiosis: 18, Ehrlichiosis: 12, Dirofilariasis: 8, Hepatozoonosis: 5 },
    { month: 'May', Babesiosis: 25, Ehrlichiosis: 19, Dirofilariasis: 12, Hepatozoonosis: 8 },
    { month: 'Jun', Babesiosis: 32, Ehrlichiosis: 24, Dirofilariasis: 15, Hepatozoonosis: 10 },
    { month: 'Jul', Babesiosis: 38, Ehrlichiosis: 28, Dirofilariasis: 16, Hepatozoonosis: 12 },
    { month: 'Aug', Babesiosis: 42, Ehrlichiosis: 35, Dirofilariasis: 18, Hepatozoonosis: 15 }
  ];

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
          <Bar dataKey="Babesiosis" fill="#f43f5e" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Ehrlichiosis" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Dirofilariasis" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Hepatozoonosis" fill="#f59e0b" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
