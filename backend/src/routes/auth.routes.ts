import { Router } from 'express';
import { register, login, refresh, logout, getMe } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import {
  registerValidators,
  loginValidators,
  validate,
} from '../middleware/validation.middleware';

const router = Router();

// POST /auth/register
router.post('/register', registerValidators, validate, register);

// POST /auth/login
router.post('/login', loginValidators, validate, login);

// POST /auth/refresh
router.post('/refresh', refresh);

// POST /auth/logout
router.post('/logout', logout);

// GET /auth/me  (protected)
router.get('/me', authenticate, getMe);

export default router;
