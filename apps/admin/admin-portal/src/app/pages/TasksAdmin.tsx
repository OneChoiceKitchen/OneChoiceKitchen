import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus, Layout, List, Calendar as CalendarIcon, Clock, MoreVertical, X } from 'lucide-react';
import axios from 'axios';
import styles from './TasksAdmin.module.css';

const DEFAULT_COLUMNS = [
  'Backlog', 'To Do', 'In Progress', 'Code Review', 'Testing', 'UAT', 'Completed', 'Blocked', 'On Hold'
];

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` }
});

export default function TasksAdmin() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('board'); // dashboard, board, list, calendar, timeline
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);

  useEffect(() => {
    fetchTasks();
    fetchStats();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await axios.get('/api/tasks', authHeaders());
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get('/api/tasks/stats', authHeaders());
      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const onDragEnd = async (result: any) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const task = tasks.find(t => t.id === draggableId);
    if (!task) return;

    // Optimistic UI update
    const updatedTasks = tasks.map(t => {
      if (t.id === draggableId) {
        return { ...t, status: destination.droppableId };
      }
      return t;
    });
    setTasks(updatedTasks);

    try {
      await axios.put(`/api/tasks/${draggableId}/status`, { status: destination.droppableId }, authHeaders());
      fetchStats();
    } catch (err) {
      console.error(err);
      fetchTasks(); // revert on error
    }
  };

  const getTasksByStatus = (status: string) => {
    return tasks.filter(t => t.status === status);
  };

  const getPriorityClass = (priority: string) => {
    switch(priority?.toLowerCase()) {
      case 'critical': return styles.priorityCritical;
      case 'high': return styles.priorityHigh;
      case 'medium': return styles.priorityMedium;
      default: return styles.priorityLow;
    }
  };

  const openNewTaskModal = () => {
    setSelectedTask(null);
    setIsModalOpen(true);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Task Management</h1>
        <button className={styles.primaryButton} onClick={openNewTaskModal}>
          <Plus size={20} /> Create Task
        </button>
      </div>

      <div className={styles.tabs}>
        <button className={`${styles.tab} ${activeTab === 'dashboard' ? styles.active : ''}`} onClick={() => setActiveTab('dashboard')}>
          Dashboard
        </button>
        <button className={`${styles.tab} ${activeTab === 'board' ? styles.active : ''}`} onClick={() => setActiveTab('board')}>
          <Layout size={16} style={{display: 'inline', marginRight: 4}}/> Kanban Board
        </button>
        <button className={`${styles.tab} ${activeTab === 'list' ? styles.active : ''}`} onClick={() => setActiveTab('list')}>
          <List size={16} style={{display: 'inline', marginRight: 4}}/> List View
        </button>
      </div>

      {activeTab === 'dashboard' && stats && (
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <span className={styles.statTitle}>Total Tasks</span>
            <span className={styles.statValue}>{stats.total}</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statTitle}>To Do</span>
            <span className={styles.statValue}>{stats.todo}</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statTitle}>In Progress</span>
            <span className={styles.statValue}>{stats.inProgress}</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statTitle}>Completed</span>
            <span className={styles.statValue}>{stats.completed}</span>
          </div>
          <div className={styles.statCard} style={{ borderLeft: '4px solid #DC2626' }}>
            <span className={styles.statTitle}>Overdue</span>
            <span className={styles.statValue}>{stats.overdue}</span>
          </div>
        </div>
      )}

      {activeTab === 'board' && (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className={styles.board}>
            {DEFAULT_COLUMNS.map(columnId => (
              <Droppable droppableId={columnId} key={columnId}>
                {(provided, snapshot) => (
                  <div 
                    className={styles.column}
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={{ background: snapshot.isDraggingOver ? '#e2e8f0' : '#f1f5f9' }}
                  >
                    <div className={styles.columnHeader}>
                      {columnId}
                      <span className={styles.columnBadge}>{getTasksByStatus(columnId).length}</span>
                    </div>
                    <div className={styles.taskList}>
                      {getTasksByStatus(columnId).map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              className={`${styles.taskCard} ${snapshot.isDragging ? styles.dragging : ''}`}
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => { setSelectedTask(task); setIsModalOpen(true); }}
                            >
                              <div className={styles.taskHeader}>
                                <span className={styles.taskId}>{task.taskId}</span>
                                <MoreVertical size={16} color="#94a3b8" />
                              </div>
                              <h3 className={styles.taskTitle}>{task.title}</h3>
                              <div className={styles.taskFooter}>
                                <span className={`${styles.taskPriority} ${getPriorityClass(task.priority)}`}>
                                  {task.priority}
                                </span>
                                {task.dueDate && (
                                  <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <Clock size={12} /> {new Date(task.dueDate).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>
      )}

      {activeTab === 'list' && (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Due Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map(task => (
                <tr key={task.id}>
                  <td>{task.taskId}</td>
                  <td style={{ fontWeight: 500, color: '#0f172a' }}>{task.title}</td>
                  <td>{task.status}</td>
                  <td>
                    <span className={`${styles.taskPriority} ${getPriorityClass(task.priority)}`}>
                      {task.priority}
                    </span>
                  </td>
                  <td>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}</td>
                  <td>
                    <button onClick={() => { setSelectedTask(task); setIsModalOpen(true); }} style={{ background: 'none', border: 'none', color: '#2563EB', cursor: 'pointer', fontWeight: 500 }}>
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
              {tasks.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: '#64748b' }}>No tasks found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <TaskModal 
          task={selectedTask} 
          onClose={() => setIsModalOpen(false)} 
          onSave={() => {
            fetchTasks();
            fetchStats();
            setIsModalOpen(false);
          }} 
        />
      )}
    </div>
  );
}

function TaskModal({ task, onClose, onSave }: { task: any, onClose: () => void, onSave: () => void }) {
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'To Do',
    priority: task?.priority || 'Medium',
    taskType: task?.taskType || 'Feature',
    dueDate: task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
    estimatedHours: task?.estimatedHours || '',
  });

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      if (task) {
        await axios.put(`/api/tasks/${task.id}`, formData, authHeaders());
      } else {
        await axios.post('/api/tasks', formData, authHeaders());
      }
      onSave();
    } catch (err) {
      console.error(err);
      alert('Error saving task');
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>{task ? `Edit Task ${task.taskId}` : 'Create New Task'}</h2>
          <button className={styles.closeButton} onClick={onClose}><X size={24} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className={styles.modalBody}>
            <div className={styles.formGroup}>
              <label>Title</label>
              <input name="title" value={formData.title} onChange={handleChange} required placeholder="Enter task title" />
            </div>
            <div className={styles.formGroup}>
              <label>Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows={4} placeholder="Add detailed description..."></textarea>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className={styles.formGroup}>
                <label>Status</label>
                <select name="status" value={formData.status} onChange={handleChange}>
                  {DEFAULT_COLUMNS.map(col => <option key={col} value={col}>{col}</option>)}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Priority</label>
                <select name="priority" value={formData.priority} onChange={handleChange}>
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className={styles.formGroup}>
                <label>Due Date</label>
                <input type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} />
              </div>
              <div className={styles.formGroup}>
                <label>Estimated Hours</label>
                <input type="number" name="estimatedHours" value={formData.estimatedHours} onChange={handleChange} step="0.5" />
              </div>
            </div>
          </div>
          <div className={styles.modalFooter}>
            <button type="button" className={styles.cancelButton} onClick={onClose}>Cancel</button>
            <button type="submit" className={styles.primaryButton}>Save Task</button>
          </div>
        </form>
      </div>
    </div>
  );
}
