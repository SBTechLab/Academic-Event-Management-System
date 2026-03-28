const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Send event created confirmation to faculty
const sendEventCreatedEmail = async (facultyEmail, facultyName, eventTitle) => {
    const body = `Hello ${facultyName},\n\nYour event \"${eventTitle}\" has been submitted successfully and is now pending admin approval.\n\nStatus: Pending\n\nUniEvents - Academic Event Management System`;

    await transporter.sendMail({
        from: `"UniEvents" <${process.env.EMAIL_USER}>`,
        to: facultyEmail,
        subject: `Event submitted: ${eventTitle}`,
        text: body
    });
};

// Send event approved/rejected email to faculty
const sendEventStatusEmail = async (facultyEmail, facultyName, eventTitle, status, rejectionReason) => {
    const body = `Hello ${facultyName},\n\nYour event \"${eventTitle}\" has been ${status}.\n${status === 'rejected' ? `Reason: ${rejectionReason || 'None provided'}` : ''}\n\nStatus: ${status}\n\nUniEvents - Academic Event Management System`;

    await transporter.sendMail({
        from: `"UniEvents" <${process.env.EMAIL_USER}>`,
        to: facultyEmail,
        subject: `Event ${status === 'approved' ? 'approved' : 'rejected'}: ${eventTitle}`,
        text: body
    });
};

// Send coordinator approved email to student
const sendCoordinatorApprovedEmail = async (studentEmail, studentName, eventTitle, permissions) => {
    const perms = permissions && permissions.length ? permissions.join(', ') : 'Standard permissions';
    const body = `Hello ${studentName},\n\nYour request to be coordinator for \"${eventTitle}\" is approved.\nPermissions granted: ${perms}.\n\nUniEvents - Academic Event Management System`;

    await transporter.sendMail({
        from: `"UniEvents" <${process.env.EMAIL_USER}>`,
        to: studentEmail,
        subject: `Coordinator approved: ${eventTitle}`,
        text: body
    });
};

// Send participant registration confirmation to student
const sendParticipantRegistrationEmail = async (studentEmail, studentName, eventTitle, eventDate, eventLocation) => {
    const body = `Hello ${studentName},\n\nYou are registered for \"${eventTitle}\".\nDate: ${new Date(eventDate).toLocaleDateString()}\nLocation: ${eventLocation}\n\nUniEvents - Academic Event Management System`;

    await transporter.sendMail({
        from: `"UniEvents" <${process.env.EMAIL_USER}>`,
        to: studentEmail,
        subject: `Registration confirmed: ${eventTitle}`,
        text: body
    });
};

// Notify admin when a new event is submitted by faculty
const sendNewEventToAdmin = async (adminEmail, facultyName, eventTitle) => {
    const submissionTime = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'long', timeStyle: 'short' });
    const cfg = { color: '#f59e0b', gradient: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #1e40af 100%)', tagBg: 'linear-gradient(135deg, #f59e0b, #d97706)', tagText: '#000' };

    await transporter.sendMail({
        from: `"UniEvents Admin" <${process.env.EMAIL_USER}>`,
        to: adminEmail,
        subject: `Admin Action Required: New Event Submitted`,
        text: `Hello Administrator,\n\nA faculty member has submitted a new event proposal.\n\nEvent Title: ${eventTitle}\nSubmitted By (Faculty): ${facultyName}\nSubmission Time: ${submissionTime}\n\nPlease log in to the Admin Dashboard to review the full details of this event and either approve or reject the proposal.\n\nUniEvents - Academic Event Management System`
    });
};

// Notify faculty when a student requests coordinator role
const sendCoordinatorRequestToFaculty = async (facultyEmail, studentName, studentEmail) => {
    await transporter.sendMail({
        from: `"UniEvents" <${process.env.EMAIL_USER}>`,
        to: facultyEmail,
        subject: `New Coordinator Request from ${studentName}`,
        text: `A student has requested to become a coordinator.\n\nStudent: ${studentName}\nEmail: ${studentEmail}\n\nPlease log in to review this request.\n\n— UniEvents Team`
    });
};

// Notify student that their coordinator request is pending
const sendCoordinatorPendingEmail = async (studentEmail, studentName, eventTitle) => {
    const body = `Hello ${studentName},\n\nYour request to become coordinator for "${eventTitle}" is under review.\nStatus: Pending\n\nUniEvents - Academic Event Management System`;
    await transporter.sendMail({
        from: `"UniEvents" <${process.env.EMAIL_USER}>`,
        to: studentEmail,
        subject: `Coordinator request pending: ${eventTitle}`,
        text: body
    });
};

// Notify student when coordinator request is rejected
const sendCoordinatorRejectedEmail = async (studentEmail, studentName) => {
    await transporter.sendMail({
        from: `"UniEvents" <${process.env.EMAIL_USER}>`,
        to: studentEmail,
        subject: `Coordinator Request Update`,
        text: `Hello ${studentName},\n\nUnfortunately, your request to become a general coordinator has been rejected.\n\nYou may contact the administration for more details or try applying again later.\n\nUniEvents - Academic Event Management System`
    });
};

