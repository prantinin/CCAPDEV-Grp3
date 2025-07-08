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

  // Show only times in advance if today is selected
  dateInput.addEventListener('change', () => {
    const selected = new Date(dateInput.value);
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    const options = Array.from(timeInput.options).slice(1); // skip "-- Select --"

    options.forEach(option => {
      const [hour, minute] = option.value.split(':').map(Number);

      if (
        selected.toDateString() === now.toDateString() &&
        (hour < currentHour || (hour === currentHour && minute <= currentMinute))
      ) {
        option.style.display = 'none';
      } else {
        option.style.display = 'block';
      }
    });

    timeInput.selectedIndex = 0; // reset time choice
  });

  // Trigger filter on initial load too
  dateInput.dispatchEvent(new Event('change'));
})