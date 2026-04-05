import { Request } from 'express';
import { TaskStatus, Priority } from '@prisma/client';

// ─── Auth ───────────────────────────────────────────────────────────────────

export interface JwtPayload {
  userId: number;
  email: string;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

// ─── Auth DTOs ───────────────────────────────────────────────────────────────

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

// ─── Task DTOs ───────────────────────────────────────────────────────────────

export interface CreateTaskDto {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: Priority;
  dueDate?: string;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: Priority;
  dueDate?: string;
}

// ─── Query Params ─────────────────────────────────────────────────────────────

export interface TaskQueryParams {
  page?: string;
  limit?: string;
  status?: TaskStatus;
  priority?: Priority;
  search?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'title' | 'priority' | 'dueDate';
  order?: 'asc' | 'desc';
}

// ─── API Responses ────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}
