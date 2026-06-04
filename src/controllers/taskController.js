import mongoose from 'mongoose';
import Task from '../models/Task.js';
import Project from '../models/Project.js';

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

async function authorizeProject(projectId, userId) {
  if (!isValidId(projectId)) {
    return { error: { status: 400, message: 'Invalid project id' } };
  }
  const project = await Project.findById(projectId);
  if (!project) {
    return { error: { status: 404, message: 'Project not found' } };
  }
  if (project.owner.toString() !== userId.toString()) {
    return { error: { status: 403, message: 'Not authorized for this project' } };
  }
  return { project };
}

// ---- CREATE ----
// POST /api/projects/:projectId/tasks
export async function createTask(req, res) {
  try {
    const { projectId } = req.params;
    const { project, error } = await authorizeProject(projectId, req.user._id);
    if (error) return res.status(error.status).json({ message: error.message });

    const { title, description, status, priority } = req.body;
    if (!title) {
      return res.status(400).json({ message: 'Task title is required' });
    }

    const task = await Task.create({
      title,
      description,
      status,
      priority,
      project: project._id, // link to the parent project
      owner: req.user._id, // who created it
    });
    return res.status(201).json(task);
  } catch (err) {
    if (err.name === 'ValidationError') {
      const msg = Object.values(err.errors)[0].message;
      return res.status(400).json({ message: msg });
    }
    return res.status(500).json({ message: 'Server error creating task' });
  }
}

// ---- READ ALL (for one project) ----
// GET /api/projects/:projectId/tasks
export async function getTasks(req, res) {
  try {
    const { projectId } = req.params;
    const { error } = await authorizeProject(projectId, req.user._id);
    if (error) return res.status(error.status).json({ message: error.message });

    const tasks = await Task.find({ project: projectId }).sort({ createdAt: 1 });
    return res.status(200).json(tasks);
  } catch (err) {
    return res.status(500).json({ message: 'Server error fetching tasks' });
  }
}

// ---- UPDATE ----
// PUT /api/projects/:projectId/tasks/:taskId
export async function updateTask(req, res) {
  try {
    const { projectId, taskId } = req.params;
    const { error } = await authorizeProject(projectId, req.user._id);
    if (error) return res.status(error.status).json({ message: error.message });

    if (!isValidId(taskId)) {
      return res.status(400).json({ message: 'Invalid task id' });
    }

    // The task must exist AND actually belong to this project.
    const task = await Task.findOne({ _id: taskId, project: projectId });
    if (!task) {
      return res.status(404).json({ message: 'Task not found in this project' });
    }

    const { title, description, status, priority } = req.body;
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (status !== undefined) task.status = status;
    if (priority !== undefined) task.priority = priority;

    const updated = await task.save(); // re-runs enum + length validation
    return res.status(200).json(updated);
  } catch (err) {
    if (err.name === 'ValidationError') {
      const msg = Object.values(err.errors)[0].message;
      return res.status(400).json({ message: msg });
    }
    return res.status(500).json({ message: 'Server error updating task' });
  }
}

// ---- DELETE ----
// DELETE /api/projects/:projectId/tasks/:taskId
export async function deleteTask(req, res) {
  try {
    const { projectId, taskId } = req.params;
    const { error } = await authorizeProject(projectId, req.user._id);
    if (error) return res.status(error.status).json({ message: error.message });

    if (!isValidId(taskId)) {
      return res.status(400).json({ message: 'Invalid task id' });
    }

    const task = await Task.findOne({ _id: taskId, project: projectId });
    if (!task) {
      return res.status(404).json({ message: 'Task not found in this project' });
    }

    await task.deleteOne();
    return res.status(200).json({ message: 'Task deleted', _id: taskId });
  } catch (err) {
    return res.status(500).json({ message: 'Server error deleting task' });
  }
}