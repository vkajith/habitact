import React, { useState, useEffect } from 'react';
import HabitTracker from '../components/HabitTracker';
import CreateHabitButton from '../components/CreateHabitButton';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import CloudSyncIcon from '@mui/icons-material/CloudSync';
import SyncModal from '../components/SyncModal';
import { useHabits } from '../hooks/useHabits';

export default function Home({ user }: { user?: { user_id: string } }) {
  const { habits, addHabit, updateHabit, loading, userId, setUserId, deleteHabit } = useHabits();
  const [showSyncModal, setShowSyncModal] = useState(false);

  useEffect(() => {
    if (user) {
      setUserId(user.user_id);
    }
  }, [user]);

  useEffect(() => {
    if (showSyncModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showSyncModal]);



  const AppHeader = () => (
    <header style={{ position: 'relative', zIndex: 1001 }}>
      <div className="app-header">
        <AcUnitIcon className="app-icon" />
        <div className="app-title" style={{ fontSize: '1.5rem', fontWeight: '600' }}>
          HabitAct
        </div>
        <button 
          className="sync-button tooltip" 
          onClick={() => setShowSyncModal(true)}
        >
          <CloudSyncIcon className="sync-icon" />
          <span className="tooltiptext">Sync</span>
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
        {loading ? (
          <div className="loader-container">
            <div className="spinner"></div>
            <p>Loading your habits...</p>
          </div>
        ) : (
          <div className="habits-container">
            {habits.map(habit => (
              <HabitTracker key={habit.id} habit={habit} onUpdate={updateHabit} onDelete={deleteHabit}/>
            ))}
            <CreateHabitButton onAdd={addHabit} />
          </div>
        )}
      </main>

      {showSyncModal && (
        <SyncModal
          userId={userId}
          onClose={() => setShowSyncModal(false)}
          onSyncCodeSubmit={setUserId}
        />
      )}
    </div>
  );
}

Home.getInitialProps = async ({ query }: { query: { code: string } }) => {
  const { code } = query;
  let user = undefined;
  if (code) {
    user = JSON.parse(atob(code));
  }
  return { user };
}; 

