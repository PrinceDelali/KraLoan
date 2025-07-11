import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from './api';
import { 
  User, 
  Home, 
  PiggyBank, 
  History, 
  Calendar, 
  Bell, 
  ArrowDownToLine, 
  MessageCircle, 
  Settings, 
  Plus,
  Edit3,
  Shield,
  CreditCard,
  ChevronRight,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users,
  X,
  LogIn,
  DollarSign,
  TrendingDown,
  Loader2,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

const SusuDashboard = () => {
  // UI state for group and transaction actions
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showJoinGroup, setShowJoinGroup] = useState(false);
  const [showContribute, setShowContribute] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', description: '', targetAmount: '', monthlyContribution: '' });
  const [joinGroupId, setJoinGroupId] = useState('');
  const [groupActionError, setGroupActionError] = useState('');
  const [contributionAmount, setContributionAmount] = useState('');
  const [contributionMethod, setContributionMethod] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawReason, setWithdrawReason] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showSettings, setShowSettings] = useState(false);
  const [settingsTab, setSettingsTab] = useState('profile');

  const [profileData, setProfileData] = useState(null);
  const [groups, setGroups] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Handlers
  const handleCreateGroup = async (e) => {
    e.preventDefault();
    setGroupActionError('');
    try {
      await api.createGroup({
        ...newGroup,
        targetAmount: Number(newGroup.targetAmount),
        monthlyContribution: Number(newGroup.monthlyContribution)
      });
      setShowCreateGroup(false);
      setNewGroup({ name: '', description: '', targetAmount: '', monthlyContribution: '' });
      // Optionally reload groups
      const groups = await api.listGroups();
      setGroups(groups);
    } catch (err) {
      setGroupActionError(err.message || 'Failed to create group.');
    }
  };

  // Handler: Join Group
  const handleJoinGroup = async (e) => {
    e.preventDefault();
    setGroupActionError('');
    try {
      await api.joinGroup(joinGroupId);
      setShowJoinGroup(false);
      setJoinGroupId('');
      const groups = await api.listGroups();
      setGroups(groups);
    } catch (err) {
      setGroupActionError(err.message || 'Failed to join group.');
    }
  };

  // Handler: Make Contribution
  const handleContribute = async (e) => {
    e.preventDefault();
    setGroupActionError('');
    try {
      await api.createTransaction({
        group: groups[0]?._id,
        type: 'contribution',
        amount: Number(contributionAmount),
        method: contributionMethod
      });
      setShowContribute(false);
      setContributionAmount('');
      setContributionMethod('');
      const txs = await api.listTransactions();
      setTransactions(txs);
    } catch (err) {
      setGroupActionError(err.message || 'Failed to contribute.');
    }
  };

  // Handler: Request Withdrawal
  const handleWithdraw = async (e) => {
    e.preventDefault();
    setGroupActionError('');
    try {
      await api.createTransaction({
        group: groups[0]?._id,
        type: 'withdrawal',
        amount: Number(withdrawAmount),
        method: withdrawMethod,
        reason: withdrawReason
      });
      setShowWithdraw(false);
      setWithdrawAmount('');
      setWithdrawMethod('');
      setWithdrawReason('');
      const txs = await api.listTransactions();
      setTransactions(txs);
    } catch (err) {
      setGroupActionError(err.message || 'Failed to request withdrawal.');
    }
  };


  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    if (!token || !user) {
      navigate('/login');
      return;
    }
    setIsLoading(true);
    setError('');
    Promise.all([
      api.getProfile(user.id),
      api.listGroups(),
      api.listTransactions()
    ])
      .then(([profile, groups, transactions]) => {
        setProfileData(profile);
        setGroups(groups);
        setTransactions(transactions);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load dashboard data.');
        setIsLoading(false);
      });
  }, [navigate]);

  // Derive savings summary from transactions
  const totalSaved = transactions.filter(t => t.type === 'contribution' && t.status === 'completed').reduce((sum, t) => sum + t.amount, 0);
  const monthlyContribution = groups[0]?.monthlyContribution || 0;
  const groupTarget = groups[0]?.targetAmount || 0;
  const progressPercentage = groupTarget ? Math.round((totalSaved / groupTarget) * 100) : 0;

  // Filter and map transactions for contribution history and withdrawals
  const contributionHistory = transactions.filter(t => t.type === 'contribution');
  const withdrawals = transactions.filter(t => t.type === 'withdrawal');

  // Mock notifications for now
  const notifications = [
    { id: 1, type: 'reminder', message: 'Monthly contribution due soon', time: '2 hours ago' },
    { id: 2, type: 'approval', message: 'Your withdrawal request has been approved', time: '1 day ago' },
    { id: 3, type: 'meeting', message: 'Group meeting scheduled soon', time: '2 days ago' }
  ];

  if (isLoading) return <div className="flex justify-center items-center min-h-screen">Loading dashboard...</div>;
  if (error) return <div className="flex justify-center items-center min-h-screen text-red-600">{error}</div>;


  const StatusBadge = ({ status }) => {
    const styles = {
      'Paid': 'bg-green-100 text-green-800',
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Missed': 'bg-red-100 text-red-800',
      'Approved': 'bg-blue-100 text-blue-800',
      'Completed': 'bg-green-100 text-green-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  const handleProfileUpdate = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProfileSave = async () => {
    try {
      setIsLoading(true);
      setError('');
      const user = JSON.parse(localStorage.getItem('user'));
      await api.updateProfile(user.id, profileData);
      alert('Profile updated successfully!');
      setIsLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
      setIsLoading(false);
    }
  };


  const renderSettings = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
          <button 
            onClick={() => setShowSettings(false)}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close settings"
          >
            ×
          </button>
        </div>

        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {['profile', 'security', 'payment'].map((tab) => (
            <button
              key={tab}
              onClick={() => setSettingsTab(tab)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                settingsTab === tab
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab === 'profile' && 'Profile'}
              {tab === 'security' && 'Security'}
              {tab === 'payment' && 'Payment'}
            </button>
          ))}
        </div>

        {settingsTab === 'profile' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <User className="h-5 w-5 mr-2" />
              Profile Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => handleProfileUpdate('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => handleProfileUpdate('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => handleProfileUpdate('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  value={profileData.address}
                  onChange={(e) => handleProfileUpdate('address', e.target.value)}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              {error && (
                <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-sm">{error}</div>
              )}
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                onClick={() => {
                  if (!profileData.name || !profileData.email) {
                    alert('Name and email are required!');
                    return;
                  }
                  handleProfileSave();
                }}
                aria-label="Update Profile"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : 'Update Profile'}
              </button>
            </div>
          </div>
        )}

        {settingsTab === 'security' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Security Settings
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                onClick={() => {
                  // In real app, validate passwords and call API
                  alert('Password changed (demo only)!');
                }}
                aria-label="Change Password"
              >
                Change Password
              </button>
            </div>
          </div>
        )}

        {settingsTab === 'payment' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Payment Methods
            </h3>
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Mobile Money</p>
                    <p className="text-sm text-gray-600">**** **** 4567</p>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700" aria-label="Edit Payment Method">
                    <Edit3 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Bank Account</p>
                    <p className="text-sm text-gray-600">GCB Bank - **** 8901</p>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700" aria-label="Edit Payment Method">
                    <Edit3 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <button
                className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-colors"
                aria-label="Add Payment Method"
                onClick={() => alert('Add payment method (demo only)!')}
              >
                <Plus className="h-5 w-5 mx-auto mb-2" />
                Add Payment Method
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (showSettings) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          {renderSettings()}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-xl flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-blue-700">KraLoan</h1>
        </div>
        <nav className="mt-8 flex-1">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Home },
            { id: 'savings', label: 'Savings', icon: PiggyBank },
            { id: 'history', label: 'History', icon: History },
            { id: 'upcoming', label: 'Upcoming', icon: Calendar },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'withdrawals', label: 'Withdrawals', icon: ArrowDownToLine },
            { id: 'chat', label: 'Help & Chat', icon: MessageCircle }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center px-6 py-3.5 text-left text-sm font-medium transition-all duration-200 ${
                activeTab === item.id
                  ? 'bg-blue-100 text-blue-700 border-r-4 border-blue-600'
                  : 'text-gray-500 hover:bg-blue-50 hover:text-blue-600'
              }`}
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-6 border-t border-gray-200">
          <button
            onClick={() => setShowSettings(true)}
            className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800 rounded-lg transition-colors"
            aria-label="Open Settings"
          >
            <Settings className="h-5 w-5 mr-3" />
            Settings
          </button>
          <button
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              window.location.href = '/login';
            }}
            className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-100 hover:text-red-700 rounded-lg transition-colors mt-2"
            aria-label="Logout"
          >
            <XCircle className="h-5 w-5 mr-3" />
            Logout
          </button>
        </div>
      </div>
      {/* Main Content */}
      <div className="flex-1 p-8 relative">
        {/* Modals */}
        {showContribute && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
              <h3 className="text-xl font-bold mb-4">Make Contribution</h3>
              <form onSubmit={handleContribute} className="space-y-4">
                <input type="number" placeholder="Amount" value={contributionAmount} onChange={e => setContributionAmount(e.target.value)} className="w-full border px-3 py-2 rounded" required />
                <input type="text" placeholder="Method (e.g. Mobile Money)" value={contributionMethod} onChange={e => setContributionMethod(e.target.value)} className="w-full border px-3 py-2 rounded" required />
                <div className="flex justify-end space-x-2">
                  <button type="button" onClick={() => setShowContribute(false)} className="px-3 py-2 rounded bg-gray-200">Cancel</button>
                  <button type="submit" className="px-3 py-2 rounded bg-blue-600 text-white">Contribute</button>
                </div>
              </form>
              {groupActionError && <div className="text-red-600 mt-2">{groupActionError}</div>}
            </div>
          </div>
        )}
        {showWithdraw && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
              <h3 className="text-xl font-bold mb-4">Request Withdrawal</h3>
              <form onSubmit={handleWithdraw} className="space-y-4">
                <input type="number" placeholder="Amount" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} className="w-full border px-3 py-2 rounded" required />
                <input type="text" placeholder="Method (e.g. Bank)" value={withdrawMethod} onChange={e => setWithdrawMethod(e.target.value)} className="w-full border px-3 py-2 rounded" required />
                <textarea placeholder="Reason" value={withdrawReason} onChange={e => setWithdrawReason(e.target.value)} className="w-full border px-3 py-2 rounded" required />
                <div className="flex justify-end space-x-2">
                  <button type="button" onClick={() => setShowWithdraw(false)} className="px-3 py-2 rounded bg-gray-200">Cancel</button>
                  <button type="submit" className="px-3 py-2 rounded bg-blue-600 text-white">Request</button>
                </div>
              </form>
              {groupActionError && <div className="text-red-600 mt-2">{groupActionError}</div>}
            </div>
          </div>
        )}
        {showCreateGroup && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 transition-opacity duration-300 animate-fade-in">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg transform transition-all duration-300 animate-slide-up">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                  <Users className="h-7 w-7 text-blue-600 mr-3" />
                  <h3 className="text-2xl font-bold text-gray-800">Create a New Group</h3>
                </div>
                <button onClick={() => setShowCreateGroup(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-6 w-6" />
                </button>
              </div>
              <form onSubmit={handleCreateGroup} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
                  <input type="text" placeholder="e.g., Family Savings" value={newGroup.name} onChange={e => setNewGroup({ ...newGroup, name: e.target.value })} className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition" required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Target Amount (GHS)</label>
                    <input type="number" placeholder="e.g., 5000" value={newGroup.targetAmount} onChange={e => setNewGroup({ ...newGroup, targetAmount: e.target.value })} className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Contribution (GHS)</label>
                    <input type="number" placeholder="e.g., 500" value={newGroup.monthlyContribution} onChange={e => setNewGroup({ ...newGroup, monthlyContribution: e.target.value })} className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition" required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea placeholder="A brief description of the group's purpose" value={newGroup.description} onChange={e => setNewGroup({ ...newGroup, description: e.target.value })} className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition" rows="3" />
                </div>
                <div className="flex justify-end space-x-4 pt-4">
                  <button type="button" onClick={() => setShowCreateGroup(false)} className="px-6 py-2.5 rounded-lg bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300 transition">Cancel</button>
                  <button type="submit" className="px-6 py-2.5 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition-transform transform hover:scale-105 shadow-sm">Create Group</button>
                </div>
              </form>
              {groupActionError && <div className="text-red-600 mt-4 text-sm flex items-center"><AlertCircle className="h-4 w-4 mr-2" />{groupActionError}</div>}
            </div>
          </div>
        )}
        {showJoinGroup && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 transition-opacity duration-300 animate-fade-in">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 animate-slide-up">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                  <LogIn className="h-7 w-7 text-blue-600 mr-3" />
                  <h3 className="text-2xl font-bold text-gray-800">Join an Existing Group</h3>
                </div>
                <button onClick={() => setShowJoinGroup(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-6 w-6" />
                </button>
              </div>
              <form onSubmit={handleJoinGroup} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Group ID</label>
                  <input type="text" placeholder="Enter the unique ID of the group" value={joinGroupId} onChange={e => setJoinGroupId(e.target.value)} className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition" required />
                </div>
                <div className="flex justify-end space-x-4 pt-4">
                  <button type="button" onClick={() => setShowJoinGroup(false)} className="px-6 py-2.5 rounded-lg bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300 transition">Cancel</button>
                  <button type="submit" className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-sm">Join Group</button>
                </div>
              </form>
              {groupActionError && <div className="text-red-600 mt-4 text-sm flex items-center"><AlertCircle className="h-4 w-4 mr-2" />{groupActionError}</div>}
            </div>
          </div>
        )}
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Welcome back, {profileData?.firstName || 'User'}!</h2>
            <div className="flex items-center space-x-4">
                <button onClick={() => setShowCreateGroup(true)} className="bg-green-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-green-700 transition-transform transform hover:scale-105 shadow-sm">Create Group</button>
                <button onClick={() => setShowJoinGroup(true)} className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-sm">Join Group</button>
            </div>
        </div>
        {/* Tab Content */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center hover:shadow-lg transition-shadow duration-300">
                <PiggyBank className="h-8 w-8 text-green-600 mb-2" />
                <div className="text-gray-600">Total Saved</div>
                <div className="text-2xl font-bold text-blue-600">GHS {totalSaved}</div>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center hover:shadow-lg transition-shadow duration-300">
                <TrendingUp className="h-8 w-8 text-blue-600 mb-2" />
                <div className="text-gray-600">Monthly Contribution</div>
                <div className="text-2xl font-bold text-blue-600">GHS {monthlyContribution}</div>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center hover:shadow-lg transition-shadow duration-300">
                <CreditCard className="h-8 w-8 text-purple-600 mb-2" />
                <div className="text-gray-600">Target</div>
                <div className="text-2xl font-bold text-purple-600">GHS {groupTarget}</div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <div className="text-gray-700 font-medium">Progress to Target</div>
                  <div className="text-sm text-gray-500">{progressPercentage}% Complete</div>
                </div>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-transform transform hover:scale-105" onClick={() => setShowContribute(true)}>
                  Make Contribution
                </button>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div className="bg-gradient-to-r from-blue-500 to-blue-700 h-4 rounded-full transition-all duration-500 ease-out" style={{ width: `${progressPercentage}%` }} />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
              <div className="flex justify-between items-center mb-4">
                <div className="font-semibold text-lg">Recent Transactions</div>
                <button className="text-blue-600 font-semibold hover:underline" onClick={() => setActiveTab('history')}>View All</button>
              </div>
              <div className="divide-y">
                {transactions.slice(0, 5).map((tx, idx) => (
                  <div key={idx} className="flex justify-between py-2">
                    <div>
                      <div className="font-medium">{tx.type === 'contribution' ? 'Contribution' : 'Withdrawal'}</div>
                      <div className="text-xs text-gray-500">{tx.date || tx.createdAt?.slice(0,10) || ''}</div>
                    </div>
                    <div className={tx.type === 'contribution' ? 'text-green-700' : 'text-red-700'}>
                      {tx.type === 'contribution' ? '+' : '-'}GHS {tx.amount}
                    </div>
                    <StatusBadge status={tx.status || 'Completed'} />
                  </div>
                ))}
                {transactions.length === 0 && <div className="text-gray-400 py-4 text-center">No transactions yet.</div>}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <button className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-transform transform hover:scale-105 shadow-sm" onClick={() => setShowCreateGroup(true)}>Create Group</button>
              <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-sm" onClick={() => setShowJoinGroup(true)}>Join Group</button>
              <button className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-transform transform hover:scale-105 shadow-sm" onClick={() => setShowWithdraw(true)}>Request Withdrawal</button>
            </div>
          </div>
        )}
        {activeTab === 'savings' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-3xl font-bold text-gray-800">My Groups</h2>
              <button className="bg-green-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-green-700 transition-transform transform hover:scale-105 shadow-sm" onClick={() => setShowCreateGroup(true)}>Create Group</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {groups.length > 0 ? groups.map((group) => (
  <div key={group._id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
    <div className="font-bold text-lg mb-1">{group.name}</div>
    <div className="text-gray-600 mb-2">{group.description}</div>
    <div className="flex justify-between items-center mb-2">
      <div>
        <div className="text-xs text-gray-500">Target</div>
        <div className="font-medium">GHS {group.targetAmount}</div>
      </div>
      <div>
        <div className="text-xs text-gray-500">Monthly</div>
        <div className="font-medium">GHS {group.monthlyContribution}</div>
      </div>
    </div>
    {/* Member list */}
    <div className="mt-4">
      <div className="text-xs text-gray-500 mb-1">Members:</div>
      <div className="flex flex-wrap gap-2">
        {group.members && group.members.length > 0 ? group.members.map((m, idx) => {
          const isAdmin = group.admins && group.admins.some(a => a._id === m._id);
          const initials = m.name ? m.name.split(' ').map(x => x[0]).join('').toUpperCase().slice(0,2) : (m.email ? m.email[0].toUpperCase() : '?');
          return (
            <button
              key={m._id || idx}
              className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium hover:bg-blue-100 border border-blue-100"
              onClick={() => { setSelectedMember(m); setShowMemberProfileModal(true); }}
              title={m.email || m.name}
            >
              <span className="inline-flex items-center justify-center bg-blue-200 text-blue-700 rounded-full w-5 h-5 text-xs font-bold mr-1">{initials}</span>
              {m.name || m.email || 'User'}
              {isAdmin && <span className="ml-1 bg-green-200 text-green-700 px-1 rounded text-[10px] font-bold">Admin</span>}
            </button>
          );
        }) : <span className="text-gray-400">No members yet</span>}
      </div>
    </div>
    {/* Copy Invite Link for Admins */}
    {group.admins && group.admins.some(a => a._id === (profileData?._id || profileData?.id)) && group.inviteToken && (
      <button
        className="mt-4 w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 font-semibold flex items-center justify-center gap-2"
        onClick={() => {
          const url = `${window.location.origin}/invite/${group.inviteToken}`;
          navigator.clipboard.writeText(url);
          alert('Invite link copied!');
        }}
      >
        Copy Invite Link
      </button>
    )}
  </div>
)) : <div className="text-gray-400 py-8 col-span-2 text-center">You are not in any groups.</div>}
            </div>
          </div>
        )}
        {activeTab === 'directory' && (
          <GroupDirectory allGroups={groups} onJoin={async groupId => {
            setJoinGroupId(groupId);
            setShowJoinGroup(true);
          }} />
        )}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800">Contribution History</h2>
            <div className="bg-white rounded-xl shadow-md overflow-x-auto hover:shadow-lg transition-shadow duration-300">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {contributionHistory.length > 0 ? contributionHistory.map((contribution, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{contribution.date || contribution.createdAt?.slice(0,10) || ''}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">GHS {contribution.amount}</td>
                      <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={contribution.status || 'Completed'} /></td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{contribution.method}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-4 text-center text-gray-500">No contribution history yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {activeTab === 'upcoming' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800">Upcoming Payments & Events</h2>
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
              <div className="flex justify-between mb-4">
                <div>
                  <div className="font-medium">Next Contribution</div>
                  <div className="text-sm text-gray-600">{groups[0]?.nextContributionDate || 'N/A'}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-blue-600">GHS {monthlyContribution}</div>
                  <div className="text-sm text-gray-600">{groups[0]?.daysUntilNextContribution ? `in ${groups[0].daysUntilNextContribution} days` : ''}</div>
                </div>
              </div>
              <div className="bg-blue-100 p-4 rounded-lg border-l-4 border-blue-500">
                <p className="text-sm text-blue-800 flex items-center"><Clock className="h-4 w-4 inline mr-1" /> Don't forget! Set up auto-pay to never miss a contribution.</p>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 mt-6 hover:shadow-lg transition-shadow duration-300">
              <h3 className="font-semibold mb-2">Upcoming Events</h3>
              <ul className="list-disc list-inside text-gray-700">
                <li>Group meeting: {notifications.find(n => n.type === 'meeting')?.time || 'No meetings scheduled.'}</li>
                <li>Next payment: {groups[0]?.nextContributionDate || 'N/A'}</li>
              </ul>
            </div>
          </div>
        )}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800">Notifications</h2>
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div key={notification.id} className="bg-white rounded-xl shadow-md p-4 flex items-start hover:shadow-lg transition-shadow duration-300">
                  <div className="flex-shrink-0 mr-3">
                    {notification.type === 'reminder' && <AlertCircle className="h-5 w-5 text-yellow-500" />}
                    {notification.type === 'approval' && <CheckCircle className="h-5 w-5 text-green-500" />}
                    {notification.type === 'meeting' && <Calendar className="h-5 w-5 text-blue-500" />}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{notification.message}</div>
                    <div className="text-xs text-gray-500 mt-1">{notification.time}</div>
                  </div>
                </div>
              ))}
              {notifications.length === 0 && <div className="text-gray-400 text-center">No notifications yet.</div>}
            </div>
          </div>
        )}
        {activeTab === 'withdrawals' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-3xl font-bold text-gray-800">Withdrawals</h2>
              <button className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-sm" onClick={() => setShowWithdraw(true)}>
                Request Withdrawal
              </button>
            </div>
            <div className="bg-white rounded-xl shadow-md overflow-x-auto hover:shadow-lg transition-shadow duration-300">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {withdrawals.length > 0 ? withdrawals.map((withdrawal, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{withdrawal.date || withdrawal.createdAt?.slice(0,10) || ''}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">GHS {withdrawal.amount}</td>
                      <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={withdrawal.status || 'Completed'} /></td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{withdrawal.reason}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-4 text-center text-gray-500">No withdrawals yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {activeTab === 'chat' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800">Help & Community Chat</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
                <h3 className="text-lg font-semibold mb-4">Contact Admin</h3>
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">Need help with your account or have questions?</p>
                  <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-sm">Send Message</button>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
                <h3 className="text-lg font-semibold mb-4">Group Discussion</h3>
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">Join the group chat to discuss with other members</p>
                  <button className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-transform transform hover:scale-105 shadow-sm">Join Chat</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
// Member Profile Modal (scaffold)
function MemberProfileModal({ member, open, onClose }) {
  if (!open || !member) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-30 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-xs relative">
        <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={onClose}>&times;</button>
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-blue-200 flex items-center justify-center text-3xl font-bold text-blue-700 mb-2">
            {member.name ? member.name.split(' ').map(x => x[0]).join('').toUpperCase().slice(0,2) : (member.email ? member.email[0].toUpperCase() : '?')}
          </div>
          <div className="font-semibold text-lg mb-1">{member.name || 'User'}</div>
          <div className="text-gray-500 text-sm mb-2">{member.email}</div>
          {/* Add more info/activity here in next steps */}
        </div>
        <div className="mt-4 flex justify-end">
          <button className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default SusuDashboard;