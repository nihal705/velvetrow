// client/src/lib/timeFormat.js

const timeFormat = (minutes) => {
  // Check if minutes is valid
  if (!minutes || isNaN(minutes) || minutes <= 0) {
    return 'Runtime not available';
  }
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins}m`;
  }
  
  if (mins === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${mins}m`;
};

export default timeFormat;