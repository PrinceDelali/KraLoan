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

// Remove a member from group (only by admin/creator)
exports.removeMember = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    // Only allow if user is an admin
    if (!group.admins.map(a => a.toString()).includes(req.user.userId)) {
      return res.status(403).json({ message: 'Only an admin can remove members.' });
    }
    const memberId = req.body.userId;
    if (!memberId) return res.status(400).json({ message: 'No userId provided.' });
    // Remove from group members
    group.members = group.members.filter(m => m.toString() !== memberId);
    await group.save();
    // Remove group from user's group list
    await User.findByIdAndUpdate(memberId, { $pull: { groups: group._id } });
    res.json({ message: 'Member removed.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
