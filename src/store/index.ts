import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  _id: string;
  name: string;
  email: string;
  businessInfo?: {
    businessName?: string;
    industry?: string;
    targetAudience?: string;
    brandVoice?: string;
    description?: string;
    goals?: string[];
    contentPreferences?: {
      topics?: string[];
      tone?: string;
      postFrequency?: string;
    };
  };
  socialAccounts?: {
    twitter: { connected: boolean; username?: string };
    linkedin: { connected: boolean; profileId?: string };
    instagram: { connected: boolean; userId?: string };
  };
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  setAuth: (user: User, token: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: async (email: string, password: string) => {
        try {
          // For demo purposes, allow demo credentials to work
          if (email === 'demo@socialflow.com' && password === 'demo123') {
            const demoUser: User = {
              _id: 'demo-user-id',
              name: 'Demo User',
              email: 'demo@socialflow.com',
              businessInfo: {
                businessName: 'Demo Business',
                industry: 'Technology',
                targetAudience: 'Small businesses and startups',
                brandVoice: 'Professional yet approachable',
                description: 'A forward-thinking technology company focused on innovation.',
                goals: ['Brand awareness', 'Lead generation', 'Thought leadership'],
                contentPreferences: {
                  topics: ['Technology trends', 'Business tips', 'Industry insights'],
                  tone: 'Professional',
                  postFrequency: 'Daily'
                }
              },
              socialAccounts: {
                twitter: { connected: true, username: '@demouser' },
                linkedin: { connected: true, profileId: 'demo-linkedin' },
                instagram: { connected: false }
              }
            };
            const demoToken = 'demo-jwt-token-12345';
            
            set({ user: demoUser, token: demoToken, isAuthenticated: true });
            localStorage.setItem('token', demoToken);
            localStorage.setItem('user', JSON.stringify(demoUser));
            return;
          }

          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          });
          
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Login failed');
          }
          
          const { user, token } = await response.json();
          set({ user, token, isAuthenticated: true });
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
        } catch (error) {
          throw error;
        }
      },
      register: async (data: { name: string; email: string; password: string }) => {
        try {
          const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          });
          
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Registration failed');
          }
          
          const { user, token } = await response.json();
          set({ user, token, isAuthenticated: true });
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
        } catch (error) {
          throw error;
        }
      },
      setAuth: (user: User, token: string) => {
        set({ user, token, isAuthenticated: true });
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
      },
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      },
      updateUser: (userData) => {
        const currentUser = get().user;
        if (currentUser) {
          const updatedUser = { ...currentUser, ...userData };
          set({ user: updatedUser });
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);

interface ChatState {
  sessionId: string | null;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
  isLoading: boolean;
  setSessionId: (sessionId: string) => void;
  addMessage: (message: { role: 'user' | 'assistant'; content: string }) => void;
  setMessages: (messages: Array<{ role: 'user' | 'assistant'; content: string; timestamp: Date }>) => void;
  setLoading: (loading: boolean) => void;
  clearChat: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  sessionId: null,
  messages: [],
  isLoading: false,
  setSessionId: (sessionId) => set({ sessionId }),
  addMessage: (message) => 
    set((state) => ({
      messages: [...state.messages, { ...message, timestamp: new Date() }]
    })),
  setMessages: (messages) => set({ messages }),
  setLoading: (loading) => set({ isLoading: loading }),
  clearChat: () => set({ sessionId: null, messages: [], isLoading: false }),
}));

interface PostsState {
  posts: any[];
  selectedPost: any | null;
  calendarData: Record<string, any[]>;
  setPosts: (posts: any[]) => void;
  addPost: (post: any) => void;
  updatePost: (postId: string, updates: any) => void;
  deletePost: (postId: string) => void;
  setSelectedPost: (post: any) => void;
  setCalendarData: (data: Record<string, any[]>) => void;
}

export const usePostsStore = create<PostsState>((set) => ({
  posts: [],
  selectedPost: null,
  calendarData: {},
  setPosts: (posts) => set({ posts }),
  addPost: (post) => set((state) => ({ posts: [post, ...state.posts] })),
  updatePost: (postId, updates) =>
    set((state) => ({
      posts: state.posts.map((post) =>
        post._id === postId ? { ...post, ...updates } : post
      ),
    })),
  deletePost: (postId) =>
    set((state) => ({
      posts: state.posts.filter((post) => post._id !== postId),
    })),
  setSelectedPost: (post) => set({ selectedPost: post }),
  setCalendarData: (calendarData) => set({ calendarData }),
}));

interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      theme: 'light',
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((state) => ({ 
        theme: state.theme === 'light' ? 'dark' : 'light' 
      })),
    }),
    {
      name: 'ui-storage',
    }
  )
);