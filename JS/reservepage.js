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

    // start time options
    startSelect.innerHTML = `<option value="">-- None --</option>`;
    timeLabels.forEach((label, index) => {
        startSelect.innerHTML += `<option value="${index}">${label}</option>`;
    });

    // end time options only takes times >= start
    startSelect.addEventListener("change", () => {
        const startIndex = parseInt(startSelect.value);

        endSelect.innerHTML = `<option value="">-- None --</option>`;
        if (!isNaN(startIndex)) {
            for (let i = startIndex; i < timeLabels.length; i++) {
                endSelect.innerHTML += `<option value="${i}">${timeLabels[i]}</option>`;
            }
        }
    });

    // date only shows present and future
    const today = new Date().toISOString().split("T")[0];
    document.getElementById("res-date").setAttribute("min", today);
}


// DYNAMIC CHOSEN SLOT

window.addEventListener('message', (event) => {
    const data = event.data;
    if (data.lab && data.seat) {
        const chosenSlot = document.querySelector('.chosen-slot');
        if (chosenSlot) {
            chosenSlot.textContent = `${data.lab}, seat ${data.seat}`;
        }
    }
});

document.addEventListener("DOMContentLoaded", populateTimeOptions);