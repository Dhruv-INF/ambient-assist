import { useState, useEffect } from 'react';
import { Timer } from './Timer';
import { TaskManager } from './TaskManager';
import { MusicControls } from './MusicControls';
import { Analytics } from './Analytics';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckSquare, Music, BarChart3, Settings, Zap, Sun, Moon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Session {
  type: 'focus' | 'break';
  duration: number;
  timestamp: Date;
}

interface Task {
  id: string;
  title: string;
  tag: 'debug' | 'write' | 'code' | 'learn' | 'plan';
  completed: boolean;
  completedAt?: Date;
}

export const Dashboard = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [sessionType, setSessionType] = useState<'focus' | 'break'>('focus');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const { toast } = useToast();

  // Load sessions from localStorage
  useEffect(() => {
    const savedSessions = localStorage.getItem('focus-app-sessions');
    if (savedSessions) {
      setSessions(JSON.parse(savedSessions).map((s: any) => ({
        ...s,
        timestamp: new Date(s.timestamp)
      })));
    }
  }, []);

  // Save sessions to localStorage
  useEffect(() => {
    localStorage.setItem('focus-app-sessions', JSON.stringify(sessions));
  }, [sessions]);

  const handleSessionComplete = (session: Session) => {
    setSessions(prev => [...prev, session]);
    
    if (session.type === 'focus') {
      toast({
        title: '🎉 Focus session completed!',
        description: `Great work! You focused for ${Math.round(session.duration / 60)} minutes.`,
      });
    }
  };

  const handleTaskComplete = (task: Task) => {
    toast({
      title: '✅ Task completed!',
      description: `"${task.title}" marked as done. Keep it up!`,
    });
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const todaysSessions = sessions.filter(session => {
    const today = new Date();
    const sessionDate = new Date(session.timestamp);
    return (
      sessionDate.toDateString() === today.toDateString() && 
      session.type === 'focus'
    );
  });

  const todaysFocusTime = todaysSessions.reduce((acc, session) => acc + session.duration, 0);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'n':
            e.preventDefault();
            // Focus on task input - we'll implement this later
            break;
          case 't':
            e.preventDefault();
            // Switch to timer tab
            break;
          case 'm':
            e.preventDefault();
            // Switch to music tab
            break;
          case 'a':
            e.preventDefault();
            // Switch to analytics tab
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-gradient-primary">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  FocusFlow
                </h1>
                <p className="text-sm text-muted-foreground">Your productivity companion</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Today's stats */}
              <div className="hidden md:flex items-center gap-4">
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {Math.round(todaysFocusTime / 60)}m today
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <CheckSquare className="h-3 w-3" />
                  {todaysSessions.length} sessions
                </Badge>
              </div>

              <Button variant="ghost" size="sm" onClick={toggleTheme}>
                {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>

              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="focus" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="focus" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Timer</span>
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Tasks</span>
            </TabsTrigger>
            <TabsTrigger value="music" className="flex items-center gap-2">
              <Music className="h-4 w-4" />
              <span className="hidden sm:inline">Music</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="focus" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Timer onSessionComplete={handleSessionComplete} />
              </div>
              <div>
                <MusicControls 
                  sessionType={sessionType} 
                  isTimerRunning={isTimerRunning} 
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <TaskManager onTaskComplete={handleTaskComplete} />
              </div>
              <div className="space-y-4">
                <Timer onSessionComplete={handleSessionComplete} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="music" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MusicControls 
                sessionType={sessionType} 
                isTimerRunning={isTimerRunning} 
              />
              <div className="space-y-4">
                <Timer onSessionComplete={handleSessionComplete} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Analytics sessions={sessions} />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card/30 py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            Use keyboard shortcuts: Ctrl+Space (timer), Ctrl+N (new task), Ctrl+R (reset)
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Built with React, TypeScript, and Tailwind CSS
          </p>
        </div>
      </footer>
    </div>
  );
};