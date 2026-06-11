import { create } from 'zustand';
import { api } from '../services/api';
import type { Task, Workspace, User, Ticket } from '../data/mockData';

interface StoreState {
  user: User | null;
  token: string | null;
  workspaces: Workspace[];
  tasks: Task[];
  tickets: Ticket[];
  usersList: User[];
  loading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loadInitialData: () => Promise<void>;
  
  // Workspaces
  createWorkspace: (name: string, description: string) => Promise<void>;
  
  // Tasks
  createTask: (taskData: Omit<Task, 'id' | 'comments'>) => Promise<void>;
  updateTask: (taskId: string, taskData: Omit<Task, 'id' | 'comments'>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  updateTaskStatus: (taskId: string, status: Task['status']) => Promise<void>;
  updateBulkStatus: (taskIds: string[], status: Task['status']) => Promise<void>;
  deleteBulkTasks: (taskIds: string[]) => Promise<void>;
  addComment: (taskId: string, text: string) => Promise<void>;

  // Tickets
  createTicket: (ticketData: Omit<Ticket, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  updateTicketStatus: (ticketId: string, status: Ticket['status']) => Promise<void>;
  convertTicketToTask: (ticketId: string, workspaceId: string, assigneeId: string, dueDate: string) => Promise<void>;

  // Users (Admin Panel)
  createUser: (userData: Omit<User, 'id'> & { password?: string }) => Promise<void>;
  updateUser: (userId: string, userData: Omit<User, 'id'> & { password?: string }) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
}

export const useStore = create<StoreState>((set, get) => ({
  user: null,
  token: localStorage.getItem('kowoplanner_token'),
  workspaces: [],
  tasks: [],
  tickets: [],
  usersList: [],
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('kowoplanner_token', token);
      set({ token, user, loading: false });
      
      // Load app data
      await get().loadInitialData();
      return true;
    } catch (err: any) {
      const errMsg = err.response?.data?.error || 'Login fehlgeschlagen.';
      set({ error: errMsg, loading: false });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('kowoplanner_token');
    set({ user: null, token: null, workspaces: [], tasks: [], tickets: [], usersList: [] });
  },

  loadInitialData: async () => {
    const { token } = get();
    if (!token) return;

    set({ loading: true, error: null });
    try {
      // Fetch me session first to restore user profile
      const userRes = await api.get('/auth/me');
      const workspacesRes = await api.get('/workspaces');
      const tasksRes = await api.get('/tasks');
      const ticketsRes = await api.get('/tickets');
      const usersRes = await api.get('/users');

      set({
        user: userRes.data,
        workspaces: workspacesRes.data,
        tasks: tasksRes.data,
        tickets: ticketsRes.data,
        usersList: usersRes.data,
        loading: false
      });
    } catch (err: any) {
      console.error('Failed to load initial data:', err);
      set({ error: 'Fehler beim Laden der Anwendungsdaten.', loading: false });
    }
  },

  createWorkspace: async (name, description) => {
    try {
      const res = await api.post('/workspaces', { name, description });
      set(state => ({ workspaces: [...state.workspaces, res.data] }));
    } catch (err: any) {
      console.error(err);
    }
  },

  createTask: async (taskData) => {
    try {
      const res = await api.post('/tasks', taskData);
      set(state => ({ tasks: [...state.tasks, res.data] }));
    } catch (err: any) {
      console.error(err);
    }
  },

  updateTask: async (taskId, taskData) => {
    try {
      const res = await api.put(`/tasks/${taskId}`, taskData);
      set(state => ({
        tasks: state.tasks.map(t => t.id === taskId ? res.data : t)
      }));
    } catch (err: any) {
      console.error(err);
    }
  },

  deleteTask: async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      set(state => ({ tasks: state.tasks.filter(t => t.id !== taskId) }));
    } catch (err: any) {
      console.error(err);
    }
  },

  updateTaskStatus: async (taskId, status) => {
    // Optimistic update
    set(state => ({
      tasks: state.tasks.map(t => t.id === taskId ? { ...t, status } : t)
    }));
    try {
      await api.put(`/tasks/${taskId}`, { status });
    } catch (err: any) {
      console.error('Failed to sync task status:', err);
    }
  },

  updateBulkStatus: async (taskIds, status) => {
    set(state => ({
      tasks: state.tasks.map(t => taskIds.includes(t.id) ? { ...t, status } : t)
    }));
    try {
      await api.put('/tasks/bulk/status', { taskIds, status });
    } catch (err: any) {
      console.error(err);
    }
  },

  deleteBulkTasks: async (taskIds) => {
    set(state => ({
      tasks: state.tasks.filter(t => !taskIds.includes(t.id))
    }));
    try {
      await api.post('/tasks/bulk/delete', { taskIds });
    } catch (err: any) {
      console.error(err);
    }
  },

  addComment: async (taskId, text) => {
    try {
      const res = await api.post(`/tasks/${taskId}/comments`, { text });
      set(state => ({
        tasks: state.tasks.map(t => {
          if (t.id === taskId) {
            return {
              ...t,
              comments: [...(t.comments || []), res.data]
            };
          }
          return t;
        })
      }));
    } catch (err: any) {
      console.error(err);
    }
  },

  createTicket: async (ticketData) => {
    try {
      const res = await api.post('/tickets', ticketData);
      set(state => ({ tickets: [res.data, ...state.tickets] }));
    } catch (err: any) {
      console.error(err);
    }
  },

  updateTicketStatus: async (ticketId, status) => {
    set(state => ({
      tickets: state.tickets.map(t => t.id === ticketId ? { ...t, status } : t)
    }));
    try {
      await api.put(`/tickets/${ticketId}/status`, { status });
    } catch (err: any) {
      console.error(err);
    }
  },

  convertTicketToTask: async (ticketId, workspaceId, assigneeId, dueDate) => {
    try {
      const res = await api.post(`/tickets/${ticketId}/convert`, {
        workspaceId,
        assigneeId,
        dueDate
      });
      const { task, ticket } = res.data;
      set(state => ({
        tickets: state.tickets.map(t => t.id === ticketId ? ticket : t),
        tasks: [...state.tasks, task]
      }));
    } catch (err: any) {
      console.error(err);
    }
  },

  createUser: async (userData) => {
    try {
      const res = await api.post('/users', userData);
      set(state => ({ usersList: [...state.usersList, res.data] }));
    } catch (err: any) {
      console.error(err);
    }
  },

  updateUser: async (userId, userData) => {
    try {
      const res = await api.put(`/users/${userId}`, userData);
      set(state => ({
        usersList: state.usersList.map(u => u.id === userId ? res.data : u)
      }));
    } catch (err: any) {
      console.error(err);
    }
  },

  deleteUser: async (userId) => {
    try {
      await api.delete(`/users/${userId}`);
      set(state => ({
        usersList: state.usersList.filter(u => u.id !== userId),
        tasks: state.tasks.map(t => ({
          ...t,
          assignees: t.assignees.filter(id => id !== userId)
        }))
      }));
    } catch (err: any) {
      console.error(err);
    }
  }
}));
