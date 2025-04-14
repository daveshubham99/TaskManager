const express = require('express');
const router = express.Router();
const {
    getTasks,
    getTask,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');
const { check } = require('express-validator');

// Get all tasks & create a task
router
    .route('/')
    .get(protect, getTasks)
    .post(
        protect,
        [
            check('title', 'Title is required').notEmpty(),
            check('title', 'Title cannot exceed 100 characters').isLength({ max: 100 }),
            check('description', 'Description cannot exceed 1000 characters').optional().isLength({ max: 1000 }),
            check('status', 'Status is invalid').optional().isIn(['pending', 'in-progress', 'completed']),
            check('priority', 'Priority is invalid').optional().isIn(['low', 'medium', 'high']),
            check('dueDate', 'Due date must be a valid date').optional().isISO8601(),
        ],
        createTask
    );

// Get, update & delete a task by ID
router
    .route('/:id')
    .get(protect, getTask)
    .put(
        protect,
        [
            check('title', 'Title cannot exceed 100 characters').optional().isLength({ max: 100 }),
            check('description', 'Description cannot exceed 1000 characters').optional().isLength({ max: 1000 }),
            check('status', 'Status is invalid').optional().isIn(['pending', 'in-progress', 'completed']),
            check('priority', 'Priority is invalid').optional().isIn(['low', 'medium', 'high']),
            check('dueDate', 'Due date must be a valid date').optional().isISO8601(),
        ],
        updateTask
    )
    .delete(protect, deleteTask);

// Update task status
router.patch(
    '/:id/status',
    protect,
    [check('status', 'Status is invalid').isIn(['pending', 'in-progress', 'completed'])],
    updateTaskStatus
);

module.exports = router; 