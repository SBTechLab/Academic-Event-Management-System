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
    const cfg = { color: '#38bdf8', gradient: 'linear-gradient(135deg, #0f172a 0%, #0369a1 50%, #0c4a6e 100%)' };
    await transporter.sendMail({
        from: `"UniEvents" <${process.env.EMAIL_USER}>`,
        to: facultyEmail,
        subject: `Event Submitted: ${eventTitle}`,
        html: `
            <div style="font-family: 'Segoe UI', -apple-system, Arial, sans-serif; max-width: 620px; margin: 0 auto; background: #0f172a; border-radius: 20px; overflow: hidden;">
                <!-- Header -->
                <div style="background: ${cfg.gradient}; padding: 30px 32px 24px; text-align: center; position: relative;">
                    <div style="position: absolute; top: -20px; right: -20px; width: 70px; height: 70px; border-radius: 50%; background: rgba(255,255,255,0.03);"></div>
                    <div style="width: 60px; height: 60px; margin: 0 auto 14px; background: rgba(255,255,255,0.1); border-radius: 50%; border: 2px solid rgba(255,255,255,0.15);">
                        <span style="font-size: 28px; line-height: 60px;">🚀</span>
                    </div>
                    <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 800;">Event Submitted!</h1>
                    <p style="color: rgba(255,255,255,0.6); margin: 6px 0 0; font-size: 13px;">Successfully sent for admin approval</p>
                    <div style="margin-top: 16px;">
                        <span style="background: rgba(245, 158, 11, 0.15); color: #fbd38d; padding: 6px 20px; border-radius: 30px; font-size: 12px; font-weight: 600; border: 1px solid rgba(245, 158, 11, 0.3);">STATUS: PENDING</span>
                    </div>
                </div>

                <!-- Greeting -->
                <div style="padding: 24px 32px 0;">
                    <p style="color: #e2e8f0; font-size: 15px; margin: 0; line-height: 1.6;">Hello <strong style="color: ${cfg.color};">${facultyName}</strong></p>
                    <p style="color: #94a3b8; font-size: 13px; margin: 8px 0 0; line-height: 1.6;">
                        Your event <strong>"${eventTitle}"</strong> has been submitted and is currently pending admin approval. You will be notified once the admin reviews your event.
                    </p>
                </div>
                
                <!-- Divider -->
                <div style="padding: 24px 32px 0;">
                    <div style="height: 1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);"></div>
                </div>

                <!-- Footer -->
                <div style="padding: 24px 32px 28px; text-align: center;">
                    <p style="color: #475569; font-size: 18px; margin: 0 0 6px; font-weight: 800;"><span style="color: #3b82f6;">Uni</span><span style="color: #e2e8f0;">Events</span></p>
                    <p style="color: #475569; font-size: 11px; margin: 0;">Academic Event Management System</p>
                </div>
            </div>
        `
    });
};

