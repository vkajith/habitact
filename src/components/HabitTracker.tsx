import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

interface Habit {
  id: number;
  user_id: string;
  name: string;
  completed_dates: string[];
}

interface DateRange {
  dates: Date[];
  months: string[];
}

interface HabitTrackerProps {
  habit: Habit;
  onUpdate: (habit: Habit) => void;
  onDelete: (habit: Habit) => void;
}

const HabitTracker: React.FC<HabitTrackerProps> = ({ habit: initialHabit, onUpdate, onDelete }) => {
  const [habit, setHabit] = useState<Habit>(initialHabit);
  const [dateRange, setDateRange] = useState<DateRange>({ dates: [], months: [] });
  const [currentStreak, setCurrentStreak] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const ROWS_PER_COLUMN = 7;
  
  useEffect(() => {
    const generateDateRange = () => {
      const dates: Date[] = [];
      const months = new Set<string>();
      
      // Get current date and set to end of day
      const endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
      
      // Calculate start date (exactly one year ago from today)
      const startDate = new Date(endDate);
      startDate.setFullYear(endDate.getFullYear() - 1);
      
      // Generate all dates
      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        dates.push(new Date(currentDate));
        
        const monthKey = currentDate.toLocaleDateString('en-US', { 
          month: 'short',
          year: 'numeric'
        });
        months.add(monthKey);
        
        currentDate.setDate(currentDate.getDate() + 1);
      }

      setDateRange({ 
        dates,
        months: Array.from(months)
      });
    };

    generateDateRange();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      requestAnimationFrame(() => {
        const element = scrollRef.current;
        if (element) {
          element.scrollLeft = element.scrollWidth;
        }
      });
    }
  }, [dateRange.dates]);

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#4CAF50', '#45a049', '#66bb6a'],
    });
  };

  // Helper function to format date to YYYY-MM-DD string
  const formatDateToString = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  // Check if a date is completed
  const isDateCompleted = (date: Date): boolean => {
    const dateStr = formatDateToString(date);
    return habit.completed_dates?.includes(dateStr) || false;
  };

  const toggleDay = (index: number): void => {
    const date = dateRange.dates[index];
    const dateStr = formatDateToString(date);
    
    let newCompletedDates: string[];
    if (isDateCompleted(date)) {
      // Remove date if already completed
      newCompletedDates = habit.completed_dates?.filter(d => d !== dateStr) || [];
    } else {
      // Add date if not completed
      newCompletedDates = [...(habit.completed_dates || []), dateStr];
    }

    const updatedHabit = {
      ...habit,
      completed_dates: newCompletedDates
    };

    setHabit(updatedHabit);
    onUpdate(updatedHabit);

    // Calculate new streak after updating the data
    setCurrentStreak(calculateStreak(dateRange.dates, updatedHabit.completed_dates));

    if (!isDateCompleted(date)) {
      triggerConfetti();
    }
  };

  const calculateStreak = (dates: Date[], completedDates: string[]): number => {
    let streak = 0;
    const today = new Date();

    // eslint-disable-next-line prefer-const
    let currentDate = new Date(today);

    // Look back a maximum of 365 days to prevent infinite loops
    for (let i = 0; i < 365; i++) {    
      const dateStr = formatDateToString(currentDate);
      
      if (!completedDates.includes(dateStr)) {
        break;
      }
      
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    }
    console.log(streak);
    return streak;
  };

  useEffect(() => {
    if (dateRange.dates.length > 0) {
      setCurrentStreak(calculateStreak(dateRange.dates, habit.completed_dates));
    }
  }, [dateRange.dates, habit.completed_dates]);

  // Organize dates into columns of 7 rows
  const createDateColumns = () => {
    const columns: Array<Array<{ date: Date; index: number }>> = [];
    const totalColumns = Math.ceil(dateRange.dates.length / ROWS_PER_COLUMN);
    
    for (let col = 0; col < totalColumns; col++) {
      const column: Array<{ date: Date; index: number }> = [];
      for (let row = 0; row < ROWS_PER_COLUMN; row++) {
        const index = col * ROWS_PER_COLUMN + row;
        if (index < dateRange.dates.length) {
          column.push({
            date: dateRange.dates[index],
            index: index
          });
        }
      }
      if (column.length > 0) {
        columns.push(column);
      }
    }
    
    return columns;
  };

  const dateColumns = createDateColumns();
  
  // Calculate month spans
  const getMonthSpans = () => {
    const monthSpans: { month: string; columnSpan: number }[] = [];
    let currentMonth = '';
    let currentSpan = 0;

    dateColumns.forEach((column) => {
      const columnMonth = column[0].date.toLocaleDateString('en-US', { 
        month: 'short',
        year: 'numeric'
      });

      if (columnMonth === currentMonth) {
        currentSpan++;
      } else {
        if (currentMonth) {
          monthSpans.push({ month: currentMonth, columnSpan: currentSpan });
        }
        currentMonth = columnMonth;
        currentSpan = 1;
      }
    });

    // Add the last month span
    if (currentMonth) {
      monthSpans.push({ month: currentMonth, columnSpan: currentSpan });
    }

    return monthSpans;
  };

  const monthSpans = getMonthSpans();

  // Position tooltip based on column position
  const getTooltipPosition = (columnIndex: number, totalColumns: number): string => {
    if (columnIndex < 2) return 'right';
    if (columnIndex > totalColumns - 3) return 'left';
    return 'center';
  };

  const getStreakColor = (): string => {
    const maxStreak = 30;
    const percentage = Math.min(currentStreak / maxStreak, 1);
    const hue = 45 + (percentage * 75);
    const saturation = 70 + (percentage * 30);
    const lightness = 50;
    
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  return (
    <div className="habit-tracker" style={{ fontFamily: "'Fira Sans', sans-serif !important" }}>
      <div className="habit-header">
        <div className="habit-subheader">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h2 style={{ fontFamily: "'Poppins', sans-serif", margin: 0 }}>{habit.name}</h2>
        </div>
        <div 
          className="streak-badge"
          style={{ 
            backgroundColor: getStreakColor(),
            color: 'white',
            textShadow: '0px 1px 2px rgba(0, 0, 0, 0.3)',
            transition: 'all 0.3s ease',
            fontFamily: "'Rubik', sans-serif"
          }}
        >
          {currentStreak} DAY{currentStreak !== 1 ? 'S' : ''} STREAK
        </div>

        </div>

        <button
            onClick={() => onDelete(habit)}
            className="delete-button"
            style={{
              background: 'none',
              border: 'none',
              padding: '6px',
              cursor: 'pointer',
              color: '#ff4444',
              borderRadius: '4px',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#ffeeee';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M3 6h18" />
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            </svg>
          </button>
      </div>
      <div className="calendar">
        <div className="days-scroll" ref={scrollRef}>
          <div className="days" style={{ display: 'flex', marginBottom: '10px'}}>
            {monthSpans.map(({ month }, index) => (
              <div 
                key={`${month}-${index}`} 
                style={{ 
                  minWidth: `${88}px`,
                  alignItems: 'center',
                  textAlign: 'center',
                  display: 'flex',
                  justifyContent: 'center'
                }}
              >
                {month}
              </div>
            ))}
          </div>
          <div className="days">
            {dateColumns.map((column, columnIndex) => (
              <div key={columnIndex} className="day-column">
                {column.map(({ date, index }) => (
                  <div
                    key={index}
                    className={`day ${isDateCompleted(date) ? 'checked' : ''} ${
                      date.toDateString() === new Date().toDateString() ? 'today' : ''
                    } tooltip-${getTooltipPosition(columnIndex, dateColumns.length)}`}
                    onClick={() => toggleDay(index)}
                    data-date={formatDate(date)}
                    role="button"
                    tabIndex={0}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HabitTracker; 