// Notify student when their registration is rejected
const sendRegistrationRejectedEmail = async (studentEmail, studentName, eventTitle, rejectionReason, roleType = 'participant') => {
    const typeLabel = roleType === 'coordinator' ? 'Coordinator Request' : 'Registration';
    const body = `Hello ${studentName},\n\nYour ${typeLabel.toLowerCase()} for "${eventTitle}" has been rejected.\nReason: ${rejectionReason || 'No reason provided'}\n\nUniEvents - Academic Event Management System`;
    await transporter.sendMail({
        from: `"UniEvents" <${process.env.EMAIL_USER}>`,
        to: studentEmail,
        subject: `${typeLabel} rejected: ${eventTitle}`,
        text: body
    });
};

// Send login notification email to admin/student
const sendLoginNotificationEmail = async (userEmail, userName, role) => {
    const loginTime = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    const loginDate = new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const roleLabel = role.charAt(0).toUpperCase() + role.replace('_', ' ').slice(1);
    
    await transporter.sendMail({
        from: `"UniEvents" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: `Login Alert — UniEvents | ${loginTime}`,
        text: `Hello ${userName},\n\nWe detected a successful sign-in to your UniEvents account.\n\nAccount Name: ${userName}\nEmail Address: ${userEmail}\nAssigned Role: ${roleLabel}\nLogin Date & Time (IST): ${loginTime}\n${loginDate}\n\nIf you didn't authorize this login, please change your password immediately and contact the system administrator.\n\nUniEvents - Academic Event Management System\n\n© ${new Date().getFullYear()} UniEvents · This is an automated security notification`
    });
};

// Send welcome email on new registration
const sendWelcomeEmail = async (userEmail, userName, role) => {
    const roleLabel = role.charAt(0).toUpperCase() + role.replace('_', ' ').slice(1);
    const roleConfig = {
        admin: { emoji: '👑', color: '#f59e0b', gradient: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #1e40af 100%)', tagBg: 'linear-gradient(135deg, #f59e0b, #d97706)', tagText: '#000' },
        student: { emoji: '🎓', color: '#34d399', gradient: 'linear-gradient(135deg, #0f172a 0%, #064e3b 50%, #059669 100%)', tagBg: 'linear-gradient(135deg, #34d399, #10b981)', tagText: '#000' },
        faculty: { emoji: '📚', color: '#60a5fa', gradient: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #2563eb 100%)', tagBg: 'linear-gradient(135deg, #60a5fa, #3b82f6)', tagText: '#000' }
    };
    const cfg = roleConfig[role] || roleConfig.student;

    await transporter.sendMail({
        from: `"UniEvents" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: `Welcome to UniEvents, ${userName}!`,
        text: `Hello ${userName},\n\nWelcome aboard! Your UniEvents account is ready.\n\nName: ${userName}\nEmail: ${userEmail}\nRole: ${roleLabel}\n\nYou can now:\n- Browse and register for upcoming events\n- Track your event registrations\n- Apply to become a Student Coordinator\n- Get real-time notifications\n\nUniEvents - Academic Event Management System`
    });
};

// Send approval email when coordinator role request is approved by admin
const sendCoordinatorRoleApprovedEmail = async (studentEmail, studentName) => {
    await transporter.sendMail({
        from: `"UniEvents" <${process.env.EMAIL_USER}>`,
        to: studentEmail,
        subject: `Coordinator Role Approved — UniEvents`,
        text: `Hello ${studentName},\n\nCongratulations! The faculty has approved your request to become a Student Coordinator on UniEvents.\n\nYou can now:\n- Access Coordinator Dashboard\n- Manage event participants\n- Update event schedules\n- Generate certificates\n\nPlease log out and log back in to your account to see the new Coordinator Dashboard link in your sidebar.\n\nUniEvents - Academic Event Management System`
    });
};

// Generic send email function
const sendEmail = async ({ to, subject, html }) => {
    await transporter.sendMail({
        from: `"UniEvents" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html
    });
};

// Helper: get admin emails from database
const getAdminEmails = async (supabase) => {
    try {
        const { data: adminRole } = await supabase
            .from('roles')
            .select('id')
            .eq('name', 'admin')
            .single();
        
        if (!adminRole) return [];
        
        const { data: admins } = await supabase
            .from('users')
            .select('email')
            .eq('role_id', adminRole.id);
        
        return admins ? admins.map(a => a.email) : [];
    } catch (err) {
        console.error('Error fetching admin emails:', err);
        return [];
    }
};

// Helper: get faculty emails from database
const getFacultyEmails = async (supabase) => {
    try {
        const { data: facultyRole } = await supabase
            .from('roles')
            .select('id')
            .eq('name', 'faculty')
            .single();
        
        if (!facultyRole) return [];
        
        const { data: faculties } = await supabase
            .from('users')
            .select('email')
            .eq('role_id', facultyRole.id);
        
        return faculties ? faculties.map(f => f.email) : [];
    } catch (err) {
        console.error('Error fetching faculty emails:', err);
        return [];
    }
};

module.exports = {
    sendEmail,
    sendEventCreatedEmail,
    sendEventStatusEmail,
    sendCoordinatorApprovedEmail,
    sendParticipantRegistrationEmail,
    sendNewEventToAdmin,
    sendCoordinatorRequestToFaculty,
    sendCoordinatorPendingEmail,
    sendCoordinatorRejectedEmail,
    sendCoordinatorRoleApprovedEmail,
    sendRegistrationRejectedEmail,
    sendLoginNotificationEmail,
    sendWelcomeEmail,
    getAdminEmails,
    getFacultyEmails
};
