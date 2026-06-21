import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Users, Skull, Shield, Search, User, Play, ChevronRight, CheckCircle2, AlertCircle, RefreshCcw, MessageSquare, Vote, SkipForward, Ban, Sun, Moon, Home, UserPlus, Save, X, ArrowUp, ArrowDown, Shuffle } from "lucide-react";
import { NotebookSpiralBinder, RevolverProp, DaggerProp, NightParticles, MafiaPropsLeftRight, DoctorPropsLeftRight, OldManPropsLeftRight, ResultsMagazineOverlay, GlockProp, OliveTacticalKnifeProp } from "./components/DetectiveProps";
import { playClickSound, playSuccessSound, playPaperSound, playBellSound, playFailSound } from "./lib/sound";

type Role = "مافيا" | "طبيب" | "شايب" | "مواطن";
type SpecialAbility = 
  | "SHIELD" | "SPY" | "DETECTIVE_NIGHT" | "MAFIA_STUN" | "DOUBLE_VOTE" 
  | "SILENCER" | "GHOST" | "MEDIC" | "INSOMNIAC" | "LUCKY"
  | "MAFIA_DOUBLE_KILL" | "MAFIA_FIND_DOCTOR" | "MAFIA_FIND_OLD_MAN" | "MAFIA_FRAME" | "MAFIA_BLOCK";
type GameState = "SETUP" | "ROLE_SELECTION" | "NIGHT_ACTION" | "RESULTS" | "DISCUSSION" | "VOTING" | "VOTE_RESULTS" | "GAME_OVER";

interface Player {
  id: string;
  name: string;
  role: Role;
  isAlive: boolean;
  actionTargetId?: string;
  specialAbility?: SpecialAbility;
  isAbilityUsed?: boolean;
  originalRole?: Role;
  isSilenced?: boolean;
  hasExtraVote?: boolean;
  isBlocked?: boolean;
  isFramed?: boolean;
  isGhost?: boolean;
}

const ABILITY_INFO: Record<SpecialAbility, { name: string; desc: string; isMafiaOnly?: boolean }> = {
  SHIELD: { name: "الدرع الذاتي", desc: "تحمي نفسك من القتل لليلة واحدة." },
  SPY: { name: "الجاسوس", desc: "تعرف من قام الطبيب بحمايته في هذه الليلة." },
  DETECTIVE_NIGHT: { name: "المحقق المؤقت", desc: "تتحول لدور الشايب لليلة واحدة لتكشف هوية لاعب." },
  MAFIA_STUN: { name: "صاعق المافيا", desc: "تعطل قدرة المافيا على القتل لهذه الليلة." },
  DOUBLE_VOTE: { name: "الصوت المزدوج", desc: "صوتك في مرحلة التصويت القادمة سيحسب كصوتين." },
  SILENCER: { name: "المُسكت", desc: "تختار لاعباً ليصمت ولا يحق له التصويت في اليوم التالي." },
  GHOST: { name: "الشبح", desc: "إذا قتلت في هذه الليلة، ستتمكن من التصويت في اليوم التالي كشبح." },
  MEDIC: { name: "المسعف", desc: "تختار لاعباً آخر لتحميه من القتل لهذه الليلة." },
  INSOMNIAC: { name: "الأرق", desc: "ستعرف في نهاية الليل إذا استخدمت المافيا أي خاصية." },
  LUCKY: { name: "المحظوظ", desc: "لديك فرصة 50% للنجاة تلقائياً إذا حاولت المافيا قتلك." },
  MAFIA_DOUBLE_KILL: { name: "القتل المزدوج", desc: "تسمح للمافيا بقتل ضحية ثانية في هذه الليلة.", isMafiaOnly: true },
  MAFIA_FIND_DOCTOR: { name: "كاشف الطبيب", desc: "تكشف لك من هو الطبيب في هذه اللعبة فوراً.", isMafiaOnly: true },
  MAFIA_FIND_OLD_MAN: { name: "كاشف الشايب", desc: "تكشف لك من هو الشايب في هذه اللعبة فوراً.", isMafiaOnly: true },
  MAFIA_FRAME: { name: "التوريط", desc: "تجعل لاعباً بريئاً يبدو كمافيا عند كشف الشايب له.", isMafiaOnly: true },
  MAFIA_BLOCK: { name: "المعطل", desc: "تعطل دور الطبيب أو الشايب وتمنعه من أداء مهمته الليلة.", isMafiaOnly: true },
};

const getPlayerCardTheme = (id: string, name: string) => {
  const themes = [
    { bg: "from-rose-500/10 to-pink-600/5", ring: "border-pink-300", text: "text-pink-600", symbol: "🃏" },
    { bg: "from-indigo-500/10 to-purple-600/5", ring: "border-indigo-300", text: "text-indigo-600", symbol: "🔮" },
    { bg: "from-emerald-500/10 to-teal-600/5", ring: "border-emerald-300", text: "text-emerald-600", symbol: "🌿" },
    { bg: "from-amber-500/10 to-orange-600/5", ring: "border-amber-300", text: "text-amber-600", symbol: "⭐" },
    { bg: "from-blue-500/10 to-cyan-600/5", ring: "border-blue-300", text: "text-blue-600", symbol: "💎" },
    { bg: "from-violet-500/10 to-fuchsia-600/5", ring: "border-fuchsia-300", text: "text-fuchsia-600", symbol: "✨" },
    { bg: "from-lime-500/10 to-green-600/5", ring: "border-green-300", text: "text-green-600", symbol: "🍀" },
    { bg: "from-sky-500/10 to-indigo-600/5", ring: "border-sky-300", text: "text-sky-600", symbol: "🎈" }
  ];
  const str = id + name;
  const hash = str.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return themes[hash % themes.length];
};

