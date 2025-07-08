document.addEventListener
('DOMContentLoaded', () =>
{
  //show only 7 days from now
  const dateInput = document.getElementById('date-finput'); 
  const today = new Date(); 
  const maxDate = new Date(); 
  maxDate.setDate(today.getDate() + 7);

  dateInput.min = toISO(today);
  dateInput.max = toISO(maxDate);

  //show only times in advance
  
})