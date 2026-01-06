
import React, { useState, useEffect } from 'react';
import { User, Order, OrderStatus, CourierConfig, Product, Lead, UserRole } from './types';
import { INITIAL_PRODUCTS, INITIAL_MODERATORS, ADMIN_USER, MOCK_ORDERS } from './constants';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import OrderForm from './components/OrderForm';
import OrderList from './components/OrderList';
import Login from './components/Login';
import ModeratorManager from './components/ModeratorManager';
import Settings from './components/Settings';
import ProductManager from './components/ProductManager';
import LeadManager from './components/LeadManager';
import ModeratorLeads from './components/ModeratorLeads';

const SESSION_KEY = 'baburchi_user_session';
const MODERATORS_KEY = 'baburchi_moderators';
const ORDERS_KEY = 'baburchi_orders';
const CONFIG_KEY = 'baburchi_courier_config';
const PRODUCTS_KEY = 'baburchi_products';
const LOGO_KEY = 'baburchi_brand_logo';
const LEADS_KEY = 'baburchi_leads';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(() => localStorage.getItem(LOGO_KEY));
  
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(PRODUCTS_KEY);
    const data = saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    return data.map((p: Product) => ({ ...p, stock: p.stock ?? 50 }));
  });

  const [moderators, setModerators] = useState<User[]>(() => {
    const saved = localStorage.getItem(MODERATORS_KEY);
    return saved ? JSON.parse(saved) : INITIAL_MODERATORS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const savedOrders = localStorage.getItem(ORDERS_KEY);
    return savedOrders ? JSON.parse(savedOrders) : MOCK_ORDERS;
  });

  const [leads, setLeads] = useState<Lead[]>(() => {
    const saved = localStorage.getItem(LEADS_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  const [courierConfig, setCourierConfig] = useState<CourierConfig>(() => {
    const saved = localStorage.getItem(CONFIG_KEY);
    return saved ? JSON.parse(saved) : {
      apiKey: '',
      secretKey: '',
      baseUrl: 'https://portal.steadfast.com.bd/api/v1',
      webhookUrl: '',
      accountEmail: '',
      accountPassword: ''
    };
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isInitializing, setIsInitializing] = useState(true);

  // Persistence
  useEffect(() => {
    const savedUser = localStorage.getItem(SESSION_KEY);
    if (savedUser) setCurrentUser(JSON.parse(savedUser));
    setIsInitializing(false);
  }, []);

  useEffect(() => { localStorage.setItem(ORDERS_KEY, JSON.stringify(orders)); }, [orders]);
  useEffect(() => { localStorage.setItem(MODERATORS_KEY, JSON.stringify(moderators)); }, [moderators]);
  useEffect(() => { localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem(CONFIG_KEY, JSON.stringify(courierConfig)); }, [courierConfig]);
  useEffect(() => { localStorage.setItem(LEADS_KEY, JSON.stringify(leads)); }, [leads]);
  useEffect(() => { 
    if (logoUrl) localStorage.setItem(LOGO_KEY, logoUrl);
    else localStorage.removeItem(LOGO_KEY);
  }, [logoUrl]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem(SESSION_KEY);
    setActiveTab('dashboard');
  };

  const handleCreateOrder = (newOrder: Order) => {
    setProducts(prevProducts => prevProducts.map(p => {
      const orderItem = newOrder.items.find(item => item.productId === p.id);
      if (orderItem) {
        return { ...p, stock: Math.max(0, (p.stock || 0) - orderItem.quantity) };
      }
      return p;
    }));
    
    setOrders(prev => [...prev, newOrder]);
    setActiveTab('orders');
  };

  const handleUpdateStatus = (orderId: string, newStatus: OrderStatus, courierData?: { id: string, status: string }) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return { 
          ...o, 
          status: newStatus,
          ...(courierData ? { steadfastId: courierData.id, courierStatus: courierData.status } : {})
        };
      }
      return o;
    }));
  };

  const handleAddModerator = (newMod: User) => {
    setModerators(prev => [...prev, newMod]);
  };

  const handleUpdateConfig = (newConfig: CourierConfig) => {
    setCourierConfig(newConfig);
  };

  const handleAddProduct = (newProduct: Product) => {
    setProducts(prev => [...prev, { ...newProduct, stock: newProduct.stock ?? 50 }]);
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  const handleAssignLeads = (newLeads: Lead[]) => {
    setLeads(prev => [...prev, ...newLeads]);
  };

  const handleBulkUpdateLeads = (indices: number[], modId: string, date: string) => {
    setLeads(prev => {
      const newList = [...prev];
      indices.forEach(idx => {
        if (newList[idx]) {
          newList[idx] = { 
            ...newList[idx], 
            moderatorId: modId, 
            assignedDate: date,
            status: 'new' // Reset status when re-assigned
          };
        }
      });
      return newList;
    });
  };

  const handleUpdateLeadStatus = (leadId: string, status: 'new' | 'called') => {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status } : l));
  };

  const handleDeleteLead = (leadId: string) => {
    setLeads(prev => prev.filter(l => l.id !== leadId));
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
        <div className="animate-pulse text-orange-500 text-2xl font-bold">Loading Baburchi...</div>
      </div>
    );
  }

  if (!currentUser) {
    return <Login onLogin={handleLogin} moderators={moderators} logoUrl={logoUrl} />;
  }

  return (
    <Layout 
      user={currentUser} 
      onLogout={handleLogout} 
      activeTab={activeTab} 
      setActiveTab={setActiveTab}
      logoUrl={logoUrl}
    >
      <div className="animate-in fade-in duration-500">
        {activeTab === 'dashboard' && (
          <Dashboard 
            orders={orders} 
            products={products} 
            leads={leads}
            currentUser={currentUser} 
          />
        )}
        {activeTab === 'create' && <OrderForm products={products} currentUser={currentUser} onOrderCreate={handleCreateOrder} />}
        {activeTab === 'orders' && (
          <OrderList 
            orders={orders} 
            currentUser={currentUser} 
            products={products} 
            moderators={moderators}
            courierConfig={courierConfig}
            onUpdateStatus={handleUpdateStatus}
            logoUrl={logoUrl}
          />
        )}
        {activeTab === 'leads' && currentUser.role === UserRole.ADMIN && (
          <LeadManager 
            moderators={moderators} 
            leads={leads} 
            onAssignLeads={handleAssignLeads} 
            onBulkUpdateLeads={handleBulkUpdateLeads}
            onDeleteLead={handleDeleteLead}
          />
        )}
        {activeTab === 'myleads' && currentUser.role === UserRole.MODERATOR && (
          <ModeratorLeads 
            leads={leads.filter(l => l.moderatorId === currentUser.id)} 
            onUpdateStatus={handleUpdateLeadStatus}
          />
        )}
        {activeTab === 'moderators' && currentUser.role === 'admin' && (
          <ModeratorManager moderators={moderators} onAddModerator={handleAddModerator} />
        )}
        {activeTab === 'products' && currentUser.role === 'admin' && (
          <ProductManager 
            products={products} 
            onAddProduct={handleAddProduct} 
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct} 
          />
        )}
        {activeTab === 'settings' && currentUser.role === 'admin' && (
          <Settings 
            config={courierConfig} 
            onSave={handleUpdateConfig} 
            logoUrl={logoUrl} 
            onUpdateLogo={setLogoUrl} 
          />
        )}
      </div>
    </Layout>
  );
};

export default App;
