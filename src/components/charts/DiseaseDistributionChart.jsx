import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

export const DiseaseDistributionChart = () => {
  const data = [
    { name: 'Canine Babesiosis', value: 42, color: '#f43f5e' }, // Rose
    { name: 'Canine Ehrlichiosis', value: 35, color: '#8b5cf6' }, // Purple
    { name: 'Canine Dirofilariasis', value: 18, color: '#0ea5e9' }, // Sky
    { name: 'Canine Hepatozoonosis', value: 15, color: '#f59e0b' }, // Amber
    { name: 'Negative (Healthy Controls)', value: 40, color: '#10b981' } // Emerald
  ];

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={4}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
            formatter={(value) => [`${value} cases`, 'Total Diagnoses']}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            formatter={(value) => <span className="text-xs text-slate-600 font-medium">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
