
import React, { useState, useMemo } from 'react';
import { Order, OrderStatus, User, UserRole, Product, CourierConfig } from '../types';
import { STATUS_COLORS } from '../constants';
import { syncOrderWithCourier } from '../services/courierService';

interface OrderListProps {
  orders: Order[];
  currentUser: User;
  products: Product[];
  moderators: User[];
  courierConfig: CourierConfig;
  onUpdateStatus: (orderId: string, newStatus: OrderStatus, courierData?: { id: string, status: string }) => void;
  logoUrl?: string | null;
}

const OrderList: React.FC<OrderListProps> = ({ orders, currentUser, products, moderators, courierConfig, onUpdateStatus, logoUrl }) => {
  const isAdmin = currentUser.role === UserRole.ADMIN;
  
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [visibleAddresses, setVisibleAddresses] = useState<Record<string, boolean>>({});

  const getProductName = (id: string) => products.find(p => p.id === id)?.name || 'Unknown';
  const getProductCode = (id: string) => products.find(p => p.id === id)?.sku || '---';

  const toggleAddress = (orderId: string) => {
    setVisibleAddresses(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const filteredOrders = useMemo(() => {
    let list = isAdmin 
      ? [...orders] 
      : orders.filter(o => o.moderatorId === currentUser.id);

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      list = list.filter(o => 
        o.id.toLowerCase().includes(term) ||
        o.customerName.toLowerCase().includes(term) ||
        o.customerPhone.includes(term)
      );
    }

    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      list = list.filter(o => new Date(o.createdAt) >= start);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      list = list.filter(o => new Date(o.createdAt) <= end);
    }

    return list.reverse();
  }, [orders, isAdmin, currentUser.id, startDate, endDate, searchTerm]);

  const handleCourierSync = async (order: Order) => {
    if (order.steadfastId) return;
    setSyncingId(order.id);
    try {
      const result = await syncOrderWithCourier(order, courierConfig);
      if (result.success) {
        onUpdateStatus(order.id, OrderStatus.CONFIRMED, { id: result.consignmentId, status: result.status });
        alert(`Synced Successfully! ID: ${result.consignmentId}`);
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      setSyncingId(null);
    }
  };

  const printInvoice = (order: Order) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const itemsHtml = order.items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${getProductName(item.productId)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">৳${item.price}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">৳${item.price * item.quantity}</td>
      </tr>
    `).join('');
    const logoHtml = logoUrl ? `<img src="${logoUrl}" style="max-height: 50px;">` : `<h2 style="color: #ea580c">Baburchi</h2>`;

    printWindow.document.write(`<html><body style="font-family: sans-serif; padding: 20px;">${logoHtml}<h3>Invoice ${order.id}</h3><p><b>${order.customerName}</b><br/>${order.customerPhone}<br/>${order.customerAddress}</p><table style="width:100%; border-collapse: collapse;"><thead><tr style="background:#f4f4f4"><th>Product</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead><tbody>${itemsHtml}</tbody></table><h3 style="text-align:right">Total: ৳${order.totalAmount}</h3><script>window.onload=()=>{window.print();window.close();}</script></body></html>`);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <div className="flex-1 w-full">
          <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Order Central</h2>
          <div className="relative mt-3 group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500">🔍</span>
            <input 
              type="text" 
              placeholder="Search Name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition-all shadow-sm text-sm font-bold"
            />
          </div>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer info</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Package Details</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Logistics</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-orange-50/20 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex flex-col gap-1">
                      <span className="font-mono text-[10px] font-black text-orange-600 uppercase tracking-tighter">#{order.id}</span>
                      <p className="font-black text-slate-800 text-base leading-tight">{order.customerName}</p>
                      <p className="text-xs text-slate-500 font-bold">{order.customerPhone}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs font-bold text-slate-700">
                          <span className="w-5 h-5 bg-slate-100 flex items-center justify-center rounded text-[10px]">{item.quantity}x</span>
                          <span className="truncate max-w-[150px]">{getProductName(item.productId)}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    {order.steadfastId ? (
                      <span className="text-[11px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">{order.steadfastId}</span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400 italic">Unsynced</span>
                    )}
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] ${STATUS_COLORS[order.status]} shadow-sm`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => printInvoice(order)} className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl border border-slate-200">🖨️</button>
                      {isAdmin && !order.steadfastId && (
                         <button onClick={() => handleCourierSync(order)} disabled={syncingId === order.id} className="p-2.5 bg-slate-950 text-white rounded-xl active:scale-95 transition-all">🚀</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {filteredOrders.length === 0 && (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-100 italic font-bold text-slate-400">No orders found.</div>
        )}
        {filteredOrders.map((order) => (
          <div key={order.id} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 active:scale-[0.98] transition-transform">
             <div className="flex justify-between items-start mb-3">
               <div className="flex flex-col">
                 <span className="text-[10px] font-black text-orange-600 uppercase tracking-tighter mb-1">#{order.id}</span>
                 <h3 className="font-black text-slate-800 text-lg">{order.customerName}</h3>
                 <p className="text-xs font-bold text-slate-400">{order.customerPhone}</p>
               </div>
               <span className={`px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest ${STATUS_COLORS[order.status]}`}>
                 {order.status}
               </span>
             </div>
             
             <div className="bg-slate-50 p-3 rounded-2xl mb-4 border border-slate-100">
               {order.items.map((item, idx) => (
                 <div key={idx} className="flex justify-between items-center text-[11px] font-bold text-slate-600 mb-1 last:mb-0">
                    <span className="truncate max-w-[70%]">{getProductName(item.productId)}</span>
                    <span className="bg-white px-2 py-0.5 rounded border border-slate-200">{item.quantity}x</span>
                 </div>
               ))}
               <div className="pt-2 mt-2 border-t border-slate-200 flex justify-between items-center">
                 <span className="text-[9px] font-black text-slate-400 uppercase">Total</span>
                 <span className="font-black text-slate-900">৳{order.totalAmount.toLocaleString()}</span>
               </div>
             </div>

             <div className="flex gap-3">
                <button 
                  onClick={() => printInvoice(order)} 
                  className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  🖨️ Invoice
                </button>
                {isAdmin && !order.steadfastId && (
                  <button 
                    onClick={() => handleCourierSync(order)} 
                    disabled={syncingId === order.id}
                    className="flex-1 bg-slate-950 text-white py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95"
                  >
                    {syncingId === order.id ? '...' : '🚀 Courier'}
                  </button>
                )}
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderList;
