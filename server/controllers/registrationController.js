const supabase = require('../config/supabase');

// Register for an event
const registerForEvent = async (req, res) => {
    const { event_id } = req.body;
    const student_id = req.user.id;

    try {
        // Check if already registered
        const { data: existing, error: checkError } = await supabase
            .from('registrations')
            .select('*')
            .eq('event_id', event_id)
            .eq('student_id', student_id)
            .single();

        if (existing) {
            return res.status(400).json({ error: 'Already registered for this event' });
        }

        const { data, error } = await supabase
            .from('registrations')
            .insert([{ event_id, student_id, status: 'registered' }])
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

// Get registrations for an event (Faculty/Coordinator)
const getEventRegistrations = async (req, res) => {
    const { eventId } = req.params;

    try {
        const { data, error } = await supabase
            .from('registrations')
            .select(`
        *,
        student:student_id(full_name, email)
      `)
            .eq('event_id', eventId);

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

// Get my registrations (Student)
const getMyRegistrations = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('registrations')
            .select(`
        *,
        event:event_id(title, date, time, location)
      `)
            .eq('student_id', req.user.id);

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

// Update registration status (Coordinator/Faculty)
const updateRegistrationStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const { data, error } = await supabase
            .from('registrations')
            .update({ status })
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

module.exports = {
    registerForEvent,
    getEventRegistrations,
    getMyRegistrations,
    updateRegistrationStatus,
};
