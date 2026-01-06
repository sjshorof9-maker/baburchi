
import React from 'react';
import { Order, OrderStatus, User, UserRole, Product, Lead } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  orders: Order[];
  products: Product[];
  leads: Lead[];
  currentUser: User;
}

const Dashboard: React.FC<DashboardProps> = ({ orders, products, leads, currentUser }) => {
  const isAdmin = currentUser.role === UserRole.ADMIN;
  
  const filteredOrders = isAdmin 
    ? orders 
    : orders.filter(o => o.moderatorId === currentUser.id);

  const filteredLeads = isAdmin
    ? leads
    : leads.filter(l => l.moderatorId === currentUser.id);

  const totalOrdersCount = filteredOrders.length;
  const confirmedOrders = filteredOrders.filter(o => o.status === OrderStatus.CONFIRMED || o.status === OrderStatus.DELIVERED).length;
  const pendingOrdersCount = filteredOrders.filter(o => o.status === OrderStatus.PENDING).length;
  const cancelledOrders = filteredOrders.filter(o => o.status === OrderStatus.CANCELLED).length;
  const confirmationRate = totalOrdersCount > 0 ? Math.round((confirmedOrders / totalOrdersCount) * 100) : 0;
  const orderVelocity = totalOrdersCount > 0 ? (confirmedOrders / (totalOrdersCount + cancelledOrders)).toFixed(1) : "0.0";
  const pendingCalls = filteredLeads.filter(l => l.status === 'new').length;

  const statusData = [
    { name: 'Pending', value: pendingOrdersCount, color: '#FBBF24' },
    { name: 'Confirmed', value: filteredOrders.filter(o => o.status === OrderStatus.CONFIRMED).length, color: '#3B82F6' },
    { name: 'Delivered', value: filteredOrders.filter(o => o.status === OrderStatus.DELIVERED).length, color: '#10B981' },
    { name: 'Cancelled', value: cancelledOrders, color: '#EF4444' },
  ];

  const adminStats = [
    { label: 'Revenue', value: `৳${filteredOrders.reduce((sum, o) => sum + o.totalAmount, 0).toLocaleString()}`, icon: '💰', color: 'bg-emerald-500' },
    { label: 'Orders', value: totalOrdersCount, icon: '📦', color: 'bg-blue-600' },
    { label: 'Success', value: `${confirmationRate}%`, icon: '⚡', color: 'bg-indigo-600' },
    { label: 'Pending', value: leads.filter(l => l.status === 'new').length, icon: '📞', color: 'bg-rose-500' },
  ];

  const moderatorStats = [
    { label: 'Confirmed', value: confirmedOrders, icon: '✅', color: 'bg-emerald-600' },
    { label: 'Conf. %', value: `${confirmationRate}%`, icon: '📈', color: 'bg-indigo-600' },
    { label: 'Velocity', value: orderVelocity, icon: '🚀', color: 'bg-blue-500' },
    { label: 'Task Queue', value: pendingCalls, icon: '📞', color: 'bg-orange-500' },
  ];

  const activeStats = isAdmin ? adminStats : moderatorStats;

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">
            {isAdmin ? 'Baburchi Analytics' : `Assalamualikum, ${currentUser.name.split(' ')[0]}`}
          </h2>
          <p className="text-xs md:text-sm text-slate-500 font-medium">
            {isAdmin ? 'Enterprise status dashboard.' : 'Today\'s productivity snapshot.'}
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Active</span>
        </div>
      </div>

      {/* Stats Grid - 2 columns on mobile */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {activeStats.map((stat, i) => (
          <div key={i} className="bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-3 md:gap-4 group">
            <div className={`w-10 h-10 md:w-14 md:h-14 ${stat.color} text-white rounded-2xl flex items-center justify-center text-lg md:text-2xl shadow-lg transition-transform group-hover:scale-105`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{stat.label}</p>
              <p className="text-lg md:text-2xl font-black text-slate-800 leading-none">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight mb-6">Process Split</h3>
          <div className="h-[250px] md:h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="8 8" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontWeight: 700}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontWeight: 700}} />
                <Tooltip cursor={{fill: '#f8fafc', radius: 10}} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '10px' }} />
                <Bar dataKey="value" radius={[8, 8, 8, 8]} barSize={35}>
                  {statusData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sidebar Mini Widget */}
        <div className="bg-slate-900 p-6 md:p-8 rounded-[2rem] text-white shadow-2xl overflow-hidden relative">
          <div className="relative z-10">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Priority Tasks</h3>
            <div className="space-y-4">
              {isAdmin ? (
                <p className="text-xs text-slate-400 font-bold">Review product stock levels and moderator assignments.</p>
              ) : (
                <>
                  <div className="flex justify-between mb-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Call Backlog</span>
                    <span className="text-[10px] font-black text-orange-400">{pendingCalls} Pending</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500" style={{width: `${(pendingCalls/20)*100}%`}}></div>
                  </div>
                </>
              )}
              <div className="pt-4 mt-4 border-t border-white/5 grid grid-cols-2 gap-3">
                 <div className="bg-white/5 p-3 rounded-2xl text-center">
                    <p className="text-[8px] font-black text-slate-500 uppercase">Dhaka</p>
                    <p className="text-sm font-black">62%</p>
                 </div>
                 <div className="bg-white/5 p-3 rounded-2xl text-center">
                    <p className="text-[8px] font-black text-slate-500 uppercase">CTG</p>
                    <p className="text-sm font-black">24%</p>
                 </div>
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-600/10 blur-[50px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
