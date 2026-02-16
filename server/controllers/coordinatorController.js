const supabase = require('../config/supabase');

// Apply for coordinator role
const applyForCoordinator = async (req, res) => {
  try {
    const { reason } = req.body;
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('coordinator_applications')
      .insert({ user_id: userId, reason })
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all applications (Admin/Faculty only)
const getAllApplications = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('coordinator_applications')
      .select(`
        *,
        user:users!coordinator_applications_user_id_fkey(id, email, full_name)
      `)
      .order('applied_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get user's own application
const getMyApplication = async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('coordinator_applications')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    res.json({ success: true, data: data || null });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Approve/Reject application (Admin/Faculty only)
const reviewApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const reviewerId = req.user.id;

    // Update application status
    const { data: application, error: appError } = await supabase
      .from('coordinator_applications')
      .update({
        status,
        reviewed_by: reviewerId,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (appError) throw appError;

    // If approved, update user role
    if (status === 'approved') {
      const { data: coordRole } = await supabase
        .from('roles')
        .select('id')
        .eq('name', 'student_coordinator')
        .single();

      const { error: roleError } = await supabase
        .from('users')
        .update({ role_id: coordRole.id })
        .eq('id', application.user_id);

      if (roleError) throw roleError;

      // Send notification
      await supabase.from('notifications').insert({
        user_id: application.user_id,
        message: 'Your coordinator application has been approved!'
      });
    } else if (status === 'rejected') {
      await supabase.from('notifications').insert({
        user_id: application.user_id,
        message: 'Your coordinator application has been rejected.'
      });
    }

    res.json({ success: true, data: application });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  applyForCoordinator,
  getAllApplications,
  getMyApplication,
  reviewApplication
};
