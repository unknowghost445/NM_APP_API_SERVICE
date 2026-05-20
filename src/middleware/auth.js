const supabase = require('../config/supabase');

module.exports = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.replace('Bearer', '').trim();

        if(!token) {
            return res.status(401).json({
                error: 'No token provided'
            });
        }

        const {data: {user}, error} = await supabase.auth.getUser(token);

        if(error || !user) {
            return res.status(401).json({
                error: 'Invalid token'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({
            error: 'Authentication failed'
        });
    }
};
