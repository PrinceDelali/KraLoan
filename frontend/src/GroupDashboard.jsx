import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from './api';
import GroupMessagesBoard from './components/GroupMessagesBoard';
import GroupLoansBoard from './components/GroupLoansBoard';
import ContributionModal from './components/ContributionModal';
import {
  Users,
  CreditCard,
  BarChart as BarChartIcon,
  FileText,
  Settings as SettingsIcon,
  Bell,
  DollarSign,
  TrendingUp,
  Home,
  ArrowLeft,
  AlertCircle,
  BookOpen,
  PieChart,
  UserCheck,
  UserPlus,
  UserMinus,
  UserCog,
  UserCircle,
  FileBarChart2,
  Wallet,
  ClipboardList,
  CheckCircle,
  XCircle,
  MessageCircle,
} from 'lucide-react';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

const SIDEBAR_TABS = [
  { id: 'overview', label: 'Overview', icon: Home },
  { id: 'members', label: 'Members', icon: Users },
  { id: 'loans', label: 'Loans', icon: DollarSign },
  { id: 'contributions', label: 'Contributions', icon: TrendingUp },
  { id: 'repayments', label: 'Repayments', icon: CreditCard },
  { id: 'requests', label: 'Requests', icon: Bell },
  { id: 'chat', label: 'Chat/Forum', icon: MessageCircle },
  { id: 'wallet', label: 'Wallet/Account', icon: Wallet },
  { id: 'reports', label: 'Reports', icon: BarChartIcon },
  { id: 'settings', label: 'Settings', icon: SettingsIcon },
];

