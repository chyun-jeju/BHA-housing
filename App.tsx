import React, { useState, useEffect, useMemo } from 'react';
import { 
  User, UserRole, ServiceRequest, RequestCategory, RequestLocation, UrgencyLevel, RequestStatus, TimelineEvent, Comment 
} from './types';
import { MOCK_USERS, INITIAL_REQUESTS, generateId, getStats, generateUserCode } from './services/mockStore';
import { StatusBadge, UrgencyBadge, CategoryIcon, ImageUpload, Modal, CommentList, CommentInput } from './components/UIComponents';
import { analyzeRequestWithGemini } from './services/geminiService';
import { 
  Plus, Search, Filter, Home, ListTodo, BarChart3, User as UserIcon, LogOut, 
  MapPin, Send, Star, MoreVertical, Download, Sparkles, Check, Wrench, Users, Calendar, Mail,
  Armchair, Truck, ClipboardList, UserPlus, FileText, Trash2, XCircle, FileSpreadsheet, ArrowLeft, ExternalLink,
  Upload, X, Clock, Wind, ArrowRight, ShieldCheck
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';

// --- Sub-Components ---

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#D946EF', '#EF4444'];

// --- Authentication Views ---

const AuthScreen: React.FC<{ onLogin: (user: User) => void }> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [signupStep, setSignupStep] = useState<1 | 2>(1); // 1: Agreement, 2: Details

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // Added confirm password state
  const [name, setName] = useState('');
  const [contactNo, setContactNo] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.STAFF);
  const [agreed, setAgreed] = useState(false);
  
  const [error, setError] = useState('');
  const [pendingMsg, setPendingMsg] = useState('');

  // Clear form on mount/switch
  useEffect(() => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setName('');
    setContactNo('');
    setAgreed(false);
    setSignupStep(1);
    setError('');
    setPendingMsg('');
  }, [isLogin]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const user = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!user) {
      setError('Invalid email or password');
      return;
    }
    if (!user.isApproved) {
      setError('Administrator approval is pending. You can use it after approval.');
      return;
    }
    onLogin(user);
  };

  const handleNextStep = () => {
    if (!agreed) {
      setError('You must agree to the privacy policy to proceed.');
      return;
    }
    setError('');
    setSignupStep(2);
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Removed domain restriction check

    // Duplicate Email Check (Case Insensitive)
    const existing = MOCK_USERS.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (existing) {
      setError('This email is already registered.');
      return;
    }

    // Password Validation: 8+ chars, letters and numbers
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    if (password.length < 8 || !hasLetter || !hasNumber) {
        setError('Password must be at least 8 characters and contain both letters and numbers.');
        return;
    }

    if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
    }

    if (!name.trim()) {
        setError('Full Name is required.');
        return;
    }

    // Simulate API registration
    const newUser: User = {
      id: `u${MOCK_USERS.length + 1}`,
      userCode: generateUserCode(),
      name,
      email: email.trim(),
      contactNo,
      role,
      avatarUrl: `https://ui-avatars.com/api/?name=${name}`,
      isApproved: false, // Default to pending
      password: password,
      createdAt: new Date().toISOString()
    };
    
    MOCK_USERS.push(newUser);
    setPendingMsg('Registration successful! Please wait for admin approval to log in.');
    setIsLogin(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md border-t-4 border-green-800">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-green-900 mt-4">BHA Facility App</h1>
          <p className="text-sm text-gray-500">시설물 관리 접수앱</p>
        </div>

        {pendingMsg && <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded border border-green-200">{pendingMsg}</div>}
        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded border border-red-200">{error}</div>}

        {isLogin ? (
          /* --- LOGIN FORM --- */
          <form onSubmit={handleLogin} className="space-y-4" autoComplete="off">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ID (School Email)</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full border p-2 rounded focus:ring-2 focus:ring-green-500 outline-none" required autoComplete="off" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full border p-2 rounded focus:ring-2 focus:ring-green-500 outline-none" required autoComplete="new-password" />
            </div>

            <button type="submit" className="w-full bg-green-800 text-white py-2 rounded hover:bg-green-900 transition-colors font-medium shadow-sm">
              Log In
            </button>
          </form>
        ) : (
          /* --- SIGN UP FLOW --- */
          <>
            {signupStep === 1 ? (
              /* Step 1: Privacy Agreement */
              <div className="space-y-4">
                 <div className="text-center mb-2">
                    <ShieldCheck className="w-10 h-10 text-green-700 mx-auto mb-2" />
                    <h3 className="text-lg font-bold text-gray-800">Privacy Agreement</h3>
                    <p className="text-xs text-gray-500">Please review and agree to the terms below.</p>
                 </div>
                 
                 <div className="h-48 overflow-y-auto border border-gray-200 rounded p-3 text-xs text-gray-600 bg-gray-50 leading-relaxed">
                    <p className="font-bold mb-1">[Personal Information Collection and Usage Agreement]</p>
                    <p className="mb-2">To provide BHA Facility services, we collect user information as follows. Please read carefully and decide whether to agree.</p>
                    <ul className="list-disc pl-4 space-y-1 mb-2">
                        <li><strong>Purpose:</strong> User identification, facility request management, and notifications.</li>
                        <li><strong>Items Collected:</strong> Name, School Email, Contact No., Department, Role, Profile Image.</li>
                        <li><strong>Retention:</strong> Information is retained while the account is active and deleted upon withdrawal.</li>
                    </ul>
                    <p className="text-gray-400 italic">You have the right to refuse agreement, but service use will be restricted.</p>
                </div>

                <div className="flex items-start gap-2 bg-green-50 p-3 rounded border border-green-100">
                    <input 
                        type="checkbox" 
                        id="privacy-check" 
                        checked={agreed} 
                        onChange={e => setAgreed(e.target.checked)} 
                        className="w-5 h-5 text-green-700 rounded mt-0.5 accent-green-800" 
                    />
                    <label htmlFor="privacy-check" className="text-sm text-gray-800 font-medium leading-tight">
                        (Required) I agree to the collection and use of personal information.
                    </label>
                </div>

                <button 
                  onClick={handleNextStep}
                  disabled={!agreed}
                  className="w-full bg-green-800 text-white py-2.5 rounded hover:bg-green-900 transition-colors font-medium flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed shadow-sm"
                >
                  Next <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              /* Step 2: User Details */
              <form onSubmit={handleSignup} className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="text-center mb-2">
                    <h3 className="text-lg font-bold text-gray-800">Sign Up Details</h3>
                    <p className="text-xs text-gray-500">Enter your information.</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1"><span className="text-red-500">*</span> Full Name</label>
                    <input 
                      type="text" 
                      value={name} 
                      onChange={e => setName(e.target.value)} 
                      className="w-full border p-2 rounded focus:ring-2 focus:ring-green-500 outline-none text-sm" 
                      required 
                      autoComplete="off" 
                      placeholder="e.g. Ji-Min Kim"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1"><span className="text-red-500">*</span> ID (Email)</label>
                    <input 
                      type="email" 
                      value={email} 
                      onChange={e => setEmail(e.target.value)} 
                      className="w-full border p-2 rounded focus:ring-2 focus:ring-green-500 outline-none text-sm" 
                      required 
                      autoComplete="off" 
                      placeholder="name@example.com"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1"><span className="text-red-500">*</span> Password (8자리이상 숫자+영문)</label>
                    <input 
                      type="password" 
                      value={password} 
                      onChange={e => setPassword(e.target.value)} 
                      className="w-full border p-2 rounded focus:ring-2 focus:ring-green-500 outline-none text-sm" 
                      required 
                      minLength={8}
                      autoComplete="new-password" 
                      placeholder="********"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1"><span className="text-red-500">*</span> Confirm Password</label>
                    <input 
                      type="password" 
                      value={confirmPassword} 
                      onChange={e => setConfirmPassword(e.target.value)} 
                      className="w-full border p-2 rounded focus:ring-2 focus:ring-green-500 outline-none text-sm" 
                      required 
                      autoComplete="new-password" 
                      placeholder="Repeat Password"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1"><span className="text-red-500">*</span> Contact No.</label>
                    <input 
                      type="tel" 
                      value={contactNo} 
                      onChange={e => setContactNo(e.target.value)} 
                      className="w-full border p-2 rounded focus:ring-2 focus:ring-green-500 outline-none text-sm" 
                      required 
                      autoComplete="tel" 
                      placeholder="010-1234-5678"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <select value={role} onChange={e => setRole(e.target.value as UserRole)} className="w-full border p-2 rounded focus:ring-2 focus:ring-green-500 outline-none text-sm">
                        <option value={UserRole.STAFF}>School Staff (교직원)</option>
                        <option value={UserRole.WORKER}>Maintenance Worker (C&S 직원)</option>
                    </select>
                </div>

                <div className="flex gap-2 pt-2">
                    <button 
                      type="button" 
                      onClick={() => setSignupStep(1)}
                      className="w-1/3 bg-gray-200 text-gray-700 py-2 rounded hover:bg-gray-300 transition-colors font-medium text-sm"
                    >
                      Back
                    </button>
                    <button 
                      type="submit" 
                      className="w-2/3 bg-green-800 text-white py-2 rounded hover:bg-green-900 transition-colors font-medium text-sm shadow-sm"
                    >
                      Sign Up
                    </button>
                </div>
              </form>
            )}
          </>
        )}

        <div className="mt-4 text-center text-sm text-gray-600">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => { setIsLogin(!isLogin); setError(''); setPendingMsg(''); setSignupStep(1); }} className="text-green-700 font-medium hover:underline">
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </div>
        
        {isLogin && (
          <div className="mt-8 pt-4 border-t text-xs text-gray-400 text-center space-y-1">
             <p>Admin: chihoyun@branksome.asia / 12345678</p>
             <p>Staff: chihoyun2@branksome.asia / 12345678</p>
             <p>Worker: chihoyun3@branksome.asia / 12345678</p>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Admin User Management ---

const UserRow: React.FC<{
    user: User;
    isSelected: boolean;
    onToggle: () => void;
    onUpdateUser: (id: string, updates: Partial<User>) => void;
}> = ({ user, isSelected, onToggle, onUpdateUser }) => {
    const [role, setRole] = useState(user.role);
    
    // Reset local state if user prop changes
    useEffect(() => {
        setRole(user.role);
    }, [user.role]);

    const hasChange = role !== user.role;

    return (
        <tr className="hover:bg-gray-50">
            <td className="p-3 text-center">
                <input type="checkbox" checked={isSelected} onChange={onToggle} />
            </td>
            <td className="p-3 text-xs text-gray-500 font-mono">{user.userCode || '-'}</td>
            <td className="p-3">
                <div className="flex items-center gap-2">
                    <img src={user.avatarUrl} className="w-8 h-8 rounded-full border" alt="Avatar" />
                    <div>
                        <p className="font-semibold text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                        {user.contactNo && <p className="text-[10px] text-gray-400">{user.contactNo}</p>}
                    </div>
                </div>
            </td>
            <td className="p-3">
                <div className="flex items-center gap-2">
                    <select 
                        value={role}
                        onChange={(e) => setRole(e.target.value as UserRole)}
                        className={`text-xs border rounded p-1 transition-colors ${hasChange ? 'bg-yellow-50 border-yellow-400 text-yellow-900 ring-2 ring-yellow-200' : ''}`}
                    >
                        <option value={UserRole.STAFF}>STAFF</option>
                        <option value={UserRole.WORKER}>WORKER</option>
                        <option value={UserRole.ADMIN}>ADMIN</option>
                    </select>
                    {hasChange && (
                        <div className="flex items-center gap-1 animate-in fade-in zoom-in duration-200">
                            <button 
                                onClick={() => onUpdateUser(user.id, { role })}
                                className="bg-green-600 text-white p-1 rounded hover:bg-green-700 shadow-sm transition-colors"
                                title="Confirm Role Change"
                            >
                                <Check className="w-3 h-3" />
                            </button>
                            <button 
                                onClick={() => setRole(user.role)}
                                className="bg-gray-300 text-gray-700 p-1 rounded hover:bg-gray-400 shadow-sm transition-colors"
                                title="Cancel"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    )}
                </div>
            </td>
            <td className="p-3 text-xs text-gray-500">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
            </td>
            <td className="p-3 text-right">
                {!user.isApproved ? (
                    <button onClick={() => onUpdateUser(user.id, { isApproved: true })} className="text-green-600 text-xs font-bold hover:underline">Approve</button>
                ) : (
                    <span className="text-green-600 text-xs flex items-center justify-end gap-1"><Check className="w-3 h-3"/> Active</span>
                )}
            </td>
        </tr>
    );
};

const AdminUserView: React.FC<{ 
    users: User[], 
    onUpdateUser: (id: string, updates: Partial<User>) => void,
    onDeleteUsers: (ids: string[]) => void,
    onBulkImport: (csvData: string) => void
}> = ({ users, onUpdateUser, onDeleteUsers, onBulkImport }) => {
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING'>('ALL');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showImportModal, setShowImportModal] = useState(false);
  const [csvText, setCsvText] = useState('');
  
  // Filters
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filteredUsers = useMemo(() => {
    let list = users;
    if (activeTab === 'PENDING') {
        list = list.filter(u => !u.isApproved);
    }
    if (search) {
        list = list.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.includes(search.toLowerCase()));
    }
    if (startDate) {
        list = list.filter(u => u.createdAt && new Date(u.createdAt) >= new Date(startDate));
    }
    if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        list = list.filter(u => u.createdAt && new Date(u.createdAt) <= end);
    }
    return list;
  }, [users, activeTab, search, startDate, endDate]);

  const toggleSelect = (id: string) => {
      const newSet = new Set(selectedIds);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      setSelectedIds(newSet);
  };

  const handleBulkDelete = () => {
      if (confirm(`Are you sure you want to delete ${selectedIds.size} users?`)) {
          onDeleteUsers(Array.from(selectedIds));
          setSelectedIds(new Set());
      }
  };

  const handleImportSubmit = () => {
      if (!csvText.trim()) return;
      onBulkImport(csvText);
      setCsvText('');
      setShowImportModal(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm min-h-[500px] flex flex-col">
      <div className="p-4 border-b flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            User Management
        </h2>
        <div className="flex gap-2">
            <button 
                onClick={() => setShowImportModal(true)}
                className="bg-green-600 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-green-700 flex items-center"
            >
                <Upload className="w-3 h-3 mr-1" /> Bulk Import
            </button>
            {selectedIds.size > 0 && (
                <button 
                    onClick={handleBulkDelete}
                    className="bg-red-600 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-red-700 flex items-center"
                >
                    <Trash2 className="w-3 h-3 mr-1" /> Delete ({selectedIds.size})
                </button>
            )}
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 bg-gray-50 border-b grid grid-cols-1 md:grid-cols-4 gap-4">
         <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input 
                type="text" 
                placeholder="Search name or email..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border rounded outline-none focus:ring-1 focus:ring-blue-500"
            />
         </div>
         <div className="flex items-center gap-2 col-span-2">
            <span className="text-xs text-gray-500">Reg. Date:</span>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="border p-1.5 rounded text-xs" />
            <span>-</span>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="border p-1.5 rounded text-xs" />
         </div>
      </div>

      <div className="flex bg-gray-100 p-1 border-b">
         <button onClick={() => setActiveTab('ALL')} className={`flex-1 py-2 text-xs font-bold ${activeTab === 'ALL' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}>All Users</button>
         <button onClick={() => setActiveTab('PENDING')} className={`flex-1 py-2 text-xs font-bold ${activeTab === 'PENDING' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}>Pending Approval</button>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 font-medium">
                <tr>
                    <th className="p-3 w-10 text-center"><input type="checkbox" onChange={(e) => {
                        if (e.target.checked) setSelectedIds(new Set(filteredUsers.map(u => u.id)));
                        else setSelectedIds(new Set());
                    }} checked={filteredUsers.length > 0 && selectedIds.size === filteredUsers.length} /></th>
                    <th className="p-3">User Code</th>
                    <th className="p-3">User</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Registered</th>
                    <th className="p-3 text-right">Action</th>
                </tr>
            </thead>
            <tbody className="divide-y">
                {filteredUsers.map(u => (
                    <UserRow 
                        key={u.id}
                        user={u}
                        isSelected={selectedIds.has(u.id)}
                        onToggle={() => toggleSelect(u.id)}
                        onUpdateUser={onUpdateUser}
                    />
                ))}
            </tbody>
        </table>
        {filteredUsers.length === 0 && <div className="text-center py-10 text-gray-400">No users found.</div>}
      </div>

      <Modal isOpen={showImportModal} onClose={() => setShowImportModal(false)} title="Bulk Import Users">
         <div className="space-y-4">
            <p className="text-xs text-gray-500">
                Paste CSV data below. Format: <code>Email, Name, Role (STAFF/WORKER/ADMIN)</code><br/>
                Existing emails will be updated (overwritten).
            </p>
            <textarea 
                className="w-full h-40 border rounded p-2 text-xs font-mono"
                placeholder={`john@branksome.asia, John Doe, STAFF\njane@branksome.asia, Jane Smith, WORKER`}
                value={csvText}
                onChange={e => setCsvText(e.target.value)}
            />
            <button onClick={handleImportSubmit} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Import</button>
         </div>
      </Modal>
    </div>
  );
};

// --- Home Menu Dashboard ---

const HomeMenu: React.FC<{ 
    role: UserRole;
    onNavigate: (view: 'LIST' | 'CREATE' | 'CREATE_EVENT' | 'SURVEY' | 'SHEET', url?: string, title?: string) => void 
}> = ({ role, onNavigate }) => {
    
    // Define all possible items
    const allItems = [
        { 
            id: 'facility',
            label: role === UserRole.WORKER ? '업무 대기열 (Work Queue)' : '시설관리 (Facility)', 
            subLabel: role === UserRole.WORKER ? '작업 현황 관리' : '수리/보수 요청',
            icon: <Wrench className="w-8 h-8 text-blue-600" />, 
            action: () => onNavigate('LIST'),
            color: 'bg-blue-50 border-blue-200 hover:bg-blue-100'
        },
        { 
            id: 'new_req_worker',
            label: '새 요청 작성 (New Request)',
            subLabel: '작업 요청 등록',
            icon: <Plus className="w-8 h-8 text-indigo-600" />,
            action: () => onNavigate('CREATE'),
            color: 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100',
            visible: role === UserRole.WORKER // Only explicitly show this tile for workers as per request
        },
        { 
            id: 'event',
            label: 'Easy Stuff Moving', 
            subLabel: '가구이동 포함',
            icon: <Truck className="w-8 h-8 text-orange-600" />, 
            action: () => onNavigate('CREATE_EVENT'),
            color: 'bg-orange-50 border-orange-200 hover:bg-orange-100',
            visible: role !== UserRole.WORKER // Hidden for Workers
        },
        { 
            id: 'vehicle',
            label: '차량등록 (Vehicle Reg)', 
            subLabel: '정기 주차 등록',
            icon: <Truck className="w-8 h-8 text-green-600" />, 
            action: () => window.open('https://docs.google.com/forms/d/e/1FAIpQLSfu_of_e7xGwLB-ekWd1LGXskKHyVT1bAHcz5HQ0AYpyjrLHw/viewform?usp=header', '_blank'),
            color: 'bg-green-50 border-green-200 hover:bg-green-100'
        },
        { 
            id: 'visitor',
            label: '방문자등록 (Visitor)', 
            subLabel: '외부인 출입 신청',
            icon: <UserPlus className="w-8 h-8 text-purple-600" />, 
            action: () => window.open('https://docs.google.com/forms/d/e/1FAIpQLSfRdZSHZbHsVfpyGfNt8kRPPzx3EOHNTKb2zZWVvxz29fomyQ/viewform?usp=header', '_blank'),
            color: 'bg-purple-50 border-purple-200 hover:bg-purple-100'
        },
        { 
            id: 'air_guard',
            label: '실내공기 (School Air Guard)', 
            subLabel: '실시간 공기질 모니터링',
            icon: <Wind className="w-8 h-8 text-cyan-600" />, 
            action: () => window.open('https://script.google.com/a/macros/branksome.asia/s/AKfycbzUGCXU_7btzR4OBfHDidlpCLNwfDdYuyoi1xrSl5HBVVGrqr8kCiQ9G6DVYoGH-z26lQ/exec', '_blank'),
            color: 'bg-cyan-50 border-cyan-200 hover:bg-cyan-100'
        },
        { 
            id: 'vehicle_list',
            label: '차량리스트 (Vehicle List)', 
            subLabel: '등록 현황 조회',
            icon: <FileSpreadsheet className="w-8 h-8 text-emerald-600" />, 
            action: () => onNavigate('SHEET', 'https://docs.google.com/spreadsheets/d/1_e_R_ktiFYwAX5JC8K5fsLodq0HXtVP983szD0YSroI?resourcekey=&usp=forms_web_b&urp=linked#gid=815184580', 'Vehicle List'),
            color: 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100',
            visible: role === UserRole.ADMIN || role === UserRole.WORKER
        },
        { 
            id: 'visitor_list',
            label: '방문자리스트 (Visitor List)', 
            subLabel: '출입 현황 조회',
            icon: <FileSpreadsheet className="w-8 h-8 text-teal-600" />, 
            action: () => onNavigate('SHEET', 'https://docs.google.com/spreadsheets/d/18qKJozKcrvQ6EGeE9YI7vryn3-IStxdhafinOVog5Cc/edit?resourcekey=&gid=311494802#gid=311494802', 'Visitor List'),
            color: 'bg-teal-50 border-teal-200 hover:bg-teal-100',
            visible: role === UserRole.ADMIN || role === UserRole.WORKER
        },
        { 
            id: 'survey',
            label: '설문지 (Survey)', 
            subLabel: '만족도 조사',
            icon: <ClipboardList className="w-8 h-8 text-slate-600" />, 
            action: () => onNavigate('SURVEY'),
            color: 'bg-slate-50 border-slate-200 hover:bg-slate-100'
        },
    ];

    const visibleItems = allItems.filter(item => item.visible !== false);

    return (
        <div className="py-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">Main Menu</h2>
            <div className="grid grid-cols-2 gap-4">
                {visibleItems.map((item) => (
                    <button 
                        key={item.id}
                        onClick={item.action}
                        className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all active:scale-95 shadow-sm h-40 ${item.color}`}
                    >
                        <div className="mb-3 p-3 bg-white rounded-full shadow-sm">
                            {item.icon}
                        </div>
                        <span className="text-sm font-bold text-gray-700 text-center">{item.label}</span>
                        <span className="text-[10px] text-gray-500 mt-1">{item.subLabel}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}

// --- Survey View ---

const SurveyView: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 animate-fade-in">
    <div className="bg-gray-100 p-10 rounded-3xl mb-8 shadow-inner">
      <ClipboardList className="w-20 h-20 text-gray-400 mb-6 mx-auto" />
      <h2 className="text-3xl font-bold text-gray-500 mb-2">Survey Module</h2>
      <p className="text-xl text-gray-400 font-medium">Coming soon...</p>
    </div>
    <button 
      onClick={onBack} 
      className="text-blue-600 font-semibold hover:text-blue-800 hover:underline flex items-center gap-2 transition-colors"
    >
      <Home className="w-4 h-4" />
      Back to Home
    </button>
  </div>
);

// --- Sheet Viewer ---

const SheetViewer: React.FC<{ url: string; title: string; onBack: () => void }> = ({ url, title, onBack }) => {
    return (
      <div className="flex flex-col h-[calc(100vh-80px)]">
         <div className="flex justify-between items-center mb-4 px-1">
            <button onClick={onBack} className="text-gray-500 flex items-center hover:text-gray-900 transition-colors">
              <ArrowLeft className="w-5 h-5 mr-1" /> Back
            </button>
            <h2 className="font-bold text-gray-800">{title}</h2>
            <a 
                href={url} 
                target="_blank" 
                rel="noreferrer" 
                className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center hover:bg-blue-100 transition-colors"
            >
               Open in New Tab <ExternalLink className="w-3 h-3 ml-1" />
            </a>
         </div>
         <div className="flex-1 bg-white rounded-xl shadow-sm border overflow-hidden relative">
            <iframe
              src={url}
              className="w-full h-full border-0"
              title={title}
              allowFullScreen
            />
         </div>
      </div>
    );
};


// --- Dashboard & Requests ---

const RequestCard: React.FC<{ 
  request: ServiceRequest; 
  onClick: () => void; 
}> = ({ request, onClick }) => {
  const isHighUrgency = request.urgency === UrgencyLevel.HIGH;
  const isCancelled = request.status === RequestStatus.CANCELLED;
  
  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-lg shadow-sm border p-4 mb-3 cursor-pointer transition-all hover:shadow-md ${isHighUrgency && !isCancelled ? 'border-l-4 border-l-red-500 border-t-red-100 border-r-red-100 border-b-red-100' : 'border-gray-100'} ${isCancelled ? 'opacity-70 bg-gray-50' : ''}`}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
           <CategoryIcon category={request.category} className="w-4 h-4" />
           <span className="text-xs text-gray-500 font-medium">{request.category}</span>
        </div>
        <StatusBadge status={request.status} />
      </div>
      <h3 className={`text-base font-semibold text-gray-900 line-clamp-1 mb-1 ${isCancelled ? 'line-through text-gray-500' : ''}`}>{request.title}</h3>
      <div className="flex items-center text-gray-500 text-xs mb-3 gap-2">
        <span className="flex items-center"><MapPin className="w-3 h-3 mr-1"/> {request.location}</span>
        <span>•</span>
        <span>{new Date(request.createdAt).toLocaleDateString()}</span>
      </div>
      <div className="flex justify-between items-center border-t pt-2 mt-1">
        <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 uppercase">Requester</span>
            <span className="text-xs text-gray-700 font-medium flex items-center gap-1">
                <UserIcon className="w-3 h-3" /> {request.requesterName}
            </span>
            <span className="text-[10px] text-gray-400">{request.requesterEmail}</span>
        </div>
        <div className="flex flex-col items-end">
            <UrgencyBadge urgency={request.urgency} />
            <span className="text-[10px] text-gray-300 mt-1">ID: {request.id}</span>
        </div>
      </div>
    </div>
  );
};

const CreateRequestView: React.FC<{ 
  user: User; 
  initialCategory?: RequestCategory;
  onSubmit: (req: Partial<ServiceRequest>) => void; 
  onCancel: () => void 
}> = ({ user, initialCategory, onSubmit, onCancel }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState<RequestLocation>(RequestLocation.STMEV);
  const [specificLocation, setSpecificLocation] = useState('');
  const [category, setCategory] = useState<RequestCategory>(initialCategory || RequestCategory.OTHER);
  const [urgency, setUrgency] = useState<UrgencyLevel>(UrgencyLevel.LOW);
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSmartAnalysis = async () => {
    if (!description || description.length < 5) return;
    setIsAnalyzing(true);
    const result = await analyzeRequestWithGemini(description, location);
    if (result) {
      setCategory(result.category);
      setUrgency(result.urgency);
      if (!title) setTitle(result.summary);
    }
    setIsAnalyzing(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title: title || 'Maintenance Request',
      description,
      location,
      specificLocation,
      category,
      urgency,
      beforeImageUrl: image || undefined,
    });
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">
            {initialCategory === RequestCategory.MOVING ? 'Easy Stuff Moving' : 'New Request'}
        </h2>
        <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">Cancel</button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title Moved to Top */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Subject Title</label>
          <input 
            type="text" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border"
            placeholder="Brief title (e.g. Broken AC in Lab)"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Building/Area</label>
            <select 
                value={location} 
                onChange={(e) => setLocation(e.target.value as RequestLocation)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border text-sm"
            >
                {Object.values(RequestLocation).map(loc => (
                <option key={loc} value={loc}>{loc}</option>
                ))}
            </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Specific Place (Room No.)</label>
                <input 
                    type="text" 
                    value={specificLocation}
                    onChange={(e) => setSpecificLocation(e.target.value)}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border text-sm"
                    placeholder="e.g. Room 304, 2nd Floor Lobby"
                />
            </div>
        </div>

        <div>
           <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <button 
              type="button" 
              onClick={handleSmartAnalysis}
              disabled={isAnalyzing || description.length < 5}
              className={`text-xs flex items-center gap-1 px-2 py-1 rounded-full transition-colors ${isAnalyzing ? 'bg-indigo-100 text-indigo-700' : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:opacity-90'}`}
            >
              <Sparkles className="w-3 h-3" />
              {isAnalyzing ? 'Analyzing...' : 'Auto-fill with AI'}
            </button>
           </div>
           <textarea 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border h-32"
            placeholder={initialCategory === RequestCategory.MOVING ? "Describe the event details, furniture needed, and setup time..." : "Describe the issue in detail..."}
            required
           />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select 
              value={category} 
              onChange={(e) => setCategory(e.target.value as RequestCategory)}
              disabled={!!initialCategory}
              className={`w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border ${initialCategory ? 'bg-gray-100 text-gray-500' : ''}`}
            >
              {Object.values(RequestCategory).map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Urgency</label>
            <select 
              value={urgency} 
              onChange={(e) => setUrgency(e.target.value as UrgencyLevel)}
              className={`w-full border-gray-300 rounded-md shadow-sm p-2 border ${urgency === UrgencyLevel.HIGH ? 'text-red-600 font-bold bg-red-50' : ''}`}
            >
              {Object.values(UrgencyLevel).map(u => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
        </div>

        <ImageUpload label="Photo (Optional)" onChange={setImage} previewUrl={image || undefined} />

        <button 
          type="submit" 
          disabled={!description}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Submit Request
        </button>
      </form>
    </div>
  );
};

const RequestDetail: React.FC<{ 
  request: ServiceRequest; 
  user: User;
  onClose: () => void; 
  onUpdateStatus: (id: string, status: RequestStatus, note?: string, image?: string) => void;
  onAddComment: (id: string, text: string) => void;
  onCancel: (id: string) => void;
  onDelete: (id: string) => void;
}> = ({ request, user, onClose, onUpdateStatus, onAddComment, onCancel, onDelete }) => {
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [holdModalOpen, setHoldModalOpen] = useState(false);
  const [note, setNote] = useState('');
  const [completionImage, setCompletionImage] = useState<string | null>(null);

  const canEdit = user.role === UserRole.WORKER || user.role === UserRole.ADMIN;
  const canCancel = user.id === request.requesterId && request.status === RequestStatus.PENDING;
  const canDelete = user.role === UserRole.ADMIN;

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col h-[calc(100vh-140px)]">
      <div className="p-4 border-b flex justify-between items-start bg-gray-50">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
               <ArrowLeft className="w-5 h-5" />
            </button>
            <StatusBadge status={request.status} />
            <UrgencyBadge urgency={request.urgency} />
          </div>
          <h2 className="text-xl font-bold text-gray-900">{request.title}</h2>
          <div className="flex items-center text-sm text-gray-500 mt-1 gap-3">
             <span className="flex items-center"><MapPin className="w-3 h-3 mr-1"/> {request.location} {request.specificLocation && `(${request.specificLocation})`}</span>
             <span className="flex items-center"><Clock className="w-3 h-3 mr-1"/> {new Date(request.createdAt).toLocaleString()}</span>
          </div>
        </div>
        
        <div className="flex gap-2">
            {canCancel && (
                <button 
                  onClick={() => { if(confirm('Cancel this request?')) onCancel(request.id); }}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  title="Cancel Request"
                >
                  <XCircle className="w-6 h-6" />
                </button>
            )}
            {canDelete && (
                <button 
                  onClick={() => { if(confirm('Delete this request permanently?')) onDelete(request.id); }}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  title="Delete Request"
                >
                  <Trash2 className="w-6 h-6" />
                </button>
            )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        
        {/* Contact Info Section */}
        <div className="bg-blue-50 p-4 rounded-lg text-sm border border-blue-100 flex justify-between">
           <div>
              <span className="block text-xs text-blue-500 font-bold uppercase mb-1">Requester</span>
              <div className="font-medium text-gray-800">{request.requesterName}</div>
              <div className="text-gray-500">{request.requesterEmail}</div>
           </div>
           {request.assigneeName && (
               <div className="text-right">
                  <span className="block text-xs text-blue-500 font-bold uppercase mb-1">Worker</span>
                  <div className="font-medium text-gray-800">{request.assigneeName}</div>
                  <div className="text-gray-500">{request.assigneeEmail}</div>
               </div>
           )}
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Description</h3>
          <p className="text-gray-800 whitespace-pre-wrap">{request.description}</p>
        </div>

        {request.beforeImageUrl && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Attached Image</h3>
            <img src={request.beforeImageUrl} alt="Problem" className="rounded-lg max-h-60 object-cover border" />
          </div>
        )}

        {/* Timeline */}
        <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Timeline</h3>
            <div className="border-l-2 border-gray-200 ml-2 space-y-4">
                {request.timeline.map((event, idx) => (
                    <div key={idx} className="relative pl-6">
                        <div className="absolute -left-1.5 top-1 w-3 h-3 rounded-full bg-gray-300 ring-4 ring-white"></div>
                        <p className="text-sm font-medium text-gray-900">{event.status}</p>
                        <p className="text-xs text-gray-500">{new Date(event.timestamp).toLocaleString()}</p>
                        {event.note && <p className="text-sm text-gray-600 mt-1 bg-gray-50 p-2 rounded">{event.note}</p>}
                    </div>
                ))}
            </div>
        </div>

        {request.status === RequestStatus.COMPLETED && request.afterImageUrl && (
          <div>
             <h3 className="text-sm font-medium text-green-600 uppercase tracking-wider mb-2">Completion Evidence</h3>
             <img src={request.afterImageUrl} alt="Fixed" className="rounded-lg max-h-60 object-cover border-2 border-green-100" />
          </div>
        )}

        {/* Comments Section */}
        <div className="pt-4 border-t">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Comments</h3>
            <CommentList comments={request.comments} currentUserId={user.id} />
            <CommentInput onSubmit={(text) => onAddComment(request.id, text)} />
        </div>
      </div>

      {/* Action Footer for Workers */}
      {canEdit && request.status !== RequestStatus.COMPLETED && request.status !== RequestStatus.CANCELLED && (
        <div className="p-4 border-t bg-gray-50 flex gap-3">
          {request.status === RequestStatus.PENDING && (
            <button 
              onClick={() => onUpdateStatus(request.id, RequestStatus.IN_PROGRESS)}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700"
            >
              Start Work
            </button>
          )}
          {request.status === RequestStatus.IN_PROGRESS && (
            <>
              <button 
                onClick={() => setHoldModalOpen(true)}
                className="flex-1 bg-orange-100 text-orange-700 py-2 rounded-lg font-medium hover:bg-orange-200"
              >
                Put on Hold
              </button>
              <button 
                onClick={() => setCompleteModalOpen(true)}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700"
              >
                Complete Job
              </button>
            </>
          )}
          {request.status === RequestStatus.ON_HOLD && (
             <button 
                onClick={() => onUpdateStatus(request.id, RequestStatus.IN_PROGRESS)}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700"
             >
               Resume Work
             </button>
          )}
        </div>
      )}

      {/* Completion Modal */}
      <Modal isOpen={completeModalOpen} onClose={() => setCompleteModalOpen(false)} title="Complete Request">
        <div className="space-y-4">
            <ImageUpload label="Evidence Photo (Optional)" onChange={setCompletionImage} previewUrl={completionImage || undefined} />
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Completion Note</label>
                <textarea 
                    className="w-full border rounded p-2" 
                    rows={3}
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    placeholder="Describe what was done..."
                />
            </div>
            <button 
                className="w-full bg-green-600 text-white py-2 rounded font-medium disabled:opacity-50"
                onClick={() => {
                    onUpdateStatus(request.id, RequestStatus.COMPLETED, note, completionImage || undefined);
                    setCompleteModalOpen(false);
                }}
            >
                Confirm Completion
            </button>
        </div>
      </Modal>

      {/* Hold Modal */}
      <Modal isOpen={holdModalOpen} onClose={() => setHoldModalOpen(false)} title="Put on Hold">
         <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Hold</label>
                <textarea 
                    className="w-full border rounded p-2" 
                    rows={3}
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    placeholder="Missing parts, waiting for approval, etc."
                />
            </div>
            <button 
                className="w-full bg-orange-500 text-white py-2 rounded font-medium"
                disabled={!note}
                onClick={() => {
                    onUpdateStatus(request.id, RequestStatus.ON_HOLD, note);
                    setHoldModalOpen(false);
                }}
            >
                Confirm Hold
            </button>
         </div>
      </Modal>
    </div>
  );
};


// --- Dashboard ---

const Dashboard: React.FC<{ 
  requests: ServiceRequest[]; 
  user: User;
  onSelectRequest: (req: ServiceRequest) => void; 
  onCreateRequest: () => void;
  isAdminMode?: boolean;
}> = ({ requests, user, onSelectRequest, onCreateRequest, isAdminMode = false }) => {
  const [filter, setFilter] = useState<RequestStatus | 'ALL'>('ALL');
  // Filters for Dates
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const stats = useMemo(() => getStats(requests), [requests]);
  
  // Filter logic:
  // Admin/Worker in AdminMode: Sees ALL
  // Worker: Sees ALL (Work Queue)
  // Staff: Sees OWN
  const visibleRequests = useMemo(() => {
    let filtered = requests;

    // Role based filtering
    if (user.role === UserRole.STAFF) {
        filtered = filtered.filter(r => r.requesterId === user.id);
    } 
    // Workers see everything in their "Work Queue", no filtering needed by default

    // Status Filter
    if (filter !== 'ALL') {
      filtered = filtered.filter(r => r.status === filter);
    }
    
    // Date Filter
    if (startDate) {
        filtered = filtered.filter(r => new Date(r.createdAt) >= new Date(startDate));
    }
    if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filtered = filtered.filter(r => new Date(r.createdAt) <= end);
    }

    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [requests, filter, user.role, user.id, startDate, endDate]);

  const showCharts = (user.role === UserRole.ADMIN && isAdminMode);

  return (
    <div className="h-full flex flex-col">
      {/* Charts Section for Admin */}
      {showCharts && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm border min-w-0">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-bold text-gray-700">Requests by Category</h3>
                    <div className="w-20"></div> {/* Spacer */}
                </div>
                <div className="w-full h-64 relative min-w-0">
                    <ResponsiveContainer width="99%" height="100%">
                        <PieChart>
                            <Pie
                                data={stats.categoryBreakdown}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {stats.categoryBreakdown.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border min-w-0">
                <h3 className="text-sm font-bold text-gray-700 mb-4">Weekly Activity</h3>
                <div className="w-full h-64 relative min-w-0">
                    <ResponsiveContainer width="99%" height="100%">
                        <BarChart data={[{name: 'Pending', val: stats.pending}, {name: 'Completed', val: stats.completed}, {name: 'Total', val: stats.total}]}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" fontSize={12} />
                            <YAxis fontSize={12} />
                            <Tooltip />
                            <Bar dataKey="val" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-800">
           {user.role === UserRole.STAFF ? 'My Requests' : (user.role === UserRole.WORKER ? 'Work Queue' : 'Request Management')}
        </h2>
        {/* Workers can also create requests now */}
        {(user.role === UserRole.STAFF || user.role === UserRole.ADMIN || user.role === UserRole.WORKER) && (
            <button onClick={onCreateRequest} className="bg-blue-600 text-white p-2 rounded-full shadow hover:bg-blue-700 transition-colors">
                <Plus className="w-5 h-5" />
            </button>
        )}
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-2 no-scrollbar">
        {['ALL', RequestStatus.PENDING, RequestStatus.IN_PROGRESS, RequestStatus.COMPLETED].map((s) => (
            <button
                key={s}
                onClick={() => setFilter(s as any)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${filter === s ? 'bg-gray-800 text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'}`}
            >
                {s === 'ALL' ? 'All' : s}
            </button>
        ))}
      </div>
      
      {/* Date Filter */}
      <div className="flex items-center gap-2 mb-4 bg-gray-50 p-2 rounded text-xs">
         <span className="text-gray-500 font-medium">Date:</span>
         <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="border rounded p-1" />
         <span className="text-gray-400">-</span>
         <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="border rounded p-1" />
      </div>

      <div className="flex-1 overflow-y-auto pr-1">
        {visibleRequests.length > 0 ? (
            visibleRequests.map(req => (
                <RequestCard key={req.id} request={req} onClick={() => onSelectRequest(req)} />
            ))
        ) : (
            <div className="text-center py-10 text-gray-400">
                <ListTodo className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p>No requests found</p>
            </div>
        )}
      </div>
    </div>
  );
};

// --- Main App Component ---

type ViewState = 'HOME' | 'LIST' | 'CREATE' | 'CREATE_EVENT' | 'DETAIL' | 'ADMIN_USERS' | 'SURVEY' | 'SHEET';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<ViewState>('HOME');
  const [requests, setRequests] = useState<ServiceRequest[]>(INITIAL_REQUESTS);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [sheetInfo, setSheetInfo] = useState<{url: string, title: string} | null>(null);
  
  // For Admin to toggle between "Admin Dashboard" and "My/User View"
  const [adminViewMode, setAdminViewMode] = useState(true);

  const handleLogin = (u: User) => {
    setUser(u);
    setView('HOME');
  };

  const handleCreateRequest = (reqData: Partial<ServiceRequest>) => {
    if (!user) return;
    const newReq: ServiceRequest = {
        id: generateId(),
        requesterId: user.id,
        requesterName: user.name,
        requesterEmail: user.email,
        title: reqData.title!,
        description: reqData.description!,
        category: reqData.category!,
        location: reqData.location!,
        specificLocation: reqData.specificLocation,
        urgency: reqData.urgency!,
        status: RequestStatus.PENDING,
        timeline: [{ status: RequestStatus.PENDING, timestamp: new Date().toISOString() }],
        comments: [],
        createdAt: new Date().toISOString(),
        beforeImageUrl: reqData.beforeImageUrl
    };
    setRequests([newReq, ...requests]);
    setView('LIST');
  };

  const handleUpdateStatus = (id: string, status: RequestStatus, note?: string, image?: string) => {
    setRequests(prev => prev.map(req => {
        if (req.id !== id) return req;
        const newTimeline = [...req.timeline, { status, timestamp: new Date().toISOString(), note }];
        
        let updates: Partial<ServiceRequest> = { status, timeline: newTimeline };
        
        if (status === RequestStatus.IN_PROGRESS && !req.assigneeId && user) {
            updates.assigneeId = user.id;
            updates.assigneeEmail = user.email; // Assign worker email
            updates.assigneeName = user.name;
        }
        if (status === RequestStatus.COMPLETED) {
            if (image) updates.afterImageUrl = image;
        }
        if (status === RequestStatus.ON_HOLD && note) {
            updates.holdReason = note;
        }

        const updated = { ...req, ...updates };
        if (selectedRequest && selectedRequest.id === id) setSelectedRequest(updated);
        return updated;
    }));
  };

  const handleCancelRequest = (id: string) => {
      handleUpdateStatus(id, RequestStatus.CANCELLED, "Cancelled by requester");
      setView('LIST');
  };

  const handleDeleteRequest = (id: string) => {
      setRequests(prev => prev.filter(r => r.id !== id));
      setSelectedRequest(null);
      setView('LIST');
  };

  const handleAddComment = (id: string, text: string) => {
    if (!user) return;
    const newComment: Comment = {
      id: `c-${Date.now()}`,
      authorId: user.id,
      authorName: user.name,
      text,
      timestamp: new Date().toISOString()
    };
    setRequests(prev => prev.map(req => {
      if (req.id !== id) return req;
      const updated = { ...req, comments: [...req.comments, newComment] };
      if (selectedRequest && selectedRequest.id === id) setSelectedRequest(updated);
      return updated;
    }));
  };

  // User Management
  const handleUpdateUser = (id: string, updates: Partial<User>) => {
      setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
  };
  const handleDeleteUsers = (ids: string[]) => {
      setUsers(prev => prev.filter(u => !ids.includes(u.id)));
  };
  const handleBulkImport = (csvData: string) => {
      const lines = csvData.split('\n');
      const newUsers = [...users];
      lines.forEach(line => {
          const [email, name, roleStr] = line.split(',').map(s => s.trim());
          if (!email || !name) return;
          
          const role = (Object.values(UserRole) as string[]).includes(roleStr) ? roleStr as UserRole : UserRole.STAFF;
          const existingIdx = newUsers.findIndex(u => u.email === email);
          
          if (existingIdx >= 0) {
              // Update
              newUsers[existingIdx] = { ...newUsers[existingIdx], name, role, isApproved: true };
          } else {
              // Create
              newUsers.push({
                  id: `u-${Date.now()}-${Math.random()}`,
                  userCode: generateUserCode(),
                  email,
                  name,
                  role,
                  isApproved: true,
                  password: 'password', // Default
                  avatarUrl: `https://ui-avatars.com/api/?name=${name}`,
                  createdAt: new Date().toISOString()
              });
          }
      });
      setUsers(newUsers);
      alert('Import successful');
  };

  if (!user) return <AuthScreen onLogin={handleLogin} />;

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm p-4 flex justify-between items-center z-10 sticky top-0">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('HOME')}>
          <div className="bg-green-800 p-1.5 rounded-lg">
             <Wrench className="w-5 h-5 text-white" />
          </div>
          <h1 className="font-bold text-gray-800 text-lg">BHA Facility</h1>
        </div>
        <div className="flex items-center gap-3">
          {user.role === UserRole.ADMIN && (
             <button 
                onClick={() => setAdminViewMode(!adminViewMode)}
                className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100"
             >
                 {adminViewMode ? 'View as User' : 'Admin View'}
             </button>
          )}
          <img src={user.avatarUrl} alt="Profile" className="w-8 h-8 rounded-full border border-gray-200" />
          <button onClick={() => setUser(null)} className="text-gray-500 hover:text-red-500">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 overflow-hidden flex flex-col">
        {view === 'HOME' && (
            <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
                    <p className="text-blue-100 text-sm mb-1">Welcome back,</p>
                    <h2 className="text-2xl font-bold">{user.name}</h2>
                    <p className="text-xs opacity-80 mt-1">{user.role} • {user.department || 'General'}</p>
                </div>

                {user.role === UserRole.ADMIN && adminViewMode && (
                    <div className="bg-white rounded-xl shadow-sm border p-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-gray-800">Admin Controls</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <button 
                                onClick={() => setView('ADMIN_USERS')}
                                className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                            >
                                <Users className="w-6 h-6 text-blue-600 mb-2" />
                                <span className="text-xs font-medium">Manage Users</span>
                            </button>
                            <button 
                                onClick={() => setView('LIST')}
                                className="flex flex-col items-center justify-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                            >
                                <BarChart3 className="w-6 h-6 text-indigo-600 mb-2" />
                                <span className="text-xs font-medium">Statistics</span>
                            </button>
                        </div>
                    </div>
                )}

                <HomeMenu 
                    role={user.role} 
                    onNavigate={(target, url, title) => {
                        if (target === 'SHEET' && url && title) {
                            setSheetInfo({ url, title });
                            setView('SHEET');
                        } else {
                            setView(target);
                        }
                    }} 
                />
            </div>
        )}

        {view === 'ADMIN_USERS' && (
            <div className="h-full flex flex-col">
                <button onClick={() => setView('HOME')} className="text-gray-500 mb-4 flex items-center text-sm font-medium hover:text-gray-900 w-fit">
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back to Home
                </button>
                <AdminUserView 
                    users={users} 
                    onUpdateUser={handleUpdateUser} 
                    onDeleteUsers={handleDeleteUsers}
                    onBulkImport={handleBulkImport}
                />
            </div>
        )}

        {view === 'LIST' && (
            <Dashboard 
              requests={requests} 
              user={user} 
              onSelectRequest={(r) => { setSelectedRequest(r); setView('DETAIL'); }}
              onCreateRequest={() => setView('CREATE')}
              isAdminMode={adminViewMode}
            />
        )}

        {view === 'CREATE' && (
            <CreateRequestView 
              user={user} 
              onSubmit={handleCreateRequest} 
              onCancel={() => setView('HOME')} 
            />
        )}

        {view === 'CREATE_EVENT' && (
            <CreateRequestView 
              user={user} 
              initialCategory={RequestCategory.MOVING}
              onSubmit={handleCreateRequest} 
              onCancel={() => setView('HOME')} 
            />
        )}

        {view === 'DETAIL' && selectedRequest && (
            <RequestDetail 
              request={selectedRequest} 
              user={user}
              onClose={() => setView('LIST')}
              onUpdateStatus={handleUpdateStatus}
              onAddComment={handleAddComment}
              onCancel={handleCancelRequest}
              onDelete={handleDeleteRequest}
            />
        )}

        {view === 'SURVEY' && (
            <SurveyView onBack={() => setView('HOME')} />
        )}

        {view === 'SHEET' && sheetInfo && (
            <SheetViewer url={sheetInfo.url} title={sheetInfo.title} onBack={() => setView('HOME')} />
        )}
      </main>
    </div>
  );
}