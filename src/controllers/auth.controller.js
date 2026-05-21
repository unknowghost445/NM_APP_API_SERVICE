const supabase = require('../config/supabase');

exports.register = async (req, res) => {
    try {
        const {name, email, password} = req.body;

        // Create user
        const {data: authData, error: authError} = await supabase.auth.signUp({
            email,
            password,
        });

        if(authError) {
            throw authError;
        }

        // Insert user into 'users' table
        const {error: insertError} = await supabase
            .from('users')
            .insert({
                userID: authData.user.id,
                name,
                email,
                phone: '',
                address: '',
                avatarUrl: '',
                description: '',
            });

        if(insertError) {
            throw insertError;
        }

        res.status(201).json({
            success: true,
            data: {
                user: authData.user,
                session: authData.session,
            }
        });
    }catch (error) {
        res.status(400).json({
            success: false,
            error: error.message,
        });
    }
};

exports.login = async (req, res) => {
    try {
        const {email, password} = req.body;
        const {data, error} = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if(error) {
            throw error;
        }

        res.json({
            success: true,
            data: {
                user: data.user,
                session: data.session,
            }
        });
    } catch (error) {
        res.status(401).json({
            success: false,
            error: error.message,
        });
    }
};

exports.refreshToken = async (req, res) => {
    try {
        const {refreshToken} = req.body;

        if(!refreshToken) {
            return res.status(400).json({
                success: false,
                error: 'Refresh token is required',
            });
        }

        const {data, error} = await supabase.auth.refreshSession({
            refresh_token: refreshToken
        });

        if(error) {
            throw error;
        }

        res.json({
            success: true,
            data: data,
        })
    } catch (error) {
        res.status(401).json({
            success: false,
            error: error.message,
        });
    }
};

exports.logout = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;

        if(!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'Authorization header missing or invalid',
            });
        }

        const token = authHeader.substring(7);

        const {error} = await supabase.auth.signOut();

        if(error) {
            throw error;
        }

        res.json({
            success: true,
            message: 'Logged out successfully',
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message,
        });
    }
};