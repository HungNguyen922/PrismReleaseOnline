window.Game = {
  // ============================================================
  //  STATE LAYER
  // ============================================================
  State: {
    gameState: {
      slots: {},
      hands: {},
      decks: {},
      drawPile: [],
      extraDeck: [],
      leader: null
    },

    hand: [],
    slotHistories: {},

    getSlot(slotId) {
      return this.gameState.slots[slotId] || null;
    },

    setSlot(slotId, card) {
      this.gameState.slots[slotId] = card;
    },

    removeSlot(slotId) {
      delete this.gameState.slots[slotId];
    },

    ensureSlotHistory(slotId) {
      if (!this.slotHistories[slotId]) {
        this.slotHistories[slotId] = [];
      }
      return this.slotHistories[slotId];
    }
  },

  // ============================================================
  //  UI LAYER (NO SERVER CALLS)
  // ============================================================
  UI: {
    renderHand() {
        const handArea = document.getElementById("hand-area");
        handArea.innerHTML = "";

        Game.State.hand.forEach((card, index) => {
            const cardEl = document.createElement("div");
            cardEl.classList.add("card");
            cardEl.setAttribute("draggable", "true");
            cardEl.dataset.index = index;

            const img = this.createCardImage(card);
            cardEl.appendChild(img);

            cardEl.addEventListener("dragstart", e => {
            e.dataTransfer.setData("from", "hand");
            e.dataTransfer.setData("cardIndex", index);
            e.dataTransfer.setData("card", card);
            window.isDragging = true;
            });

            cardEl.addEventListener("dragend", () => {
            setTimeout(() => { window.isDragging = false; }, 0);
            });

            handArea.appendChild(cardEl);
        });
    },

    setSlotCard(slotId, card, { pushHistory = true } = {}) {
      const slot = document.getElementById(slotId);
      if (!slot || !card) return;

      const history = Game.State.ensureSlotHistory(slotId);
      const current = slot.dataset.card;

      if (pushHistory && current) {
        history.push(current);
      }

      slot.innerHTML = "";

      const cardEl = document.createElement("div");
      cardEl.className = "card";
      cardEl.setAttribute("draggable", "true");

      const img = Game.UI.createCardImage(card);

      cardEl.appendChild(img);
      slot.appendChild(cardEl);
      slot.dataset.card = card;

      cardEl.addEventListener("dragstart", ev => {
        ev.dataTransfer.setData("from", "slot");
        ev.dataTransfer.setData("slotId", slotId);
        ev.dataTransfer.setData("card", card);
        window.isDragging = true;
      });

      cardEl.addEventListener("dragend", () => {
        setTimeout(() => { window.isDragging = false; }, 0);
      });
    },

    clearSlot(slotId, { clearHistory = true } = {}) {
      const slot = document.getElementById(slotId);
      if (!slot) return;

      slot.innerHTML = "";
      delete slot.dataset.card;

      if (clearHistory) {
        Game.State.ensureSlotHistory(slotId).length = 0;
      }
    },

    removeTopCard(slotId, { revealHistory = true } = {}) {
      const slot = document.getElementById(slotId);
      if (!slot) return null;

      const card = slot.dataset.card;
      if (!card) return null;

      const history = Game.State.ensureSlotHistory(slotId);

      Game.UI.clearSlot(slotId, { clearHistory: !revealHistory });

      if (revealHistory && history.length > 0) {
        const prev = history.pop();
        Game.UI.setSlotCard(slotId, prev, { pushHistory: false });
      }

      return card;
    },

    updateHealth(value) {
      const healthValue = document.getElementById("health-value");
      if (healthValue) healthValue.textContent = value;
    },

    showSlotViewer(slotId) {
      const slot = document.getElementById(slotId);
      if (!slot) return;

      const dialog = document.getElementById("slot-viewer-dialog");
      const container = document.getElementById("slot-viewer-cards");

      container.innerHTML = "";

      const list = [];
      if (slot.dataset.card) list.push(slot.dataset.card);

      const history = Game.State.ensureSlotHistory(slotId);
      if (history.length) {
        list.push(...history.slice().reverse());
      }

      if (list.length === 0) {
        container.textContent = "No cards in this slot.";
      } else {
        list.forEach(card => {
          const img = document.createElement("img");
          img.src = "cardDatabase/" + Game.Utils.formatCardName(card) + ".png";
          img.alt = card;
          container.appendChild(img);
        });
      }

      dialog.showModal();
    },

    createCardImage(card) {
        const img = document.createElement("img");
        img.src = "cardDatabase/" + Game.Utils.formatCardName(card) + ".png";
        img.alt = card;
        img.classList.add("card-img");
        return img;
    },

    openViewModal(cards, title = "View Cards", onCardClick = null) {
        const dialog = document.getElementById("extra-deck-dialog");
        const container = document.getElementById("extra-deck-cards");
        const titleEl = document.getElementById("modal-title");

        container.innerHTML = "";
        titleEl.textContent = title;

        cards.forEach((card, index) => {
            const img = Game.UI.createCardImage(card);
            img.classList.add("clickable");

            img.addEventListener("click", () => {
                if (onCardClick) {
                    onCardClick(index, card);
                }
                dialog.close();
            });

            container.appendChild(img);
        });

        dialog.showModal();
    },
    
  },

  // ============================================================
  //  SERVER LAYER
  // ============================================================
  Server: {
    sync(patch) {
        // Update local state immediately
        Object.assign(Game.State.gameState, patch);

        // Send patch to server
        window.socket.emit("updateState", {
            gameId: window.currentGameId,
            patch
        });
    },

    applyServerState(fullState) {
        // 1. Replace the entire gameState atomically
        Game.State.gameState = fullState;

        // 2. Update draw pile
        Game.State.gameState.drawPile = fullState.drawPile || [];

        // Update Leader
        Game.State.gameState.leader = fullState.leader || null;

        // 3. Update extra deck
        Game.State.gameState.extraDeck = fullState.extraDeck || [];


        // 4. Update your hand
        const myId = window.socket.id;
        Game.State.hand = fullState.hands?.[myId] || [];

        // 5. Update all slots
        if (!window.isMoveInProgress) {
            const allSlots = [
                ...document.querySelectorAll(".field-slot"),
                document.getElementById("leader-slot")
            ];

            allSlots.forEach(slot => {
                if (!slot) return;

                const slotId = slot.id;
                const card = fullState.slots?.[slotId] || null;
                const current = slot.dataset.card;

                if (card && current !== card) {
                    Game.UI.setSlotCard(slotId, card, { pushHistory: false });
                }

                if (!card && current) {
                    Game.UI.clearSlot(slotId, { clearHistory: false });
                }
            });
        }

        // 6. Render hand last
        if (!window.isMoveInProgress) {
            Game.UI.renderHand();
        }
    }

  },

  // ============================================================
  //  ACTIONS LAYER (GAME LOGIC)
  // ============================================================
  Actions: {
    moveCardToSlot(from, destSlotId) {
        let card = null;
        let sourceSlotId = null;

        // 1. UPDATE STATE FIRST
        if (from.type === "hand") {
            card = Game.State.hand.splice(from.index, 1)[0];
        }

        if (from.type === "slot") {
            sourceSlotId = from.slotId;
            card = Game.State.getSlot(sourceSlotId);
            Game.UI.clearSlot(sourceSlotId, { clearHistory: false });
            Game.State.removeSlot(sourceSlotId);

        }

        if (!card) return;

        // 2. UPDATE STATE FOR DESTINATION
        Game.State.setSlot(destSlotId, card);

        // 3. UPDATE UI AFTER STATE IS CORRECT
        Game.UI.setSlotCard(destSlotId, card, { pushHistory: true });

        // 4. SYNC SERVER LAST
        Game.Server.sync({
            slots: Game.State.gameState.slots,
            hands: { [window.socket.id]: Game.State.hand }
        });
    },

    moveCardToHand(slotId) {
        // 1. REMOVE FROM STATE FIRST
        const card = Game.State.getSlot(slotId);
        if (!card) return;

        Game.State.removeSlot(slotId);

        // 2. UPDATE STATE FOR DESTINATION
        Game.State.hand.push(card);

        // 3. UPDATE UI AFTER STATE IS CORRECT
        Game.UI.clearSlot(slotId, { clearHistory: false });

        // 4. SYNC SERVER LAST
        Game.Server.sync({
            slots: Game.State.gameState.slots,
            hands: { [window.socket.id]: Game.State.hand }
        });
    },

    drawFromExtraDeck(index) {
        const card = Game.State.gameState.extraDeck.splice(index, 1)[0];
        Game.State.hand.push(card);

        Game.Server.sync({
            extraDeck: Game.State.gameState.extraDeck,
            hands: { [window.socket.id]: Game.State.hand }
        });
    },

    sendCardToBottom(from) {
        let card = null;

        // 1. REMOVE FROM STATE FIRST
        if (from.type === "hand") {
            card = Game.State.hand.splice(from.index, 1)[0];
        }

        if (from.type === "slot") {
            card = Game.State.getSlot(from.slotId);
            Game.State.removeSlot(from.slotId);
        }

        if (!card) return;

        // 2. UPDATE STATE FOR DESTINATION
        Game.State.gameState.drawPile.push(card);
        Game.State.gameState.drawPile = Game.State.gameState.drawPile.slice();

        // 3. UPDATE UI AFTER STATE IS CORRECT
        if (from.type === "slot") {
            Game.UI.clearSlot(from.slotId, { clearHistory: false });
        }

        // 4. SYNC SERVER LAST
        Game.Server.sync({
            drawPile: Game.State.gameState.drawPile,
            slots: Game.State.gameState.slots,
            hands: { [window.socket.id]: Game.State.hand }
        });
    },

    clearBoard() {
        document.querySelectorAll(".field-slot").forEach(slot => {
            Game.UI.clearSlot(slot.id, { clearHistory: true });
        });

        Game.Server.sync({
            slots: {},
            hands: { [window.socket.id]: [] },
            decks: {},
            drawPile: [],
            extraDeck: []
        });


        Game.State.hand = [];
        Game.State.gameState.drawPile = [];

        Game.UI.renderHand();
    },

    shuffleAllDecks() {
        let combined = [];

        for (const playerId in Game.State.gameState.decks) {
            combined = combined.concat(Game.State.gameState.decks[playerId]);
            Game.State.gameState.decks[playerId] = [];
        }

        Game.Utils.shuffle(combined);

        Game.State.gameState.drawPile = combined;
        Game.State.gameState.drawPile = combined.slice();

        Game.Server.sync({
            drawPile: combined,
            decks: Game.State.gameState.decks,
            hands: { [window.socket.id]: Game.State.hand }
        });
    }
  },

  // ============================================================
  //  UTILS LAYER
  // ============================================================
  Utils: {
    formatCardName(name) {
        return name
            .replace(/\(L\)|\(E\)/gi, "")   // remove (L) and (E)
            .trim()
            .split(/\s+/)                  // split on spaces
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join("");                     // join into PascalCase
    },

    shuffle(arr) {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
    }
  }
};
