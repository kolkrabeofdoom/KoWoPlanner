import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { TaskModal } from './components/TaskModal';

// Views
import { DashboardView } from './views/DashboardView';
import { KanbanView } from './views/KanbanView';
import { ListView } from './views/ListView';
import { CalendarView } from './views/CalendarView';
import { GanttView } from './views/GanttView';
import { MyTasksView } from './views/MyTasksView';
import { AdminView } from './views/AdminView';
import { SupportView } from './views/SupportView';
import { LoginView } from './views/LoginView';

// Store & Types
import { useStore } from './store/useStore';
import type { Task, User, Ticket } from './data/mockData';

function App() {
  const token = useStore(state => state.token);
  const user = useStore(state => state.user);
  const logout = useStore(state => state.logout);
  const workspaces = useStore(state => state.workspaces);
  const tasks = useStore(state => state.tasks);
  const tickets = useStore(state => state.tickets);
  const users = useStore(state => state.usersList);
  const loading = useStore(state => state.loading);

  const loadInitialData = useStore(state => state.loadInitialData);
  const createTask = useStore(state => state.createTask);
  const updateTask = useStore(state => state.updateTask);
  const deleteTask = useStore(state => state.deleteTask);
  const updateTaskStatus = useStore(state => state.updateTaskStatus);
  const updateBulkStatus = useStore(state => state.updateBulkStatus);
  const deleteBulkTasks = useStore(state => state.deleteBulkTasks);

  const createTicket = useStore(state => state.createTicket);
  const updateTicketStatus = useStore(state => state.updateTicketStatus);
  const convertTicketToTask = useStore(state => state.convertTicketToTask);

  const createUser = useStore(state => state.createUser);
  const updateUser = useStore(state => state.updateUser);
  const deleteUser = useStore(state => state.deleteUser);

  // Global Navigation & Search
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>('ws-1');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const location = useLocation();
  const navigate = useNavigate();

  // Sync browser path to currentView state
  useEffect(() => {
    if (!token) return;
    const path = location.pathname.slice(1) || 'dashboard';
    if (['dashboard', 'kanban', 'list', 'calendar', 'gantt', 'mytasks', 'admin', 'support'].includes(path)) {
      setCurrentView(path);
    } else if (location.pathname === '/' || location.pathname === '') {
      navigate('/dashboard', { replace: true });
    }
  }, [location.pathname, token, navigate]);

  const handleSetCurrentView = (view: string) => {
    navigate(`/${view}`);
  };

  // Load app data if authenticated
  useEffect(() => {
    if (token) {
      loadInitialData();
    }
  }, [token, loadInitialData]);

  // Theme state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('kowoplanner_dark');
    if (saved) return saved === 'true';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Modal states
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalDefaultStatus, setModalDefaultStatus] = useState<Task['status'] | undefined>(undefined);
  const [modalDefaultDueDate, setModalDefaultDueDate] = useState<string | undefined>(undefined);

  // Sync dark mode class on document body
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
    localStorage.setItem('kowoplanner_dark', darkMode.toString());
  }, [darkMode]);

  // Redirect to Login if token is missing
  if (!token) {
    return <LoginView />;
  }

  // Active workspace metadata fallback
  const activeWorkspace = workspaces.find(ws => ws.id === activeWorkspaceId) || workspaces[0] || {
    id: activeWorkspaceId,
    name: 'IT-Arbeitsbereich',
    description: ''
  };

  const currentUser = user || {
    id: 'user-guest',
    name: 'Gästebenutzer',
    avatarInitials: 'GB',
    role: 'Gast',
    email: '',
    color: '#6b7280'
  };

  // Filter tasks belonging to current workspace
  const workspaceTasks = tasks.filter(t => t.workspaceId === activeWorkspaceId);

  // Task Actions
  const handleOpenTask = (task: Task) => {
    setSelectedTask(task);
    setModalDefaultStatus(undefined);
    setModalDefaultDueDate(undefined);
    setIsModalOpen(true);
  };

  const handleOpenCreateTask = (status?: Task['status'], dueDate?: string) => {
    setSelectedTask(null);
    setModalDefaultStatus(status);
    setModalDefaultDueDate(dueDate);
    setIsModalOpen(true);
  };

  const handleSaveTask = async (savedTask: Task) => {
    const isNew = !tasks.some(t => t.id === savedTask.id);
    if (isNew) {
      const { id: _, ...taskData } = savedTask;
      await createTask(taskData);
    } else {
      const { id, ...taskData } = savedTask;
      await updateTask(id, taskData);
    }
    setIsModalOpen(false);
  };

  const handleDeleteTask = async (taskId: string) => {
    await deleteTask(taskId);
    setIsModalOpen(false);
  };

  const handleUpdateTaskStatus = async (taskId: string, status: Task['status']) => {
    await updateTaskStatus(taskId, status);
  };

  // Bulk actions (ListView)
  const handleUpdateBulkStatus = async (taskIds: string[], status: Task['status']) => {
    await updateBulkStatus(taskIds, status);
  };

  const handleDeleteBulkTasks = async (taskIds: string[]) => {
    await deleteBulkTasks(taskIds);
  };

  // User Actions (Admin Panel)
  const handleSaveUser = async (savedUser: User) => {
    const exists = users.some(u => u.id === savedUser.id);
    if (exists) {
      const { id, ...userData } = savedUser;
      await updateUser(id, userData);
    } else {
      const { id: _, ...userData } = savedUser;
      await createUser({ ...userData, password: 'PASSWORT' });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    await deleteUser(userId);
  };

  // Ticket Actions
  const handleCreateTicket = async (ticketData: Omit<Ticket, 'id' | 'createdAt' | 'status'>) => {
    await createTicket(ticketData);
  };

  const handleUpdateTicketStatus = async (ticketId: string, status: Ticket['status']) => {
    await updateTicketStatus(ticketId, status);
  };

  const handleConvertTicketToTask = async (ticketId: string, workspaceId: string, assigneeId: string, dueDate: string) => {
    await convertTicketToTask(ticketId, workspaceId, assigneeId, dueDate);
  };

  // View Renderer
  const renderActiveView = () => {
    if (loading && workspaces.length === 0) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh', color: 'var(--text-secondary)' }}>
          <div className="pulse-border" style={{ padding: '24px', borderRadius: '12px' }}>
            Lade Projektdaten...
          </div>
        </div>
      );
    }

    switch (currentView) {
      case 'dashboard':
        return (
          <DashboardView 
            tasks={workspaceTasks} 
            users={users}
            onSelectTask={handleOpenTask} 
            setCurrentView={handleSetCurrentView}
          />
        );
      case 'kanban':
        return (
          <KanbanView 
            tasks={workspaceTasks} 
            users={users}
            onSelectTask={handleOpenTask}
            onAddTask={(status) => handleOpenCreateTask(status, undefined)}
            onUpdateTaskStatus={handleUpdateTaskStatus}
            searchTerm={searchTerm}
          />
        );
      case 'list':
        return (
          <ListView 
            tasks={workspaceTasks}
            users={users}
            onSelectTask={handleOpenTask}
            onUpdateBulkStatus={handleUpdateBulkStatus}
            onDeleteBulkTasks={handleDeleteBulkTasks}
            searchTerm={searchTerm}
          />
        );
      case 'calendar':
        return (
          <CalendarView 
            tasks={workspaceTasks}
            onSelectTask={handleOpenTask}
            onAddTaskAtDate={(dateStr) => handleOpenCreateTask('planning', dateStr)}
          />
        );
      case 'gantt':
        return (
          <GanttView 
            tasks={workspaceTasks}
            users={users}
            onSelectTask={handleOpenTask}
          />
        );
      case 'mytasks':
        return (
          <MyTasksView 
            tasks={tasks} // personal inbox across ALL workspaces
            onSelectTask={handleOpenTask}
            onUpdateTaskStatus={handleUpdateTaskStatus}
          />
        );
      case 'admin':
        return (
          <AdminView 
            users={users}
            onSaveUser={handleSaveUser}
            onDeleteUser={handleDeleteUser}
          />
        );
      case 'support':
        return (
          <SupportView 
            tickets={tickets}
            users={users}
            workspaces={workspaces}
            onCreateTicket={handleCreateTicket}
            onUpdateTicketStatus={handleUpdateTicketStatus}
            onConvertTicketToTask={handleConvertTicketToTask}
          />
        );
      default:
        return <div>View nicht gefunden</div>;
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <Sidebar 
        currentView={currentView}
        setCurrentView={handleSetCurrentView}
        workspaces={workspaces}
        activeWorkspaceId={activeWorkspaceId}
        setActiveWorkspaceId={setActiveWorkspaceId}
        currentUser={currentUser}
      />

      {/* Main Area */}
      <main className="app-content">
        <Header 
          currentView={currentView}
          activeWorkspace={activeWorkspace}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          darkMode={darkMode}
          toggleDarkMode={() => setDarkMode(!darkMode)}
          onAddTask={() => handleOpenCreateTask(undefined, undefined)}
          onLogout={logout}
        />

        {/* View Page Container */}
        <div className="page-container">
          {renderActiveView()}
        </div>
      </main>

      {/* Task Modal Editor / Creator */}
      {isModalOpen && (
        <TaskModal 
          task={selectedTask}
          workspaceId={activeWorkspaceId}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveTask}
          onDelete={handleDeleteTask}
          users={users}
          {...(modalDefaultStatus ? { status: modalDefaultStatus } : {})}
          {...(() => {
            if (selectedTask === null) {
              const defaultNewTask: Task = {
                id: '',
                workspaceId: activeWorkspaceId,
                title: '',
                description: '',
                status: modalDefaultStatus || 'planning',
                priority: 'medium',
                assignees: [],
                startDate: new Date().toISOString().split('T')[0],
                dueDate: modalDefaultDueDate || new Date().toISOString().split('T')[0],
                checklist: [],
                comments: [],
                address: '',
                attachments: []
              };
              return { task: defaultNewTask };
            }
            return {};
          })()}
        />
      )}
    </div>
  );
}

export default App;
