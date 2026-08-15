// client/src/lib/isoTimeFormat.js

const isoTimeFormat = (dateTimeString) => {
  if (!dateTimeString) return '--:--';
  
  try {
    // Parse the ISO date string
    const date = new Date(dateTimeString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return dateTimeString; // Return original if invalid
    }
    
    // Format as 12-hour time
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch (error) {
    console.error('Error formatting time:', error);
    return dateTimeString;
  }
};

export default isoTimeFormat;