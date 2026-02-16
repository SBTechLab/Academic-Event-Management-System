const supabase = require('../config/supabase');

// Student: Request to become coordinator
const requestCoordinator = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('coordinator_requests')
            .insert([{ student_id: req.user.id }])
            .select()
            .single();

        if (error) {
            if (error.code === '23505') {
                return res.status(400).json({ error: 'Request already exists' });
            }
            return res.status(400).json({ error: error.message });
        }

        res.status(201).json(data);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

// Faculty/Admin: Get all pending requests
const getPendingRequests = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('coordinator_requests')
            .select('*, student:student_id(id, email, full_name)')
            .eq('status', 'pending')
            .order('requested_at', { ascending: false });

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

// Faculty/Admin: Approve/Reject request
const reviewRequest = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }

    try {
        const { data: request, error: fetchError } = await supabase
            .from('coordinator_requests')
            .select('student_id')
            .eq('id', id)
            .single();

        if (fetchError) {
            return res.status(404).json({ error: 'Request not found' });
        }

        const { error: updateError } = await supabase
            .from('coordinator_requests')
            .update({ status, reviewed_by: req.user.id, reviewed_at: new Date() })
            .eq('id', id);

        if (updateError) {
            return res.status(400).json({ error: updateError.message });
        }

        if (status === 'approved') {
            const { data: roleData } = await supabase
                .from('roles')
                .select('id')
                .eq('name', 'student_coordinator')
                .single();

            if (roleData) {
                await supabase
                    .from('users')
                    .update({ role_id: roleData.id })
                    .eq('id', request.student_id);
            }

            await supabase
                .from('notifications')
                .insert([{
                    user_id: request.student_id,
                    message: 'Your coordinator request has been approved!'
                }]);
        } else {
            await supabase
                .from('notifications')
                .insert([{
                    user_id: request.student_id,
                    message: 'Your coordinator request has been rejected.'
                }]);
        }

        res.json({ message: `Request ${status}` });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

// Student: Get own request status
const getMyRequest = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('coordinator_requests')
            .select('*')
            .eq('student_id', req.user.id)
            .single();

        if (error && error.code !== 'PGRST116') {
            return res.status(400).json({ error: error.message });
        }

        res.json(data || null);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    requestCoordinator,
    getPendingRequests,
    reviewRequest,
    getMyRequest
};
