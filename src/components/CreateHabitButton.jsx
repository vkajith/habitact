import React, { useState } from 'react';

const CreateHabitButton = ({ onAdd }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [habitName, setHabitName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (habitName.trim()) {
      onAdd(habitName);
      setHabitName('');
      setIsCreating(false);
    }
  };

  return (
    <div className="create-habit">
      {isCreating ? (
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={habitName}
            onChange={(e) => setHabitName(e.target.value)}
            placeholder="Habit name"
            autoFocus
          />
          <button type="submit">Add</button>
          <button type="button" onClick={() => setIsCreating(false)}>Cancel</button>
        </form>
      ) : (
        <button 
          className="create-button"
          onClick={() => setIsCreating(true)}
        >
          + Create
        </button>
      )}
    </div>
  );
};

export default CreateHabitButton; 