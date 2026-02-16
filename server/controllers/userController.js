const supabase = require('../config/supabase');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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
        // Use Supabase Auth to sign in
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (authError) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        if (!authData.user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Get user role from public.users
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*, roles(name)')
            .eq('id', authData.user.id)
            .single();

        const role = userData?.roles?.name || 'student';

        res.json({
            user: {
                id: authData.user.id,
                email: authData.user.email,
                full_name: userData?.full_name || authData.user.user_metadata?.full_name,
                role: role,
            },
            token: generateToken(authData.user.id, role),
        });
    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Signup User
const registerUser = async (req, res) => {
    const { email, password, full_name } = req.body;

    try {
        // Use Supabase Auth to create user
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: full_name
                }
            }
        });

        if (authError) {
            return res.status(400).json({ error: authError.message });
        }

        if (!authData.user) {
            return res.status(400).json({ error: 'Failed to create user' });
        }

        // Get user role from public.users (created by trigger)
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*, roles(name)')
            .eq('id', authData.user.id)
            .single();

        const role = userData?.roles?.name || 'student';

        res.status(201).json({
            user: {
                id: authData.user.id,
                email: authData.user.email,
                full_name: full_name,
                role: role,
            },
            token: generateToken(authData.user.id, role),
        });
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

module.exports = {
    loginUser,
    registerUser,
    getProfile,
    updateProfile,
};
