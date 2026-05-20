import { useState, useEffect, useRef } from "react";
import { S } from "./components/styles";
import { todayStr, formatDuration } from "./components/utils";
import ProgressBar from "./components/ui/ProgressBar";

// ─── INITIAL WORKOUT ROUTINES ──────────────────────────────────────────────────
const ROUTINES = [
  {
    id: "workout_a",
    name: "Workout A – Chest, Shoulders, Triceps",
    focus: "Pecs, Shoulder Cap, Underarms/Triceps",
    equipment: "15 lb Dumbbells, 15 lb Kettlebells",
    duration: "30-40 min",
    frequency: "3x Per Week",
    muscles: ["Chest", "Shoulders", "Triceps"],
    exercises: [
      {
        id: "a1",
        name: "Dumbbell Floor Press",
        sets: 4,
        reps: "10-15",
        targetMuscle: "Pecs / Triceps",
        instructions: "Lie on the floor, knees bent, feet flat. Hold dumbbells at chest level. Press up until arms are straight. Lower with control.",
        imageUrl: "/the-oar/workouts/floor_press.png",
        videoUrl: "https://www.youtube.com/watch?v=uK7lq3s3bJg"
      },
      {
        id: "a2",
        name: "Standing Shoulder Press",
        sets: 3,
        reps: "10-12",
        targetMuscle: "Shoulder Cap",
        instructions: "Hold dumbbells at shoulder height. Press up overhead until arms are straight. Lower with control.",
        imageUrl: "/the-oar/workouts/shoulder_press.png",
        videoUrl: "https://www.youtube.com/watch?v=B-aVuyhvLHU"
      },
      {
        id: "a3",
        name: "Chest Flys (Floor Flys)",
        sets: 3,
        reps: "12-15",
        targetMuscle: "Pecs",
        instructions: "Lie on floor, dumbbells over chest. Open arms wide with slight bend in elbows. Squeeze chest to bring back up.",
        imageUrl: "/the-oar/workouts/chest_flys.png",
        videoUrl: "https://www.youtube.com/watch?v=ajdFwbK2Gu4"
      },
      {
        id: "a4",
        name: "Lateral Raises",
        sets: 3,
        reps: "12-15",
        targetMuscle: "Shoulder Cap",
        instructions: "Hold dumbbells at sides. Raise arms out to shoulder height. Lower with control.",
        imageUrl: "/the-oar/workouts/lateral_raises.png",
        videoUrl: "https://www.youtube.com/watch?v=3VcKaXtokW8"
      },
      {
        id: "a5",
        name: "Overhead Tricep Extension",
        sets: 4,
        reps: "12-15",
        targetMuscle: "Triceps",
        instructions: "Hold one dumbbell with both hands. Extend arms overhead. Lower behind head, then extend.",
        imageUrl: "/the-oar/workouts/tricep_extension.png",
        videoUrl: "https://www.youtube.com/watch?v=nRiJVZD5a04"
      },
      {
        id: "a6",
        name: "Incline Push-ups",
        sets: 3,
        reps: "AMRAP",
        targetMuscle: "Pecs / Lower Chest",
        instructions: "Place hands on an elevated surface like a bench or sturdy chair. Keep body straight and perform push-ups.",
        imageUrl: "/the-oar/workouts/push_up_incline.png",
        videoUrl: ""
      },
      {
        id: "a7",
        name: "Knee Push-ups",
        sets: 3,
        reps: "AMRAP",
        targetMuscle: "Pecs / Shoulders / Triceps",
        instructions: "Rest on your knees instead of toes. Keep a straight line from knees to head.",
        imageUrl: "/the-oar/workouts/push_up_knee.png",
        videoUrl: ""
      },
      {
        id: "a8",
        name: "Full Push-ups",
        sets: 3,
        reps: "AMRAP",
        targetMuscle: "Pecs / Shoulders / Triceps",
        instructions: "Standard push-ups on toes. Keep core tight and lower until chest is near the floor.",
        imageUrl: "/the-oar/workouts/push_up_full.png",
        videoUrl: "https://www.youtube.com/watch?v=y3ZstA4nO-M"
      }
    ]
  },
  {
    id: "workout_b",
    name: "Workout B – Biceps, Upper Chest, Shoulders",
    focus: "Arms and Upper Body Definition",
    equipment: "15 lb Dumbbells, 15 lb Kettlebells",
    duration: "30-40 min",
    frequency: "3x Per Week",
    muscles: ["Biceps", "Chest", "Shoulders"],
    exercises: [
      {
        id: "b1",
        name: "Hammer Curls",
        sets: 4,
        reps: "10-15",
        targetMuscle: "Biceps / Forearms",
        instructions: "Hold dumbbells with neutral grip. Curl up, keeping palms facing in. Lower with control.",
        imageUrl: "/the-oar/workouts/hammer_curl.png",
        videoUrl: "https://www.youtube.com/watch?v=zC3nLlEvin4"
      },
      {
        id: "b2",
        name: "Standard Bicep Curls",
        sets: 4,
        reps: "12-15",
        targetMuscle: "Biceps",
        instructions: "Hold dumbbells with palms forward. Curl up, squeeze biceps. Lower slowly.",
        imageUrl: "/the-oar/workouts/bicep_curl.png",
        videoUrl: "https://www.youtube.com/watch?v=ykJmrZ5v0Oo"
      },
      {
        id: "b3",
        name: "Arnold Press",
        sets: 3,
        reps: "10-12",
        targetMuscle: "Shoulders",
        instructions: "Start with palms facing you. Press up while rotating palms out. Lower and repeat.",
        imageUrl: "/the-oar/workouts/arnold_press.png",
        videoUrl: "https://www.youtube.com/watch?v=6PG1HPhaj2M"
      },
      {
        id: "b4",
        name: "Upright Rows",
        sets: 3,
        reps: "12",
        targetMuscle: "Shoulders / Traps",
        instructions: "Hold dumbbells in front of thighs. Pull up close to body, elbows high. Lower with control.",
        imageUrl: "/the-oar/workouts/upright_row.png",
        videoUrl: "https://www.youtube.com/watch?v=jaAV-rD45I0"
      },
      {
        id: "b5",
        name: "Front Raises",
        sets: 3,
        reps: "12-15",
        targetMuscle: "Front Shoulders",
        instructions: "Hold dumbbells in front of thighs. Raise to shoulder height. Lower with control.",
        imageUrl: "/the-oar/workouts/front_raise.png",
        videoUrl: "https://www.youtube.com/watch?v=sOwsG8W1Z1Y"
      },
      {
        id: "b6",
        name: "Kettlebell High Pulls",
        sets: 3,
        reps: "15",
        targetMuscle: "Shoulders / Hips / Upper Back",
        instructions: "Hold kettlebell with both hands. Pull up to chest height, elbows high. Lower with control.",
        imageUrl: "/the-oar/workouts/kettlebell_high_pull.png",
        videoUrl: "https://www.youtube.com/watch?v=8lJmB0m2sE0"
      }
    ]
  },
  {
    id: "workout_c",
    name: "Workout C – Legs & Glutes",
    focus: "Quad strength, glute activation, hamstring endurance",
    equipment: "15 lb Dumbbells, 15 lb Kettlebells",
    duration: "30-40 min",
    frequency: "3x Per Week",
    muscles: ["Legs", "Glutes", "Hamstrings"],
    exercises: [
      {
        id: "c1",
        name: "Dumbbell Goblet Squats",
        sets: 4,
        reps: "10-12",
        targetMuscle: "Quads / Glutes",
        instructions: "Hold a dumbbell vertically at your chest. Stand with feet shoulder-width apart. Squat down until thighs are parallel to the floor, keeping your back straight. Drive back up.",
        imageUrl: "/the-oar/workouts/goblet_squat.png",
        videoUrl: "https://www.youtube.com/watch?v=MeIiGibTCIk"
      },
      {
        id: "c2",
        name: "Kettlebell Romanian Deadlifts",
        sets: 4,
        reps: "10-12",
        targetMuscle: "Hamstrings / Glutes",
        instructions: "Stand with feet hip-width apart, holding kettlebell in front. Hinge at your hips, pushing them back while keeping your spine straight and knees slightly bent. Lower kettlebell along shins, then squeeze glutes to stand.",
        imageUrl: "/the-oar/workouts/romanian_deadlift.png",
        videoUrl: "https://www.youtube.com/watch?v=JCX81mPMqDo"
      },
      {
        id: "c3",
        name: "Bulgarian Split Squats",
        sets: 3,
        reps: "10",
        targetMuscle: "Quads / Glutes",
        instructions: "Stand about two feet in front of a bench/chair. Extend one leg back and place the top of your foot on the bench. Lower your hips until your rear knee is near the floor, then press back up.",
        imageUrl: "/the-oar/workouts/bulgarian_split_squat.png",
        videoUrl: "https://www.youtube.com/watch?v=2C-uNgKwPLE"
      },
      {
        id: "c4",
        name: "Calf Raises (Weighted)",
        sets: 3,
        reps: "15",
        targetMuscle: "Calves",
        instructions: "Hold dumbbells at your sides. Stand tall, and raise up onto the balls of your feet. Hold briefly at the top, then slowly lower back down.",
        imageUrl: "/the-oar/workouts/calf_raise.png",
        videoUrl: "https://www.youtube.com/watch?v=-M4-G8p8fmc"
      },
      {
        id: "c5",
        name: "Glute Bridges",
        sets: 3,
        reps: "15",
        targetMuscle: "Glutes / Lower Back",
        instructions: "Lie on your back, knees bent, feet flat. Place a dumbbell or kettlebell on your hips. Drive through your heels to raise your hips until knees, hips, and shoulders align. Squeeze glutes and lower.",
        imageUrl: "/the-oar/workouts/glute_bridge.png",
        videoUrl: "https://www.youtube.com/watch?v=wPM8co451BE"
      }
    ]
  },
  {
    id: "workout_d",
    name: "Workout D – Core & KB Conditioning",
    focus: "Core rigidity, high-energy fat burn, hip drive",
    equipment: "15 lb Kettlebells, 15 lb Dumbbells",
    duration: "25-35 min",
    frequency: "3x Per Week",
    muscles: ["Core", "Abs", "Cardio"],
    exercises: [
      {
        id: "d1",
        name: "Kettlebell Swings",
        sets: 4,
        reps: "15",
        targetMuscle: "Hips / Glutes / Core / Cardio",
        instructions: "Stand with feet wider than shoulder-width, kettlebell on floor in front. Hinge at hips to grab handle. Swing bell back between legs, then snap hips forward forcefully to swing the kettlebell to chest height.",
        imageUrl: "/the-oar/workouts/kettlebell_swing.png",
        videoUrl: "https://www.youtube.com/watch?v=sSESeQ5tUCo"
      },
      {
        id: "d2",
        name: "Weighted Russian Twists",
        sets: 3,
        reps: "20",
        targetMuscle: "Obliques / Abs",
        instructions: "Sit on floor, knees bent. Lean back slightly, lifting feet off the floor if possible. Hold a kettlebell or dumbbell close to chest. Rotate torso to touch weight to floor on each side.",
        imageUrl: "/the-oar/workouts/russian_twist.png",
        videoUrl: "https://www.youtube.com/watch?v=wkD8rjkodUI"
      },
      {
        id: "d3",
        name: "Plank Pull-Throughs",
        sets: 3,
        reps: "12",
        targetMuscle: "Core stability / Shoulders",
        instructions: "Start in a high plank position with a dumbbell on the floor behind one hand. Reach under your body with the opposite hand, grab the weight, and pull it across. Repeat on the other side.",
        imageUrl: "/the-oar/workouts/plank_pull_through.png",
        videoUrl: "https://www.youtube.com/watch?v=EGrP0uO2-w8"
      },
      {
        id: "d4",
        name: "Flutter Kicks",
        sets: 3,
        reps: "45s",
        targetMuscle: "Lower Abs",
        instructions: "Lie flat on your back, hands under glutes. Lift feet 6 inches off the floor. Keep legs straight and flutter them up and down in a small, controlled motion.",
        imageUrl: "/the-oar/workouts/flutter_kick.png",
        videoUrl: "https://www.youtube.com/watch?v=ANVdMDaYRts"
      },
      {
        id: "d5",
        name: "Lying Leg Raises",
        sets: 3,
        reps: "12",
        targetMuscle: "Lower Abs",
        instructions: "Lie flat on your back, legs straight. Keep hands at sides or under glutes. Slowly raise legs until they are vertical, then slowly lower them without letting them touch the floor.",
        imageUrl: "/the-oar/workouts/leg_raise.png",
        videoUrl: "https://www.youtube.com/watch?v=l4kQd9eWclE"
      }
    ]
  }
];

