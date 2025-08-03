const Reservations = require("../../models/Reservations");

//for edit
document.addEventListener("DOMContentLoaded", function () {
  const resDate = document.getElementById("resDate");
  const confirmBtn = document.querySelector(".confirmRes");

  const today = new Date();
  const reservationDate = new Date(resDate.value);

  const notExpired = reservationDate.setHours(0,0,0,0) >= today.setHours(0,0,0,0);

  // Continue original setup
  document.querySelector("#resDate").addEventListener("change", allowFields);
  document.querySelector(".timeSlot").addEventListener("change", allowFields);
  document.querySelector(".labSelect").addEventListener("change", allowFields);
  populateDateAndTime();

  const reservSuccess = document.getElementById("reservSuccess");
  if (reservSuccess) {
    setTimeout(() => {
      reservSuccess.remove();
    }, 3000);
  }
});

/*
//for delete 
function isWithinCancellationWindow(reservDate, timeLabel) {
  const [startTime] = timeLabel.split(" - ");
  const [timePart, meridiem] = startTime.trim().split(" ");
  let [hours, minutes] = timePart.split(":").map(Number);

  if (meridiem === "PM" && hours !== 12) hours += 12;
  if (meridiem === "AM" && hours === 12) hours = 0;

  const start = new Date(reservDate);
  start.setHours(hours, minutes, 0, 0);

  const windowStart = new Date(start);
  const windowEnd = new Date(start);
  windowEnd.setMinutes(windowEnd.getMinutes() + 10);

  const now = new Date();
  return now >= start && now <= windowEnd;
}
  */