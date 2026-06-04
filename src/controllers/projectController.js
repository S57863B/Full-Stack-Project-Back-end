import mongoose from 'mongoose';
import Project from '../models/Project.js';
import Task from '../models/Task.js';

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// ---- CREATE ----
// POST /api/projects
export async function createProject(req, res) {
  try {
    const { name, description, hue, icon } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Project name is required' });
    }
    const project = await Project.create({
      name,
      description,
      hue,
      icon,
      owner: req.user._id, // ownership is assigned server-side
    });
    return res.status(201).json(project);
  } catch (err) {
    if (err.name === 'ValidationError') {
      const msg = Object.values(err.errors)[0].message;
      return res.status(400).json({ message: msg });
    }
    return res.status(500).json({ message: 'Server error creating project' });
  }
}

// GET /api/projects
export async function getProjects(req, res) {
  try {
    const projects = await Project.find({ owner: req.user._id }).sort({
      createdAt: -1, // newest first
    });
    return res.status(200).json(projects);
  } catch (err) {
    return res.status(500).json({ message: 'Server error fetching projects' });
  }
}

// ---- READ ONE ----
// GET /api/projects/:id
export async function getProject(req, res) {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ message: 'Invalid project id' });
    }

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized for this project' });
    }

    return res.status(200).json(project);
  } catch (err) {
    return res.status(500).json({ message: 'Server error fetching project' });
  }
}

// ---- UPDATE ----
// PUT /api/projects/:id
export async function updateProject(req, res) {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ message: 'Invalid project id' });
    }

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized for this project' });
    }

    // Only update fields that were actually provided.
    const { name, description, hue, icon } = req.body;
    if (name !== undefined) project.name = name;
    if (description !== undefined) project.description = description;
    if (hue !== undefined) project.hue = hue;
    if (icon !== undefined) project.icon = icon;

    const updated = await project.save(); // runs schema validation again
    return res.status(200).json(updated);
  } catch (err) {
    if (err.name === 'ValidationError') {
      const msg = Object.values(err.errors)[0].message;
      return res.status(400).json({ message: msg });
    }
    return res.status(500).json({ message: 'Server error updating project' });
  }
}

// ---- DELETE ----
// DELETE /api/projects/:id
export async function deleteProject(req, res) {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ message: 'Invalid project id' });
    }

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized for this project' });
    }

    await Task.deleteMany({ project: id }); // clean up child tasks
    await project.deleteOne();
    return res.status(200).json({ message: 'Project deleted', _id: id });
  } catch (err) {
    return res.status(500).json({ message: 'Server error deleting project' });
  }
}