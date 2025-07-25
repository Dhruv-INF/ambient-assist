import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, RotateCcw, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TimerProps {
  onSessionComplete?: (session: { type: 'focus' | 'break'; duration: number; timestamp: Date }) => void;
}

export const Timer = ({ onSessionComplete }: TimerProps) => {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [sessionType, setSessionType] = useState<'focus' | 'break'>('focus');
  const [sessionCount, setSessionCount] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const { toast } = useToast();

  const focusDuration = 25 * 60; // 25 minutes
  const breakDuration = 5 * 60; // 5 minutes
  const longBreakDuration = 15 * 60; // 15 minutes

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    const totalTime = sessionType === 'focus' ? focusDuration : 
                     sessionCount > 0 && sessionCount % 4 === 0 ? longBreakDuration : breakDuration;
    return ((totalTime - timeLeft) / totalTime) * 100;
  };

  const startTimer = useCallback(() => {
    setIsRunning(true);
    if (!startTime) {
      setStartTime(new Date());
    }
  }, [startTime]);

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(sessionType === 'focus' ? focusDuration : breakDuration);
    setStartTime(null);
  };

  const switchSession = () => {
    if (sessionType === 'focus') {
      const isLongBreak = sessionCount > 0 && (sessionCount + 1) % 4 === 0;
      setSessionType('break');
      setTimeLeft(isLongBreak ? longBreakDuration : breakDuration);
      setSessionCount(prev => prev + 1);
    } else {
      setSessionType('focus');
      setTimeLeft(focusDuration);
    }
    setIsRunning(false);
    setStartTime(null);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            
            // Session completed
            if (startTime && onSessionComplete) {
              const duration = sessionType === 'focus' ? focusDuration : 
                              sessionCount > 0 && sessionCount % 4 === 0 ? longBreakDuration : breakDuration;
              onSessionComplete({
                type: sessionType,
                duration: duration - prev,
                timestamp: startTime
              });
            }

            // Show notification
            toast({
              title: sessionType === 'focus' ? '🎉 Focus session complete!' : '⏰ Break time over!',
              description: sessionType === 'focus' 
                ? 'Great work! Time for a break.' 
                : 'Back to focus mode!',
            });

            // Auto-switch session
            setTimeout(() => switchSession(), 1000);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, sessionType, sessionCount, startTime, onSessionComplete, toast]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case ' ':
            e.preventDefault();
            isRunning ? pauseTimer() : startTimer();
            break;
          case 'r':
            e.preventDefault();
            resetTimer();
            break;
          case 'b':
            e.preventDefault();
            switchSession();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isRunning, startTimer]);

  return (
    <Card className="p-8 text-center relative overflow-hidden">
      {/* Background gradient effect */}
      <div className={`absolute inset-0 opacity-20 ${
        sessionType === 'focus' 
          ? 'bg-gradient-primary' 
          : 'bg-gradient-to-r from-break to-break/70'
      }`} />
      
      <div className="relative z-10">
        <div className="flex items-center justify-center gap-4 mb-6">
          <Badge variant={sessionType === 'focus' ? 'default' : 'secondary'} className="text-sm px-4 py-2">
            {sessionType === 'focus' ? '🎯 Focus Time' : '☕ Break Time'}
          </Badge>
          {sessionCount > 0 && (
            <Badge variant="outline" className="text-sm">
              Session {sessionCount}
            </Badge>
          )}
        </div>

        <div className="mb-8">
          <div className={`text-8xl font-mono font-bold mb-4 ${
            isRunning && sessionType === 'focus' ? 'animate-pulse-glow' : ''
          }`}>
            {formatTime(timeLeft)}
          </div>
          
          {/* Progress ring */}
          <div className="relative w-32 h-32 mx-auto mb-6">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="stroke-muted"
                strokeWidth="2"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={`stroke-2 fill-none transition-all duration-300 ${
                  sessionType === 'focus' ? 'stroke-primary' : 'stroke-break'
                }`}
                strokeWidth="2"
                strokeDasharray={`${getProgress()} 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
          </div>
        </div>

        <div className="flex justify-center gap-4 mb-6">
          <Button
            size="lg"
            onClick={isRunning ? pauseTimer : startTimer}
            className="min-w-32"
            variant={sessionType === 'focus' ? 'default' : 'secondary'}
          >
            {isRunning ? <Pause className="mr-2 h-5 w-5" /> : <Play className="mr-2 h-5 w-5" />}
            {isRunning ? 'Pause' : 'Start'}
          </Button>
          
          <Button size="lg" variant="outline" onClick={resetTimer}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          
          <Button size="lg" variant="ghost" onClick={switchSession}>
            <Settings className="mr-2 h-4 w-4" />
            Switch
          </Button>
        </div>

        <div className="text-sm text-muted-foreground">
          <p>Ctrl+Space: Start/Pause • Ctrl+R: Reset • Ctrl+B: Switch</p>
        </div>
      </div>
    </Card>
  );
};