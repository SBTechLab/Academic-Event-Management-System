const supabase = require('../config/supabase');

// Get all events
const getEvents = async (req, res) => {
    try {
        const { data: events, error } = await supabase
            .from('events')
            .select(`
        *,
        creator:created_by(full_name),
        coordinator:coordinator_id(full_name)
      `)
            .order('date', { ascending: true });

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(events);
    } catch (err) {
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
        creator:created_by(full_name),
        coordinator:coordinator_id(full_name)
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
    const { title, description, date, time, location, coordinator_id, image_url } = req.body;

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
                    created_by: req.user.id,
                    status: 'pending' // Default status
                }
            ])
            .select()
            .single();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.status(201).json(data);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

// Update event
const updateEvent = async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    try {
        const { data, error } = await supabase
            .from('events')
            .update(updates)
            .eq('id', id)
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

module.exports = {
    getEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent,
};
