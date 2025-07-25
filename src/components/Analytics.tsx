import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Clock, Target, Zap, TrendingUp, Calendar, Award } from 'lucide-react';

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

interface AnalyticsProps {
  sessions?: Session[];
  tasks?: Task[];
}

const tagColors = {
  debug: '#ef4444',
  write: '#6b7280',
  code: '#8b5cf6',
  learn: '#f59e0b',
  plan: '#10b981'
};

export const Analytics = ({ sessions = [], tasks = [] }: AnalyticsProps) => {
  const [analyticsData, setAnalyticsData] = useState({
    totalFocusTime: 0,
    sessionsToday: 0,
    tasksCompleted: 0,
    streak: 0
  });

  useEffect(() => {
    // Calculate analytics from localStorage
    const savedSessions = localStorage.getItem('focus-app-sessions');
    const savedTasks = localStorage.getItem('focus-app-tasks');
    
    const allSessions: Session[] = savedSessions ? JSON.parse(savedSessions) : [];
    const allTasks: Task[] = savedTasks ? JSON.parse(savedTasks) : [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalFocusTime = allSessions
      .filter(s => s.type === 'focus')
      .reduce((acc, session) => acc + session.duration, 0);

    const sessionsToday = allSessions.filter(session => {
      const sessionDate = new Date(session.timestamp);
      sessionDate.setHours(0, 0, 0, 0);
      return sessionDate.getTime() === today.getTime() && session.type === 'focus';
    }).length;

    const tasksCompleted = allTasks.filter(task => task.completed).length;

    // Calculate streak (consecutive days with at least one focus session)
    let streak = 0;
    const checkDate = new Date();
    while (true) {
      checkDate.setHours(0, 0, 0, 0);
      const hasSessionOnDate = allSessions.some(session => {
        const sessionDate = new Date(session.timestamp);
        sessionDate.setHours(0, 0, 0, 0);
        return sessionDate.getTime() === checkDate.getTime() && session.type === 'focus';
      });
      
      if (hasSessionOnDate) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    setAnalyticsData({ totalFocusTime, sessionsToday, tasksCompleted, streak });
  }, []);

  // Prepare chart data
  const getWeeklyData = () => {
    const savedSessions = localStorage.getItem('focus-app-sessions');
    const allSessions: Session[] = savedSessions ? JSON.parse(savedSessions) : [];
    
    const weekData = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      const sessionsOnDay = allSessions.filter(session => {
        const sessionDate = new Date(session.timestamp);
        sessionDate.setHours(0, 0, 0, 0);
        return sessionDate.getTime() === date.getTime() && session.type === 'focus';
      });
      
      const focusMinutes = Math.round(sessionsOnDay.reduce((acc, session) => acc + session.duration, 0) / 60);
      
      weekData.push({
        day: dayName,
        minutes: focusMinutes,
        sessions: sessionsOnDay.length
      });
    }
    
    return weekData;
  };

  const getTaskTagData = () => {
    const savedTasks = localStorage.getItem('focus-app-tasks');
    const allTasks: Task[] = savedTasks ? JSON.parse(savedTasks) : [];
    
    const tagCounts = allTasks
      .filter(task => task.completed)
      .reduce((acc, task) => {
        acc[task.tag] = (acc[task.tag] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    return Object.entries(tagCounts).map(([tag, count]) => ({
      name: tag.charAt(0).toUpperCase() + tag.slice(1),
      value: count,
      color: tagColors[tag as keyof typeof tagColors]
    }));
  };

  const weeklyData = getWeeklyData();
  const taskTagData = getTaskTagData();

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{formatDuration(analyticsData.totalFocusTime)}</p>
              <p className="text-xs text-muted-foreground">Total Focus</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/10">
              <Target className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold">{analyticsData.sessionsToday}</p>
              <p className="text-xs text-muted-foreground">Today</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/10">
              <Award className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{analyticsData.tasksCompleted}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-500/10">
              <Zap className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{analyticsData.streak}</p>
              <p className="text-xs text-muted-foreground">Day Streak</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="weekly" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="weekly">Weekly Activity</TabsTrigger>
          <TabsTrigger value="tasks">Task Breakdown</TabsTrigger>
        </TabsList>

        <TabsContent value="weekly" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Focus Time This Week</h3>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="day" 
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-card border rounded-lg p-3 shadow-lg">
                          <p className="font-medium">{label}</p>
                          <p className="text-primary">
                            {payload[0].value} minutes ({payload[0].payload.sessions} sessions)
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  dataKey="minutes" 
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Completed Tasks by Category</h3>
            </div>
            {taskTagData.length > 0 ? (
              <div className="flex flex-col md:flex-row items-center gap-6">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={taskTagData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {taskTagData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-card border rounded-lg p-3 shadow-lg">
                              <p className="font-medium">{payload[0].payload.name}</p>
                              <p style={{ color: payload[0].payload.color }}>
                                {payload[0].value} tasks completed
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  {taskTagData.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm">{item.name}: {item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Complete some tasks to see the breakdown here</p>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {/* Achievements */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Award className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Recent Achievements</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {analyticsData.streak >= 7 && (
            <Badge variant="default" className="p-3 justify-start">
              🔥 Week Warrior - 7 day streak!
            </Badge>
          )}
          {analyticsData.totalFocusTime >= 3600 && (
            <Badge variant="secondary" className="p-3 justify-start">
              ⏰ Hour Hero - 1+ hours focused!
            </Badge>
          )}
          {analyticsData.tasksCompleted >= 10 && (
            <Badge variant="outline" className="p-3 justify-start">
              ✅ Task Master - 10+ tasks done!
            </Badge>
          )}
        </div>
      </Card>
    </div>
  );
};