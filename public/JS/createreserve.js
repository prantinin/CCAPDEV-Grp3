// RESERVATION TIME SLOTS
function populateTimeOptions() {
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

  const startSelect = document.querySelector("select.startTime");
  const endSelect = document.querySelector("select.endTime");

  // Start time options
  startSelect.innerHTML = `<option value="">-- None --</option>`;

  timeLabels.forEach((label, index) => {
    startSelect.innerHTML += `<option value="${index}">${label}</option>`;
  });

  
  // End time options: only >= startTime
  startSelect.addEventListener("change", () => {
    const startIndex = parseInt(startSelect.value);

    endSelect.innerHTML = `<option value="">-- None --</option>`;
    if (!isNaN(startIndex)) {
      for (let i = startIndex; i < timeLabels.length; i++) {
        endSelect.innerHTML += `<option value="${i}">${timeLabels[i]}</option>`;
      }
    }

    // Reset end time to default
    endSelect.value = "";
    checkInputs();
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
  const startTime = document.querySelector(".startTime");
  const endTime = document.querySelector(".endTime");
  const chosenSlot = document.querySelector(".chosenSlot");

  const dateFilled = resDate.value.trim() !== "";
  const startFilled = startTime.value !== "";
  const endFilled = endTime.value !== "";
  const seatFilled = chosenSlot.value.trim() !== "";

  // Timeslots avail when seat and date are filled
  if (seatFilled && dateFilled) {
    startTime.disabled = false;
    startTime.classList.add("active");

    if (startFilled) {
      endTime.disabled = false;
      endTime.classList.add("active");
    } else {
      endTime.disabled = true;
      endTime.classList.remove("active");
      endTime.value = "";
    }

  } else {
    startTime.disabled = true;
    startTime.classList.remove("active");
    startTime.value = "";

    endTime.disabled = true;
    endTime.classList.remove("active");
    endTime.value = "";
  }

  // Confirm only when the whole form is filled
  if (dateFilled && startFilled && endFilled && seatFilled) {
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
  document.querySelector("#resDate").addEventListener("input", checkInputs);
  document.querySelector(".startTime").addEventListener("change", checkInputs);
  document.querySelector(".endTime").addEventListener("change", checkInputs);

  populateTimeOptions();
});