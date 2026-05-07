const supabase = require('../config/supabase');
const { sendEventCreatedEmail, sendEventStatusEmail, sendNewEventToAdmin, getAdminEmails, sendNewEventToStudents } = require('../config/emailService');

// Get all events
const getEvents = async (req, res) => {
    try {
        const { limit = 50 } = req.query;
        
        const { data: events, error } = await supabase
            .from('events')
            .select('id, title, description, date, time, location, status, event_type, image_url, eligible_years, created_at, created_by, creator:users!created_by(full_name)')
            .order('date', { ascending: true })
            .limit(parseInt(limit));

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.set('Cache-Control', 'public, max-age=60');
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

        res.set('Cache-Control', 'public, max-age=60');
        res.json(event);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

// Create event
const createEvent = async (req, res) => {
    const { title, description, date, time, location, coordinator_id, image_url, event_type, eligible_years } = req.body;

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
                    eligible_years: eligible_years || ['1', '2', '3', '4'],
                    created_by: req.user.id,
                    status: 'pending'
                }
            ])
            .select()
            .single();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        // Send confirmation email to faculty
        try {
            const { data: creator } = await supabase
                .from('users')
                .select('full_name, email')
                .eq('id', req.user.id)
                .single();
            if (creator) {
                await sendEventCreatedEmail(creator.email, creator.full_name, title);
            }
        } catch (emailErr) {
            console.error('Email error:', emailErr);
        }

        // Notify admin about new pending event
        try {
            const adminEmails = await getAdminEmails(supabase);
            const { data: creator } = await supabase
                .from('users')
                .select('full_name')
                .eq('id', req.user.id)
                .single();
            for (const adminEmail of adminEmails) {
                await sendNewEventToAdmin(adminEmail, creator?.full_name || 'A faculty member', title);
            }
        } catch (emailErr) {
            console.error('Admin email error:', emailErr);
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

            // Send email to faculty
            try {
                const { data: creator } = await supabase
                    .from('users')
                    .select('full_name, email')
                    .eq('id', oldEvent.created_by)
                    .single();
                if (creator) {
                    await sendEventStatusEmail(
                        creator.email,
                        creator.full_name,
                        oldEvent.title,
                        updates.status,
                        updates.rejection_reason
                    );
                }
            } catch (emailErr) {
                console.error('Email error:', emailErr);
            }

            // Notify all students when event is approved
            if (updates.status === 'approved') {
                try {
                    const { data: roleData } = await supabase
                        .from('roles')
                        .select('id')
                        .eq('name', 'student')
                        .single();

                    const { data: coordRoleData } = await supabase
                        .from('roles')
                        .select('id')
                        .eq('name', 'student_coordinator')
                        .single();

                    const roleIds = [roleData?.id, coordRoleData?.id].filter(Boolean);

                    const { data: students } = await supabase
                        .from('users')
                        .select('email, full_name')
                        .in('role_id', roleIds);

                    if (students && students.length > 0) {
                        const eventDetails = await supabase
                            .from('events')
                            .select('date, time, location, event_type')
                            .eq('id', id)
                            .single();

                        for (const student of students) {
                            await sendNewEventToStudents(
                                student.email,
                                student.full_name,
                                oldEvent.title,
                                eventDetails.data?.date,
                                eventDetails.data?.time,
                                eventDetails.data?.location,
                                eventDetails.data?.event_type
                            ).catch(err => console.error('Student email error:', err));
                        }
                    }
                } catch (emailErr) {
                    console.error('Student notification error:', emailErr);
                }
            }
        }

        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

// Delete event
const deleteEvent = async (req, res) => {
    const { id } = req.params;
    const { reason } = req.body;

    try {
        const { data: event } = await supabase
            .from('events')
            .select('title, created_by')
            .eq('id', id)
            .single();

        const { error } = await supabase
            .from('events')
            .delete()
            .eq('id', id);

        if (error) return res.status(400).json({ error: error.message });

        if (event) {
            await supabase.from('notifications').insert([{
                user_id: event.created_by,
                message: `Your event "${event.title}" has been deleted by admin.${ reason ? ` Reason: ${reason}` : '' }`,
                type: 'warning',
                is_read: false
            }]);
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
