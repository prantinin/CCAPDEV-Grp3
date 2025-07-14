// ERROR WHEN ID INVALID
function openPop(event) {
  const popup = document.getElementById("popInvalid");
  popup.classList.remove("hidden");

  setTimeout(() => {
      popup.classList.add("hidden");
  }, 1500);
}

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
  const studentID = document.querySelector(".studentID");
  const resDate = document.querySelector("#resDate");
  const timeSlot = document.querySelector(".timeSlot");
  const chosenSlot = document.querySelector(".chosenSlot");
  const labSelect = document.getElementById("labSelect");
  const slotIframe = document.getElementById("slotAreaContents");
  const confirmBtn = document.querySelector(".confirmRes");

  const idFilled = studentID.value;
  const dateFilled = resDate.value;
  const timeFilled = timeSlot.value;
  const labFilled = labSelect.value;

  // Active date selection
  if (idFilled) {
    resDate.disabled = false;
    resDate.classList.add("active");
  } else {
    resDate.disabled = true;
    resDate.classList.remove("active");
    resDate.value = "";
  }

  // Active timeslots
  if (idFilled && dateFilled) {
    timeSlot.disabled = false;
    timeSlot.classList.add("active");
  } else {
    timeSlot.disabled = true;
    timeSlot.classList.remove("active");
    timeSlot.value = "";
  }

  // Active lab selection
  if (idFilled && dateFilled && timeFilled) {
    labSelect.disabled = false;
    labSelect.classList.add("active");
    chosenSlot.disabled = false;
    chosenSlot.classList.add("active");
  } else {
    labSelect.disabled = true;
    labSelect.classList.remove("active");
    labSelect.value = "";
    chosenSlot.disabled = true;
    chosenSlot.classList.remove("active");
  }

  // Active seats iframe
  if (idFilled && dateFilled && timeFilled && labFilled) {
    chosenSlot.value = `Lab ${labSelect.value}, no seat`;
    slotIframe.src = `/reserveiframe?date=${dateFilled}&time=${timeFilled}&lab=${labFilled}`;
  } else {
    slotIframe.src = "/unavailiframe";
  }

  confirmBtn.disabled = true;
  confirmBtn.classList.remove("active");
}


// DYNAMIC CHOSEN SLOT
window.addEventListener('message', (event) => {
  const seat = event.data;
  const labFilled = document.getElementById("labSelect").value;
  const chosenSlot = document.querySelector(".chosenSlot");
  const confirmBtn = document.querySelector(".confirmRes");

  if (seat) {
    chosenSlot.value = `Lab ${labFilled}, seat ${seat}`;
    confirmBtn.disabled = false;
    confirmBtn.classList.add("active");
  }
});


document.addEventListener("DOMContentLoaded", function () {
  // ID number validation
  const confirmBtn = document.querySelector(".confirmRes");
  const studentID = document.querySelector(".studentID");
  
  // Disable fields whenever one is changed
  document.querySelector("#studentID").addEventListener("change", allowFields);
  document.querySelector("#resDate").addEventListener("change", allowFields);
  document.querySelector(".timeSlot").addEventListener("change", allowFields);
  document.querySelector(".labSelect").addEventListener("change", allowFields);

  // Populate options accordingly
  populateDateAndTime();

  // Form validation before confirmation
  confirmBtn.addEventListener("click", function (e) {
    if (!/^1(0[1-9]|1[0-9]|2[0-5])0\d{4}$/.test(studentID.value)) {
      e.preventDefault();
      openPop();
    }
  });

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