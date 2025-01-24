import React, { useState } from 'react';
import './App.css';
import HabitTracker from './components/HabitTracker';
import CreateHabitButton from './components/CreateHabitButton';

function App() {
  const [habits, setHabits] = useState([
    { id: 1, name: 'No YouTube', data: Array(365).fill(false) },
    { id: 2, name: 'Daily Math', data: Array(365).fill(false) }
  ]);

  const addHabit = (habitName) => {
    setHabits([
      ...habits,
      {
        id: habits.length + 1,
        name: habitName,
        data: Array(365).fill(false)
      }
    ]);
  };

  return (
    <div className="app">
      <header>
        <div className="app-header">
          <span className="app-icon">📋</span>
          habits
          <button className="sync-button">Sync</button>
        </div>
      </header>
      <main>
        <h1>habits</h1>
        <p className="subtitle">Track your habits every day</p>
        
        <div className="habits-container">
          {habits.map(habit => (
            <HabitTracker 
              key={habit.id}
              habit={habit}
            />
          ))}
          <CreateHabitButton onAdd={addHabit} />
        </div>
      </main>
    </div>
  );
}

export default App; 