import React, { useEffect, useState, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import {
  LayoutDashboard, BookOpen, Users, MessageSquareText, FileText,
  HelpCircle, LogOut, Trash2, Plus, RefreshCw, Edit, Check, Search,
  Eye, EyeOff, Filter, ShieldCheck, Database, Calendar, Clock, MapPin,
  Sparkles, ExternalLink, X, Cpu, Percent, Zap, Ticket, Phone, Mail,
  CheckCircle2, AlertCircle, ArrowUpRight, LayoutGrid, List, Columns3,
  Printer, Share2, Copy, Award, Inbox
} from 'lucide-react';
import './styles.css';

const LOCAL_API_DEFAULT = (() => {
  const envVal = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/+$/, '');
  return envVal.endsWith('/api') ? envVal : `${envVal}/api`;
})();
const CLOUD_API_DEFAULT = 'https://nexaailab.onrender.com/api';
const LIVE_SITE_URL = import.meta.env.VITE_PUBLIC_SITE_URL || 'https://nexaai.aparaitech.org';

const cleanFeeNumber = (val, fallback = 0) => {
  if (!val) return fallback;
  if (typeof val === 'number') return val;
  const parsed = parseInt(String(val).replace(/[^0-9]/g, ''), 10);
  return isNaN(parsed) ? fallback : parsed;
};

const formatRupee = (num) => '₹' + Number(num).toLocaleString('en-IN');

const getInitials = (name) => {
  if (!name) return 'CD';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

const getAvatarBg = (name) => {
  const colors = [
    'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
    'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
    'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
    'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)'
  ];
  let hash = 0;
  for (let i = 0; i < (name || '').length; i++) hash += name.charCodeAt(i);
  return colors[Math.abs(hash) % colors.length];
};

const formatCourseTitle = (rawCourse) => {
  if (!rawCourse) return { main: 'General Inquiry', sub: 'Admissions Callback' };
  let main = rawCourse;
  let sub = '';
  if (main.includes('(')) {
    const parts = main.split('(');
    main = parts[0].trim();
    sub = parts.slice(1).join('(').replace(/\)+$/, '').trim();
  }
  return { main, sub };
};

const formatSlotTimings = (slot, date, time) => {
  const text = slot || (date ? `${date} • ${time || ''}` : 'Flexible Timing');
  let timePart = '';
  let datePart = '';
  if (text.includes('- Starts')) {
    const parts = text.split('- Starts');
    timePart = parts[0].replace(/•/g, '').trim();
    datePart = 'Starts ' + parts[1].trim();
  } else if (text.includes('Starts')) {
    const parts = text.split('Starts');
    timePart = parts[0].replace(/•/g, '').trim();
    datePart = 'Starts ' + parts[1].trim();
  } else if (text.includes('•')) {
    const parts = text.split('•');
    timePart = parts[0].trim();
    datePart = parts.slice(1).join('•').trim();
  } else {
    timePart = text;
  }
  return { timePart, datePart };
};

const playLeadChime = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.45);
  } catch (e) {}
};


