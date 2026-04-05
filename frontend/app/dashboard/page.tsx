'use client';

import { useState } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { Task } from '@/types';
import { useTasks } from '@/hooks/useTasks';
import TaskCard from '@/components/tasks/TaskCard';
import TaskModal from '@/components/tasks/TaskModal';
import TaskFiltersBar from '@/components/tasks/TaskFiltersBar';
import StatsBar from '@/components/tasks/StatsBar';
import Pagination from '@/components/ui/Pagination';

export default function DashboardPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const {
    tasks,
    pagination,
    isLoading,
    filters,
    updateFilters,
    createTask,
    updateTask,
    deleteTask,
    toggleTask,
    refresh,
  } = useTasks();

  const openCreate = () => { setEditingTask(null); setModalOpen(true); };
  const openEdit = (task: Task) => { setEditingTask(task); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditingTask(null); };

  const handleSave = async (data: object) => {
    if (editingTask) {
      await updateTask(editingTask.id, data as Parameters<typeof updateTask>[1]);
    } else {
      await createTask(data as Parameters<typeof createTask>[0]);
    }
  };

  // Count per status for filter chips (use pagination total as guide)
  const statusCounts = tasks.reduce((acc, t) => {
    acc[t.status] = (acc[t.status] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <>
      {/* Top bar */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-bg-2">
        <h1 className="text-lg font-semibold flex-1 tracking-tight">My Tasks</h1>
        <button
          onClick={refresh}
          className="btn-ghost !px-2.5 !py-2 text-muted hover:text-white"
          title="Refresh"
        >
          <RefreshCw size={14} />
        </button>
        <button onClick={openCreate} className="btn-primary gap-1.5">
          <Plus size={15} />
          New Task
        </button>
      </div>

      {/* Stats */}
      <StatsBar tasks={tasks} total={pagination?.total ?? tasks.length} />

      {/* Filters */}
      <TaskFiltersBar
        filters={filters}
        onChange={updateFilters}
        totalCounts={statusCounts}
      />

      {/* Task list */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2.5">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 rounded-full border-2 border-accent border-t-transparent animate-spin" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted gap-3">
            <span className="text-4xl opacity-30">📭</span>
            <p className="text-sm">
              {filters.search ? `No tasks match "${filters.search}"` : 'No tasks here yet.'}
            </p>
            {!filters.search && (
              <button onClick={openCreate} className="btn-ghost !text-sm mt-1">
                + Add your first task
              </button>
            )}
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={openEdit}
              onDelete={deleteTask}
              onToggle={toggleTask}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination && (
        <Pagination
          pagination={pagination}
          onPageChange={(page) => updateFilters({ page })}
        />
      )}

      {/* Modal */}
      {modalOpen && (
        <TaskModal
          task={editingTask}
          onClose={closeModal}
          onSave={handleSave}
        />
      )}
    </>
  );
}
