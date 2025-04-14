const Task = require('../models/Task');
const { validationResult } = require('express-validator');

// @desc    Get all tasks for a user
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
    try {
        // Get query parameters for filtering
        const { status, priority, search } = req.query;

        // Base query - show only user's tasks
        const query = { user: req.user._id };

        // Add filters if they exist
        if (status) query.status = status;
        if (priority) query.priority = priority;
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }

        const tasks = await Task.find(query).sort({ createdAt: -1 });

        res.json(tasks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get a single task
// @route   GET /api/tasks/:id
// @access  Private
const getTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Check task belongs to user
        if (task.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to access this task' });
        }

        res.json(task);
    } catch (error) {
        console.error(error);

        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Task not found' });
        }

        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { title, description, status, priority, dueDate } = req.body;

        const task = await Task.create({
            title,
            description,
            status: status || 'pending',
            priority: priority || 'medium',
            dueDate: dueDate || null,
            user: req.user._id,
        });

        res.status(201).json(task);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { title, description, status, priority, dueDate } = req.body;

        // Find task by id
        let task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Check task belongs to user
        if (task.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to update this task' });
        }

        // Update the task
        task = await Task.findByIdAndUpdate(
            req.params.id,
            {
                title: title || task.title,
                description: description !== undefined ? description : task.description,
                status: status || task.status,
                priority: priority || task.priority,
                dueDate: dueDate !== undefined ? dueDate : task.dueDate,
            },
            { new: true, runValidators: true }
        );

        res.json(task);
    } catch (error) {
        console.error(error);

        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Task not found' });
        }

        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
    try {
        // Find task by id
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Check task belongs to user
        if (task.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to delete this task' });
        }

        await task.deleteOne();

        res.json({ message: 'Task removed' });
    } catch (error) {
        console.error(error);

        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Task not found' });
        }

        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update task status (mark as complete)
// @route   PATCH /api/tasks/:id/status
// @access  Private
const updateTaskStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!status || !['pending', 'in-progress', 'completed'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }

        // Find task by id
        let task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Check task belongs to user
        if (task.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to update this task' });
        }

        // Update just the status
        task = await Task.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        res.json(task);
    } catch (error) {
        console.error(error);

        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Task not found' });
        }

        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getTasks,
    getTask,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
}; 