// ================= PROFESSIONAL DIGITAL ADMISSION PASS COMPONENTS =================
const DigitalQrCode = ({ passId = 'PASS-PUNE-JAN-846262', candidate = '' }) => {
  const hash = Array.from(passId + candidate).reduce((acc, c, i) => acc + c.charCodeAt(0) * (i + 1), 0);
  const size = 110;
  const cells = 15;
  const cellSize = size / cells;

  const isDark = (r, c) => {
    if ((r < 5 && c < 5) || (r < 5 && c >= cells - 5) || (r >= cells - 5 && c < 5)) {
      if (r === 0 || r === 4 || c === 0 || c === 4 || (r === cells - 1 || r === cells - 5 || c === cells - 1 || c === cells - 5)) return true;
      if (r >= 1 && r <= 3 && c >= 1 && c <= 3) return true;
      if (r >= 1 && r <= 3 && c >= cells - 4 && c <= cells - 2) return true;
      if (r >= cells - 4 && r <= cells - 2 && c >= 1 && c <= 3) return true;
      return false;
    }
    if (r >= 6 && r <= 8 && c >= 6 && c <= 8) return false;
    const bit = (hash * (r * 13 + c * 7 + 11)) % 100;
    return bit > 45;
  };

  const rects = [];
  for (let r = 0; r < cells; r++) {
    for (let c = 0; c < cells; c++) {
      if (isDark(r, c)) {
        rects.push(
          <rect
            key={`${r}-${c}`}
            x={c * cellSize}
            y={r * cellSize}
            width={cellSize - 0.5}
            height={cellSize - 0.5}
            fill="#0f172a"
            rx={0.6}
          />
        );
      }
    }
  }

  return (
    <div className="digital-qr-wrap" title={`Verified Admission QR for ${passId}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <rect width={size} height={size} fill="#ffffff" rx={8} />
        {rects}
        <rect x={size / 2 - 12} y={size / 2 - 12} width={24} height={24} fill="#0284c7" rx={4} />
        <text x={size / 2} y={size / 2 + 4} textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="800" fontFamily="sans-serif">NX</text>
      </svg>
      <span className="qr-scan-hint">Scan at Reception Desk</span>
    </div>
  );
};

const DigitalBarcode = ({ passId = 'PASS-PUNE-JAN-846262' }) => {
  const bars = [3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 4, 1, 2, 3, 1, 4, 2, 1, 3, 2, 4, 1, 2, 3, 1, 4, 2, 1, 3, 4, 1, 2, 3];
  return (
    <div className="digital-barcode-wrap" title={`Admission Barcode: ${passId}`}>
      <svg width="170" height="38" viewBox="0 0 170 38">
        <rect width="170" height="38" fill="#ffffff" rx={4} />
        <g transform="translate(8, 3)">
          {bars.map((w, idx) => (
            <rect
              key={idx}
              x={idx * 4.4}
              y={0}
              width={w > 2 ? 2.4 : 1.2}
              height={24}
              fill="#0f172a"
            />
          ))}
        </g>
      </svg>
      <code className="barcode-code-text">{passId}</code>
    </div>
  );
};

function App() {
  const [token, setToken] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlToken = params.get('token');
      if (urlToken) {
        localStorage.setItem('token', urlToken);
        const urlUser = params.get('user');
        if (urlUser) {
          try {
            localStorage.setItem('admin_user', decodeURIComponent(urlUser));
          } catch (e) {}
        }
        window.history.replaceState({}, document.title, window.location.pathname);
        return urlToken;
      }
    } catch (e) {}
    const saved = localStorage.getItem('token');
    if (saved) return saved;
    // Default to Super Admin master token so opening localhost:5174 directly opens the live dashboard!
    return 'nexa_admin_token_master';
  });
  const [user, setUser] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlUser = params.get('user');
      if (urlUser) {
        return JSON.parse(decodeURIComponent(urlUser));
      }
    } catch (e) {}
    const s = localStorage.getItem('admin_user');
    if (s) {
      try { return JSON.parse(s); } catch (e) {}
    }
    return { name: 'Super Admin', email: 'admin@example.com', role: 'admin' };
  });
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('Admin@123');
  const [showPassword, setShowPassword] = useState(false);
  const [loginMsg, setLoginMsg] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const isLocalHost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  const [activeApi, setActiveApi] = useState(() => {
    const saved = localStorage.getItem('admin_active_api');
    if (saved && (isLocalHost || saved.includes('render'))) return saved;
    return isLocalHost ? LOCAL_API_DEFAULT : CLOUD_API_DEFAULT;
  });
  const [apiSource, setApiSource] = useState(() => {
    const saved = localStorage.getItem('admin_active_api') || '';
    if (saved) return saved.includes('render') ? 'cloud' : 'local';
    return isLocalHost ? 'local' : 'cloud';
  });

  // Seamlessly sync with real backend JWT token on startup
  useEffect(() => {
    if (token === 'nexa_admin_token_master' || !token) {
      const tryLogin = async (baseUrl) => {
        const res = await fetch(`${baseUrl}/admin/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'admin@example.com', password: 'Admin@123' })
        });
        const data = await res.json();
        if (data && data.token) {
          localStorage.setItem('token', data.token);
          setToken(data.token);
          if (data.user) {
            localStorage.setItem('admin_user', JSON.stringify(data.user));
            setUser(data.user);
          }
          return true;
        }
        return false;
      };

      tryLogin(activeApi)
        .catch(() => {
          // If local activeApi is down, try cloud API
          tryLogin(CLOUD_API_DEFAULT)
            .then(ok => {
              if (ok) {
                setActiveApi(CLOUD_API_DEFAULT);
                setApiSource('cloud');
                localStorage.setItem('admin_active_api', CLOUD_API_DEFAULT);
              }
            })
            .catch(err => {
              console.warn('Using master admin token session:', err.message);
            });
        });
    }
  }, [activeApi]);

  // Navigation
  const [page, setPage] = useState('dashboard');
  const [stats, setStats] = useState({});
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Filter / Search
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [cityFilter, setCityFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [monthFilter, setMonthFilter] = useState('All');

  // Layout View Mode: 'table' or 'cards' (both options supported)
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('admin_view_mode') || 'table';
  });

  const handleSetViewMode = (mode) => {
    setViewMode(mode);
    try {
      localStorage.setItem('admin_view_mode', mode);
    } catch (e) {}
  };

  // Auto-Refresh state (background polling every 4 seconds)
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState(new Date());
  const prevLeadIdsRef = useRef(null);

  // Leads card display format: 'pipeline' (proper status column cards) or 'grid' (all cards grid)
  const [leadsGrouping, setLeadsGrouping] = useState(() => {
    return localStorage.getItem('admin_leads_grouping') || 'pipeline';
  });

  const handleSetLeadsGrouping = (grouping) => {
    setLeadsGrouping(grouping);
    try {
      localStorage.setItem('admin_leads_grouping', grouping);
    } catch (e) {}
  };

  // Modals
  const [activeModal, setActiveModal] = useState(null);
  const [counselorNoteText, setCounselorNoteText] = useState(''); // 'add-course' | 'edit-course' | 'add-testimonial' | 'edit-testimonial' | 'add-report' | 'edit-report' | 'add-faq' | 'edit-faq' | 'lead-details' | null
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchWithTimeout = async (url, opt = {}, timeoutMs = 15000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { ...opt, signal: controller.signal });
      clearTimeout(id);
      return res;
    } catch (e) {
      clearTimeout(id);
      throw e;
    }
  };

  const api = async (path, opt = {}) => {
    const executeOnUrl = async (baseUrl) => {
      let res = await fetchWithTimeout(`${baseUrl}/admin${path}`, {
        ...opt,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          ...(opt.headers || {})
        }
      });

      if (res.status === 401) {
        try {
          const authRes = await fetch(`${baseUrl}/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@example.com', password: 'Admin@123' })
          });
          const authData = await authRes.json();
          if (authRes.ok && authData.token) {
            localStorage.setItem('token', authData.token);
            setToken(authData.token);
            const retryRes = await fetchWithTimeout(`${baseUrl}/admin${path}`, {
              ...opt,
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${authData.token}`,
                ...(opt.headers || {})
              }
            });
            if (!retryRes.ok) {
              const errBody = await retryRes.json().catch(() => ({}));
              throw new Error(errBody.message || errBody.error || `Server error (${retryRes.status})`);
            }
            return await retryRes.json().catch(() => ({ ok: true }));
          }
        } catch (e) {
          console.warn('Auto-login refresh error:', e.message);
        }
      }

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.message || errBody.error || `Server error (${res.status})`);
      }

      return await res.json().catch(() => ({ ok: true }));
    };

    try {
      return await executeOnUrl(activeApi);
    } catch (primaryErr) {
      const fallback = activeApi === LOCAL_API_DEFAULT ? CLOUD_API_DEFAULT : LOCAL_API_DEFAULT;
      try {
        const fallbackRes = await executeOnUrl(fallback);
        setActiveApi(fallback);
        setApiSource(fallback === LOCAL_API_DEFAULT ? 'local' : 'cloud');
        localStorage.setItem('admin_active_api', fallback);
        return fallbackRes;
      } catch (fallbackErr) {
        throw primaryErr;
      }
    }
  };

  const switchOrRetryBackend = async () => {
    if (apiSource === 'cloud') {
      try {
        const res = await fetchWithTimeout(`${LOCAL_API_DEFAULT}/health`, {}, 2000);
        if (res.ok) {
          setActiveApi(LOCAL_API_DEFAULT);
          setApiSource('local');
          localStorage.setItem('admin_active_api', LOCAL_API_DEFAULT);
          showToast('Switched to Local Backend (Port 5000)');
          loadData();
          return;
        }
      } catch (e) {}
      showToast('Local backend (port 5000) not active. Using Live Cloud API.', 'error');
    } else {
      setActiveApi(CLOUD_API_DEFAULT);
      setApiSource('cloud');
      localStorage.setItem('admin_active_api', CLOUD_API_DEFAULT);
      showToast('Switched to Live Cloud API (Render)');
      loadData();
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginMsg('');

    const tryAuth = async (baseUrl) => {
      const res = await fetch(`${baseUrl}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      return await res.json();
    };

    try {
      let json = null;
      try {
        json = await tryAuth(activeApi);
      } catch (localErr) {
        json = await tryAuth(CLOUD_API_DEFAULT);
        setActiveApi(CLOUD_API_DEFAULT);
        setApiSource('cloud');
        localStorage.setItem('admin_active_api', CLOUD_API_DEFAULT);
      }

      if (json && json.token) {
        localStorage.setItem('token', json.token);
        localStorage.setItem('admin_user', JSON.stringify(json.user || { name: 'Super Admin', email }));
        setToken(json.token);
        setUser(json.user || { name: 'Super Admin', email });
        showToast('Logged in successfully!');
      } else {
        setLoginMsg(json?.message || 'Invalid email or password.');
      }
    } catch (err) {
      if (email.trim().toLowerCase() === 'admin@example.com' && password === 'Admin@123') {
        const fallbackToken = 'nexa_admin_token_' + Date.now();
        const fallbackUser = { name: 'Super Admin', email: 'admin@example.com', role: 'admin' };
        localStorage.setItem('token', fallbackToken);
        localStorage.setItem('admin_user', JSON.stringify(fallbackUser));
        setToken(fallbackToken);
        setUser(fallbackUser);
        showToast('Logged in as Super Admin!');
      } else {
        setLoginMsg('Cannot connect to backend server. Make sure backend is running or internet is connected.');
      }
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('admin_user');
    setToken('');
    setUser(null);
    showToast('Logged out');
  };

  const loadData = async (showLoading = true) => {
    if (!token) return;
    if (showLoading) setLoading(true);
    try {
      let leadsToInspect = [];
      if (page === 'dashboard') {
        const s = await api('/stats');
        setStats(s || {});
        const l = await api('/leads');
        leadsToInspect = Array.isArray(l) ? l : [];
        setData(leadsToInspect.slice(0, 5));
      } else if (page === 'leads') {
        const res = await api('/leads');
        leadsToInspect = Array.isArray(res) ? res : [];
        setData(leadsToInspect);
      } else {
        const res = await api(`/${page}`);
        setData(Array.isArray(res) ? res : []);
      }

      // Live inquiry detection & instant audio chime
      if (leadsToInspect.length > 0) {
        if (prevLeadIdsRef.current !== null) {
          const incomingNew = leadsToInspect.filter(item => item._id && !prevLeadIdsRef.current.has(item._id));
          if (incomingNew.length > 0) {
            playLeadChime();
            const firstNew = incomingNew[0];
            showToast(`🔔 Live Inquiry Received: ${firstNew.name} - ${firstNew.course || 'Admissions'}!`, 'success');
          }
        }
        prevLeadIdsRef.current = new Set(leadsToInspect.map(item => item._id));
      }

      setLastRefreshedAt(new Date());
    } catch (e) {
      console.warn('Data sync note:', e.message);
      if (showLoading) {
        showToast(
          apiSource === 'local'
            ? 'Connecting to Live Cloud API (Render)...'
            : 'Connecting to API... please ensure internet access.',
          'info'
        );
      }
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // Background Auto-Refresh interval (real-time 4-second live sync)
  useEffect(() => {
    if (!token || !autoRefresh) return;
    const timer = setInterval(() => {
      loadData(false);
    }, 4000);
    return () => clearInterval(timer);
  }, [token, page, autoRefresh]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await loadData(false);
    setTimeout(() => setIsRefreshing(false), 500);
    showToast('Live data refreshed!');
  };

  useEffect(() => {
    loadData();
    setSearch('');
    setStatusFilter('All');
    setCityFilter('All');
    setTypeFilter('All');
    setMonthFilter('All');
  }, [token, page]);

  // CRUD Operations
  const handleDelete = async (id) => {
    if (!id) {
      showToast('Error: Item ID is missing.', 'error');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    
    // Optimistic deletion
    setData(prev => prev.filter(item => item._id !== id));
    try {
      await api(`/${page}/${id}`, { method: 'DELETE' });
      showToast('Item deleted successfully.');
      loadData(false);
    } catch (e) {
      showToast('Failed to delete item: ' + (e.message || 'Server error'), 'error');
      loadData(false);
    }
  };


  const handleQuickAdjustSeats = async (batch, delta) => {
    const newSeats = Math.max(0, (batch.seatsLeft || 0) + delta);
    setData(prev => prev.map(item => item._id === batch._id ? { ...item, seatsLeft: newSeats } : item));
    try {
      await api(`/batches/${batch._id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...batch, seatsLeft: newSeats })
      });
      showToast(`Updated seats to ${newSeats}`);
      loadData(false);
    } catch {
      showToast('Failed to update seats', 'error');
      loadData(false);
    }
  };

  const handleToggleBatchStatus = async (batch) => {
    const nextStatus = batch.active === false ? true : false;
    setData(prev => prev.map(item => item._id === batch._id ? { ...item, active: nextStatus } : item));
    try {
      await api(`/batches/${batch._id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...batch, active: nextStatus })
      });
      showToast(`Batch marked as ${nextStatus ? 'Active' : 'Closed'}`);
      loadData(false);
    } catch {
      showToast('Failed to update batch status', 'error');
      loadData(false);
    }
  };

  const handleUpdateLeadStatus = async (id, status) => {
    // Instant optimistic update so lead immediately moves to its proper card container
    setData(prev => prev.map(item => item._id === id ? { ...item, status } : item));
    try {
      await api(`/leads/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
      showToast(`Lead moved to ${status}`);
      loadData(false);
    } catch {
      showToast('Failed to update status', 'error');
      loadData(false);
    }
  };

  const openAddModal = () => {
    if (page === 'batches') {
      setFormData({
        title: 'Data Analytics with AI Course - Classroom Bootcamp',
        type: 'Classroom Course',
        city: 'Pune (Hinjawadi)',
        locationDetail: 'Pune Campus, Phase 1 Hinjawadi (Near Rajiv Gandhi Infotech Park)',
        mode: 'Classroom Bootcamp Weekdays (Monday to Friday)',
        date: '12th Jan 2027',
        month: 'January',
        time: '9:30 AM - 1:30 PM (4 Hours / Day • Mon to Fri)',
        seatsLeft: 8,
        totalSeats: 25,
        partner: 'NASSCOM FutureSkills Prime & AI Industry Council',
        duration: '4 Hours Daily • Monday to Friday',
        fee: '₹55,000',
        originalFee: '₹68,000',
        active: true
      });
      setActiveModal('add-batch');
    } else if (page === 'leads') {
      setFormData({
        name: '',
        mobile: '',
        email: '',
        city: 'Pune (Hinjawadi)',
        course: 'Data Analytics with AI Course - Classroom Bootcamp',
        source: 'Admin Direct Entry',
        preferredSlot: '9:30 AM - 1:30 PM (4 Hours / Day • Mon to Fri)',
        date: '12th Jan 2027',
        time: '9:30 AM - 1:30 PM',
        notes: '',
        status: 'New'
      });
      setActiveModal('add-lead');
    } else if (page === 'courses') {
      setFormData({
        title: '',
        category: 'Data Science & Analytics',
        hours: '594 Hrs',
        duration: '6–8 Months',
        badge: 'Gen & Agentic AI',
        originalFee: '₹68,000',
        fee: '₹55,000',
        saveAmount: 'Save ₹13,000 (19% OFF)',
        emi: '₹4,583/mo',
        monthlyEmi: '₹4,583/mo',
        emiTenures: '3, 6, 9, 12',
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
        description: 'Comprehensive curriculum combining practical machine learning, analytics tools, and GenAI workflows.',
        batches: [
          { city: 'Pune (Hinjawadi)', date: '12th Jan 2027', mode: 'Classroom Bootcamp Weekdays (Monday to Friday)', time: '9:30 AM - 1:30 PM (4 Hours / Day)', seatsLeft: 8 }
        ],
        active: true
      });
      setActiveModal('add-course');
    } else if (page === 'testimonials') {
      setFormData({
        name: '',
        role: 'Data Scientist',
        company: 'Tech Corp',
        placedAt: 'EY',
        hike: '120% hike',
        image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        text: 'The training and mentorship helped me make a successful career switch.',
        tags: ['Tech Background', 'Data Analyst'],
        active: true
      });
      setActiveModal('add-testimonial');
    } else if (page === 'reports') {
      setFormData({
        title: '',
        summary: 'Strategic analysis and compensation trends for data practitioners.',
        pages: '40 Pages',
        downloads: '5,000+',
        image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
        url: '#',
        active: true
      });
      setActiveModal('add-report');
    } else if (page === 'faqs') {
      setFormData({
        question: '',
        answer: '',
        order: (data.length || 0) + 1,
        active: true
      });
      setActiveModal('add-faq');
    }
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    const itemData = { ...item };
    if (page === 'courses') {
      itemData.originalFee = item.originalFee || '₹68,000';
      itemData.fee = item.fee || '₹55,000';
      itemData.saveAmount = item.saveAmount || 'Save ₹13,000';
      itemData.duration = item.duration || '6–8 Months';
      itemData.hours = item.hours || '594 Hrs';
      itemData.emi = item.emi || '₹4,583/mo';
      itemData.emiTenures = Array.isArray(item.emiMonths) ? item.emiMonths.join(', ') : (item.emiTenures || '3, 6, 9, 12');
    } else if (page === 'batches') {
      itemData.fee = item.fee || '₹55,000';
      itemData.originalFee = item.originalFee || '₹68,000';
      itemData.month = item.month || 'January';
    }
    setFormData(itemData);
    if (page === 'batches') setActiveModal('edit-batch');
    else if (page === 'courses') setActiveModal('edit-course');
    else if (page === 'testimonials') setActiveModal('edit-testimonial');
    else if (page === 'reports') setActiveModal('edit-report');
    else if (page === 'faqs') setActiveModal('edit-faq');
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (page === 'courses') {
        const feeNum = cleanFeeNumber(payload.fee, 55000);
        const origNum = cleanFeeNumber(payload.originalFee, Math.round(feeNum * 1.25));
        payload.fee = formatRupee(feeNum);
        payload.originalFee = formatRupee(origNum);
        if (!payload.saveAmount || !payload.saveAmount.trim()) {
          const diff = Math.max(0, origNum - feeNum);
          const pct = origNum > 0 ? Math.round((diff / origNum) * 100) : 0;
          payload.saveAmount = `Save ${formatRupee(diff)}${pct > 0 ? ` (${pct}% OFF)` : ''}`;
        }
        if (payload.emiTenures) {
          payload.emiMonths = payload.emiTenures.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
        } else {
          payload.emiMonths = [3, 6, 9, 12];
        }
        payload.emi = `${formatRupee(Math.round(feeNum / 12))}/mo`;
        payload.monthlyEmi = payload.emi;
      } else if (page === 'batches') {
        if (payload.fee) payload.fee = formatRupee(cleanFeeNumber(payload.fee, 55000));
        if (payload.originalFee) payload.originalFee = formatRupee(cleanFeeNumber(payload.originalFee, 68000));
      }

      // Remove immutable MongoDB fields
      delete payload._id;
      delete payload.__v;
      delete payload.createdAt;
      delete payload.updatedAt;

      if (activeModal.startsWith('add-')) {
        const created = await api(`/${page}`, {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        showToast('Created successfully!');
        if (created && created._id) {
          setData(prev => [created, ...prev]);
        }
      } else if (activeModal.startsWith('edit-')) {
        const targetId = editingItem?._id;
        if (!targetId) throw new Error('Item ID missing for update');
        const updated = await api(`/${page}/${targetId}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        showToast('Updated successfully!');
        if (updated && updated._id) {
          setData(prev => prev.map(item => item._id === targetId ? updated : item));
        }
      }
      setActiveModal(null);
      setEditingItem(null);
      loadData(false);
    } catch (err) {
      showToast('Error saving data: ' + (err.message || 'Server error'), 'error');
    }
  };

  // Filtered Data
  const filteredData = data.filter(item => {
    const q = search.toLowerCase();
    const matchesSearch = !search ||
      (item.title && item.title.toLowerCase().includes(q)) ||
      (item.name && item.name.toLowerCase().includes(q)) ||
      (item.email && item.email.toLowerCase().includes(q)) ||
      (item.mobile && String(item.mobile).toLowerCase().includes(q)) ||
      (item.passId && item.passId.toLowerCase().includes(q)) ||
      (item.course && item.course.toLowerCase().includes(q)) ||
      (item.source && item.source.toLowerCase().includes(q)) ||
      (item.preferredSlot && item.preferredSlot.toLowerCase().includes(q)) ||
      (item.question && item.question.toLowerCase().includes(q)) ||
      (item.city && item.city.toLowerCase().includes(q)) ||
      (item.mode && item.mode.toLowerCase().includes(q)) ||
      (item.workstation && item.workstation.toLowerCase().includes(q));

    const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
    const matchesCity = cityFilter === 'All' || !item.city || item.city.toLowerCase().includes(cityFilter.toLowerCase());
    const matchesType = typeFilter === 'All' || !item.type || item.type.toLowerCase() === typeFilter.toLowerCase();
    const matchesMonth = monthFilter === 'All' || !item.month || item.month.toLowerCase() === monthFilter.toLowerCase() || (item.date && item.date.toLowerCase().includes(monthFilter.toLowerCase()));

    return matchesSearch && matchesStatus && matchesCity && matchesType && matchesMonth;
  });

  // Login Screen
  if (!token) {
    return (
      <div className="login-screen">
        <div className="login-card">
          <div className="login-brand">
            <div className="brand-logo">
              NEXA<span className="logo-accent">AI</span> LAB
            </div>
            <span className="brand-badge">Admin Dashboard</span>
          </div>

          <h2>Sign in to Admin Portal</h2>
          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label>Admin Email / Username</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter admin email"
                autoComplete="username"
              />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ margin: 0 }}>Password</label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ background: 'none', border: 'none', color: '#0284c7', cursor: 'pointer', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  {showPassword ? <><EyeOff size={13} /> Hide</> : <><Eye size={13} /> Show</>}
                </button>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter admin password"
                autoComplete="current-password"
              />
            </div>

            <button type="submit" className="btn-signin-submit" disabled={loginLoading}>
              {loginLoading ? 'Authenticating...' : 'Sign In to Dashboard'}
            </button>

            <div style={{ marginTop: '16px', padding: '14px', background: '#f0f9ff', borderRadius: '12px', border: '1px solid #bae6fd', textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#0369a1', fontWeight: 700, marginBottom: '6px' }}>
                ⚡ Quick Access Super Admin Credentials:
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', fontSize: '12px', fontFamily: 'monospace', color: '#0f172a', marginBottom: '12px' }}>
                <span style={{ background: '#fff', padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>admin@example.com</span>
                <span style={{ background: '#fff', padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>Admin@123</span>
              </div>
              <button
                type="button"
                className="btn-quick-admin-login"
                onClick={() => {
                  setEmail('admin@example.com');
                  setPassword('Admin@123');
                  handleLogin({ preventDefault: () => {} });
                }}
                style={{ width: '100%', padding: '10px 14px', background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 2px 8px rgba(2, 132, 199, 0.25)' }}
              >
                <ShieldCheck size={16} /> Instant 1-Click Login & Open Live Dashboard
              </button>
            </div>

            {loginMsg && <div className="login-error-alert" style={{ marginTop: '12px' }}>{loginMsg}</div>}
          </form>

          <div className="login-footer" style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <a href={LIVE_SITE_URL} target="_blank" rel="noreferrer" style={{ color: '#0284c7', fontWeight: 700, fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              🌐 Open Live Website (nexaai.aparaitech.org) <ExternalLink size={13} />
            </a>
            <a href="http://localhost:5173" target="_blank" rel="noreferrer" style={{ color: '#64748b', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              Local Dev Preview: localhost:5173 <ExternalLink size={11} />
            </a>
          </div>
        </div>
      </div>
    );
  }

  const renderLeadCard = (l) => {
    const courseInfo = formatCourseTitle(l.course);
    const slotInfo = formatSlotTimings(l.preferredSlot, l.date, l.time);
    const isSlotBooking = (l.source && (l.source.includes('Slot') || l.source.includes('Appointment') || l.source.includes('Pass'))) || l.passId;
    const isMasterclass = l.source && (l.source.includes('Masterclass') || l.source.includes('Workshop'));
    const statusLower = (l.status || 'New').toLowerCase();
    const effectivePassId = l.passId || `PASS-PUNE-JAN-${l._id ? l._id.slice(-6).toUpperCase() : '846262'}`;

    return (
      <div key={l._id} className="lead-data-card lead-card-small">
        {/* Compact Card Header */}
        <div className="lead-card-head small">
          <div className="lead-card-profile small">
            <div
              className="candidate-avatar-circle small"
              style={{ background: getAvatarBg(l.name) }}
              title={l.name}
            >
              {getInitials(l.name)}
            </div>
            <div className="lead-card-profile-info small">
              <h4 className="lead-card-name small" title={l.name}>{l.name}</h4>
              <div className="candidate-badges-wrap small">
                <span className={`source-pill ${isSlotBooking ? 'booking' : isMasterclass ? 'masterclass' : 'web'}`}>
                  {isSlotBooking ? 'Classroom' : isMasterclass ? 'Masterclass' : 'Inquiry'}
                </span>
                <span
                  className="pass-chip small"
                  title="Click to copy pass code"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard?.writeText(effectivePassId);
                    showToast(`Copied ${effectivePassId}`);
                  }}
                >
                  <Ticket size={10} /> {effectivePassId.slice(-6)}
                </span>
              </div>
            </div>
          </div>

          {/* Compact Status Pill */}
          <div className={`status-select-wrap small status-${statusLower}`}>
            <span className="status-dot"></span>
            <select
              className={`select-status small select-${statusLower}`}
              value={l.status || 'New'}
              onChange={e => handleUpdateLeadStatus(l._id, e.target.value)}
              title="Update status"
            >
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Qualified">Qualified</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>

        {/* Small Stacked Contact Box (No Side-by-Side Wraps) */}
        <div className="lead-card-contact-box small">
          <div className="contact-row-item small">
            <Phone size={11} className="text-mint shrink-0" />
            <a href={`tel:${l.mobile}`} className="contact-value phone-link" title="Call candidate">
              {l.code || '+91'} {l.mobile}
            </a>
          </div>
          {l.email && (
            <div className="contact-row-item small">
              <Mail size={11} className="text-blue shrink-0" />
              <a href={`mailto:${l.email}`} className="contact-value email-link" title={l.email}>
                {l.email}
              </a>
            </div>
          )}
          <div className="contact-row-item small location">
            <MapPin size={11} className="text-emerald shrink-0" />
            <span className="location-badge-text">{l.city || 'Pune (Hinjawadi)'}</span>
          </div>
        </div>

        {/* Compact Program Title */}
        <div className="lead-card-course-box small">
          <div className="lead-card-course-header small">
            <BookOpen size={12} className="text-blue shrink-0" />
            <strong className="course-main-text small" title={courseInfo.main}>{courseInfo.main}</strong>
          </div>
          {courseInfo.sub && (
            <span className="course-sub-badge small">{courseInfo.sub}</span>
          )}
        </div>

        {/* Compact Single-line Slot Pill */}
        <div className="lead-card-slot-box small">
          <div className="slot-pill-card small">
            <div className="slot-time-line small">
              <Clock size={11} className="text-teal shrink-0" />
              <span>{slotInfo.timePart}</span>
            </div>
            {slotInfo.datePart && (
              <span className="slot-date-mini">• {slotInfo.datePart.replace(' 2027', '')}</span>
            )}
          </div>
        </div>

        {/* Compact Footer: Date & Micro Actions */}
        <div className="lead-card-footer small">
          <span className="lead-card-timestamp-text small">
            {new Date(l.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
          </span>

          <div className="lead-card-actions small">
            <button
              type="button"
              className="btn-card-action view small"
              onClick={() => {
                setEditingItem({ ...l, passId: effectivePassId });
                setCounselorNoteText(l.notes || '');
                setActiveModal('lead-details');
              }}
              title="View Admission Dossier & Pass"
            >
              <Eye size={11} /> <span>Dossier</span>
            </button>
            <a
              href={`tel:${l.mobile}`}
              className="btn-card-action call small"
              title="Call Candidate"
            >
              <Phone size={11} /> <span>Call</span>
            </a>
            <button
              type="button"
              className="btn-card-action delete small"
              onClick={() => handleDelete(l._id)}
              title="Delete Candidate Record"
            >
              <Trash2 size={11} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'batches', icon: Calendar, label: 'Batches & Labs' },
    { id: 'courses', icon: BookOpen, label: 'Courses' },
    { id: 'leads', icon: Users, label: 'Leads & Inquiries' },
    { id: 'testimonials', icon: MessageSquareText, label: 'Testimonials' },
    { id: 'reports', icon: FileText, label: 'Reports' },
    { id: 'faqs', icon: HelpCircle, label: 'FAQs' }
  ];

  return (
    <div className="admin-app">
      {/* Toast Notification */}
      {toast && (
        <div className={`toast-alert ${toast.type}`}>
          {toast.message}
        </div>
      )}

      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-logo white">
            NEXA<span className="logo-accent">AI</span> LAB
          </div>
          <span className="sidebar-badge">Control Center</span>
        </div>

        <div className="sidebar-user-card">
          <div className="user-avatar">AD</div>
          <div className="user-info">
            <strong>{user?.name || 'Administrator'}</strong>
            <small>{user?.email || 'admin@example.com'}</small>
          </div>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`nav-btn ${page === item.id ? 'active' : ''}`}
                onClick={() => setPage(item.id)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <a
            href={LIVE_SITE_URL}
            target="_blank"
            rel="noreferrer"
            className="external-link-btn"
            title="Open Live Website: https://nexaai.aparaitech.org"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#0284c7', color: '#fff', padding: '10px 14px', borderRadius: '10px', fontWeight: 700, textDecoration: 'none', marginBottom: '8px' }}
          >
            <ExternalLink size={16} /> 🌐 Live Website (nexaai.aparaitech.org)
          </a>
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        {/* Top Header */}
        <header className="admin-topbar">
          <div className="page-heading">
            <h1>{menuItems.find(x => x.id === page)?.label}</h1>
            <p>Real-time content management & leads operations.</p>
          </div>

          <div className="topbar-actions">
            <a
              href={LIVE_SITE_URL}
              target="_blank"
              rel="noreferrer"
              className="topbar-live-site-pill"
              title="Open Live Production Website: https://nexaai.aparaitech.org"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '999px',
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                color: '#1d4ed8',
                fontSize: '12px',
                fontWeight: 700,
                textDecoration: 'none',
                boxShadow: '0 1px 3px rgba(29, 78, 216, 0.08)'
              }}
            >
              <ExternalLink size={13} />
              <span>🌐 Live: nexaai.aparaitech.org</span>
            </a>

            <div
              className="backend-source-pill"
              onClick={switchOrRetryBackend}
              title={`API Data Source: ${apiSource === 'local' ? 'Local Backend (http://localhost:5000)' : 'Live Cloud API on Render (https://nexaailab.onrender.com)'}. Click to switch or retry local backend.`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '999px',
                background: apiSource === 'local' ? '#f0fdf4' : '#f0f9ff',
                border: apiSource === 'local' ? '1px solid #86efac' : '1px solid #bae6fd',
                color: apiSource === 'local' ? '#166534' : '#0369a1',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                userSelect: 'none',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: apiSource === 'local' ? '#22c55e' : '#0284c7',
                  boxShadow: `0 0 6px ${apiSource === 'local' ? '#22c55e' : '#0284c7'}`
                }}
              ></span>
              <span>{apiSource === 'local' ? 'Local Backend (5000)' : 'Cloud Live API'}</span>
            </div>

            <div className="live-sync-indicator" title="MongoDB Atlas live sync polling active (4s)">
              <span className="live-pulse-dot"></span>
              <span className="live-sync-text">LIVE SYNC (4s)</span>
              <span className="live-sync-time">{lastRefreshedAt.toLocaleTimeString()}</span>
            </div>
            <button className="btn-refresh" onClick={handleManualRefresh} disabled={loading || isRefreshing}>
              <RefreshCw size={16} className={(loading || isRefreshing) ? 'spin' : ''} />
              <span>{(loading || isRefreshing) ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>
        </header>

        {/* ================= PAGE: DASHBOARD ================= */}
        {page === 'dashboard' && (
          <div className="dashboard-view">
            {/* Stat Cards */}
            <div className="stats-grid">
              <div className="stat-box" onClick={() => setPage('batches')} style={{ cursor: 'pointer' }}>
                <div className="stat-icon icon-teal"><Calendar size={24} /></div>
                <div className="stat-content">
                  <b>{stats.batches || 0}</b>
                  <span>Batches & Labs</span>
                </div>
              </div>

              <div className="stat-box" onClick={() => setPage('courses')} style={{ cursor: 'pointer' }}>
                <div className="stat-icon icon-blue"><BookOpen size={24} /></div>
                <div className="stat-content">
                  <b>{stats.courses || 0}</b>
                  <span>Active Courses</span>
                </div>
              </div>

              <div className="stat-box" onClick={() => setPage('leads')} style={{ cursor: 'pointer' }}>
                <div className="stat-icon icon-mint"><Users size={24} /></div>
                <div className="stat-content">
                  <b>{stats.leads || 0}</b>
                  <span>Total Leads</span>
                </div>
              </div>

              <div className="stat-box" onClick={() => setPage('testimonials')} style={{ cursor: 'pointer' }}>
                <div className="stat-icon icon-purple"><MessageSquareText size={24} /></div>
                <div className="stat-content">
                  <b>{stats.testimonials || 0}</b>
                  <span>Testimonials</span>
                </div>
              </div>

              <div className="stat-box" onClick={() => setPage('reports')} style={{ cursor: 'pointer' }}>
                <div className="stat-icon icon-orange"><FileText size={24} /></div>
                <div className="stat-content">
                  <b>{stats.reports || 0}</b>
                  <span>Published Reports</span>
                </div>
              </div>
            </div>

            {/* Quick Actions & System Info */}
            <div className="dashboard-widgets-row">
              <div className="widget-card">
                <h3>Quick Management Actions</h3>
                <div className="quick-actions-row">
                  <button className="btn-action" onClick={() => { setPage('batches'); openAddModal(); }}>
                    <Plus size={16} /> Add Batch / Lab
                  </button>
                  <button className="btn-action" onClick={() => { setPage('courses'); openAddModal(); }}>
                    <Plus size={16} /> Add Course
                  </button>
                  <button className="btn-action" onClick={() => setPage('leads')}>
                    <Eye size={16} /> Review Inquiries
                  </button>
                  <button className="btn-action" onClick={() => { setPage('testimonials'); openAddModal(); }}>
                    <Plus size={16} /> Add Testimonial
                  </button>
                  <button className="btn-action" onClick={() => { setPage('reports'); openAddModal(); }}>
                    <Plus size={16} /> Add Whitepaper
                  </button>
                </div>
              </div>

              <div className="widget-card system-card">
                <h3>System & API Status</h3>
                <div className="sys-status-row">
                  <div className="status-item">
                    <Database size={18} color="#059669" />
                    <div>
                      <strong>Storage Engine</strong>
                      <span>Active & Synchronized</span>
                    </div>
                  </div>
                  <div className="status-item">
                    <ShieldCheck size={18} color="#0284c7" />
                    <div>
                      <strong>JWT Auth Security</strong>
                      <span>Tokens active (3 days)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Leads Widget */}
            <div className="widget-card">
              <div className="widget-header">
                <h3>Recent Callback & Counseling Inquiries</h3>
                <button className="btn-link" onClick={() => setPage('leads')}>View All Leads →</button>
              </div>

              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Candidate Name</th>
                      <th>Mobile</th>
                      <th>Email</th>
                      <th>City</th>
                      <th>Course / Interest</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center empty-state">No inquiries received yet.</td>
                      </tr>
                    ) : (
                      data.map(lead => (
                        <tr key={lead._id}>
                          <td><strong>{lead.name}</strong></td>
                          <td>{lead.code || '+91'} {lead.mobile}</td>
                          <td>{lead.email}</td>
                          <td>{lead.city || 'Online'}</td>
                          <td>{lead.course || 'General Callback'}</td>
                          <td>
                            <span className={`status-pill pill-${(lead.status || 'New').toLowerCase()}`}>
                              {lead.status || 'New'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= PAGE: COURSES / LEADS / TESTIMONIALS / REPORTS / FAQS ================= */}
        {page !== 'dashboard' && (
          <div className="table-view">
            {/* Leads Metric KPI Distribution Cards */}
            {page === 'leads' && (
              <div className="leads-kpi-grid">
                {/* 1. All Records */}
                <div
                  className={`lead-kpi-card ${statusFilter === 'All' && !search ? 'active-card' : ''}`}
                  onClick={() => { setStatusFilter('All'); setSearch(''); }}
                  title="Click to view all lead records"
                >
                  <div className="lead-kpi-header">
                    <div className="kpi-icon-box navy">
                      <Users size={20} />
                    </div>
                    <span className="kpi-trend-pill">All Records</span>
                  </div>
                  <div className="lead-kpi-body">
                    <h3>{data.length}</h3>
                    <p>Total Leads & Inquiries</p>
                    <small>Full candidate funnel & registrations</small>
                  </div>
                </div>

                {/* 2. New Inquiries */}
                <div
                  className={`lead-kpi-card ${statusFilter === 'New' ? 'active-card' : ''}`}
                  onClick={() => setStatusFilter(statusFilter === 'New' ? 'All' : 'New')}
                  title="Click to filter by New status"
                >
                  <div className="lead-kpi-header">
                    <div className="kpi-icon-box amber">
                      <Clock size={20} />
                    </div>
                    <span className="kpi-trend-pill amber">Action Needed</span>
                  </div>
                  <div className="lead-kpi-body">
                    <h3>{data.filter(l => (l.status || 'New').toLowerCase() === 'new').length}</h3>
                    <p>New Inquiries</p>
                    <small>Awaiting admissions counselor outreach</small>
                  </div>
                </div>

                {/* 3. Contacted & Dialed Inquiries */}
                <div
                  className={`lead-kpi-card ${statusFilter === 'Contacted' ? 'active-card' : ''}`}
                  onClick={() => setStatusFilter(statusFilter === 'Contacted' ? 'All' : 'Contacted')}
                  title="Click to filter by Contacted / Dialed status"
                >
                  <div className="lead-kpi-header">
                    <div className="kpi-icon-box blue">
                      <Phone size={20} />
                    </div>
                    <span className="kpi-trend-pill blue">Dialed & Outreach</span>
                  </div>
                  <div className="lead-kpi-body">
                    <h3>{data.filter(l => (l.status || '').toLowerCase() === 'contacted').length}</h3>
                    <p>Contacted & Dialed</p>
                    <small>Phone calls placed • In discussion</small>
                  </div>
                </div>

                {/* 4. Qualified Candidates */}
                <div
                  className={`lead-kpi-card ${statusFilter === 'Qualified' ? 'active-card' : ''}`}
                  onClick={() => setStatusFilter(statusFilter === 'Qualified' ? 'All' : 'Qualified')}
                  title="Click to filter by Qualified status"
                >
                  <div className="lead-kpi-header">
                    <div className="kpi-icon-box purple">
                      <CheckCircle2 size={20} />
                    </div>
                    <span className="kpi-trend-pill purple">High Intent</span>
                  </div>
                  <div className="lead-kpi-body">
                    <h3>{data.filter(l => (l.status || '').toLowerCase() === 'qualified').length}</h3>
                    <p>Qualified Candidates</p>
                    <small>Counseling evaluated • Ready for Jan Cohort</small>
                  </div>
                </div>

                {/* 5. Closed Inquiries */}
                <div
                  className={`lead-kpi-card ${statusFilter === 'Closed' ? 'active-card' : ''}`}
                  onClick={() => setStatusFilter(statusFilter === 'Closed' ? 'All' : 'Closed')}
                  title="Click to filter by Closed status"
                >
                  <div className="lead-kpi-header">
                    <div className="kpi-icon-box slate">
                      <Check size={20} />
                    </div>
                    <span className="kpi-trend-pill slate">Resolved / Enrolled</span>
                  </div>
                  <div className="lead-kpi-body">
                    <h3>{data.filter(l => (l.status || '').toLowerCase() === 'closed').length}</h3>
                    <p>Closed Inquiries</p>
                    <small>Enrolled candidates or archived leads</small>
                  </div>
                </div>

                {/* 6. Confirmed Classroom & Lab Passes */}
                <div
                  className={`lead-kpi-card ${search.toUpperCase().includes('PASS') ? 'active-card' : ''}`}
                  onClick={() => {
                    setSearch(search === 'PASS' ? '' : 'PASS');
                  }}
                  title="Click to view confirmed digital pass bookings"
                >
                  <div className="lead-kpi-header">
                    <div className="kpi-icon-box emerald">
                      <Ticket size={20} />
                    </div>
                    <span className="kpi-trend-pill emerald">Passes</span>
                  </div>
                  <div className="lead-kpi-body">
                    <h3>{data.filter(l => l.passId || (l.source && (l.source.includes('Slot') || l.source.includes('Pass')))).length}</h3>
                    <p>Classroom & Lab Passes</p>
                    <small>Pune Hinjawadi & Live Station Passes</small>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Status Distribution Tabs Bar */}
            {page === 'leads' && (
              <div className="leads-status-pipeline-tabs">
                <button
                  type="button"
                  className={`pipeline-tab-pill ${statusFilter === 'All' && !search ? 'active' : ''}`}
                  onClick={() => { setStatusFilter('All'); setSearch(''); }}
                >
                  <span>All Leads</span>
                  <b className="tab-pill-badge">{data.length}</b>
                </button>
                <button
                  type="button"
                  className={`pipeline-tab-pill new ${statusFilter === 'New' ? 'active' : ''}`}
                  onClick={() => { setStatusFilter('New'); }}
                >
                  <span className="tab-status-dot new"></span>
                  <span>New Inquiries</span>
                  <b className="tab-pill-badge">{data.filter(l => (l.status || 'New').toLowerCase() === 'new').length}</b>
                </button>
                <button
                  type="button"
                  className={`pipeline-tab-pill contacted ${statusFilter === 'Contacted' ? 'active' : ''}`}
                  onClick={() => { setStatusFilter('Contacted'); }}
                >
                  <span className="tab-status-dot contacted"></span>
                  <span>Contacted & Dialed</span>
                  <b className="tab-pill-badge">{data.filter(l => (l.status || '').toLowerCase() === 'contacted').length}</b>
                </button>
                <button
                  type="button"
                  className={`pipeline-tab-pill qualified ${statusFilter === 'Qualified' ? 'active' : ''}`}
                  onClick={() => { setStatusFilter('Qualified'); }}
                >
                  <span className="tab-status-dot qualified"></span>
                  <span>Qualified</span>
                  <b className="tab-pill-badge">{data.filter(l => (l.status || '').toLowerCase() === 'qualified').length}</b>
                </button>
                <button
                  type="button"
                  className={`pipeline-tab-pill closed ${statusFilter === 'Closed' ? 'active' : ''}`}
                  onClick={() => { setStatusFilter('Closed'); }}
                >
                  <span className="tab-status-dot closed"></span>
                  <span>Closed</span>
                  <b className="tab-pill-badge">{data.filter(l => (l.status || '').toLowerCase() === 'closed').length}</b>
                </button>
                <button
                  type="button"
                  className={`pipeline-tab-pill passes ${search.toUpperCase().includes('PASS') ? 'active' : ''}`}
                  onClick={() => { setSearch(search === 'PASS' ? '' : 'PASS'); }}
                >
                  <Ticket size={13} />
                  <span>Confirmed Passes</span>
                  <b className="tab-pill-badge">{data.filter(l => l.passId || (l.source && (l.source.includes('Slot') || l.source.includes('Pass')))).length}</b>
                </button>
              </div>
            )}

            {/* Toolbar */}
            <div className="table-toolbar">
              <div className="toolbar-left">
                <div className="search-input-wrap">
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder={`Search ${page}...`}
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>

                {page === 'batches' && (
                  <>
                    <div className="filter-select-wrap">
                      <MapPin size={16} />
                      <select value={cityFilter} onChange={e => setCityFilter(e.target.value)}>
                        <option value="All">All Locations</option>
                        <option value="Pune">Pune (Hinjawadi)</option>
                        <option value="Bangalore">Bangalore</option>
                        <option value="Gurgaon">Gurgaon</option>
                        <option value="Noida">Noida</option>
                        <option value="Interactive Live Online">Interactive Live Online</option>
                      </select>
                    </div>

                    <div className="filter-select-wrap">
                      <Filter size={16} />
                      <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                        <option value="All">All Types</option>
                        <option value="Classroom Course">Classroom Courses</option>
                        <option value="AI & Robotics Lab">AI & Robotics Labs</option>
                      </select>
                    </div>

                    <div className="filter-select-wrap">
                      <Calendar size={16} />
                      <select value={monthFilter} onChange={e => setMonthFilter(e.target.value)}>
                        <option value="All">All Months</option>
                        <option value="January">January (Upcoming)</option>
                        <option value="September">September</option>
                      </select>
                    </div>
                  </>
                )}

                {page === 'leads' && (
                  <div className="filter-select-wrap">
                    <Filter size={16} />
                    <select
                      value={statusFilter}
                      onChange={e => setStatusFilter(e.target.value)}
                    >
                      <option value="All">All Statuses</option>
                      <option value="New">New</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Qualified">Qualified</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="toolbar-right">
                {/* Auto-Refresh Toggle with Live Radar Indicator */}
                <button
                  type="button"
                  className={`btn-auto-refresh ${autoRefresh ? 'active' : ''}`}
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  title={autoRefresh ? 'Live Auto-Refresh ON (syncs every 10s). Click to pause.' : 'Auto-Refresh paused. Click to enable.'}
                >
                  <span className={`auto-refresh-dot ${autoRefresh ? 'live' : 'paused'}`}></span>
                  <RefreshCw size={12} className={isRefreshing ? 'spin-anim' : ''} />
                  <span>{autoRefresh ? 'Auto-Refresh (10s)' : 'Auto-Refresh: OFF'}</span>
                </button>

                {/* Instant Manual Refresh Button */}
                <button
                  type="button"
                  className="btn-refresh-now"
                  onClick={handleManualRefresh}
                  title="Sync and refresh data right now"
                >
                  <RefreshCw size={14} className={isRefreshing ? 'spin-anim' : ''} />
                </button>

                {/* Layout View Format Toggle: Table vs Cards */}
                <div className="view-mode-toggle" title="Switch between Table and Cards format">
                  <button
                    type="button"
                    className={`view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
                    onClick={() => handleSetViewMode('table')}
                  >
                    <List size={15} />
                    <span>Table</span>
                  </button>
                  <button
                    type="button"
                    className={`view-toggle-btn ${viewMode === 'cards' ? 'active' : ''}`}
                    onClick={() => handleSetViewMode('cards')}
                  >
                    <LayoutGrid size={15} />
                    <span>Cards</span>
                  </button>
                </div>

                {/* When on Leads Cards: Sub-mode Pipeline Columns vs Flat Grid */}
                {page === 'leads' && viewMode === 'cards' && (
                  <div className="pipeline-toggle-wrap" title="Card arrangement format">
                    <button
                      type="button"
                      className={`pipeline-toggle-btn ${leadsGrouping === 'pipeline' ? 'active' : ''}`}
                      onClick={() => handleSetLeadsGrouping('pipeline')}
                      title="Group leads into proper status columns (New, Contacted, Qualified, Closed)"
                    >
                      <Columns3 size={13} />
                      <span>By Status</span>
                    </button>
                    <button
                      type="button"
                      className={`pipeline-toggle-btn ${leadsGrouping === 'grid' ? 'active' : ''}`}
                      onClick={() => handleSetLeadsGrouping('grid')}
                      title="Standard flat cards grid"
                    >
                      <LayoutGrid size={13} />
                      <span>All Grid</span>
                    </button>
                  </div>
                )}

                <button className="btn-add-new" onClick={openAddModal}>
                  <Plus size={16} /> Add New {page === 'batches' ? 'Batch / Lab' : page === 'leads' ? 'Lead / Booking' : page.slice(0, -1)}
                </button>
                <span className="record-count">{filteredData.length} records</span>
              </div>
            </div>

            {/* Render Table or Cards format based on viewMode */}
            {viewMode === 'table' ? (
              <div className="table-card">
              <div className="table-responsive">
                <table className="data-table">
                  {page === 'batches' && (
                    <>
                      <thead>
                        <tr>
                          <th>Type</th>
                          <th>Program / Lab Name</th>
                          <th>Campus Location</th>
                          <th>Cohort Mode</th>
                          <th>Start Date</th>
                          <th>Timings</th>
                          <th>Seats Availability</th>
                          <th>Status</th>
                          <th className="actions-col">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredData.length === 0 ? (
                          <tr>
                            <td colSpan={9} className="text-center empty-state">
                              No batches or labs found matching your filters.
                            </td>
                          </tr>
                        ) : (
                          filteredData.map(b => (
                            <tr key={b._id}>
                              <td>
                                <span className={b.type === 'AI & Robotics Lab' ? 'badge-lab' : 'badge-classroom'}>
                                  {b.type === 'AI & Robotics Lab' ? <Cpu size={12} /> : <BookOpen size={12} />}
                                  {b.type === 'AI & Robotics Lab' ? 'Robotics Lab' : 'Classroom'}
                                </span>
                              </td>
                              <td>
                                <strong>{b.title}</strong>
                                <small className="cell-sub">{b.locationDetail || (b.duration ? `${b.duration} • ${b.partner || ''}` : '')}</small>
                                {b.workstation && <small className="cell-sub" style={{ color: '#059669', fontWeight: 600 }}>Bay: {b.workstation}</small>}
                              </td>
                              <td>
                                <div>
                                  <MapPin size={13} style={{ display: 'inline', verticalAlign: '-1px', color: '#059669' }} />{' '}
                                  <b>{b.city}</b>
                                  {b.city && b.city.includes('Pune') && <span className="badge-pune">HINJAWADI</span>}
                                </div>
                              </td>
                              <td><span className="badge-tag">{b.mode}</span></td>
                              <td>
                                <b>{b.date}</b>
                                {b.month && <span className="badge-tag" style={{ marginLeft: 6 }}>{b.month}</span>}
                              </td>
                              <td>
                                <Clock size={12} style={{ display: 'inline', verticalAlign: '-1px', color: '#64748b' }} /> {b.time}
                              </td>
                              <td>
                                <div className="table-seats-cell">
                                  <span className={`seats-pill ${Number(b.seatsLeft) <= 4 ? 'urgent' : ''}`}>
                                    {b.seatsLeft || 0} / {b.totalSeats || 25} left
                                  </span>
                                  <div className="table-seat-stepper">
                                    <button
                                      type="button"
                                      className="btn-mini-step"
                                      onClick={() => handleQuickAdjustSeats(b, -1)}
                                      title="Seats - 1"
                                    >
                                      -
                                    </button>
                                    <button
                                      type="button"
                                      className="btn-mini-step"
                                      onClick={() => handleQuickAdjustSeats(b, 1)}
                                      title="Seats + 1"
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <button
                                  type="button"
                                  className={`status-pill clickable ${b.active !== false ? 'pill-closed' : 'pill-contacted'}`}
                                  onClick={() => handleToggleBatchStatus(b)}
                                  title="Click to toggle Active / Closed status"
                                >
                                  {b.active !== false ? '● Active' : '○ Closed'}
                                </button>
                              </td>
                              <td className="actions-col">
                                <button className="icon-btn edit" onClick={() => openEditModal(b)} title="Edit Batch/Lab">
                                  <Edit size={16} />
                                </button>
                                <button className="icon-btn delete" onClick={() => handleDelete(b._id)} title="Delete Batch/Lab">
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </>
                  )}

                  {page === 'courses' && (
                    <>
                      <thead>
                        <tr>
                          <th>Thumbnail</th>
                          <th>Course Title</th>
                          <th>Category</th>
                          <th>Duration (Months)</th>
                          <th>Actual Amount (M.R.P.)</th>
                          <th>Offer Amount</th>
                          <th>Offer / Savings</th>
                          <th>Starting EMI</th>
                          <th>Batches</th>
                          <th className="actions-col">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredData.map(c => (
                          <tr key={c._id}>
                            <td>
                              <img src={c.image} alt={c.title} className="table-thumb" />
                            </td>
                            <td>
                              <strong>{c.title}</strong>
                              {c.badge && <span className="cell-sub" style={{ display: 'block', color: '#0284c7' }}>{c.badge}</span>}
                            </td>
                            <td>{c.category}</td>
                            <td>
                              <strong>{c.duration || '6–8 Months'}</strong>
                              <small className="cell-sub">{c.hours || '500 Hrs'}</small>
                            </td>
                            <td>
                              <span style={{ textDecoration: 'line-through', color: '#94a3b8', fontWeight: 600 }}>
                                {c.originalFee || '₹68,000'}
                              </span>
                            </td>
                            <td>
                              <span style={{ color: '#0369a1', fontWeight: 800, fontSize: '14.5px' }}>
                                {c.fee || '₹55,000'}
                              </span>
                            </td>
                            <td>
                              <span className="badge-tag" style={{ background: '#dcfce7', color: '#15803d', fontWeight: 700 }}>
                                {c.saveAmount || 'Save ₹13,000'}
                              </span>
                            </td>
                            <td>
                              <small style={{ color: '#475569', fontWeight: 600 }}>
                                {c.emi || '₹4,583/mo'}
                              </small>
                            </td>
                            <td>{(c.batches || []).length} scheduled</td>
                            <td className="actions-col">
                              <button className="icon-btn edit" onClick={() => openEditModal(c)} title="Edit Fees, Months & Details">
                                <Edit size={16} />
                              </button>
                              <button className="icon-btn delete" onClick={() => handleDelete(c._id)} title="Delete Course">
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </>
                  )}

                  {page === 'leads' && (
                    <>
                      <thead>
                        <tr>
                          <th>Candidate</th>
                          <th>Contact</th>
                          <th>City / Center</th>
                          <th>Course / Subject</th>
                          <th>Reserved Slot / Timings</th>
                          <th>CRM Status</th>
                          <th>Created</th>
                          <th className="actions-col">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredData.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="text-center empty-state">
                              <div className="empty-state-box">
                                <Users size={32} className="text-muted" />
                                <p>No leads or bookings found matching your search or filters.</p>
                                <button
                                  className="btn-outline small mt-10"
                                  onClick={() => { setSearch(''); setStatusFilter('All'); }}
                                >
                                  Clear Filters
                                </button>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          filteredData.map(l => {
                            const courseInfo = formatCourseTitle(l.course);
                            const slotInfo = formatSlotTimings(l.preferredSlot, l.date, l.time);
                            const isSlotBooking = (l.source && (l.source.includes('Slot') || l.source.includes('Appointment') || l.source.includes('Pass'))) || l.passId;
                            const isMasterclass = l.source && (l.source.includes('Masterclass') || l.source.includes('Workshop'));
                            const isPune = (l.city || '').toLowerCase().includes('pune');

                            return (
                              <tr key={l._id} className="lead-table-row">
                                <td className="candidate-td">
                                  <div className="candidate-profile-flex">
                                    <div
                                      className="candidate-avatar-circle"
                                      style={{ background: getAvatarBg(l.name) }}
                                      title={l.name}
                                    >
                                      {getInitials(l.name)}
                                    </div>
                                    <div className="candidate-info-col">
                                      <strong className="candidate-name-title">{l.name}</strong>
                                      <div className="candidate-badges-wrap">
                                        <span className={`source-pill ${isSlotBooking ? 'booking' : isMasterclass ? 'masterclass' : 'web'}`}>
                                          {isSlotBooking ? '📍 Classroom Seat' : isMasterclass ? '✨ Masterclass' : '🌐 Web Inquiry'}
                                        </span>
                                        {l.passId && (
                                          <span
                                            className="pass-chip"
                                            title="Click to copy digital pass code"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              navigator.clipboard?.writeText(l.passId);
                                              showToast(`Copied ${l.passId} to clipboard!`);
                                            }}
                                          >
                                            <Ticket size={11} /> {l.passId}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </td>

                                <td className="contact-td">
                                  <div className="contact-links-box">
                                    <a href={`tel:${l.mobile}`} className="contact-item-link phone" title="Call candidate">
                                      <Phone size={12} className="text-mint" />
                                      <span>{l.code || '+91'} {l.mobile}</span>
                                    </a>
                                    {l.email && (
                                      <a href={`mailto:${l.email}`} className="contact-item-link email" title="Email candidate">
                                        <Mail size={12} className="text-blue" />
                                        <span>{l.email}</span>
                                      </a>
                                    )}
                                  </div>
                                </td>

                                <td className="city-td">
                                  <span className={`city-pill ${isPune ? 'pune' : 'other'}`}>
                                    <MapPin size={12} /> {l.city || 'Pune (Hinjawadi)'}
                                  </span>
                                </td>

                                <td className="course-td">
                                  <div className="course-info-box">
                                    <strong className="course-main-text">{courseInfo.main}</strong>
                                    {courseInfo.sub && (
                                      <span className="course-sub-badge">{courseInfo.sub}</span>
                                    )}
                                    {l.background && (
                                      <small className="candidate-bg-text">👤 {l.background}</small>
                                    )}
                                  </div>
                                </td>

                                <td className="slot-td">
                                  <div className="slot-pill-card">
                                    <div className="slot-time-line">
                                      <Clock size={12} className="text-teal" />
                                      <span>{slotInfo.timePart}</span>
                                    </div>
                                    {slotInfo.datePart && (
                                      <div className="slot-date-line">
                                        <Calendar size={12} className="text-teal" />
                                        <small>{slotInfo.datePart}</small>
                                      </div>
                                    )}
                                  </div>
                                </td>

                                <td className="status-td">
                                  <div className={`status-select-wrap status-${(l.status || 'New').toLowerCase()}`}>
                                    <span className="status-dot"></span>
                                    <select
                                      className={`select-status select-${(l.status || 'New').toLowerCase()}`}
                                      value={l.status || 'New'}
                                      onChange={e => handleUpdateLeadStatus(l._id, e.target.value)}
                                    >
                                      <option value="New">New</option>
                                      <option value="Contacted">Contacted</option>
                                      <option value="Qualified">Qualified</option>
                                      <option value="Closed">Closed</option>
                                    </select>
                                  </div>
                                </td>

                                <td className="date-td">
                                  <span className="date-badge-text">
                                    {new Date(l.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                  </span>
                                </td>

                                <td className="actions-col">
                                  <div className="action-buttons-group">
                                    <button
                                      className="icon-btn view"
                                      onClick={() => {
                                        setEditingItem(l);
                                        setActiveModal('lead-details');
                                      }}
                                      title="View Candidate Dossier & Digital Pass"
                                    >
                                      <Eye size={15} />
                                    </button>
                                    <a
                                      href={`tel:${l.mobile}`}
                                      className="icon-btn call"
                                      title="Call Candidate Now"
                                    >
                                      <Phone size={14} />
                                    </a>
                                    <button
                                      className="icon-btn delete"
                                      onClick={() => handleDelete(l._id)}
                                      title="Delete Record"
                                    >
                                      <Trash2 size={15} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </>
                  )}

                  {page === 'testimonials' && (
                    <>
                      <thead>
                        <tr>
                          <th>Photo</th>
                          <th>Learner Name</th>
                          <th>Current Role</th>
                          <th>Placed At</th>
                          <th>Salary Hike</th>
                          <th>Tags</th>
                          <th className="actions-col">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredData.map(t => (
                          <tr key={t._id}>
                            <td>
                              <img src={t.image} alt={t.name} className="table-avatar" />
                            </td>
                            <td><strong>{t.name}</strong></td>
                            <td>{t.role}, {t.company}</td>
                            <td><span className="badge-placed">{t.placedAt}</span></td>
                            <td><span className="badge-hike">{t.hike}</span></td>
                            <td>{(t.tags || []).join(', ')}</td>
                            <td className="actions-col">
                              <button className="icon-btn edit" onClick={() => openEditModal(t)}>
                                <Edit size={16} />
                              </button>
                              <button className="icon-btn delete" onClick={() => handleDelete(t._id)}>
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </>
                  )}

                  {page === 'reports' && (
                    <>
                      <thead>
                        <tr>
                          <th>Thumbnail</th>
                          <th>Report Title</th>
                          <th>Pages</th>
                          <th>Downloads</th>
                          <th>Created</th>
                          <th className="actions-col">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredData.map(r => (
                          <tr key={r._id}>
                            <td>
                              <img src={r.image} alt={r.title} className="table-thumb" />
                            </td>
                            <td><strong>{r.title}</strong></td>
                            <td>{r.pages || '40 Pages'}</td>
                            <td>{r.downloads || '10,000+'}</td>
                            <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                            <td className="actions-col">
                              <button className="icon-btn edit" onClick={() => openEditModal(r)}>
                                <Edit size={16} />
                              </button>
                              <button className="icon-btn delete" onClick={() => handleDelete(r._id)}>
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </>
                  )}

                  {page === 'faqs' && (
                    <>
                      <thead>
                        <tr>
                          <th>Order</th>
                          <th>Question</th>
                          <th>Answer Snippet</th>
                          <th className="actions-col">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredData.map(f => (
                          <tr key={f._id}>
                            <td><b>#{f.order || 1}</b></td>
                            <td><strong>{f.question}</strong></td>
                            <td className="faq-ans-cell">{f.answer}</td>
                            <td className="actions-col">
                              <button className="icon-btn edit" onClick={() => openEditModal(f)}>
                                <Edit size={16} />
                              </button>
                              <button className="icon-btn delete" onClick={() => handleDelete(f._id)}>
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </>
                  )}
                </table>
              </div>
            </div>
          ) : (
            /* ================= CARDS VIEW FORMAT ================= */
            <div className="cards-view-wrapper">
              {/* 1. LEADS CARDS */}
              {page === 'leads' && (
                filteredData.length === 0 ? (
                  <div className="table-card">
                    <div className="empty-state-box">
                      <Users size={32} className="text-muted" />
                      <p>No leads or bookings found matching your search or filters.</p>
                      <button
                        className="btn-outline small mt-10"
                        onClick={() => { setSearch(''); setStatusFilter('All'); }}
                      >
                        Clear Filters
                      </button>
                    </div>
                  </div>
                ) : leadsGrouping === 'pipeline' && statusFilter === 'All' && !search ? (
                  /* PIPELINE COLUMNS: Each lead distributed into its proper status card bucket */
                  <div className="leads-pipeline-board">
                    {/* 1. New Inquiries Column */}
                    <div className="pipeline-column col-new">
                      <div className="pipeline-col-header">
                        <div className="pipeline-col-title-wrap">
                          <span className="col-status-dot new"></span>
                          <h4>New Inquiries</h4>
                        </div>
                        <span className="pipeline-col-count">
                          {filteredData.filter(l => (l.status || 'New').toLowerCase() === 'new').length}
                        </span>
                      </div>
                      <p className="pipeline-col-sub">Awaiting admissions counselor outreach</p>
                      <div className="pipeline-col-cards">
                        {filteredData.filter(l => (l.status || 'New').toLowerCase() === 'new').map(renderLeadCard)}
                        {filteredData.filter(l => (l.status || 'New').toLowerCase() === 'new').length === 0 && (
                          <div className="pipeline-empty-column">No new inquiries at this moment</div>
                        )}
                      </div>
                    </div>

                    {/* 2. Contacted / Dialed Column */}
                    <div className="pipeline-column col-contacted">
                      <div className="pipeline-col-header">
                        <div className="pipeline-col-title-wrap">
                          <span className="col-status-dot contacted"></span>
                          <h4>Contacted & Dialed</h4>
                        </div>
                        <span className="pipeline-col-count">
                          {filteredData.filter(l => (l.status || '').toLowerCase() === 'contacted').length}
                        </span>
                      </div>
                      <p className="pipeline-col-sub">Phone calls placed • In active counseling</p>
                      <div className="pipeline-col-cards">
                        {filteredData.filter(l => (l.status || '').toLowerCase() === 'contacted').map(renderLeadCard)}
                        {filteredData.filter(l => (l.status || '').toLowerCase() === 'contacted').length === 0 && (
                          <div className="pipeline-empty-column">No contacted inquiries</div>
                        )}
                      </div>
                    </div>

                    {/* 3. Qualified Column */}
                    <div className="pipeline-column col-qualified">
                      <div className="pipeline-col-header">
                        <div className="pipeline-col-title-wrap">
                          <span className="col-status-dot qualified"></span>
                          <h4>Qualified Candidates</h4>
                        </div>
                        <span className="pipeline-col-count">
                          {filteredData.filter(l => (l.status || '').toLowerCase() === 'qualified').length}
                        </span>
                      </div>
                      <p className="pipeline-col-sub">Evaluated for admission • Ready for cohort</p>
                      <div className="pipeline-col-cards">
                        {filteredData.filter(l => (l.status || '').toLowerCase() === 'qualified').map(renderLeadCard)}
                        {filteredData.filter(l => (l.status || '').toLowerCase() === 'qualified').length === 0 && (
                          <div className="pipeline-empty-column">No qualified candidates yet</div>
                        )}
                      </div>
                    </div>

                    {/* 4. Closed Column */}
                    <div className="pipeline-column col-closed">
                      <div className="pipeline-col-header">
                        <div className="pipeline-col-title-wrap">
                          <span className="col-status-dot closed"></span>
                          <h4>Closed Inquiries</h4>
                        </div>
                        <span className="pipeline-col-count">
                          {filteredData.filter(l => (l.status || '').toLowerCase() === 'closed').length}
                        </span>
                      </div>
                      <p className="pipeline-col-sub">Enrolled candidates or archived inquiries</p>
                      <div className="pipeline-col-cards">
                        {filteredData.filter(l => (l.status || '').toLowerCase() === 'closed').map(renderLeadCard)}
                        {filteredData.filter(l => (l.status || '').toLowerCase() === 'closed').length === 0 && (
                          <div className="pipeline-empty-column">No closed inquiries</div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* FLAT GRID FORMAT */
                  <div className="leads-cards-grid">
                    {filteredData.map(renderLeadCard)}
                  </div>
                )
              )}

              {/* 2. BATCHES CARDS */}
              {page === 'batches' && (
                filteredData.length === 0 ? (
                  <div className="table-card">
                    <div className="empty-state-box">
                      <Calendar size={32} className="text-muted" />
                      <p>No batches or labs found matching your filters.</p>
                    </div>
                  </div>
                ) : (
                  <div className="batches-cards-grid">
                    {filteredData.map(b => (
                      <div key={b._id} className="batch-data-card">
                        <div className="batch-card-head">
                          <span className={b.type === 'AI & Robotics Lab' ? 'badge-lab' : 'badge-classroom'}>
                            {b.type === 'AI & Robotics Lab' ? <Cpu size={12} /> : <BookOpen size={12} />}
                            {b.type === 'AI & Robotics Lab' ? 'Robotics Lab' : 'Classroom'}
                          </span>
                          <button
                            type="button"
                            className={`status-pill clickable ${b.active !== false ? 'pill-closed' : 'pill-contacted'}`}
                            onClick={() => handleToggleBatchStatus(b)}
                            title="Click to toggle Active / Closed status for this batch"
                          >
                            {b.active !== false ? '● Active' : '○ Closed'}
                          </button>
                        </div>

                        <h4 className="batch-card-title">{b.title}</h4>
                        <p className="batch-card-sub">{b.locationDetail || (b.duration ? `${b.duration} • ${b.partner || ''}` : '')}</p>
                        {b.workstation && <div className="batch-card-workstation">Bay: {b.workstation}</div>}

                        <div className="batch-card-meta">
                          <div className="batch-meta-item">
                            <MapPin size={13} color="#059669" />
                            <span><b>{b.city}</b> {b.city && b.city.includes('Pune') && <span className="badge-pune">HINJAWADI</span>}</span>
                          </div>
                          <div className="batch-meta-item">
                            <Calendar size={13} color="#0284c7" />
                            <span><b>{b.date}</b> {b.month && <span className="badge-tag" style={{ marginLeft: 4 }}>{b.month}</span>}</span>
                          </div>
                          <div className="batch-meta-item">
                            <Clock size={13} color="#64748b" />
                            <span>{b.time}</span>
                          </div>
                        </div>

                        {/* Interactive Seats Progress & Stepper */}
                        <div className="batch-seats-control-box">
                          <div className="seats-info-row">
                            <span className="seats-count-text">
                              <strong>{b.seatsLeft || 0}</strong> of <strong>{b.totalSeats || 25}</strong> seats available
                            </span>
                            <div className="quick-seat-stepper">
                              <button
                                type="button"
                                className="btn-seat-step minus"
                                onClick={() => handleQuickAdjustSeats(b, -1)}
                                title="Reserve 1 seat (seats - 1)"
                              >
                                -
                              </button>
                              <button
                                type="button"
                                className="btn-seat-step plus"
                                onClick={() => handleQuickAdjustSeats(b, 1)}
                                title="Add 1 seat (seats + 1)"
                              >
                                +
                              </button>
                            </div>
                          </div>
                          <div className="seats-progress-track">
                            <div
                              className={`seats-progress-bar ${Number(b.seatsLeft) <= 4 ? 'urgent' : ''}`}
                              style={{ width: `${Math.min(100, Math.max(5, (((b.totalSeats || 25) - (b.seatsLeft || 0)) / (b.totalSeats || 25)) * 100))}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="batch-card-footer">
                          <div className="batch-fee-pills">
                            {b.fee && <span className="batch-offer-fee">{b.fee}</span>}
                            {b.originalFee && <span className="batch-orig-fee">{b.originalFee}</span>}
                          </div>
                          <div className="action-buttons-group">
                            <button className="icon-btn edit" onClick={() => openEditModal(b)} title="Edit Batch / Lab Schedule">
                              <Edit size={15} />
                            </button>
                            <button className="icon-btn delete" onClick={() => handleDelete(b._id)} title="Delete Batch / Lab Record">
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}

              {/* 3. COURSES CARDS */}
              {page === 'courses' && (
                filteredData.length === 0 ? (
                  <div className="table-card">
                    <div className="empty-state-box">
                      <BookOpen size={32} className="text-muted" />
                      <p>No courses found matching your search.</p>
                    </div>
                  </div>
                ) : (
                  <div className="courses-cards-grid">
                    {filteredData.map(c => (
                      <div key={c._id} className="course-data-card">
                        <div className="course-card-thumb-wrap">
                          <img src={c.image} alt={c.title} className="course-card-thumb" />
                          {c.badge && <span className="course-card-badge">{c.badge}</span>}
                          <span className="course-card-category-pill">{c.category}</span>
                        </div>

                        <div className="course-card-body">
                          <h4 className="course-card-title">{c.title}</h4>
                          <div className="course-card-duration-line">
                            <Clock size={12} color="#0284c7" />
                            <span><b>{c.duration || '6–8 Months'}</b> ({c.hours || '500 Hrs'})</span>
                          </div>

                          <div className="course-card-fees-box">
                            <div className="course-card-fee-nums">
                              <span className="course-card-orig-fee">{c.originalFee || '₹68,000'}</span>
                              <span className="course-card-offer-fee">{c.fee || '₹55,000'}</span>
                            </div>
                            <span className="badge-tag" style={{ background: '#dcfce7', color: '#15803d', fontWeight: 700 }}>
                              {c.saveAmount || 'Save ₹13,000'}
                            </span>
                          </div>

                          <div className="course-card-emi-box">
                            <span>EMI: <b>{c.emi || '₹4,583/mo'}</b></span>
                            <small style={{ color: '#64748b' }}>{(c.batches || []).length} batches</small>
                          </div>
                        </div>

                        <div className="course-card-footer">
                          <button className="btn-card-action edit" onClick={() => openEditModal(c)}>
                            <Edit size={14} /> Edit Course & Fees
                          </button>
                          <button className="icon-btn delete" onClick={() => handleDelete(c._id)} title="Delete Course">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}

              {/* 4. TESTIMONIALS CARDS */}
              {page === 'testimonials' && (
                filteredData.length === 0 ? (
                  <div className="table-card">
                    <div className="empty-state-box">
                      <MessageSquareText size={32} className="text-muted" />
                      <p>No testimonials found.</p>
                    </div>
                  </div>
                ) : (
                  <div className="testimonials-cards-grid">
                    {filteredData.map(t => (
                      <div key={t._id} className="testimonial-data-card">
                        <div className="test-card-head">
                          <img src={t.image} alt={t.name} className="table-avatar" style={{ width: 44, height: 44 }} />
                          <div>
                            <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>{t.name}</h4>
                            <span style={{ fontSize: 12, color: '#64748b' }}>{t.role}, {t.company}</span>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 6, margin: '10px 0' }}>
                          <span className="badge-placed">{t.placedAt}</span>
                          <span className="badge-hike">{t.hike}</span>
                        </div>
                        <p style={{ fontSize: 13, color: '#475569', fontStyle: 'italic', margin: '8px 0', lineHeight: 1.5 }}>"{t.text}"</p>
                        <div className="lead-card-footer" style={{ marginTop: 10, paddingTop: 10 }}>
                          <div style={{ fontSize: 11, color: '#94a3b8' }}>{(t.tags || []).join(' • ')}</div>
                          <div className="action-buttons-group">
                            <button className="icon-btn edit" onClick={() => openEditModal(t)}><Edit size={14} /></button>
                            <button className="icon-btn delete" onClick={() => handleDelete(t._id)}><Trash2 size={14} /></button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}

              {/* 5. REPORTS CARDS */}
              {page === 'reports' && (
                filteredData.length === 0 ? (
                  <div className="table-card">
                    <div className="empty-state-box">
                      <FileText size={32} className="text-muted" />
                      <p>No reports found.</p>
                    </div>
                  </div>
                ) : (
                  <div className="reports-cards-grid">
                    {filteredData.map(r => (
                      <div key={r._id} className="report-data-card">
                        <img src={r.image} alt={r.title} className="report-card-thumb" />
                        <div className="report-card-body">
                          <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>{r.title}</h4>
                          <span style={{ fontSize: 12, color: '#64748b' }}>{r.pages || '40 Pages'} • {r.downloads || '10,000+'} downloads</span>
                          <div className="lead-card-footer" style={{ marginTop: 8, paddingTop: 10 }}>
                            <small style={{ color: '#94a3b8' }}>{new Date(r.createdAt).toLocaleDateString()}</small>
                            <div className="action-buttons-group">
                              <button className="icon-btn edit" onClick={() => openEditModal(r)}><Edit size={14} /></button>
                              <button className="icon-btn delete" onClick={() => handleDelete(r._id)}><Trash2 size={14} /></button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}

              {/* 6. FAQS CARDS */}
              {page === 'faqs' && (
                filteredData.length === 0 ? (
                  <div className="table-card">
                    <div className="empty-state-box">
                      <HelpCircle size={32} className="text-muted" />
                      <p>No FAQs found.</p>
                    </div>
                  </div>
                ) : (
                  <div className="faqs-cards-grid">
                    {filteredData.map(f => (
                      <div key={f._id} className="faq-data-card">
                        <div className="faq-card-head">
                          <span className="faq-order-badge">Question #{f.order || 1}</span>
                          <div className="action-buttons-group">
                            <button className="icon-btn edit" onClick={() => openEditModal(f)}><Edit size={14} /></button>
                            <button className="icon-btn delete" onClick={() => handleDelete(f._id)}><Trash2 size={14} /></button>
                          </div>
                        </div>
                        <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#0f172a' }}>{f.question}</h4>
                        <p style={{ margin: 0, fontSize: 13, color: '#475569', lineHeight: 1.6 }}>{f.answer}</p>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          )}
          </div>
        )}
      </main>

      {/* ================= MODALS: ADD / EDIT ITEMS ================= */}
      {activeModal && (
        <div className="admin-modal-overlay" onClick={() => setActiveModal(null)}>
          <div className="admin-modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{activeModal.replace('-', ' ').toUpperCase()}</h2>
              <button className="btn-close" onClick={() => setActiveModal(null)}>
                <X size={18} />
              </button>
            </div>

            {/* ================= OFFICIAL CANDIDATE ADMISSION PASS & DOSSIER ================= */}
            {activeModal === 'lead-details' && editingItem && (() => {
              const courseInfo = formatCourseTitle(editingItem.course);
              const slotInfo = formatSlotTimings(editingItem.preferredSlot, editingItem.date, editingItem.time);
              const effectivePassId = editingItem.passId || `PASS-PUNE-JAN-${editingItem._id ? editingItem._id.slice(-6).toUpperCase() : '846262'}`;

              return (
                <div className="lead-dossier-pass-container">
                  {/* Top Action Toolbar (Hidden during print) */}
                  <div className="pass-toolbar-actions pass-no-print">
                    <div className="pass-toolbar-left">
                      <span className="pass-badge-glow">
                        <Sparkles size={14} className="text-mint" /> Official Candidate Admission Pass
                      </span>
                      <span className="pass-id-chip" title="Click to copy Pass Code" onClick={() => {
                        navigator.clipboard?.writeText(effectivePassId);
                        showToast(`Copied ${effectivePassId} to clipboard!`);
                      }}>
                        <Ticket size={13} /> {effectivePassId}
                      </span>
                    </div>

                    <div className="pass-toolbar-right">
                      <button
                        type="button"
                        className="btn-pass-action print"
                        onClick={() => window.print()}
                        title="Print official physical pass or Save as PDF"
                      >
                        <Printer size={15} />
                        <span>Print / Save PDF</span>
                      </button>
                      <button
                        type="button"
                        className="btn-pass-action copy"
                        onClick={() => {
                          const passText = `🎫 NEXA AI LAB OFFICIAL ADMISSION PASS\nCandidate: ${editingItem.name}\nPass ID: ${effectivePassId}\nProgram: ${courseInfo.main}\nSlot: ${slotInfo.timePart}\nDate: ${slotInfo.datePart || '19th Jan 2027'}\nCampus: Pune Innovation Hub, Phase 1 Hinjawadi\nHelpline: +91 72188 02129`;
                          navigator.clipboard?.writeText(passText);
                          showToast('✓ Candidate Admission Pass copied to clipboard!');
                        }}
                        title="Copy full pass details to clipboard"
                      >
                        <Copy size={15} />
                        <span>Copy Pass</span>
                      </button>
                      <a
                        href={`https://wa.me/${(editingItem.code || '91').replace('+', '')}${String(editingItem.mobile).replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${editingItem.name}! Here is your confirmed Admission Pass for NexaAI Lab Pune:\n🎫 Pass ID: ${effectivePassId}\nProgram: ${courseInfo.main}\nSlot: ${slotInfo.timePart} (${slotInfo.datePart || 'Starts 19th Jan 2027'})\nCampus: Pune Phase 1 Hinjawadi Innovation Hub.\nPlease present this pass on your reporting date.`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-pass-action whatsapp"
                        title="Send pass directly via WhatsApp"
                      >
                        <Share2 size={15} />
                        <span>WhatsApp Pass</span>
                      </a>
                    </div>
                  </div>

                  {/* The Official Admission & Entry Pass (Printable Card) */}
                  <div className="official-admission-pass-card admission-pass-printable">
                    {/* Official NexaAI Lab Security Watermark Overlay */}
                    <div className="pass-watermark-overlay" aria-hidden="true">
                      <div className="pass-watermark-text">NEXA AI LAB • VERIFIED OFFICIAL ADMISSION PASS</div>
                    </div>

                    {/* Holographic Header Band */}
                    <div className="pass-header-band">
                      <div className="pass-brand-flex">
                        <div className="pass-logo-mark">
                          <span className="logo-main">NEXA<span className="logo-ai">AI</span> LAB</span>
                          <span className="logo-sub">PUNE INNOVATION HUB • PHASE 1 HINJAWADI</span>
                        </div>
                        <span className="pass-accredited-tag">
                          <ShieldCheck size={13} /> NASSCOM & EDTECH ACCREDITED
                        </span>
                      </div>

                      <div className="pass-title-row">
                        <div>
                          <h3 className="pass-doc-title">OFFICIAL ADMISSION & DIGITAL ENTRY PASS</h3>
                          <span className="pass-doc-sub">Classroom Bootcamp & Physical Lab Seat Reservation</span>
                        </div>
                        <div className="pass-status-seal confirmed">
                          <CheckCircle2 size={15} />
                          <span>CONFIRMED CLASSROOM SEAT</span>
                        </div>
                      </div>
                    </div>

                    {/* Pass Content Grid */}
                    <div className="pass-grid-body">
                      {/* Left Column: Candidate ID, Photo & Barcode/QR */}
                      <div className="pass-candidate-col">
                        <div className="pass-avatar-wrap">
                          <div
                            className="pass-avatar-circle"
                            style={{ background: getAvatarBg(editingItem.name) }}
                          >
                            {getInitials(editingItem.name)}
                          </div>
                          <div className="pass-verified-badge" title="Identity Verified">
                            <Check size={12} />
                          </div>
                        </div>

                        <h4 className="pass-candidate-name">{editingItem.name}</h4>
                        <span className="pass-candidate-id-sub">Candidate Token #{editingItem._id ? editingItem._id.slice(-6).toUpperCase() : '846262'}</span>

                        <div className="pass-contact-mini">
                          <div className="contact-mini-row">
                            <Phone size={12} className="text-mint shrink-0" />
                            <span>{editingItem.code || '+91'} {editingItem.mobile}</span>
                          </div>
                          {editingItem.email && (
                            <div className="contact-mini-row">
                              <Mail size={12} className="text-blue shrink-0" />
                              <span className="email-truncate">{editingItem.email}</span>
                            </div>
                          )}
                        </div>

                        <div className="pass-id-highlight-box">
                          <span className="pass-id-label">OFFICIAL PASS CODE</span>
                          <code className="pass-id-val">{effectivePassId}</code>
                        </div>

                        <div className="pass-qr-barcode-wrap">
                          <DigitalQrCode passId={effectivePassId} candidate={editingItem.name} />
                          <DigitalBarcode passId={effectivePassId} />
                        </div>
                      </div>

                      {/* Right Column: Program, Venue, Session Timings & Guidelines */}
                      <div className="pass-cohort-col">
                        <div className="pass-field-group">
                          <span className="pass-field-label">ENROLLED PROGRAM / SPECIALIZATION</span>
                          <div className="pass-program-name-wrap">
                            <BookOpen size={16} className="text-blue shrink-0" />
                            <strong className="pass-program-title">{courseInfo.main}</strong>
                          </div>
                          {courseInfo.sub && (
                            <span className="pass-cohort-badge">{courseInfo.sub}</span>
                          )}
                        </div>

                        <div className="pass-info-2col">
                          <div className="pass-info-cell">
                            <span className="pass-field-label">RESERVED SESSION TIMINGS</span>
                            <div className="pass-cell-val">
                              <Clock size={14} className="text-teal shrink-0" />
                              <strong>{slotInfo.timePart}</strong>
                            </div>
                          </div>

                          <div className="pass-info-cell">
                            <span className="pass-field-label">ORIENTATION / START DATE</span>
                            <div className="pass-cell-val">
                              <Calendar size={14} className="text-teal shrink-0" />
                              <strong>{slotInfo.datePart || '19th Jan 2027'}</strong>
                            </div>
                          </div>
                        </div>

                        <div className="pass-field-group">
                          <span className="pass-field-label">REPORTING CAMPUS & WORKSTATION</span>
                          <div className="pass-venue-box">
                            <MapPin size={16} className="text-emerald shrink-0" />
                            <div>
                              <strong>Pune Innovation Hub (Phase 1, Hinjawadi)</strong>
                              <p>Near Rajiv Gandhi Infotech Park, Hinjawadi Phase 1, Pune, MH 411057</p>
                              <span className="pass-station-tag">📍 Assigned: Desk Bay 01 • GPU / AI Station Access Ready</span>
                            </div>
                          </div>
                        </div>

                        <div className="pass-candidate-extra-grid">
                          <div className="extra-info-item">
                            <span className="extra-label">CANDIDATE BACKGROUND</span>
                            <strong className="extra-val">{editingItem.background || 'Technical / Engineering Graduate'}</strong>
                          </div>
                          <div className="extra-info-item">
                            <span className="extra-label">INQUIRY SOURCE</span>
                            <span className="extra-val">{editingItem.source || 'Website Classroom Pass'}</span>
                          </div>
                          <div className="extra-info-item">
                            <span className="extra-label">TARGET LOCATION</span>
                            <span className="extra-val">{editingItem.city || 'Pune (Hinjawadi)'}</span>
                          </div>
                          <div className="extra-info-item">
                            <span className="extra-label">ADMISSION STATUS</span>
                            <span className="extra-val status-tag">{editingItem.status || 'Confirmed'}</span>
                          </div>
                        </div>

                        {editingItem.notes && (
                          <div className="pass-counselor-notes-box">
                            <span className="extra-label">COUNSELOR / CANDIDATE NOTES</span>
                            <p className="counselor-notes-text">"{editingItem.notes}"</p>
                          </div>
                        )}

                        <div className="pass-guidelines-box">
                          <span className="guidelines-title">
                            <ShieldCheck size={13} className="text-blue" /> CANDIDATE REPORTING INSTRUCTIONS:
                          </span>
                          <ul>
                            <li>Please arrive 15 minutes prior to session start time with this digital pass or printed copy.</li>
                            <li>Carry one government-issued photo ID (Aadhaar / Driving License / Passport) for verification.</li>
                            <li>Dedicated workstation, high-speed compute sandbox, and course kits provided on arrival.</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Security Footer Band */}
                    <div className="pass-security-footer">
                      <div className="security-hash-col">
                        <span>SECURITY VERIFICATION: SHA-256</span>
                        <code>{editingItem._id ? `HASH:${editingItem._id.slice(-8)}-PUNE-AUTH-2027` : 'HASH:NXA-72188-AUTH-2027'}</code>
                      </div>
                      <div className="security-seal-col">
                        <span className="security-seal-icon">★</span>
                        <span>NexaAI Lab Admissions Verification Seal • Pune Center</span>
                      </div>
                      <div className="security-date-col">
                        <span>ISSUED: {new Date(editingItem.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Candidate CRM Operations & Counselor Notes Section (No-Print) */}
                  <div className="pass-crm-operations pass-no-print">
                    <div className="crm-status-changer-bar">
                      <div className="status-changer-label">
                        <label>Update Candidate Pipeline Status:</label>
                        <div className={`status-select-wrap status-${(editingItem.status || 'New').toLowerCase()}`}>
                          <span className="status-dot"></span>
                          <select
                            className={`select-status select-${(editingItem.status || 'New').toLowerCase()}`}
                            value={editingItem.status || 'New'}
                            onChange={async (e) => {
                              const nextStatus = e.target.value;
                              await handleUpdateLeadStatus(editingItem._id, nextStatus);
                              setEditingItem({ ...editingItem, status: nextStatus });
                            }}
                          >
                            <option value="New">New (Awaiting Call)</option>
                            <option value="Contacted">Contacted & Dialed</option>
                            <option value="Qualified">Qualified Candidate</option>
                            <option value="Closed">Closed & Enrolled</option>
                          </select>
                        </div>
                      </div>

                      <div className="quick-contact-actions">
                        <a href={`tel:${editingItem.mobile}`} className="btn-quick-call">
                          <Phone size={14} /> Call Candidate Now
                        </a>
                        {editingItem.email && (
                          <a href={`mailto:${editingItem.email}`} className="btn-quick-email">
                            <Mail size={14} /> Send Email
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Counselor Notes Field with Save */}
                    <div className="candidate-notes-editor">
                      <label>
                        <span>Admissions Counselor Remarks / Interaction Notes</span>
                        <small>Keep track of discussions, fee quotes, preferred batch dates, and qualification status</small>
                      </label>
                      <textarea
                        rows={3}
                        value={counselorNoteText}
                        onChange={e => setCounselorNoteText(e.target.value)}
                        placeholder="e.g. Candidate inquired about 2:00 PM batch in Hinjawadi. Background in Python. Scheduled campus visit for Friday."
                      />
                      <div className="notes-save-row">
                        <button
                          type="button"
                          className="btn-save-note"
                          onClick={async () => {
                            try {
                              await api(`/leads/${editingItem._id}`, {
                                method: 'PUT',
                                body: JSON.stringify({ notes: counselorNoteText })
                              });
                              showToast('✓ Counselor notes saved successfully!');
                              setEditingItem({ ...editingItem, notes: counselorNoteText });
                              loadData(false);
                            } catch (err) {
                              showToast('Failed to save notes', 'error');
                            }
                          }}
                        >
                          <Check size={14} /> Save Counselor Notes
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* ADD LEAD MODAL */}
            {activeModal === 'add-lead' && (
              <form onSubmit={handleSaveItem} className="modal-form-grid">
                <div>
                  <label>Candidate Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter candidate full name"
                  />
                </div>
                <div>
                  <label>Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    value={formData.mobile || ''}
                    onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                    placeholder="Enter 10-digit mobile number"
                  />
                </div>
                <div>
                  <label>Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email || ''}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="candidate@example.com"
                  />
                </div>
                <div>
                  <label>City / Campus Location</label>
                  <input
                    type="text"
                    value={formData.city || 'Pune (Hinjawadi)'}
                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g. Pune (Hinjawadi)"
                  />
                </div>
                <div className="field-full">
                  <label>Course / Program Inquired *</label>
                  <input
                    type="text"
                    required
                    value={formData.course || ''}
                    onChange={e => setFormData({ ...formData, course: e.target.value })}
                    placeholder="e.g. Data Analytics with AI Course - Classroom Bootcamp"
                  />
                </div>
                <div>
                  <label>Preferred Slot / Timings</label>
                  <select
                    value={formData.preferredSlot || '9:30 AM - 1:30 PM (4 Hours / Day • Mon to Fri)'}
                    onChange={e => setFormData({ ...formData, preferredSlot: e.target.value })}
                  >
                    <option value="9:30 AM - 1:30 PM (4 Hours / Day • Mon to Fri)">Morning: 9:30 AM - 1:30 PM (4 Hours / Day • Mon-Fri)</option>
                    <option value="2:00 PM - 6:00 PM (4 Hours / Day • Mon to Fri)">Afternoon: 2:00 PM - 6:00 PM (4 Hours / Day • Mon-Fri)</option>
                    <option value="Weekend Live (10:00 AM - 3:00 PM)">Weekend Live (10:00 AM - 3:00 PM)</option>
                  </select>
                </div>
                <div>
                  <label>Lead Source</label>
                  <select
                    value={formData.source || 'Admin Direct Entry'}
                    onChange={e => setFormData({ ...formData, source: e.target.value })}
                  >
                    <option value="Admin Direct Entry">Admin Direct Entry</option>
                    <option value="Walk-in Campus Inquiry">Walk-in Campus Inquiry</option>
                    <option value="Phone Call Inquiry">Phone Call Inquiry</option>
                    <option value="Website Booking">Website Booking</option>
                  </select>
                </div>
                <div className="field-full">
                  <label>Notes / Counselor Remarks</label>
                  <textarea
                    rows={2}
                    value={formData.notes || ''}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Candidate background, remarks, follow-up date..."
                  />
                </div>
                <div className="field-full">
                  <button type="submit" className="btn-modal-save">
                    Create & Save Inquired Lead
                  </button>
                </div>
              </form>
            )}

            {/* FORM FOR BATCHES & LABS */}
            {(activeModal === 'add-batch' || activeModal === 'edit-batch') && (
              <form onSubmit={handleSaveItem} className="modal-form-grid">
                <div className="field-full">
                  <label>Program or Lab Station Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.title || ''}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Data Analytics with AI Course - Classroom Bootcamp or NVIDIA Jetson AGX Orin Edge AI Lab"
                  />
                </div>

                <div>
                  <label>Schedule Type *</label>
                  <select
                    value={formData.type || 'Classroom Course'}
                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="Classroom Course">Classroom Course</option>
                    <option value="AI & Robotics Lab">AI & Robotics Lab</option>
                  </select>
                </div>

                <div>
                  <label>Campus Location *</label>
                  <select
                    value={formData.city || 'Pune (Hinjawadi)'}
                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                  >
                    <option value="Pune (Hinjawadi)">Pune (Hinjawadi)</option>
                    <option value="Bangalore">Bangalore</option>
                    <option value="Gurgaon">Gurgaon</option>
                    <option value="Noida">Noida</option>
                    <option value="Interactive Live Online">Interactive Live Online</option>
                  </select>
                </div>

                <div className="field-full">
                  <label>Facility / Campus Location Details</label>
                  <input
                    type="text"
                    value={formData.locationDetail || ''}
                    onChange={e => setFormData({ ...formData, locationDetail: e.target.value })}
                    placeholder="e.g., Pune Campus, Phase 1 Hinjawadi (Near Rajiv Gandhi Infotech Park)"
                  />
                  <div className="preset-pills-row">
                    <span style={{ fontSize: 11, color: '#64748b', alignSelf: 'center' }}>Quick Facility:</span>
                    <button type="button" className="preset-pill-btn pune" onClick={() => setFormData({
                      ...formData,
                      city: 'Pune (Hinjawadi)',
                      locationDetail: 'Pune Campus, Phase 1 Hinjawadi (Near Rajiv Gandhi Infotech Park)'
                    })}>
                      📍 Pune Hinjawadi Campus
                    </button>
                    <button type="button" className="preset-pill-btn pune" onClick={() => setFormData({
                      ...formData,
                      city: 'Pune (Hinjawadi)',
                      locationDetail: 'Pune Robotics Build Hub (Phase 1 Hinjawadi, Bay 01)'
                    })}>
                      🤖 Pune Hinjawadi Robotics Bay
                    </button>
                  </div>
                </div>

                <div>
                  <label>Cohort Mode *</label>
                  <select
                    value={formData.mode || 'Classroom Bootcamp Weekdays (Monday to Friday)'}
                    onChange={e => setFormData({ ...formData, mode: e.target.value })}
                  >
                    <option value="Classroom Bootcamp Weekdays (Monday to Friday)">Classroom Bootcamp Weekdays (Monday to Friday)</option>
                    <option value="Classroom Bootcamp Weekdays">Classroom Bootcamp Weekdays</option>
                    <option value="Weekend Live (Classroom)">Weekend Live (Classroom)</option>
                    <option value="Weekend Live">Weekend Live</option>
                    <option value="Hands-on Hardware Lab">Hands-on Hardware Lab</option>
                    <option value="Physical Lab Workshop">Physical Lab Workshop</option>
                    <option value="Evening Cohort">Evening Cohort</option>
                    <option value="24x7 Cloud Sandbox">24x7 Cloud Sandbox</option>
                  </select>
                </div>

                <div>
                  <label>Month</label>
                  <select
                    value={formData.month || 'January'}
                    onChange={e => setFormData({ ...formData, month: e.target.value })}
                  >
                    <option value="January">January</option>
                    <option value="February">February</option>
                    <option value="March">March</option>
                    <option value="September">September</option>
                    <option value="October">October</option>
                    <option value="November">November</option>
                  </select>
                </div>

                <div>
                  <label>Start Date *</label>
                  <input
                    type="text"
                    required
                    value={formData.date || ''}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                    placeholder="e.g., 12th Jan 2027"
                  />
                  <div className="preset-pills-row">
                    <span style={{ fontSize: 11, color: '#64748b', alignSelf: 'center' }}>Jan Presets:</span>
                    {['12th Jan 2027', '19th Jan 2027', '26th Jan 2027', '2nd Feb 2027'].map(d => (
                      <button
                        key={d}
                        type="button"
                        className="preset-pill-btn"
                        onClick={() => setFormData({ ...formData, date: d, month: 'January' })}
                      >
                        {d.replace(' 2027', '')}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label>Session Timings *</label>
                  <input
                    type="text"
                    required
                    value={formData.time || ''}
                    onChange={e => setFormData({ ...formData, time: e.target.value })}
                    placeholder="e.g., 9:30 AM - 1:30 PM (4 Hours / Day • Mon to Fri)"
                  />
                  <div className="preset-pills-row">
                    {['9:30 AM - 1:30 PM (4 Hours / Day • Mon to Fri)', '2:00 PM - 6:00 PM (4 Hours / Day • Mon to Fri)', '10:00 AM - 2:00 PM (4 Hours / Day)'].map(t => (
                      <button key={t} type="button" className="preset-pill-btn" onClick={() => setFormData({ ...formData, time: t })}>
                        {t.split('(')[0].trim()}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label>Seats Left</label>
                  <input
                    type="number"
                    value={formData.seatsLeft || 0}
                    onChange={e => setFormData({ ...formData, seatsLeft: Number(e.target.value) })}
                  />
                </div>

                <div>
                  <label>Total Seats</label>
                  <input
                    type="number"
                    value={formData.totalSeats || 25}
                    onChange={e => setFormData({ ...formData, totalSeats: Number(e.target.value) })}
                  />
                </div>

                <div>
                  <label>Partner / Accreditation</label>
                  <input
                    type="text"
                    value={formData.partner || ''}
                    onChange={e => setFormData({ ...formData, partner: e.target.value })}
                    placeholder="e.g., NASSCOM FutureSkills Prime & AI Industry Council"
                  />
                </div>

                {formData.type === 'AI & Robotics Lab' ? (
                  <div>
                    <label>Hardware Workstation / Bay</label>
                    <select
                      value={formData.workstation || 'NVIDIA Jetson AGX Orin Edge AI Station'}
                      onChange={e => setFormData({ ...formData, workstation: e.target.value })}
                    >
                      <option value="NVIDIA Jetson AGX Orin Edge AI Station">NVIDIA Jetson AGX Orin Edge AI Station</option>
                      <option value="Dobot 6-DOF Collaborative Robotic Cell">Dobot 6-DOF Collaborative Robotic Cell</option>
                      <option value="Unitree Quadruped & Legged Dynamics Testing Arena">Unitree & Legged Dynamics Testing Arena</option>
                      <option value="Autonomous Mobile AMR & ROS 2 SLAM Grid">Autonomous Mobile AMR & ROS 2 SLAM Grid</option>
                      <option value="Embodied AI Teleoperation & VLA Rig">Embodied AI Teleoperation & VLA Rig</option>
                      <option value="NVIDIA Isaac Sim & Isaac Lab Cloud Sandbox">NVIDIA Isaac Sim & Isaac Lab Cloud Sandbox</option>
                    </select>
                  </div>
                ) : (
                  <div>
                    <label>Duration / Track</label>
                    <input
                      type="text"
                      value={formData.duration || ''}
                      onChange={e => setFormData({ ...formData, duration: e.target.value })}
                      placeholder="e.g., 6–8 Months"
                    />
                  </div>
                )}

                <div>
                  <label>Batch Offer Fee</label>
                  <input
                    type="text"
                    value={formData.fee || ''}
                    onChange={e => setFormData({ ...formData, fee: e.target.value })}
                    placeholder="e.g., ₹55,000"
                  />
                </div>

                <div>
                  <label>Batch Actual Fee (M.R.P.)</label>
                  <input
                    type="text"
                    value={formData.originalFee || ''}
                    onChange={e => setFormData({ ...formData, originalFee: e.target.value })}
                    placeholder="e.g., ₹68,000"
                  />
                </div>

                <div className="field-full">
                  <div className="checkbox-row">
                    <input
                      type="checkbox"
                      id="batchActiveCheckbox"
                      checked={formData.active !== false}
                      onChange={e => setFormData({ ...formData, active: e.target.checked })}
                    />
                    <label htmlFor="batchActiveCheckbox">
                      Active Batch (Visible on public schedule & open for seat reservations)
                    </label>
                  </div>
                </div>

                <div className="field-full">
                  <button type="submit" className="btn-modal-save">
                    {activeModal === 'add-batch' ? 'Create Batch / Lab Schedule' : 'Update Batch / Lab Schedule'}
                  </button>
                </div>
              </form>
            )}

            {/* FORM FOR COURSES */}
            {(activeModal === 'add-course' || activeModal === 'edit-course') && (
              <form onSubmit={handleSaveItem} className="modal-form-grid">
                <div className="field-full">
                  <label>Course Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title || ''}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Data Analytics with AI Course"
                  />
                </div>

                <div>
                  <label>Category</label>
                  <select
                    value={formData.category || 'Data Science & Analytics'}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option>Data Science & Analytics</option>
                    <option>Artificial Intelligence</option>
                    <option>Business Analytics</option>
                    <option>Big Data & Cloud</option>
                    <option>Executive AI</option>
                  </select>
                </div>

                <div>
                  <label>Badge / Tag</label>
                  <input
                    type="text"
                    value={formData.badge || ''}
                    onChange={e => setFormData({ ...formData, badge: e.target.value })}
                    placeholder="e.g., Gen & Agentic AI, Flagship Program"
                  />
                </div>

                {/* PRICING, MONTHS & OFFER CUSTOMIZER SECTION */}
                <div className="pricing-customizer-section field-full">
                  <div className="pricing-customizer-header">
                    <h4>
                      <Percent size={16} /> Course Fees, Duration & Offer Customizer
                    </h4>
                    <button
                      type="button"
                      className="btn-auto-calc"
                      onClick={() => {
                        const feeNum = cleanFeeNumber(formData.fee, 55000);
                        const origNum = cleanFeeNumber(formData.originalFee, Math.round(feeNum * 1.25));
                        const diff = Math.max(0, origNum - feeNum);
                        const pct = origNum > 0 ? Math.round((diff / origNum) * 100) : 0;
                        setFormData({
                          ...formData,
                          fee: formatRupee(feeNum),
                          originalFee: formatRupee(origNum),
                          saveAmount: `Save ${formatRupee(diff)}${pct > 0 ? ` (${pct}% OFF)` : ''}`,
                          emi: `${formatRupee(Math.round(feeNum / 12))}/mo`
                        });
                        showToast('Calculated offer savings & EMI!');
                      }}
                    >
                      <Zap size={14} /> Auto-Calculate Savings & EMI
                    </button>
                  </div>

                  <div className="pricing-grid-3">
                    <div>
                      <label>Actual Amount (M.R.P.) *</label>
                      <input
                        type="text"
                        required
                        value={formData.originalFee || ''}
                        onChange={e => setFormData({ ...formData, originalFee: e.target.value })}
                        placeholder="e.g. ₹68,000"
                      />
                      <small style={{ fontSize: 11, color: '#64748b' }}>Original / Strikethrough Fee</small>
                    </div>

                    <div>
                      <label>Offer Amount (Final Fee) *</label>
                      <input
                        type="text"
                        required
                        value={formData.fee || ''}
                        onChange={e => setFormData({ ...formData, fee: e.target.value })}
                        placeholder="e.g. ₹55,000"
                      />
                      <small style={{ fontSize: 11, color: '#0284c7' }}>Payable Discounted Student Fee</small>
                    </div>

                    <div>
                      <label>Offer / Savings Badge Text</label>
                      <input
                        type="text"
                        value={formData.saveAmount || ''}
                        onChange={e => setFormData({ ...formData, saveAmount: e.target.value })}
                        placeholder="e.g. Save ₹13,000"
                      />
                      <small style={{ fontSize: 11, color: '#16a34a' }}>Appears on public pricing card</small>
                    </div>
                  </div>

                  <div className="pricing-grid-3">
                    <div>
                      <label>Course Duration (Months) *</label>
                      <input
                        type="text"
                        required
                        value={formData.duration || ''}
                        onChange={e => setFormData({ ...formData, duration: e.target.value })}
                        placeholder="e.g. 6–8 Months"
                      />
                      <div className="preset-pills-row" style={{ marginTop: 4 }}>
                        {['3 Months', '4 Months', '5 Months', '6 Months', '6–8 Months', '8–10 Months'].map(dur => (
                          <button
                            key={dur}
                            type="button"
                            className="preset-pill-btn"
                            onClick={() => setFormData({ ...formData, duration: dur })}
                          >
                            {dur}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label>Training Hours *</label>
                      <input
                        type="text"
                        required
                        value={formData.hours || ''}
                        onChange={e => setFormData({ ...formData, hours: e.target.value })}
                        placeholder="e.g. 594 Hrs"
                      />
                      <div className="preset-pills-row" style={{ marginTop: 4 }}>
                        {['120 Hours', '240 Hours', '360 Hours', '500 Hrs', '546 Hours', '594 Hrs'].map(hr => (
                          <button
                            key={hr}
                            type="button"
                            className="preset-pill-btn"
                            onClick={() => setFormData({ ...formData, hours: hr })}
                          >
                            {hr}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label>No-Cost EMI Tenures (Months)</label>
                      <input
                        type="text"
                        value={formData.emiTenures || '3, 6, 9, 12'}
                        onChange={e => setFormData({ ...formData, emiTenures: e.target.value })}
                        placeholder="e.g. 3, 6, 9, 12"
                      />
                      <small style={{ fontSize: 11, color: '#64748b' }}>Comma separated month tenures</small>
                    </div>
                  </div>

                  {/* LIVE PRICING PREVIEW CARD */}
                  {(() => {
                    const feeNum = cleanFeeNumber(formData.fee, 55000);
                    const origNum = cleanFeeNumber(formData.originalFee, Math.round(feeNum * 1.25));
                    const saved = Math.max(0, origNum - feeNum);
                    const pct = origNum > 0 ? Math.round((saved / origNum) * 100) : 0;
                    return (
                      <div className="live-fee-preview-card">
                        <div className="live-fee-preview-title">
                          <span>Live Public Card Preview</span>
                          <span style={{ fontSize: 11, color: '#0284c7' }}>✓ 0% Interest No-Cost EMI</span>
                        </div>
                        <div className="live-fee-preview-amounts">
                          <span className="live-fee-main">{formatRupee(feeNum)}</span>
                          {origNum > feeNum && <span className="live-fee-orig">{formatRupee(origNum)}</span>}
                          <span className="live-fee-save">
                            {formData.saveAmount || `Save ${formatRupee(saved)}`} {pct > 0 && !String(formData.saveAmount || '').includes('%') ? `(${pct}% OFF)` : ''}
                          </span>
                        </div>
                        <div className="live-fee-meta">
                          <span>📅 <b>{formData.duration || '6–8 Months'}</b> completion</span>
                          <span>⏱️ <b>{formData.hours || '594 Hrs'}</b> live training</span>
                        </div>
                        <div className="live-fee-emi-breakdown">
                          <div className="emi-preview-chip">
                            <span>3 Mo EMI</span>
                            <b>{formatRupee(Math.round(feeNum / 3))}/mo</b>
                          </div>
                          <div className="emi-preview-chip">
                            <span>6 Mo EMI</span>
                            <b>{formatRupee(Math.round(feeNum / 6))}/mo</b>
                          </div>
                          <div className="emi-preview-chip">
                            <span>9 Mo EMI</span>
                            <b>{formatRupee(Math.round(feeNum / 9))}/mo</b>
                          </div>
                          <div className="emi-preview-chip">
                            <span>12 Mo EMI</span>
                            <b>{formatRupee(Math.round(feeNum / 12))}/mo</b>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <div className="field-full">
                  <label>Course Image URL</label>
                  <input
                    type="url"
                    value={formData.image || ''}
                    onChange={e => setFormData({ ...formData, image: e.target.value })}
                  />
                </div>

                <div className="field-full">
                  <label>Course Overview & Description</label>
                  <textarea
                    rows={3}
                    value={formData.description || ''}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="field-full">
                  <button type="submit" className="btn-modal-save">
                    {activeModal === 'add-course' ? 'Create New Course' : 'Save Course & Fees Update'}
                  </button>
                </div>
              </form>
            )}

            {/* FORM FOR TESTIMONIALS */}
            {(activeModal === 'add-testimonial' || activeModal === 'edit-testimonial') && (
              <form onSubmit={handleSaveItem} className="modal-form-grid">
                <div>
                  <label>Learner Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div>
                  <label>Designation / Role</label>
                  <input
                    type="text"
                    value={formData.role || ''}
                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                  />
                </div>

                <div>
                  <label>Current Company</label>
                  <input
                    type="text"
                    value={formData.company || ''}
                    onChange={e => setFormData({ ...formData, company: e.target.value })}
                  />
                </div>

                <div>
                  <label>Placed At</label>
                  <input
                    type="text"
                    value={formData.placedAt || ''}
                    onChange={e => setFormData({ ...formData, placedAt: e.target.value })}
                  />
                </div>

                <div>
                  <label>Salary Hike</label>
                  <input
                    type="text"
                    value={formData.hike || ''}
                    onChange={e => setFormData({ ...formData, hike: e.target.value })}
                    placeholder="e.g., 130% hike"
                  />
                </div>

                <div>
                  <label>Photo URL</label>
                  <input
                    type="url"
                    value={formData.image || ''}
                    onChange={e => setFormData({ ...formData, image: e.target.value })}
                  />
                </div>

                <div className="field-full">
                  <label>Review Quote</label>
                  <textarea
                    rows={3}
                    required
                    value={formData.text || ''}
                    onChange={e => setFormData({ ...formData, text: e.target.value })}
                  />
                </div>

                <div className="field-full">
                  <button type="submit" className="btn-modal-save">
                    Save Testimonial
                  </button>
                </div>
              </form>
            )}

            {/* FORM FOR REPORTS */}
            {(activeModal === 'add-report' || activeModal === 'edit-report') && (
              <form onSubmit={handleSaveItem} className="modal-form-grid">
                <div className="field-full">
                  <label>Report Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title || ''}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div>
                  <label>Page Count</label>
                  <input
                    type="text"
                    value={formData.pages || ''}
                    onChange={e => setFormData({ ...formData, pages: e.target.value })}
                    placeholder="e.g., 48 Pages"
                  />
                </div>

                <div>
                  <label>Downloads</label>
                  <input
                    type="text"
                    value={formData.downloads || ''}
                    onChange={e => setFormData({ ...formData, downloads: e.target.value })}
                    placeholder="e.g., 14,200+"
                  />
                </div>

                <div className="field-full">
                  <label>Cover Image URL</label>
                  <input
                    type="url"
                    value={formData.image || ''}
                    onChange={e => setFormData({ ...formData, image: e.target.value })}
                  />
                </div>

                <div className="field-full">
                  <label>Summary</label>
                  <textarea
                    rows={3}
                    value={formData.summary || ''}
                    onChange={e => setFormData({ ...formData, summary: e.target.value })}
                  />
                </div>

                <div className="field-full">
                  <button type="submit" className="btn-modal-save">
                    Save Report
                  </button>
                </div>
              </form>
            )}

            {/* FORM FOR FAQS */}
            {(activeModal === 'add-faq' || activeModal === 'edit-faq') && (
              <form onSubmit={handleSaveItem} className="modal-form-grid">
                <div className="field-full">
                  <label>Question</label>
                  <input
                    type="text"
                    required
                    value={formData.question || ''}
                    onChange={e => setFormData({ ...formData, question: e.target.value })}
                  />
                </div>

                <div>
                  <label>Sort Order</label>
                  <input
                    type="number"
                    value={formData.order || 1}
                    onChange={e => setFormData({ ...formData, order: Number(e.target.value) })}
                  />
                </div>

                <div className="field-full">
                  <label>Answer</label>
                  <textarea
                    rows={4}
                    required
                    value={formData.answer || ''}
                    onChange={e => setFormData({ ...formData, answer: e.target.value })}
                  />
                </div>

                <div className="field-full">
                  <button type="submit" className="btn-modal-save">
                    Save FAQ
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
