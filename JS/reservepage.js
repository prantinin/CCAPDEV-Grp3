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

    timeLabels.forEach((label, index) => {
        timeOptionsHTML += `<option value="${index + 1}">${label}</option>`;
    });

    document.querySelector("select.start-time").insertAdjacentHTML("beforeend", timeOptionsHTML);
    document.querySelector("select.end-time").insertAdjacentHTML("beforeend", timeOptionsHTML);
}



// SLOT INSTRUCTIONS

window.addEventListener("message", function(event) {
    const instructionsBox = document.querySelector(".instructions h2");
    if (instructionsBox && typeof event.data === "string") {
        instructionsBox.textContent = event.data;
    }
});


document.addEventListener("DOMContentLoaded", populateTimeOptions);