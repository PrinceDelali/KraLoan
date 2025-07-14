const express = require('express');
const router = express.Router();
const { createGroup, listGroups, joinGroup, deleteGroup, removeMember } = require('../controllers/groupController');
const { getPendingRequests, approveJoinRequest, declineJoinRequest } = require('../controllers/groupController.admin');
const auth = require('../middleware/authMiddleware');

// Create a group
router.post('/', auth, createGroup);
// List all groups
router.get('/', auth, listGroups);
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

module.exports = router;
