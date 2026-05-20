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