// Helper for member avatar/initials
function MemberAvatar({ member, size = 32 }) {
  if (member.avatar) {
    return <img src={member.avatar} alt={member.name || member.email} className={`rounded-full`} style={{ width: size, height: size, objectFit: 'cover' }} />;
  }
  const initials = (member.name || member.email || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  return <div className="rounded-full bg-blue-200 flex items-center justify-center font-bold text-blue-700" style={{ width: size, height: size, fontSize: size / 2 }}>{initials}</div>;
}

const PAYSTACK_PUBLIC_KEY = 'pk_live_1e438d1597ef92d47f06638eb6b04b4a60f0801d';

export default function GroupDashboard() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  // --- Move these hooks to the top level ---
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [contributionAmount, setContributionAmount] = useState('');
  const [contributionLoading, setContributionLoading] = useState(false);
  const [contributionError, setContributionError] = useState('');
  const [contributionSuccess, setContributionSuccess] = useState('');

  // Add payment method state
  const [contributionMethod, setContributionMethod] = useState('');

  // Add paystackReady state
  const [paystackReady, setPaystackReady] = React.useState(false);

  // Compute recent activity from real data
  const recentActivity = [];
  if (group && Array.isArray(group.transactions)) {
    group.transactions.forEach(tx => {
      if (tx.type === 'contribution') recentActivity.push({ type: 'contribution', ...tx });
    });
  }
  if (group && Array.isArray(group.loans)) {
    group.loans.forEach(loan => {
      recentActivity.push({ type: 'loan', ...loan });
    });
  }
  recentActivity.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));

  useEffect(() => {
    (async () => {
      try {
        const group = await api.getGroupById(groupId);
        if (!group) {
          setError('Group not found.');
        } else if (!Array.isArray(group.members) || !group.members.some(m =>
          typeof m === 'string' ? m === currentUser._id : (m._id === currentUser._id || m.id === currentUser._id)
        )) {
          setError('You are not a member of this group.');
        } else {
          setGroup(group);
        }
      } catch (err) {
        setError('Failed to fetch group info.');
      } finally {
        setLoading(false);
      }
    })();
  }, [groupId, currentUser._id]);

  // Improved script loader
  React.useEffect(() => {
    if (window.PaystackPop && window.PaystackPop.setup) {
      setPaystackReady(true);
      return;
    }
    const existingScript = document.querySelector('script[src="https://js.paystack.co/v1/inline.js"]');
    if (existingScript) {
      existingScript.onload = () => setPaystackReady(true);
      if (existingScript.readyState === 'complete') setPaystackReady(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.onload = () => {
      setPaystackReady(true);
      console.log('[Paystack] Script loaded');
    };
    script.onerror = () => {
      setPaystackReady(false);
      console.error('[Paystack] Failed to load script');
    };
    document.body.appendChild(script);
  }, []);

  if (loading) return <div className="p-12 text-center">Loading group dashboard...</div>;
  if (error) return <div className="p-12 text-center text-red-500">{error}</div>;

  const isAdmin = group.admins.includes(currentUser._id);

  // --- Sidebar ---
  function Sidebar() {
    return (
      <aside className="w-64 bg-white border-r border-gray-100 min-h-screen flex flex-col py-8 px-4 shadow-md">
        <button
          className="mb-8 flex items-center text-blue-600 hover:underline text-sm"
          onClick={() => navigate('/dashboard/savings')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to My Groups
        </button>
        <div className="mb-8 text-center">
          <div className="text-2xl font-bold text-blue-800 mb-1">{group.name}</div>
          <div className="text-xs text-gray-500">Group Dashboard</div>
        </div>
        <nav className="flex-1 flex flex-col gap-2">
          {SIDEBAR_TABS.map(tab => (
            <button
              key={tab.id}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg text-left font-medium transition-colors duration-200 ${
                activeTab === tab.id
                  ? 'bg-blue-100 text-blue-700 shadow'
                  : 'text-gray-600 hover:bg-blue-50 hover:text-blue-700'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon className="h-5 w-5" />
              {tab.label}
            </button>
          ))}
        </nav>
      </aside>
    );
  }

  // --- Main Content ---
  function renderContent() {
    switch (activeTab) {
      case 'overview':
        // Prepare chart data
        const contributions = Array.isArray(group.transactions) ? group.transactions.filter(tx => tx.type === 'contribution') : [];
        const chartData = contributions.reduce((acc, tx) => {
          const date = tx.date ? new Date(tx.date).toLocaleDateString() : 'Unknown';
          const found = acc.find(d => d.date === date);
          if (found) found.amount += tx.amount;
          else acc.push({ date, amount: tx.amount });
          return acc;
        }, []);
        return (
          <div className="space-y-8">
            {/* Make Contribution Button */}
            <div className="flex justify-end mb-4">
              <button
                className="bg-blue-600 text-white px-6 py-2 rounded font-bold hover:bg-blue-700 shadow"
                onClick={() => setShowContributeModal(true)}
              >
                Make Contribution
              </button>
            </div>
            {/* Contribution Modal */}
            <ContributionModal
              open={showContributeModal}
              onClose={() => setShowContributeModal(false)}
              group={group}
              user={currentUser}
              onSuccess={updatedGroup => setGroup(updatedGroup)}
            />
            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
                <Users className="h-8 w-8 text-blue-600 mb-2" />
                <div className="text-2xl font-bold text-blue-700">{group.members?.length || 0}</div>
                <div className="text-gray-600 text-sm">Members</div>
              </div>
              <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
                <TrendingUp className="h-8 w-8 text-green-600 mb-2" />
                <div className="text-2xl font-bold text-green-700">GHS {group.totalSavings || 0}</div>
                <div className="text-gray-600 text-sm">Total Savings</div>
              </div>
              <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
                <DollarSign className="h-8 w-8 text-purple-600 mb-2" />
                <div className="text-2xl font-bold text-purple-700">GHS {group.fundBalance || 0}</div>
                <div className="text-gray-600 text-sm">Fund Balance</div>
              </div>
              <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center">
                <CreditCard className="h-8 w-8 text-yellow-600 mb-2" />
                <div className="text-2xl font-bold text-yellow-700">{group.activeLoans || 0}</div>
                <div className="text-gray-600 text-sm">Active Loans</div>
              </div>
            </div>
            {/* Group Name & Logo */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-full bg-blue-200 flex items-center justify-center text-3xl font-bold text-blue-700">
                {/* Placeholder for logo */}
                {group.logo ? <img src={group.logo} alt="Group Logo" className="w-16 h-16 rounded-full object-cover" /> : group.name[0]}
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-800">{group.name}</div>
                <div className="text-gray-500 text-sm">Group Overview</div>
              </div>
            </div>
            {/* Contributions Chart */}
            <div className="bg-white rounded-xl shadow p-6 mb-8">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">Contributions Over Time <BarChartIcon className="h-5 w-5 text-blue-500" /></h3>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="amount" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-gray-400 text-center">No contributions yet.</div>
              )}
            </div>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-blue-50 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-blue-700 mb-2">{group.members?.length || 0}</div>
                <div className="text-gray-600">Total Members</div>
              </div>
              <div className="bg-green-50 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-green-700 mb-2">GHS {group.totalSavings || 0}</div>
                <div className="text-gray-600">Total Savings</div>
              </div>
              <div className="bg-purple-50 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-purple-700 mb-2">GHS {group.fundBalance || 0}</div>
                <div className="text-gray-600">Fund Balance</div>
              </div>
              <div className="bg-yellow-50 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-yellow-700 mb-2">{group.activeLoans || 0}</div>
                <div className="text-gray-600">Active Loans</div>
              </div>
              <div className="bg-green-100 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-green-800 mb-2">{group.repaidLoans || 0}</div>
                <div className="text-gray-600">Repaid Loans</div>
              </div>
              <div className="bg-red-50 rounded-xl p-6 text-center">
                <div className="text-3xl font-bold text-red-700 mb-2">{group.defaultedLoans || 0}</div>
                <div className="text-gray-600">Defaulted Loans</div>
              </div>
            </div>
            {/* Goals & Status */}
            <div className="mb-8">
              <h3 className="font-semibold text-lg mb-2">Goals & Status</h3>
              <div className="bg-white rounded-lg shadow p-4 min-h-[80px] text-gray-700">
                {group.targetAmount ? (
                  <div>Group target: <b>GHS {group.targetAmount}</b>. Progress: <b>{group.totalSavings || 0} / {group.targetAmount}</b></div>
                ) : 'No group goal set.'}
              </div>
            </div>
            {/* Recent Activities */}
            <div className="mb-8">
              <h3 className="font-semibold text-lg mb-2">Recent Activities</h3>
              <div className="bg-white rounded-lg shadow p-4 min-h-[80px] text-gray-700">
                {recentActivity.length > 0 ? (
                  <ul className="divide-y divide-gray-100">
                    {recentActivity.slice(0, 8).map((item, i) => (
                      <li key={i} className="py-2 flex items-center gap-2">
                        {item.type === 'contribution' ? (
                          <span className="text-blue-700 font-semibold">[Contribution]</span>
                        ) : (
                          <span className="text-yellow-700 font-semibold">[Loan]</span>
                        )}
                        <span className="ml-2">{item.user?.name || item.user?.email || item.requester?.name || item.requester?.email || 'User'}: {item.amount ? `GHS ${item.amount}` : ''} {item.status ? `(${item.status})` : ''}</span>
                        <span className="ml-2 text-xs text-gray-400">{new Date(item.date || item.createdAt).toLocaleDateString()}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-gray-400">No recent activity yet.</div>
                )}
              </div>
            </div>
          </div>
        );
      case 'members':
        return (
          <div className="p-8">
            <h2 className="text-2xl font-bold mb-4">Members</h2>
            {isAdmin && (
              <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700"
                  onClick={() => alert('Add Member modal coming soon!')}
                >
                  + Add Member
                </button>
                {group.inviteToken && (
                  <button
                    className="bg-green-100 text-green-700 px-4 py-2 rounded font-semibold hover:bg-green-200"
                    onClick={() => {navigator.clipboard.writeText(`${window.location.origin}/register?inviteToken=${group.inviteToken}`); alert('Invite link copied!')}}
                  >
                    Copy Invite Link
                  </button>
                )}
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg shadow">
                <thead>
                  <tr className="bg-blue-50">
                    <th className="px-4 py-2 text-left text-xs font-bold text-blue-700">Name</th>
                    <th className="px-4 py-2 text-left text-xs font-bold text-blue-700">Phone</th>
                    <th className="px-4 py-2 text-left text-xs font-bold text-blue-700">Status</th>
                    <th className="px-4 py-2 text-left text-xs font-bold text-blue-700">Role</th>
                    <th className="px-4 py-2 text-left text-xs font-bold text-blue-700">Contributions</th>
                    <th className="px-4 py-2 text-left text-xs font-bold text-blue-700">Loans</th>
                    <th className="px-4 py-2 text-left text-xs font-bold text-blue-700">Repayment</th>
                    {isAdmin && <th className="px-4 py-2 text-left text-xs font-bold text-blue-700">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(group.members) && group.members.length > 0 ? group.members.map(m => {
                    const isAdminMember = Array.isArray(group.admins) && group.admins.some(a => (a._id || a.id) === (m._id || m.id));
                    // You may want to fetch contributions/loans/repayment per member from backend in future
                    return (
                      <tr key={m._id || m.id} className="border-b hover:bg-blue-50">
                        <td className="px-4 py-2 font-medium text-gray-800 cursor-pointer" onClick={() => alert('Member profile modal coming soon!')}>
                          <MemberAvatar member={m} size={32} />
                          {m.name || m.email}
                        </td>
                        <td className="px-4 py-2 text-gray-600">{m.phone || '-'}</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700`}>Active</span>
                        </td>
                        <td className="px-4 py-2">
                          {isAdmin ? (
                            <select
                              className="border rounded px-2 py-1 text-xs"
                              value={isAdminMember ? 'Admin' : 'Member'}
                              onChange={e => alert('Role assignment coming soon!')}
                            >
                              <option value="Admin">Admin</option>
                              <option value="Treasurer">Treasurer</option>
                              <option value="Member">Member</option>
                            </select>
                          ) : (
                            <span className="text-xs font-semibold text-blue-700">{isAdminMember ? 'Admin' : 'Member'}</span>
                          )}
                        </td>
                        <td className="px-4 py-2 text-center">-</td>
                        <td className="px-4 py-2 text-center">-</td>
                        <td className="px-4 py-2 text-center">-</td>
                        {isAdmin && (
                          <td className="px-4 py-2">
                            <button
                              className="text-red-600 hover:text-red-900 text-xs font-bold mr-2"
                              onClick={() => alert('Remove member coming soon!')}
                            >
                              Remove
                            </button>
                            <button
                              className="text-blue-600 hover:text-blue-900 text-xs font-bold"
                              onClick={() => alert('Edit member coming soon!')}
                            >
                              Edit
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  }) : (
                    <tr><td colSpan={isAdmin ? 8 : 7} className="text-center text-gray-400 py-6">No members found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'loans':
        return (
          <div className="p-8">
            <h2 className="text-2xl font-bold mb-4">Loans</h2>
            {/* Alerts for upcoming/missed repayments */}
            <div className="mb-6">
              <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 p-4 rounded">
                <strong>Alerts:</strong> (Upcoming/missed repayments will appear here)
              </div>
            </div>
            {/* Loan Requests Table */}
            <div className="mb-8 overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg shadow">
                <thead>
                  <tr className="bg-blue-50">
                    <th className="px-4 py-2 text-left text-xs font-bold text-blue-700">Requester</th>
                    <th className="px-4 py-2 text-left text-xs font-bold text-blue-700">Amount</th>
                    <th className="px-4 py-2 text-left text-xs font-bold text-blue-700">Status</th>
                    <th className="px-4 py-2 text-left text-xs font-bold text-blue-700">Interest</th>
                    <th className="px-4 py-2 text-left text-xs font-bold text-blue-700">Duration</th>
                    <th className="px-4 py-2 text-left text-xs font-bold text-blue-700">Installments</th>
                    <th className="px-4 py-2 text-left text-xs font-bold text-blue-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Mock loan data for demonstration */}
                  {Array.isArray(group.loans) && group.loans.length > 0 ? group.loans.map((loan, idx) => (
                    <tr key={loan._id || idx} className="border-b hover:bg-blue-50">
                      <td className="px-4 py-2">{loan.requester?.name || loan.requester?.email || 'User'}</td>
                      <td className="px-4 py-2">GHS {loan.amount}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${loan.status === 'approved' ? 'bg-green-100 text-green-700' : loan.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : loan.status === 'declined' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'}`}>{loan.status}</span>
                      </td>
                      <td className="px-4 py-2">{loan.interest || 'N/A'}%</td>
                      <td className="px-4 py-2">{loan.duration || 'N/A'} {loan.durationUnit || 'months'}</td>
                      <td className="px-4 py-2">{loan.installments || 'N/A'}</td>
                      <td className="px-4 py-2">
                        {isAdmin && loan.status === 'pending' && (
                          <>
                            <button
                              className="text-green-600 hover:text-green-900 text-xs font-bold mr-2"
                              onClick={() => alert('Approve loan coming soon!')}
                            >
                              Approve
                            </button>
                            <button
                              className="text-red-600 hover:text-red-900 text-xs font-bold"
                              onClick={() => alert('Reject loan coming soon!')}
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {loan.status === 'approved' && <span className="text-green-700 text-xs font-semibold">Ongoing</span>}
                        {loan.status === 'repaid' && <span className="text-blue-700 text-xs font-semibold">Repaid</span>}
                        {loan.status === 'declined' && <span className="text-red-700 text-xs font-semibold">Declined</span>}
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={7} className="text-center text-gray-400 py-6">No loan requests yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            {/* Repayment Terms (Admin only, for new loans) */}
            {isAdmin && (
              <div className="mb-8 bg-blue-50 rounded-lg p-6">
                <h3 className="font-semibold text-lg mb-2">Set Repayment Terms</h3>
                <form className="flex flex-wrap gap-4 items-end" onSubmit={e => {e.preventDefault(); alert('Set terms coming soon!')}}>
                  <div>
                    <label className="block text-xs font-bold mb-1">Interest Rate (%)</label>
                    <input type="number" min="0" step="0.1" className="border rounded px-2 py-1 w-24" placeholder="e.g. 5" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">Duration</label>
                    <input type="number" min="1" className="border rounded px-2 py-1 w-24" placeholder="e.g. 6" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">Unit</label>
                    <select className="border rounded px-2 py-1 w-24">
                      <option value="months">Months</option>
                      <option value="weeks">Weeks</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1">Installments</label>
                    <input type="number" min="1" className="border rounded px-2 py-1 w-24" placeholder="e.g. 6" />
                  </div>
                  <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700">Set Terms</button>
                </form>
              </div>
            )}
            {/* Loan Calculator */}
            <div className="mb-8 bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-lg mb-2">Loan Calculator</h3>
              <form className="flex flex-wrap gap-4 items-end" onSubmit={e => {e.preventDefault(); alert('Loan calculation coming soon!')}}>
                <div>
                  <label className="block text-xs font-bold mb-1">Amount</label>
                  <input type="number" min="1" className="border rounded px-2 py-1 w-24" placeholder="e.g. 1000" />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Interest Rate (%)</label>
                  <input type="number" min="0" step="0.1" className="border rounded px-2 py-1 w-24" placeholder="e.g. 5" />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Duration</label>
                  <input type="number" min="1" className="border rounded px-2 py-1 w-24" placeholder="e.g. 6" />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Unit</label>
                  <select className="border rounded px-2 py-1 w-24">
                    <option value="months">Months</option>
                    <option value="weeks">Weeks</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Installments</label>
                  <input type="number" min="1" className="border rounded px-2 py-1 w-24" placeholder="e.g. 6" />
                </div>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700">Calculate</button>
              </form>
              <div className="mt-4 text-gray-500">(Calculation results will appear here)</div>
            </div>
          </div>
        );
      case 'contributions':
        const canContribute = Array.isArray(group.members) && group.members.some(m => (m._id || m.id) === currentUser._id);
        async function handleContribute(e) {
          e.preventDefault();
          setContributionLoading(true);
          setContributionError('');
          setContributionSuccess('');
          try {
            await api.createTransaction({
              group: group._id,
              type: 'contribution',
              amount: Number(contributionAmount),
              method: 'manual',
            });
            setContributionSuccess('Contribution successful!');
            setContributionAmount('');
            setShowContributeModal(false);
            // Refresh group data
            const updated = await api.getGroupById(group._id);
            setGroup(updated);
          } catch (err) {
            setContributionError(err.message || 'Failed to contribute.');
          } finally {
            setContributionLoading(false);
          }
        }
        const paystackKey = window.PAYSTACK_PUBLIC_KEY || 'pk_test_xxx';

        async function handlePaystackPayment(e) {
          e.preventDefault();
          setContributionLoading(true);
          setContributionError('');
          setContributionSuccess('');
          try {
            if (!window.PaystackPop) {
              setContributionError('Paystack is not loaded. Please refresh the page.');
              setContributionLoading(false);
              return;
            }
            const email = currentUser.email;
            const amount = Number(contributionAmount);
            if (!email || !amount) {
              setContributionError('Email and amount are required.');
              setContributionLoading(false);
              return;
            }
            const paystack = window.PaystackPop.setup({
              key: paystackKey,
              email,
              amount: amount * 100,
              currency: 'GHS',
              ref: 'KRA-' + Math.floor(Math.random() * 1000000000),
              metadata: {
                custom_fields: [
                  {
                    display_name: 'Phone Number',
                    variable_name: 'phone',
                    value: currentUser.phone || '',
                  },
                  {
                    display_name: 'Payment Method',
                    variable_name: 'method',
                    value: contributionMethod,
                  }
                ]
              },
              callback: function(response) {
                handlePaystackCallback(response);
              },
              onClose: function() {
                setContributionError('Payment window closed. No charge was made.');
                setContributionLoading(false);
              }
            });
            paystack.openIframe();
          } catch (err) {
            setContributionError('An unexpected error occurred. See console for details.');
            setContributionLoading(false);
          }
        }
        function handlePaystackCallback(response) {
          api.post(`/group/${groupId}/contribute`, {
            amount: Number(contributionAmount),
            paystackReference: response.reference,
            method: contributionMethod,
          })
            .then(res => {
              setContributionSuccess('Contribution successful!');
              setGroup(res.group);
              setContributionAmount('');
              setContributionMethod('');
              setShowContributeModal(false);
            })
            .catch(err => {
              setContributionError(err.message || 'Payment succeeded but failed to record contribution.');
            })
            .finally(() => {
              setContributionLoading(false);
            });
        }
        return (
          <div className="p-8">
            <h2 className="text-2xl font-bold mb-4">Contributions</h2>
            {/* Contribution Tracker */}
            <div className="mb-8">
              <h3 className="font-semibold text-lg mb-2">Group Savings Progress</h3>
              <div className="mb-2 text-gray-700">Total Saved: <span className="font-bold">GHS {group.totalSavings || 0}</span> / Goal: <span className="font-bold">GHS {group.targetAmount || 0}</span></div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-700 h-4 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${group.targetAmount ? Math.min(100, Math.round((group.totalSavings || 0) / group.targetAmount * 100)) : 0}%` }}
                />
              </div>
            </div>
            {/* Make Contribution Button (only for members) */}
            {canContribute && (
              <div className="mb-6">
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700"
                  onClick={() => setShowContributeModal(true)}
                >
                  Make Contribution
                </button>
                {contributionSuccess && <div className="mt-2 text-green-700 text-sm">{contributionSuccess}</div>}
                {contributionError && <div className="mt-2 text-red-600 text-sm">{contributionError}</div>}
              </div>
            )}
            {/* Contribution Modal */}
            <ContributionModal
              open={showContributeModal}
              onClose={() => setShowContributeModal(false)}
              group={group}
              user={currentUser}
              onSuccess={updatedGroup => setGroup(updatedGroup)}
            />
            {/* Contribution Schedule */}
            <div className="mb-8">
              <h3 className="font-semibold text-lg mb-2">Contribution Schedule</h3>
              <div className="flex items-center gap-4 mb-2">
                <span className="text-gray-700">Current: <span className="font-bold">{group.schedule || 'Monthly'}</span></span>
                {isAdmin && (
                  <form className="flex items-center gap-2" onSubmit={e => {e.preventDefault(); alert('Update schedule coming soon!')}}>
                    <select className="border rounded px-2 py-1" defaultValue={group.schedule || 'Monthly'}>
                      <option value="Weekly">Weekly</option>
                      <option value="Monthly">Monthly</option>
                    </select>
                    <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-xs font-semibold">Update</button>
                  </form>
                )}
              </div>
            </div>
            {/* Member Contributions Table */}
            <div className="mb-8 overflow-x-auto">
              <h3 className="font-semibold text-lg mb-2">Member Contributions</h3>
              <table className="min-w-full bg-white rounded-lg shadow">
                <thead>
                  <tr className="bg-blue-50">
                    <th className="px-4 py-2 text-left text-xs font-bold text-blue-700">Member</th>
                    <th className="px-4 py-2 text-left text-xs font-bold text-blue-700">Amount</th>
                    <th className="px-4 py-2 text-left text-xs font-bold text-blue-700">Date</th>
                    <th className="px-4 py-2 text-left text-xs font-bold text-blue-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Use real group.transactions filtered by type 'contribution' */}
                  {Array.isArray(group.transactions) && group.transactions.filter(tx => tx.type === 'contribution').length > 0 ? group.transactions.filter(tx => tx.type === 'contribution').map((c, idx) => (
                    <tr key={c._id || idx} className="border-b hover:bg-blue-50">
                      <td className="px-4 py-2">
                        <MemberAvatar member={c.user} size={32} />
                        {c.user?.name || c.user?.email || 'User'}
                      </td>
                      <td className="px-4 py-2">GHS {c.amount}</td>
                      <td className="px-4 py-2">{c.date ? new Date(c.date).toLocaleDateString() : '-'}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${c.status === 'completed' ? 'bg-green-100 text-green-700' : c.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : c.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'}`}>{c.status || 'completed'}</span>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={4} className="text-center text-gray-400 py-6">No contributions yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            {/* Notifications for missed payments */}
            <div className="mb-8">
              <h3 className="font-semibold text-lg mb-2">Missed Payment Notifications</h3>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 p-4 rounded">(Members with missed payments will appear here)</div>
            </div>
            {/* Auto-reminder system */}
            <div className="mb-8">
              <h3 className="font-semibold text-lg mb-2">Auto-Reminder System</h3>
              <div className="bg-blue-50 border-l-4 border-blue-400 text-blue-800 p-4 rounded">(Auto-reminders for upcoming contributions will appear here)</div>
            </div>
          </div>
        );
      case 'repayments':
        return (
          <div className="p-8">
            <h2 className="text-2xl font-bold mb-4">Repayments</h2>
            <div className="mb-8 overflow-x-auto">
              <h3 className="font-semibold text-lg mb-2">Upcoming Repayments</h3>
              <table className="min-w-full bg-white rounded-lg shadow">
                <thead>
                  <tr className="bg-blue-50">
                    <th className="px-4 py-2 text-left text-xs font-bold text-blue-700">Member</th>
                    <th className="px-4 py-2 text-left text-xs font-bold text-blue-700">Amount</th>
                    <th className="px-4 py-2 text-left text-xs font-bold text-blue-700">Due Date</th>
                    <th className="px-4 py-2 text-left text-xs font-bold text-blue-700">Status</th>
                    <th className="px-4 py-2 text-left text-xs font-bold text-blue-700">Penalty</th>
                    <th className="px-4 py-2 text-left text-xs font-bold text-blue-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Mock repayments data for demonstration */}
                  {Array.isArray(group.repayments) && group.repayments.length > 0 ? group.repayments.map((r, idx) => {
                    const isOverdue = r.status === 'Overdue';
                    const isDue = r.status === 'Due';
                    const isPaid = r.status === 'Paid';
                    return (
                      <tr key={r._id || idx} className="border-b hover:bg-blue-50">
                        <td className="px-4 py-2">
                          <MemberAvatar member={r.member} size={32} />
                          {r.member?.name || r.member?.email || 'User'}
                        </td>
                        <td className="px-4 py-2">GHS {r.amount}</td>
                        <td className="px-4 py-2">{r.dueDate ? new Date(r.dueDate).toLocaleDateString() : '-'}</td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${isPaid ? 'bg-green-100 text-green-700' : isDue ? 'bg-yellow-100 text-yellow-700' : isOverdue ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'}`}>{r.status}</span>
                        </td>
                        <td className="px-4 py-2 text-center">{isOverdue ? `GHS ${r.penalty || 0}` : '-'}</td>
                        <td className="px-4 py-2">
                          {isPaid ? (
                            <span className="text-green-700 text-xs font-semibold">Paid</span>
                          ) : (
                            <>
                              {currentUser._id === (r.member?._id || r.member?.id) ? (
                                <button
                                  className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-semibold hover:bg-blue-700 mr-2"
                                  onClick={() => alert('Paystack payment coming soon!')}
                                >
                                  Pay Now
                                </button>
                              ) : null}
                              {isAdmin && (
                                <button
                                  className="bg-green-100 text-green-700 px-3 py-1 rounded text-xs font-semibold hover:bg-green-200"
                                  onClick={() => alert('Mark as paid coming soon!')}
                                >
                                  Mark as Paid
                                </button>
                              )}
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr><td colSpan={6} className="text-center text-gray-400 py-6">No repayments scheduled yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            {/* Penalty Management */}
            {Array.isArray(group.repayments) && group.repayments.some(r => r.penalty) ? (
              <div className="mb-8">
                <h3 className="font-semibold text-lg mb-2">Penalty Management</h3>
                <ul className="bg-red-50 border-l-4 border-red-400 text-red-800 p-4 rounded">
                  {group.repayments.filter(r => r.penalty).map((r, idx) => (
                    <li key={r._id || idx}>Penalty for {r.member?.name || r.member?.email || 'User'}: GHS {r.penalty}</li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        );
      case 'requests':
        return (
          <div className="p-8">
            <h2 className="text-2xl font-bold mb-4">Requests & Notifications</h2>
            {/* Loan Request Notifications */}
            {Array.isArray(group.loans) && group.loans.some(l => l.status === 'pending') ? (
              <div className="mb-8">
                <h3 className="font-semibold text-lg mb-2">Loan Request Notifications</h3>
                <ul className="bg-blue-50 border-l-4 border-blue-400 text-blue-800 p-4 rounded">
                  {group.loans.filter(l => l.status === 'pending').map((l, idx) => (
                    <li key={l._id || idx}>{l.requester?.name || l.requester?.email || 'User'} requested GHS {l.amount}</li>
                  ))}
                </ul>
              </div>
            ) : <div className="mb-8 text-gray-400">No loan requests yet.</div>}
            {/* Withdrawal Requests */}
            <div className="mb-8 text-gray-400">No withdrawal requests yet.</div>
            {/* System Alerts */}
            <div className="mb-8 text-gray-400">No system alerts yet.</div>
            {/* Group-wide Announcements */}
            <div className="mb-8 text-gray-400">No announcements yet.</div>
          </div>
        );
      case 'chat':
        return (
          <div className="p-8">
            <h2 className="text-2xl font-bold mb-4">Group Chat / Forum</h2>
            <div className="bg-blue-50 border-l-4 border-blue-400 text-blue-800 p-4 rounded">No messages yet.</div>
          </div>
        );
      case 'wallet':
        return (
          <div className="p-8">
            <h2 className="text-2xl font-bold mb-4">Wallet / Account</h2>
            {/* Current Fund Balance */}
            <div className="mb-8">
              <h3 className="font-semibold text-lg mb-2">Current Group Fund Balance</h3>
              <div className="bg-blue-50 border-l-4 border-blue-400 text-blue-800 p-4 rounded text-2xl font-bold">GHS {group.fundBalance || 0}</div>
            </div>
            {/* Transactions History */}
            <div className="mb-8 overflow-x-auto">
              <h3 className="font-semibold text-lg mb-2">Transactions History</h3>
              <table className="min-w-full bg-white rounded-lg shadow">
                <thead>
                  <tr className="bg-blue-50">
                    <th className="px-4 py-2 text-left text-xs font-bold text-blue-700">Date</th>
                    <th className="px-4 py-2 text-left text-xs font-bold text-blue-700">Type</th>
                    <th className="px-4 py-2 text-left text-xs font-bold text-blue-700">Amount</th>
                    <th className="px-4 py-2 text-left text-xs font-bold text-blue-700">Method</th>
                    <th className="px-4 py-2 text-left text-xs font-bold text-blue-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Mock transactions data for demonstration */}
                  {Array.isArray(group.transactions) && group.transactions.length > 0 ? group.transactions.map((tx, idx) => (
                    <tr key={tx._id || idx} className="border-b hover:bg-blue-50">
                      <td className="px-4 py-2">{tx.date ? new Date(tx.date).toLocaleDateString() : '-'}</td>
                      <td className="px-4 py-2">{tx.type}</td>
                      <td className="px-4 py-2">GHS {tx.amount}</td>
                      <td className="px-4 py-2">{tx.method || '-'}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${tx.status === 'completed' ? 'bg-green-100 text-green-700' : tx.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : tx.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'}`}>{tx.status}</span>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={5} className="text-center text-gray-400 py-6">No transactions yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'reports':
        return (
          <div className="p-8">
            <h2 className="text-2xl font-bold mb-4">Reports & Analytics</h2>
            {/* Loan Performance (Monthly Trends) */}
            <div className="mb-8">
              <h3 className="font-semibold text-lg mb-2">Loan Performance (Monthly Trends)</h3>
              <div className="bg-blue-50 border-l-4 border-blue-400 text-blue-800 p-4 rounded">(Loan performance charts and trends will appear here)</div>
            </div>
            {/* Contribution Reports */}
            <div className="mb-8">
              <h3 className="font-semibold text-lg mb-2">Contribution Reports</h3>
              <div className="bg-green-50 border-l-4 border-green-400 text-green-800 p-4 rounded">(Contribution reports and charts will appear here)</div>
            </div>
            {/* Member Ranking */}
            <div className="mb-8">
              <h3 className="font-semibold text-lg mb-2">Member Ranking</h3>
              <div className="bg-purple-50 border-l-4 border-purple-400 text-purple-800 p-4 rounded">(Most active, most loans, etc. will appear here)</div>
            </div>
            {/* Default Rate */}
            <div className="mb-8">
              <h3 className="font-semibold text-lg mb-2">Default Rate</h3>
              <div className="bg-red-50 border-l-4 border-red-400 text-red-800 p-4 rounded">(Default rate and stats will appear here)</div>
            </div>
            {/* PDF/CSV Export */}
            <div className="mb-8">
              <h3 className="font-semibold text-lg mb-2">Export Reports</h3>
              <button className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700 mr-2" onClick={() => alert('PDF export coming soon!')}>Export PDF</button>
              <button className="bg-green-600 text-white px-4 py-2 rounded font-semibold hover:bg-green-700" onClick={() => alert('CSV export coming soon!')}>Export CSV</button>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="p-8">
            <h2 className="text-2xl font-bold mb-4">Group Settings</h2>
            {/* Edit Group Details */}
            <div className="mb-8">
              <h3 className="font-semibold text-lg mb-2">Edit Group Details</h3>
              <form className="space-y-4 max-w-lg" onSubmit={e => {e.preventDefault(); alert('Save group details coming soon!')}}>
                <div>
                  <label className="block text-xs font-bold mb-1">Group Name</label>
                  <input type="text" className="border rounded px-3 py-2 w-full" defaultValue={group.name} />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Group Logo</label>
                  <input type="file" className="border rounded px-3 py-2 w-full" />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Admins</label>
                  <input type="text" className="border rounded px-3 py-2 w-full" defaultValue={group.admins.map(a => a.name || a.email || a).join(', ')} />
                </div>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700">Save Changes</button>
              </form>
            </div>
            {/* Manage Contribution Frequency and Amount */}
            <div className="mb-8">
              <h3 className="font-semibold text-lg mb-2">Contribution Frequency & Amount</h3>
              <form className="flex flex-wrap gap-4 items-end" onSubmit={e => {e.preventDefault(); alert('Save contribution settings coming soon!')}}>
                <div>
                  <label className="block text-xs font-bold mb-1">Frequency</label>
                  <select className="border rounded px-2 py-1 w-32" defaultValue={group.schedule || 'Monthly'}>
                    <option value="Weekly">Weekly</option>
                    <option value="Monthly">Monthly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Amount (GHS)</label>
                  <input type="number" min="1" className="border rounded px-2 py-1 w-32" defaultValue={group.monthlyContribution || ''} />
                </div>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700">Save</button>
              </form>
            </div>
            {/* Set Loan Rules */}
            <div className="mb-8">
              <h3 className="font-semibold text-lg mb-2">Loan Rules</h3>
              <form className="flex flex-wrap gap-4 items-end" onSubmit={e => {e.preventDefault(); alert('Save loan rules coming soon!')}}>
                <div>
                  <label className="block text-xs font-bold mb-1">Interest Rate (%)</label>
                  <input type="number" min="0" step="0.1" className="border rounded px-2 py-1 w-32" defaultValue={group.loanInterest || ''} />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Loan Limit (GHS)</label>
                  <input type="number" min="1" className="border rounded px-2 py-1 w-32" defaultValue={group.loanLimit || ''} />
                </div>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700">Save</button>
              </form>
            </div>
            {/* Payment System Integration */}
            <div className="mb-8">
              <h3 className="font-semibold text-lg mb-2">Payment System Integration</h3>
              <div className="flex gap-4">
                <button className="bg-green-600 text-white px-4 py-2 rounded font-semibold hover:bg-green-700" onClick={() => alert('Paystack integration coming soon!')}>Connect Paystack</button>
                <button className="bg-yellow-500 text-white px-4 py-2 rounded font-semibold hover:bg-yellow-600" onClick={() => alert('MTN MoMo integration coming soon!')}>Connect MTN MoMo</button>
              </div>
            </div>
            {/* Notification Settings */}
            <div className="mb-8">
              <h3 className="font-semibold text-lg mb-2">Notification Settings</h3>
              <form className="space-y-2 max-w-md" onSubmit={e => {e.preventDefault(); alert('Save notification settings coming soon!')}}>
                <div className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked />
                  <label className="text-sm">Email notifications</label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked />
                  <label className="text-sm">SMS notifications</label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" />
                  <label className="text-sm">Push notifications</label>
                </div>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700 mt-2">Save</button>
              </form>
            </div>
          </div>
        );
      default:
        return null;
    }
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Sidebar />
      <main className="flex-1 overflow-x-auto">
        {/* Group Banner */}
        <div className="relative w-full h-40 bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-between px-8 shadow-md">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-lg border-4 border-blue-200 overflow-hidden">
              {group.logo ? (
                <img src={group.logo} alt="Group Logo" className="w-full h-full object-cover rounded-full" />
              ) : (
                <span className="text-3xl font-bold text-blue-700">{group.name[0]}</span>
              )}
            </div>
            <div>
              <div className="text-3xl font-extrabold text-white drop-shadow-lg">{group.name}</div>
              <div className="text-white/80 text-sm mt-1">{group.description}</div>
            </div>
          </div>
          <button
            className="flex items-center gap-2 bg-white/80 hover:bg-white text-blue-700 font-semibold px-4 py-2 rounded-lg shadow transition-all"
            onClick={() => navigate('/dashboard/savings')}
          >
            <ArrowLeft className="h-5 w-5" /> Back to My Groups
          </button>
        </div>
        {/* Main Content */}
        <div className="max-w-5xl mx-auto mt-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
} 