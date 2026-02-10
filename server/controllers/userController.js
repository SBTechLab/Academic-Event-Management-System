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
    const { email, password, full_name, role = 'student' } = req.body;

    try {
        // 1. Check if user exists
        const { data: existingUser } = await supabase
            .from('users')
            .select('email')
            .eq('email', email)
            .single();

        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // 2. Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Get Role ID
        const { data: roleData } = await supabase
            .from('roles')
            .select('id')
            .eq('name', role)
            .single();

        const roleId = roleData ? roleData.id : null;

        // 4. Create User
        const { data: newUser, error } = await supabase
            .from('users')
            .insert([
                {
                    email,
                    password: hashedPassword,
                    full_name,
                    role_id: roleId,
                },
            ])
            .select()
            .single();

        if (error) {
            throw error;
        }

        if (newUser) {
            res.status(201).json({
                user: {
                    id: newUser.id,
                    email: newUser.email,
                    full_name: newUser.full_name,
                    role: role,
                },
                token: generateToken(newUser.id, role),
            });
        } else {
            res.status(400).json({ error: 'Invalid user data' });
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

module.exports = {
    loginUser,
    registerUser,
    getProfile,
    updateProfile,
};
