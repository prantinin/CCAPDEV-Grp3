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

  const startSelect = document.querySelector("select.start-time");
  const endSelect = document.querySelector("select.end-time");

  // Start time options
  startSelect.innerHTML = `<option value="">-- None --</option>`;
  timeLabels.forEach((label, index) => {
    startSelect.innerHTML += `<option value="${index}">${label}</option>`;
  });

  // End time options — only times >= start
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
    checkInputs(); // Revalidate immediately
  });

    // Date only allows today or 7 days later
    const today = new Date();
    const minDate = today.toISOString().split("T")[0];

    const maxDateObj = new Date();
    maxDateObj.setDate(today.getDate() + 7);
    const maxDate = maxDateObj.toISOString().split("T")[0];

    const dateInput = document.getElementById("res-date");
    dateInput.setAttribute("min", minDate);
    dateInput.setAttribute("max", maxDate);
}

// DYNAMIC CHOSEN SLOT
window.addEventListener('message', (event) => {
  const data = event.data;
  if (data.lab && data.seat) {
    const chosenSlot = document.querySelector('.chosen-slot');
    if (chosenSlot) {
      chosenSlot.textContent = `${data.lab}, seat ${data.seat}`;
      checkInputs(); // Also revalidate when slot changes!
    }
  }
});

// FORM VALIDATION
function checkInputs() {
  const confirmBtn = document.querySelector(".confirm-res");
  const resDate = document.querySelector("#res-date");
  const startTime = document.querySelector(".start-time");
  const endTime = document.querySelector(".end-time");
  const chosenSlot = document.querySelector(".chosen-slot");

  const dateFilled = resDate.value.trim() !== "";
  const startFilled = startTime.value !== "";
  const endFilled = endTime.value !== "";
  const seatFilled = chosenSlot.textContent.trim() !== "";

  if (dateFilled && startFilled && endFilled && seatFilled) {
    confirmBtn.disabled = false;
    confirmBtn.classList.add("active");
  } else {
    confirmBtn.disabled = true;
    confirmBtn.classList.remove("active");
  }
}

document.addEventListener("DOMContentLoaded", function () {
  // Setup input listeners
  document.querySelector("#res-date").addEventListener("input", checkInputs);
  document.querySelector(".start-time").addEventListener("change", checkInputs);
  document.querySelector(".end-time").addEventListener("change", checkInputs);

  populateTimeOptions();
});
