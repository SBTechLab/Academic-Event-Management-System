const supabase = require('../config/supabase');

// Register for an event
const registerForEvent = async (req, res) => {
    const { event_id, role_type = 'participant' } = req.body;
    const student_id = req.user.id;

    try {
        // Check if already registered
        const { data: existing } = await supabase
            .from('registrations')
            .select('id')
            .eq('event_id', event_id)
            .eq('student_id', student_id)
            .maybeSingle();

        if (existing) {
            return res.status(400).json({ error: 'Already registered for this event' });
        }
        
        const status = role_type === 'coordinator' ? 'pending' : 'registered';
        
        const { data, error } = await supabase
            .from('registrations')
            .insert([{ 
                event_id, 
                student_id, 
                status,
                role_type
            }])
            .select()
            .single();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.status(201).json(data);
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Check if student is registered for an event
const checkRegistration = async (req, res) => {
    const { eventId } = req.params;
    const student_id = req.user.id;

    try {
        const { data } = await supabase
            .from('registrations')
            .select('*')
            .eq('event_id', eventId)
            .eq('student_id', student_id)
            .maybeSingle();

        res.json({ registered: !!data, registration: data });
    } catch (err) {
        console.error('Check registration error:', err);
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
                user:student_id(full_name, email),
                event:event_id(id, title, date, time, location)
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
            .eq('student_id', req.user.id)
            .order('id', { ascending: false });

        if (error) {
            console.error('Get my registrations error:', error);
            return res.status(400).json({ error: error.message });
        }

        console.log('Registrations fetched:', data); // Debug log
        res.json(data);
    } catch (err) {
        console.error('Server error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Update registration status (Coordinator/Faculty)
const updateRegistrationStatus = async (req, res) => {
    const { id } = req.params;
    const { status, rejection_reason } = req.body;

    try {
        const updateData = { status };
        if (rejection_reason) {
            updateData.rejection_reason = rejection_reason;
        }
        
        const { data, error } = await supabase
            .from('registrations')
            .update(updateData)
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
    checkRegistration,
    getEventRegistrations,
    getMyRegistrations,
    updateRegistrationStatus,
};
