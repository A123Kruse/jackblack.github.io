(() => {
    for (let i = activeIndex + 1; i < hands.length; i++) { if (!hands[i].finished) { activeIndex = i; renderAll(true); return; } }
    // if all hands finished or busted -> dealer plays
    dealerPlayAndSettle();
}


function dealerPlayAndSettle() {
    renderAll(false); let dv = handValue(dealer.cards); while (dv < 17) { dealer.cards.push(drawCard()); dv = handValue(dealer.cards); renderAll(false); }
    settleRound(false);
}


function settleRound(naturalCheck) {
    renderAll(false);
    const dv = handValue(dealer.cards); const dBJ = isBlackjack(dealer.cards);
    let totalPayout = 0; let msgs = [];


    hands.forEach((h, idx) => {
        const pv = handValue(h.cards); const pBJ = isBlackjack(h.cards);
        let payout = 0; let msg = `Hand ${hands.length > 1 ? idx + 1 : 1}: `;
        // Insurance resolves first if dealer BJ
        if (h.insured) {
            const premium = Math.floor(h.bet / 2);
            if (dBJ) { payout += premium * 3; msg += 'Insurance wins. '; } else { msg += 'Insurance lost. '; }
        }


        if (naturalCheck) {
            if (pBJ && dBJ) { payout += h.bet; msg += 'Push on Blackjacks.'; }
            else if (pBJ) { payout += h.bet + Math.floor(h.bet * 3 / 2); msg += 'Blackjack!'; }
            else if (dBJ) { msg += 'Dealer Blackjack.'; }
        } else {
            if (pv > 21) { msg += 'Bust.'; }
            else if (dv > 21) { payout += h.bet * 2; msg += 'Dealer busts, you win.'; }
            else if (pv > dv) { payout += h.bet * 2; msg += 'You win.'; }
            else if (pv < dv) { msg += 'Dealer wins.'; }
            else { payout += h.bet; msg += 'Push.'; }
        }
        totalPayout += payout; msgs.push(msg);
    });


    bank += totalPayout; saveBank(); updateBankBadge();
    setStatus(msgs.join(' '));
    roundActive = false; insuranceWindowOpen = false; setActionState(false); dealBtn.disabled = false; newRoundBtn.disabled = false; baseBet = 0; updateBetLabel();
}


// ---- Utilities ----
function setActionState(playing) { hitBtn.disabled = !playing; standBtn.disabled = !playing; doubleBtn.disabled = !playing; splitBtn.disabled = !playing; insuranceBtn.disabled = true; dealBtn.disabled = playing; newRoundBtn.disabled = playing; }
function setStatus(msg, type = 'info') { statusEl.textContent = msg; statusEl.className = `toast ${type}`; }
function updateBetLabel() { betAmountEl.textContent = baseBet; }
function updateBankBadge() { bankBadgeEl.textContent = `Bank: ${bank} chips`; bankBadgeEl.className = 'badge'; }
function updateShoeBadge() { shoeBadgeEl.textContent = `Shoe: ${shoe.length} cards`; shoeBadgeEl.className = 'badge'; }
function loadBank() { const v = localStorage.getItem(BANK_KEY); return Number.isFinite(+v) && +v > 0 ? +v : START_BANK; }
function saveBank() { localStorage.setItem(BANK_KEY, String(bank)); }


// helpers for dealing (for future animations)
function dealToPlayer(hand, card) { hand.cards.push(card); }
function dealToDealer(card) { dealer.cards.push(card); }


// New round resets table visuals
function onNewRound() { playerHandsRow.innerHTML = ''; dealerCardsEl.innerHTML = ''; dealerScoreEl.textContent = 'Score: —'; setStatus('Place your bet to begin.'); setActionState(false); }
}) ();