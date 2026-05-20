const router = require('express').Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth');

router.get('/:userId', authMiddleware, userController.getUserById);
router.get('/', authMiddleware, userController.getAllUsers);
router.get('/me', authMiddleware, userController.getCurrentUser);
router.put('/me', authMiddleware, userController.updateProfile);

module.exports = router;