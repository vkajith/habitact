import React, { useState, useEffect } from 'react';
import HabitTracker from '../components/HabitTracker';
import CreateHabitButton from '../components/CreateHabitButton';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import { QRCodeSVG } from 'qrcode.react';

export default function Home() {
  const [habits, setHabits] = useState([]);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [syncCode, setSyncCode] = useState('');
  const [inputSyncCode, setInputSyncCode] = useState('');
  const [syncError, setSyncError] = useState('');

  useEffect(() => {
    const savedHabits = localStorage.getItem('habits');
    if (savedHabits) {
      setHabits(JSON.parse(savedHabits));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('habits', JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    if (showSyncModal) {
      const syncData = {
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

  const addHabit = (habitName) => {
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
      const decodedData = JSON.parse(atob(inputSyncCode));
      setHabits(decodedData.habits);
      setShowSyncModal(false);
      setInputSyncCode('');
      setSyncError('');
    } catch (error) {
      setSyncError('Invalid sync code. Please try again.');
    }
  };

  return (
    <div className="app">
      <header style={{
        position: 'relative',
        zIndex: 1001
      }}>
        <div className="app-header">
          <AcUnitIcon className="app-icon" />
          <div className="app-title" style={{ fontSize: '1.5rem', fontWeight: '600' }}>HabitAct</div>
          <button 
            className="sync-button"
            onClick={() => setShowSyncModal(true)}
          >
            Sync
          </button>
        </div>
      </header>
      <main>
        <div style={{ fontSize: '2rem', fontWeight: '600', margin: '1rem 0' }}>Habits</div>
        <p className="subtitle">Track your habits every day</p>
        
        <div className="habits-container">
          <>
            {habits.map(habit => (
              <HabitTracker 
                key={habit.id}
                habit={habit}
              />
            ))}
            <CreateHabitButton onAdd={addHabit} />
          </>
        </div>
      </main>

      {showSyncModal && (
        <div 
          className="sync-modal" 
          onClick={() => setShowSyncModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}>
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#1E1E1E",
              padding: '1.5rem',
              borderRadius: '16px',
              width: '90%',
              maxWidth: '360px',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem'
            }}>
            <div style={{ 
              margin: 0, 
              textAlign: 'center', 
              fontSize: '1.5rem',
              fontWeight: '500'
            }}>
              Sync
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{
                  background: '#121212',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.9rem'
                }}>
                  <span style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    marginRight: '0.5rem'
                  }}>{syncCode}</span>
                  <button 
                    onClick={() => navigator.clipboard.writeText(syncCode)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#666',
                      cursor: 'pointer',
                      padding: '4px'
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M16 1H4C2.9 1 2 1.9 2 3V17H4V3H16V1ZM19 5H8C6.9 5 6 5.9 6 7V21C6 22.1 6.9 23 8 23H19C20.1 23 21 22.1 21 21V7C21 5.9 20.1 5 19 5ZM19 21H8V7H19V21Z"/>
                    </svg>
                  </button>
                </div>
                <div style={{ 
                  width: 'min-content',
                  background: 'white',
                  padding: '1rem',
                  borderRadius: '12px',
                  display: 'flex',
                  justifyContent: 'center',
                  marginLeft: 'auto',
                  marginRight: 'auto'
                }}>
                  <QRCodeSVG 
                    value={`${window.location.origin}?sync=${syncCode}`} 
                    size={200} 
                  />
                </div>
              </div>

              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '1rem'
              }}>
                <div style={{ flex: 1, height: '1px', background: '#333' }} />
                <span style={{ color: '#666', fontSize: '0.9rem' }}>OR</span>
                <div style={{ flex: 1, height: '1px', background: '#333' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input
                  type="text"
                  value={inputSyncCode}
                  onChange={(e) => setInputSyncCode(e.target.value)}
                  placeholder="Enter a sync code"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#121212',
                    color: 'white',
                    fontSize: '0.9rem'
                  }}
                />
                <button
                  onClick={handleSyncCodeSubmit}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'white',
                    color: 'black',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: '500'
                  }}
                >
                  Sync!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 