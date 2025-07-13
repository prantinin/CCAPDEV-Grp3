// Change reserved seats colors
function updateSeats(reservedSeats) {
    const chairButtons = document.querySelectorAll('.chairs');
    
    chairButtons.forEach(button => {
        const seatId = button.id;
        const numberpart = seatId.match(/\d+/)[0];

        if (reservedSeats.includes(seatId)) {
            if (numberpart == 1 || numberpart == 2)
                button.querySelector('img').src = '/Assets/icons/chair-toptaken.svg';
            else if (numberpart == 3 || numberpart == 4)
                button.querySelector('img').src = '/Assets/icons/chair-bottomtaken.svg';
            else
                button.querySelector('img').src = '/Assets/icons/chair-midtaken.svg';
            
            button.onclick = () => openPopRes();
        } else {
            button.onclick = () => window.parent.postMessage(seatId);
        }
    });
}


// ERROR WHEN CHOOSING RESERVED SEATS
function openPopRes(event) {
    const popup = document.getElementById("popReserved");

    popup.style.display = "block";

    setTimeout(() => {
        popup.style.display = "none";
    }, 1500);
}


// Listen for lab/date/time to come from parent via iframe src or postMessage
window.addEventListener('DOMContentLoaded', () => {
  const lab = new URLSearchParams(window.location.search).get('lab');
  const date = new URLSearchParams(window.location.search).get('date');
  const time = new URLSearchParams(window.location.search).get('time');

  if (lab && date && time) {
    console.log('Fetching reserved seats for:', lab, date, time);
    fetch(`/api/reservedSeats?lab=${lab}&date=${date}&time=${time}`)
      .then(res => res.json())
      .then(data => {
        console.log('Reserved:', data);
        updateSeats(data);
      });
  }
});