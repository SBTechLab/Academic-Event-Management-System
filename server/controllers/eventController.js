const supabase = require('../config/supabase');

// Get all events
const getEvents = async (req, res) => {
    try {
        const { data: events, error } = await supabase
            .from('events')
            .select(`
                *,
                creator:users!created_by(full_name, email)
            `)
            .order('date', { ascending: true });

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(events);
    } catch (err) {
        console.error('Get events error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get single event
const getEventById = async (req, res) => {
    const { id } = req.params;

    try {
        const { data: event, error } = await supabase
            .from('events')
            .select(`
                *,
                creator:users!created_by(full_name, email)
            `)
            .eq('id', id)
            .single();

        if (error) {
            return res.status(404).json({ error: 'Event not found' });
        }

        res.json(event);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

// Create event
const createEvent = async (req, res) => {
    const { title, description, date, time, location, coordinator_id, image_url, event_type } = req.body;

    try {
        const { data, error } = await supabase
            .from('events')
            .insert([
                {
                    title,
                    description,
                    date,
                    time,
                    location,
                    coordinator_id,
                    image_url,
                    event_type: event_type || 'general',
                    created_by: req.user.id,
                    status: 'pending'
                }
            ])
            .select()
            .single();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.status(201).json(data);
    } catch (err) {
        console.error('Create event error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Update event
const updateEvent = async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    try {
        // Get the event first to check status change
        const { data: oldEvent } = await supabase
            .from('events')
            .select('status, created_by, title')
            .eq('id', id)
            .single();

        const { data, error } = await supabase
            .from('events')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        // Create notification if status changed
        if (oldEvent && updates.status && oldEvent.status !== updates.status) {
            const message = updates.status === 'approved' 
                ? `Your event "${oldEvent.title}" has been approved!`
                : `Your event "${oldEvent.title}" has been rejected.`;

            await supabase
                .from('notifications')
                .insert([{
                    user_id: oldEvent.created_by,
                    message: message,
                    type: updates.status === 'approved' ? 'success' : 'warning',
                    is_read: false
                }]);
        }

        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

// Delete event
const deleteEvent = async (req, res) => {
    const { id } = req.params;

    try {
        const { error } = await supabase
            .from('events')
            .delete()
            .eq('id', id);

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json({ message: 'Event deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

// Get event report (admin only)
const getEventReport = async (req, res) => {
    try {
        const { data: events, error } = await supabase
            .from('events')
            .select(`
                *,
                creator:users!created_by(full_name, email),
                registrations(count)
            `)
            .order('date', { ascending: false });

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        const report = events.map(event => ({
            ...event,
            registration_count: event.registrations?.[0]?.count || 0
        }));

        res.json(report);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    getEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent,
    getEventReport,
};
