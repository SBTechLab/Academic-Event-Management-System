const supabase = require('../config/supabase');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendLoginNotificationEmail, sendWelcomeEmail, sendPasswordResetEmail } = require('../config/emailService');

// Generate JWT
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET || 'fallback_secret_key', {
        expiresIn: '30d',
    });
};

// Login User
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // 1. Find user by email
        const { data: user, error } = await supabase
            .from('users')
            .select('*, roles(name)')
            .eq('email', email)
            .single();

        if (error || !user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // 2. Check password
        if (user.password && (await bcrypt.compare(password, user.password))) {
            const role = user.roles?.name || 'student';

            // Send login notification email for admin and student (real emails only)
            if (role === 'admin' || role === 'student' || role === 'student_coordinator') {
                sendLoginNotificationEmail(user.email, user.full_name, role)
                    .catch(err => console.error('Login email error:', err));
            }

            res.json({
                user: {
                    id: user.id,
                    email: user.email,
                    full_name: user.full_name,
                    role: role,
                },
                token: generateToken(user.id, role),
            });
        } else {
            res.status(401).json({ error: 'Invalid email or password' });
        }
    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Signup User
const registerUser = async (req, res) => {
    const { email, password, full_name } = req.body;

    try {
        // Auto-assign role based on email domain
        let assignedRole = 'student';
        if (email.endsWith('@charusat.ac.in')) {
            assignedRole = 'faculty';
        } else if (email.endsWith('.edu.in')) {
            assignedRole = 'student';
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Get role ID
        const { data: roleData } = await supabase
            .from('roles')
            .select('id')
            .eq('name', assignedRole)
            .single();

        // Insert user directly into users table
        const { data: userData, error: userError } = await supabase
            .from('users')
            .insert({
                id: crypto.randomUUID(),
                email,
                full_name,
                role_id: roleData?.id,
                password: hashedPassword
            })
            .select()
            .single();

        if (userError) {
            return res.status(400).json({ error: userError.message });
        }

        res.status(201).json({
            user: {
                id: userData.id,
                email: userData.email,
                full_name: userData.full_name,
                role: assignedRole,
            },
            token: generateToken(userData.id, assignedRole),
        });

        // Send welcome email for student (real emails)
        if (assignedRole === 'student') {
            sendWelcomeEmail(userData.email, userData.full_name, assignedRole)
                .catch(err => console.error('Welcome email error:', err));
        }
    } catch (err) {
        console.error('Signup Error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Get current user profile
const getProfile = async (req, res) => {
    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('*, roles(name)')
            .eq('id', req.user.id)
            .single();

        if (error) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            role: user.roles?.name,
            avatar_url: user.avatar_url
        });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

// Update user profile
const updateProfile = async (req, res) => {
    const { full_name, avatar_url } = req.body;

    try {
        const { data, error } = await supabase
            .from('users')
            .update({ full_name, avatar_url })
            .eq('id', req.user.id)
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

// Get all faculty (admin only)
const getAllFaculty = async (req, res) => {
    try {
        const { data: roleData } = await supabase
            .from('roles')
            .select('id')
            .eq('name', 'faculty')
            .single();

        const { data: faculty, error } = await supabase
            .from('users')
            .select('id, email, full_name, avatar_url, created_at')
            .eq('role_id', roleData.id)
            .order('created_at', { ascending: false });

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(faculty);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

// Remove faculty (admin only)
const removeFaculty = async (req, res) => {
    const { id } = req.params;

    try {
        const { error } = await supabase
            .from('users')
            .delete()
            .eq('id', id);

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json({ message: 'Faculty removed successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

// Forgot Password
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('id, full_name, email')
            .eq('email', email)
            .single();

        // Always return success to prevent email enumeration
        if (error || !user) return res.json({ message: 'If that email exists, a reset link has been sent.' });

        const token = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 min

        await supabase.from('users').update({
            reset_token: token,
            reset_token_expires: expires
        }).eq('id', user.id);

        const resetLink = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
        await sendPasswordResetEmail(user.email, user.full_name, resetLink);

        res.json({ message: 'If that email exists, a reset link has been sent.' });
    } catch (err) {
        console.error('Forgot password error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Reset Password
const resetPassword = async (req, res) => {
    const { token, password } = req.body;
    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('id, reset_token, reset_token_expires')
            .eq('reset_token', token)
            .single();

        if (error || !user) return res.status(400).json({ error: 'Invalid or expired reset link.' });
        if (new Date(user.reset_token_expires) < new Date()) return res.status(400).json({ error: 'Reset link has expired. Please request a new one.' });

        const hashedPassword = await bcrypt.hash(password, 10);
        await supabase.from('users').update({
            password: hashedPassword,
            reset_token: null,
            reset_token_expires: null
        }).eq('id', user.id);

        res.json({ message: 'Password updated successfully. You can now log in.' });
    } catch (err) {
        console.error('Reset password error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    loginUser,
    registerUser,
    getProfile,
    updateProfile,
    getAllFaculty,
    removeFaculty,
    forgotPassword,
    resetPassword,
};
