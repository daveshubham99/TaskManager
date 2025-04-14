import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const useTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        status: '',
        priority: '',
        search: '',
    });

    // Fetch tasks
    const fetchTasks = useCallback(async () => {
        setLoading(true);
        try {
            // Build query string from filters
            const queryParams = new URLSearchParams();
            if (filters.status) queryParams.append('status', filters.status);
            if (filters.priority) queryParams.append('priority', filters.priority);
            if (filters.search) queryParams.append('search', filters.search);

            const res = await axios.get(`/api/tasks?${queryParams.toString()}`);
            setTasks(res.data);
            setError(null);
        } catch (error) {
            console.error('Error fetching tasks:', error);
            setError(error.response?.data?.message || 'Failed to fetch tasks');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    // Create a new task
    const createTask = async (taskData) => {
        try {
            const res = await axios.post('/api/tasks', taskData);
            setTasks((prevTasks) => [res.data, ...prevTasks]);
            return { success: true, task: res.data };
        } catch (error) {
            console.error('Error creating task:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to create task'
            };
        }
    };

    // Update a task
    const updateTask = async (id, taskData) => {
        try {
            const res = await axios.put(`/api/tasks/${id}`, taskData);
            setTasks((prevTasks) =>
                prevTasks.map((task) => (task._id === id ? res.data : task))
            );
            return { success: true, task: res.data };
        } catch (error) {
            console.error('Error updating task:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to update task'
            };
        }
    };

    // Delete a task
    const deleteTask = async (id) => {
        try {
            await axios.delete(`/api/tasks/${id}`);
            setTasks((prevTasks) => prevTasks.filter((task) => task._id !== id));
            return { success: true };
        } catch (error) {
            console.error('Error deleting task:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to delete task'
            };
        }
    };

    // Update task status (mark as complete, etc.)
    const updateTaskStatus = async (id, status) => {
        try {
            const res = await axios.patch(`/api/tasks/${id}/status`, { status });
            setTasks((prevTasks) =>
                prevTasks.map((task) => (task._id === id ? res.data : task))
            );
            return { success: true, task: res.data };
        } catch (error) {
            console.error('Error updating task status:', error);
            return {
                success: false,
                message: error.response?.data?.message || 'Failed to update task status'
            };
        }
    };

    // Update filters
    const updateFilters = (newFilters) => {
        setFilters((prev) => ({ ...prev, ...newFilters }));
    };

    return {
        tasks,
        loading,
        error,
        filters,
        fetchTasks,
        createTask,
        updateTask,
        deleteTask,
        updateTaskStatus,
        updateFilters,
    };
};

export default useTasks; 