import React, { useState } from 'react';

interface CreateHabitButtonProps {
  onAdd: (habitName: string) => void;
}

const CreateHabitButton: React.FC<CreateHabitButtonProps> = ({ onAdd }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [habitName, setHabitName] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
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
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHabitName(e.target.value)}
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