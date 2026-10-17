import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const OutcomeChart = () => {
  const data = [
    { week: 'Wk 1', positive: 18, negative: 12 },
    { week: 'Wk 2', positive: 24, negative: 15 },
    { week: 'Wk 3', positive: 21, negative: 18 },
    { week: 'Wk 4', positive: 31, negative: 22 },
  ];

  return (
    <div className="h-60 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="posGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0}/>
            </linearGradient>
            <linearGradient id="negGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
          <Area type="monotone" dataKey="positive" name="Positive Cases" stroke="#f43f5e" fillOpacity={1} fill="url(#posGrad)" strokeWidth={2} />
          <Area type="monotone" dataKey="negative" name="Negative Controls" stroke="#10b981" fillOpacity={1} fill="url(#negGrad)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