// Send event approved/rejected email to faculty
const sendEventStatusEmail = async (facultyEmail, facultyName, eventTitle, status, rejectionReason) => {
    const isApproved = status === 'approved';
    const cfg = isApproved
        ? { icon: '✅', color: '#34d399', gradient: 'linear-gradient(135deg, #0f172a 0%, #064e3b 50%, #059669 100%)', badgeBg: 'rgba(34, 197, 94, 0.15)', badgeText: '#4ade80', badgeTextLabel: 'APPROVED' }
        : { icon: '❌', color: '#ef4444', gradient: 'linear-gradient(135deg, #0f172a 0%, #450a0a 50%, #7f1d1d 100%)', badgeBg: 'rgba(239, 68, 68, 0.15)', badgeText: '#fca5a5', badgeTextLabel: 'REJECTED' };

    await transporter.sendMail({
        from: `"UniEvents" <${process.env.EMAIL_USER}>`,
        to: facultyEmail,
        subject: `Event ${isApproved ? 'Approved' : 'Rejected'}: ${eventTitle}`,
        html: `
            <div style="font-family: 'Segoe UI', -apple-system, Arial, sans-serif; max-width: 620px; margin: 0 auto; background: #0f172a; border-radius: 20px; overflow: hidden;">
                <!-- Header -->
                <div style="background: ${cfg.gradient}; padding: 30px 32px 24px; text-align: center; position: relative;">
                    <div style="position: absolute; top: -20px; right: -20px; width: 70px; height: 70px; border-radius: 50%; background: rgba(255,255,255,0.03);"></div>
                    <div style="width: 60px; height: 60px; margin: 0 auto 14px; background: rgba(255,255,255,0.1); border-radius: 50%; border: 2px solid rgba(255,255,255,0.15);">
                        <span style="font-size: 28px; line-height: 60px;">${cfg.icon}</span>
                    </div>
                    <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 800;">Event ${isApproved ? 'Approved!' : 'Rejected'}</h1>
                    <p style="color: rgba(255,255,255,0.6); margin: 6px 0 0; font-size: 13px;">Update on your submitted event proposal</p>
                    <div style="margin-top: 16px;">
                        <span style="background: ${cfg.badgeBg}; color: ${cfg.badgeText}; padding: 6px 20px; border-radius: 30px; font-size: 12px; font-weight: 600; border: 1px solid ${cfg.badgeBg};">STATUS: ${cfg.badgeTextLabel}</span>
                    </div>
                </div>

                <!-- Greeting -->
                <div style="padding: 24px 32px 0;">
                    <p style="color: #e2e8f0; font-size: 15px; margin: 0; line-height: 1.6;">Hello <strong style="color: ${cfg.color};">${facultyName}</strong></p>
                    <p style="color: #94a3b8; font-size: 13px; margin: 8px 0 0; line-height: 1.6;">
                        Your event <strong>"${eventTitle}"</strong> has been <strong style="color: ${cfg.color};">${status}</strong> by the admin.
                    </p>
                </div>
                
                ${!isApproved && rejectionReason ? `
                <!-- Rejection Details -->
                <div style="padding: 20px 32px 0;">
                    <div style="background: linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(239, 68, 68, 0.04)); border: 1px solid rgba(239, 68, 68, 0.15); border-radius: 12px; padding: 20px;">
                        <div style="color: #fca5a5; font-size: 13px; font-weight: 700; margin-bottom: 8px;">Reason for Rejection:</div>
                        <div style="color: #e2e8f0; font-size: 14px; line-height: 1.6;">
                            ${rejectionReason}
                        </div>
                    </div>
                </div>
                ` : ''}

                <!-- Divider -->
                <div style="padding: 24px 32px 0;">
                    <div style="height: 1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);"></div>
                </div>

                <!-- Footer -->
                <div style="padding: 24px 32px 28px; text-align: center;">
                    <p style="color: #475569; font-size: 18px; margin: 0 0 6px; font-weight: 800;"><span style="color: #3b82f6;">Uni</span><span style="color: #e2e8f0;">Events</span></p>
                    <p style="color: #475569; font-size: 11px; margin: 0;">Academic Event Management System</p>
                </div>
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
    const permListHtml = permissions.map(p =>
        `<span style="display: inline-block; background: rgba(124, 58, 237, 0.15); color: #c4b5fd; padding: 6px 14px; border-radius: 6px; font-size: 13px; margin: 0 8px 8px 0; border: 1px solid rgba(124, 58, 237, 0.3);">✓ ${permissionLabels[p] || p}</span>`
    ).join('');

    const cfg = { color: '#a78bfa', gradient: 'linear-gradient(135deg, #0f172a 0%, #3b0764 50%, #7c3aed 100%)' };

    await transporter.sendMail({
        from: `"UniEvents" <${process.env.EMAIL_USER}>`,
        to: studentEmail,
        subject: `🎉 Coordinator Request Approved: ${eventTitle}`,
        html: `
            <div style="font-family: 'Segoe UI', -apple-system, Arial, sans-serif; max-width: 620px; margin: 0 auto; background: #0f172a; border-radius: 20px; overflow: hidden;">
                
                <!-- Header -->
                <div style="background: ${cfg.gradient}; padding: 30px 32px 24px; text-align: center; position: relative;">
                    <div style="position: absolute; top: -20px; right: -20px; width: 70px; height: 70px; border-radius: 50%; background: rgba(255,255,255,0.03);"></div>
                    <div style="width: 60px; height: 60px; margin: 0 auto 14px; background: rgba(255,255,255,0.1); border-radius: 50%; border: 2px solid rgba(255,255,255,0.15);">
                        <span style="font-size: 28px; line-height: 60px;">⚡</span>
                    </div>
                    <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 800;">Request Approved!</h1>
                    <p style="color: rgba(255,255,255,0.6); margin: 6px 0 0; font-size: 13px;">You are now an Event Coordinator</p>
                    <div style="margin-top: 16px;">
                        <span style="background: rgba(34, 197, 94, 0.15); color: #4ade80; padding: 6px 20px; border-radius: 30px; font-size: 12px; font-weight: 600; border: 1px solid rgba(34, 197, 94, 0.3);">✅ STATUS: APPROVED</span>
                    </div>
                </div>

                <!-- Greeting -->
                <div style="padding: 24px 32px 0;">
                    <p style="color: #e2e8f0; font-size: 15px; margin: 0; line-height: 1.6;">Hello <strong style="color: ${cfg.color};">${studentName}</strong> 🎓</p>
                    <p style="color: #94a3b8; font-size: 13px; margin: 8px 0 0; line-height: 1.6;">
                        Congratulations! The faculty organizer has approved your request to be a Student Coordinator for:
                    </p>
                </div>

                <!-- Event Details -->
                <div style="padding: 20px 32px;">
                    <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 18px 20px; margin-bottom: 20px;">
                        <div style="color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 1.2px; margin-bottom: 8px;">📋 Event Title</div>
                        <div style="color: #f1f5f9; font-size: 17px; font-weight: 700;">${eventTitle}</div>
                    </div>

                    <!-- Permissions Section -->
                    <div style="background: rgba(124, 58, 237, 0.04); border: 1px solid rgba(124, 58, 237, 0.15); border-radius: 12px; padding: 20px;">
                        <div style="color: #a78bfa; font-size: 13px; font-weight: 700; margin-bottom: 12px;">🔑 Permissions Granted:</div>
                        <div style="margin-top: 8px;">
                            ${permListHtml || '<span style="color: #64748b; font-size: 13px;">No special permissions granted.</span>'}
                        </div>
                    </div>
                </div>

                <!-- Next Steps -->
                <div style="padding: 0 32px 24px;">
                    <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 20px;">
                        <div style="color: #e2e8f0; font-size: 14px; font-weight: 700; margin-bottom: 8px;">👉 Next Steps</div>
                        <div style="color: #94a3b8; font-size: 13px; line-height: 1.6;">
                            You now have access to the <strong>Coordinator Dashboard</strong>. Please log in to your account and navigate to your dashboard to view the event and manage participants.
                        </div>
                    </div>
                </div>

                <!-- Divider -->
                <div style="padding: 0 32px;">
                    <div style="height: 1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);"></div>
                </div>

                <!-- Footer -->
                <div style="padding: 24px 32px 28px; text-align: center;">
                    <p style="color: #475569; font-size: 18px; margin: 0 0 6px; font-weight: 800;"><span style="color: ${cfg.color};">Uni</span><span style="color: #e2e8f0;">Events</span></p>
                    <p style="color: #475569; font-size: 11px; margin: 0;">Academic Event Management System</p>
                </div>
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

// Notify admin when a new event is submitted by faculty
const sendNewEventToAdmin = async (adminEmail, facultyName, eventTitle) => {
    const submissionTime = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'long', timeStyle: 'short' });
    const cfg = { color: '#f59e0b', gradient: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #1e40af 100%)', tagBg: 'linear-gradient(135deg, #f59e0b, #d97706)', tagText: '#000' };

    await transporter.sendMail({
        from: `"UniEvents Admin" <${process.env.EMAIL_USER}>`,
        to: adminEmail,
        subject: `📋 Admin Action Required: New Event Submitted`,
        html: `
            <div style="font-family: 'Segoe UI', -apple-system, Arial, sans-serif; max-width: 620px; margin: 0 auto; background: #0f172a; border-radius: 20px; overflow: hidden;">
                
                <!-- Header -->
                <div style="background: ${cfg.gradient}; padding: 30px 32px 24px; text-align: center; position: relative;">
                    <div style="position: absolute; top: -20px; right: -20px; width: 70px; height: 70px; border-radius: 50%; background: rgba(255,255,255,0.03);"></div>
                    <div style="width: 60px; height: 60px; margin: 0 auto 14px; background: rgba(255,255,255,0.1); border-radius: 50%; border: 2px solid rgba(255,255,255,0.15);">
                        <span style="font-size: 28px; line-height: 60px;">📅</span>
                    </div>
                    <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 800;">New Event Approval</h1>
                    <p style="color: rgba(255,255,255,0.6); margin: 6px 0 0; font-size: 13px;">A faculty member has submitted a new event proposal</p>
                    <div style="margin-top: 16px;">
                        <span style="background: rgba(245, 158, 11, 0.15); color: #fbd38d; padding: 6px 20px; border-radius: 30px; font-size: 12px; font-weight: 600; border: 1px solid rgba(245, 158, 11, 0.3);">⏳ ACTION REQUIRED</span>
                    </div>
                </div>

                <!-- Greeting -->
                <div style="padding: 24px 32px 0;">
                    <p style="color: #e2e8f0; font-size: 15px; margin: 0; line-height: 1.6;">Hello <strong style="color: ${cfg.color};">Administrator</strong> 👑</p>
                    <p style="color: #94a3b8; font-size: 13px; margin: 8px 0 0; line-height: 1.6;">Please review the following event submission at your earliest convenience:</p>
                </div>

                <!-- Event Details -->
                <div style="padding: 20px 32px;">
                    <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 18px 20px; margin-bottom: 10px;">
                        <div style="color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 1.2px; margin-bottom: 8px;">📋 Event Title</div>
                        <div style="color: #f1f5f9; font-size: 17px; font-weight: 700;">${eventTitle}</div>
                    </div>
                    
                    <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 18px 20px; margin-bottom: 10px;">
                        <div style="color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 1.2px; margin-bottom: 8px;">👤 Submitted By (Faculty)</div>
                        <div style="color: #f1f5f9; font-size: 15px; font-weight: 500;">${facultyName}</div>
                    </div>

                    <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 18px 20px;">
                        <div style="color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 1.2px; margin-bottom: 8px;">🕐 Submission Time</div>
                        <div style="color: ${cfg.color}; font-size: 15px; font-weight: 600;">${submissionTime}</div>
                    </div>
                </div>

                <!-- Next Steps -->
                <div style="padding: 0 32px 24px;">
                    <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 20px;">
                        <div style="color: #e2e8f0; font-size: 14px; font-weight: 700; margin-bottom: 8px;">👉 Next Steps</div>
                        <div style="color: #94a3b8; font-size: 13px; line-height: 1.6;">
                            Please log in to the <strong>Admin Dashboard</strong> to review the full details of this event and either approve or reject the proposal.
                        </div>
                    </div>
                </div>

                <!-- Divider -->
                <div style="padding: 0 32px;">
                    <div style="height: 1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);"></div>
                </div>

                <!-- Footer -->
                <div style="padding: 24px 32px 28px; text-align: center;">
                    <p style="color: #475569; font-size: 18px; margin: 0 0 6px; font-weight: 800;"><span style="color: ${cfg.color};">Uni</span><span style="color: #e2e8f0;">Events</span></p>
                    <p style="color: #475569; font-size: 11px; margin: 0;">Academic Event Management System</p>
                </div>
            </div>
        `
    });
};

// Notify admin when a student requests coordinator role
const sendCoordinatorRequestToAdmin = async (adminEmail, studentName, studentEmail) => {
    await transporter.sendMail({
        from: `"UniEvents" <${process.env.EMAIL_USER}>`,
        to: adminEmail,
        subject: `New Coordinator Request from ${studentName}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                <h2 style="color: #7c3aed;">👤 New Coordinator Request</h2>
                <p>A student has requested to become a coordinator:</p>
                <div style="background: #f5f3ff; border-left: 4px solid #7c3aed; padding: 12px; margin: 16px 0; border-radius: 4px;">
                    <p style="margin: 4px 0;"><strong>Student:</strong> ${studentName}</p>
                    <p style="margin: 4px 0;"><strong>Email:</strong> ${studentEmail}</p>
                </div>
                <p>Please log in to review this request.</p>
                <br/>
                <p style="color: #888; font-size: 13px;">— UniEvents Team</p>
            </div>
        `
    });
};

// Notify student that their coordinator request is pending
const sendCoordinatorPendingEmail = async (studentEmail, studentName, eventTitle) => {
    const cfg = { color: '#f59e0b', gradient: 'linear-gradient(135deg, #0f172a 0%, #451a03 50%, #78350f 100%)' };

    await transporter.sendMail({
        from: `"UniEvents" <${process.env.EMAIL_USER}>`,
        to: studentEmail,
        subject: `⏳ Coordinator Request Pending: ${eventTitle}`,
        html: `
            <div style="font-family: 'Segoe UI', -apple-system, Arial, sans-serif; max-width: 620px; margin: 0 auto; background: #0f172a; border-radius: 20px; overflow: hidden;">
                
                <!-- Header -->
                <div style="background: ${cfg.gradient}; padding: 30px 32px 24px; text-align: center; position: relative;">
                    <div style="position: absolute; top: -20px; right: -20px; width: 70px; height: 70px; border-radius: 50%; background: rgba(255,255,255,0.03);"></div>
                    <div style="width: 60px; height: 60px; margin: 0 auto 14px; background: rgba(255,255,255,0.1); border-radius: 50%; border: 2px solid rgba(255,255,255,0.15);">
                        <span style="font-size: 28px; line-height: 60px;">⏳</span>
                    </div>
                    <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 800;">Request Submitted</h1>
                    <p style="color: rgba(255,255,255,0.6); margin: 6px 0 0; font-size: 13px;">Your coordinator application is under review</p>
                    <div style="margin-top: 16px;">
                        <span style="background: rgba(245, 158, 11, 0.15); color: #fbd38d; padding: 6px 20px; border-radius: 30px; font-size: 12px; font-weight: 600; border: 1px solid rgba(245, 158, 11, 0.3);">STATUS: PENDING</span>
                    </div>
                </div>

                <!-- Greeting -->
                <div style="padding: 24px 32px 0;">
                    <p style="color: #e2e8f0; font-size: 15px; margin: 0; line-height: 1.6;">Hello <strong style="color: ${cfg.color};">${studentName}</strong></p>
                    <p style="color: #94a3b8; font-size: 13px; margin: 8px 0 0; line-height: 1.6;">
                        We have received your request to become an Event Coordinator for <strong>"${eventTitle}"</strong>.
                    </p>
                </div>

                <!-- Next Steps -->
                <div style="padding: 24px 32px;">
                    <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 20px;">
                        <div style="color: #e2e8f0; font-size: 14px; font-weight: 700; margin-bottom: 8px;">Next Steps</div>
                        <div style="color: #94a3b8; font-size: 13px; line-height: 1.6;">
                            The event organizer will review your request shortly. You will receive another email once your application has been approved or rejected.
                        </div>
                    </div>
                </div>

                <!-- Divider -->
                <div style="padding: 0 32px;">
                    <div style="height: 1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);"></div>
                </div>

                <!-- Footer -->
                <div style="padding: 24px 32px 28px; text-align: center;">
                    <p style="color: #475569; font-size: 18px; margin: 0 0 6px; font-weight: 800;"><span style="color: #3b82f6;">Uni</span><span style="color: #e2e8f0;">Events</span></p>
                    <p style="color: #475569; font-size: 11px; margin: 0;">Academic Event Management System</p>
                </div>
            </div>
        `
    });
};

// Notify student when coordinator request is rejected
const sendCoordinatorRejectedEmail = async (studentEmail, studentName) => {
    const cfg = { color: '#ef4444', gradient: 'linear-gradient(135deg, #0f172a 0%, #450a0a 50%, #7f1d1d 100%)' };
    await transporter.sendMail({
        from: `"UniEvents" <${process.env.EMAIL_USER}>`,
        to: studentEmail,
        subject: `❌ Coordinator Request Update`,
        html: `
            <div style="font-family: 'Segoe UI', -apple-system, Arial, sans-serif; max-width: 620px; margin: 0 auto; background: #0f172a; border-radius: 20px; overflow: hidden;">
                
                <!-- Header -->
                <div style="background: ${cfg.gradient}; padding: 30px 32px 24px; text-align: center; position: relative;">
                    <div style="position: absolute; top: -20px; right: -20px; width: 70px; height: 70px; border-radius: 50%; background: rgba(255,255,255,0.03);"></div>
                    <div style="width: 60px; height: 60px; margin: 0 auto 14px; background: rgba(255,255,255,0.1); border-radius: 50%; border: 2px solid rgba(255,255,255,0.15);">
                        <span style="font-size: 28px; line-height: 60px;">❌</span>
                    </div>
                    <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 800;">Request Rejected</h1>
                    <p style="color: rgba(255,255,255,0.6); margin: 6px 0 0; font-size: 13px;">Coordinator role application update</p>
                    <div style="margin-top: 16px;">
                        <span style="background: rgba(239, 68, 68, 0.15); color: #fca5a5; padding: 6px 20px; border-radius: 30px; font-size: 12px; font-weight: 600; border: 1px solid rgba(239, 68, 68, 0.3);">STATUS: REJECTED</span>
                    </div>
                </div>

                <!-- Greeting -->
                <div style="padding: 24px 32px 0;">
                    <p style="color: #e2e8f0; font-size: 15px; margin: 0; line-height: 1.6;">Hello <strong style="color: ${cfg.color};">${studentName}</strong></p>
                    <p style="color: #94a3b8; font-size: 13px; margin: 8px 0 0; line-height: 1.6;">
                        Unfortunately, your request to become a general coordinator has been <strong style="color: #ef4444;">rejected</strong>.
                    </p>
                </div>

                <!-- Next Steps -->
                <div style="padding: 24px 32px;">
                    <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 20px;">
                        <div style="color: #e2e8f0; font-size: 14px; font-weight: 700; margin-bottom: 8px;">Next Steps</div>
                        <div style="color: #94a3b8; font-size: 13px; line-height: 1.6;">
                            You may contact the administration for more details or try applying again later.
                        </div>
                    </div>
                </div>

                <!-- Divider -->
                <div style="padding: 0 32px;">
                    <div style="height: 1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);"></div>
                </div>

                <!-- Footer -->
                <div style="padding: 24px 32px 28px; text-align: center;">
                    <p style="color: #475569; font-size: 18px; margin: 0 0 6px; font-weight: 800;"><span style="color: #3b82f6;">Uni</span><span style="color: #e2e8f0;">Events</span></p>
                    <p style="color: #475569; font-size: 11px; margin: 0;">Academic Event Management System</p>
                </div>
            </div>
        `
    });
};

// Notify student when their registration is rejected
const sendRegistrationRejectedEmail = async (studentEmail, studentName, eventTitle, rejectionReason, roleType = 'participant') => {
    const isCoordinator = roleType === 'coordinator';
    const typeLabel = isCoordinator ? 'Coordinator Request' : 'Registration';
    const cfg = { color: '#ef4444', gradient: 'linear-gradient(135deg, #0f172a 0%, #450a0a 50%, #7f1d1d 100%)' };

    await transporter.sendMail({
        from: `"UniEvents" <${process.env.EMAIL_USER}>`,
        to: studentEmail,
        subject: `❌ ${typeLabel} Rejected: ${eventTitle}`,
        html: `
            <div style="font-family: 'Segoe UI', -apple-system, Arial, sans-serif; max-width: 620px; margin: 0 auto; background: #0f172a; border-radius: 20px; overflow: hidden;">
                
                <!-- Header -->
                <div style="background: ${cfg.gradient}; padding: 30px 32px 24px; text-align: center; position: relative;">
                    <div style="position: absolute; top: -20px; right: -20px; width: 70px; height: 70px; border-radius: 50%; background: rgba(255,255,255,0.03);"></div>
                    <div style="width: 60px; height: 60px; margin: 0 auto 14px; background: rgba(255,255,255,0.1); border-radius: 50%; border: 2px solid rgba(255,255,255,0.15);">
                        <span style="font-size: 28px; line-height: 60px;">❌</span>
                    </div>
                    <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 800;">Request Rejected</h1>
                    <p style="color: rgba(255,255,255,0.6); margin: 6px 0 0; font-size: 13px;">Your ${isCoordinator ? 'coordinator application' : 'registration'} was not approved</p>
                    <div style="margin-top: 16px;">
                        <span style="background: rgba(239, 68, 68, 0.15); color: #fca5a5; padding: 6px 20px; border-radius: 30px; font-size: 12px; font-weight: 600; border: 1px solid rgba(239, 68, 68, 0.3);">STATUS: REJECTED</span>
                    </div>
                </div>

                <!-- Greeting -->
                <div style="padding: 24px 32px 0;">
                    <p style="color: #e2e8f0; font-size: 15px; margin: 0; line-height: 1.6;">Hello <strong style="color: ${cfg.color};">${studentName}</strong></p>
                    <p style="color: #94a3b8; font-size: 13px; margin: 8px 0 0; line-height: 1.6;">
                        Unfortunately, your ${isCoordinator ? 'request to become an Event Coordinator for' : 'registration for'} the following event has been <strong style="color: #ef4444;">rejected</strong>:
                    </p>
                </div>

                <!-- Event Details -->
                <div style="padding: 20px 32px;">
                    <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 18px 20px; margin-bottom: ${rejectionReason ? '20px' : '0'};">
                        <div style="color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 1.2px; margin-bottom: 8px;">Event Title</div>
                        <div style="color: #f1f5f9; font-size: 17px; font-weight: 700;">${eventTitle}</div>
                    </div>

                    ${rejectionReason ? `
                    <div style="background: linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(239, 68, 68, 0.04)); border: 1px solid rgba(239, 68, 68, 0.15); border-radius: 12px; padding: 20px;">
                        <div style="color: #fca5a5; font-size: 13px; font-weight: 700; margin-bottom: 8px;">Reason for Rejection:</div>
                        <div style="color: #e2e8f0; font-size: 14px; line-height: 1.6;">
                            ${rejectionReason}
                        </div>
                    </div>
                    ` : ''}
                </div>

                <!-- Next Steps -->
                <div style="padding: 0 32px 24px;">
                    <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 20px;">
                        <div style="color: #e2e8f0; font-size: 14px; font-weight: 700; margin-bottom: 8px;">Next Steps</div>
                        <div style="color: #94a3b8; font-size: 13px; line-height: 1.6;">
                            You may contact the event organizer or administration for more details, or try applying again for future events.
                        </div>
                    </div>
                </div>

                <!-- Divider -->
                <div style="padding: 0 32px;">
                    <div style="height: 1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);"></div>
                </div>

                <!-- Footer -->
                <div style="padding: 24px 32px 28px; text-align: center;">
                    <p style="color: #475569; font-size: 18px; margin: 0 0 6px; font-weight: 800;"><span style="color: #3b82f6;">Uni</span><span style="color: #e2e8f0;">Events</span></p>
                    <p style="color: #475569; font-size: 11px; margin: 0;">Academic Event Management System</p>
                </div>
            </div>
        `
    });
};

// Send login notification email to admin/student
const sendLoginNotificationEmail = async (userEmail, userName, role) => {
    const loginTime = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    const loginDate = new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const roleLabel = role.charAt(0).toUpperCase() + role.replace('_', ' ').slice(1);

    const roleConfig = {
        admin: { emoji: '👑', color: '#f59e0b', bgColor: '#451a03', gradient: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #1e40af 100%)', tagBg: 'linear-gradient(135deg, #f59e0b, #d97706)', tagText: '#000' },
        student: { emoji: '🎓', color: '#34d399', bgColor: '#022c22', gradient: 'linear-gradient(135deg, #0f172a 0%, #064e3b 50%, #059669 100%)', tagBg: 'linear-gradient(135deg, #34d399, #10b981)', tagText: '#000' },
        student_coordinator: { emoji: '⚡', color: '#a78bfa', bgColor: '#2e1065', gradient: 'linear-gradient(135deg, #0f172a 0%, #3b0764 50%, #7c3aed 100%)', tagBg: 'linear-gradient(135deg, #a78bfa, #8b5cf6)', tagText: '#000' }
    };
    const cfg = roleConfig[role] || roleConfig.student;

    await transporter.sendMail({
        from: `"UniEvents" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: `🔐 Login Alert — UniEvents | ${loginTime}`,
        html: `
            <div style="font-family: 'Segoe UI', -apple-system, Arial, sans-serif; max-width: 620px; margin: 0 auto; background: #0f172a; border-radius: 20px; overflow: hidden;">
                
                <!-- ===== HERO HEADER ===== -->
                <div style="background: ${cfg.gradient}; padding: 30px 32px 24px; text-align: center; position: relative;">
                    <!-- Decorative circles -->
                    <div style="position: absolute; top: -20px; right: -20px; width: 70px; height: 70px; border-radius: 50%; background: rgba(255,255,255,0.03);"></div>
                    <div style="position: absolute; bottom: -15px; left: -15px; width: 50px; height: 50px; border-radius: 50%; background: rgba(255,255,255,0.02);"></div>
                    
                    <!-- Shield Icon -->
                    <div style="width: 60px; height: 60px; margin: 0 auto 14px; background: rgba(255,255,255,0.1); border-radius: 50%; border: 2px solid rgba(255,255,255,0.15);">
                        <span style="font-size: 28px; line-height: 60px;">🛡️</span>
                    </div>
                    
                    <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">
                        Secure Login Alert
                    </h1>
                    <p style="color: rgba(255,255,255,0.6); margin: 6px 0 0; font-size: 13px; letter-spacing: 0.3px;">
                        A new session has been initiated on your account
                    </p>
                    
                    <!-- Status Pill -->
                    <div style="margin-top: 16px;">
                        <span style="background: rgba(34, 197, 94, 0.15); color: #4ade80; padding: 6px 20px; border-radius: 30px; font-size: 12px; font-weight: 600; border: 1px solid rgba(34, 197, 94, 0.3); letter-spacing: 0.5px;">
                            ✅ LOGIN SUCCESSFUL
                        </span>
                    </div>
                </div>

                <!-- ===== GREETING ===== -->
                <div style="padding: 24px 32px 0;">
                    <p style="color: #e2e8f0; font-size: 15px; margin: 0; line-height: 1.6;">
                        Hello <strong style="color: ${cfg.color};">${userName}</strong> ${cfg.emoji}
                    </p>
                    <p style="color: #94a3b8; font-size: 13px; margin: 8px 0 0; line-height: 1.6;">
                        We detected a successful sign-in to your UniEvents account. Here's a summary:
                    </p>
                </div>

                <!-- ===== LOGIN DETAILS CARDS ===== -->
                <div style="padding: 20px 32px;">
                    
                    <!-- Account Name -->
                    <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 18px 20px; margin-bottom: 10px;">
                        <div style="color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 1.2px; margin-bottom: 8px;">👤 Account Name</div>
                        <div style="color: #f1f5f9; font-size: 17px; font-weight: 700;">${userName}</div>
                    </div>

                    <!-- Email Address -->
                    <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 18px 20px; margin-bottom: 10px;">
                        <div style="color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 1.2px; margin-bottom: 8px;">📧 Email Address</div>
                        <div style="color: #f1f5f9; font-size: 15px; font-weight: 500;">${userEmail}</div>
                    </div>

                    <!-- Role -->
                    <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 18px 20px; margin-bottom: 10px;">
                        <div style="color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 1.2px; margin-bottom: 10px;">🏷️ Assigned Role</div>
                        <span style="background: ${cfg.tagBg}; color: ${cfg.tagText}; padding: 6px 18px; border-radius: 20px; font-size: 14px; font-weight: 700; display: inline-block;">${roleLabel}</span>
                    </div>

                    <!-- Date & Time -->
                    <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 18px 20px;">
                        <div style="color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 1.2px; margin-bottom: 8px;">📅 Login Date & Time (IST)</div>
                        <div style="color: ${cfg.color}; font-size: 17px; font-weight: 700; margin-bottom: 4px;">${loginTime}</div>
                        <div style="color: #94a3b8; font-size: 13px;">${loginDate}</div>
                    </div>

                </div>

                <!-- ===== SECURITY WARNING ===== -->
                <div style="padding: 0 40px 32px;">
                    <div style="background: linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(239, 68, 68, 0.04)); border: 1px solid rgba(239, 68, 68, 0.15); border-radius: 14px; padding: 20px;">
                        <table style="width: 100%;">
                            <tr>
                                <td style="width: 40px; vertical-align: top;">
                                    <span style="font-size: 24px;">🚨</span>
                                </td>
                                <td>
                                    <p style="color: #fca5a5; font-size: 14px; font-weight: 700; margin: 0 0 6px;">
                                        Wasn't you?
                                    </p>
                                    <p style="color: #94a3b8; font-size: 13px; margin: 0; line-height: 1.6;">
                                        If you didn't authorize this login, please change your password immediately and contact the system administrator.
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </div>
                </div>

                <!-- ===== DIVIDER ===== -->
                <div style="padding: 0 40px;">
                    <div style="height: 1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);"></div>
                </div>

                <!-- ===== FOOTER ===== -->
                <div style="padding: 28px 40px 32px; text-align: center;">
                    <p style="color: #475569; font-size: 20px; margin: 0 0 8px; font-weight: 800; letter-spacing: -0.5px;">
                        <span style="color: ${cfg.color};">Uni</span><span style="color: #e2e8f0;">Events</span>
                    </p>
                    <p style="color: #475569; font-size: 12px; margin: 0; letter-spacing: 0.3px;">
                        Academic Event Management System
                    </p>
                    <p style="color: #334155; font-size: 11px; margin: 16px 0 0;">
                        © ${new Date().getFullYear()} UniEvents · This is an automated security notification
                    </p>
                </div>
            </div>
        `
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
        subject: `🎉 Welcome to UniEvents, ${userName}!`,
        html: `
            <div style="font-family: 'Segoe UI', -apple-system, Arial, sans-serif; max-width: 620px; margin: 0 auto; background: #0f172a; border-radius: 20px; overflow: hidden;">
                
                <!-- Header -->
                <div style="background: ${cfg.gradient}; padding: 30px 32px 24px; text-align: center; position: relative;">
                    <div style="position: absolute; top: -20px; right: -20px; width: 70px; height: 70px; border-radius: 50%; background: rgba(255,255,255,0.03);"></div>
                    <div style="width: 60px; height: 60px; margin: 0 auto 14px; background: rgba(255,255,255,0.1); border-radius: 50%; border: 2px solid rgba(255,255,255,0.15);">
                        <span style="font-size: 28px; line-height: 60px;">🎉</span>
                    </div>
                    <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 800;">Welcome to UniEvents!</h1>
                    <p style="color: rgba(255,255,255,0.6); margin: 6px 0 0; font-size: 13px;">Your account has been created successfully</p>
                    <div style="margin-top: 16px;">
                        <span style="background: rgba(34, 197, 94, 0.15); color: #4ade80; padding: 6px 20px; border-radius: 30px; font-size: 12px; font-weight: 600; border: 1px solid rgba(34, 197, 94, 0.3);">✅ REGISTRATION COMPLETE</span>
                    </div>
                </div>

                <!-- Greeting -->
                <div style="padding: 24px 32px 0;">
                    <p style="color: #e2e8f0; font-size: 15px; margin: 0; line-height: 1.6;">Hello <strong style="color: ${cfg.color};">${userName}</strong> ${cfg.emoji}</p>
                    <p style="color: #94a3b8; font-size: 13px; margin: 8px 0 0; line-height: 1.6;">Welcome aboard! Your UniEvents account is ready. Here are your details:</p>
                </div>

                <!-- Account Details -->
                <div style="padding: 20px 32px;">
                    <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 18px 20px; margin-bottom: 10px;">
                        <div style="color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 1.2px; margin-bottom: 8px;">👤 Name</div>
                        <div style="color: #f1f5f9; font-size: 17px; font-weight: 700;">${userName}</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 18px 20px; margin-bottom: 10px;">
                        <div style="color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 1.2px; margin-bottom: 8px;">📧 Email</div>
                        <div style="color: #f1f5f9; font-size: 15px; font-weight: 500;">${userEmail}</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 18px 20px;">
                        <div style="color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 1.2px; margin-bottom: 10px;">🏷️ Role</div>
                        <span style="background: ${cfg.tagBg}; color: ${cfg.tagText}; padding: 6px 18px; border-radius: 20px; font-size: 14px; font-weight: 700; display: inline-block;">${roleLabel}</span>
                    </div>
                </div>

                <!-- What You Can Do -->
                <div style="padding: 0 32px 24px;">
                    <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 20px;">
                        <div style="color: #e2e8f0; font-size: 14px; font-weight: 700; margin-bottom: 14px;">🚀 What you can do:</div>
                        <div style="color: #94a3b8; font-size: 13px; line-height: 2;">
                            📅 Browse and register for upcoming events<br/>
                            🎫 Track your event registrations<br/>
                            ⭐ Apply to become a Student Coordinator<br/>
                            🔔 Get real-time notifications
                        </div>
                    </div>
                </div>

                <!-- Divider -->
                <div style="padding: 0 32px;">
                    <div style="height: 1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);"></div>
                </div>

                <!-- Footer -->
                <div style="padding: 24px 32px 28px; text-align: center;">
                    <p style="color: #475569; font-size: 18px; margin: 0 0 6px; font-weight: 800;"><span style="color: ${cfg.color};">Uni</span><span style="color: #e2e8f0;">Events</span></p>
                    <p style="color: #475569; font-size: 11px; margin: 0;">Academic Event Management System</p>
                    <p style="color: #334155; font-size: 11px; margin: 12px 0 0;">© ${new Date().getFullYear()} UniEvents</p>
                </div>
            </div>
        `
    });
};

// Send approval email when coordinator role request is approved by admin
const sendCoordinatorRoleApprovedEmail = async (studentEmail, studentName) => {
    const cfg = { color: '#a78bfa', gradient: 'linear-gradient(135deg, #0f172a 0%, #3b0764 50%, #7c3aed 100%)' };

    await transporter.sendMail({
        from: `"UniEvents" <${process.env.EMAIL_USER}>`,
        to: studentEmail,
        subject: `🎉 Coordinator Role Approved — UniEvents`,
        html: `
            <div style="font-family: 'Segoe UI', -apple-system, Arial, sans-serif; max-width: 620px; margin: 0 auto; background: #0f172a; border-radius: 20px; overflow: hidden;">
                
                <!-- Header -->
                <div style="background: ${cfg.gradient}; padding: 30px 32px 24px; text-align: center; position: relative;">
                    <div style="position: absolute; top: -20px; right: -20px; width: 70px; height: 70px; border-radius: 50%; background: rgba(255,255,255,0.03);"></div>
                    <div style="width: 60px; height: 60px; margin: 0 auto 14px; background: rgba(255,255,255,0.1); border-radius: 50%; border: 2px solid rgba(255,255,255,0.15);">
                        <span style="font-size: 28px; line-height: 60px;">⚡</span>
                    </div>
                    <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 800;">Role Approved!</h1>
                    <p style="color: rgba(255,255,255,0.6); margin: 6px 0 0; font-size: 13px;">You are now an Event Coordinator</p>
                    <div style="margin-top: 16px;">
                        <span style="background: rgba(34, 197, 94, 0.15); color: #4ade80; padding: 6px 20px; border-radius: 30px; font-size: 12px; font-weight: 600; border: 1px solid rgba(34, 197, 94, 0.3);">✅ STATUS: APPROVED</span>
                    </div>
                </div>

                <!-- Greeting -->
                <div style="padding: 24px 32px 0;">
                    <p style="color: #e2e8f0; font-size: 15px; margin: 0; line-height: 1.6;">Hello <strong style="color: ${cfg.color};">${studentName}</strong> 🎓</p>
                    <p style="color: #94a3b8; font-size: 13px; margin: 8px 0 0; line-height: 1.6;">
                        Congratulations! The admin has approved your request to become a <strong style="color: ${cfg.color};">Student Coordinator</strong> on UniEvents.
                    </p>
                </div>

                <!-- Features Section -->
                <div style="padding: 20px 32px;">
                    <div style="background: rgba(124, 58, 237, 0.04); border: 1px solid rgba(124, 58, 237, 0.15); border-radius: 12px; padding: 20px;">
                        <div style="color: #a78bfa; font-size: 13px; font-weight: 700; margin-bottom: 12px;">🚀 You can now:</div>
                        <div style="color: #94a3b8; font-size: 13px; line-height: 2;">
                            <span style="display: inline-block; background: rgba(124, 58, 237, 0.15); color: #c4b5fd; padding: 4px 12px; border-radius: 6px; margin: 0 6px 6px 0; border: 1px solid rgba(124, 58, 237, 0.3);">⚡ Access Coordinator Dashboard</span>
                            <span style="display: inline-block; background: rgba(124, 58, 237, 0.15); color: #c4b5fd; padding: 4px 12px; border-radius: 6px; margin: 0 6px 6px 0; border: 1px solid rgba(124, 58, 237, 0.3);">👥 Manage event participants</span>
                            <span style="display: inline-block; background: rgba(124, 58, 237, 0.15); color: #c4b5fd; padding: 4px 12px; border-radius: 6px; margin: 0 6px 6px 0; border: 1px solid rgba(124, 58, 237, 0.3);">📅 Update event schedules</span>
                            <span style="display: inline-block; background: rgba(124, 58, 237, 0.15); color: #c4b5fd; padding: 4px 12px; border-radius: 6px; margin: 0 6px 6px 0; border: 1px solid rgba(124, 58, 237, 0.3);">📜 Generate certificates</span>
                        </div>
                    </div>
                </div>

                <!-- Next Steps -->
                <div style="padding: 0 32px 24px;">
                    <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 20px;">
                        <div style="color: #e2e8f0; font-size: 14px; font-weight: 700; margin-bottom: 8px;">👉 Next Steps</div>
                        <div style="color: #94a3b8; font-size: 13px; line-height: 1.6;">
                            Please log in out and log back in to your account to see the new Coordinator Dashboard link in your sidebar.
                        </div>
                    </div>
                </div>

                <!-- Divider -->
                <div style="padding: 0 32px;">
                    <div style="height: 1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);"></div>
                </div>

                <!-- Footer -->
                <div style="padding: 24px 32px 28px; text-align: center;">
                    <p style="color: #475569; font-size: 18px; margin: 0 0 6px; font-weight: 800;"><span style="color: ${cfg.color};">Uni</span><span style="color: #e2e8f0;">Events</span></p>
                    <p style="color: #475569; font-size: 11px; margin: 0;">Academic Event Management System</p>
                </div>
            </div>
        `
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

module.exports = {
    sendEmail,
    sendEventCreatedEmail,
    sendEventStatusEmail,
    sendCoordinatorApprovedEmail,
    sendParticipantRegistrationEmail,
    sendNewEventToAdmin,
    sendCoordinatorRequestToAdmin,
    sendCoordinatorPendingEmail,
    sendCoordinatorRejectedEmail,
    sendCoordinatorRoleApprovedEmail,
    sendRegistrationRejectedEmail,
    sendLoginNotificationEmail,
    sendWelcomeEmail,
    getAdminEmails
};
