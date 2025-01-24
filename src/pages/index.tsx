import React, { useState, useEffect } from 'react';
import HabitTracker from '../components/HabitTracker';
import CreateHabitButton from '../components/CreateHabitButton';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import SyncModal from '../components/SyncModal';

interface Habit {
  id: number;
  name: string;
  data: boolean[];
}

interface SyncData {
  habits: Habit[];
  lastSync: string;
}

export default function Home() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [syncCode, setSyncCode] = useState('');
  const [inputSyncCode, setInputSyncCode] = useState('');
  const [syncError, setSyncError] = useState('');

  useEffect(() => {
    const savedHabits = localStorage.getItem('habits');
    setHabits(savedHabits ? JSON.parse(savedHabits) : []);
  }, []);

  useEffect(() => {
    localStorage.setItem('habits', JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    if (showSyncModal) {
      const syncData: SyncData = {
        habits: habits,
        lastSync: new Date().toISOString()
      };
      const code = btoa(JSON.stringify(syncData));
      setSyncCode(code);
    }
  }, [showSyncModal, habits]);

  useEffect(() => {
    if (showSyncModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to restore scrolling when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showSyncModal]);

  const addHabit = (habitName: string) => {
    setHabits([
      ...habits,
      {
        id: Date.now(),
        name: habitName,
        data: []
      }
    ]);
  };

  const handleSyncCodeSubmit = () => {
    try {
      const decodedData = JSON.parse(atob(inputSyncCode)) as SyncData;
      if (!decodedData?.habits || !Array.isArray(decodedData.habits)) {
        throw new Error('Invalid data format');
      }
      setHabits(decodedData.habits);
      setShowSyncModal(false);
      setInputSyncCode('');
      setSyncError('');
    } catch (error: unknown) {
      if (error instanceof Error) {
        setSyncError(error.message);
      } else {
        setSyncError('Invalid sync code. Please try again.');
      }
    }
  };

  // Extracted header component
  const AppHeader = () => (
    <header style={{ position: 'relative', zIndex: 1001 }}>
      <div className="app-header">
        <AcUnitIcon className="app-icon" />
        <div className="app-title" style={{ fontSize: '1.5rem', fontWeight: '600' }}>
          HabitAct
        </div>
        <button className="sync-button" onClick={() => setShowSyncModal(true)}>
          Sync
        </button>
      </div>
    </header>
  );

  return (
    <div className="app">
      <AppHeader />
      <main>
        <h1 style={{ fontSize: '2rem', fontWeight: '600', margin: '1rem 0' }}>
          Habits
        </h1>
        <p className="subtitle">Track your habits every day</p>
        
        <div className="habits-container">
          {habits.map(habit => (
            <HabitTracker key={habit.id} habit={habit} />
          ))}
          <CreateHabitButton onAdd={addHabit} />
        </div>
      </main>

      {showSyncModal && (
        <SyncModal
          syncCode={syncCode}
          inputSyncCode={inputSyncCode}
          syncError={syncError}
          onClose={() => setShowSyncModal(false)}
          onSyncCodeSubmit={handleSyncCodeSubmit}
          onInputChange={(e) => setInputSyncCode(e.target.value)}
        />
      )}
    </div>
  );
} 