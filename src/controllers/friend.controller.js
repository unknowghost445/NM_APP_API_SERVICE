const supabase = require('../config/supabase');

function normalizePair(u1, u2) {
    return u1 < u2 ? {userAId: u1, userBId: u2} : {userAId: u2, userBId: u1};
}

exports.sendFriendRequest = async (req, res) => {
    try {
        const fromUserId = req.user.id;
        const {toUserId} = req.body;

        if(!toUserId) {
            return res.status(400).json({
                success: false,
                error: 'toUserId is required',
            });
        }

        if(fromUserId === toUserId) {
            return res.status(400).json({
                success: false,
                error: 'Cannot send friend request to yourself',
            });
        }

        const {data: existing} = await supabase
            .from('friend_requests')
            .select('*')
            .eq('from_user_id', fromUserId)
            .eq('to_user_id', toUserId)
            .eq('status', 'pending')
            .maybeSingle();

        if(existing) {
            return res.status(400).json({
                success: false,
                error: 'Friend request already sent',
            });
        }

        const {userAId, userBId} = normalizePair(fromUserId, toUserId);
        const {data: friendship} = await supabase
            .from('friends')
            .select('*')
            .eq('user_a_id', userAId)
            .eq('user_b_id', userBId)
            .maybeSingle();

        if(friendship) {
            return res.status(400).json({
                success: false,
                error: 'You are already friends',
            });
        }

        const {data, error} = await supabase
            .from('friend_requests')
            .insert({
                from_user_id: fromUserId,
                to_user_id: toUserId,
                status: 'pending',
                message: req.body.message || null,
            })
            .select()
            .single();

        if(error) {
            throw error;
        }

        res.status(201).json({
            success: true,
            data,
            message: 'Friend request sent successfully',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

exports.getPendingFriendRequests = async (req, res) => {
    try {
        const userId = req.user.id;

        const {data, error} = await supabase
            .from('friend_requests')
            .select(`
                id,
                from_user_id,
                to_user_id,
                status,
                message,
                created_at,
                from_user:users!friend_requests_from_user_id_fkey(
                    userID,
                    name,
                    avatarUrl
                )
            `)
            .eq('to_user_id', userId)
            .eq('status', 'pending')
            .order('created_at', {ascending: false});

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

exports.acceptFriendRequest = async (req, res) => {
    try {
        const userId = req.user.id;
        const {requestId} = req.params;

        const {data, error: fetchError} = await supabase
            .from('friend_requests')
            .select('*')
            .eq('id', requestId)
            .single();

        if(fetchError) {
            throw fetchError;
        }

        if(!data) {
            return res.status(404).json({
                success: false,
                error: 'Friend request not found',
            });
        }

        if(data.to_user_id !== userId) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to accept this friend request',
            });
        }

        if(data.status !== 'pending') {
            return res.status(400).json({
                success: false,
                error: 'Request already processed',
            });
        }

        const {userAId, userBId} = normalizePair(data.from_user_id, data.to_user_id);
        const {error: insertError} = await supabase
            .from('friends')
            .insert({
                user_a_id: userAId,
                user_b_id: userBId,
            });

        if(insertError) {
            throw insertError;
        }

        const {error: updateError} = await supabase
            .from('friend_requests')
            .update({status: 'accepted'})
            .eq('id', requestId);

        if(updateError) {
            throw updateError;
        }

        res.json({
            success: true,
            message: 'Friend request accepted',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

exports.declineFriendRequest = async (req, res) => {
    try {
        const userId = req.user.id;
        const {requestId} = req.params;

        const {data, error: fetchError} = await supabase
            .from('friend_requests')
            .select('*')
            .eq('id', requestId)
            .single();

        if(fetchError) {
            throw fetchError;
        }

        if(!data) {
            return res.status(404).json({
                success: false,
                error: 'Friend request not found',
            });
        }

        if(data.to_user_id !== userId) {
            return res.status(403).json({
                success: false,
                error: 'Not authorized to decline this friend request',
            });
        }

        const {error: updateError} = await supabase
            .from('friend_requests')
            .update({status: 'declined'})
            .eq('id', requestId);

        if(updateError) {
            throw updateError;
        }

        res.json({
            success: true,
            message: 'Friend request declined',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

exports.getFriendsList = async (req, res) => {
    try {
        const userId = req.user.id;

        const {data: friendships, error} = await supabase
            .from('friends')
            .select('*')
            .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`);

        if(error) {
            throw error;
        }

        const friendIds = friendships?.map(f => f.user_a_id === userId ? f.user_b_id : f.user_a_id) || [];

        if(friendIds.length === 0) {
            return res.json({
                success: true,
                data: [],
            });
        }

        const {data: users, error: usersError} = await supabase
            .from('users')
            .select('*')
            .in('userID', friendIds);

        if(usersError) {
            throw usersError;
        }

        res.json({
            success: true,
            data: users || [],
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

exports.deleteFriend = async (req, res) => {
    try {
        const userId = req.user.id;
        const {friendId} = req.params;

        if(!friendId) {
            return res.status(400).json({
                success: false,
                error: 'friendId is required',
            });
        }

        if(userId === friendId) {
            return res.status(400).json({
                success: false,
                error: 'Cannot unfriend yourself',
            });
        }

        const {userAId, userBId} = normalizePair(userId, friendId);
        const {error} = await supabase
            .from('friends')
            .delete()
            .eq('user_a_id', userAId)
            .eq('user_b_id', userBId);

        if(error) {
            throw error;
        }

        res.json({
            success: true,
            message: 'Friend deleted successfully',
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

exports.getFriendSuggestions = async (req, res) => {
    try {
        const userId = req.user.id;
        const {phones} = req.body;

        if(!phones || !Array.isArray(phones) || phones.length === 0) {
            return res.json({
                success: true,
                data: [],
            });
        }

        const {data: users, error} = await supabase
            .from('users')
            .select('*')
            .in('phone', phones)
            .neq('userID', userId);

        if(error) {
            throw error;
        }

        const {data: friendships} = await supabase
            .from('friends')
            .select('*')
            .or(`user_a_id.eq.${userId},user_b_id.eq.${userId}`);

        const friendIds = friendships?.map(f => f.user_a_id === userId ? f.user_b_id : f.user_a_id) || [];
        const suggestedFriends = users?.filter(user => !friendIds.includes(user.userID)) || [];

        res.json({
            success: true,
            data: suggestedFriends,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};
