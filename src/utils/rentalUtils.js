export const calculateReturnDate = (rentDate, durationInDays = 14) => {
  const returnDate = new Date(rentDate);
  returnDate.setDate(returnDate.getDate() + durationInDays);
  return returnDate;
};

export const formatDate = (date) => {
  // Ensure date is a valid Date object
  const validDate = date instanceof Date ? date : new Date(date);
  
  // Check if the date is valid
  if (isNaN(validDate.getTime())) {
    return 'Invalid Date';
  }

  return validDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};
