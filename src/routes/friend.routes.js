const router = require('express').Router();
const friendController = require('../controllers/friend.controller');
const authMiddleware = require('../middleware/auth');

router.post('/request', authMiddleware, friendController.sendFriendRequest);
router.get('/requests', authMiddleware, friendController.getPendingFriendRequests);
router.post('/accept/:requestId', authMiddleware, friendController.acceptFriendRequest);
router.post('/decline/:requestId', authMiddleware, friendController.declineFriendRequest);
router.get('/list', authMiddleware, friendController.getFriendsList);
router.delete('/delete/:friendId', authMiddleware, friendController.deleteFriend);
router.post('/suggestions', authMiddleware, friendController.getFriendSuggestions);

module.exports = router;
