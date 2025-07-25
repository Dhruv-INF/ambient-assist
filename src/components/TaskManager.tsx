import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X, Code, FileText, Bug, Lightbulb, Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Task {
  id: string;
  title: string;
  tag: 'debug' | 'write' | 'code' | 'learn' | 'plan';
  completed: boolean;
  createdAt: Date;
  completedAt?: Date;
}

const tagConfig = {
  debug: { icon: Bug, color: 'destructive', label: 'Debug' },
  write: { icon: FileText, color: 'secondary', label: 'Write' },
  code: { icon: Code, color: 'default', label: 'Code' },
  learn: { icon: Lightbulb, color: 'accent', label: 'Learn' },
  plan: { icon: Target, color: 'outline', label: 'Plan' }
} as const;

interface TaskManagerProps {
  onTaskComplete?: (task: Task) => void;
}

export const TaskManager = ({ onTaskComplete }: TaskManagerProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskTag, setNewTaskTag] = useState<Task['tag']>('code');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const { toast } = useToast();

  // Load tasks from localStorage
  useEffect(() => {
    const savedTasks = localStorage.getItem('focus-app-tasks');
    if (savedTasks) {
      const parsed = JSON.parse(savedTasks);
      setTasks(parsed.map((task: any) => ({
        ...task,
        createdAt: new Date(task.createdAt),
        completedAt: task.completedAt ? new Date(task.completedAt) : undefined
      })));
    }
  }, []);

  // Save tasks to localStorage
  useEffect(() => {
    localStorage.setItem('focus-app-tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    if (!newTaskTitle.trim()) return;

    const newTask: Task = {
      id: crypto.randomUUID(),
      title: newTaskTitle.trim(),
      tag: newTaskTag,
      completed: false,
      createdAt: new Date()
    };

    setTasks(prev => [newTask, ...prev]);
    setNewTaskTitle('');
    
    toast({
      title: '✅ Task added',
      description: `"${newTask.title}" added to your list`,
    });
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === id) {
        const updatedTask = {
          ...task,
          completed: !task.completed,
          completedAt: !task.completed ? new Date() : undefined
        };
        
        if (updatedTask.completed && onTaskComplete) {
          onTaskComplete(updatedTask);
        }
        
        return updatedTask;
      }
      return task;
    }));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
    toast({
      title: '🗑️ Task deleted',
      description: 'Task removed from your list',
    });
  };

  const filteredTasks = tasks.filter(task => {
    switch (filter) {
      case 'active':
        return !task.completed;
      case 'completed':
        return task.completed;
      default:
        return true;
    }
  });

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    active: tasks.filter(t => !t.completed).length
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Tasks</h2>
        <div className="flex gap-2">
          <Badge variant="outline">{stats.active} active</Badge>
          <Badge variant="secondary">{stats.completed} done</Badge>
        </div>
      </div>

      {/* Add new task */}
      <div className="space-y-4 mb-6">
        <div className="flex gap-2">
          <Input
            placeholder="Add a new task..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTask()}
            className="flex-1"
          />
          <Select value={newTaskTag} onValueChange={(value: Task['tag']) => setNewTaskTag(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(tagConfig).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center gap-2">
                    <config.icon className="h-4 w-4" />
                    {config.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={addTask} className="min-w-fit">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Filter buttons */}
        <div className="flex gap-2">
          {(['all', 'active', 'completed'] as const).map((filterType) => (
            <Button
              key={filterType}
              variant={filter === filterType ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(filterType)}
              className="capitalize"
            >
              {filterType}
            </Button>
          ))}
        </div>
      </div>

      {/* Task list */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {filter === 'all' 
              ? '🎯 No tasks yet. Add one to get started!'
              : filter === 'active'
              ? '✨ No active tasks. Great job!'
              : '📝 No completed tasks yet.'
            }
          </div>
        ) : (
          filteredTasks.map((task) => {
            const TagIcon = tagConfig[task.tag].icon;
            return (
              <div
                key={task.id}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all hover:shadow-sm ${
                  task.completed ? 'opacity-60 bg-muted/50' : 'bg-card'
                }`}
              >
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={() => toggleTask(task.id)}
                />
                
                <div className="flex-1 min-w-0">
                  <p className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={tagConfig[task.tag].color as any} className="text-xs">
                      <TagIcon className="h-3 w-3 mr-1" />
                      {tagConfig[task.tag].label}
                    </Badge>
                    {task.completedAt && (
                      <span className="text-xs text-muted-foreground">
                        Completed {task.completedAt.toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteTask(task.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            );
          })
        )}
      </div>

      {/* Keyboard shortcut info */}
      <div className="mt-4 pt-4 border-t text-xs text-muted-foreground text-center">
        Ctrl+N: New task • Enter: Add task
      </div>
    </Card>
  );
};