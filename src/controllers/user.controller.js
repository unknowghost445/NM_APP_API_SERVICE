const supabase = require('../config/supabase');

exports.getUserById = async (req, res) => {
    try {
        const {userId} = req.params;

        const {data, error} = await supabase
            .from('users')
            .select('*')
            .eq('userID', userId)
            .single();

        if(error) {
            throw error;
        }

        if(!data) {
            return res.status(404).json({
                success: false,
                error: 'User not found',
            });
        }

        res.json({
            success: true,
            data,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const {data, error} = await supabase
            .from('users')
            .select('*');

        if(error) {
            throw error;
        }

        res.json({
            success: true,
            data: data || [],
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

exports.getCurrentUser =async (req, res) => {
    try {
        const userId = req.user.id;

        const {data, error} = await supabase
            .from('users')
            .select('*')
            .eq('userID', userId)
            .single();

        if(error) {
            throw error;
        }

        if(!data) {
            return res.status(404).json({
                success: false,
                error: 'User not found',
            });
        }

        res.json({
            success: true,
            data,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const {name, phone, address, avatarUrl, description} = req.body;

        const updateData = {};
        if(name !== undefined)
            updateData.name = name;
        if(phone !== undefined)
            updateData.phone = phone;
        if(address !== undefined)
            updateData.address = address;
        if(avatarUrl !== undefined)
            updateData.avatarUrl = avatarUrl;
        if(description !== undefined)
            updateData.description = description;

        const {data, error} = await supabase
            .from('users')
            .update(updateData)
            .eq('userID', userId)
            .select()
            .single();

        if(error) {
            throw error;
        }

        res.json({
            success: true,
            message: 'Profile updated successfully',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};