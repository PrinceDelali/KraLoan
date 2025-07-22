const Group = require('../models/Group');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const GroupMessage = require('../models/GroupMessage');

const crypto = require('crypto');
const axios = require('axios');

let io;
exports.setIO = (ioInstance) => { io = ioInstance; };

exports.createGroup = async (req, res) => {
  try {
    const { name, description, targetAmount, monthlyContribution, startDate, endDate } = req.body;
    // Generate a unique inviteToken
    const inviteToken = crypto.randomBytes(16).toString('hex');
    const group = new Group({
      name, description, targetAmount, monthlyContribution, startDate, endDate,
      admins: [req.user.userId],
      members: [req.user.userId],
      inviteToken
    });
    await group.save();
    // Add group to user's groups
    await User.findByIdAndUpdate(req.user.userId, { $push: { groups: group._id } });
    res.status(201).json(group);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Join group by invite token
exports.joinGroupByInviteToken = async (req, res) => {
  try {
    const { token } = req.params;
    const group = await Group.findOne({ inviteToken: token });
    if (!group) return res.status(404).json({ message: 'Invalid invite link.' });
    if (!group.members.includes(req.user.userId)) {
      group.members.push(req.user.userId);
      await group.save();
      await User.findByIdAndUpdate(req.user.userId, { $push: { groups: group._id } });
    }
    res.json(group);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.listGroups = async (req, res) => {
  try {
    const groups = await Group.find().populate('admins', 'name email').populate('members', 'name email');
    res.json(groups);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.joinGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    // Already a member
    if (group.members.includes(req.user.userId)) {
      return res.status(400).json({ message: 'You are already a member of this group.' });
    }
    // Already requested
    if (group.pendingRequests.includes(req.user.userId)) {
      return res.status(400).json({ message: 'You have already requested to join this group. Please wait for admin approval.' });
    }
    // Add to pending requests
    group.pendingRequests.push(req.user.userId);
    await group.save();

    // (Simulated) Notify admin(s) - in a real app, send notification/email
    res.json({ message: 'Join request sent. Waiting for admin approval.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
// Delete a group (only by admin/creator)
exports.deleteGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    // Only allow if user is an admin
    if (!group.admins.map(a => a.toString()).includes(req.user.userId)) {
      return res.status(403).json({ message: 'Only an admin can delete this group.' });
    }
    // Remove group from all users' group lists
    await User.updateMany({ groups: group._id }, { $pull: { groups: group._id } });
    await group.deleteOne();
    res.json({ message: 'Group deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
// Post a new message to a group (supports file upload)
exports.postGroupMessageWithFile = async (req, res) => {
  try {
    const { text = '' } = req.body;
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    // Only members can post
    if (!group.members.map(m => m.toString()).includes(req.user.userId)) {
      return res.status(403).json({ message: 'Only members can post messages.' });
    }
    let attachment = undefined;
    if (req.file) {
      attachment = {
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        url: `/uploads/${req.file.filename}`
      };
    }
    if (!text && !attachment) return res.status(400).json({ message: 'Message text or attachment required' });
    const message = { user: req.user.userId, text, timestamp: new Date(), attachment };
    group.messages.push(message);
    await group.save();
    await group.populate('messages.user', 'name email');
    res.status(201).json({ message: 'Message posted', messages: group.messages });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Post a new message to a group (text-only, legacy)
exports.postGroupMessage = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'Message text required' });
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    // Only members can post
    if (!group.members.map(m => m.toString()).includes(req.user.userId)) {
      return res.status(403).json({ message: 'Only members can post messages.' });
    }
    const message = { user: req.user.userId, text, timestamp: new Date() };
    group.messages.push(message);
    await group.save();
    await group.populate('messages.user', 'name email');
    res.status(201).json({ message: 'Message posted', messages: group.messages });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
// Remove a member from group (only by admin/creator)
exports.removeMember = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    // Only allow if user is an admin
    if (!group.admins.map(a => a.toString()).includes(req.user.userId)) {
      return res.status(403).json({ message: 'Only an admin can remove members.' });
    }
    const { userId } = req.body;
    // Remove member from group
    group.members = group.members.filter(m => m.toString() !== userId);
    await group.save();
    // Remove group from user's group list
    await User.findByIdAndUpdate(userId, { $pull: { groups: group._id } });
    res.json({ message: 'Member removed.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Allow a member to leave a group themselves
exports.leaveGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    const userId = req.user.userId;
    // Remove user from group members
    group.members = group.members.filter(m => m.toString() !== userId);
    await group.save();
    // Remove group from user's group list
    await User.findByIdAndUpdate(userId, { $pull: { groups: group._id } });
    res.json({ message: 'You have left the group.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
// Get a single group by ID with all relevant fields populated
exports.getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('members', 'name email phone avatar')
      .populate('admins', 'name email phone avatar')
      .populate('loans.requester', 'name email phone avatar');
    if (!group) return res.status(404).json({ message: 'Group not found' });

    // Fetch all transactions for this group
    const transactions = await Transaction.find({ group: group._id }).populate('user', 'name email avatar');
    const groupObj = group.toObject();
    groupObj.transactions = transactions;
    // Calculate totalSavings
    groupObj.totalSavings = group.contributions.filter(c => c.status === 'completed').reduce((sum, c) => sum + c.amount, 0);

    res.json(groupObj);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
// Get group chat history
exports.getGroupMessages = async (req, res) => {
  try {
    const messages = await GroupMessage.find({ group: req.params.groupId })
      .populate('user', 'name email _id')
      .sort({ timestamp: 1 });
    res.json({ messages });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch group messages' });
  }
};

// Post a new group message
exports.postGroupMessage = async (req, res) => {
  try {
    const { text } = req.body;
    const message = new GroupMessage({
      group: req.params.groupId,
      user: req.user._id,
      text,
    });
    await message.save();
    await message.populate('user', 'name email _id');
    res.status(201).json({ message });
  } catch (err) {
    res.status(500).json({ error: 'Failed to post message' });
  }
};
// --- STUBS TO FIX ROUTE ERRORS ---
exports.editGroupMessage = async (req, res) => {
  res.status(200).json({ message: 'editGroupMessage stub' });
};
exports.deleteGroupMessage = async (req, res) => {
  res.status(200).json({ message: 'deleteGroupMessage stub' });
};
// Request a loan (member)
exports.requestLoan = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    // Only members can request
    if (!group.members.map(m => m.toString()).includes(req.user.userId)) {
      return res.status(403).json({ message: 'Only members can request loans.' });
    }
    const { amount, reason, duration, repaymentPlan, collateral, phone } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ message: 'Amount required and must be > 0.' });
    // Check for existing pending loan
    if (group.loans.some(l => l.requester.toString() === req.user.userId && l.status === 'pending')) {
      return res.status(400).json({ message: 'You already have a pending loan request.' });
    }
    // Check available funds (optional rule)
    const totalSavings = group.contributions.reduce((sum, c) => sum + c.amount, 0);
    const totalOutstanding = group.loans.filter(l => l.status === 'approved').reduce((sum, l) => sum + l.amount, 0);
    const availableFunds = totalSavings - totalOutstanding;
    if (amount > availableFunds) {
      return res.status(400).json({ message: 'Requested amount exceeds available group funds.' });
    }
    // Add loan request
    group.loans.push({
      amount,
      reason,
      requester: req.user.userId,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
      duration,
      repaymentPlan,
      collateral,
      phone
    });
    await group.save();
    res.status(201).json({ message: 'Loan request submitted.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all loans for a group (admin/member)
exports.getLoans = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id).populate('loans.requester', 'name email');
    if (!group) return res.status(404).json({ message: 'Group not found' });
    // Only members/admins can view
    if (!group.members.map(m => m.toString()).includes(req.user.userId) && !group.admins.map(a => a.toString()).includes(req.user.userId)) {
      return res.status(403).json({ message: 'Not authorized.' });
    }
    res.json({ loans: group.loans });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Approve a loan (admin)
exports.approveLoan = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    if (!group.admins.map(a => a.toString()).includes(req.user.userId)) {
      return res.status(403).json({ message: 'Only admins can approve loans.' });
    }
    const loan = group.loans.id(req.params.loanId);
    if (!loan) return res.status(404).json({ message: 'Loan not found.' });
    if (loan.status !== 'pending') return res.status(400).json({ message: 'Loan is not pending.' });
    loan.status = 'approved';
    loan.updatedAt = new Date();
    await group.save();
    res.json({ message: 'Loan approved.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Decline a loan (admin)
exports.declineLoan = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    if (!group.admins.map(a => a.toString()).includes(req.user.userId)) {
      return res.status(403).json({ message: 'Only admins can decline loans.' });
    }
    const loan = group.loans.id(req.params.loanId);
    if (!loan) return res.status(404).json({ message: 'Loan not found.' });
    if (loan.status !== 'pending') return res.status(400).json({ message: 'Loan is not pending.' });
    loan.status = 'declined';
    loan.updatedAt = new Date();
    await group.save();
    res.json({ message: 'Loan declined.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Repay a loan (member or admin)
exports.repayLoan = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    const loan = group.loans.id(req.params.loanId);
    if (!loan) return res.status(404).json({ message: 'Loan not found' });
    // Only requester or admin can repay
    const isAdmin = group.admins.map(a => a.toString()).includes(req.user.userId);
    if (!isAdmin && loan.requester.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Only the requester or an admin can record a repayment.' });
    }
    const { amount } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ message: 'Amount required and must be > 0.' });
    loan.repayments.push({ amount, date: new Date() });
    // Optionally, mark as repaid if total repayments >= loan amount
    const totalRepaid = loan.repayments.reduce((sum, r) => sum + (r.amount || 0), 0);
    if (totalRepaid >= loan.amount) loan.status = 'repaid';
    loan.updatedAt = new Date();
    await group.save();
    res.json({ message: 'Repayment recorded', group });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Handle group contribution via Paystack
exports.contributeToGroup = async (req, res) => {
  try {
    const groupId = req.params.id;
    const { amount, paystackReference, method } = req.body;
    const userId = req.user.userId;
    if (!amount || !paystackReference) {
      return res.status(400).json({ message: 'Amount and Paystack reference are required.' });
    }
    // Verify payment with Paystack
    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    const verifyUrl = `https://api.paystack.co/transaction/verify/${paystackReference}`;
    const paystackRes = await axios.get(verifyUrl, {
      headers: { Authorization: `Bearer ${paystackSecret}` }
    });
    const paymentData = paystackRes.data;
    if (!paymentData.status || paymentData.data.status !== 'success' || paymentData.data.amount / 100 !== amount) {
      return res.status(400).json({ message: 'Payment verification failed or amount mismatch.' });
    }
    // Find group and check membership
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    if (!group.members.map(m => m.toString()).includes(userId)) {
      return res.status(403).json({ message: 'Only group members can contribute.' });
    }
    // Record contribution in group
    group.contributions.push({ 
      user: userId, 
      amount, 
      paystackReference,
      status: 'completed',
      verifiedAt: new Date(),
      method: method || 'paystack'
    });
    await group.save();
    // Optionally, record in Transaction model
    const transaction = new Transaction({
      user: userId,
      group: groupId,
      type: 'contribution',
      amount,
      status: 'completed',
      method: method || 'paystack',
      paystackReference,
      date: new Date(),
      reason: 'Group contribution'
    });
    await transaction.save();
    // Return updated group info
    await group.populate('contributions.user', 'name email');
    // Calculate totalSavings
    const totalSavings = group.contributions.filter(c => c.status === 'completed').reduce((sum, c) => sum + c.amount, 0);
    const groupObj = { ...group.toObject(), totalSavings };
    // Emit real-time update to group members
    if (io) {
      io.to(group._id.toString()).emit('groupContributionUpdated', { groupId: group._id, group: groupObj });
    }
    res.status(201).json({ message: 'Contribution successful', group: groupObj });
  } catch (err) {
    if (err.response && err.response.data) {
      return res.status(400).json({ message: 'Paystack verification failed', error: err.response.data });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Handle group payout to member via Paystack
exports.payoutToMember = async (req, res) => {
  try {
    const groupId = req.params.id;
    const { recipientId, amount, phoneNumber, mobileMoneyProvider, reason } = req.body;
    const adminId = req.user.userId;

    if (!recipientId || !amount || !phoneNumber || !mobileMoneyProvider) {
      return res.status(400).json({ message: 'Recipient, amount, phone number, and mobile money provider are required.' });
    }

    // Validate mobile money provider
    const validProviders = ['MTN', 'Vodafone', 'AirtelTigo'];
    if (!validProviders.includes(mobileMoneyProvider)) {
      return res.status(400).json({ message: 'Invalid mobile money provider. Must be MTN, Vodafone, or AirtelTigo.' });
    }

    // Find group and check admin permissions
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    if (!group.admins.map(a => a.toString()).includes(adminId)) {
      return res.status(403).json({ message: 'Only group admins can make payouts.' });
    }
    // Check if recipient is a member of the group
    if (!group.members.map(m => m.toString()).includes(recipientId)) {
      return res.status(403).json({ message: 'Recipient must be a member of this group.' });
    }
    // Check if group has sufficient funds
    const totalContributions = group.contributions.reduce((sum, c) => sum + c.amount, 0);
    const totalPayouts = group.payouts.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0);
    const availableFunds = totalContributions - totalPayouts;
    if (availableFunds < amount) {
      return res.status(400).json({ 
        message: 'Insufficient funds for payout.',
        availableFunds,
        requestedAmount: amount
      });
    }

    // --- PAYSTACK RECIPIENT LOGIC ---
    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    let recipientUser = await User.findById(recipientId);
    if (!recipientUser) return res.status(404).json({ message: 'Recipient user not found' });
    let recipientCode = null;
    if (Array.isArray(recipientUser.paystackRecipients)) {
      const found = recipientUser.paystackRecipients.find(r => r.phone === phoneNumber && r.provider === mobileMoneyProvider);
      if (found) recipientCode = found.recipientCode;
    }
    if (!recipientCode) {
      // Create recipient on Paystack
      const createRecipientRes = await axios.post('https://api.paystack.co/transferrecipient', {
        type: 'mobile_money',
        name: recipientUser.name,
        account_number: phoneNumber,
        bank_code: mobileMoneyProvider === 'MTN' ? 'MPS' : mobileMoneyProvider === 'Vodafone' ? 'VOD' : 'ATL',
        currency: 'GHS',
        metadata: { userId: recipientUser._id.toString() }
      }, {
        headers: { Authorization: `Bearer ${paystackSecret}` }
      });
      if (!createRecipientRes.data.status) {
        return res.status(400).json({ message: 'Failed to create Paystack recipient', error: createRecipientRes.data.message });
      }
      recipientCode = createRecipientRes.data.data.recipient_code;
      // Save to user
      recipientUser.paystackRecipients = recipientUser.paystackRecipients || [];
      recipientUser.paystackRecipients.push({ phone: phoneNumber, provider: mobileMoneyProvider, recipientCode });
      await recipientUser.save();
    }

    // --- INITIATE PAYSTACK TRANSFER ---
    const transferData = {
      source: 'balance',
      amount: amount * 100, // Convert to kobo
      recipient: recipientCode,
      reason: reason || 'Group payout'
    };
    const transferResponse = await axios.post('https://api.paystack.co/transfer', transferData, {
      headers: { 
        Authorization: `Bearer ${paystackSecret}`,
        'Content-Type': 'application/json'
      }
    });
    if (!transferResponse.data.status) {
      return res.status(400).json({ 
        message: 'Failed to initiate transfer',
        error: transferResponse.data.message 
      });
    }
    const transfer = transferResponse.data.data;
    // Record payout in group
    const payout = {
      recipient: recipientId,
      amount,
      phoneNumber,
      mobileMoneyProvider,
      status: 'processing',
      paystackReference: transfer.reference,
      reason: reason || 'Group payout',
      processedBy: adminId,
      processedAt: new Date()
    };
    group.payouts.push(payout);
    await group.save();
    // Record transaction
    const transaction = new Transaction({
      user: recipientId,
      group: groupId,
      type: 'payout',
      amount,
      status: 'processing',
      method: 'mobile_money',
      date: new Date(),
      reason: reason || 'Group payout'
    });
    await transaction.save();
    // Return updated group info
    await group.populate('payouts.recipient', 'name email');
    await group.populate('payouts.processedBy', 'name email');
    res.status(201).json({ 
      message: 'Payout initiated successfully', 
      payout,
      group,
      transferReference: transfer.reference
    });
  } catch (err) {
    if (err.response && err.response.data) {
      return res.status(400).json({ 
        message: 'Paystack transfer failed', 
        error: err.response.data.message || err.response.data 
      });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Verify payout status
exports.verifyPayoutStatus = async (req, res) => {
  try {
    const { groupId, payoutId } = req.params;
    const adminId = req.user.userId;

    // Find group and check admin permissions
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    
    if (!group.admins.map(a => a.toString()).includes(adminId)) {
      return res.status(403).json({ message: 'Only group admins can verify payouts.' });
    }

    const payout = group.payouts.id(payoutId);
    if (!payout) {
      return res.status(404).json({ message: 'Payout not found' });
    }

    // Verify with Paystack
    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    const verifyUrl = `https://api.paystack.co/transfer/verify/${payout.paystackReference}`;
    
    const paystackRes = await axios.get(verifyUrl, {
      headers: { Authorization: `Bearer ${paystackSecret}` }
    });

    const transferData = paystackRes.data.data;
    
    // Update payout status
    if (transferData.status === 'success') {
      payout.status = 'completed';
    } else if (transferData.status === 'failed') {
      payout.status = 'failed';
      payout.failureReason = transferData.failure_reason || 'Transfer failed';
    }

    await group.save();

    // Update transaction status
    await Transaction.findOneAndUpdate(
      { 
        user: payout.recipient, 
        group: groupId, 
        type: 'payout',
        paystackReference: payout.paystackReference 
      },
      { status: payout.status }
    );

    res.json({ 
      message: 'Payout status updated', 
      payout,
      transferStatus: transferData.status 
    });

  } catch (err) {
    if (err.response && err.response.data) {
      return res.status(400).json({ 
        message: 'Paystack verification failed', 
        error: err.response.data.message || err.response.data 
      });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Manual sync of Paystack transactions
exports.syncPaystackTransactions = async (req, res) => {
  try {
    const groupId = req.params.id;
    const userId = req.user.userId;
    
    // Find group and check membership
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    if (!group.members.map(m => m.toString()).includes(userId)) {
      return res.status(403).json({ message: 'Only group members can sync transactions.' });
    }

    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    const Transaction = require('../models/Transaction');
    
    // Get all pending contributions for this group
    const pendingContributions = group.contributions.filter(c => c.status === 'pending');
    let syncedCount = 0;
    let errors = [];

    for (const contribution of pendingContributions) {
      try {
        // Verify payment with Paystack
        const verifyUrl = `https://api.paystack.co/transaction/verify/${contribution.paystackReference}`;
        const paystackRes = await axios.get(verifyUrl, {
          headers: { Authorization: `Bearer ${paystackSecret}` }
        });
        
        const paymentData = paystackRes.data;
        if (paymentData.status && paymentData.data.status === 'success') {
          // Update contribution status
          contribution.status = 'completed';
          contribution.verifiedAt = new Date();
          contribution.amount = paymentData.data.amount / 100; // Update with actual amount
          
          // Create or update transaction record
          const existingTransaction = await Transaction.findOne({
            'paystackReference': contribution.paystackReference
          });

          if (!existingTransaction) {
            const newTransaction = new Transaction({
              user: contribution.user,
              group: groupId,
              type: 'contribution',
              amount: paymentData.data.amount / 100,
              status: 'completed',
              method: 'paystack',
              paystackReference: contribution.paystackReference,
              date: new Date(),
              reason: 'Group contribution'
            });
            await newTransaction.save();
          }
          
          syncedCount++;
        } else {
          errors.push(`Payment ${contribution.paystackReference} verification failed`);
        }
      } catch (err) {
        errors.push(`Error syncing ${contribution.paystackReference}: ${err.message}`);
      }
    }

    await group.save();
    await group.populate('contributions.user', 'name email');

    res.json({ 
      message: `Sync completed. ${syncedCount} transactions synced.`,
      syncedCount,
      errors,
      group
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update group settings (name, description, logo, monthlyContribution, loanInterest, loanLimit, schedule)
exports.updateGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    // Only allow if user is an admin
    if (!group.admins.map(a => a.toString()).includes(req.user.userId)) {
      return res.status(403).json({ message: 'Only an admin can update group settings.' });
    }
    const fields = [
      'name', 'description', 'logo', 'monthlyContribution', 'loanInterest', 'loanLimit', 'schedule'
    ];
    fields.forEach(field => {
      if (req.body[field] !== undefined) group[field] = req.body[field];
    });
    await group.save();
    res.json({ message: 'Group updated', group });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
// Upload group logo
exports.uploadGroupLogo = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    if (!group.admins.map(a => a.toString()).includes(req.user.userId)) {
      return res.status(403).json({ message: 'Only an admin can update group logo.' });
    }
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const logoUrl = `/uploads/${req.file.filename}`;
    group.logo = logoUrl;
    await group.save();
    res.json({ message: 'Group logo updated', logo: logoUrl, group });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};