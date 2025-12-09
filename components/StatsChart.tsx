import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { MOCK_TRENDS } from '../constants';

const COLORS = ['#0ea5e9', '#6366f1', '#8b5cf6', '#ec4899', '#94a3b8'];

export const StatsChart: React.FC = () => {
  return (
    <div className="h-64 w-full bg-white rounded-xl shadow-sm border border-slate-100 p-4">
      <h3 className="text-sm font-semibold text-slate-700 mb-4">熱門代購類別</h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={MOCK_TRENDS}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            fill="#8884d8"
            paddingAngle={5}
            dataKey="value"
          >
            {MOCK_TRENDS.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Legend verticalAlign="bottom" height={36}/>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};