// client/game/Game.Actions.js
let drawCallback = null;

const GameActions = {
  setDrawCallback(fn) {
    drawCallback = fn;
  },

  requestDraw(count) {
    if (drawCallback) drawCallback(count);
    GameActions.closeDrawMenu();
  },

  openDrawMenu() {
    const menu = document.getElementById("draw-menu");
    if (menu) menu.classList.remove("hidden");
  },

  closeDrawMenu() {
    const menu = document.getElementById("draw-menu");
    if (menu) menu.classList.add("hidden");
  },

  openExtraDeck() {
    const modal = document.getElementById("extra-deck-dialog");
    if (modal) modal.showModal();
  },

  closeExtraDeck() {
    const modal = document.getElementById("extra-deck-dialog");
    if (modal) modal.close();
  },

  // UI-only modal for scan/stack/etc
  openViewModal(cards, title, onSelect) {
    const modal = document.getElementById("view-modal");
    const titleEl = document.getElementById("view-modal-title");
    const container = document.getElementById("view-modal-cards");

    if (!modal || !titleEl || !container) return;

    titleEl.textContent = title;
    container.innerHTML = "";

    cards.forEach((card, index) => {
      const img = document.createElement("img");
      img.src = card.image_url;
      img.className = "modal-card";
      img.onclick = () => onSelect(index);
      container.appendChild(img);
    });

    modal.showModal();
  }
};

export default GameActions;
