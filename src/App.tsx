import React, { useState, useEffect } from 'react';
import { getDB, saveDB } from './db';
import { User, Announcement, Event, ChatMessage, DiscussionThread, Task, ResourceFile, TaskSubmission } from './types';

// Visual Sub-components
import LoginScreen from './components/LoginScreen';
import DashboardView from './components/DashboardView';
import MemberManagementView from './components/MemberManagementView';
import EventManagementView from './components/EventManagementView';
import NoticesView from './components/NoticesView';
import CommunicationView from './components/CommunicationView';
import TaskView from './components/TaskView';
import ResourceView from './components/ResourceView';
import AnalyticsView from './components/AnalyticsView';
import ProfileView from './components/ProfileView';
// @ts-ignore
import logoImg from './assets/images/bgi_bravian_logo_1779297925597.png';

// Iconography
import {
  LayoutDashboard,
  Users,
  Calendar,
  Megaphone,
  MessageSquare,
  CheckSquare,
  HardDrive,
  TrendingUp,
  LogOut,
  Layers,
  Menu,
  X,
  UserCheck,
  ShieldCheck,
  AlertTriangle,
  User as UserIcon
} from 'lucide-react';

export default function App() {
  // Authentication session states
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Core reactive database states
  const [users, setUsers] = useState<User[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [chats, setChats] = useState<ChatMessage[]>([]);
  const [discussions, setDiscussions] = useState<DiscussionThread[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [resources, setResources] = useState<ResourceFile[]>([]);

  // Navigation state
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Populate data on mount
  useEffect(() => {
    const db = getDB();
    setUsers(db.users);
    setAnnouncements(db.announcements);
    setEvents(db.events);
    setChats(db.chats);
    setDiscussions(db.discussions);
    setTasks(db.tasks);
    setResources(db.resources);
  }, []);

  const handleLoginSuccess = (userSession: User) => {
    setCurrentUser(userSession);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  // State sync and save helpers
  const syncUsers = (newUsersList: User[]) => {
    setUsers(newUsersList);
    saveDB({ users: newUsersList });
  };

  const syncAnnouncements = (newAnnouncementsList: Announcement[]) => {
    setAnnouncements(newAnnouncementsList);
    saveDB({ announcements: newAnnouncementsList });
  };

  const syncEvents = (newEventsList: Event[]) => {
    setEvents(newEventsList);
    saveDB({ events: newEventsList });
  };

  const syncChats = (newChatsList: ChatMessage[]) => {
    setChats(newChatsList);
    saveDB({ chats: newChatsList });
  };

  const syncDiscussions = (newDiscussionsList: DiscussionThread[]) => {
    setDiscussions(newDiscussionsList);
    saveDB({ discussions: newDiscussionsList });
  };

  const syncTasks = (newTasksList: Task[]) => {
    setTasks(newTasksList);
    saveDB({ tasks: newTasksList });
  };

  const syncResources = (newResourcesList: ResourceFile[]) => {
    setResources(newResourcesList);
    saveDB({ resources: newResourcesList });
  };

  // Directory callbacks
  const handleAddMember = (item: User) => {
    const updated = [item, ...users];
    syncUsers(updated);
  };

  const handleUpdateStatus = (id: string, status: 'Active' | 'Inactive' | 'Pending') => {
    const updated = users.map(u => u.id === id ? { ...u, status } : u);
    syncUsers(updated);
  };

  const handleUpdateRole = (id: string, role: User['role']) => {
    const updated = users.map(u => u.id === id ? { ...u, role } : u);
    syncUsers(updated);
  };

  const handleUpdateMemberDetails = (id: string, updatedFields: Partial<User>) => {
    const updated = users.map(u => u.id === id ? { ...u, ...updatedFields } : u);
    syncUsers(updated);
    if (currentUser && currentUser.id === id) {
      setCurrentUser(prev => prev ? { ...prev, ...updatedFields } : null);
    }
  };

  const handleDeleteMember = (id: string) => {
    const updated = users.filter(u => u.id !== id);
    syncUsers(updated);
  };

  // notices callbacks
  const handleAddNotice = (item: Announcement) => {
    const updated = [item, ...announcements];
    syncAnnouncements(updated);
  };

  const handleDeleteNotice = (id: string) => {
    const updated = announcements.filter(a => a.id !== id);
    syncAnnouncements(updated);
  };

  // events callbacks
  const handleAddEvent = (item: Event) => {
    const updated = [item, ...events];
    syncEvents(updated);
  };

  const handleRegisterEvent = (eventId: string, userId: string) => {
    const updated = events.map(evt => {
      if (evt.id === eventId) {
        const isRegistered = evt.registeredUsers.includes(userId);
        const registeredUsers = isRegistered
          ? evt.registeredUsers.filter(uid => uid !== userId)
          : [...evt.registeredUsers, userId];
        return { ...evt, registeredUsers };
      }
      return evt;
    });
    syncEvents(updated);
  };

  const handleToggleAttendance = (eventId: string, userId: string) => {
    const updated = events.map(evt => {
      if (evt.id === eventId) {
        const hasAttended = evt.attendance.includes(userId);
        const attendance = hasAttended
          ? evt.attendance.filter(uid => uid !== userId)
          : [...evt.attendance, userId];
        return { ...evt, attendance };
      }
      return evt;
    });
    syncEvents(updated);
  };

  // chat & communication callbacks
  const handleSendChatMessage = (item: ChatMessage) => {
    const updated = [...chats, item];
    syncChats(updated);
  };

  const handleAddDiscussion = (item: DiscussionThread) => {
    const updated = [item, ...discussions];
    syncDiscussions(updated);
  };

  const handleAddForumComment = (discId: string, commentItem: any) => {
    const updated = discussions.map(disc => {
      if (disc.id === discId) {
        const comments = [...(disc.comments || []), commentItem];
        return { ...disc, comments, commentsCount: comments.length };
      }
      return disc;
    });
    syncDiscussions(updated);
  };

  // tasks callbacks
  const handleAddTask = (item: Task) => {
    const updated = [item, ...tasks];
    syncTasks(updated);
  };

  const handleUpdateTaskStatus = (id: string, newStatus: Task['status']) => {
    const updated = tasks.map(t => t.id === id ? { ...t, status: newStatus } : t);
    syncTasks(updated);
  };

  const handleUpdateTaskProgress = (id: string, progress: number) => {
    const updated = tasks.map(t => t.id === id ? { ...t, progress } : t);
    syncTasks(updated);
  };

  const handleAddTaskSubmission = (taskId: string, submission: TaskSubmission) => {
    const updated = tasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          submissions: t.submissions ? [...t.submissions, submission] : [submission]
        };
      }
      return t;
    });
    syncTasks(updated);
  };

  const handleRemoveTaskSubmission = (taskId: string, submissionId: string) => {
    const updated = tasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          submissions: t.submissions ? t.submissions.filter(s => s.id !== submissionId) : []
        };
      }
      return t;
    });
    syncTasks(updated);
  };

  // resources callbacks
  const handleAddResource = (item: ResourceFile) => {
    const updated = [item, ...resources];
    syncResources(updated);
  };

  const handleDeleteResource = (id: string) => {
    const updated = resources.filter(r => r.id !== id);
    syncResources(updated);
  };

  // Navigation mapping options
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'profile', label: 'My Smart ID', icon: UserIcon },
    { id: 'members', label: 'Members Directory', icon: Users },
    { id: 'events', label: 'Scheduled Activities', icon: Calendar },
    { id: 'notices', label: 'Notice Boards', icon: Megaphone },
    { id: 'messages', label: 'Communications', icon: MessageSquare },
    { id: 'tasks', label: 'Team Checklists', icon: CheckSquare },
    { id: 'resources', label: 'Shared Drive', icon: HardDrive },
    { id: 'analytics', label: 'Reports & Export', icon: TrendingUp },
  ];

  const handleNavigateDirectly = (tab: string) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  // Render proper sub-views based on selections
  const renderActiveView = () => {
    if (!currentUser) return null;

    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView
            users={users}
            announcements={announcements}
            events={events}
            currentUser={currentUser}
            onNavigate={handleNavigateDirectly}
          />
        );
      case 'profile':
        return (
          <ProfileView
            currentUser={currentUser}
            onUpdateMemberDetails={handleUpdateMemberDetails}
          />
        );
      case 'members':
        return (
          <MemberManagementView
            users={users}
            currentUser={currentUser}
            onAddMember={handleAddMember}
            onUpdateStatus={handleUpdateStatus}
            onUpdateRole={handleUpdateRole}
            onUpdateMemberDetails={handleUpdateMemberDetails}
            onDeleteMember={handleDeleteMember}
          />
        );
      case 'events':
        return (
          <EventManagementView
            events={events}
            currentUser={currentUser}
            onAddEvent={handleAddEvent}
            onRegisterEvent={handleRegisterEvent}
            onToggleAttendance={handleToggleAttendance}
            allUsers={users}
          />
        );
      case 'notices':
        return (
          <NoticesView
            announcements={announcements}
            currentUser={currentUser}
            onAddNotice={handleAddNotice}
            onDeleteNotice={handleDeleteNotice}
          />
        );
      case 'messages':
        return (
          <CommunicationView
            chats={chats}
            discussions={discussions}
            currentUser={currentUser}
            onSendChatMessage={handleSendChatMessage}
            onAddDiscussion={handleAddDiscussion}
            onAddForumComment={handleAddForumComment}
          />
        );
      case 'tasks':
        return (
          <TaskView
            tasks={tasks}
            currentUser={currentUser}
            onAddTask={handleAddTask}
            onUpdateTaskStatus={handleUpdateTaskStatus}
            onUpdateTaskProgress={handleUpdateTaskProgress}
            onAddSubmission={handleAddTaskSubmission}
            onRemoveSubmission={handleRemoveTaskSubmission}
          />
        );
      case 'resources':
        return (
          <ResourceView
            resources={resources}
            currentUser={currentUser}
            onAddResource={handleAddResource}
            onDeleteResource={handleDeleteResource}
          />
        );
      case 'analytics':
        return (
          <AnalyticsView
            users={users}
            events={events}
          />
        );
      default:
        return <div className="text-white">Under Active Development.</div>;
    }
  };

  // Render Login page if session is vacant
  if (!currentUser) {
    return (
      <LoginScreen
        onLoginSuccess={handleLoginSuccess}
        allUsers={getDB().users}
        onRegisterUser={(item) => {
          handleAddMember(item);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none print:bg-white print:text-black">
      {/* Top Identity Info Bar */}
      <header className="bg-slate-900 border-b border-slate-850 sticky top-0 z-40 px-4 py-3 flex items-center justify-between shadow-md print:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden text-slate-400 hover:text-white p-1"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <img
              src={logoImg}
              alt="BGI Logo"
              referrerPolicy="no-referrer"
              className="w-8 h-8 rounded-full border border-amber-500/35 object-cover shadow bg-slate-950"
            />
            <span className="font-display font-black text-white text-base tracking-tight">BGI Console</span>
          </div>
        </div>

        {/* Current logged session badge details */}
        <div className="flex items-center gap-3">
          <div 
            onClick={() => handleNavigateDirectly('profile')}
            className="hidden sm:flex flex-col items-end text-right font-mono text-[10px] cursor-pointer hover:opacity-85 group"
            title="View My Smart ID Profile"
          >
            <span className="text-white font-sans font-bold text-xs group-hover:text-cyan-400 transition-colors">{currentUser.name}</span>
            <span className="text-emerald-400 font-semibold">{currentUser.role} Control</span>
          </div>

          <img
            src={currentUser.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(currentUser.name)}`}
            alt=""
            referrerPolicy="no-referrer"
            onClick={() => handleNavigateDirectly('profile')}
            className="w-8 h-8 rounded-lg border border-slate-700 object-cover shrink-0 cursor-pointer hover:border-cyan-500 hover:scale-105 transition-all"
            title="View My Smart ID Profile"
          />

          <button
            onClick={handleLogout}
            className="p-1.5 hover:bg-slate-800 rounded bg-slate-950 border border-slate-850 hover:border-slate-705 text-slate-400 hover:text-red-400 transition-colors"
            title="Settle out session logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex max-w-8xl mx-auto w-full relative overflow-hidden">
        
        {/* Persistent Side Navigation Drawer - Desktop mode view */}
        <aside className="w-64 border-r border-slate-850 p-4 space-y-5 hidden md:block shrink-0 print:hidden bg-[#0F0F10]">
          <div className="space-y-1.5 pt-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500 px-3">Primary Wings</span>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isSelected = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigateDirectly(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold rounded-lg transition-colors font-sans ${
                    isSelected
                      ? 'bg-blue-600/10 text-blue-400 border border-blue-550 border-blue-500/20'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-400' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="p-3 bg-slate-900/60 border border-slate-850 rounded-xl space-y-1.5 font-mono text-[10px] text-zinc-500">
            <p>● Live Portal status ok</p>
            <p className="text-[9px] text-blue-400 font-black">UTC 2026-05-20T15:39:43Z</p>
          </div>
        </aside>

        {/* Collapsible Mobile Side menu overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 md:hidden flex justify-start">
            <div className="w-64 bg-slate-900 h-full p-4 border-r border-slate-800 space-y-5">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <span className="font-display font-black text-white text-md">BGI Divisions</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-slate-400 p-1 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavigateDirectly(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-bold rounded-lg text-left ${
                        activeTab === item.id ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* View Frame scroller Column */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 print:p-0">
          <div className="max-w-6xl mx-auto py-2">
            {renderActiveView()}
          </div>
        </main>
      </div>
    </div>
  );
}
