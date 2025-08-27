const cards = document.querySelectorAll('.card');
const modal = document.getElementById('modal');
const modalImg = document.getElementById('modal-img');
const modalTitle = document.getElementById('modal-title');
const modalDescription = document.getElementById('modal-description');
const closeBtn = document.querySelector('.close');

// I'm using this so i can convert the incoming card names into the file name format
function formatCardName(str) {
    return str
        .trim()                           // Remove leading/trailing whitespace
        .split(/\s+/)                  // Split by spaces or hyphens
        .map(word =>
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join("");                        // Join words without spaces
}

cards.forEach(card => {
    card.addEventListener('click', () => {
        modal.style.display = 'flex';
        fileName = 'cardDatabase/' + formatCardName(card.Name) + '.png'; 
        modalImg.src = fileName;
        modalTitle.textContent = card.dataset.Name;
        modalDescription.textContent = card.dataset.Flavor;
    });
});

closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target == modal) {
        modal.style.display = 'none';
    }
});