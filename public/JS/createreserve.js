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

  // Time slot options
  const timeSelect = document.querySelector("select.timeSlot");
  timeSelect.innerHTML = `<option value="">-- None --</option>`;

  timeLabels.forEach((label, index) => {
    timeSelect.innerHTML += `<option value="${index}">${label}</option>`;
  });

  // Date only allows today or 7 days later
  const today = new Date();
  const minDate = today.toISOString().split("T")[0];

  const maxDateObj = new Date();
  maxDateObj.setDate(today.getDate() + 7);
  const maxDate = maxDateObj.toISOString().split("T")[0];

  const dateInput = document.getElementById("resDate");
  dateInput.setAttribute("min", minDate);
  dateInput.setAttribute("max", maxDate);
}

// FORM VALIDATION
function checkInputs() {
  const confirmBtn = document.querySelector(".confirmRes");
  const resDate = document.querySelector("#resDate");
  const timeSlot = document.querySelector(".timeSlot");
  const chosenSlot = document.querySelector(".chosenSlot");
  const slotIframe = document.getElementById("slotAreaContents");

  const dateFilled = resDate.value;
  const timeFilled = timeSlot.value;
  const seatFilled = chosenSlot.value;

  // Timeslots avail when date is filled
  if (dateFilled) {
    timeSlot.disabled = false;
    timeSlot.classList.add("active");
  } else {
    timeSlot.disabled = true;
    timeSlot.classList.remove("active");
    timeSlot.value = "";
  }

  // Slots unavailable if date and time not filled
  if (dateFilled && timeFilled) {
    slotIframe.src = "/reserveiframe";
  } else {
    slotIframe.src = "/unavailiframe";
  }

  // Confirm avail only when the whole form is filled
  if (dateFilled && timeFilled && seatFilled) {
    confirmBtn.disabled = false;
    confirmBtn.classList.add("active");
  } else {
    confirmBtn.disabled = true;
    confirmBtn.classList.remove("active");
  }
}

// DYNAMIC CHOSEN SLOT
window.addEventListener('message', (event) => {
  const data = event.data;
  if (data.lab && data.seat) {
    const chosenSlot = document.querySelector('.chosenSlot');
    if (chosenSlot) {
      chosenSlot.value = `${data.lab}, seat ${data.seat}`;
      checkInputs();
    }
  }
});

document.addEventListener("DOMContentLoaded", function () {
  // Disable fields whenever one is changed
  document.querySelector("#resDate").addEventListener("input", checkInputs);
  document.querySelector(".timeSlot").addEventListener("change", checkInputs);

  // Populate options accordingly
  populateDateAndTime();

  // Success message when reservation is made
  const reservSuccess = document.getElementById("reservSuccess");
  if (reservSuccess) {
    setTimeout(() => {
      
      // disappearing message
      reservSuccess.remove();

      // ensures page reload does not have the message
      const url = new URL(window.location);
      url.searchParams.delete('success');
      window.history.replaceState({}, document.title, url);

    }, 3000);
  }
});