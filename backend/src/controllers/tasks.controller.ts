import { Response } from 'express';
import { Prisma, TaskStatus, Priority } from '@prisma/client';
import { prisma } from '../utils/prisma';
import { sendSuccess, sendError, sendCreated } from '../utils/response';
import { AuthenticatedRequest, CreateTaskDto, UpdateTaskDto, TaskQueryParams } from '../types';

// ─── GET /tasks ───────────────────────────────────────────────────────────────

export async function getTasks(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const {
      page = '1',
      limit = '10',
      status,
      priority,
      search,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query as TaskQueryParams;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: Prisma.TaskWhereInput = { userId };

    if (status) where.status = status as TaskStatus;
    if (priority) where.priority = priority as Priority;
    if (search?.trim()) {
      where.title = { contains: search.trim(), mode: 'insensitive' };
    }

    // Count total for pagination
    const total = await prisma.task.count({ where });

    // Fetch tasks
    const tasks = await prisma.task.findMany({
      where,
      orderBy: { [sortBy]: order },
      skip,
      take: limitNum,
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        priority: true,
        dueDate: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const totalPages = Math.ceil(total / limitNum);

    sendSuccess(res, {
      items: tasks,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (err) {
    console.error('[getTasks]', err);
    sendError(res, 'Failed to fetch tasks', 500);
  }
}

// ─── POST /tasks ──────────────────────────────────────────────────────────────

export async function createTask(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const { title, description, status, priority, dueDate } = req.body as CreateTaskDto;

    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        description: description?.trim(),
        status: status ?? 'PENDING',
        priority: priority ?? 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : undefined,
        userId,
      },
    });

    sendCreated(res, { task }, 'Task created successfully');
  } catch (err) {
    console.error('[createTask]', err);
    sendError(res, 'Failed to create task', 500);
  }
}

// ─── GET /tasks/:id ───────────────────────────────────────────────────────────

export async function getTaskById(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const taskId = parseInt(req.params.id);

    const task = await prisma.task.findFirst({
      where: { id: taskId, userId },
    });

    if (!task) {
      sendError(res, 'Task not found', 404);
      return;
    }

    sendSuccess(res, { task });
  } catch (err) {
    console.error('[getTaskById]', err);
    sendError(res, 'Failed to fetch task', 500);
  }
}

// ─── PATCH /tasks/:id ─────────────────────────────────────────────────────────

export async function updateTask(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const taskId = parseInt(req.params.id);
    const { title, description, status, priority, dueDate } = req.body as UpdateTaskDto;

    // Ensure task belongs to this user
    const existing = await prisma.task.findFirst({ where: { id: taskId, userId } });
    if (!existing) {
      sendError(res, 'Task not found', 404);
      return;
    }

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(description !== undefined && { description: description.trim() }),
        ...(status !== undefined && { status }),
        ...(priority !== undefined && { priority }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
      },
    });

    sendSuccess(res, { task: updated }, 'Task updated successfully');
  } catch (err) {
    console.error('[updateTask]', err);
    sendError(res, 'Failed to update task', 500);
  }
}

// ─── DELETE /tasks/:id ────────────────────────────────────────────────────────

export async function deleteTask(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const taskId = parseInt(req.params.id);

    const existing = await prisma.task.findFirst({ where: { id: taskId, userId } });
    if (!existing) {
      sendError(res, 'Task not found', 404);
      return;
    }

    await prisma.task.delete({ where: { id: taskId } });

    sendSuccess(res, { id: taskId }, 'Task deleted successfully');
  } catch (err) {
    console.error('[deleteTask]', err);
    sendError(res, 'Failed to delete task', 500);
  }
}

// ─── PATCH /tasks/:id/toggle ──────────────────────────────────────────────────

export async function toggleTask(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const userId = req.user!.userId;
    const taskId = parseInt(req.params.id);

    const existing = await prisma.task.findFirst({ where: { id: taskId, userId } });
    if (!existing) {
      sendError(res, 'Task not found', 404);
      return;
    }

    // Cycle: PENDING → IN_PROGRESS → DONE → PENDING
    const nextStatus: Record<TaskStatus, TaskStatus> = {
      PENDING: 'IN_PROGRESS',
      IN_PROGRESS: 'DONE',
      DONE: 'PENDING',
    };

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: { status: nextStatus[existing.status] },
    });

    sendSuccess(res, { task: updated }, `Task status updated to ${updated.status}`);
  } catch (err) {
    console.error('[toggleTask]', err);
    sendError(res, 'Failed to toggle task', 500);
  }
}
