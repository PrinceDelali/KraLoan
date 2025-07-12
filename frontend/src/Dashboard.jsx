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
  ArrowLeft,
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
} from 'lucide-react';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="bg-red-100 text-red-700 p-6 rounded-lg shadow-lg max-w-md">
            <h2 className="text-xl font-bold mb-2">Something went wrong!</h2>
            <p>{this.state.error?.message || 'An unexpected error occurred.'}</p>
            <button
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              onClick={() => this.setState({ hasError: false, error: null })}
              aria-label="Try again"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Sidebar Component
const Sidebar = ({ activeTab, setActiveTab, setShowSettings, navigate }) => {
  return (
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
          { id: 'chat', label: 'Help & Chat', icon: MessageCircle },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id);
              setShowSettings(false);
            }}
            className={`w-full flex items-center px-6 py-3.5 text-left text-sm font-medium transition-all duration-200 ${
              activeTab === item.id
                ? 'bg-blue-100 text-blue-700 border-r-4 border-blue-600'
                : 'text-gray-500 hover:bg-blue-50 hover:text-blue-600'
            }`}
            aria-label={`Navigate to ${item.label}`}
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
          aria-label="Open settings"
        >
          <Settings className="h-5 w-5 mr-3" />
          Settings
        </button>
        <button
          onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/login');
          }}
          className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-100 hover:text-red-700 rounded-lg transition-colors mt-2"
          aria-label="Logout"
        >
          <XCircle className="h-5 w-5 mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
};