export default function App() {
  const [gameState, setGameState] = useState<GameState>("SETUP");
  const [players, setPlayers] = useState<Player[]>([]);
  const [mafiaCount, setMafiaCount] = useState(1);
  const [newName, setNewName] = useState("");
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [showRole, setShowRole] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isSure, setIsSure] = useState(false);
  const [investigationResult, setInvestigationResult] = useState<string | null>(null);
  const [nightResults, setNightResults] = useState<string[]>([]);
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [noVoteCount, setNoVoteCount] = useState(0);
  const [mafiaTargetId, setMafiaTargetId] = useState<string | null>(null);
  const [winner, setWinner] = useState<"MAFIA" | "TOWN" | null>(null);
  const [showNightPrompt, setShowNightPrompt] = useState(false);
  const [confirmStep, setConfirmStep] = useState<0 | 1 | 2>(0);
  const [showRules, setShowRules] = useState(true);
  const [dayCount, setDayCount] = useState(0);
  const [useSpecialAbilities, setUseSpecialAbilities] = useState(false);
  const [mafiaDisabled, setMafiaDisabled] = useState(false);
  const [selfProtectedId, setSelfProtectedId] = useState<string | null>(null);
  const [abilityMessage, setAbilityMessage] = useState<string | null>(null);
  const [usedAbilitiesThisNight, setUsedAbilitiesThisNight] = useState<string[]>([]);
  const [mafiaDoubleKillTargetId, setMafiaDoubleKillTargetId] = useState<string | null>(null);
  const [selectingAbilityTarget, setSelectingAbilityTarget] = useState<boolean>(false);
  const [savedNames, setSavedNames] = useState<string[]>(() => {
    const saved = localStorage.getItem("mafia_saved_names");
    return saved ? JSON.parse(saved) : ["احمد", "نودي", "ايهاب", "براء", "مريم", "توتة"];
  });

  const [lastGameRoles, setLastGameRoles] = useState<Record<string, Role>>(() => {
    try {
      const saved = localStorage.getItem("mafia_last_game_roles");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [useManualRoles, setUseManualRoles] = useState(false);
  const [selectedMafiaIds, setSelectedMafiaIds] = useState<string[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [selectedOldManId, setSelectedOldManId] = useState<string | null>(null);
  const [roleSelectionStep, setRoleSelectionStep] = useState<"MAFIA" | "DOCTOR" | "OLD_MAN">("MAFIA");
  const [hideSelectionsInManual, setHideSelectionsInManual] = useState(false);
  const [lastNightDoctorTargetId, setLastNightDoctorTargetId] = useState<string | null>(null);
  const [lastNightSavedMafiaTargetId, setLastNightSavedMafiaTargetId] = useState<string | null>(null);
  const [shuffleNotice, setShuffleNotice] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem("mafia_saved_names", JSON.stringify(savedNames));
  }, [savedNames]);

  const isNight = gameState === "NIGHT_ACTION";
  const isMorning = ["SETUP", "ROLE_SELECTION", "RESULTS", "DISCUSSION", "VOTING", "VOTE_RESULTS"].includes(gameState);

  // Helper to find next alive player index
  const getNextAliveIndex = (startIndex: number): number => {
    for (let i = startIndex; i < players.length; i++) {
      if (players[i].isAlive) return i;
    }
    return -1;
  };

  const getNextVoterIndex = (startIndex: number): number => {
    for (let i = startIndex; i < players.length; i++) {
      const p = players[i];
      const isGhostVoter = !p.isAlive && p.isGhost;
      const canVote = (p.isAlive || isGhostVoter) && !p.isSilenced;
      if (canVote) return i;
    }
    return -1;
  };

  const addSavedName = (name: string) => {
    if (!players.find(p => p.name === name)) {
      playClickSound();
      setPlayers([...players, { 
        id: Math.random().toString(36).substr(2, 9), 
        name: name, 
        role: "مواطن", 
        isAlive: true 
      }]);
    }
  };

  const addAllPresetNames = () => {
    const defaultPresets = ["احمد", "نودي", "ايهاب", "براء", "مريم", "توتة"];
    const updatedPlayers = [...players];
    let addedAny = false;
    defaultPresets.forEach(name => {
      if (!updatedPlayers.find(p => p.name === name)) {
        addedAny = true;
        updatedPlayers.push({
          id: Math.random().toString(36).substr(2, 9),
          name: name,
          role: "مواطن",
          isAlive: true
        });
      }
    });
    if (addedAny) {
      playSuccessSound();
    }
    setPlayers(updatedPlayers);
  };

  const toggleSaveName = (name: string) => {
    playClickSound();
    if (savedNames.includes(name)) {
      setSavedNames(savedNames.filter(n => n !== name));
    } else {
      setSavedNames([...savedNames, name]);
    }
  };

  // Setup Functions
  const addPlayer = () => {
    if (newName.trim()) {
      playClickSound();
      setPlayers([...players, { 
        id: Math.random().toString(36).substr(2, 9), 
        name: newName.trim(), 
        role: "مواطن", 
        isAlive: true 
      }]);
      setNewName("");
    }
  };

  const removePlayer = (id: string) => {
    playFailSound();
    setPlayers(players.filter(p => p.id !== id));
  };

  const useAbility = (playerId: string, targetId?: string) => {
    const player = players.find(p => p.id === playerId);
    if (!player || !player.specialAbility || player.isAbilityUsed) return;

    const ability = player.specialAbility;
    let updatedPlayers = [...players];
    let msg = "";

    // Abilities that need a target but don't have one yet
    const needsTarget = ["SILENCER", "MEDIC", "MAFIA_DOUBLE_KILL", "MAFIA_FRAME", "MAFIA_BLOCK"].includes(ability);
    if (needsTarget && !targetId) {
      setSelectingAbilityTarget(true);
      return;
    }

    setSelectingAbilityTarget(false);

    switch (ability) {
      case "SHIELD":
        setSelfProtectedId(playerId);
        msg = "تم تفعيل الدرع! لن تموت الليلة.";
        break;
      case "SPY":
        const docTarget = players.find(p => p.role === "طبيب" && p.isAlive)?.actionTargetId;
        const targetName = docTarget ? players.find(p => p.id === docTarget)?.name : "لا أحد";
        msg = `الجاسوس كشف أن الطبيب حمى: ${targetName}`;
        break;
      case "DETECTIVE_NIGHT":
        updatedPlayers = updatedPlayers.map(p => 
          p.id === playerId ? { ...p, originalRole: p.role, role: "شايب" as Role } : p
        );
        msg = "تحولت لمُحقق! يمكنك الآن كشف هوية لاعب.";
        break;
      case "MAFIA_STUN":
        setMafiaDisabled(true);
        msg = "تم تعطيل المافيا! لن يتمكنوا من القتل الليلة.";
        break;
      case "DOUBLE_VOTE":
        updatedPlayers = updatedPlayers.map(p => p.id === playerId ? { ...p, hasExtraVote: true } : p);
        msg = "صوتك غداً سيحسب كصوتين!";
        break;
      case "SILENCER":
        updatedPlayers = updatedPlayers.map(p => p.id === targetId ? { ...p, isSilenced: true } : p);
        msg = `تم إسكات ${players.find(p => p.id === targetId)?.name} غداً.`;
        break;
      case "GHOST":
        updatedPlayers = updatedPlayers.map(p => p.id === playerId ? { ...p, isGhost: true } : p);
        msg = "أنت الآن شبح! إذا مت الليلة ستتمكن من التصويت غداً.";
        break;
      case "MEDIC":
        updatedPlayers = updatedPlayers.map(p => p.id === targetId ? { ...p, actionTargetId: playerId } : p); // Reuse actionTargetId or similar logic
        // Actually let's just use a state for medic target
        setSelfProtectedId(targetId!); 
        msg = `لقد قمت بحماية ${players.find(p => p.id === targetId)?.name} الليلة.`;
        break;
      case "INSOMNIAC":
        const mafiaUsed = usedAbilitiesThisNight.some(a => ABILITY_INFO[a as SpecialAbility]?.isMafiaOnly);
        msg = mafiaUsed ? "لقد لاحظت حركة مريبة للمافيا الليلة!" : "المافيا لم تستخدم أي قدرات الليلة.";
        break;
      case "LUCKY":
        msg = "أنت محظوظ! لديك فرصة للنجاة تلقائياً.";
        break;
      case "MAFIA_DOUBLE_KILL":
        setMafiaDoubleKillTargetId(targetId!);
        msg = `تم تحديد ضحية ثانية: ${players.find(p => p.id === targetId)?.name}`;
        break;
      case "MAFIA_FIND_DOCTOR":
        const doc = players.find(p => p.role === "طبيب");
        msg = doc ? `الطبيب هو: ${doc.name}` : "لا يوجد طبيب في اللعبة.";
        break;
      case "MAFIA_FIND_OLD_MAN":
        const oldMan = players.find(p => p.role === "شايب");
        msg = oldMan ? `الشايب هو: ${oldMan.name}` : "لا يوجد شايب في اللعبة.";
        break;
      case "MAFIA_FRAME":
        updatedPlayers = updatedPlayers.map(p => p.id === targetId ? { ...p, isFramed: true } : p);
        msg = `تم توريط ${players.find(p => p.id === targetId)?.name} ليبدو كمافيا.`;
        break;
      case "MAFIA_BLOCK":
        updatedPlayers = updatedPlayers.map(p => p.id === targetId ? { ...p, isBlocked: true } : p);
        msg = `تم تعطيل دور ${players.find(p => p.id === targetId)?.name} الليلة.`;
        break;
    }

    setUsedAbilitiesThisNight(prev => [...prev, ability]);
    setAbilityMessage(msg);
    setPlayers(updatedPlayers.map(p => p.id === playerId ? { ...p, isAbilityUsed: true } : p));
  };

  const movePlayerUp = (index: number) => {
    if (index === 0) return;
    const newPlayers = [...players];
    const temp = newPlayers[index];
    newPlayers[index] = newPlayers[index - 1];
    newPlayers[index - 1] = temp;
    setPlayers(newPlayers);
  };

  const movePlayerDown = (index: number) => {
    if (index === players.length - 1) return;
    const newPlayers = [...players];
    const temp = newPlayers[index];
    newPlayers[index] = newPlayers[index + 1];
    newPlayers[index + 1] = temp;
    setPlayers(newPlayers);
  };

  const fisherYatesShuffle = <T,>(array: T[]): T[] => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = arr[i];
      arr[i] = arr[j];
      arr[j] = temp;
    }
    return arr;
  };

  const shufflePlayers = () => {
    const shuffled = fisherYatesShuffle(players);
    setPlayers(shuffled);
    
    setShuffleNotice("🎲 تم خلط ترتيب الأسماء واللاعبين بسرية تامة! يمكنك الاختيار الآن.");
    setTimeout(() => {
      setShuffleNotice(null);
    }, 2500);
  };

  const generateRandomRoles = () => {
    // 1. Prepare roles pool: Special roles first, then citizen roles
    const specialRoles: Role[] = [];
    for (let i = 0; i < mafiaCount; i++) specialRoles.push("مافيا");
    specialRoles.push("طبيب");
    specialRoles.push("شايب");

    // Shuffle special roles to keep assignment random between the selected specials
    const shuffledSpecialRoles = fisherYatesShuffle([...specialRoles]);

    // 2. Classify players according to high/low priority:
    // Anyone whose previous role was a special role (Mafia, Doctor, Old Man) goes to low priority.
    // Anyone whose previous role was Citizen or not found has high priority.
    // We shuffle players first to make sure there's zero bias.
    const shuffledPlayersForSelection = fisherYatesShuffle([...players]);

    const highPriorityEligible: Player[] = [];
    const lowPriorityEligible: Player[] = [];

    shuffledPlayersForSelection.forEach(p => {
      const lastRole = lastGameRoles[p.name];
      if (lastRole && lastRole !== "مواطن") {
        lowPriorityEligible.push(p);
      } else {
        highPriorityEligible.push(p);
      }
    });

    // 3. Assign roles to players
    const finalRoleMapping = new Map<string, Role>();

    // First, assign special roles to high-priority players (who weren't special last game)
    highPriorityEligible.forEach(p => {
      if (shuffledSpecialRoles.length > 0) {
        finalRoleMapping.set(p.id, shuffledSpecialRoles.shift()!);
      } else {
        finalRoleMapping.set(p.id, "مواطن");
      }
    });

    // Next, assign remaining special roles (if any) or Citizen role to low-priority players
    lowPriorityEligible.forEach(p => {
      if (shuffledSpecialRoles.length > 0) {
        finalRoleMapping.set(p.id, shuffledSpecialRoles.shift()!);
      } else {
        finalRoleMapping.set(p.id, "مواطن");
      }
    });

    // Map the resolved roles back to the player list to maintain original array index & visual structure
    const assignedPlayers: Player[] = players.map(p => ({
      ...p,
      role: finalRoleMapping.get(p.id) || "مواطن",
      isAbilityUsed: false,
      isSilenced: false,
      hasExtraVote: false,
      isBlocked: false,
      isFramed: false
    }));

    if (useSpecialAbilities) {
      let citizenAbilities = (Object.keys(ABILITY_INFO) as SpecialAbility[]).filter(k => !ABILITY_INFO[k].isMafiaOnly);
      let mafiaAbilities = (Object.keys(ABILITY_INFO) as SpecialAbility[]).filter(k => ABILITY_INFO[k].isMafiaOnly);

      // Shuffle abilities
      citizenAbilities = fisherYatesShuffle([...citizenAbilities]);
      mafiaAbilities = fisherYatesShuffle([...mafiaAbilities]);

      let citizenIdx = 0;
      let mafiaIdx = 0;

      assignedPlayers.forEach(p => {
        if (p.role === "مافيا") {
          p.specialAbility = mafiaAbilities[mafiaIdx % mafiaAbilities.length];
          mafiaIdx++;
        } else {
          p.specialAbility = citizenAbilities[citizenIdx % citizenAbilities.length];
          citizenIdx++;
        }
      });
    }
    
    // Set a specialized fair notice toast
    setShuffleNotice("✨ جرى التوزيع الذكي المتوازن! تم تدوير الأدوار لتعطى فرصة أكبر لمن لم يلعبها مؤخراً 🎲");
    setTimeout(() => {
      setShuffleNotice(null);
    }, 4500);

    setPlayers(assignedPlayers);
    startNightPhase(assignedPlayers);
  };

  const confirmManualRoles = () => {
    if (selectedMafiaIds.length !== mafiaCount) {
      return;
    }
    if (!selectedDoctorId) {
      return;
    }
    if (!selectedOldManId) {
      return;
    }

    const assignedPlayers: Player[] = players.map(p => {
      let assignedRole: Role = "مواطن";
      if (selectedMafiaIds.includes(p.id)) {
        assignedRole = "مافيا";
      } else if (p.id === selectedDoctorId) {
        assignedRole = "طبيب";
      } else if (p.id === selectedOldManId) {
        assignedRole = "شايب";
      }

      return {
        ...p,
        role: assignedRole,
        isAbilityUsed: false,
        isSilenced: false,
        hasExtraVote: false,
        isBlocked: false,
        isFramed: false
      };
    });

    if (useSpecialAbilities) {
      let citizenAbilities = (Object.keys(ABILITY_INFO) as SpecialAbility[]).filter(k => !ABILITY_INFO[k].isMafiaOnly);
      let mafiaAbilities = (Object.keys(ABILITY_INFO) as SpecialAbility[]).filter(k => ABILITY_INFO[k].isMafiaOnly);

      // Shuffle abilities
      citizenAbilities = citizenAbilities.sort(() => Math.random() - 0.5);
      mafiaAbilities = mafiaAbilities.sort(() => Math.random() - 0.5);

      let citizenIdx = 0;
      let mafiaIdx = 0;

      assignedPlayers.forEach(p => {
        if (p.role === "مافيا") {
          p.specialAbility = mafiaAbilities[mafiaIdx % mafiaAbilities.length];
          mafiaIdx++;
        } else {
          p.specialAbility = citizenAbilities[citizenIdx % citizenAbilities.length];
          citizenIdx++;
        }
      });
    }

    setPlayers(assignedPlayers);
    startNightPhase(assignedPlayers);
  };

  const selectMafia = (id: string) => {
    if (selectedMafiaIds.includes(id)) {
      setSelectedMafiaIds(selectedMafiaIds.filter(mid => mid !== id));
    } else {
      if (selectedMafiaIds.length >= mafiaCount) {
        return;
      }
      setSelectedMafiaIds([...selectedMafiaIds, id]);
      if (selectedDoctorId === id) setSelectedDoctorId(null);
      if (selectedOldManId === id) setSelectedOldManId(null);
    }

    if (hideSelectionsInManual) {
      setTimeout(() => {
        setPlayers(prev => fisherYatesShuffle(prev));
      }, 80);
    }
  };

  const selectDoctor = (id: string) => {
    if (selectedDoctorId === id) {
      setSelectedDoctorId(null);
    } else {
      setSelectedDoctorId(id);
      setSelectedMafiaIds(selectedMafiaIds.filter(mid => mid !== id));
      if (selectedOldManId === id) setSelectedOldManId(null);
    }

    if (hideSelectionsInManual) {
      setTimeout(() => {
        setPlayers(prev => fisherYatesShuffle(prev));
      }, 80);
    }
  };

  const selectOldMan = (id: string) => {
    if (selectedOldManId === id) {
      setSelectedOldManId(null);
    } else {
      setSelectedOldManId(id);
      setSelectedMafiaIds(selectedMafiaIds.filter(mid => mid !== id));
      if (selectedDoctorId === id) setSelectedDoctorId(null);
    }

    if (hideSelectionsInManual) {
      setTimeout(() => {
        setPlayers(prev => fisherYatesShuffle(prev));
      }, 80);
    }
  };

  const startGame = () => {
    if (players.length < 4) {
      playFailSound();
      return;
    }
    
    playPaperSound();
    if (useManualRoles) {
      setGameState("ROLE_SELECTION");
      setRoleSelectionStep("MAFIA");
      setSelectedMafiaIds([]);
      setSelectedDoctorId(null);
      setSelectedOldManId(null);
    } else {
      generateRandomRoles();
    }
  };

  const checkWinCondition = (currentPlayers: Player[]) => {
    const aliveMafia = currentPlayers.filter(p => p.role === "مافيا" && p.isAlive);
    const aliveTown = currentPlayers.filter(p => p.role !== "مافيا" && p.isAlive);

    if (aliveMafia.length === 0) {
      setWinner("TOWN");
      setGameState("GAME_OVER");
      playSuccessSound();
      return true;
    }
    
    // Mafia wins if they have a strict majority
    if (aliveMafia.length > aliveTown.length) {
      setWinner("MAFIA");
      setGameState("GAME_OVER");
      playBellSound();
      return true;
    }

    // Mafia wins in 1v1 deadlock
    if (aliveMafia.length === 1 && aliveTown.length === 1) {
      setWinner("MAFIA");
      setGameState("GAME_OVER");
      playBellSound();
      return true;
    }

    return false;
  };

  const startNightPhase = (currentPlayersList?: Player[]) => {
    playBellSound();
    const activePlayers = currentPlayersList || players;

    // Save current roles for previous roles tracking in the next game
    const newHistory: Record<string, Role> = {};
    activePlayers.forEach(p => {
      newHistory[p.name] = p.role;
    });
    setLastGameRoles(newHistory);
    try {
      localStorage.setItem("mafia_last_game_roles", JSON.stringify(newHistory));
    } catch (e) {
      console.error(e);
    }

    setDayCount(prev => prev + 1);
    setGameState("NIGHT_ACTION");
    setMafiaTargetId(null);
    setAbilityMessage(null);
    const aliveMafiaCount = activePlayers.filter(p => p.role === "مافيا" && p.isAlive).length;
    setShowNightPrompt(aliveMafiaCount > 1);
    const firstAliveIndex = activePlayers.findIndex(p => p.isAlive);
    const firstAlive = firstAliveIndex !== -1 ? firstAliveIndex : 0;
    setCurrentPlayerIndex(firstAlive);
    setIsConfirmed(false);
    setIsSure(false);
  };

  // Night Action Functions
  const handleAction = (targetId: string) => {
    const updatedPlayers = [...players];
    const currentPlayer = updatedPlayers[currentPlayerIndex];
    
    if (currentPlayer.role === "طبيب" && targetId === lastNightDoctorTargetId) {
      playFailSound();
      return;
    }
    if (currentPlayer.role === "مافيا" && targetId === lastNightSavedMafiaTargetId) {
      playFailSound();
      return;
    }
    
    playClickSound();
    
    let currentPlayers = updatedPlayers;
    let currentMafiaTargetId = mafiaTargetId;

    if (currentPlayer.role === "مافيا") {
      setMafiaTargetId(targetId);
      currentMafiaTargetId = targetId;
      currentPlayers.forEach(p => {
        if (p.role === "مافيا") p.actionTargetId = targetId;
      });
    } else {
      if (!currentPlayer.isBlocked) {
        currentPlayer.actionTargetId = targetId;
      }
    }
    
    setPlayers(currentPlayers);
    
    if (currentPlayer.role === "شايب") {
      if (currentPlayer.isBlocked) {
        setInvestigationResult("تم تعطيل دورك الليلة! لم تتمكن من كشف أحد.");
      } else {
        const target = players.find(p => p.id === targetId);
        const isMafia = target?.role === "مافيا" || target?.isFramed;
        setInvestigationResult(`اللاعب ${target?.name} هو ${isMafia ? "مافيا!" : "ليس مافيا."}`);
      }
    } else {
      if (currentPlayer.isBlocked && currentPlayer.role === "طبيب") {
        setAbilityMessage("تم تعطيل دورك الليلة! لم تتمكن من حماية أحد.");
        // We don't call nextNightTurn immediately to show the message
      } else {
        nextNightTurn(currentPlayers, currentMafiaTargetId);
      }
    }
  };

  const nextNightTurn = (latestPlayers?: any, latestMafiaTargetId?: any) => {
    setInvestigationResult(null);
    setAbilityMessage(null);
    const nextIndex = getNextAliveIndex(currentPlayerIndex + 1);

    const actualPlayers = Array.isArray(latestPlayers) ? latestPlayers : undefined;
    const actualMafiaTargetId = typeof latestMafiaTargetId === "string" || latestMafiaTargetId === null ? latestMafiaTargetId : undefined;

    if (nextIndex !== -1) {
      playPaperSound();
      setCurrentPlayerIndex(nextIndex);
      setIsConfirmed(false);
      setIsSure(false);
    } else {
      playBellSound();
      processNight(actualPlayers, actualMafiaTargetId);
    }
  };

  const processNight = (latestPlayers?: Player[], latestMafiaTargetId?: string | null) => {
    const results: string[] = [];
    const activePlayersList = Array.isArray(latestPlayers) ? latestPlayers : players;
    const updatedPlayers = activePlayersList.map(p => ({ ...p }));
    
    const doctor = updatedPlayers.find(p => p.role === "طبيب" && p.isAlive);
    const doctorTarget = doctor && !doctor.isBlocked ? doctor.actionTargetId : null;

    let savedMafiaTargetId: string | null = null;

    if (mafiaDisabled) {
      results.push("تم تعطيل المافيا هذه الليلة، لم يتمكنوا من القتل!");
    } else {
      const actualMafiaTargetId = latestMafiaTargetId !== undefined ? latestMafiaTargetId : mafiaTargetId;
      const targets = [actualMafiaTargetId, mafiaDoubleKillTargetId].filter(Boolean) as string[];
      
      targets.forEach(targetId => {
        const target = updatedPlayers.find(p => p.id === targetId);
        if (!target) return;

        // Check for protection
        const isProtected = targetId === doctorTarget || targetId === selfProtectedId;
        
        // Check for Lucky ability
        const isLucky = target.specialAbility === "LUCKY" && Math.random() > 0.5;

        if (isProtected) {
          results.push(`حاولت المافيا قتل ${target.name}، لكنه نجا بفضل الحماية!`);
          if (targetId === doctorTarget) {
            savedMafiaTargetId = targetId;
          }
        } else if (isLucky) {
          results.push(`حاولت المافيا قتل ${target.name}، لكنه نجا بأعجوبة!`);
        } else {
          target.isAlive = false;
          results.push(`تم قتل اللاعب ${target.name} خلال الليل.`);
        }
      });
    }

    setLastNightDoctorTargetId(doctorTarget);
    setLastNightSavedMafiaTargetId(savedMafiaTargetId);

    // Log ability usage (without names)
    if (usedAbilitiesThisNight.length > 0) {
      const uniqueAbilities = Array.from(new Set(usedAbilitiesThisNight));
      uniqueAbilities.forEach(ability => {
        const info = ABILITY_INFO[ability as SpecialAbility];
        results.push(`تم استخدام خاصية "${info.name}" الليلة.`);
      });
    }

    // Check for silenced players
    if (updatedPlayers.some(p => p.isSilenced)) {
      results.push("تم إسكات أحد اللاعبين، لن يتمكن من التصويت غداً.");
    }

    if (results.length === 0) {
      results.push("مرت الليلة بهدوء، ولم يمت أحد.");
    }

    setPlayers(updatedPlayers);
    setNightResults(results);
    if (!checkWinCondition(updatedPlayers)) {
      setGameState("RESULTS");
    }
  };

  const handleRandomKill = () => {
    // Filter alive players who are not Mafia
    const eligiblePlayers = players.filter(p => p.isAlive && p.role !== "مافيا");
    if (eligiblePlayers.length === 0) return;

    // Pick one at random
    const randomIndex = Math.floor(Math.random() * eligiblePlayers.length);
    const targetPlayer = eligiblePlayers[randomIndex];

    // Check if protected by the doctor or has self-protection
    const isProtected = targetPlayer.id === lastNightDoctorTargetId || targetPlayer.id === selfProtectedId;

    const updatedPlayers = players.map(p => {
      if (p.id === targetPlayer.id) {
        return { ...p, isAlive: isProtected ? p.isAlive : false };
      }
      return p;
    });

    const newResults: string[] = [];
    if (isProtected) {
      newResults.push(`تم اختيار اللاعب ${targetPlayer.name} عشوائياً للقتل، ولكن تمت حمايته بنجاح بفضل الطبيب!`);
    } else {
      newResults.push(`تم القتل العشوائي بنجاح! مات اللاعب ${targetPlayer.name}.`);
    }

    setPlayers(updatedPlayers);
    setNightResults(newResults);
    
    // Check if this death changes win condition
    checkWinCondition(updatedPlayers);
  };

  // Voting Functions
  const startVotingPhase = () => {
    playBellSound();
    setGameState("VOTING");
    setVotes({});
    setNoVoteCount(0);
    const firstVoter = getNextVoterIndex(0);
    setCurrentPlayerIndex(firstVoter);
    setIsConfirmed(false);
    setIsSure(false);
  };

  const skipVotingEntirely = () => {
    playSuccessSound();
    setNightResults(["تم تخطي مرحلة التصويت باتفاق الجميع."]);
    setGameState("VOTE_RESULTS");
  };

  const castVote = (targetId: string | "NO_VOTE") => {
    playClickSound();
    const currentPlayer = players[currentPlayerIndex];
    const voteWeight = currentPlayer.hasExtraVote ? 2 : 1;

    if (targetId === "NO_VOTE") {
      setNoVoteCount(prev => prev + voteWeight);
    } else {
      setVotes(prev => ({
        ...prev,
        [targetId]: (prev[targetId] || 0) + voteWeight
      }));
    }
    nextVoteTurn();
  };

  const nextVoteTurn = () => {
    const nextIndex = getNextVoterIndex(currentPlayerIndex + 1);
    if (nextIndex !== -1) {
      playPaperSound();
      setCurrentPlayerIndex(nextIndex);
      setIsConfirmed(false);
      setIsSure(false);
    } else {
      playSuccessSound();
      processVotes();
    }
  };

  const processVotes = () => {
    let currentMaxVotes = 0;
    let currentLynchedId: string | null = null;
    let currentIsTie = false;

    Object.entries(votes).forEach(([id, count]) => {
      const voteCount = count as number;
      if (voteCount > currentMaxVotes) {
        currentMaxVotes = voteCount;
        currentLynchedId = id;
        currentIsTie = false;
      } else if (voteCount === currentMaxVotes) {
        currentIsTie = true;
      }
    });

    const updatedPlayers = players.map(p => ({ ...p }));

    if (currentMaxVotes > noVoteCount && !currentIsTie && currentLynchedId) {
      const target = updatedPlayers.find(p => p.id === currentLynchedId);
      if (target) {
        target.isAlive = false;
        let result = `بناءً على التصويت، تم إخراج اللاعب ${target.name} من اللعبة.`;
        if (target.role === "مافيا") {
          result += ` وكان هو المافيا!`;
        }
        setNightResults([result]);
      }
    } else {
      setNightResults(["لم يتم إخراج أحد في هذه الجولة (الأغلبية لم تصوت أو حدث تعادل)."]);
    }
    
    setPlayers(updatedPlayers);

    if (!checkWinCondition(updatedPlayers)) {
      setGameState("VOTE_RESULTS");
    }
  };

  const resetGame = () => {
    setDayCount(0);
    setMafiaDisabled(false);
    setSelfProtectedId(null);
    const resetPlayers = players.map(p => ({ 
      ...p, 
      role: "مواطن" as Role, 
      isAlive: true, 
      actionTargetId: undefined,
      specialAbility: undefined,
      isAbilityUsed: false
    }));
    setPlayers(resetPlayers);
    setGameState("SETUP");
    setNightResults([]);
    setCurrentPlayerIndex(0);
    setIsSure(false);
    setIsConfirmed(false);
    setShowRole(false);
    setWinner(null);
    setMafiaTargetId(null);
    setVotes({});
    setNoVoteCount(0);
    setConfirmStep(0);
    setLastNightDoctorTargetId(null);
    setLastNightSavedMafiaTargetId(null);
  };

  const startNextRound = () => {
    setMafiaDisabled(false);
    setSelfProtectedId(null);
    setMafiaDoubleKillTargetId(null);
    setUsedAbilitiesThisNight([]);
    const resetPlayers = players.map(p => ({ 
      ...p, 
      actionTargetId: undefined,
      role: p.originalRole ? p.originalRole : p.role,
      originalRole: undefined,
      isBlocked: false,
      isFramed: false,
      isSilenced: false,
      hasExtraVote: false,
      isGhost: false,
    }));
    setPlayers(resetPlayers);
    startNightPhase();
  };

  const isConfirmedMafia = gameState === "NIGHT_ACTION" && isConfirmed && players[currentPlayerIndex]?.role === "مافيا";

  const isNightConfirmed = gameState === "NIGHT_ACTION" && isConfirmed;
  const activeRole = players[currentPlayerIndex]?.role;
  const roleBgUrl = isNightConfirmed
    ? (activeRole === "مافيا"
      ? "/src/assets/images/mafia_new_1781139966290.png"
      : activeRole === "طبيب"
      ? "/src/assets/images/doctor_new_1781139985416.png"
      : activeRole === "شايب"
      ? "/src/assets/images/detective_new_1781140002713.png"
      : activeRole === "مواطن"
      ? "/src/assets/images/citizen_new_1781140018622.png"
      : undefined)
    : undefined;

  return (
    <div 
      className={`min-h-screen transition-all duration-1000 flex flex-col items-center p-4 md:p-8 desk-wood relative overflow-x-hidden ${
        isNight ? "text-zinc-100" : "text-zinc-900"
      }`} 
      dir="rtl"
    >
      {/* Decorative Icon */}
      <div className="fixed top-8 right-8 pointer-events-none opacity-20">
        {isNight ? <Moon size={120} className="text-indigo-300" /> : <Sun size={120} className="text-amber-400" />}
      </div>

      {/* Home Button */}
      {gameState !== "SETUP" && (
        <>
          <div className={`fixed top-8 left-1/2 -translate-x-1/2 px-6 py-2 rounded-full font-black text-xl shadow-lg z-50 flex items-center gap-2 ${
            isNight ? "bg-indigo-900/50 text-indigo-200 border border-indigo-700" : "bg-white text-amber-600 border border-amber-100"
          }`}>
            <Users size={20} />
            اليوم {dayCount}
          </div>
          <button
            onClick={() => setConfirmStep(1)}
          className={`fixed top-8 left-8 p-3 rounded-full transition-all shadow-lg z-50 ${
            isNight ? "bg-indigo-900/50 text-indigo-200 hover:bg-red-900/50" : "bg-white text-zinc-500 hover:bg-red-50 hover:text-red-600"
          }`}
          title="العودة للقائمة الرئيسية"
        >
          <Home size={24} />
        </button>
        </>
      )}

      {/* Custom Confirmation Modal */}
      <AnimatePresence>
        {confirmStep > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center"
            >
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="text-amber-600 w-8 h-8" />
              </div>
              
              <h3 className="text-xl font-bold text-zinc-900 mb-4">
                {confirmStep === 1 ? "هل أنت متأكد تريد الرجوع؟" : "سيتم إلغاء هذه اللعبة، هل تريد إغلاق اللعبة؟"}
              </h3>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    if (confirmStep === 1) {
                      setConfirmStep(2);
                    } else {
                      resetGame();
                    }
                  }}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-all"
                >
                  نعم
                </button>
                <button
                  onClick={() => setConfirmStep(0)}
                  className="flex-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 font-bold py-3 rounded-xl transition-all"
                >
                  إلغاء
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rules Modal */}
      <AnimatePresence>
        {showRules && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="text-amber-600 w-8 h-8" />
              </div>
              
              <h2 className="text-2xl font-bold text-zinc-900 mb-6 text-center">قوانين اللعبة</h2>
              
              <div className="space-y-4 text-right dir-rtl mb-8">
                <p className="font-bold text-amber-700 mb-4 text-center">الرجاء اتباع قوانين اللعبة لضمان متعتها:</p>
                
                <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                  <p className="text-zinc-700 leading-relaxed">
                    <span className="font-bold text-amber-600 ml-1">١-</span>
                    الاشخاص الذين خرجوا من اللعبة وتم استبعادهم عليهم الخروج من الغرفة اذا كان هناك شخصان.
                  </p>
                </div>

                <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                  <p className="text-zinc-700 leading-relaxed">
                    <span className="font-bold text-amber-600 ml-1">٢-</span>
                    يرجى اغماض العينان اذا كان هناك مافيا اثنان في قسم اللعب وسبدأ من اول لاعب والكل يغمض عينيه وبعدها على اللاعب قراءة من هو اللاعب الذي بعده ثم يغمض عينيه ويقول بصوت عالي اسم اللاعب الذي بعده.
                  </p>
                </div>

                <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                  <p className="text-zinc-700 leading-relaxed">
                    <span className="font-bold text-amber-600 ml-1">٣-</span>
                    اي محاولة غش او فضح الشخصية يؤدي الى خروج من اللعبة.
                  </p>
                </div>

                <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                  <p className="text-zinc-700 leading-relaxed">
                    <span className="font-bold text-amber-600 ml-1">٤-</span>
                    اي محاولة فتح عينان او غش يؤدي الى الطرد.
                  </p>
                </div>

                <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                  <p className="text-zinc-700 leading-relaxed">
                    <span className="font-bold text-amber-600 ml-1">٥-</span>
                    يرجى من صاحب شخصية الشايب عدم قول (هذا شخص مضمون او خوش ولد) يؤدي الى الطرد الا بدليل مثال بدل هذا خوش ولد قول (لقد لاحضت عليه الارتياح والانضباط لا اعتقد هو).
                  </p>
                </div>
              </div>
              
              <button
                onClick={() => setShowRules(false)}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-amber-200 flex items-center justify-center gap-2"
              >
                <Play size={20} />
                فهمت القوانين، لنبدأ!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full max-w-2xl relative z-10">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className={`text-4xl font-black tracking-tighter mb-2 ${isNight ? "text-white" : "text-zinc-900"}`}>لعبة المافيا</h1>
          <div className={`h-1 w-20 mx-auto rounded-full ${isNight ? "bg-red-600" : "bg-amber-500"}`} />
          
          {(gameState === "NIGHT_ACTION" || gameState === "VOTING") && (
            <p className={`mt-4 font-bold text-lg ${isNight ? "text-red-500" : "text-amber-700"}`}>الجولة الصباحية قسم: اللعب</p>
          )}
        </div>

        <AnimatePresence mode="wait">
          {/* SETUP SCREEN */}
          {gameState === "SETUP" && (
            <motion.div 
              key="setup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="notebook-sheet border border-stone-300 rounded-3xl p-6 pr-12 pl-6 shadow-2xl relative overflow-visible"
            >
              {/* Spiral Wire loops decoration */}
              <NotebookSpiralBinder />
              {/* Vertical red margin line */}
              <div className="notebook-margin-line" />

              <div className="relative z-10 text-neutral-800">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-black flex items-center gap-2 text-neutral-905">
                    <Users className="text-amber-800" /> إعداد اللعبة
                  </h2>
                  <div className="bg-amber-100 border border-amber-200 text-amber-800 text-[10px] sm:text-xs font-black px-2.5 py-1 rounded-xl flex items-center gap-1.5 shadow-sm">
                    <span>✨ نظام تدوير الأدوار مفعّل</span>
                  </div>
                </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-zinc-500 mb-2">عدد المافيا (1-4)</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4].map(num => (
                      <button
                        key={num}
                        onClick={() => setMafiaCount(num)}
                        className={`flex-1 py-3 rounded-xl font-bold transition-all ${
                          mafiaCount === num ? "bg-amber-600 text-white" : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-500 mb-2">أسماء اللاعبين</label>
                  <div className="flex gap-2 mb-4">
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && addPlayer()}
                      placeholder="أدخل اسم اللاعب..."
                      className="flex-1 bg-white border border-zinc-200 rounded-xl px-4 py-3 focus:outline-none focus:border-amber-600 transition-colors"
                    />
                    <button
                      onClick={addPlayer}
                      className="bg-zinc-100 hover:bg-zinc-200 p-3 rounded-xl transition-colors"
                    >
                      <UserPlus className="text-zinc-400" />
                    </button>
                    {newName.trim() && (
                      <button
                        onClick={() => toggleSaveName(newName.trim())}
                        className={`p-3 rounded-xl transition-colors ${savedNames.includes(newName.trim()) ? "bg-amber-100 text-amber-600" : "bg-zinc-100 text-zinc-400"}`}
                        title={savedNames.includes(newName.trim()) ? "إزالة من المحفوظات" : "حفظ الاسم"}
                      >
                        <Save size={20} />
                      </button>
                    )}
                  </div>

                  {/* Saved Names Section */}
                  {savedNames.length > 0 && (
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-xs font-bold text-zinc-400">الأسماء المحفوظة (اضغط للإضافة):</p>
                        <button
                          type="button"
                          onClick={addAllPresetNames}
                          className="bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-black py-1 px-2.5 rounded-lg transition-all flex items-center gap-1 shadow-sm"
                        >
                          ⚡ إضافة الستة أسماء الجاهزة
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {savedNames.map(name => (
                          <div key={name} className="flex items-center gap-1 bg-amber-50 border border-amber-100 rounded-lg pr-1 pl-2 py-1">
                            <button
                              onClick={() => addSavedName(name)}
                              disabled={players.some(p => p.name === name)}
                              className="text-sm font-medium text-amber-800 hover:text-amber-600 disabled:opacity-30 transition-colors"
                            >
                              + {name}
                            </button>
                            <button 
                              onClick={() => toggleSaveName(name)}
                              className="text-amber-300 hover:text-red-500 transition-colors"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                  {players.map((p, i) => (
                    <div key={p.id} className="flex items-center justify-between bg-white p-3 rounded-xl border border-zinc-100">
                      <span className="font-medium">{i + 1}. {p.name}</span>
                      <button onClick={() => removePlayer(p.id)} className="text-zinc-400 hover:text-red-500 transition-colors">
                        حذف
                      </button>
                    </div>
                  ))}
                </div>

                {/* Special Abilities Toggle */}
                <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${useSpecialAbilities ? "bg-amber-600 text-white" : "bg-zinc-200 text-zinc-500"}`}>
                      <RefreshCcw size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-amber-900 text-sm">الخواص الخاصة</p>
                      <p className="text-xs text-amber-700/60">تفعيل قدرات عشوائية للمواطنين</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setUseSpecialAbilities(!useSpecialAbilities)}
                    className={`w-12 h-6 rounded-full transition-all relative ${useSpecialAbilities ? "bg-amber-600" : "bg-zinc-300"}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${useSpecialAbilities ? "right-7" : "right-1"}`} />
                  </button>
                </div>

                {/* Manual Roles Selection System Toggle */}
                <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${useManualRoles ? "bg-amber-600 text-white" : "bg-zinc-200 text-zinc-500"}`}>
                      <Users size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-amber-900 text-sm">نظام الاختيار (يدوي)</p>
                      <p className="text-xs text-amber-700/60">اختيار من سيكون المافيا والطبيب والشايب وتغيير الترتيب</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setUseManualRoles(!useManualRoles)}
                    className={`w-12 h-6 rounded-full transition-all relative ${useManualRoles ? "bg-amber-600" : "bg-zinc-300"}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${useManualRoles ? "right-7" : "right-1"}`} />
                  </button>
                </div>

                <button
                  onClick={startGame}
                  disabled={players.length < 4}
                  className="w-full bg-zinc-900 text-white font-black py-4 rounded-2xl hover:bg-black disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  <Play size={20} fill="currentColor" /> ابدأ اللعبة
                </button>
              </div>
              </div>
            </motion.div>
          )}

          {/* ROLE SELECTION SCREEN */}
          {gameState === "ROLE_SELECTION" && (
            <motion.div
              key="role_selection"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/90 backdrop-blur-sm border border-amber-200 rounded-3xl p-6 shadow-xl space-y-6 text-right"
              dir="rtl"
            >
              <div className="text-center pb-4 border-b border-zinc-100">
                <h2 className="text-2xl font-black text-zinc-900 flex items-center justify-center gap-2">
                  <Users className="text-amber-600" /> مخصّص الأدوار اليدوي
                </h2>
                <p className="text-xs text-zinc-500 mt-1">اختر اللاعبين لكل فئة خطوة بخطوة وجهز ترتيب كشف الأدوار</p>
                <button
                  type="button"
                  onClick={() => setHideSelectionsInManual(!hideSelectionsInManual)}
                  className={`mx-auto mt-3 py-2 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 border ${
                    hideSelectionsInManual
                      ? "bg-amber-100 text-amber-900 border-amber-300 shadow-sm"
                      : "bg-zinc-100 text-zinc-600 border-zinc-200 hover:bg-zinc-200"
                  }`}
                >
                  <span>{hideSelectionsInManual ? "👁️ كشف أسماء اللاعبين لإعداد الدور" : "⬛ تغطية الأسماء بالأسود (اختيار عشوائي سري)"}</span>
                </button>
              </div>

              {shuffleNotice && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="bg-amber-500/10 border border-amber-500/30 text-amber-900 rounded-2xl p-3.5 text-center text-xs font-black shadow-inner flex items-center justify-center gap-2"
                >
                  <span className="animate-bounce">🎲</span>
                  <span>{shuffleNotice}</span>
                </motion.div>
              )}

              {/* Progress Wizard Breadcrumbs */}
              <div className="flex items-center justify-between max-w-md mx-auto mb-6 bg-zinc-50 p-2 rounded-2xl border border-zinc-100 select-none">
                <button
                  type="button"
                  onClick={() => setRoleSelectionStep("MAFIA")}
                  className={`flex-1 py-2 text-center rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1 ${
                    roleSelectionStep === "MAFIA"
                      ? "bg-red-500 text-white shadow-sm"
                      : "text-zinc-600 hover:bg-zinc-100"
                  }`}
                >
                  💀 المافيا {hideSelectionsInManual ? "" : `(${selectedMafiaIds.length}/${mafiaCount})`}
                </button>
                <div className="w-4 h-[2px] bg-zinc-200" />
                <button
                  type="button"
                  disabled={selectedMafiaIds.length !== mafiaCount}
                  onClick={() => setRoleSelectionStep("DOCTOR")}
                  className={`flex-1 py-1.5 text-center rounded-xl font-bold text-[11px] transition-all flex items-center justify-center gap-0.5 ${
                    roleSelectionStep === "DOCTOR"
                      ? "bg-emerald-500 text-white shadow-sm"
                      : "text-zinc-600 hover:bg-zinc-100 disabled:opacity-40"
                  }`}
                >
                  🛡️ الطبيب {selectedDoctorId && !hideSelectionsInManual ? "✓" : ""}
                </button>
                <div className="w-4 h-[2px] bg-zinc-200" />
                <button
                  type="button"
                  disabled={selectedMafiaIds.length !== mafiaCount || !selectedDoctorId}
                  onClick={() => setRoleSelectionStep("OLD_MAN")}
                  className={`flex-1 py-1.5 text-center rounded-xl font-bold text-[11px] transition-all flex items-center justify-center gap-0.5 ${
                    roleSelectionStep === "OLD_MAN"
                      ? "bg-blue-500 text-white shadow-sm"
                      : "text-zinc-600 hover:bg-zinc-100 disabled:opacity-40"
                  }`}
                >
                  🔍 الشايب {selectedOldManId && !hideSelectionsInManual ? "✓" : ""}
                </button>
              </div>

              {/* Step 1: MAFIA */}
              {roleSelectionStep === "MAFIA" && (
                <motion.div
                  key="step_mafia"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div className="bg-red-50/50 border border-red-100 p-4 rounded-2xl">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-bold text-red-950 flex items-center gap-1.5">
                        <Skull size={18} className="text-red-500" />
                        من تريد أن يصبح المافيا؟
                      </span>
                      <span className="text-xs bg-red-100 text-red-850 px-2.5 py-1 rounded-full font-black">
                        {hideSelectionsInManual ? "مخفي 👁️" : `${selectedMafiaIds.length} من ${mafiaCount}`}
                      </span>
                    </div>
                    <p className="text-xs text-red-750/70 mb-3 leading-relaxed">اختر {mafiaCount} لاعب ليأخذوا هذا الدور ليعملوا في الخفاء.</p>
                    
                    {/* Lateral scrolling selector */}
                    <div className="flex gap-2 overflow-x-auto py-1 pr-1 scrollbar-hide no-scrollbar select-none" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                      {players.map((p) => {
                        const isSelected = selectedMafiaIds.includes(p.id);
                        const showAsSelected = isSelected && !hideSelectionsInManual;
                        const hasConflict = (selectedDoctorId === p.id || selectedOldManId === p.id) && !hideSelectionsInManual;
                        const cardTheme = getPlayerCardTheme(p.id, p.name);
                        return (
                          <motion.button
                            layout
                            transition={{ type: "spring", stiffness: 220, damping: 20 }}
                            key={p.id}
                            type="button"
                            onClick={() => selectMafia(p.id)}
                            className={`px-4 py-3 rounded-2xl text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 border shrink-0 shadow-sm ${
                              showAsSelected
                                ? "bg-red-600 text-white border-red-700 shadow-red-200 animate-pulse"
                                : hideSelectionsInManual
                                  ? "bg-zinc-900 text-white border-zinc-800 hover:bg-zinc-800"
                                  : "bg-white text-zinc-800 border-zinc-200 hover:bg-zinc-50"
                            }`}
                          >
                            {showAsSelected ? (
                              <Skull size={14} />
                            ) : (
                              hideSelectionsInManual && <span className="text-sm select-none">{cardTheme.symbol}</span>
                            )}
                            {hideSelectionsInManual ? (
                              <span className="bg-zinc-950 text-zinc-950 px-5 py-0.5 rounded select-none font-mono text-xs leading-none">██████</span>
                            ) : (
                              <span>{p.name}</span>
                            )}
                            {hasConflict && (
                              <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-lg font-bold">
                                {selectedDoctorId === p.id ? "طبيب 🛡️" : "شايب 🔍"}
                              </span>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: DOCTOR */}
              {roleSelectionStep === "DOCTOR" && (
                <motion.div
                  key="step_doctor"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-2xl">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-bold text-emerald-950 flex items-center gap-1.5">
                        <Shield size={18} className="text-emerald-500" />
                        من تريد أن يصبح الطبيب؟
                      </span>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-black ${selectedDoctorId && !hideSelectionsInManual ? "bg-emerald-100 text-emerald-850" : "bg-zinc-200 text-zinc-500"}`}>
                        {hideSelectionsInManual ? "مخفي 👁️" : (selectedDoctorId ? "تم الاختيار" : "لم يتم الاختيار")}
                      </span>
                    </div>
                    <p className="text-xs text-emerald-750/70 mb-3 leading-relaxed">اختر لاعباً لدور الطبيب ليقوم بحماية المواطنين ليلاً.</p>

                    {/* Lateral scrolling selector */}
                    <div className="flex gap-2 overflow-x-auto py-1 pr-1 scrollbar-hide no-scrollbar select-none" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                      {players.map((p) => {
                        const isSelected = selectedDoctorId === p.id;
                        const showAsSelected = isSelected && !hideSelectionsInManual;
                        const hasConflict = (selectedMafiaIds.includes(p.id) || selectedOldManId === p.id) && !hideSelectionsInManual;
                        const cardTheme = getPlayerCardTheme(p.id, p.name);
                        return (
                          <motion.button
                            layout
                            transition={{ type: "spring", stiffness: 220, damping: 20 }}
                            key={p.id}
                            type="button"
                            onClick={() => selectDoctor(p.id)}
                            className={`px-4 py-3 rounded-2xl text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 border shrink-0 shadow-sm ${
                              showAsSelected
                                ? "bg-emerald-600 text-white border-emerald-700 shadow-emerald-200 animate-pulse"
                                : hideSelectionsInManual
                                  ? "bg-zinc-900 text-white border-zinc-800 hover:bg-zinc-800"
                                  : "bg-white text-zinc-800 border-zinc-200 hover:bg-zinc-50"
                            }`}
                          >
                            {showAsSelected ? (
                              <Shield size={14} />
                            ) : (
                              hideSelectionsInManual && <span className="text-sm select-none">{cardTheme.symbol}</span>
                            )}
                            {hideSelectionsInManual ? (
                              <span className="bg-zinc-950 text-zinc-950 px-5 py-0.5 rounded select-none font-mono text-xs leading-none">██████</span>
                            ) : (
                              <span>{p.name}</span>
                            )}
                            {hasConflict && (
                              <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-lg font-bold">
                                {selectedMafiaIds.includes(p.id) ? "مافيا 💀" : "شايب 🔍"}
                              </span>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: OLD_MAN */}
              {roleSelectionStep === "OLD_MAN" && (
                <motion.div
                  key="step_oldman"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-2xl">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-bold text-blue-950 flex items-center gap-1.5">
                        <Search size={18} className="text-blue-500" />
                        من تريد أن يصبح الشايب؟
                      </span>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-black ${selectedOldManId && !hideSelectionsInManual ? "bg-blue-100 text-blue-850" : "bg-zinc-200 text-zinc-500"}`}>
                        {hideSelectionsInManual ? "مخفي 👁️" : (selectedOldManId ? "تم الاختيار" : "لم يتم الاختيار")}
                      </span>
                    </div>
                    <p className="text-xs text-blue-750/70 mb-3 leading-relaxed">اختر الشايب الذي يمتلك قدرة الكشف عن الأدوار في الليل.</p>

                    {/* Lateral scrolling selector */}
                    <div className="flex gap-2 overflow-x-auto py-1 pr-1 scrollbar-hide no-scrollbar select-none" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                      {players.map((p) => {
                        const isSelected = selectedOldManId === p.id;
                        const showAsSelected = isSelected && !hideSelectionsInManual;
                        const hasConflict = (selectedMafiaIds.includes(p.id) || selectedDoctorId === p.id) && !hideSelectionsInManual;
                        const cardTheme = getPlayerCardTheme(p.id, p.name);
                        return (
                          <motion.button
                            layout
                            transition={{ type: "spring", stiffness: 220, damping: 20 }}
                            key={p.id}
                            type="button"
                            onClick={() => selectOldMan(p.id)}
                            className={`px-4 py-3 rounded-2xl text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 border shrink-0 shadow-sm ${
                              showAsSelected
                                ? "bg-blue-600 text-white border-blue-700 shadow-blue-200 animate-pulse"
                                : hideSelectionsInManual
                                  ? "bg-zinc-900 text-white border-zinc-800 hover:bg-zinc-800"
                                  : "bg-white text-zinc-800 border-zinc-200 hover:bg-zinc-50"
                            }`}
                          >
                            {showAsSelected ? (
                              <Search size={14} />
                            ) : (
                              hideSelectionsInManual && <span className="text-sm select-none">{cardTheme.symbol}</span>
                            )}
                            {hideSelectionsInManual ? (
                              <span className="bg-zinc-950 text-zinc-200 px-5 py-0.5 rounded select-none font-mono text-xs leading-none">██████</span>
                            ) : (
                              <span>{p.name}</span>
                            )}
                            {hasConflict && (
                              <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-lg font-bold">
                                {selectedMafiaIds.includes(p.id) ? "مافيا 💀" : "طبيب 🛡️"}
                              </span>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Simplified Shuffle Utility */}
              <div className="pt-2 pb-2 flex justify-between items-center bg-zinc-50/40 px-3 py-2 rounded-xl border border-dashed border-zinc-200 mb-2 mt-4">
                <span className="text-[11px] text-zinc-500 font-bold flex items-center gap-1">
                  <Shuffle size={12} className="text-amber-500" /> ترتيب اللاعبين:
                </span>
                <button
                  type="button"
                  onClick={shufflePlayers}
                  className="flex items-center gap-1 text-[11px] bg-white hover:bg-zinc-100 hover:border-zinc-300 border border-zinc-200 text-zinc-800 px-3 py-1.5 rounded-xl font-bold transition-all shadow-xs"
                >
                  <Shuffle size={12} /> خلط وترتيب اللاعبين
                </button>
              </div>

              {/* ACTION ACTIONS */}
              <div className="pt-4 border-t border-zinc-150 flex gap-2">
                {roleSelectionStep === "MAFIA" ? (
                  <button
                    type="button"
                    onClick={() => setGameState("SETUP")}
                    className="flex-1 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-650 font-bold rounded-2xl transition-all text-sm"
                  >
                    تعديل الإعدادات
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      if (roleSelectionStep === "DOCTOR") setRoleSelectionStep("MAFIA");
                      if (roleSelectionStep === "OLD_MAN") setRoleSelectionStep("DOCTOR");
                    }}
                    className="flex-1 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-650 font-bold rounded-2xl transition-all text-sm"
                  >
                    السابق
                  </button>
                )}

                {roleSelectionStep === "MAFIA" && (
                  <button
                    type="button"
                    disabled={selectedMafiaIds.length !== mafiaCount}
                    onClick={() => setRoleSelectionStep("DOCTOR")}
                    className="flex-[2] py-3 bg-zinc-950 text-white font-black rounded-2xl hover:bg-black transition-all disabled:opacity-35 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 shadow-lg text-sm"
                  >
                    تأكيد المافيا والانتقال للطبيب <ChevronRight size={16} className="rotate-180" />
                  </button>
                )}

                {roleSelectionStep === "DOCTOR" && (
                  <button
                    type="button"
                    disabled={!selectedDoctorId}
                    onClick={() => setRoleSelectionStep("OLD_MAN")}
                    className="flex-[2] py-3 bg-zinc-950 text-white font-black rounded-2xl hover:bg-black transition-all disabled:opacity-35 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 shadow-lg text-sm"
                  >
                    تأكيد الطبيب والانتقال للشايب <ChevronRight size={16} className="rotate-180" />
                  </button>
                )}

                {roleSelectionStep === "OLD_MAN" && (
                  <button
                    type="button"
                    onClick={confirmManualRoles}
                    disabled={selectedMafiaIds.length !== mafiaCount || !selectedDoctorId || !selectedOldManId}
                    className="flex-[2] py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl transition-all disabled:opacity-35 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 shadow-lg text-sm"
                  >
                    🌙 تأكيد وبدء اللعب فوراً!
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* NIGHT ACTION SCREEN */}
          {gameState === "NIGHT_ACTION" && (
            <motion.div 
              key="night_action"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-lg mx-auto"
            >
              {!isConfirmed ? (
                /* Pass & Play Confirmation Screen */
                <div className="bg-zinc-950/85 backdrop-blur-md border border-neutral-850 rounded-3xl p-8 shadow-2xl text-center space-y-6 text-white text-right">
                  <div className="w-16 h-16 bg-neutral-900 rounded-full flex items-center justify-center mx-auto text-yellow-500 shadow-md">
                    <Moon size={32} />
                  </div>
                  <h2 className="text-2xl font-black text-center text-stone-100">
                    حان دور: <span className="text-yellow-500 underline decoration-yellow-600 decoration-double">{players[currentPlayerIndex].name}</span>
                  </h2>
                  <p className="text-xs text-neutral-400 text-center leading-relaxed">
                    الرجاء تمرير الجهاز إلى هذا اللاعب والضغط على الزر أدناه عند الاستلام لضمان سرية الأدوار.
                  </p>
                  
                   {!isSure ? (
                    <button
                      onClick={() => { playClickSound(); setIsSure(true); }}
                      className="w-full bg-yellow-500 hover:bg-yellow-600 text-neutral-950 py-4 px-6 rounded-xl font-bold text-lg transition-all shadow-md active:scale-[0.98]"
                      type="button"
                    >
                      استلمت الجهاز ➔
                    </button>
                  ) : (
                    <div className="space-y-4 pt-2">
                      <p className="text-sm font-bold text-center text-yellow-400 font-mono">هل أنت وحدك وتضمن سرية الشاشة الآن؟</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => { playPaperSound(); setIsConfirmed(true); }}
                          className="flex-[2] bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 rounded-xl font-bold text-sm transition-all shadow active:scale-[0.98]"
                          type="button"
                        >
                          نعم، كشف دوري 👁️
                        </button>
                        <button
                          onClick={() => { playFailSound(); setIsSure(false); }}
                          className="flex-1 bg-neutral-850 hover:bg-neutral-800 text-neutral-300 py-3 px-4 rounded-xl font-bold text-sm transition-all"
                          type="button"
                        >
                          إلغاء
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Active Role Turn with Premium Parchment Sheet & Framed Role Image */
                <div className="parchment-sheet border-3 border-stone-800 rounded-3xl p-4 sm:p-6 shadow-2xl relative overflow-hidden text-stone-900">
                  <div className="relative z-10 flex flex-col justify-between min-h-0 space-y-4 text-right">
                    
                    {/* Top watermark / role emblem */}
                    {activeRole === "مافيا" && (
                      <div className="absolute top-2 left-4 opacity-15 pointer-events-none select-none">
                        <Skull className="text-red-900" size={40} />
                      </div>
                    )}
                    {activeRole === "طبيب" && (
                      <div className="absolute top-2 left-4 opacity-15 pointer-events-none select-none">
                        <Shield className="text-emerald-900" size={40} />
                      </div>
                    )}
                    {activeRole === "شايب" && (
                      <div className="absolute top-2 left-4 opacity-15 pointer-events-none select-none">
                        <Search className="text-blue-900" size={40} />
                      </div>
                    )}

                    {/* Framed prominent role representative image (Enlarged) */}
                    {roleBgUrl && (
                      <div className="flex justify-center shrink-0 my-1">
                        <img 
                          src={roleBgUrl} 
                          alt={activeRole}
                          referrerPolicy="no-referrer"
                          className="max-h-[300px] sm:max-h-[380px] w-auto object-contain rounded-2xl shadow-xl border-4 border-stone-850 bg-stone-150 p-1.5 transition-all hover:scale-102"
                        />
                      </div>
                    )}

                    {/* Standard header info */}
                    <div className="text-center shrink-0">
                      <div className="inline-block bg-stone-300 text-stone-950 px-3 py-0.5 rounded-md text-[11px] sm:text-xs font-black uppercase tracking-wider mb-2 border border-stone-400">
                        {activeRole === "مافيا" && "ملف اغتيالات الليل — سري للغاية 💀"}
                        {activeRole === "طبيب" && "تقرير الحماية الطبية — سري 🛡️"}
                        {activeRole === "شايب" && "رادار التحري السري — سري للغاية 🔍"}
                        {activeRole === "مواطن" && "قسم السجل الميداني — مواطن عادي 🏘️"}
                      </div>
                      
                      {/* WRITTEN DIRECTLY ON THE PAPER WITH BLACK INK STYLE as requested by the user */}
                      <div className="my-2 text-center">
                        <p className="text-stone-700 text-xs font-bold tracking-tight">فِئَتُكَ وَدَوْرُكَ السِّرِّي هُوَ:</p>
                        
                        <div className="my-2 py-2 px-6 border-y-3 border-double border-stone-800 inline-block min-w-[280px]">
                          <span className="text-4xl sm:text-5xl font-black tracking-widest text-[#0c0a09] drop-shadow-xs font-mono block">
                            {activeRole === "مافيا" && "مـافـيـا 💀"}
                            {activeRole === "طبيب" && "الـطَّـبِـيـب 🛡️"}
                            {activeRole === "شايب" && "الـشَّـايـب 🔍"}
                            {activeRole === "مواطن" && "مُـوَاطِـن 🏘️"}
                          </span>
                        </div>
                        
                        <p className="text-xs text-stone-800 font-extrabold mt-1">
                          اللاعب: <span className="text-[#0c0a09] font-black underline decoration-stone-700 decoration-wavy decoration-1">{players[currentPlayerIndex].name}</span>
                        </p>
                      </div>

                      <p className="text-[12px] sm:text-[13px] text-stone-800 max-w-sm mx-auto mt-2 leading-snug font-black text-center">
                        {activeRole === "مافيا" && "أفرغ رصاصتك في قلب أحد الأبرياء الليلة وصفي حساباتك."}
                        {activeRole === "طبيب" && "اختر اللاعب الذي تريد حمايته من رصاص المافيا الليلة."}
                        {activeRole === "شايب" && "تحرّ عن المشبوهين واكشف عملاء المافيا الخفيين."}
                        {activeRole === "مواطن" && "أنت مواطن عادي، لا تمتلك قدرات خاصة ولكن صوتك يصنع الفارق في النهار."}
                      </p>
                    </div>

                    {/* Special Ability component inside paper card */}
                    {players[currentPlayerIndex].specialAbility && !players[currentPlayerIndex].isAbilityUsed && (
                      <div className={`p-2 border rounded-xl text-right shrink-0 ${
                        activeRole === "مافيا"
                          ? "bg-red-50 border-red-200 text-red-850"
                          : activeRole === "طبيب"
                          ? "bg-emerald-50 border-emerald-200 text-emerald-850"
                          : activeRole === "شايب"
                          ? "bg-blue-50 border-blue-200 text-blue-850"
                          : "bg-stone-50 border-stone-200 text-stone-850"
                      }`}>
                        <p className="font-extrabold text-[10px] mb-1 flex items-center gap-1 justify-end">
                          <span>لديك خاصية خاصة متاحة:</span>
                          {activeRole === "مافيا" && <Skull size={10} className="text-red-600" />}
                          {activeRole === "طبيب" && <Shield size={10} className="text-emerald-600" />}
                          {activeRole === "شايب" && <Search size={10} className="text-blue-600" />}
                        </p>
                        <p className="text-stone-700 text-[9px] mb-1.5 leading-tight">{ABILITY_INFO[players[currentPlayerIndex].specialAbility].desc}</p>
                        
                        {selectingAbilityTarget ? (
                          <div className="space-y-1">
                            <p className="text-stone-900 text-[9px] font-black">اختر الهدف:</p>
                            <div className="grid grid-cols-2 gap-1">
                              {players.filter(p => p.isAlive && p.id !== players[currentPlayerIndex].id).map(p => (
                                <button
                                  key={p.id}
                                  onClick={() => useAbility(players[currentPlayerIndex].id, p.id)}
                                  className={`text-white py-1 px-1.5 rounded text-[9px] font-bold transition-all shadow-xs ${
                                    activeRole === "مافيا"
                                      ? "bg-red-800 hover:bg-red-900"
                                      : activeRole === "طبيب"
                                      ? "bg-emerald-800 hover:bg-emerald-900"
                                      : activeRole === "شايب"
                                      ? "bg-blue-800 hover:bg-blue-900"
                                      : "bg-stone-800 hover:bg-stone-900"
                                  }`}
                                  type="button"
                                >
                                  {p.name}
                                </button>
                              ))}
                            </div>
                            <button 
                              onClick={() => setSelectingAbilityTarget(false)}
                              className="w-full text-stone-500 text-[9px] py-0.5 hover:text-stone-850"
                              type="button"
                            >
                              إلغاء التفعيل
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => useAbility(players[currentPlayerIndex].id)}
                            className={`w-full text-white py-1 rounded-lg text-[10px] font-black flex items-center justify-center gap-1 transition-all shadow-xs ${
                              activeRole === "مافيا"
                                ? "bg-red-800 hover:bg-neutral-900"
                                : activeRole === "طبيب"
                                ? "bg-emerald-800 hover:bg-neutral-900"
                                : activeRole === "شايب"
                                ? "bg-blue-800 hover:bg-neutral-900"
                                : "bg-stone-800 hover:bg-stone-900"
                            }`}
                            type="button"
                          >
                            <RefreshCcw size={10} />
                            تفعيل {ABILITY_INFO[players[currentPlayerIndex].specialAbility].name}
                          </button>
                        )}
                      </div>
                    )}

                    {abilityMessage && (
                      <div className="p-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 font-bold text-[10px] text-center shrink-0">
                        {abilityMessage}
                      </div>
                    )}

                    {/* Role Content View Options */}
                    
                    {activeRole === "مافيا" && (
                      <div className="space-y-2">
                        {/* Crew */}
                        {players.filter(p => p.role === "مافيا" && p.isAlive).length > 1 && (
                          <div className="p-1 bg-stone-105 rounded border border-stone-200">
                            <p className="text-stone-600 font-bold text-[8px] mb-0.5 flex items-center gap-1 justify-end">
                              <span>شركاؤك في الجريمة (نشطين الآن)</span>
                              <Users size={8} />
                            </p>
                            <div className="flex flex-wrap gap-1 justify-end">
                              {players
                                .filter(p => p.role === "مافيا" && p.isAlive && p.id !== players[currentPlayerIndex].id)
                                .map(p => (
                                  <span key={p.id} className="bg-stone-200 border border-stone-300 text-stone-800 px-1 py-0.5 rounded text-[8px] font-bold">
                                    {p.name} 🔫
                                  </span>
                                ))}
                            </div>
                          </div>
                        )}

                        {/* Kill targets */}
                        <div className="space-y-1">
                          {mafiaTargetId ? (
                            <div className="space-y-1.5 text-center">
                              <p className="text-red-750 font-black text-[10px]">تم تحديد الاغتيال وقنص الهدف:</p>
                              <div className="p-1.5 bg-red-50 border border-red-200 rounded-lg max-w-[150px] mx-auto">
                                <p className="text-sm font-black text-red-900 flex items-center justify-center gap-1">
                                  <Skull size={10} className="text-red-700" />
                                  {players.find(p => p.id === mafiaTargetId)?.name}
                                </p>
                              </div>
                              <button
                                onClick={nextNightTurn}
                                className="w-full bg-stone-900 text-white font-bold py-1.5 px-3 rounded-lg hover:bg-stone-800 transition-all text-xs shadow"
                                type="button"
                              >
                                متابعة وإنهاء الدور ➔
                              </button>
                            </div>
                          ) : (
                            <>
                              <p className="text-red-755 font-black border-b border-stone-300 pb-0.5 flex items-center gap-1 justify-end text-[11px]">
                                <span>اختر العميل المستهدف للتصفيّة الليلة</span>
                                <Skull size={10} className="text-red-650" />
                              </p>
                              <p className="text-[9px] text-stone-500 leading-tight">الأهداف التي حماها الطبيب الجولة السابقة تملك درعاً مؤقتاً ولا يمكن تصفيتها.</p>
                              
                              <div className="grid grid-cols-2 gap-1.5 mt-1">
                                {players.filter(p => p.role !== "مافيا" && p.isAlive).map(p => {
                                  const isForbidden = p.id === lastNightSavedMafiaTargetId;
                                  return (
                                    <button
                                      key={p.id}
                                      onClick={() => !isForbidden && handleAction(p.id)}
                                      disabled={isForbidden}
                                      type="button"
                                      className={`p-1.5 rounded-lg transition-all text-[11px] flex items-center justify-between gap-1 border border-stone-300 text-right relative overflow-hidden ${
                                        isForbidden 
                                          ? "bg-stone-100 text-stone-400 cursor-not-allowed opacity-50 font-medium" 
                                          : "bg-[#f5f2e8] hover:bg-red-50 border-stone-300 hover:border-red-600 text-stone-800 hover:text-red-955 font-bold active:bg-red-100"
                                      }`}
                                    >
                                      <div className="flex items-center gap-1">
                                        <div className={`w-1.5 h-1.5 rounded-full ${isForbidden ? "bg-stone-400" : "bg-red-600"}`} />
                                        <span>{p.name}</span>
                                      </div>
                                      {isForbidden ? (
                                        <span className="text-[7px] text-stone-500 bg-stone-200 px-1 py-0.5 rounded">محمي</span>
                                      ) : (
                                        <span className="text-[7px] text-red-500 font-bold opacity-0 hover:opacity-100 transition-opacity">تصفية</span>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )}

                    {activeRole === "طبيب" && (
                      <div className="space-y-1.5">
                        {abilityMessage ? (
                          <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-center space-y-1 max-w-[150px] mx-auto">
                            <p className="text-emerald-955 font-bold text-[10px] leading-tight">{abilityMessage}</p>
                            <button
                              onClick={nextNightTurn}
                              className="w-full bg-emerald-800 text-white py-1 px-2 rounded font-bold hover:bg-emerald-900 transition-all text-[10px] shadow"
                              type="button"
                            >
                              موافق ➔
                            </button>
                          </div>
                        ) : (
                          <>
                            <p className="text-emerald-850 font-black border-b border-stone-300 pb-0.5 flex items-center gap-1 justify-end text-[11px]">
                              <span>اختر شخصاً لتحميه وتنقذه الليلة</span>
                              <Shield size={10} className="text-emerald-600" />
                            </p>
                            <p className="text-[9px] text-stone-555 leading-tight">لا يمكنك حماية نفس الشخص جولتين متتاليتين.</p>
                            
                            <div className="grid grid-cols-2 gap-1.5 mt-1">
                              {players.filter(p => p.isAlive).map(p => {
                                const isForbidden = p.id === lastNightDoctorTargetId;
                                return (
                                  <button
                                    key={p.id}
                                    onClick={() => !isForbidden && handleAction(p.id)}
                                    disabled={isForbidden}
                                    type="button"
                                    className={`p-1.5 rounded-lg transition-all text-[11px] flex items-center justify-between gap-1 border border-stone-300 text-right relative overflow-hidden ${
                                      isForbidden 
                                        ? "bg-stone-100 text-stone-400 cursor-not-allowed opacity-50 font-medium" 
                                        : "bg-[#f5f2e8] hover:bg-emerald-50 border-stone-300 hover:border-emerald-600 text-stone-800 hover:text-emerald-950 font-bold active:bg-emerald-100"
                                    }`}
                                  >
                                    <div className="flex items-center gap-1">
                                      <div className={`w-1.5 h-1.5 rounded-full ${isForbidden ? "bg-stone-400" : "bg-emerald-500"}`} />
                                      <span>{p.name}</span>
                                    </div>
                                    {isForbidden ? (
                                      <span className="text-[7px] text-stone-500 bg-stone-200 px-1 py-0.5 rounded">محمي سابقاّ</span>
                                    ) : (
                                      <span className="text-[7px] text-emerald-650 font-bold opacity-0 hover:opacity-100 transition-opacity">حماية 🛡️</span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    {activeRole === "شايب" && (
                      <div className="space-y-1.5">
                        {dayCount === 1 ? (
                          <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg text-center space-y-1 max-w-[200px] mx-auto">
                            <p className="text-blue-955 font-bold text-[10px] leading-tight">
                              في الليلة الأولى، لا يمكنك التحقيق مع أحد. تعرف فقط على معلومات دورك كشايب وسيزودك الرادار بالتفاصيل لاحقاً! 🔍
                            </p>
                            <button
                              onClick={nextNightTurn}
                              className="w-full bg-blue-800 text-white py-1 px-2 rounded font-bold hover:bg-blue-900 transition-all text-[10px] shadow"
                              type="button"
                            >
                              فهمت، متابعة ➔
                            </button>
                          </div>
                        ) : (
                          <>
                            {investigationResult ? (
                              <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg text-center space-y-1 max-w-[200px] mx-auto">
                                <p className="text-blue-955 font-black text-[10px] flex items-center justify-center gap-1 leading-tight">
                                  <Search size={10} className="text-blue-700" />
                                  {investigationResult}
                                </p>
                                <button
                                  onClick={nextNightTurn}
                                  className="w-full bg-blue-805 text-white py-1 px-2 rounded font-bold hover:bg-blue-900 transition-all text-[10px] shadow"
                                  type="button"
                                >
                                  أوافق ➔
                                </button>
                              </div>
                            ) : (
                              <>
                                <p className="text-blue-855 font-black border-b border-stone-300 pb-0.5 flex items-center gap-1 justify-end text-[11px]">
                                  <span>اختر شخصاً للتحقيق معه وكشف دمه</span>
                                  <Search size={10} className="text-blue-600" />
                                </p>
                                <p className="text-[9px] text-stone-500 leading-tight">رادار الشايب يستطيع كشف ما إذا كان العميل جزءاً من المافيا أم مواطناً بريئاً.</p>
                                
                                <div className="grid grid-cols-2 gap-1.5 mt-1">
                                  {players.filter(p => p.id !== players[currentPlayerIndex].id && p.isAlive).map(p => (
                                    <button
                                      key={p.id}
                                      onClick={() => handleAction(p.id)}
                                      type="button"
                                      className="p-1.5 bg-[#f5f2e8] hover:bg-blue-50 border border-stone-300 hover:border-blue-500 text-stone-800 hover:text-blue-955 font-bold rounded-lg transition-all text-[11px] text-right flex items-center gap-1"
                                    >
                                      <div className="w-1 h-1 rounded-full bg-blue-600" />
                                      <span>{p.name}</span>
                                    </button>
                                  ))}
                                </div>
                              </>
                            )}
                          </>
                        )}
                      </div>
                    )}

                    {activeRole === "مواطن" && (
                      <div className="space-y-2 text-center max-w-[200px] mx-auto">
                        <p className="text-stone-700 text-[10px] font-bold leading-normal">
                          المواطنون يغطون في نوم عميق الآن ترقباً لصباح الغد. اضغط للذهاب للدور التالي.
                        </p>
                        <button
                          onClick={nextNightTurn}
                          className="w-full bg-stone-900 hover:bg-stone-800 text-white font-bold py-1.5 px-3 rounded-lg transition-all text-xs shadow"
                          type="button"
                        >
                          متابعة وتخطي ➔
                        </button>
                      </div>
                    )}

                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* RESULTS SCREEN */}
          {(gameState === "RESULTS" || gameState === "VOTE_RESULTS") && (
            <motion.div 
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="burnt-newspaper border-3 border-amber-900 rounded-3xl p-8 shadow-2xl text-center relative overflow-visible text-amber-950"
            >
              {/* Overlay with realistic revolver gun and bloody knife lying next to the paper! */}
              <ResultsMagazineOverlay />

              <div className="relative z-20">
                <h2 className="text-4xl font-black mb-1 text-amber-950 tracking-wide font-serif">جريدة لاند الحرة 📰</h2>
                <p className="text-[10px] font-mono tracking-widest text-amber-900 mb-6 uppercase border-b-2 border-double border-amber-900/40 pb-4">
                  ملف تقصي الحقائق والجرائم الصحفي — مجلد {dayCount}
                </p>
                
                <div className="space-y-4 mb-8 text-right">
                  {nightResults.map((res, i) => (
                    <div key={i} className="p-6 bg-[#f7eed4] border-2 border-amber-950 rounded-2xl flex items-center gap-4 text-right shadow-md">
                      <div className="w-12 h-12 bg-red-950/20 rounded-full flex items-center justify-center shrink-0 border border-amber-955">
                        <AlertCircle className="text-red-900" />
                      </div>
                      <p className="text-lg font-black text-amber-950">{res}</p>
                    </div>
                  ))}

                  {nightResults.length === 0 && (
                    <div className="p-6 bg-[#f7eed4] border-2 border-amber-950 rounded-2xl flex items-center gap-4 text-right shadow-md">
                      <div className="w-12 h-12 bg-amber-950/20 rounded-full flex items-center justify-center shrink-0">
                        <AlertCircle className="text-amber-900" />
                      </div>
                      <p className="text-lg font-black text-amber-950">لقد مرت هذه الليلة بهدوء تام دون وقوع أي ضحايا.</p>
                    </div>
                  )}

                  {nightResults.some(res => res.includes("لم يمت") || res.includes("بهدوء") || res.length === 0) && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-6 border-2 border-red-950 bg-red-950/10 rounded-2xl flex flex-col gap-4 text-right"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-red-900/20 rounded-full flex items-center justify-center shrink-0 border border-red-950">
                          <Skull className="text-red-900" />
                        </div>
                        <div>
                          <p className="text-lg font-bold text-red-950">حدث طارئ أو لم يمت أحد! 🎲</p>
                          <p className="text-xs text-stone-800 mt-1 leading-relaxed font-bold">
                            يبدو أنه لم يمت أحد هذه الجولة. في حال حدوث بطء بالاتصال أو رغبتكم في تصفية لاعب عشوائي بديل (ما عدا المافيا)، اضغط على الزر أدناه. إذا كان الطبيب قد حماه، ستظهر رسالة حماية ونكمل اللعب شفهياً، وإلا يتم تصفيته وتكملة اللعبة.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRandomKill}
                        className="w-full bg-red-800 hover:bg-red-900 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-red-950/30 flex items-center justify-center gap-2"
                      >
                        <Skull size={18} />
                        تنفيذ القتل العشوائي
                      </button>
                    </motion.div>
                  )}
                </div>

                {gameState === "RESULTS" ? (
                  <button
                    onClick={() => setGameState("DISCUSSION")}
                    className="w-full bg-amber-950 text-white font-bold py-4 rounded-3xl hover:bg-amber-900 border border-amber-900 transition-all flex items-center justify-center gap-2 text-lg shadow-md"
                  >
                    <MessageSquare size={20} /> وقت النقاش
                  </button>
                ) : (
                  <button
                    onClick={startNextRound}
                    className="w-full bg-amber-950 text-white font-bold py-4 rounded-3xl hover:bg-amber-900 border border-amber-900 transition-all flex items-center justify-center gap-2 text-lg shadow-md"
                  >
                    <RefreshCcw size={20} /> الجولة التالية
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* DISCUSSION SCREEN */}
          {gameState === "DISCUSSION" && (
            <motion.div 
              key="discussion"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="notebook-sheet border border-stone-300 rounded-3xl p-8 pr-12 pl-6 shadow-2xl text-center relative overflow-visible"
            >
              {/* Spiral Wire loops decoration */}
              <NotebookSpiralBinder />
              {/* Vertical red margin line */}
              <div className="notebook-margin-line" />

              <div className="relative z-10">
                <h2 className="text-4xl font-black mb-8 text-neutral-800">وقت النقاش</h2>
                
                {dayCount >= 4 && (
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="mb-8 p-6 bg-red-50 border-2 border-red-200 rounded-2xl animate-bounce shadow-lg shadow-red-900/10"
                  >
                    <p className="text-2xl font-black text-red-600 flex items-center justify-center gap-3">
                      <AlertCircle className="shrink-0" />
                      الشايب لازم يتكلم الان !
                    </p>
                  </motion.div>
                )}

                <p className="text-neutral-600 mb-8 text-lg font-bold">تناقشوا الآن لكشف المافيا!</p>
                
                <div className="space-y-4">
                  <button
                    onClick={startVotingPhase}
                    className="w-full bg-red-650 text-white font-black py-6 rounded-3xl hover:bg-red-700 transition-all text-2xl shadow-lg shadow-red-900/20"
                  >
                    خلاصصصص (التصويت)
                  </button>
                  
                  <button
                    onClick={skipVotingEntirely}
                    className="w-full bg-stone-200 text-stone-700 font-bold py-4 rounded-2xl hover:bg-stone-300 transition-all flex items-center justify-center gap-2"
                  >
                    <SkipForward size={20} /> تخطي (محد يريد يصوت)
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* VOTING SCREEN (PASS AND PLAY) */}
          {gameState === "VOTING" && (
            <motion.div 
              key="voting"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="notebook-sheet border border-stone-300 rounded-3xl p-8 pr-12 pl-6 shadow-2xl text-center relative overflow-visible"
            >
              {/* Spiral Wire loops decoration */}
              <NotebookSpiralBinder />
              {/* Vertical red margin line */}
              <div className="notebook-margin-line" />

              <div className="relative z-10">
                <h2 className="text-2xl font-black mb-8 text-neutral-800">
                  دور المصوت: <span className="text-amber-700 bg-amber-100/50 px-3 py-1 rounded-sm border border-amber-200">{players[currentPlayerIndex].name}</span>
                  {players[currentPlayerIndex].hasExtraVote && (
                    <span className="block text-xs text-amber-700 font-bold mt-1">لديك صوت مزدوج!</span>
                  )}
                  {!players[currentPlayerIndex].isAlive && (
                    <span className="block text-xs text-indigo-700 font-bold mt-1">أنت تصوت كشبح!</span>
                  )}
                </h2>
              
              {!isConfirmed ? (
                <div className="space-y-6">
                  <p className="text-zinc-500">مرر الجهاز إلى {players[currentPlayerIndex].name}</p>
                  {!isSure ? (
                    <button
                      onClick={() => { playClickSound(); setIsSure(true); }}
                      className="w-full bg-amber-50 hover:bg-amber-100 py-6 rounded-2xl font-bold text-xl transition-all border border-amber-200 text-amber-900"
                    >
                      لقد حصلت على الجهاز
                    </button>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-xl font-bold">هل أنت متأكد؟</p>
                      <button
                        onClick={() => { playPaperSound(); setIsConfirmed(true); }}
                        className="w-full bg-amber-600 hover:bg-amber-700 py-4 rounded-2xl font-bold text-xl transition-all text-white"
                      >
                        نعم
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                    <p className="text-zinc-500 mb-4">اختر شخصاً لإخراجه أو اختر "ما أبغى أصوت":</p>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {players.filter(p => p.id !== players[currentPlayerIndex].id && p.isAlive).map(p => (
                        <button
                          key={p.id}
                          onClick={() => castVote(p.id)}
                          className="bg-white hover:bg-red-50 border border-zinc-200 p-4 rounded-xl transition-all font-bold text-zinc-900"
                        >
                          {p.name}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => castVote("NO_VOTE")}
                      className="w-full bg-zinc-200 hover:bg-zinc-300 text-zinc-700 py-4 rounded-xl font-bold flex items-center justify-center gap-2"
                    >
                      <Ban size={18} /> ما أبغى أصوت
                    </button>
                  </div>
                </motion.div>
              )}
              </div>
            </motion.div>
          )}
          {/* GAME OVER SCREEN */}
          {gameState === "GAME_OVER" && (
            <motion.div 
              key="game_over"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`border rounded-3xl p-12 shadow-2xl text-center ${
                winner === "MAFIA" ? "bg-red-950 border-red-800" : "bg-emerald-950 border-emerald-800"
              }`}
            >
              <div className="w-24 h-24 mx-auto mb-8 bg-white/10 rounded-full flex items-center justify-center">
                {winner === "MAFIA" ? <Skull size={64} className="text-red-500" /> : <Users size={64} className="text-emerald-500" />}
              </div>
              
              <h2 className="text-5xl font-black mb-4 text-white">
                {winner === "MAFIA" ? "فازت المافيا!" : "فاز المواطنون!"}
              </h2>
              <p className="text-xl text-zinc-300 mb-12">
                {winner === "MAFIA" ? "لقد سيطرت المافيا على المدينة." : "تم القضاء على جميع أفراد المافيا."}
              </p>

              <button
                onClick={resetGame}
                className="w-full bg-white text-black font-black py-5 rounded-2xl hover:bg-zinc-200 transition-all flex items-center justify-center gap-2"
              >
                <RefreshCcw size={24} /> لعبة جديدة
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
