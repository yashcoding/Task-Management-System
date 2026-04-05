import { Router } from 'express';
import {
  getTasks,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
  toggleTask,
} from '../controllers/tasks.controller';
import { authenticate } from '../middleware/auth.middleware';
import {
  createTaskValidators,
  updateTaskValidators,
  taskIdValidator,
  taskQueryValidators,
  validate,
} from '../middleware/validation.middleware';

const router = Router();

// All task routes require authentication
router.use(authenticate);

// GET  /tasks       — list with pagination, filter, search
router.get('/', taskQueryValidators, validate, getTasks);

// POST /tasks       — create a new task
router.post('/', createTaskValidators, validate, createTask);

// GET    /tasks/:id  — get single task
router.get('/:id', taskIdValidator, validate, getTaskById);

// PATCH  /tasks/:id  — update task fields
router.patch('/:id', [...taskIdValidator, ...updateTaskValidators], validate, updateTask);

// DELETE /tasks/:id  — delete task
router.delete('/:id', taskIdValidator, validate, deleteTask);

// PATCH  /tasks/:id/toggle — cycle task status
router.patch('/:id/toggle', taskIdValidator, validate, toggleTask);

export default router;
