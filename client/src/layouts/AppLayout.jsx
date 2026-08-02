import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  LayoutDashboard, 
  FileText, 
  Share2, 
  Sparkles, 
  ShieldCheck, 
  History, 
  Settings, 
  LogOut,
  Bell,
  Search,
  ChevronDown,
  AlertTriangle,
  CheckCircle2,
  X
} from 'lucide-react';

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [alerts, setAlerts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showAlertsDrawer, setShowAlertsDrawer] = useState(false);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await api.getAlerts();
        setAlerts(res.data.alerts || []);
        setUnreadCount(res.data.unreadCount || 0);
      } catch (err) {
        console.warn('Failed loading alerts.');
      }
    };
    fetchAlerts();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await api.markAlertRead(id);
      setAlerts(prev => prev.map(a => a._id === id ? { ...a, isRead: true } : a));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (e) { /* ignore */ }
  };

  const navItems = [
    { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Documents', path: '/documents', icon: FileText },
    { label: 'Knowledge Graph', path: '/graph', icon: Share2 },
    { label: 'AI Analyst', path: '/ai-analyst', icon: Sparkles },
    { label: 'Compliance', path: '/compliance', icon: ShieldCheck },
    { label: 'Audit Trail', path: '/audit-trail', icon: History },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-[#F7F5F0] text-[#1A1918] overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-[#F2EFF6]/60 border-r border-[#E6E2D8] flex flex-col justify-between p-4 select-none shrink-0">
        <div>
          {/* Top Brand Logo matching VERITAS style */}
          <div className="flex items-center gap-2 px-3 py-3 mb-4">
            <span className="font-serif text-2xl font-bold tracking-widest text-[#1A1918]">VERITAS</span>
            <span className="text-[10px] uppercase tracking-wider bg-[#E8E2D2] text-[#8C6B1B] px-1.5 py-0.5 rounded font-semibold">AI</span>
          </div>

          {/* User Profile Card at Top of Sidebar matching screenshot */}
          <div className="flex items-center gap-3 px-3 py-2.5 mb-6 rounded-lg bg-white/70 border border-[#E6E2D8]/80 shadow-sm">
            <div className="w-9 h-9 rounded-full bg-[#8C6B1B] text-white flex items-center justify-center font-semibold text-sm shadow-inner uppercase">
              {user?.name ? user.name.charAt(0) : '?'}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-semibold text-[#1A1918] truncate">{user?.name || '—'}</span>
              <span className="text-[11px] text-[#6E6B62] truncate">{user?.role || '—'}</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-[#EAE5D8] text-[#1A1918] font-semibold shadow-xs'
                        : 'text-[#6E6B62] hover:bg-[#EAE5D8]/50 hover:text-[#1A1918]'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 text-[#8C6B1B]" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Bottom Log Out button */}
        <div className="pt-4 border-t border-[#E6E2D8]">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 text-xs font-medium text-[#6E6B62] hover:text-[#D32F2F] hover:bg-[#FFEBEE]/60 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-14 bg-white/80 backdrop-blur-sm border-b border-[#E6E2D8] px-6 flex items-center justify-between shrink-0 relative">
          {/* Quick Search */}
          <div className="relative w-80">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8C877A]" />
            <input
              type="text"
              placeholder="Search entities, documents, policies..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#F7F5F0] border border-[#E6E2D8] rounded-md focus:outline-none focus:border-[#C59B27] transition-all text-[#1A1918] placeholder-[#8C877A]"
            />
          </div>

          {/* Right Utilities */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-[#6E6B62] bg-[#F7F5F0] px-2.5 py-1 rounded-md border border-[#E6E2D8]">
              <span className="w-2 h-2 rounded-full bg-[#2E7D32]"></span>
              <span className="font-medium text-[#1A1918]">Acme Enterprise</span>
              <span className="text-[10px] bg-[#E8E2D2] text-[#8C6B1B] px-1.5 py-0.5 rounded font-semibold uppercase">Graph RAG Active</span>
            </div>

            {/* Smart Alerts Bell Button */}
            <button
              onClick={() => setShowAlertsDrawer(!showAlertsDrawer)}
              className="relative p-2 text-[#6E6B62] hover:text-[#1A1918] rounded-md hover:bg-[#F7F5F0] transition-colors"
            >
              <Bell className="w-4 h-4 text-[#8C6B1B]" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#D32F2F] text-white text-[9px] font-bold flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Alerts Dropdown Drawer */}
            {showAlertsDrawer && (
              <div className="absolute right-6 top-14 w-80 bg-white border border-[#E6E2D8] rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in">
                <div className="p-3 bg-[#FAF8F5] border-b border-[#E6E2D8] flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1A1918] uppercase tracking-wider">Compliance Alerts</span>
                  <button onClick={() => setShowAlertsDrawer(false)} className="text-[#6E6B62] hover:text-[#1A1918]">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-[#E6E2D8]/60">
                  {alerts.map((alt) => (
                    <div
                      key={alt._id}
                      onClick={() => handleMarkRead(alt._id)}
                      className={`p-3 text-xs space-y-1 cursor-pointer transition-colors ${alt.isRead ? 'bg-white opacity-70' : 'bg-[#FAF8F5]'}`}
                    >
                      <div className="flex items-center justify-between font-bold text-[#1A1918]">
                        <span className="truncate pr-2">{alt.title}</span>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase ${
                          alt.severity === 'High' ? 'bg-[#FFEBEE] text-[#D32F2F]' : 'bg-[#FFF3E0] text-[#ED6C02]'
                        }`}>
                          {alt.severity}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#6E6B62] leading-tight">{alt.message}</p>
                    </div>
                  ))}
                  {alerts.length === 0 && (
                    <div className="p-6 text-center text-xs text-[#6E6B62]">No active compliance alerts.</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Dynamic Page Container */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

