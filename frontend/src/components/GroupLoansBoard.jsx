import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { useNotification } from './NotificationProvider';

export default function GroupLoansBoard({ groupId, currentUser, isAdmin }) {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [duration, setDuration] = useState('');
  const [repaymentPlan, setRepaymentPlan] = useState('monthly');
  const [collateral, setCollateral] = useState('');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [submitting, setSubmitting] = useState(false);
  const { notify } = useNotification();

  useEffect(() => {
    fetchLoans();
    // eslint-disable-next-line
  }, [groupId]);

  async function fetchLoans() {
    setLoading(true);
    try {
      const res = await api.getLoans(groupId);
      setLoans(res.loans || []);
    } catch (err) {
      setError('Failed to fetch loans');
    } finally {
      setLoading(false);
    }
  }

  async function handleRequestLoan(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.requestLoan(groupId, parseFloat(amount), reason, duration, repaymentPlan, collateral, phone);
      setAmount('');
      setReason('');
      setDuration('');
      setRepaymentPlan('monthly');
      setCollateral('');
      setPhone(currentUser?.phone || '');
      fetchLoans();
      notify('Loan request submitted!', 'success');
    } catch (err) {
      notify('Failed to request loan: ' + (err.message || 'Unknown error'), 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleApprove(loanId) {
    if (!window.confirm('Approve this loan?')) return;
    try {
      await api.approveLoan(groupId, loanId);
      fetchLoans();
      notify('Loan approved!', 'success');
    } catch (err) {
      notify('Failed to approve loan: ' + (err.message || 'Unknown error'), 'error');
    }
  }

  async function handleDecline(loanId) {
    if (!window.confirm('Decline this loan?')) return;
    try {
      await api.declineLoan(groupId, loanId);
      fetchLoans();
      notify('Loan declined.', 'info');
    } catch (err) {
      notify('Failed to decline loan: ' + (err.message || 'Unknown error'), 'error');
    }
  }

  async function handleRepay(loanId) {
    let repayAmount = '';
    // Custom modal or prompt for repayment
    repayAmount = window.prompt('Enter repayment amount:');
    if (!repayAmount) return;
    if (isNaN(repayAmount) || Number(repayAmount) <= 0) {
      notify('Please enter a valid repayment amount.', 'error');
      return;
    }
    try {
      await api.repayLoan(groupId, loanId, parseFloat(repayAmount));
      fetchLoans();
      notify('Repayment recorded!', 'success');
    } catch (err) {
      notify('Failed to record repayment: ' + (err.message || 'Unknown error'), 'error');
    }
  }

  function StatusBadge({ status }) {
    const color = status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
      status === 'approved' ? 'bg-green-100 text-green-800' :
      status === 'declined' ? 'bg-red-100 text-red-800' :
      status === 'repaid' ? 'bg-blue-100 text-blue-800' :
      'bg-gray-100 text-gray-700';
    return <span className={`px-2 py-0.5 rounded text-xs font-bold ${color}`}>{status}</span>;
  }

  function RepayProgress({ loan }) {
    if (!loan.amount || !loan.repayments?.length) return null;
    const totalRepaid = loan.repayments.reduce((sum, r) => sum + (r.amount || 0), 0);
    const percent = Math.min(100, Math.round((totalRepaid / loan.amount) * 100));
    return (
      <div className="w-full bg-gray-100 rounded h-2 mt-1 mb-1">
        <div className="bg-blue-400 h-2 rounded" style={{ width: percent + '%' }} />
        <div className="text-xs text-gray-500 mt-0.5">{percent}% repaid</div>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 rounded p-4 mt-6">
      <h3 className="font-semibold text-lg mb-4">Loans</h3>
      {loading ? (
        <div>Loading loans...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <>
          {currentUser && (
            <form onSubmit={handleRequestLoan} className="max-w-lg mx-auto bg-white rounded-xl shadow-lg p-8 mb-8 flex flex-col gap-5 border border-blue-100">
              <h4 className="text-xl font-bold text-blue-700 mb-2">Apply for a Loan</h4>
              <div className="flex flex-col gap-2">
                <label className="font-medium text-gray-700">Amount (GHS)</label>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  className="px-4 py-2 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-400 focus:outline-none text-lg"
                  placeholder="Enter loan amount"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  required
                  disabled={submitting}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-medium text-gray-700">Reason</label>
                <textarea
                  className="px-4 py-2 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-400 focus:outline-none text-base resize-none"
                  placeholder="Why do you need this loan?"
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  rows={3}
                  required
                  disabled={submitting}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-medium text-gray-700">Duration (months)</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  className="px-4 py-2 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-400 focus:outline-none text-lg"
                  placeholder="e.g. 6"
                  value={duration}
                  onChange={e => setDuration(e.target.value)}
                  required
                  disabled={submitting}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-medium text-gray-700">Repayment Plan</label>
                <select
                  className="px-4 py-2 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-400 focus:outline-none text-lg"
                  value={repaymentPlan}
                  onChange={e => setRepaymentPlan(e.target.value)}
                  disabled={submitting}
                >
                  <option value="monthly">Monthly</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-medium text-gray-700">Collateral (optional)</label>
                <input
                  type="text"
                  className="px-4 py-2 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-400 focus:outline-none text-lg"
                  placeholder="e.g. Car, phone, etc."
                  value={collateral}
                  onChange={e => setCollateral(e.target.value)}
                  disabled={submitting}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-medium text-gray-700">Phone Number</label>
                <input
                  type="tel"
                  className="px-4 py-2 rounded-lg border border-blue-200 focus:ring-2 focus:ring-blue-400 focus:outline-none text-lg"
                  placeholder="Your phone number"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  required
                  disabled={submitting}
                />
              </div>
              <button
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold text-lg shadow hover:from-blue-700 hover:to-indigo-700 transition-colors disabled:opacity-50 mt-2"
                disabled={submitting || !amount}
              >
                {submitting ? 'Requesting...' : 'Request Loan'}
              </button>
            </form>
          )}
          {/* My Loan Requests Section */}
          {currentUser && (
            <div className="max-w-2xl mx-auto mb-8">
              <h4 className="text-lg font-bold text-blue-700 mb-2">My Loan Requests</h4>
              <div className="bg-white rounded-xl shadow p-4 border border-blue-100">
                <table className="min-w-full text-xs text-left">
                  <thead>
                    <tr>
                      <th className="px-2 py-1">Amount</th>
                      <th className="px-2 py-1">Reason</th>
                      <th className="px-2 py-1">Duration</th>
                      <th className="px-2 py-1">Status</th>
                      <th className="px-2 py-1">Requested</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loans.filter(l => l.requester?._id === currentUser._id).length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center py-4 text-gray-400 animate-fadeIn">
                          No loan requests yet.
                        </td>
                      </tr>
                    ) : loans.filter(l => l.requester?._id === currentUser._id).map(loan => (
                      <tr key={loan._id} className="border-t hover:bg-blue-50 transition-colors duration-150">
                        <td className="px-2 py-1">GHS {loan.amount}</td>
                        <td className="px-2 py-1">{loan.reason || '-'}</td>
                        <td className="px-2 py-1">{loan.duration || '-'}</td>
                        <td className="px-2 py-1 capitalize"><StatusBadge status={loan.status} /></td>
                        <td className="px-2 py-1">{loan.createdAt ? new Date(loan.createdAt).toLocaleDateString() : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {/* Admin Loan Review Table and All Loans Table remain as before */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs text-left">
              <thead>
                <tr>
                  <th className="px-2 py-1">Amount</th>
                  <th className="px-2 py-1">Reason</th>
                  <th className="px-2 py-1">Requester</th>
                  <th className="px-2 py-1">Status</th>
                  <th className="px-2 py-1">Approvals</th>
                  <th className="px-2 py-1">Repayments</th>
                  <th className="px-2 py-1">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loans.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4 text-gray-400 animate-fadeIn">
                      No loans yet. Request a loan to get started!
                    </td>
                  </tr>
                ) : loans.map(loan => (
                  <tr key={loan._id} className="border-t hover:bg-blue-50 transition-colors duration-150">
                    <td className="px-2 py-1">GHS {loan.amount}</td>
                    <td className="px-2 py-1">{loan.reason || '-'}</td>
                    <td className="px-2 py-1">{loan.requester?.name || loan.requester?.email || '-'}</td>
                    <td className="px-2 py-1 capitalize"><StatusBadge status={loan.status} /></td>
                    <td className="px-2 py-1">{loan.approvals?.length || 0}</td>
                    <td className="px-2 py-1">
                      {loan.repayments && loan.repayments.length > 0 ? (
                        <>
                          <ul>
                            {loan.repayments.map((r, i) => (
                              <li key={i}>GHS {r.amount} on {new Date(r.date).toLocaleDateString()}</li>
                            ))}
                          </ul>
                          <RepayProgress loan={loan} />
                        </>
                      ) : '-'}
                    </td>
                    <td className="px-2 py-1">
                      {loan.status === 'pending' && isAdmin && (
                        <>
                          <button
                            className="text-green-600 hover:bg-green-100 px-2 py-1 rounded transition-all duration-150 mr-2 shadow-sm"
                            onClick={() => handleApprove(loan._id)}
                            aria-label="Approve loan"
                          >Approve</button>
                          <button
                            className="text-red-600 hover:bg-red-100 px-2 py-1 rounded transition-all duration-150 shadow-sm"
                            onClick={() => handleDecline(loan._id)}
                            aria-label="Decline loan"
                          >Decline</button>
                        </>
                      )}
                      {loan.status === 'approved' && currentUser._id === loan.requester?._id && (
                        <button
                          className="text-blue-600 hover:bg-blue-100 px-2 py-1 rounded transition-all duration-150 shadow-sm"
                          onClick={() => handleRepay(loan._id)}
                          aria-label="Repay loan"
                        >Repay</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
