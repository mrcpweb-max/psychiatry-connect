import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Volume2,
  VolumeX,
  Minimize2,
  Maximize2,
  X,
  Settings,
  Bell,
} from "lucide-react";

interface MeetingTimerProps {
  totalStations?: number;
}

export function MeetingTimer({ totalStations = 8 }: MeetingTimerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const [intervalMinutes, setIntervalMinutes] = useState(7);
  const [stations, setStations] = useState(totalStations);
  const [currentStation, setCurrentStation] = useState(1);
  const [secondsLeft, setSecondsLeft] = useState(7 * 60);
  const [isMuted, setIsMuted] = useState(false);
  const [isAlarming, setIsAlarming] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const alarmIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Bell alarm using Web Audio API
  const playBell = useCallback(() => {
    if (isMuted) return;
    try {
      const ctx = audioContextRef.current || new AudioContext();
      audioContextRef.current = ctx;

      // Bell strike
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(830, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(415, ctx.currentTime + 0.8);
      gain.gain.setValueAtTime(0.6, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.2);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 1.2);

      // Overtone
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(1245, ctx.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(622, ctx.currentTime + 0.6);
      gain2.gain.setValueAtTime(0.3, ctx.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
      osc2.start(ctx.currentTime);
      osc2.stop(ctx.currentTime + 0.8);
    } catch (e) {
      console.warn("Audio playback failed:", e);
    }
  }, [isMuted]);

  // Start repeating bell alarm
  const startAlarm = useCallback(() => {
    setIsAlarming(true);
    playBell();
    // Repeat bell every 2 seconds
    alarmIntervalRef.current = setInterval(() => {
      playBell();
    }, 2000);
  }, [playBell]);

  // Stop alarm
  const stopAlarm = useCallback(() => {
    setIsAlarming(false);
    if (alarmIntervalRef.current) {
      clearInterval(alarmIntervalRef.current);
      alarmIntervalRef.current = null;
    }
  }, []);

  // Timer tick
  useEffect(() => {
    if (isRunning && secondsLeft > 0) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            startAlarm();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, startAlarm]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleStart = () => {
    stopAlarm();
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    stopAlarm();
    setIsRunning(false);
    setSecondsLeft(intervalMinutes * 60);
  };

  const handleNextStation = () => {
    stopAlarm();
    if (currentStation < stations) {
      setCurrentStation((prev) => prev + 1);
    } else {
      setCurrentStation(1);
    }
    setSecondsLeft(intervalMinutes * 60);
    setIsRunning(true);
  };

  const handleFullReset = () => {
    stopAlarm();
    setIsRunning(false);
    setCurrentStation(1);
    setSecondsLeft(intervalMinutes * 60);
  };

  const handleApplySettings = () => {
    stopAlarm();
    setIsRunning(false);
    setCurrentStation(1);
    setSecondsLeft(intervalMinutes * 60);
    setShowSettings(false);
  };

  const progress = 1 - secondsLeft / (intervalMinutes * 60);
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference * (1 - progress);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAlarm();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [stopAlarm]);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-[9999] flex items-center gap-2 px-4 py-3 rounded-full shadow-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all hover:scale-105 active:scale-95"
        title="Open Station Timer"
      >
        <Timer className="h-5 w-5" />
        <span className="font-semibold text-sm">Station Timer</span>
      </button>
    );
  }

  if (isMinimized) {
    return (
      <div
        className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-4 py-3 rounded-full shadow-lg transition-all ${
          isAlarming
            ? "bg-destructive text-destructive-foreground animate-pulse"
            : "bg-card text-card-foreground border border-border"
        }`}
      >
        {isAlarming && <Bell className="h-4 w-4 animate-bounce" />}
        <span className="font-mono font-bold text-lg">{formatTime(secondsLeft)}</span>
        <span className="text-xs text-muted-foreground">
          S{currentStation}/{stations}
        </span>
        {isAlarming ? (
          <Button size="sm" variant="ghost" onClick={handleNextStation} className="h-7 px-2 gap-1">
            <SkipForward className="h-3.5 w-3.5" /> Next
          </Button>
        ) : (
          <Button
            size="sm"
            variant="ghost"
            onClick={isRunning ? handlePause : handleStart}
            className="h-7 w-7 p-0"
          >
            {isRunning ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          </Button>
        )}
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setIsMinimized(false)}
          className="h-7 w-7 p-0"
        >
          <Maximize2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    );
  }

  return (
    <div
      className={`fixed bottom-6 right-6 z-[9999] w-[320px] rounded-2xl shadow-2xl border transition-all ${
        isAlarming
          ? "border-destructive bg-card ring-2 ring-destructive/50"
          : "border-border bg-card"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Timer className="h-4 w-4 text-primary" />
          <span className="font-semibold text-sm">Station Timer</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsMuted(!isMuted)}
            className="h-7 w-7 p-0"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowSettings(!showSettings)}
            className="h-7 w-7 p-0"
            title="Settings"
          >
            <Settings className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsMinimized(true)}
            className="h-7 w-7 p-0"
          >
            <Minimize2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              stopAlarm();
              setIsOpen(false);
              setIsRunning(false);
            }}
            className="h-7 w-7 p-0"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {showSettings ? (
        /* Settings Panel */
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="interval" className="text-sm">
              Minutes per Station
            </Label>
            <Input
              id="interval"
              type="number"
              min={1}
              max={60}
              value={intervalMinutes}
              onChange={(e) => setIntervalMinutes(Math.max(1, Math.min(60, Number(e.target.value))))}
              className="h-9"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="stations" className="text-sm">
              Total Stations
            </Label>
            <Input
              id="stations"
              type="number"
              min={1}
              max={20}
              value={stations}
              onChange={(e) => setStations(Math.max(1, Math.min(20, Number(e.target.value))))}
              className="h-9"
            />
          </div>
          <Button onClick={handleApplySettings} className="w-full h-9 text-sm">
            Apply & Reset
          </Button>
        </div>
      ) : (
        /* Timer Display */
        <div className="p-5">
          {/* Station Progress */}
          <div className="flex items-center justify-center gap-1.5 mb-4">
            {Array.from({ length: stations }, (_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all ${
                  i + 1 < currentStation
                    ? "bg-primary w-4"
                    : i + 1 === currentStation
                    ? "bg-primary w-6"
                    : "bg-muted w-4"
                }`}
              />
            ))}
          </div>

          {/* Circular Timer */}
          <div className="flex flex-col items-center">
            <div className="relative w-[140px] h-[140px]">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke="hsl(var(--muted))"
                  strokeWidth="6"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke={isAlarming ? "hsl(var(--destructive))" : "hsl(var(--primary))"}
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-1000 ease-linear"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span
                  className={`font-mono text-3xl font-bold ${
                    isAlarming ? "text-destructive animate-pulse" : ""
                  }`}
                >
                  {formatTime(secondsLeft)}
                </span>
                <span className="text-xs text-muted-foreground mt-0.5">
                  Station {currentStation} of {stations}
                </span>
              </div>
            </div>
          </div>

          {/* Alarm Banner */}
          {isAlarming && (
            <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-center">
              <div className="flex items-center justify-center gap-2 text-destructive font-semibold text-sm">
                <Bell className="h-4 w-4 animate-bounce" />
                Time's Up!
                <Bell className="h-4 w-4 animate-bounce" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Click "Next Station" to proceed
              </p>
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center justify-center gap-2 mt-4">
            <Button
              size="sm"
              variant="outline"
              onClick={handleFullReset}
              className="h-9 w-9 p-0"
              title="Reset All"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleReset}
              className="h-9 px-3"
              title="Reset current station"
            >
              Reset
            </Button>
            {isAlarming ? (
              <Button
                size="sm"
                onClick={handleNextStation}
                className="h-9 px-4 gap-1.5 gradient-bg-primary border-0"
              >
                <SkipForward className="h-4 w-4" />
                Next Station
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={isRunning ? handlePause : handleStart}
                className="h-9 px-4 gap-1.5 gradient-bg-primary border-0"
              >
                {isRunning ? (
                  <>
                    <Pause className="h-4 w-4" /> Pause
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" /> {secondsLeft < intervalMinutes * 60 ? "Resume" : "Start"}
                  </>
                )}
              </Button>
            )}
            {!isAlarming && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleNextStation}
                className="h-9 w-9 p-0"
                title="Skip to next station"
              >
                <SkipForward className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Session Progress */}
          <div className="mt-4 text-center">
            <p className="text-xs text-muted-foreground">
              Total session: ~{stations * intervalMinutes} min
              {currentStation > 1 && (
                <> • Elapsed: ~{(currentStation - 1) * intervalMinutes} min</>
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
