document.addEventListener("DOMContentLoaded", () => {
    window.isDragging = false;
    window.isMoveInProgress = false;

    let floatingCard = null;

    // ============================================================
    // SPECIAL ZONES
    // ============================================================
    Game.State.ensureSlotHistory("leader-slot");
    // ============================================================
    // HELPERS
    // ============================================================
    const handArea = document.getElementById("hand-area");
    function isHandCardEl(el) {
        return el && el.dataset.index !== undefined;
    }

    // ============================================================
    // FIELD SLOT SETUP
    // ============================================================
    document.querySelectorAll(".field-slot").forEach(slot => {
        const slotId = slot.id;
        Game.State.ensureSlotHistory(slotId);

        slot.addEventListener("dragover", e => e.preventDefault());
        slot.addEventListener("dragleave", () => slot.classList.remove("hover"));

        slot.addEventListener("drop", e => {
            e.preventDefault();

            const from = e.dataTransfer.getData("from");

            if (from === "hand") {
                const index = parseInt(e.dataTransfer.getData("cardIndex"), 10);
                Game.Actions.moveCardToSlot({ type: "hand", index }, slotId);
            }

            if (from === "slot") {
                const sourceSlotId = e.dataTransfer.getData("slotId");
                Game.Actions.moveCardToSlot({ type: "slot", slotId: sourceSlotId }, slotId);
            }
        });

        slot.addEventListener("click", () => {
            if (!window.isDragging) Game.UI.showSlotViewer(slotId);
        });
    });

    // ============================================================
    // HAND DROP (slot → hand)
    // ============================================================
    handArea.addEventListener("dragover", e => e.preventDefault());

    handArea.addEventListener("drop", e => {
        e.preventDefault();
        const from = e.dataTransfer.getData("from");

        // slot → hand is valid
        if (from === "slot") {
            const slotId = e.dataTransfer.getData("slotId");
            Game.Actions.moveCardToHand(slotId);
        }

        // hand → hand = CANCEL DRAG (Option A)
        // Do NOT remove original DOM card here.
        // Do NOT modify hand order.
    });

    // ============================================================
    // DECK SLOT (send to bottom)
    // ============================================================
    const deckSlot = document.getElementById("deck-slot");
    const confirmDialog = document.getElementById("confirm-dialog");
    const confirmForm = document.getElementById("confirm-form");

    let pendingDeckDrop = null;

    deckSlot.addEventListener("dragover", e => {
        e.preventDefault();
        deckSlot.classList.add("hover");
    });

    deckSlot.addEventListener("dragleave", () => {
        deckSlot.classList.remove("hover");
    });

    deckSlot.addEventListener("drop", e => {
        e.preventDefault();
        deckSlot.classList.remove("hover");

        const from = e.dataTransfer.getData("from");
        const cardIndex = parseInt(e.dataTransfer.getData("cardIndex"), 10);
        const slotId = e.dataTransfer.getData("slotId");

        pendingDeckDrop = {
            type: from === "hand" ? "hand" : "slot",
            index: cardIndex,
            slotId
        };

        if (confirmDialog?.showModal) {
            confirmDialog.showModal();
        } else {
            const yes = window.confirm("Send this card to the bottom?");
            if (yes) Game.Actions.sendCardToBottom(pendingDeckDrop);
            pendingDeckDrop = null;
        }
    });

    confirmForm?.addEventListener("close", () => {
        if (confirmDialog.returnValue === "ok" && pendingDeckDrop) {
            Game.Actions.sendCardToBottom(pendingDeckDrop);
        }
        pendingDeckDrop = null;
    });

    // ============================================================
    // GLOBAL DRAGSTART (floating card)
    // ============================================================
    document.addEventListener("dragstart", (e) => {
        const card = e.target.closest(".card");
        if (!card) return;

        const isHandCard = isHandCardEl(card);
        window.isMoveInProgress = true;

        // Hide original hand card AFTER floating clone appears
        if (isHandCard) {
            requestAnimationFrame(() => {
                card.style.opacity = "0";
            });
        }

        e.dataTransfer.setDragImage(new Image(), 0, 0);
        if (isHandCard) {
          e.dataTransfer.setData("from", "hand");
          e.dataTransfer.setData("cardIndex", card.dataset.index);
        } else {
          const slotId =
            card.closest(".field-slot")?.id ||
            card.closest("#leader-slot")?.id;
          if (slotId) {
              e.dataTransfer.setData("from", "slot");
              e.dataTransfer.setData("slotId", slotId);
          }
        }

        floatingCard = card.cloneNode(true);
  
        // Make floating clone SAFE
        floatingCard.classList.add("floating-card");
        floatingCard.classList.remove("card");
        floatingCard.removeAttribute("draggable");
        floatingCard.removeAttribute("data-index");
        floatingCard.removeAttribute("data-card");

        document.body.appendChild(floatingCard);

        floatingCard.style.left = e.clientX + "px";
        floatingCard.style.top = e.clientY + "px";

        document.getElementById("hand-area").classList.add("lowered");
    });

    // ============================================================
    // GLOBAL DRAG (move floating card)
    // ============================================================
    document.addEventListener("drag", (e) => {
        if (!floatingCard) return;
        floatingCard.style.left = e.clientX + "px";
        floatingCard.style.top = e.clientY + "px";
    });

    // ============================================================
    // GLOBAL DRAGEND (cleanup)
    // ============================================================
    document.addEventListener("dragend", (e) => {
      const card = e.target.closest(".card");
      window.isMoveInProgress = false;

      // Only restore opacity if:
      // 1. It's a hand card
      // 2. The drag was NOT a deck-slot drop waiting for confirmation
      // 3. The card is still in the hand by state
      if (card && isHandCardEl(card) && !pendingDeckDrop) {
          const index = parseInt(card.dataset.index, 10);
          const hand = Game.State.gameState.hands[Game.State.playerId];

          if (hand && hand[index]) {
              card.style.opacity = "1";
          }
      }

      if (floatingCard) {
          floatingCard.remove();
          floatingCard = null;
      }

      handArea.classList.remove("lowered");
    });

    // ============================================================
    // CLEAR BOARD
    // ============================================================
    document.getElementById("clear-board-btn")?.addEventListener("click", () => {
        if (confirm("Clear the board and all hands?")) {
            Game.Actions.clearBoard();
        }
    });

    // ============================================================
    // SHUFFLE ALL DECKS
    // ============================================================
    document.getElementById("shuffle-decks-btn")?.addEventListener("click", () => {
        if (confirm("Shuffle all players' decks into one draw pile?")) {
            Game.Actions.shuffleAllDecks();
        }
    });

    // ============================================================
    // HEALTH TRACKER
    // ============================================================
    let health = 20;
    const healthSlot = document.getElementById("health-slot");

    healthSlot?.addEventListener("click", e => {
        const rect = healthSlot.getBoundingClientRect();
        const clickY = e.clientY - rect.top;

        health += clickY < rect.height / 2 ? 1 : -1;
        Game.UI.updateHealth(health);
    });

    // Initial UI
    Game.UI.renderHand();
    Game.UI.updateHealth(health);
});
