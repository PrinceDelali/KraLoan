const express = require('express');
const router = express.Router();
const { createGroup, listGroups, joinGroup, deleteGroup, removeMember, getGroupMessages, postGroupMessage, postGroupMessageWithFile, editGroupMessage, deleteGroupMessage, requestLoan, approveLoan, declineLoan, repayLoan, getLoans, getGroupById, contributeToGroup } = require('../controllers/groupController');
const upload = require('../middleware/multerConfig');
const { getPendingRequests, approveJoinRequest, declineJoinRequest } = require('../controllers/groupController.admin.js');
const auth = require('../middleware/authMiddleware');

// Create a group
router.post('/', auth, createGroup);
// List all groups
router.get('/', auth, listGroups);
// Get a single group by ID (fully populated)
router.get('/:id', auth, getGroupById);
// Join a group
router.post('/:id/join', auth, joinGroup);
// Join group by invite token
router.post('/invite/:token/join', auth, require('../controllers/groupController').joinGroupByInviteToken);
// Delete a group (admin/creator only)
router.delete('/:id', auth, deleteGroup);
// Remove a member from group (admin/creator only)
router.post('/:id/remove-member', auth, removeMember);

// Admin: View pending join requests
router.get('/:id/pending-requests', auth, getPendingRequests);
// Admin: Approve join request
router.post('/:id/approve-request', auth, approveJoinRequest);
// Admin: Decline join request
router.post('/:id/decline-request', auth, declineJoinRequest);

// Group messages (announcement board)
router.get('/:id/messages', auth, getGroupMessages);
// If multipart/form-data, use upload.single('file') and postGroupMessageWithFile
router.post('/:id/messages', auth, (req, res, next) => {
  if (req.is('multipart/form-data')) {
    upload.single('file')(req, res, function (err) {
      if (err) return res.status(400).json({ message: err.message });
      postGroupMessageWithFile(req, res, next);
    });
  } else {
    postGroupMessage(req, res, next);
  }
});
// Edit and delete group messages
router.patch('/:groupId/messages/:messageId', auth, editGroupMessage);
router.delete('/:groupId/messages/:messageId', auth, deleteGroupMessage);

// Loan management
router.post('/:id/loans', auth, requestLoan);
router.get('/:id/loans', auth, getLoans);
router.post('/:id/loans/:loanId/approve', auth, approveLoan);
router.post('/:id/loans/:loanId/decline', auth, declineLoan);
router.post('/:id/loans/:loanId/repay', auth, repayLoan);

// Group contribution
router.post('/:id/contribute', auth, contributeToGroup);

module.exports = router;
