function populateDateAndTime() {
  const timeLabels = [
    "8:00 AM", "8:30 AM", "9:00 AM", "9:30 AM", "10:00 AM",
    "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
    "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM", "3:00 PM",
    "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM", "5:30 PM",
    "6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM", "8:00 PM",
    "8:30 PM", "9:00 PM"
  ];

  const startTimeSelect = document.querySelector("select.startTime");
  const endTimeSelect = document.querySelector("select.endTime");
  const dateInput = document.getElementById("resDate");

  const today = new Date();
  const minDate = today.toISOString().split("T")[0];
  const maxDateObj = new Date();
  maxDateObj.setDate(today.getDate() + 7);
  const maxDate = maxDateObj.toISOString().split("T")[0];

  dateInput.setAttribute("min", minDate);
  dateInput.setAttribute("max", maxDate);

  // Re-render time options when date changes
  dateInput.addEventListener('change', renderTimeOptions);

  function renderTimeOptions() {
    startTimeSelect.innerHTML = `<option value="">-- None --</option>`;
    endTimeSelect.innerHTML = `<option value="">-- None --</option>`;

    const selectedDate = new Date(dateInput.value);
    const now = new Date();

    timeLabels.forEach((label, index) => {
      const slotDate = new Date(selectedDate);
      const [time, modifier] = label.split(" ");
      let [hours, minutes] = time.split(":").map(Number);
      if (modifier === "PM" && hours !== 12) hours += 12;
      if (modifier === "AM" && hours === 12) hours = 0;
      slotDate.setHours(hours, minutes, 0, 0);

      if (selectedDate.toDateString() !== today.toDateString() || slotDate > now) {
        const option = `<option value="${index}">${label}</option>`;
        startTimeSelect.innerHTML += option;
        endTimeSelect.innerHTML += option;
      }
    });

    startTimeSelect.disabled = false;
    endTimeSelect.disabled = false;
  }

  renderTimeOptions();
}

function allowFields() {
  const resDate = document.querySelector("#resDate");
  const startTime = document.querySelector(".startTime");
  const endTime = document.querySelector(".endTime");
  const labSelect = document.getElementById("labSelect");
  const slotIframe = document.getElementById("slotAreaContents");
  const confirmBtn = document.querySelector(".confirmRes");

  const dateFilled = resDate.value;
  const startFilled = startTime.value;
  const endFilled = endTime.value;
  const labFilled = labSelect.value;

  labSelect.disabled = !(dateFilled && startFilled && endFilled);

  if (dateFilled && startFilled && endFilled && labFilled) {
    slotIframe.src = `/reserveiframe?date=${resDate.value}&start=${startFilled}&end=${endFilled}&lab=${labFilled}`;
    confirmBtn.disabled = false;
    confirmBtn.classList.add("active");
  } else {
    slotIframe.src = "/unavailiframe";
    confirmBtn.disabled = true;
    confirmBtn.classList.remove("active");
  }
}

window.addEventListener('message', (event) => {
  const labSelect = document.getElementById("labSelect");
  const chosenSlot = document.querySelector(".chosenSlot");
  const { seat } = event.data || {};
  const confirmBtn = document.querySelector(".confirmRes");

  if (seat) {
    const selectedOption = labSelect.options[labSelect.selectedIndex];
    const labName = selectedOption ? selectedOption.text : `Lab ${labSelect.value}`;
    chosenSlot.value = `${labName}, seat ${seat}`;
    confirmBtn.disabled = false;
    confirmBtn.classList.add("active");
  }
});

document.addEventListener("DOMContentLoaded", function () {
  document.querySelector("#resDate").addEventListener("change", allowFields);
  document.querySelector(".startTime").addEventListener("change", allowFields);
  document.querySelector(".endTime").addEventListener("change", allowFields);
  document.querySelector(".labSelect").addEventListener("change", allowFields);

  populateDateAndTime();

  const reservSuccess = document.getElementById("reservSuccess");
  if (reservSuccess) {
    setTimeout(() => reservSuccess.remove(), 3000);
  }
});
