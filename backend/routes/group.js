const express = require('express');
const router = express.Router();
const { createGroup, listGroups, joinGroup, deleteGroup, removeMember } = require('../controllers/groupController');
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

module.exports = router;
