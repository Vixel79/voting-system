import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState } from
'react';
import {
  AudienceVote,
  DisplayControl,
  DisplayMode,
  EventSettings,
  EventState,
  Judge,
  Team,
  TeamResult } from
'../types/event';
import {
  DEFAULT_SETTINGS,
  INITIAL_JUDGES,
  TEAMS,
  seedVotes } from
'../data/event';


const API_URL = 'https://museum-voting-backend-production.up.railway.app';

const ADMIN_HEADERS = {
  'Content-Type': 'application/json',
  'x-api-key': 'b89b6cbaad27a50cb476a9970d022d1e6024897d49b2d0629853cd22c1cac8c0',
  'x-admin-key': 'b89b6cbaad27a50cb476a9970d022d1e6024897d49b2d0629853cd22c1cac8c0',
  'Authorization': 'Bearer b89b6cbaad27a50cb476a9970d022d1e6024897d49b2d0629853cd22c1cac8c0'
};

interface EventContextValue {
  teams: Team[];
  settings: EventSettings;
  updateSettings: (patch: Partial<EventSettings>) => void;
  state: EventState;
  setState: (s: EventState) => void;
  timer: number;
  running: boolean;
  votes: AudienceVote[];
  judges: Judge[];
  display: DisplayControl;
  results: TeamResult[];
  isRevealed: boolean;
  lastMover: string | null;
  hasVoted: boolean;
  myBallot: string[] | null;
  simulate: boolean;
  setSimulate: (v: boolean) => void;
  // actions
  startVoting: () => void;
  pauseVoting: () => void;
  stopVoting: () => void;
  resetTimer: () => void;
  resetVoting: () => void;
  castVote: (ranking: string[], voterName?: string) => void;
  deleteVote: (id: string) => void;
  castJudgeVote: (name: string, ranking: string[]) => Promise<boolean>;
  deleteJudgeVote: (id: string) => void;
  setDisplayMode: (mode: DisplayMode) => void;
  setDisplayPower: (on: boolean) => void;
  publishWinner: () => void;
  finishEvent: () => void;
  updateTeam: (id: string, patch: Partial<Team>) => void;
}

const EventContext = createContext<EventContextValue | null>(null);

