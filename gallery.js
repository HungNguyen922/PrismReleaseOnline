// This file handles all the modal gallery stuff

const cards = document.querySelectorAll('.card');
const modal = document.getElementById('modal');
const modalImg = document.getElementById('modal-img');
const modalTitle = document.getElementById('modal-title');
const modalDescription = document.getElementById('modal-description');
const closeBtn = document.querySelector('.close');
const cardGrid = document.querySelector('.card-grid');

// I'm using this so i can convert the incoming card names into the file name format
function formatCardName(str) {
  return str
    .trim()
    // Match a boundary: either start of string, or a separator (space, hyphen, underscore, etc.)
    .replace(/(?:^|[\s\-\_]+)(\S)/g, (_, char) =>
      char.toUpperCase()
    );
}

// Event delegation: one listener on the container
cardGrid.addEventListener('click', (e) => {
  const card = e.target.closest('.card');
  if (!card) return;  // Not a card? Ignore.

  modal.style.display = 'flex';
  const name = card.dataset.name;
  const fileName = 'cardDatabase/' + formatCardName(name) + '.png';
  modalImg.src = fileName;
  modalTitle.textContent = name;
  modalDescription.textContent = card.dataset.description;
});

closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target == modal) {
        modal.style.display = 'none';
    }
});

window.addEventListener('keydown', (e) => {
  if (e.key === 'Q') {
    modal.style.display = 'none';
  }
});
