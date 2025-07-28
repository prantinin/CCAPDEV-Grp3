// RESERVATION TIME SLOTS
function populateDateAndTime() {
  const timeLabels = [
    "7:30 AM - 8:00 AM", "8:00 AM - 8:30 AM", "8:30 AM - 9:00 AM",
    "9:00 AM - 9:30 AM", "9:30 AM - 10:00 AM", "10:00 AM - 10:30 AM",
    "10:30 AM - 11:00 AM", "11:00 AM - 11:30 AM", "11:30 AM - 12:00 PM",
    "12:00 PM - 12:30 PM", "12:30 PM - 1:00 PM", "1:00 PM - 1:30 PM",
    "1:30 PM - 2:00 PM", "2:00 PM - 2:30 PM", "2:30 PM - 3:00 PM",
    "3:00 PM - 3:30 PM", "3:30 PM - 4:00 PM", "4:00 PM - 4:30 PM",
    "4:30 PM - 5:00 PM", "5:00 PM - 5:30 PM", "5:30 PM - 6:00 PM",
    "6:00 PM - 6:30 PM", "6:30 PM - 7:00 PM", "7:00 PM - 7:30 PM",
    "7:30 PM - 8:00 PM", "8:00 PM - 8:30 PM", "8:30 PM - 9:00 PM"
  ];

  const timeSelect = document.querySelector("select.timeSlot");
  const dateInput = document.getElementById("resDate");

  const today = new Date();
  const minDate = today.toISOString().split("T")[0];

  const maxDateObj = new Date();
  maxDateObj.setDate(today.getDate() + 7);
  const maxDate = maxDateObj.toISOString().split("T")[0];

  dateInput.setAttribute("min", minDate);
  dateInput.setAttribute("max", maxDate);

  // Prevent manual input
  dateInput.addEventListener('keydown', (e) => {
    e.preventDefault();
  });

  // Re-filter slots when date changes
  dateInput.addEventListener('change', () => {
    renderTimeOptions();
  });

  function renderTimeOptions() {
    timeSelect.innerHTML = `<option value="">-- None --</option>`;
    const selectedDate = new Date(dateInput.value);
    const now = new Date();

    timeLabels.forEach((label, index) => {
      // Parse slot start time
      const [startTime] = label.split(" - ");
      const slotDate = new Date(selectedDate);
      const [time, modifier] = startTime.split(" ");
      let [hours, minutes] = time.split(":").map(Number);
      if (modifier === "PM" && hours !== 12) hours += 12;
      if (modifier === "AM" && hours === 12) hours = 0;

      slotDate.setHours(hours, minutes, 0, 0);

      if (selectedDate.toDateString() !== today.toDateString() || slotDate > now) {
        timeSelect.innerHTML += `<option value="${index}">${label}</option>`;
      }
    });
  }

  // Initial render
  renderTimeOptions();
}



// FORM VALIDATION
function allowFields() {
  const resDate = document.querySelector("#resDate");
  const timeSlot = document.querySelector(".timeSlot");
  const labSelect = document.getElementById("labSelect");
  const slotIframe = document.getElementById("slotAreaContents");
  const confirmBtn = document.querySelector(".confirmRes");

  const dateFilled = resDate.value;
  const timeFilled = timeSlot.value;
  const labFilled = labSelect.value;

  // Active timeslots
  if (dateFilled) {
    timeSlot.disabled = false;
    timeSlot.classList.add("active");
  } else {
    timeSlot.disabled = true;
    timeSlot.classList.remove("active");
    timeSlot.value = "";
  }

  // Active lab selection
  if (dateFilled && timeFilled) {
    labSelect.disabled = false;
    labSelect.classList.add("active");
  } else {
    labSelect.disabled = true;
    labSelect.classList.remove("active");
    labFilled = "";
  }

  // Active seats iframe
  if (dateFilled && timeFilled && labFilled) {
    slotIframe.src = `/reserveiframe?date=${dateFilled}&time=${timeFilled}&lab=${labFilled}`;
  } else {
    slotIframe.src = "/unavailiframe";
  }

  confirmBtn.disabled = true;
  confirmBtn.classList.remove("active");
}


// DYNAMIC CHOSEN SLOT
window.addEventListener('message', (event) => {
  const labSelect = document.getElementById("labSelect");
  const chosenSlot = document.querySelector(".chosenSlot");
  const { seat } = event.data || {};

  const confirmBtn = document.querySelector(".confirmRes");

  if (seat) {
    // Get the lab name from the selected option
    const selectedOption = labSelect.options[labSelect.selectedIndex];
    const labName = selectedOption ? selectedOption.text : `Lab ${labSelect.value}`;

    console.log('Debug - labSelect.value:', labSelect.value);
    console.log('Debug - selectedOption.text:', selectedOption ? selectedOption.text : 'null');
    console.log('Debug - labName:', labName);

    chosenSlot.value = `${labName}, seat ${seat}`;
    confirmBtn.disabled = false;
    confirmBtn.classList.add("active");
  }
});



document.addEventListener("DOMContentLoaded", function () {
  // Disable fields whenever one is changed
  document.querySelector("#resDate").addEventListener("change", allowFields);
  document.querySelector(".timeSlot").addEventListener("change", allowFields);
  document.querySelector(".labSelect").addEventListener("change", allowFields);

  // Populate options accordingly
  populateDateAndTime();

  // Success message when reservation is made
  const reservSuccess = document.getElementById("reservSuccess");
  if (reservSuccess) {
    setTimeout(() => {

      // disappearing message
      reservSuccess.remove();

    }, 3000);
  }
});