// ─── AUDIO SYNTHESIZER CHIME ────────────────────────────────────────────────────
const playChime = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;
    
    // Tone 1: High frequency chime
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(880, now); // A5
    osc1.frequency.exponentialRampToValueAtTime(1760, now + 0.1); // Ramp up to A6
    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.6);

    // Tone 2: Delayed harmonizing tone
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(1318.51, now + 0.12); // E6
    gain2.gain.setValueAtTime(0, now);
    gain2.gain.setValueAtTime(0.08, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.85);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.85);
  } catch (e) {
    console.warn("Could not play synthesized audio:", e);
  }
};

// ─── MAIN WORKOUTS SCREEN COMPONENT ──────────────────────────────────────────────
export default function WorkoutsScreen({ user, supabase, setSyncLocal, workoutLogs, setWorkoutLogs }) {
  const [subTab, setSubTab] = useState("library"); // library | active | history
  const [activeWorkout, setActiveWorkout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSessionTime, setActiveSessionTime] = useState(0);
  const timerIntervalRef = useRef(null);

  // Expanded exercise state in Library view
  const [expandedExerciseId, setExpandedExerciseId] = useState(null);

  // Dynamic Custom Routine Builder States
  const [customRoutines, setCustomRoutines] = useState(() => {
    const saved = localStorage.getItem(`custom_routines_${user?.id || 'default'}`);
    return saved ? JSON.parse(saved) : [];
  });
  const [showBuilder, setShowBuilder] = useState(false);
  const [newRoutineName, setNewRoutineName] = useState("");
  const [newRoutineFocus, setNewRoutineFocus] = useState("");
  const [newRoutineMuscles, setNewRoutineMuscles] = useState("");
  const [newRoutineEquipment, setNewRoutineEquipment] = useState("15 lb Dumbbells, 15 lb Kettlebells");
  const [newRoutineExercises, setNewRoutineExercises] = useState([
    { name: "", sets: 3, reps: "12", targetMuscle: "", instructions: "", videoUrl: "" }
  ]);

  // Active workout logging states
  const [loggedWorkout, setLoggedWorkout] = useState(null); // structure: { routineId, name, date, exercises: { [exId]: [setsData] } }
  
  // Rest Timer overlay states
  const [restTimer, setRestTimer] = useState(null); // { secondsLeft, initial, currentExerciseName, nextExerciseName }
  const restIntervalRef = useRef(null);

  // Sync custom routines with LocalStorage
  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(`custom_routines_${user.id}`, JSON.stringify(customRoutines));
    }
  }, [customRoutines, user?.id]);

  // Load workout logs on mount or auth change
  useEffect(() => {
    if (user?.id) {
      fetchWorkoutLogs();
    }
    return () => {
      stopActiveTimer();
      stopRestTimer();
    };
  }, [user?.id]);

  // Run live timer for active workout
  useEffect(() => {
    if (subTab === "active" && activeWorkout) {
      setActiveSessionTime(0);
      timerIntervalRef.current = setInterval(() => {
        setActiveSessionTime((t) => t + 1);
      }, 1000);
    } else {
      stopActiveTimer();
    }
  }, [subTab, activeWorkout]);

  const stopActiveTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  const stopRestTimer = () => {
    if (restIntervalRef.current) {
      clearInterval(restIntervalRef.current);
      restIntervalRef.current = null;
    }
  };

  // REST TIMER IMPLEMENTATION
  const triggerRestTimer = (seconds, curEx, nextEx) => {
    stopRestTimer();
    setRestTimer({
      secondsLeft: seconds,
      initial: seconds,
      currentExerciseName: curEx,
      nextExerciseName: nextEx
    });

    restIntervalRef.current = setInterval(() => {
      setRestTimer((prev) => {
        if (!prev) return null;
        if (prev.secondsLeft <= 1) {
          stopRestTimer();
          playChime();
          return null;
        }
        return {
          ...prev,
          secondsLeft: prev.secondsLeft - 1
        };
      });
    }, 1000);
  };

  // DATABASE LAYER
  const fetchWorkoutLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("workout_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      if (error) throw error;
      setSyncLocal(false);
      setWorkoutLogs(data || []);
    } catch (e) {
      console.warn("[Workouts] Supabase fetch failed, falling back to localStorage:", e);
      setSyncLocal(true);
      const local = localStorage.getItem(`workouts_${user.id}`);
      setWorkoutLogs(local ? JSON.parse(local) : []);
    } finally {
      setLoading(false);
    }
  };

  const addWorkoutLog = async (logData) => {
    try {
      const { data, error } = await supabase
        .from("workout_logs")
        .insert({
          id: logData.id,
          user_id: user.id,
          date: logData.date,
          workout_name: logData.workout_name,
          duration: logData.duration,
          total_volume: logData.total_volume,
          exercises: logData.exercises,
        })
        .select()
        .single();

      if (error) throw error;
      setSyncLocal(false);
      setWorkoutLogs((prev) => [data, ...prev]);
    } catch (e) {
      console.warn("[Workouts] Supabase save failed, writing locally to localStorage:", e);
      setSyncLocal(true);
      const local = localStorage.getItem(`workouts_${user.id}`);
      const logs = local ? JSON.parse(local) : [];
      const updated = [logData, ...logs];
      localStorage.setItem(`workouts_${user.id}`, JSON.stringify(updated));
      setWorkoutLogs(updated);
    }
  };

  const deleteLog = async (logId) => {
    try {
      const { error } = await supabase.from("workout_logs").delete().eq("id", logId);
      if (error) throw error;
      setSyncLocal(false);
      setWorkoutLogs((prev) => prev.filter((l) => l.id !== logId));
    } catch (e) {
      console.warn("[Workouts] Supabase delete failed, removing from localStorage:", e);
      setSyncLocal(true);
      const local = localStorage.getItem(`workouts_${user.id}`);
      if (local) {
        const logs = JSON.parse(local);
        const filtered = logs.filter((l) => l.id !== logId);
        localStorage.setItem(`workouts_${user.id}`, JSON.stringify(filtered));
        setWorkoutLogs(filtered);
      }
    }
  };

  // ACTIVE LOGGING LOGIC
  const startWorkoutSession = (routine) => {
    // Build initial log object
    const initialLog = {
      id: Date.now(),
      workout_name: routine.name,
      date: todayStr(),
      routineId: routine.id,
      exercises: routine.exercises.map((ex) => ({
        id: ex.id || String(Math.random()),
        name: ex.name,
        targetMuscle: ex.targetMuscle,
        sets: Array.from({ length: parseInt(ex.sets, 10) || 3 }, (_, i) => ({
          setNum: i + 1,
          weight: 15, // default
          reps: ex.reps === "AMRAP" ? 10 : parseInt(String(ex.reps).split("-")[1]) || parseInt(ex.reps, 10) || 12, // default reps
          completed: false
        }))
      }))
    };
    
    setLoggedWorkout(initialLog);
    setActiveWorkout(routine);
    setSubTab("active");
  };

  const handleSetFieldChange = (exId, setIdx, field, val) => {
    setLoggedWorkout((prev) => {
      const updatedEx = prev.exercises.map((ex) => {
        if (ex.id !== exId) return ex;
        const updatedSets = ex.sets.map((set, sIdx) => {
          if (sIdx !== setIdx) return set;
          return { ...set, [field]: val };
        });
        return { ...ex, sets: updatedSets };
      });
      return { ...prev, exercises: updatedEx };
    });
  };

  const toggleSetComplete = (exIdx, setIdx) => {
    const ex = loggedWorkout.exercises[exIdx];
    const set = ex.sets[setIdx];
    const isNowCompleted = !set.completed;

    // Toggle status
    setLoggedWorkout((prev) => {
      const updatedEx = prev.exercises.map((e, eIdx) => {
        if (eIdx !== exIdx) return e;
        const updatedSets = e.sets.map((s, sIdx) => {
          if (sIdx !== setIdx) return s;
          return { ...s, completed: isNowCompleted };
        });
        return { ...e, sets: updatedSets };
      });
      return { ...prev, exercises: updatedEx };
    });

    // If marked completed, trigger rest timer
    if (isNowCompleted) {
      const nextExName = getNextSetInfo(exIdx, setIdx);
      triggerRestTimer(45, ex.name, nextExName);
    }
  };

  const getNextSetInfo = (exIdx, setIdx) => {
    const currentEx = loggedWorkout.exercises[exIdx];
    // Check if there is a next set in current exercise
    if (setIdx + 1 < currentEx.sets.length) {
      return `${currentEx.name} (Set ${setIdx + 2})`;
    }
    // Check if there is a next exercise
    if (exIdx + 1 < loggedWorkout.exercises.length) {
      const nextEx = loggedWorkout.exercises[exIdx + 1];
      return `${nextEx.name} (Set 1)`;
    }
    return "All exercises done! Complete your workout.";
  };

  const finishWorkoutSession = async () => {
    stopActiveTimer();
    stopRestTimer();
    setRestTimer(null);

    // Compute total volume
    let totalVol = 0;
    loggedWorkout.exercises.forEach((ex) => {
      ex.sets.forEach((set) => {
        if (set.completed) {
          totalVol += (parseInt(set.weight, 10) || 0) * (parseInt(set.reps, 10) || 0);
        }
      });
    });

    const finishedLog = {
      id: loggedWorkout.id,
      date: todayStr(),
      workout_name: loggedWorkout.workout_name,
      duration: activeSessionTime,
      total_volume: totalVol,
      exercises: loggedWorkout.exercises
    };

    await addWorkoutLog(finishedLog);
    setActiveWorkout(null);
    setLoggedWorkout(null);
    setSubTab("history");
  };

  const cancelWorkoutSession = () => {
    if (window.confirm("Are you sure you want to cancel this workout? Data will not be saved.")) {
      stopActiveTimer();
      stopRestTimer();
      setRestTimer(null);
      setActiveWorkout(null);
      setLoggedWorkout(null);
      setSubTab("library");
    }
  };

  // DYNAMIC CUSTOM ROUTINE BUILDER FUNCTIONS
  const handleAddExerciseToNewRoutine = () => {
    setNewRoutineExercises((prev) => [
      ...prev,
      { name: "", sets: 3, reps: "12", targetMuscle: "", instructions: "", videoUrl: "" }
    ]);
  };

  const handleRemoveExerciseFromNewRoutine = (idx) => {
    if (newRoutineExercises.length <= 1) return;
    setNewRoutineExercises((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleNewExerciseFieldChange = (idx, field, val) => {
    setNewRoutineExercises((prev) =>
      prev.map((ex, i) => (i === idx ? { ...ex, [field]: val } : ex))
    );
  };

  const handleSaveCustomRoutine = () => {
    if (!newRoutineName.trim()) {
      alert("Please enter a routine name.");
      return;
    }
    const emptyEx = newRoutineExercises.some((e) => !e.name.trim());
    if (emptyEx) {
      alert("Please enter a name for all exercises.");
      return;
    }

    const newRoutine = {
      id: `custom_${Date.now()}`,
      name: `Custom – ${newRoutineName}`,
      focus: newRoutineFocus || "Custom workout routine",
      equipment: newRoutineEquipment,
      duration: "30-40 min",
      frequency: "As scheduled",
      muscles: newRoutineMuscles ? newRoutineMuscles.split(",").map((s) => s.trim()) : ["Custom"],
      exercises: newRoutineExercises.map((ex, i) => ({
        id: `c_ex_${Date.now()}_${i}`,
        name: ex.name,
        sets: parseInt(ex.sets, 10) || 3,
        reps: String(ex.reps) || "12",
        targetMuscle: ex.targetMuscle || "Full Body",
        instructions: ex.instructions || "Perform repetitions with controlled form.",
        videoUrl: ex.videoUrl || null
      }))
    };

    setCustomRoutines((prev) => [...prev, newRoutine]);
    
    // Reset builder states
    setNewRoutineName("");
    setNewRoutineFocus("");
    setNewRoutineMuscles("");
    setNewRoutineExercises([{ name: "", sets: 3, reps: "12", targetMuscle: "", instructions: "", videoUrl: "" }]);
    setShowBuilder(false);
  };

  const handleDeleteCustomRoutine = (routineId, e) => {
    e.stopPropagation(); // Avoid triggering details expansion
    if (window.confirm("Are you sure you want to delete this custom workout routine?")) {
      setCustomRoutines((prev) => prev.filter((r) => r.id !== routineId));
    }
  };

  // FORMAT ACTIVE TIMER TEXT
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  // Merge static and custom routines
  const allRoutines = [...ROUTINES, ...customRoutines];

  return (
    <>
      {/* ─── REST TIMER OVERLAY ─── */}
      {restTimer && (
        <div style={S.timerOverlay}>
          <div style={S.timerCircle}>
            <div style={S.timerVal}>{restTimer.secondsLeft}s</div>
            <div style={S.timerSub}>REST</div>
          </div>
          <div style={S.timerExercise}>Ticked: {restTimer.currentExerciseName}</div>
          <div style={S.timerNext}>Up next: {restTimer.nextExerciseName}</div>

          <div style={S.timerBtnRow}>
            <button
              style={S.timerBtn}
              onClick={() =>
                setRestTimer((p) => ({ ...p, secondsLeft: p.secondsLeft + 10 }))
              }
            >
              +10s
            </button>
            <button
              style={S.timerBtn}
              disabled={restTimer.secondsLeft <= 10}
              onClick={() =>
                setRestTimer((p) => ({
                  ...p,
                  secondsLeft: Math.max(0, p.secondsLeft - 10)
                }))
              }
            >
              -10s
            </button>
            <button
              style={{ ...S.timerBtn, ...S.timerBtnSkip }}
              onClick={() => {
                stopRestTimer();
                setRestTimer(null);
              }}
            >
              SKIP
            </button>
          </div>
        </div>
      )}

      {/* ─── CUSTOM ROUTINE BUILDER OVERLAY MODAL ─── */}
      {showBuilder && (
        <div style={S.modalOverlay}>
          <div style={{ ...S.modal, maxWidth: 410 }}>
            <div style={{ ...S.modalTitle, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>➕ CREATE CUSTOM ROUTINE</span>
              <button 
                style={{ background: "none", border: "none", color: "#64748b", fontSize: "1.2rem", cursor: "pointer" }}
                onClick={() => setShowBuilder(false)}
              >
                ✕
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={S.inputLabel}>Routine Name</label>
                <input
                  style={S.input}
                  placeholder="e.g., Legs & Core Blaster"
                  value={newRoutineName}
                  onChange={(e) => setNewRoutineName(e.target.value)}
                />
              </div>

              <div>
                <label style={S.inputLabel}>Workout Focus</label>
                <input
                  style={S.input}
                  placeholder="e.g., Strength & Abs conditioning"
                  value={newRoutineFocus}
                  onChange={(e) => setNewRoutineFocus(e.target.value)}
                />
              </div>

              <div style={S.twoCol}>
                <div style={{ flex: 1 }}>
                  <label style={S.inputLabel}>Target Muscles (comma separated)</label>
                  <input
                    style={S.input}
                    placeholder="e.g., Legs, Core, Calves"
                    value={newRoutineMuscles}
                    onChange={(e) => setNewRoutineMuscles(e.target.value)}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={S.inputLabel}>Equipment Used</label>
                  <input
                    style={S.input}
                    placeholder="e.g., 15 lb Dumbbell"
                    value={newRoutineEquipment}
                    onChange={(e) => setNewRoutineEquipment(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ borderTop: "1px solid #252530", paddingTop: 12, marginTop: 4 }}>
                <span style={{ ...S.inputLabel, fontSize: "0.85rem", marginBottom: 10, display: "block" }}>
                  EXERCISES ({newRoutineExercises.length})
                </span>

                <div style={{ display: "flex", flexDirection: "column", gap: 14, maxHeight: "30vh", overflowY: "auto", paddingRight: 4 }}>
                  {newRoutineExercises.map((ex, idx) => (
                    <div 
                      key={idx} 
                      style={{ 
                        background: "#0d0d10", 
                        border: "1px solid #252530", 
                        borderRadius: 8, 
                        padding: 10,
                        position: "relative" 
                      }}
                    >
                      {newRoutineExercises.length > 1 && (
                        <button
                          style={{
                            position: "absolute",
                            top: 6,
                            right: 8,
                            background: "none",
                            border: "none",
                            color: "#ef4444",
                            fontSize: "0.8rem",
                            cursor: "pointer",
                            fontWeight: 700
                          }}
                          onClick={() => handleRemoveExerciseFromNewRoutine(idx)}
                        >
                          Remove
                        </button>
                      )}

                      <div style={{ marginBottom: 8, width: "85%" }}>
                        <input
                          style={{ ...S.input, padding: "8px 10px", fontSize: "0.9rem" }}
                          placeholder={`Exercise ${idx + 1} Name`}
                          value={ex.name}
                          onChange={(e) => handleNewExerciseFieldChange(idx, "name", e.target.value)}
                        />
                      </div>

                      <div style={{ ...S.twoCol, marginBottom: 8 }}>
                        <div style={{ flex: 1 }}>
                          <input
                            style={{ ...S.input, padding: "8px 10px", fontSize: "0.85rem" }}
                            type="number"
                            placeholder="Sets (e.g. 3)"
                            value={ex.sets}
                            onChange={(e) => handleNewExerciseFieldChange(idx, "sets", e.target.value)}
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <input
                            style={{ ...S.input, padding: "8px 10px", fontSize: "0.85rem" }}
                            placeholder="Reps (e.g. 12 or AMRAP)"
                            value={ex.reps}
                            onChange={(e) => handleNewExerciseFieldChange(idx, "reps", e.target.value)}
                          />
                        </div>
                      </div>

                      <div style={{ ...S.twoCol, marginBottom: 8 }}>
                        <div style={{ flex: 1 }}>
                          <input
                            style={{ ...S.input, padding: "8px 10px", fontSize: "0.85rem" }}
                            placeholder="Target Muscle"
                            value={ex.targetMuscle}
                            onChange={(e) => handleNewExerciseFieldChange(idx, "targetMuscle", e.target.value)}
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <input
                            style={{ ...S.input, padding: "8px 10px", fontSize: "0.85rem" }}
                            placeholder="YouTube Tutorial URL"
                            value={ex.videoUrl}
                            onChange={(e) => handleNewExerciseFieldChange(idx, "videoUrl", e.target.value)}
                          />
                        </div>
                      </div>

                      <div>
                        <textarea
                          style={{ 
                            ...S.input, 
                            padding: "8px 10px", 
                            fontSize: "0.85rem", 
                            resize: "none", 
                            height: 50,
                            fontFamily: "inherit"
                          }}
                          placeholder="Short how-to instructions..."
                          value={ex.instructions}
                          onChange={(e) => handleNewExerciseFieldChange(idx, "instructions", e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  style={{ 
                    background: "transparent", 
                    border: "1px dashed #38bdf8", 
                    borderRadius: 8, 
                    padding: "10px", 
                    color: "#38bdf8", 
                    fontSize: "0.8rem", 
                    fontWeight: 700, 
                    cursor: "pointer",
                    width: "100%",
                    marginTop: 10
                  }}
                  onClick={handleAddExerciseToNewRoutine}
                >
                  ➕ Add Another Exercise
                </button>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button
                style={{ ...S.btn, flex: 1, margin: 0, background: "#1e293b", border: "1px solid #475569" }}
                onClick={() => setShowBuilder(false)}
              >
                Cancel
              </button>
              <button
                style={{ ...S.btn, ...S.btnSuccess, flex: 1, margin: 0 }}
                onClick={handleSaveCustomRoutine}
              >
                Save Routine
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── WORKOUT MODULE SCREEN ─── */}
      <div style={S.screen}>
        {subTab !== "active" && (
          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            <button
              style={{
                ...S.toggleBtn,
                flex: 1,
                padding: "10px",
                borderColor: subTab === "library" ? "#38bdf8" : "#334155",
                color: subTab === "library" ? "#f1f5f9" : "#64748b",
                background: subTab === "library" ? "#07598533" : "none"
              }}
              onClick={() => setSubTab("library")}
            >
              🏋️ LIBRARY
            </button>
            <button
              style={{
                ...S.toggleBtn,
                flex: 1,
                padding: "10px",
                borderColor: subTab === "history" ? "#38bdf8" : "#334155",
                color: subTab === "history" ? "#f1f5f9" : "#64748b",
                background: subTab === "history" ? "#07598533" : "none"
              }}
              onClick={() => setSubTab("history")}
            >
              📊 HISTORY
            </button>
          </div>
        )}

        {/* ─── VIEW 1: ROUTINES LIBRARY ─── */}
        {subTab === "library" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ ...S.sectionTitle, margin: 0 }}>ROUTINES DEFINED</div>
              <button
                style={{
                  background: "#07598533",
                  border: "1px solid #0284c7",
                  borderRadius: 8,
                  padding: "6px 12px",
                  color: "#38bdf8",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "inherit"
                }}
                onClick={() => setShowBuilder(true)}
              >
                ➕ Custom Workout
              </button>
            </div>

            {allRoutines.map((routine) => (
              <div key={routine.id} style={S.routineCard}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ ...S.cardLabel, fontSize: "1.1rem" }}>{routine.name}</div>
                    <div style={{ ...S.cardSub, fontSize: "0.8rem", color: "#38bdf8", fontWeight: 600, marginTop: 4 }}>
                      🎯 Focus: {routine.focus}
                    </div>
                  </div>
                  {routine.id.startsWith("custom_") && (
                    <button
                      style={{
                        background: "none",
                        border: "none",
                        color: "#ef4444",
                        fontSize: "0.75rem",
                        cursor: "pointer",
                        fontWeight: 700,
                        padding: "2px 6px"
                      }}
                      onClick={(e) => handleDeleteCustomRoutine(routine.id, e)}
                    >
                      Delete
                    </button>
                  )}
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {routine.muscles.map((m) => (
                    <span key={m} style={S.muscleBadge}>
                      {m}
                    </span>
                  ))}
                  <span style={S.muscleBadge}>{routine.duration}</span>
                  <span style={S.muscleBadge}>{routine.frequency}</span>
                </div>

                <div style={{ borderTop: "1px solid #1e1e24", paddingTop: 10, marginTop: 4 }}>
                  <div style={{ ...S.inputLabel, fontSize: "0.75rem", marginBottom: 6 }}>
                    EXERCISES ({routine.exercises.length}) <span style={{ fontSize: "0.65rem", color: "#64748b", fontWeight: 400 }}>(Tap one to expand instructional guide)</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {routine.exercises.map((ex, i) => {
                      const isExpanded = expandedExerciseId === `${routine.id}_${ex.id}`;
                      return (
                        <div
                          key={ex.id}
                          style={{
                            background: isExpanded ? "#131317" : "transparent",
                            border: isExpanded ? "1px solid #252530" : "1px solid transparent",
                            borderRadius: 8,
                            padding: isExpanded ? "10px" : "2px 0",
                            transition: "all 0.2s ease"
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              fontSize: "0.85rem",
                              color: "#94a3b8",
                              cursor: "pointer",
                              fontWeight: isExpanded ? 700 : 400
                            }}
                            onClick={() => setExpandedExerciseId(isExpanded ? null : `${routine.id}_${ex.id}`)}
                          >
                            <span>
                              {i + 1}. {ex.name} {isExpanded ? "▾" : "▸"}
                            </span>
                            <span style={{ color: "#38bdf8", fontWeight: 600 }}>
                              {ex.sets} sets x {ex.reps} reps
                            </span>
                          </div>

                          {isExpanded && (
                            <div style={{ marginTop: 8, fontSize: "0.8rem", color: "#64748b", lineHeight: 1.4, borderTop: "1px solid #1e1e24", paddingTop: 8 }}>
                              <div style={{ fontWeight: 600, color: "#94a3b8", marginBottom: 4 }}>💡 How to do it:</div>
                              <div>{ex.instructions}</div>
                              {ex.imageUrl && (
                                <img
                                  src={ex.imageUrl}
                                  style={{
                                    width: "100%",
                                    borderRadius: 8,
                                    marginTop: 8,
                                    border: "1px solid #252530"
                                  }}
                                  alt={ex.name}
                                />
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button
                  style={{ ...S.btn, marginTop: 12 }}
                  onClick={() => startWorkoutSession(routine)}
                >
                  START WORKOUT
                </button>
              </div>
            ))}

            <div style={{ ...S.cardSub, textAlign: "center", marginTop: 24, opacity: 0.6 }}>
              ✨ Perform your workouts with controlled form. Rest 45-60 seconds between sets to optimize recovery!
            </div>
          </div>
        )}

        {/* ─── VIEW 2: ACTIVE WORKOUT TRACKER ─── */}
        {subTab === "active" && activeWorkout && loggedWorkout && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #252530", paddingBottom: 10, marginBottom: 12 }}>
              <div>
                <span style={{ ...S.logo, fontSize: "1.1rem" }}>ACTIVE WORKOUT</span>
                <div style={{ fontSize: "0.8rem", color: "#38bdf8", fontWeight: 700 }}>
                  {activeWorkout.name}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: "1.4rem", fontWeight: 700, color: "#f59e0b", fontFamily: "monospace" }}>
                  {formatTime(activeSessionTime)}
                </span>
                <div style={{ fontSize: "0.65rem", color: "#64748b", fontWeight: 700 }}>
                  ELAPSED TIME
                </div>
              </div>
            </div>

            {loggedWorkout.exercises.map((ex, exIdx) => (
              <div key={ex.id} style={S.exerciseCard}>
                <div style={S.exerciseHeader}>
                  <div>
                    <div style={S.exerciseName}>{ex.name}</div>
                    <span style={{ ...S.muscleBadge, fontSize: "0.65rem", padding: "1px 6px", marginTop: 4 }}>
                      {ex.targetMuscle}
                    </span>
                  </div>
                  <div style={S.exerciseTarget}>
                    {activeWorkout.exercises[exIdx].sets} sets x {activeWorkout.exercises[exIdx].reps}
                  </div>
                </div>

                <div style={S.exerciseDesc}>
                  <div style={{ fontWeight: 600, color: "#94a3b8", marginBottom: 4 }}>How to:</div>
                  <div>{activeWorkout.exercises[exIdx].instructions}</div>
                  
                  {activeWorkout.exercises[exIdx].imageUrl && (
                    <img
                      src={activeWorkout.exercises[exIdx].imageUrl}
                      style={{
                        width: "100%",
                        borderRadius: 8,
                        marginTop: 8,
                        border: "1px solid #252530"
                      }}
                      alt={ex.name}
                    />
                  )}
                </div>

                {/* Sets Table */}
                <div style={S.setHeader}>
                  <span>Set</span>
                  <span>Lbs</span>
                  <span>Reps</span>
                  <span>Done</span>
                </div>

                {ex.sets.map((set, setIdx) => (
                  <div key={setIdx} style={S.setRow}>
                    <span style={S.setIndex}>{set.setNum}</span>
                    <input
                      style={S.setInput}
                      type="number"
                      inputMode="numeric"
                      value={set.weight}
                      onChange={(e) =>
                        handleSetFieldChange(ex.id, setIdx, "weight", parseInt(e.target.value, 10) || 0)
                      }
                    />
                    <input
                      style={S.setInput}
                      type="number"
                      inputMode="numeric"
                      value={set.reps}
                      onChange={(e) =>
                        handleSetFieldChange(ex.id, setIdx, "reps", parseInt(e.target.value, 10) || 0)
                      }
                    />
                    <div
                      style={{
                        ...S.setCheckCircle,
                        ...(set.completed ? S.setCheckCircleActive : {})
                      }}
                      onClick={() => toggleSetComplete(exIdx, setIdx)}
                    >
                      {set.completed && <span style={S.checkMark}>✓</span>}
                    </div>
                  </div>
                ))}
              </div>
            ))}

            <div style={{ marginTop: 20 }}>
              <button
                style={{ ...S.btn, ...S.btnSuccess }}
                onClick={finishWorkoutSession}
              >
                FINISH WORKOUT
              </button>
              <button
                style={{ ...S.btn, background: "#1e293b", border: "1px solid #475569", marginTop: 8 }}
                onClick={cancelWorkoutSession}
              >
                CANCEL WORKOUT
              </button>
            </div>
          </div>
        )}

        {/* ─── VIEW 3: WORKOUT HISTORY ─── */}
        {subTab === "history" && (
          <div>
            <div style={S.sectionTitle}>WORKOUT LOG HISTORY</div>
            {loading ? (
              <div style={{ ...S.cardSub, textAlign: "center", padding: 24 }}>Loading history...</div>
            ) : workoutLogs.length === 0 ? (
              <div style={S.card}>
                <div style={{ ...S.bigNumDim, fontSize: "1.2rem", padding: 24 }}>NO WORKOUTS RECORDED YET</div>
                <div style={{ ...S.cardSub, textAlign: "center" }}>
                  Head to the Library tab and tap Start Workout to log your first upper body routine!
                </div>
              </div>
            ) : (
              workoutLogs.map((log) => (
                <div key={log.id} style={S.routineCard}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ ...S.listMain, fontSize: "1rem" }}>{log.workout_name}</div>
                      <div style={{ ...S.listSub, fontSize: "0.8rem", color: "#64748b" }}>
                        🗓 {log.date} · ⏱ {formatTime(log.duration)} active
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ ...S.volumeDisplay }}>
                        🔥 {log.total_volume.toLocaleString()} lbs
                      </span>
                      <div style={{ fontSize: "0.65rem", color: "#64748b", fontWeight: 700 }}>
                        VOLUME
                      </div>
                    </div>
                  </div>

                  {/* Summary of Exercises completed */}
                  <div
                    style={{
                      background: "#09090b",
                      borderRadius: 8,
                      padding: "8px 10px",
                      fontSize: "0.8rem",
                      color: "#94a3b8",
                      marginTop: 4
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: "0.7rem", color: "#475569", marginBottom: 4 }}>
                      EXERCISES LOGGED
                    </div>
                    {log.exercises &&
                      log.exercises.map((ex) => {
                        const completedSets = ex.sets.filter((s) => s.completed);
                        if (completedSets.length === 0) return null;
                        return (
                          <div
                            key={ex.id}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              marginBottom: 2
                            }}
                          >
                            <span>• {ex.name}</span>
                            <span style={{ color: "#38bdf8", fontWeight: 600 }}>
                              {completedSets.length} sets completed
                            </span>
                          </div>
                        );
                      })}
                  </div>

                  <button
                    style={{
                      ...S.btn,
                      ...S.btnDanger,
                      padding: "8px 12px",
                      fontSize: "0.75rem",
                      marginTop: 6,
                      width: "auto",
                      alignSelf: "flex-end"
                    }}
                    onClick={() => {
                      if (window.confirm("Are you sure you want to delete this workout log?")) {
                        deleteLog(log.id);
                      }
                    }}
                  >
                    Delete Entry
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </>
  );
}
