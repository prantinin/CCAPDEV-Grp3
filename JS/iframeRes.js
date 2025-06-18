// GET LAB SELECTED FROM PARENT PAGE
function getCurrentLab() {
    const select = document.querySelector('.lab-select');
    return select ? select.options[select.selectedIndex].text : 'Unknown Lab';
}

// SENDS THE RESERVATION INFO TO PARENT PAGE
function sendSlotInfo(seat) {
    const lab = getCurrentLab();
    window.parent.postMessage({
        lab: lab,
        seat: seat
    }, '*');
}

// RETURNS SEAT ID TO PARENT PAGE
window.addEventListener('DOMContentLoaded', () => {
    const chairButtons = document.querySelectorAll('.chairs');
    chairButtons.forEach(button => {
        button.addEventListener('click', () => {
            const seat = button.id;
            sendSlotInfo(seat);
        });
    });
});

// ERROR WHEN CHOOSING RESERVED SEATS
function openPopRes(event) {
    const popup = document.querySelector(".popReserved");

    popup.style.display = "block";

    setTimeout(() => {
        popup.style.display = "none";
    }, 1500);
}