export function EventProvider({ children }: {children: React.ReactNode;}) {
  const [settings, setSettings] = useState<EventSettings>(DEFAULT_SETTINGS);
  const [teams, setTeams] = useState<Team[]>([]);
  const [state, setState] = useState<EventState>('not_started');
  const [timer, setTimer] = useState(DEFAULT_SETTINGS.votingDuration);
  const [running, setRunning] = useState(false);
  const [votes, setVotes] = useState<AudienceVote[]>([]);
  const [judges, setJudges] = useState<Judge[]>([]);
  const [display, setDisplay] = useState<DisplayControl>({
    power: true,
    mode: 'branding'
  });
  const [results, setResults] = useState<TeamResult[]>([]);
  const [isRevealed, setIsRevealed] = useState(false);
  const [hasVoted, setHasVoted] = useState(() => {
    return typeof localStorage !== 'undefined' ? localStorage.getItem('has_voted') === 'true' : false;
  });
  const [myBallot, setMyBallot] = useState<string[] | null>(() => {
    return typeof localStorage !== 'undefined' ? JSON.parse(localStorage.getItem('my_ballot') || 'null') : null;
  });
  const [simulate, setSimulate] = useState(true);
  const [lastMover, setLastMover] = useState<string | null>(null);
  const prevOrder = useRef<string>('');
  const isTimerMaster = useRef<boolean>(false);

  // API Integration: Fetch Teams
  useEffect(() => {
    fetch(`${API_URL}/api/teams`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.candidates) {
          const mapped = data.candidates.map((c: any, index: number) => ({
            id: c.id,
            name: c.name,
            photo: c.photo,
            code: `0${index + 1}`,
            monogram: c.name.charAt(0).toUpperCase(),
            tagline: ''
          }));
          setTeams(mapped);
        }
      })
      .catch(err => console.error("Failed to fetch teams", err));
  }, []);

  // API Integration: Polling State
  useEffect(() => {
    const fetchState = () => {
      fetch(`${API_URL}/api/state`)
        .then(res => res.json())
        .then(data => {
           if (data.success) {
             const s = data.state;
             if (s === 'upcoming') setState('not_started');
             else if (s === 'open') setState('voting_live');
             else if (s === 'closed') setState('voting_closed');
             else if (s === 'finalized') setState('winner_published');
           }
        })
        .catch(err => console.error("Failed to fetch state", err));
    };
    fetchState();
    const id = setInterval(fetchState, 3000);
    return () => clearInterval(id);
  }, []);

  // API Integration: Polling Results
  useEffect(() => {
    const fetchResults = () => {
      fetch(`${API_URL}/api/results/live`)
        .then(res => res.json())
        .then(data => {
           if (data.success && data.teams) {
             const mappedResults: TeamResult[] = data.teams.map((t: any) => {
               const localTeam = teams.find(x => x.id === t.id) || {
                 id: t.id,
                 name: t.name,
                 photo: t.photo,
                 code: '00',
                 monogram: t.name.charAt(0).toUpperCase(),
                 tagline: ''
               };
               return {
                 team: localTeam as Team,
                 votes: t.audiencePoints || 0,
                 firsts: t.firstPlaceCount || 0,
                 points: t.finalPoints || 0,
                 audiencePct: t.audiencePoints || 0,
                 judgeAvg: t.judgePoints || 0,
                 judgesPct: t.judgePoints || 0,
                 finalPct: t.finalPoints || 0,
                 rank: t.rank || 0
               };
             });
             setResults(mappedResults);
             if (typeof data.revealed === 'boolean') {
               setIsRevealed(data.revealed);
             }
           }
        })
        .catch(err => console.error("Failed to fetch results", err));
    };
    if (teams.length > 0) {
      fetchResults();
      const id = setInterval(fetchResults, 3000);
      return () => clearInterval(id);
    }
  }, [teams]);

  // Auto-derive Display Mode from Backend State (and broadcast it if changed)
  useEffect(() => {
    let newMode: DisplayMode | null = null;
    if (isRevealed || state === 'winner_published' || state === 'finished') {
      newMode = 'winner';
    } else if (state === 'not_started') {
      newMode = 'branding';
    } else if (state === 'voting_live' || state === 'ending_soon') {
      newMode = 'combined';
    } else if (state === 'voting_closed') {
      newMode = 'final_ready';
    }
    
    if (newMode) {
      setDisplay((d) => {
        if (d.mode === newMode) return d;
        const newDisplay = { ...d, mode: newMode };
        new BroadcastChannel('display_sync').postMessage({ type: 'SYNC_DISPLAY', payload: newDisplay });
        // Also post to opened window if it exists (Cross-origin support)
        if (typeof window !== 'undefined' && (window as any).__DISPLAY_WINDOW__) {
          (window as any).__DISPLAY_WINDOW__.postMessage({ type: 'SYNC_DISPLAY', payload: newDisplay }, '*');
        }
        return newDisplay;
      });
    }
  }, [state, isRevealed]);

  // Listen for BroadcastChannel and postMessage sync events
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'SYNC_DISPLAY') {
        setDisplay(event.data.payload);
      }
      if (event.data?.type === 'SYNC_TIMER') {
        setTimer(event.data.payload.timer);
        setRunning(event.data.payload.running);
      }
    };
    
    const channel = new BroadcastChannel('display_sync');
    channel.onmessage = handleMessage;
    window.addEventListener('message', handleMessage);
    
    return () => {
      channel.close();
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  // Broadcast timer updates
  useEffect(() => {
    if (!isTimerMaster.current) return;
    const payload = { timer, running };
    new BroadcastChannel('display_sync').postMessage({ type: 'SYNC_TIMER', payload });
    if (typeof window !== 'undefined' && (window as any).__DISPLAY_WINDOW__) {
      (window as any).__DISPLAY_WINDOW__.postMessage({ type: 'SYNC_TIMER', payload }, '*');
    }
  }, [timer, running]);

  /* countdown */
  useEffect(() => {
    if (!running || !isTimerMaster.current) return;
    const id = window.setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          setRunning(false);
          setState('voting_closed');
          // Auto-close backend voting when timer hits 0
          fetch(`${API_URL}/api/admin/voting/close`, { method: 'POST', headers: ADMIN_HEADERS }).catch(console.error);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (state === 'voting_live' && running && timer > 0 && timer <= 15)
    setState('ending_soon');
  }, [timer, running, state]);





  /* detect rank movement for broadcast highlight */
  useEffect(() => {
    const order = results.map((r) => r.team.id).join('');
    if (prevOrder.current && prevOrder.current !== order) {
      const moved = results.find(
        (r, i) => prevOrder.current[i] !== undefined && prevOrder.current[i] !== order[i]
      );
      if (moved) {
        setLastMover(moved.team.id);
        window.setTimeout(() => setLastMover(null), 2200);
      }
    }
    prevOrder.current = order;
  }, [results]);

  const startVoting = useCallback(() => {
    isTimerMaster.current = true;
    fetch(`${API_URL}/api/admin/voting/open`, { method: 'POST', headers: ADMIN_HEADERS }).catch(console.error);
    setState('voting_live');
    setRunning(true);
    setTimer((t) => t <= 0 ? settings.votingDuration : t);
  }, [settings.votingDuration]);

  const pauseVoting = useCallback(() => {
    isTimerMaster.current = true;
    fetch(`${API_URL}/api/admin/voting/close`, { method: 'POST', headers: ADMIN_HEADERS }).catch(console.error);
    setRunning(false);
  }, []);

  const stopVoting = useCallback(() => {
    isTimerMaster.current = true;
    fetch(`${API_URL}/api/admin/voting/close`, { method: 'POST', headers: ADMIN_HEADERS }).catch(console.error);
    setRunning(false);
    setState('voting_closed');
  }, []);

  const resetTimer = useCallback(() => {
    isTimerMaster.current = true;
    setTimer(settings.votingDuration);
  }, [settings.votingDuration]);

  const resetVoting = useCallback(() => {
    isTimerMaster.current = true;
    setVotes([]);
    setTimer(settings.votingDuration);
    setRunning(false);
    setState('not_started');
    setHasVoted(false);
    setMyBallot(null);
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('has_voted');
      localStorage.removeItem('my_ballot');
    }
  }, [settings.votingDuration]);

  const castVote = useCallback((ranking: string[], voterName?: string) => {
    fetch(`${API_URL}/api/votes/audience`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ranking })
    }).then(res => {
      if (res.ok) {
        setHasVoted(true);
        setMyBallot(ranking);
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('has_voted', 'true');
          localStorage.setItem('my_ballot', JSON.stringify(ranking));
        }
      } else {
        console.error("Failed to submit vote");
      }
    }).catch(console.error);
  }, []);

  const deleteVote = useCallback(
    (id: string) => setVotes((v) => v.filter((x) => x.id !== id)),
    []
  );

  const castJudgeVote = useCallback((name: string, ranking: string[]) => {
    // Generate a persistent Judge ID for this device
    let judgeId = '';
    if (typeof localStorage !== 'undefined') {
      judgeId = localStorage.getItem('judge_id') || '';
      if (!judgeId) {
        judgeId = `J-${Math.floor(2000 + Math.random() * 7999)}`;
        localStorage.setItem('judge_id', judgeId);
      }
    } else {
      judgeId = `J-${Math.floor(2000 + Math.random() * 7999)}`;
    }

    return fetch(`${API_URL}/api/judge-votes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        judgeId, 
        ranking, 
        judgeToken: '2a5e859edaddc3bd9ee0f7d94c2c246ab252c4c532d9259d3117336af42aa402' 
      })
    }).then(res => {
      if (res.ok) {
        setHasVoted(true);
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('has_voted', 'true');
        }
        setJudges((js) => [
          {
            id: judgeId,
            label: `Judge ${js.length + 1}`,
            name,
            ranking,
            submitted: true,
            submittedAt: Date.now()
          },
          ...js
        ]);
        return true;
      } else {
        console.error("Failed to submit judge vote");
        return false;
      }
    }).catch(err => {
      console.error(err);
      return false;
    });
  }, []);

  const deleteJudgeVote = useCallback(
    (id: string) => setJudges((js) => js.filter((x) => x.id !== id)),
    []
  );

  const setDisplayMode = useCallback((mode: DisplayMode) => {
    setDisplay((d) => {
      const newDisplay = { ...d, mode };
      new BroadcastChannel('display_sync').postMessage({ type: 'SYNC_DISPLAY', payload: newDisplay });
      if (typeof window !== 'undefined' && (window as any).__DISPLAY_WINDOW__) {
        (window as any).__DISPLAY_WINDOW__.postMessage({ type: 'SYNC_DISPLAY', payload: newDisplay }, '*');
      }
      return newDisplay;
    });
  }, []);

  const setDisplayPower = useCallback(
    (on: boolean) => {
      setDisplay((d) => {
        const newDisplay = { ...d, power: on };
        new BroadcastChannel('display_sync').postMessage({ type: 'SYNC_DISPLAY', payload: newDisplay });
        if (typeof window !== 'undefined' && (window as any).__DISPLAY_WINDOW__) {
          (window as any).__DISPLAY_WINDOW__.postMessage({ type: 'SYNC_DISPLAY', payload: newDisplay }, '*');
        }
        return newDisplay;
      });
    },
    []
  );

  const publishWinner = useCallback(() => {
    fetch(`${API_URL}/api/admin/results/reveal`, { 
      method: 'POST', 
      headers: ADMIN_HEADERS,
      body: JSON.stringify({ acknowledgeTies: true })
    }).catch(console.error);
    setRunning(false);
    setState('winner_published');
  }, []);

  const finishEvent = useCallback(() => {
    setState('finished');
  }, []);

  const updateSettings = useCallback(
    (patch: Partial<EventSettings>) => setSettings((s) => ({ ...s, ...patch })),
    []
  );

  const updateTeam = useCallback(
    (id: string, patch: Partial<Team>) =>
    setTeams((ts) => ts.map((t) => t.id === id ? { ...t, ...patch } : t)),
    []
  );

  const value: EventContextValue = {
    teams,
    settings,
    updateSettings,
    state,
    setState,
    timer,
    running,
    votes,
    judges,
    display,
    results,
    isRevealed,
    lastMover,
    hasVoted,
    myBallot,
    simulate,
    setSimulate,
    startVoting,
    pauseVoting,
    stopVoting,
    resetTimer,
    resetVoting,
    castVote,
    deleteVote,
    castJudgeVote,
    deleteJudgeVote,
    setDisplayMode,
    setDisplayPower,
    publishWinner,
    finishEvent,
    updateTeam
  };

  return <EventContext.Provider value={value}>{children}</EventContext.Provider>;
}

export function useEvent(): EventContextValue {
  const ctx = useContext(EventContext);
  if (!ctx) throw new Error('useEvent must be used inside EventProvider');
  return ctx;
}