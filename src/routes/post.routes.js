const router = require('express').Router();
const postController = require('../controllers/post.controller');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, postController.getAllPosts);
router.post('/', authMiddleware, postController.createPost);
router.put('/:id', authMiddleware, postController.updatePost);
router.delete('/:id', authMiddleware, postController.deletePost);

module.exports = router;