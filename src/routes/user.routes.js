const router = require('express').Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth');

router.get('/me', authMiddleware, userController.getCurrentUser);
router.put('/me', authMiddleware, userController.updateProfile);
router.get('/:userId', authMiddleware, userController.getUserById);
router.get('/', authMiddleware, userController.getAllUsers);

module.exports = router;
