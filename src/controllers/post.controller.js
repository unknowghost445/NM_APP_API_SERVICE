const supabase = require('../config/supabase');

exports.getAllPosts = async (req, res) => {
    try {
        const {data, error} = await supabase
            .from('postdata')
            .select('*')
            .order('date', {ascending: false});

        if(error) {
            throw error;
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

exports.createPost = async (req, res) => {
    try {
        const {data: postData} = req.body;
        const userID =req.user.id;

        const {data, error} = await supabase
            .from('postdata')
            .insert({
                userID,
                data: postData,
            })
            .select()
            .single();

        if(error) {
            throw error;
        }

        res.status(201).json({
            success: true,
            data,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        })
    }
};

exports.updatePost = async (req, res) => {
    try {
        const {id} = req.params;
        const {data: newData} = req.body;

        const {data, error} = await supabase
            .from('postdata')
            .update({data: newData})
            .eq('id', id)
            .eq('userID', req.user.id)
            .select()
            .single();

        if(error) {
            throw error;
        }

        res.status(201).json({
            success: true,
            data
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

exports.deletePost = async (req, res) => {
    try {
        const {id} = req.params;

        const {error} = await supabase
            .from('postdata')
            .delete()
            .eq('id', id)
            .eq('userID', req.user.id);

        if(error) {
            throw error;
        }

        res.json({
            success: true,
            message: 'Post deleted successfully',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};
