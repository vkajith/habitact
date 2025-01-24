import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

const HabitTracker = ({ habit: initialHabit }) => {
  const [habit, setHabit] = useState(initialHabit);
  const [dateRange, setDateRange] = useState({ dates: [], months: [] });
  const [currentStreak, setCurrentStreak] = useState(0);
  const scrollRef = useRef(null);
  const ROWS_PER_COLUMN = 7;
  
  useEffect(() => {
    const generateDateRange = () => {
      const dates = [];
      const months = new Set();
      
      // Get current date and set to end of day
      const endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
      
      // Calculate start date (exactly one year ago from today)
      const startDate = new Date(endDate);
      startDate.setFullYear(endDate.getFullYear() - 1);
      
      // Generate all dates
      let currentDate = new Date(startDate);
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
        dates: dates,
        months: Array.from(months)
      });

      if (!habit.data || habit.data.length !== dates.length) {
        setHabit(prev => ({
          ...prev,
          data: new Array(dates.length).fill(false)
        }));
      }
    };

    generateDateRange();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      requestAnimationFrame(() => {
        scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
      });
    }
  }, [dateRange.dates]);

  const formatDate = (date) => {
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

  const calculateStreak = (dates, data) => {
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Start from the most recent date
    for (let i = dates.length - 1; i >= 0; i--) {
      const currentDate = new Date(dates[i]);
      currentDate.setHours(0, 0, 0, 0);

      // Break if we find an unchecked day
      if (!data[i]) break;
      
      // Only count streak if it's today or consecutive previous days
      if (currentDate.getTime() === today.getTime() || 
          currentDate.getTime() === today.getTime() - (streak * 24 * 60 * 60 * 1000)) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  const toggleDay = (index) => {
    const newData = [...habit.data];
    const newValue = !newData[index];
    newData[index] = newValue;
    setHabit({
      ...habit,
      data: newData
    });

    // Calculate new streak after updating the data
    setCurrentStreak(calculateStreak(dateRange.dates, newData));

    if (newValue) {
      triggerConfetti();
    }
  };

  useEffect(() => {
    if (dateRange.dates.length > 0 && habit.data) {
      setCurrentStreak(calculateStreak(dateRange.dates, habit.data));
    }
  }, [dateRange.dates, habit.data]);

  // Organize dates into columns of 7 rows
  const createDateColumns = () => {
    const columns = [];
    const totalColumns = Math.ceil(dateRange.dates.length / ROWS_PER_COLUMN);
    
    for (let col = 0; col < totalColumns; col++) {
      const column = [];
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
  const visibleMonths = dateRange.months.slice(-8);

  // Position tooltip based on column position
  const getTooltipPosition = (columnIndex, totalColumns) => {
    if (columnIndex < 2) return 'right';
    if (columnIndex > totalColumns - 3) return 'left';
    return 'center';
  };

  const getStreakColor = () => {
    // Max streak for full color saturation (adjust as needed)
    const maxStreak = 30;
    // Calculate percentage (capped at 100%)
    const percentage = Math.min(currentStreak / maxStreak, 1);
    
    // HSL values for gradual transition
    // Hue goes from 45 (golden yellow) to 120 (green)
    const hue = 45 + (percentage * 75);
    // Saturation increases with streak
    const saturation = 70 + (percentage * 30);
    // Lightness stays in a more visible range
    const lightness = 50;  // Fixed lightness for better contrast
    
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  return (
    <div className="habit-tracker" style={{ fontFamily: "'Rubik', sans-serif" }}>
      <div className="habit-header">
        <h2 style={{ fontFamily: "'Poppins', sans-serif" }}>{habit.name}</h2>
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
      <div className="calendar">
        <div className="months">
          {visibleMonths.map(month => (
            <span key={month} className="month">{month}</span>
          ))}
        </div>
        <div className="days-scroll" ref={scrollRef}>
          <div className="days">
            {dateColumns.map((column, columnIndex) => (
              <div key={columnIndex} className="day-column">
                {column.map(({ date, index }) => (
                  <div
                    key={index}
                    className={`day ${habit.data[index] ? 'checked' : ''} ${
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