
import React, { useState } from 'react';
import { Product, Order, OrderStatus, User, OrderItem } from '../types';

interface OrderFormProps {
  products: Product[];
  currentUser: User;
  onOrderCreate: (order: Order) => void;
}

const OrderForm: React.FC<OrderFormProps> = ({ products, currentUser, onOrderCreate }) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [selectedItems, setSelectedItems] = useState<{productId: string, quantity: number}[]>([]);
  const [notes, setNotes] = useState('');

  const addItem = () => {
    if (products.length === 0) return;
    setSelectedItems([...selectedItems, { productId: products[0].id, quantity: 1 }]);
  };

  const removeItem = (index: number) => {
    setSelectedItems(selectedItems.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, productId: string, quantity: number) => {
    const product = products.find(p => p.id === productId);
    const stockLimit = product?.stock ?? 0;
    
    const newItems = [...selectedItems];
    const finalQty = Math.min(Math.max(1, quantity), stockLimit);
    
    if (quantity > stockLimit) {
      alert(`Only ${stockLimit} units available in stock for this product.`);
    }
    
    newItems[index] = { productId, quantity: finalQty };
    setSelectedItems(newItems);
  };

  const calculateTotal = () => {
    return selectedItems.reduce((sum, item) => {
      const product = products.find(p => p.id === item.productId);
      return sum + (product ? product.price * item.quantity : 0);
    }, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItems.length === 0) return alert('Please add at least one product.');

    const items: OrderItem[] = selectedItems.map((item, idx) => {
      const product = products.find(p => p.id === item.productId)!;
      return {
        id: `oi-${Date.now()}-${idx}`,
        productId: item.productId,
        quantity: item.quantity,
        price: product.price
      };
    });

    const newOrder: Order = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      moderatorId: currentUser.id,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerAddress: customerAddress.trim(),
      items,
      totalAmount: calculateTotal(),
      status: OrderStatus.PENDING,
      createdAt: new Date().toISOString(),
      notes
    };

    onOrderCreate(newOrder);
    setCustomerName('');
    setCustomerPhone('');
    setCustomerAddress('');
    setSelectedItems([]);
    setNotes('');
    alert('Order created successfully and stock updated!');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <div className="bg-blue-600 text-white p-3 rounded-2xl shadow-lg shadow-blue-200">
           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
           </svg>
        </div>
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">New Order Entry</h2>
          <p className="text-sm text-slate-500 font-medium">Capture customer details and finalize order items.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Customer Card */}
          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8">
            <div className="flex items-center gap-3 mb-8">
              <span className="text-xl">👤</span>
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Customer Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                <input
                  required
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-bold text-slate-700"
                  placeholder="e.g. Rahim Ahmed"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                <input
                  required
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-bold text-slate-700"
                  placeholder="01xxxxxxxxx"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Detailed Address</label>
                <textarea
                  required
                  rows={3}
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-bold text-slate-700 resize-none"
                  placeholder="Street, Landmark, City..."
                />
              </div>
            </div>
          </div>

          {/* Product Items Card */}
          <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <span className="text-xl">🌶️</span>
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Select Products</h3>
              </div>
              <button
                type="button"
                onClick={addItem}
                className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-500/10 active:scale-95"
              >
                + Add Row
              </button>
            </div>

            <div className="space-y-4">
              {selectedItems.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-[2rem]">
                  <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Your cart is empty</p>
                </div>
              )}
              {selectedItems.map((item, index) => {
                const product = products.find(p => p.id === item.productId);
                return (
                  <div key={index} className="flex flex-col md:flex-row gap-4 items-center bg-slate-50 p-6 rounded-[2rem] border border-slate-100 group animate-in slide-in-from-left-4 duration-300">
                    <div className="flex-1 w-full">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Product Name</label>
                      <select
                        value={item.productId}
                        onChange={(e) => updateItem(index, e.target.value, item.quantity)}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {products.map(p => (
                          <option key={p.id} value={p.id}>{p.name} (৳{p.price})</option>
                        ))}
                      </select>
                    </div>
                    <div className="w-full md:w-32">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Qty (In Stock: {product?.stock || 0})</label>
                      <input
                        type="number"
                        min="1"
                        max={product?.stock || 1}
                        value={item.quantity}
                        onChange={(e) => updateItem(index, item.productId, parseInt(e.target.value))}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-center font-black text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="w-full md:w-32 text-right">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Subtotal</label>
                      <p className="text-base font-black text-slate-900 pt-2">৳{((product?.price || 0) * item.quantity).toLocaleString()}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="text-rose-500 hover:bg-rose-50 p-3 rounded-xl transition-all"
                    >
                      🗑️
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Checkout Sidebar */}
        <div className="space-y-8">
          <div className="bg-[#0e1628] rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden sticky top-8">
            <div className="relative z-10 flex flex-col h-full">
               <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 mb-8">Order Summary</h3>
               <div className="space-y-6 flex-1">
                 <div className="flex justify-between items-center pb-4 border-b border-white/10">
                   <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Selected Items</span>
                   <span className="font-black">{selectedItems.length}</span>
                 </div>
                 <div className="flex justify-between items-center pb-4 border-b border-white/10">
                   <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Platform Fee</span>
                   <span className="font-black">৳0</span>
                 </div>
                 <div className="pt-4">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Payable Amount</p>
                   <p className="text-5xl font-black text-white tracking-tighter">৳{calculateTotal().toLocaleString()}</p>
                 </div>
               </div>
               
               <div className="mt-12 space-y-4">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Internal Notes</label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-xs text-white outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-600"
                      placeholder="Add any special instructions..."
                    />
                 </div>
                 <button
                   type="submit"
                   className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl transition-all shadow-2xl shadow-blue-500/20 active:scale-[0.98] uppercase tracking-[0.2em] text-sm"
                 >
                   Confirm Order
                 </button>
                 <p className="text-[9px] text-center text-slate-500 font-bold uppercase tracking-widest">Deducts stock automatically</p>
               </div>
            </div>
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/10 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default OrderForm;
