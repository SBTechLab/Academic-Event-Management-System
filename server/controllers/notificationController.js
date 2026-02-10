const supabase = require('../config/supabase');

// Get my notifications
const getMyNotifications = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', req.user.id)
            .order('created_at', { ascending: false });

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

// Mark notification as read
const markAsRead = async (req, res) => {
    const { id } = req.params;

    try {
        const { data, error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', id)
            .eq('user_id', req.user.id) // Ensure ownership
            .select()
            .single();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    getMyNotifications,
    markAsRead,
};
