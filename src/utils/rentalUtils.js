export const calculateReturnDate = (rentDate, durationInDays = 14) => {
  const returnDate = new Date(rentDate);
  returnDate.setDate(returnDate.getDate() + durationInDays);
  return returnDate;
};

export const formatDate = (dateString) => {
  // Check if the input is already in DD-MM-YYYY format
  if (typeof dateString === 'string' && /^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
    return dateString;
  }

  // If it's a Date object or a date string in another format
  const date = dateString instanceof Date 
    ? dateString 
    : new Date(dateString);
  
  // Check if the date is valid
  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }

  // Convert to DD-MM-YYYY format
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).replace(/\//g, '-');
};