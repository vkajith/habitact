import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient'; // You'll need to create this
import { v4 as uuidv4 } from 'uuid';

interface Habit {
  id: number;
  name: string;
  completed_dates: string[];
  user_id: string; // Added for Supabase
  created_at?: string; // Added for Supabase
}

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string>();

  useEffect(() => {
    const fetchHabits = async () => {
        setLoading(true);
        try {
          const { data, error } = await supabase
            .from('habits')
            .select('*')
            .eq('user_id', userId);
  
          if (error) throw error;
          setHabits(data || []);
        } catch (error) {
          console.error('Error fetching habits:', error);
        } finally {
          setLoading(false);
        }
      };
      if(userId) {
        fetchHabits();
        if(typeof window != 'undefined'){
            localStorage.setItem('userId', userId);
        }
      }
  }, [userId]);


  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    if(userId) {
      setUserId(userId);
    }


  }, []);

  const deleteHabit  = async (habit: Habit) => {
    if (!userId || habits.length === 0) return;

    try {
      const { error } = await supabase
        .from('habits')
        .delete()
        .eq('id', habit.id)
        .eq('user_id', userId);

      if (error) throw error;
      setHabits(habits.filter(h => h.id !== habit.id));
    } catch (error) {
      console.error('Error deleting habit:', error);
    }
  }

  const updateHabit = async (habit: Habit) => {
    if (typeof window === 'undefined') return;
    const userId = localStorage.getItem('userId');
    if (!userId || habits.length === 0) return;

    try {
      const { error } = await supabase
        .from('habits')
        .update({ name: habit.name, completed_dates: habit.completed_dates })
        .eq('id', habit.id)
        .eq('user_id', userId);

      if (error) throw error;
      
      setHabits(habits.map(h => h.id === habit.id ? habit : h));
    } catch (error) {
      console.error('Error updating habit:', error);
    }
  };

  const addHabit = async (habitName: string) => {
    if (typeof window === 'undefined') return;
    let userId = localStorage.getItem('userId');

    if (!userId) {
      userId = uuidv4();
      localStorage.setItem('userId', userId);
    }

    // Set the user_id in Supabase connection context
    await supabase.rpc('set_user_id', { user_id: userId });

    const newHabit = {
      id: Date.now(),
      name: habitName,
      completed_dates: [],
      user_id: userId
    };

    try {
      const { error } = await supabase
        .from('habits')
        .insert([newHabit]);

      if (error) throw error;
      setHabits([...habits, newHabit]);
    } catch (error) {
      console.error('Error adding habit:', error);
    }
  };

  return { habits, setHabits, addHabit, updateHabit, loading, userId, setUserId, deleteHabit };
} 