
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { MOCK_ANALYTICS } from '../constants';

const StatCard: React.FC<{ title: string; value: string; trend: string; isUp: boolean }> = ({ title, value, trend, isUp }) => (
  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
    <p className="text-sm font-medium text-gray-500">{title}</p>
    <div className="mt-2 flex items-baseline space-x-2">
      <span className="text-2xl font-bold text-gray-900">{value}</span>
      <span className={`text-xs font-semibold ${isUp ? 'text-green-600' : 'text-red-600'}`}>
        {isUp ? '↑' : '↓'} {trend}
      </span>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Views" value="45.2k" trend="12%" isUp={true} />
        <StatCard title="Subscribers" value="1,240" trend="5.4%" isUp={true} />
        <StatCard title="Active Posts" value="28" trend="2" isUp={true} />
        <StatCard title="Avg. Read Time" value="4m 32s" trend="0.5%" isUp={false} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Traffic Overview</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={MOCK_ANALYTICS}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Area type="monotone" dataKey="views" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Engagement vs Views</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_ANALYTICS}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <Tooltip 
                   contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                />
                <Legend />
                <Bar dataKey="views" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="likes" fill="#fbbf24" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Recent Notifications</h3>
          <button className="text-indigo-600 text-sm font-medium hover:underline">View all</button>
        </div>
        <div className="divide-y divide-gray-100">
          {[1, 2, 3].map((i) => (
            <div key={i} className="px-6 py-4 flex items-start space-x-4">
              <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 flex-shrink-0">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">New subscriber: Sarah Jenkins</p>
                <p className="text-sm text-gray-500">2 hours ago</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