const SusuDashboard = () => {
  const [showEditMembers, setShowEditMembers] = useState(false);
  const [editGroupId, setEditGroupId] = useState(null);
  const [editMembers, setEditMembers] = useState([]);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showJoinGroup, setShowJoinGroup] = useState(false);
  const [showContribute, setShowContribute] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', description: '', targetAmount: '', monthlyContribution: '' });
  const [joinGroupId, setJoinGroupId] = useState('');
  const [groupSuccessMessage, setGroupSuccessMessage] = useState('');
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
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [groups, setGroups] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [showMemberProfileModal, setShowMemberProfileModal] = useState(false);
  const navigate = useNavigate();

  const formatDate = (date) => {
    if (!date) return 'N/A';
    if (typeof date === 'string') return date.slice(0, 10);
    if (date instanceof Date) return date.toISOString().slice(0, 10);
    return 'N/A';
  };

  const handleDeleteGroup = async (groupId) => {
    if (!window.confirm('Are you sure you want to delete this group? This cannot be undone.')) return;
    try {
      await api.deleteGroup(groupId);
      setGroups(groups.filter((g) => g._id !== groupId));
    } catch (err) {
      alert(err.message || 'Failed to delete group.');
    }
  };

  const handleOpenEditMembers = (group) => {
    setEditGroupId(group._id);
    setEditMembers(group.members || []);
    setShowEditMembers(true);
  };

  const handleRemoveMember = async (userId) => {
    try {
      await api.removeMember(editGroupId, userId);
      setEditMembers(editMembers.filter((m) => m._id !== userId));
      setGroups(
        groups.map((g) =>
          g._id === editGroupId ? { ...g, members: g.members.filter((m) => m._id !== userId) } : g
        )
      );
    } catch (err) {
      alert(err.message || 'Failed to remove member.');
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    setGroupActionError('');
    const targetAmount = Number(newGroup.targetAmount);
    const monthlyContribution = Number(newGroup.monthlyContribution);
    if (isNaN(targetAmount) || targetAmount <= 0 || isNaN(monthlyContribution) || monthlyContribution <= 0) {
      setGroupActionError('Target amount and monthly contribution must be valid positive numbers.');
      return;
    }
    try {
      await api.createGroup({
        ...newGroup,
        targetAmount,
        monthlyContribution,
      });
      setShowCreateGroup(false);
      setNewGroup({ name: '', description: '', targetAmount: '', monthlyContribution: '' });
      const updatedGroups = await api.listGroups();
      setGroups(updatedGroups);
      setGroupSuccessMessage('Group created successfully!');
      setTimeout(() => setGroupSuccessMessage(''), 4000);
    } catch (err) {
      setGroupActionError(err.message || 'Failed to create group.');
    }
  };

  const handleJoinGroup = async (e) => {
    e.preventDefault();
    setGroupActionError('');
    if (!joinGroupId.trim()) {
      setGroupActionError('Invite code is required.');
      return;
    }
    try {
      await api.joinGroupByInviteToken(joinGroupId);
      setShowJoinGroup(false);
      setJoinGroupId('');
      const updatedGroups = await api.listGroups();
      setGroups(updatedGroups);
    } catch (err) {
      setGroupActionError(err.message || 'Invalid invite code. Please try again.');
    }
  };

  const handleContribute = async (e) => {
    e.preventDefault();
    setGroupActionError('');
    const amount = Number(contributionAmount);
    if (isNaN(amount) || amount <= 0) {
      setGroupActionError('Contribution amount must be a valid positive number.');
      return;
    }
    if (!contributionMethod) {
      setGroupActionError('Please select a payment method.');
      return;
    }
    if (!groups[0]?._id) {
      setGroupActionError('No group selected for contribution.');
      return;
    }
    try {
      await api.createTransaction({
        group: groups[0]._id,
        type: 'contribution',
        amount,
        method: contributionMethod,
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

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setGroupActionError('');
    const amount = Number(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      setGroupActionError('Withdrawal amount must be a valid positive number.');
      return;
    }
    if (!withdrawMethod || !withdrawReason) {
      setGroupActionError('Withdrawal method and reason are required.');
      return;
    }
    if (!groups[0]?._id) {
      setGroupActionError('No group selected for withdrawal.');
      return;
    }
    try {
      await api.createTransaction({
        group: groups[0]._id,
        type: 'withdrawal',
        amount,
        method: withdrawMethod,
        reason: withdrawReason,
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

  const handleProfileSave = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!profileData?.name || !profileData?.email) {
      setError('Name and email are required!');
      return;
    }
    if (!emailRegex.test(profileData.email)) {
      setError('Please enter a valid email address.');
      return;
    }
    try {
      setIsLoading(true);
      setError('');
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user?.id) throw new Error('User ID not found in localStorage');
      await api.updateProfile(user.id, profileData);
      alert('Profile updated successfully!');
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    if (!token || !user) {
      navigate('/login');
      return;
    }
    let isMounted = true;
    setIsLoading(true);
    setError('');
    Promise.all([
      api.getProfile(user.id).catch((err) => {
        console.error('Error fetching profile:', err);
        return { name: '', email: user.email || '', phone: '', address: '' };
      }),
      api.listGroups().catch((err) => {
        console.error('Error fetching groups:', err);
        return [];
      }),
      api.listTransactions().catch((err) => {
        console.error('Error fetching transactions:', err);
        return [];
      }),
    ])
      .then(([profile, groups, transactions]) => {
        if (isMounted) {
          setProfileData(profile || { name: '', email: user.email || '', phone: '', address: '' });
          setGroups(groups || []);
          setTransactions(transactions || []);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error('Error in useEffect:', err);
          setError(err.message || 'Failed to load dashboard data.');
          setIsLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const totalSaved = transactions
    .filter((t) => t.type === 'contribution' && t.status === 'completed')
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  const monthlyContribution = groups[0]?.monthlyContribution || 0;
  const groupTarget = groups[0]?.targetAmount || 0;
  const progressPercentage = groupTarget ? Math.round((totalSaved / groupTarget) * 100) : 0;

  const contributionHistory = transactions.filter((t) => t.type === 'contribution');
  const withdrawals = transactions.filter((t) => t.type === 'withdrawal');

  const notifications = [
    { id: 1, type: 'reminder', message: 'Monthly contribution due soon', time: '2 hours ago' },
    { id: 2, type: 'approval', message: 'Your withdrawal request has been approved', time: '1 day ago' },
    { id: 3, type: 'meeting', message: 'Group meeting scheduled soon', time: '2 days ago' },
  ];

  if (isLoading) return <div className="flex justify-center items-center min-h-screen">Loading dashboard...</div>;
  if (error) return <div className="flex justify-center items-center min-h-screen text-red-600">{error}</div>;

  const StatusBadge = ({ status }) => {
    const styles = {
      Paid: 'bg-green-100 text-green-800',
      Pending: 'bg-yellow-100 text-yellow-800',
      Missed: 'bg-red-100 text-red-800',
      Approved: 'bg-blue-100 text-blue-800',
      Completed: 'bg-green-100 text-green-800',
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          styles[status] || 'bg-gray-100 text-gray-800'
        }`}
      >
        {status || 'Unknown'}
      </span>
    );
  };

  const handleProfileUpdate = (field, value) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value || '',
    }));
  };

  const renderSettings = () => {
    try {
      const safeProfileData = profileData && typeof profileData === 'object' ? profileData : { name: '', email: '', phone: '', address: '' };
      return (
        <div className="flex-1 p-8">
          <div className="space-y-8 bg-gradient-to-br from-blue-50 via-purple-50 to-white rounded-2xl shadow-2xl p-8">
            <div className="flex flex-row items-center mb-2">
              <button
                onClick={() => setShowSettings(false)}
                className="mr-3 p-2 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                aria-label="Back to dashboard"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <div className="flex flex-col items-center flex-1">
                <div className="text-5xl mb-2">⚙️</div>
                <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-purple-600">
                  Settings
                </h2>
              </div>
            </div>

            <div className="flex space-x-2 bg-gradient-to-r from-blue-100 via-purple-100 to-blue-50 p-2 rounded-xl shadow-inner">
              {['profile', 'security', 'payment'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSettingsTab(tab)}
                  className={`px-5 py-2 rounded-lg text-base font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 shadow-sm ${
                    settingsTab === tab
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white scale-105 shadow-lg'
                      : 'bg-white text-blue-700 hover:bg-blue-50 hover:text-purple-600'
                  }`}
                  aria-label={`Switch to ${tab} settings`}
                >
                  {tab === 'profile' && <User className="inline h-5 w-5 mr-1 align-text-bottom" />}
                  {tab === 'security' && <Shield className="inline h-5 w-5 mr-1 align-text-bottom" />}
                  {tab === 'payment' && <CreditCard className="inline h-5 w-5 mr-1 align-text-bottom" />}
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
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
                      value={safeProfileData.name || ''}
                      onChange={(e) => handleProfileUpdate('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                      aria-required="true"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={safeProfileData.email || ''}
                      onChange={(e) => handleProfileUpdate('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                      aria-required="true"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={safeProfileData.phone || ''}
                      onChange={(e) => handleProfileUpdate('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <textarea
                      value={safeProfileData.address || ''}
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
                    onClick={handleProfileSave}
                    aria-label="Update profile"
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
                      aria-required="true"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                    <input
                      type="password"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      aria-required="true"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      aria-required="true"
                    />
                  </div>
                  <button
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                    onClick={() => {
                      alert('Password changed (demo only)!');
                    }}
                    aria-label="Change password"
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
                    <p className="text-sm text-gray-600">No payment methods added yet.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    } catch (err) {
      console.error('Error in renderSettings:', err);
      throw err;
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-100 flex font-sans">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setShowSettings={setShowSettings}
          navigate={navigate}
        />
        {showSettings ? (
          <div className="flex-1">
            {renderSettings()}
          </div>
        ) : (
          <div className="flex-1 p-8 relative">
            {/* Modals */}
            {showContribute && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
                <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                  <h3 className="text-xl font-bold mb-4">Make Contribution</h3>
                  <form className="space-y-5" onSubmit={handleContribute}>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Amount (GHS)</label>
                      <input
                        type="number"
                        min="1"
                        placeholder="e.g. 100"
                        value={contributionAmount}
                        onChange={(e) => setContributionAmount(e.target.value)}
                        className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition"
                        required
                        aria-required="true"
                      />
                      <p className="text-xs text-gray-500 mt-1">Enter the amount you wish to contribute.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                      <select
                        value={contributionMethod}
                        onChange={(e) => setContributionMethod(e.target.value)}
                        className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition"
                        required
                        aria-required="true"
                      >
                        <option value="">Select a method</option>
                        <option value="Mobile Money">Mobile Money</option>
                        <option value="Card">Card</option>
                        <option value="Bank">Bank</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        Choose your preferred payment method for this contribution.
                      </p>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-3">
                      <DollarSign className="h-6 w-6 text-blue-500" />
                      <div>
                        <div className="text-sm text-gray-700">You are about to contribute</div>
                        <div className="font-bold text-lg text-blue-700">GHS {contributionAmount || 0}</div>
                        <div className="text-xs text-gray-500">Method: {contributionMethod || '-'}</div>
                      </div>
                    </div>
                    {groupActionError && (
                      <div className="text-red-600 text-sm flex items-center">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        {groupActionError}
                      </div>
                    )}
                    <div className="flex justify-end space-x-3 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowContribute(false);
                          setContributionAmount('');
                          setContributionMethod('');
                        }}
                        className="px-5 py-2 rounded-lg bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300 transition"
                        aria-label="Cancel contribution"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={
                          !contributionAmount ||
                          !contributionMethod ||
                          Number(contributionAmount) <= 0 ||
                          isLoading
                        }
                        className={`px-5 py-2 rounded-lg font-semibold transition ${
                          !contributionAmount ||
                          !contributionMethod ||
                          Number(contributionAmount) <= 0 ||
                          isLoading
                            ? 'bg-green-300 text-white cursor-not-allowed'
                            : 'bg-green-600 text-white hover:bg-green-700 hover:scale-105 shadow-sm'
                        }`}
                        aria-label="Submit contribution"
                      >
                        {isLoading ? (
                          <span className="flex items-center">
                            <Loader2 className="animate-spin h-4 w-4 mr-2" />
                            Processing...
                          </span>
                        ) : (
                          'Submit Contribution'
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
            {showWithdraw && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
                <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                  <h3 className="text-xl font-bold mb-4">Request Withdrawal</h3>
                  <form className="space-y-5" onSubmit={handleWithdraw}>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Amount (GHS)</label>
                      <input
                        type="number"
                        min="1"
                        placeholder="e.g. 100"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition"
                        required
                        aria-required="true"
                      />
                      <p className="text-xs text-gray-500 mt-1">Enter the amount you wish to withdraw.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Withdrawal Method</label>
                      <input
                        type="text"
                        placeholder="e.g. Bank, Mobile Money"
                        value={withdrawMethod}
                        onChange={(e) => setWithdrawMethod(e.target.value)}
                        className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition"
                        required
                        aria-required="true"
                      />
                      <p className="text-xs text-gray-500 mt-1">Specify how you want to receive your funds.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                      <textarea
                        placeholder="Reason for withdrawal"
                        value={withdrawReason}
                        onChange={(e) => setWithdrawReason(e.target.value)}
                        className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition"
                        required
                        aria-required="true"
                      />
                      <p className="text-xs text-gray-500 mt-1">Provide a reason for your withdrawal request.</p>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 flex items-center gap-3">
                      <ArrowDownToLine className="h-6 w-6 text-purple-500" />
                      <div>
                        <div className="text-sm text-gray-700">You are requesting to withdraw</div>
                        <div className="font-bold text-lg text-purple-700">GHS {withdrawAmount || 0}</div>
                        <div className="text-xs text-gray-500">Method: {withdrawMethod || '-'}</div>
                      </div>
                    </div>
                    {groupActionError && (
                      <div className="text-red-600 text-sm flex items-center">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        {groupActionError}
                      </div>
                    )}
                    <div className="flex justify-end space-x-3 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowWithdraw(false);
                          setWithdrawAmount('');
                          setWithdrawMethod('');
                          setWithdrawReason('');
                        }}
                        className="px-5 py-2 rounded-lg bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300 transition"
                        aria-label="Cancel withdrawal"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={
                          !withdrawAmount ||
                          !withdrawMethod ||
                          !withdrawReason ||
                          Number(withdrawAmount) <= 0 ||
                          isLoading
                        }
                        className={`px-5 py-2 rounded-lg font-semibold transition ${
                          !withdrawAmount ||
                          !withdrawMethod ||
                          !withdrawReason ||
                          Number(withdrawAmount) <= 0 ||
                          isLoading
                            ? 'bg-green-300 text-white cursor-not-allowed'
                            : 'bg-green-600 text-white hover:bg-green-700 hover:scale-105 shadow-sm'
                        }`}
                        aria-label="Submit withdrawal"
                      >
                        {isLoading ? (
                          <span className="flex items-center">
                            <Loader2 className="animate-spin h-4 w-4 mr-2" />
                            Processing...
                          </span>
                        ) : (
                          'Request Withdrawal'
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
            {showCreateGroup && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 transition-opacity duration-300">
                <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg transform transition-all duration-300">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center">
                      <Users className="h-7 w-7 text-blue-600 mr-3" />
                      <h3 className="text-2xl font-bold text-gray-800">Create a New Group</h3>
                    </div>
                    <button
                      onClick={() => setShowCreateGroup(false)}
                      className="text-gray-400 hover:text-gray-600"
                      aria-label="Close create group modal"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                  <form className="space-y-5" onSubmit={handleCreateGroup}>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
                      <input
                        type="text"
                        placeholder="e.g., Family Savings"
                        value={newGroup.name}
                        onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                        className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition"
                        required
                        aria-required="true"
                      />
                      <p className="text-xs text-gray-500 mt-1">Enter a unique name for your group.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Target Amount (GHS)</label>
                        <input
                          type="number"
                          min="1"
                          placeholder="e.g., 5000"
                          value={newGroup.targetAmount}
                          onChange={(e) => setNewGroup({ ...newGroup, targetAmount: e.target.value })}
                          className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition"
                          required
                          aria-required="true"
                        />
                        <p className="text-xs text-gray-500 mt-1">Total amount the group aims to save.</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Monthly Contribution (GHS)
                        </label>
                        <input
                          type="number"
                          min="1"
                          placeholder="e.g., 500"
                          value={newGroup.monthlyContribution}
                          onChange={(e) => setNewGroup({ ...newGroup, monthlyContribution: e.target.value })}
                          className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition"
                          required
                          aria-required="true"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          How much each member should contribute monthly.
                        </p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        placeholder="A brief description of the group's purpose"
                        value={newGroup.description}
                        onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                        className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition"
                        rows="3"
                      />
                      <p className="text-xs text-gray-500 mt-1">Describe the group's goal or rules (optional).</p>
                    </div>
                    {groupActionError && (
                      <div className="text-red-600 text-sm flex items-center">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        {groupActionError}
                      </div>
                    )}
                    <div className="flex justify-end space-x-4 pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setShowCreateGroup(false);
                          setNewGroup({ name: '', description: '', targetAmount: '', monthlyContribution: '' });
                        }}
                        className="px-6 py-2.5 rounded-lg bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300 transition"
                        aria-label="Cancel create group"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={
                          !newGroup.name ||
                          !newGroup.targetAmount ||
                          !newGroup.monthlyContribution ||
                          Number(newGroup.targetAmount) <= 0 ||
                          Number(newGroup.monthlyContribution) <= 0 ||
                          isLoading
                        }
                        className={`px-6 py-2.5 rounded-lg font-semibold transition ${
                          !newGroup.name ||
                          !newGroup.targetAmount ||
                          !newGroup.monthlyContribution ||
                          Number(newGroup.targetAmount) <= 0 ||
                          Number(newGroup.monthlyContribution) <= 0 ||
                          isLoading
                            ? 'bg-green-300 text-white cursor-not-allowed'
                            : 'bg-green-600 text-white hover:bg-green-700 hover:scale-105 shadow-sm'
                        }`}
                        aria-label="Create group"
                      >
                        {isLoading ? (
                          <span className="flex items-center">
                            <Loader2 className="animate-spin h-4 w-4 mr-2" />
                            Creating...
                          </span>
                        ) : (
                          'Create Group'
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
            {showJoinGroup && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 transition-opacity duration-300">
                <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center">
                      <LogIn className="h-7 w-7 text-blue-600 mr-3" />
                      <h3 className="text-2xl font-bold text-gray-800">Join an Existing Group</h3>
                    </div>
                    <button
                      onClick={() => setShowJoinGroup(false)}
                      className="text-gray-400 hover:text-gray-600"
                      aria-label="Close join group modal"
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                  <form className="space-y-5" onSubmit={handleJoinGroup}>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Invite Code</label>
                      <input
                        type="text"
                        placeholder="Enter the invite code you received"
                        value={joinGroupId}
                        onChange={(e) => setJoinGroupId(e.target.value)}
                        className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition"
                        required
                        aria-required="true"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Paste the invite code you received from the group admin.
                      </p>
                    </div>
                    {groupActionError && (
                      <div className="text-red-600 text-sm flex items-center">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        {groupActionError}
                      </div>
                    )}
                    <div className="flex justify-end space-x-4 pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setShowJoinGroup(false);
                          setJoinGroupId('');
                        }}
                        className="px-6 py-2.5 rounded-lg bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300 transition"
                        aria-label="Cancel join group"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={!joinGroupId || isLoading}
                        className={`px-6 py-2.5 rounded-lg font-semibold transition ${
                          !joinGroupId || isLoading
                            ? 'bg-blue-300 text-white cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105 shadow-sm'
                        }`}
                        aria-label="Join group"
                      >
                        {isLoading ? (
                          <span className="flex items-center">
                            <Loader2 className="animate-spin h-4 w-4 mr-2" />
                            Joining...
                          </span>
                        ) : (
                          'Join Group'
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
            {showEditMembers && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                  <h3 className="text-xl font-bold mb-4">Edit Members</h3>
                  <div className="space-y-3">
                    {editMembers.map((member) => (
                      <div key={member._id} className="flex items-center justify-between">
                        <div>{member.name || member.email || 'Unknown'}</div>
                        <button
                          onClick={() => handleRemoveMember(member._id)}
                          className="text-red-600 hover:text-red-800"
                          aria-label={`Remove ${member.name || member.email || 'member'}`}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end space-x-3 mt-4">
                    <button
                      onClick={() => setShowEditMembers(false)}
                      className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300 transition"
                      aria-label="Cancel edit members"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
            <MemberProfileModal
              member={selectedMember}
              open={showMemberProfileModal}
              onClose={() => setShowMemberProfileModal(false)}
            />
            {/* Success Message */}
            {groupSuccessMessage && (
              <div className="mb-6 flex items-center justify-between bg-green-50 border border-green-400 text-green-800 px-6 py-3 rounded-lg shadow">
                <span className="flex items-center">
                  <svg
                    className="h-6 w-6 mr-2 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {groupSuccessMessage}
                </span>
                <button
                  onClick={() => setGroupSuccessMessage('')}
                  aria-label="Dismiss success message"
                  className="text-green-600 hover:text-green-900 ml-4 font-bold"
                >
                  ×
                </button>
              </div>
            )}
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800">
                Welcome, {profileData?.email || JSON.parse(localStorage.getItem('user'))?.email || 'User'}!
              </h2>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowCreateGroup(true)}
                  className="bg-green-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-green-700 transition-transform transform hover:scale-105 shadow-sm"
                  aria-label="Create new group"
                >
                  Create Group
                </button>
                <button
                  onClick={() => setShowJoinGroup(true)}
                  className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-sm"
                  aria-label="Join existing group"
                >
                  Join Group
                </button>
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
                    <button
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-transform transform hover:scale-105"
                      onClick={() => setShowContribute(true)}
                      aria-label="Make contribution"
                    >
                      Make Contribution
                    </button>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-700 h-4 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
                  <div className="flex justify-between items-center mb-4">
                    <div className="font-semibold text-lg">Recent Transactions</div>
                    <button
                      className="text-blue-600 font-semibold hover:underline"
                      onClick={() => setActiveTab('history')}
                      aria-label="View all transactions"
                    >
                      View All
                    </button>
                  </div>
                  <div className="divide-y">
                    {transactions.slice(0, 5).map((tx, idx) => (
                      <div key={idx} className="flex justify-between py-2">
                        <div>
                          <div className="font-medium">{tx.type === 'contribution' ? 'Contribution' : 'Withdrawal'}</div>
                          <div className="text-xs text-gray-500">{formatDate(tx.date || tx.createdAt)}</div>
                        </div>
                        <div className={tx.type === 'contribution' ? 'text-green-700' : 'text-red-700'}>
                          {tx.type === 'contribution' ? '+' : '-'}GHS {tx.amount || 0}
                        </div>
                        <StatusBadge status={tx.status || 'Completed'} />
                      </div>
                    ))}
                    {transactions.length === 0 && (
                      <div className="text-gray-400 py-4 text-center">No transactions yet.</div>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                  <button
                    className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-transform transform hover:scale-105 shadow-sm"
                    onClick={() => setShowCreateGroup(true)}
                    aria-label="Create new group"
                  >
                    Create Group
                  </button>
                  <button
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-sm"
                    onClick={() => setShowJoinGroup(true)}
                    aria-label="Join existing group"
                  >
                    Join Group
                  </button>
                  <button
                    className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-transform transform hover:scale-105 shadow-sm"
                    onClick={() => setShowWithdraw(true)}
                    aria-label="Request withdrawal"
                  >
                    Request Withdrawal
                  </button>
                </div>
              </div>
            )}
            {activeTab === 'savings' && (
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">
                    My Savings Groups
                  </h2>
                  <button
                    className="bg-gradient-to-r from-green-500 to-green-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-green-800 transition-transform transform hover:scale-105 shadow-lg flex items-center"
                    onClick={() => setShowCreateGroup(true)}
                    aria-label="Create new group"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Create New Group
                  </button>
                </div>
                {groups.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {groups.map((group) => (
                      <div
                        key={group._id}
                        className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-fade-in"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800">{group.name}</h3>
                            <p className="text-sm text-gray-500 mt-1">{group.description || 'No description'}</p>
                            <div className="mt-2 text-sm text-gray-600">
                              <span>Target: GHS {group.targetAmount || 0}</span> |{' '}
                              <span>Monthly: GHS {group.monthlyContribution || 0}</span>
                            </div>
                          </div>
                          <div className="flex space-x-3">
                            <button
                              onClick={() => handleOpenEditMembers(group)}
                              className="text-blue-600 hover:text-blue-800 transition-transform transform hover:scale-110"
                              aria-label={`Edit members of ${group.name}`}
                            >
                              <Edit3 className="h-6 w-6" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteGroup(group._id);
                              }}
                              className="text-red-600 hover:text-red-800 transition-transform transform hover:scale-110"
                              aria-label={`Delete ${group.name}`}
                            >
                              <XCircle className="h-6 w-6" />
                            </button>
                          </div>
                        </div>
                        <div className="mt-4">
                          <div className="text-sm font-medium text-gray-700">Members: {group.members?.length || 0}</div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-green-500 h-2.5 rounded-full"
                              style={{ width: `${Math.min((group.totalSaved / group.targetAmount) * 100, 100)}%` }}
                            />
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Saved: GHS {group.totalSaved || 0} of {group.targetAmount || 0}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-xl shadow-md p-8 text-center animate-slide-up">
                    <PiggyBank className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">No groups yet. Start by creating or joining a savings group!</p>
                    <div className="mt-6 flex justify-center space-x-4">
                      <button
                        className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-transform transform hover:scale-105"
                        onClick={() => setShowCreateGroup(true)}
                        aria-label="Create new group"
                      >
                        Create Group
                      </button>
                      <button
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-transform transform hover:scale-105"
                        onClick={() => setShowJoinGroup(true)}
                        aria-label="Join existing group"
                      >
                        Join Group
                      </button>
                    </div>
                  </div>
                )}
              </div>
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
                      {contributionHistory.length > 0 ? (
                        contributionHistory.map((contribution, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatDate(contribution.date || contribution.createdAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              GHS {contribution.amount || 0}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <StatusBadge status={contribution.status || 'Completed'} />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {contribution.method || 'N/A'}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                            No contribution history yet.
                          </td>
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
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <div className="font-medium">Next Contribution</div>
                      <div className="text-sm text-gray-600">{groups[0]?.nextContributionDate || 'N/A'}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-blue-600">GHS {monthlyContribution}</div>
                      <div className="text-sm text-gray-600">
                        {groups[0]?.daysUntilNextContribution
                          ? `in ${groups[0].daysUntilNextContribution} days`
                          : ''}
                      </div>
                    </div>
                  </div>
                  <div className="bg-blue-100 p-4 rounded-lg border-l-4 border-blue-500">
                    <p className="text-sm text-blue-800 flex items-center">
                      <Clock className="h-4 w-4 inline mr-1" /> Don't forget! Set up auto-pay to never
                      miss a contribution.
                    </p>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-md p-6 mt-6 hover:shadow-lg transition-shadow duration-300">
                  <h3 className="font-semibold mb-2">Upcoming Events</h3>
                  <ul className="list-disc list-inside text-gray-700">
                    <li>
                      Group meeting: {notifications.find((n) => n.type === 'meeting')?.time || 'No meetings scheduled.'}
                    </li>
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
                    <div
                      key={notification.id}
                      className="bg-white rounded-xl shadow-md p-4 flex items-start hover:shadow-lg transition-shadow duration-300"
                    >
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
                  {notifications.length === 0 && (
                    <div className="text-gray-400 text-center">No notifications yet.</div>
                  )}
                </div>
              </div>
            )}
            {activeTab === 'withdrawals' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-3xl font-bold text-gray-800">Withdrawals</h2>
                  <button
                    className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-sm"
                    onClick={() => setShowWithdraw(true)}
                    aria-label="Request withdrawal"
                  >
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
                      {withdrawals.length > 0 ? (
                        withdrawals.map((withdrawal, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatDate(withdrawal.date || withdrawal.createdAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              GHS {withdrawal.amount || 0}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <StatusBadge status={withdrawal.status || 'Completed'} />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {withdrawal.reason || 'N/A'}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                            No withdrawals yet.
                          </td>
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
                      <button
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-sm"
                        aria-label="Contact admin"
                      >
                        Send Message
                      </button>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
                    <h3 className="text-lg font-semibold mb-4">Group Discussion</h3>
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600">Join the group chat to discuss with other members</p>
                      <button
                        className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-transform transform hover:scale-105 shadow-sm"
                        aria-label="Join group chat"
                      >
                        Join Chat
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

// Member Profile Modal
function MemberProfileModal({ member, open, onClose }) {
  if (!open || !member) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-30 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-xs relative">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
          onClick={onClose}
          aria-label="Close member profile"
        >
          <X className="h-6 w-6" />
        </button>
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-blue-200 flex items-center justify-center text-3xl font-bold text-blue-700 mb-2">
            {member.name
              ? member.name
                  .split(' ')
                  .map((x) => x[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)
              : member.email
              ? member.email[0].toUpperCase()
              : '?'}
          </div>
          <div className="font-semibold text-lg mb-1">{member.name || 'User'}</div>
          <div className="text-gray-500 text-sm mb-2">{member.email || 'N/A'}</div>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={onClose}
            aria-label="Close member profile"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default SusuDashboard;