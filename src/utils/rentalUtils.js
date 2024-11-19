export const calculateReturnDate = (rentDate, durationInDays = 14) => {
  const returnDate = new Date(rentDate);
  returnDate.setDate(returnDate.getDate() + durationInDays);
  return returnDate;
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};
