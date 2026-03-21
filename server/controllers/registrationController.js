const supabase = require('../config/supabase');
const { sendParticipantRegistrationEmail, sendCoordinatorApprovedEmail } = require('../config/emailService');

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

        // Send confirmation email for participant
        if (role_type === 'participant') {
            try {
                const { data: student } = await supabase.from('users').select('full_name, email').eq('id', student_id).single();
                const { data: event } = await supabase.from('events').select('title, date, location').eq('id', event_id).single();
                if (student && event) {
                    await sendParticipantRegistrationEmail(student.email, student.full_name, event.title, event.date, event.location);
                }
            } catch (emailErr) {
                console.error('Email error:', emailErr);
            }
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
            .select('id, status, role_type, coordinator_permissions, rejection_reason, student_id, user:student_id(full_name, email)')
            .eq('event_id', eventId);

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.set('Cache-Control', 'public, max-age=30');
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
            .select('id, status, role_type, coordinator_permissions, rejection_reason, event_id, event:event_id(id, title, date, time, location, status)')
            .eq('student_id', req.user.id)
            .order('id', { ascending: false });

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.set('Cache-Control', 'no-store');
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

// Update registration status (Coordinator/Faculty)
const updateRegistrationStatus = async (req, res) => {
    const { id } = req.params;
    const { status, rejection_reason, coordinator_permissions } = req.body;

    try {
        const updateData = { status };
        if (rejection_reason) {
            updateData.rejection_reason = rejection_reason;
        }
        if (coordinator_permissions) {
            updateData.coordinator_permissions = coordinator_permissions;
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

        // Send email if coordinator approved
        if (status === 'approved' && coordinator_permissions) {
            try {
                const { data: reg } = await supabase
                    .from('registrations')
                    .select('student_id, event_id')
                    .eq('id', id)
                    .single();
                if (reg) {
                    const { data: student } = await supabase.from('users').select('full_name, email').eq('id', reg.student_id).single();
                    const { data: event } = await supabase.from('events').select('title').eq('id', reg.event_id).single();
                    if (student && event) {
                        await sendCoordinatorApprovedEmail(student.email, student.full_name, event.title, coordinator_permissions);
                    }
                }
            } catch (emailErr) {
                console.error('Email error:', emailErr);
            }
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
