import { useState, useEffect } from 'react';
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

// Data
import { mockTasks, mockWorkspaces, mockUsers, mockTickets } from './data/mockData';
import type { Task, User, Ticket } from './data/mockData';

function App() {
  // Global States
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [tickets, setTickets] = useState<Ticket[]>(mockTickets);
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>('ws-1');
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Theme state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    // Check local storage or prefers-color-scheme
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

  // Find active workspace & current user (always Frank Kröner for the prototype)
  const activeWorkspace = mockWorkspaces.find(ws => ws.id === activeWorkspaceId) || mockWorkspaces[0];
  const currentUser = users.find(u => u.id === 'user-1') || mockUsers[0]; // Frank Kröner

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

  const handleSaveTask = (savedTask: Task) => {
    setTasks(prev => {
      const exists = prev.some(t => t.id === savedTask.id);
      if (exists) {
        return prev.map(t => t.id === savedTask.id ? savedTask : t);
      } else {
        return [...prev, savedTask];
      }
    });
    setIsModalOpen(false);
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    setIsModalOpen(false);
  };

  const handleUpdateTaskStatus = (taskId: string, status: Task['status']) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status } : t));
  };

  // Bulk actions (ListView)
  const handleUpdateBulkStatus = (taskIds: string[], status: Task['status']) => {
    setTasks(prev => prev.map(t => taskIds.includes(t.id) ? { ...t, status } : t));
  };

  const handleDeleteBulkTasks = (taskIds: string[]) => {
    setTasks(prev => prev.filter(t => !taskIds.includes(t.id)));
  };

  // User Actions (Admin Panel)
  const handleSaveUser = (savedUser: User) => {
    setUsers(prev => {
      const exists = prev.some(u => u.id === savedUser.id);
      if (exists) {
        return prev.map(u => u.id === savedUser.id ? savedUser : u);
      } else {
        return [...prev, savedUser];
      }
    });
  };

  const handleDeleteUser = (userId: string) => {
    // 1. Delete user from team list
    setUsers(prev => prev.filter(u => u.id !== userId));
    // 2. Remove user from all task assignments
    setTasks(prev => prev.map(t => ({
      ...t,
      assignees: t.assignees.filter(id => id !== userId)
    })));
  };

  // Ticket Actions
  const handleCreateTicket = (ticketData: Omit<Ticket, 'id' | 'createdAt' | 'status'>) => {
    const maxId = tickets.reduce((max, t) => {
      const num = parseInt(t.id.replace('t-', ''), 10);
      return isNaN(num) ? max : Math.max(max, num);
    }, 900);
    const newId = `t-${maxId + 1}`;
    const newTicket: Ticket = {
      ...ticketData,
      id: newId,
      status: 'open',
      createdAt: new Date().toISOString()
    };
    setTickets(prev => [newTicket, ...prev]);
  };

  const handleUpdateTicketStatus = (ticketId: string, status: Ticket['status']) => {
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status } : t));
  };

  const handleConvertTicketToTask = (ticketId: string, workspaceId: string, assigneeId: string, dueDate: string) => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return;

    const maxTaskId = tasks.reduce((max, t) => {
      const num = parseInt(t.id.replace('task-', ''), 10);
      return isNaN(num) ? max : Math.max(max, num);
    }, 302);
    const newTaskId = `task-${maxTaskId + 1}`;

    const newTask: Task = {
      id: newTaskId,
      workspaceId,
      title: `Ticket #${ticket.id}: ${ticket.title}`,
      description: `Ticket-Beschreibung:\n${ticket.description}\n\nGemeldet von: ${ticket.reporter}`,
      status: 'planning',
      priority: ticket.priority,
      assignees: [assigneeId],
      startDate: new Date().toISOString().split('T')[0],
      dueDate: dueDate,
      checklist: [],
      comments: [],
      address: `Support-Ticket #${ticket.id}`,
      attachments: []
    };

    setTasks(prev => [...prev, newTask]);
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: 'resolved' } : t));
  };

  // View Renderer
  const renderActiveView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <DashboardView 
            tasks={workspaceTasks} 
            users={users}
            onSelectTask={handleOpenTask} 
            setCurrentView={setCurrentView}
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
            tasks={tasks} // personal inbox includes tasks across ALL workspaces!
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
            workspaces={mockWorkspaces}
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
        setCurrentView={setCurrentView}
        workspaces={mockWorkspaces}
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
          // Default fields when creating new task
          {...(modalDefaultStatus ? { status: modalDefaultStatus } : {})}
          {...(() => {
            // Apply default status and date in the mock structure
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
