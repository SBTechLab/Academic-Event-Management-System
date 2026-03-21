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
    await transporter.sendMail({
        from: `"UniEvents" <${process.env.EMAIL_USER}>`,
        to: facultyEmail,
        subject: `Event Submitted: ${eventTitle}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                <h2 style="color: #3674B5;">Event Submitted Successfully</h2>
                <p>Dear <strong>${facultyName}</strong>,</p>
                <p>Your event <strong>"${eventTitle}"</strong> has been submitted and is now <span style="color: #f59e0b; font-weight: bold;">pending admin approval</span>.</p>
                <p>You will be notified once the admin reviews your event.</p>
                <br/>
                <p style="color: #888; font-size: 13px;">— UniEvents Team</p>
            </div>
        `
    });
};

// Send event approved/rejected email to faculty
const sendEventStatusEmail = async (facultyEmail, facultyName, eventTitle, status, rejectionReason) => {
    const isApproved = status === 'approved';
    await transporter.sendMail({
        from: `"UniEvents" <${process.env.EMAIL_USER}>`,
        to: facultyEmail,
        subject: `Event ${isApproved ? 'Approved' : 'Rejected'}: ${eventTitle}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                <h2 style="color: ${isApproved ? '#16a34a' : '#dc2626'};">Event ${isApproved ? 'Approved ✓' : 'Rejected ✗'}</h2>
                <p>Dear <strong>${facultyName}</strong>,</p>
                <p>Your event <strong>"${eventTitle}"</strong> has been <strong style="color: ${isApproved ? '#16a34a' : '#dc2626'};">${status}</strong> by the admin.</p>
                ${!isApproved && rejectionReason ? `
                <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 12px; margin: 16px 0; border-radius: 4px;">
                    <strong>Reason:</strong> ${rejectionReason}
                </div>` : ''}
                <br/>
                <p style="color: #888; font-size: 13px;">— UniEvents Team</p>
            </div>
        `
    });
};

// Send coordinator approved email to student
const sendCoordinatorApprovedEmail = async (studentEmail, studentName, eventTitle, permissions) => {
    const permissionLabels = {
        generate_certificates: '📜 Generate Certificates',
        view_participants: '👥 View Participant List',
        update_schedule: '📅 Update Schedule',
        add_details: '✏️ Add Event Details'
    };
    const permList = permissions.map(p => `<li>${permissionLabels[p] || p}</li>`).join('');

    await transporter.sendMail({
        from: `"UniEvents" <${process.env.EMAIL_USER}>`,
        to: studentEmail,
        subject: `Coordinator Request Approved: ${eventTitle}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                <h2 style="color: #7c3aed;">🎉 Coordinator Request Approved!</h2>
                <p>Dear <strong>${studentName}</strong>,</p>
                <p>Congratulations! Your coordinator request for <strong>"${eventTitle}"</strong> has been <strong style="color: #16a34a;">approved</strong>.</p>
                <div style="background: #f5f3ff; border-left: 4px solid #7c3aed; padding: 12px; margin: 16px 0; border-radius: 4px;">
                    <strong>Permissions Granted:</strong>
                    <ul style="margin: 8px 0 0 0;">${permList}</ul>
                </div>
                <p>You can now access the <strong>Coordinator Dashboard</strong> from your student dashboard.</p>
                <br/>
                <p style="color: #888; font-size: 13px;">— UniEvents Team</p>
            </div>
        `
    });
};

// Send participant registration confirmation to student
const sendParticipantRegistrationEmail = async (studentEmail, studentName, eventTitle, eventDate, eventLocation) => {
    await transporter.sendMail({
        from: `"UniEvents" <${process.env.EMAIL_USER}>`,
        to: studentEmail,
        subject: `Registration Confirmed: ${eventTitle}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                <h2 style="color: #3674B5;">Registration Confirmed ✓</h2>
                <p>Dear <strong>${studentName}</strong>,</p>
                <p>You have successfully registered for <strong>"${eventTitle}"</strong>.</p>
                <div style="background: #eff6ff; border-left: 4px solid #3674B5; padding: 12px; margin: 16px 0; border-radius: 4px;">
                    <p style="margin: 4px 0;">📅 <strong>Date:</strong> ${new Date(eventDate).toLocaleDateString()}</p>
                    <p style="margin: 4px 0;">📍 <strong>Location:</strong> ${eventLocation}</p>
                </div>
                <p>We look forward to seeing you at the event!</p>
                <br/>
                <p style="color: #888; font-size: 13px;">— UniEvents Team</p>
            </div>
        `
    });
};

module.exports = {
    sendEventCreatedEmail,
    sendEventStatusEmail,
    sendCoordinatorApprovedEmail,
    sendParticipantRegistrationEmail
};
