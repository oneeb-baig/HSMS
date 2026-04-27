// src/utils/formatters.js

export const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  
  // Example: 23-Apr-2026
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).replace(/ /g, '-');
};

export const formatTime = (timeString) => {
  if (!timeString) return "N/A";
  
  // Handles '13:00:00' format from Postgres
  const [hours, minutes] = timeString.split(':');
  const date = new Date();
  date.setHours(hours, minutes);

  // Example: 01:00 PM
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};