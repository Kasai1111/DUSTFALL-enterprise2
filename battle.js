/* --- 4. BATTLE LOGIC --- */
/* --- 4. BATTLE LOGIC --- */
const battle = (function () {
  // ★ここを変更: 即時関数の開始
  const isTouchDevice =
    "ontouchstart" in window || navigator.maxTouchPoints > 0;

  const MAX_HP = 100;
  const MAX_POSTURE = 20;
  const MAX_EP = 8;
  const MAX_SP = 5;
  const COUNTER_EP_COST = 4;

  const TYPE = {
    ATTACK: "Attack",
    GUARD: "Guard",
    BREAK: "Break",
    SP: "SP",
  };

  const WIN_MAP = {
    [TYPE.ATTACK]: TYPE.BREAK,
    [TYPE.BREAK]: TYPE.GUARD,
    [TYPE.GUARD]: TYPE.ATTACK,
  };

  // ★修正1: EQUIPMENTのキーが存在するか確認してから取得
  let selectedWeapon = Object.keys(EQUIPMENT.WEAPONS)[0];
  let selectedArmor = Object.keys(EQUIPMENT.ARMORS)[0];
  // ★修正2: ACCESSORIES ではなく GADGETS を使用
  let selectedAcc = Object.keys(EQUIPMENT.GADGETS)[0];

  let turn = 1;
  let player, enemy;
  let pSlots = [null, null];
  let isCounterMode = false;
  let hasUsedCounter = false;
  let isAnimating = false;
  let pendingEnemySlots = [null, null];

  let isPolarityReversed = false;
  let isBossBattle = false;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  function initSetup() {
    renderEquipOptions("weapon", EQUIPMENT.WEAPONS, selectedWeapon);
    renderEquipOptions("armor", EQUIPMENT.ARMORS, selectedArmor);
    // ★修正3: ACCESSORIES -> GADGETS
    renderEquipOptions("acc", EQUIPMENT.GADGETS, selectedAcc);
    updatePreviews();
  }

  function renderEquipOptions(category, data, currentSelection) {
    const container = document.getElementById(`opt-${category}`);
    if (!container) return; // エラー防止
    container.innerHTML = "";
    Object.keys(data).forEach((key) => {
      const btn = document.createElement("div");
      btn.className = `equip-btn ${key === currentSelection ? "active" : ""}`;
      btn.innerText = key;
      btn.onclick = () => {
        if (category === "weapon") selectedWeapon = key;
        if (category === "armor") selectedArmor = key;
        if (category === "acc") selectedAcc = key;
        initSetup();
      };
      container.appendChild(btn);
    });
  }

  function updatePreviews() {
    renderCardsToPreview("prev-weapon", EQUIPMENT.WEAPONS[selectedWeapon]);
    renderCardsToPreview("prev-armor", EQUIPMENT.ARMORS[selectedArmor]);
    // ★修正4: ACCESSORIES -> GADGETS
    renderCardsToPreview("prev-acc", EQUIPMENT.GADGETS[selectedAcc]);
  }

  function renderCardsToPreview(elementId, cards) {
    const el = document.getElementById(elementId);
    if (!el || !cards) return; // エラー防止
    el.innerHTML = "";
    cards.forEach((c) => {
      const div = createCardDiv(c, false, -99);
      div.onclick = null;
      if (isTouchDevice) {
        div.ontouchstart = null;
        div.ontouchend = null;
        div.ontouchmove = null;
      }
      el.appendChild(div);
    });
  }

  function startGame() {
    document.getElementById("setup-screen").style.display = "none";
    document.querySelector(".game-container").style.display = "flex";
    initBattle();
  }

  function showTooltip(e, card) {
    if (!card) return;
    if (e && e.stopPropagation) e.stopPropagation();

    const tt = document.getElementById("card-tooltip");

    let statsText = "";
    if (card.dmg)
      statsText += `<span class="tooltip-stat">HP-${card.dmg} (Dmg)</span>\n`;
    if (card.pos)
      statsText += `<span class="tooltip-stat">Posture-${card.pos}</span>\n`;
    if (card.arm)
      statsText += `<span class="tooltip-stat">Armor ${card.arm}</span>\n`;
    if (card.isSP)
      statsText += `<span style="color:var(--sp-bar-color)">SP必殺技 (Cost ${card.cost})</span>\n`;

    let abilityText = "";
    if (card.ability && ABILITIES[card.ability]) {
      const ab = ABILITIES[card.ability];
      let typeColor = "#f2cc60";
      if (ab.type === "SETUP") typeColor = "#79c0ff";
      if (ab.type === "EXECUTE") typeColor = "#ff7b72";

      abilityText = `<div class="tooltip-desc">
            <span style="color:${typeColor}; font-weight:bold">${ab.name}</span><br>
            ${ab.desc}
            </div>`;
    }

    tt.innerHTML = `
       <strong>${card.type} (Cost: ${card.cost})</strong>
       <div>${statsText}</div>
       ${abilityText}
       `;

    tt.style.display = "block";
    moveTooltip(e);
  }

  function moveTooltip(e) {
    const tt = document.getElementById("card-tooltip");
    if (!e) return;

    let clientX, clientY;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if (e.clientX !== undefined) {
      clientX = e.clientX;
      clientY = e.clientY;
    } else {
      return;
    }

    const offsetX = 15;
    const offsetY = isTouchDevice ? -150 : 15;

    let leftPos = Math.min(clientX + offsetX, window.innerWidth - 350);
    if (leftPos < 10) leftPos = 10;

    let topPos = clientY + offsetY;
    if (topPos < 10) topPos = clientY + 30;

    tt.style.left = leftPos + "px";
    tt.style.top = topPos + "px";
  }

  function hideTooltip() {
    document.getElementById("card-tooltip").style.display = "none";
  }
  window.onclick = function (event) {
    const modal = document.getElementById("rule-modal");
    if (event.target == modal) modal.style.display = "none";
  };

  function buildDeck(wKey, aKey, accKey) {
    // データが存在しない場合のフォールバックを追加
    const wData = EQUIPMENT.WEAPONS[wKey] || { cards: [] };
    const aData = EQUIPMENT.ARMORS[aKey] || { cards: [] };
    const accData = EQUIPMENT.GADGETS[accKey] || { cards: [] }; // GADGETSを参照

    const wCards = JSON.parse(JSON.stringify(wData.cards || []));
    const aCards = JSON.parse(JSON.stringify(aData.cards || []));
    const accCards = JSON.parse(JSON.stringify(accData.cards || []));

    let deck = [...wCards, ...aCards, ...accCards];
    const spIndex = deck.findIndex((c) => c.isSP);
    let reservedSP = null;
    if (spIndex !== -1) {
      reservedSP = deck.splice(spIndex, 1)[0];
    }

    shuffle(deck);
    return { deck, reservedSP };
  }

  function createEntity(name, wKey, aKey, accKey) {
    const { deck, reservedSP } = buildDeck(wKey, aKey, accKey);
    // デッキが空の場合の安全策
    let secret = null;
    if (deck.length > 0) secret = deck.pop();

    const entity = {
      name,
      hp: MAX_HP,
      maxHp: MAX_HP,
      pos: MAX_POSTURE,
      maxPos: MAX_POSTURE,

      // ▼▼▼ 修正: ステータスの初期化 ▼▼▼
      maxEp: 8, // デフォルト値
      ep: 5, // 初期EP
      baseAtk: 0,
      baseDef: 0,
      baseBreak: 0,
      // ▲▲▲ 修正ここまで ▲▲▲

      sp: 0,
      deck,
      hand: [],
      secret,
      reservedSP,
      burnout: false,
      breakState: false,
      justBroken: false,
      stealthTurns: 0,
      personalityWord: "",
      isTrinityReady: false,
      trinityTarget: null,
      tags: new Set(),
      overclockTurns: 0,
      virusTurns: 0,
      corrosionTurns: 0,
      damageImmune: false,
      doubleEpNext: false,
      predictionPending: false,
      forcedSlot1: null,
      phantomWeightPending: false,
      isPhantomWeight: false,
      isJammedPending: false,
      jammedIndices: [],
      isManaBarrier: false,
      strategy: "ISTJ", // デフォルト
    };

    if (name === "Enemy") {
      entity.hp = 50;
      entity.maxHp = 50;
      const AI_STRATEGY_NAMES = Object.keys(AI_STRATEGIES);
      const randomStrategyName =
        AI_STRATEGY_NAMES[Math.floor(Math.random() * AI_STRATEGY_NAMES.length)];
      entity.strategy = randomStrategyName;

      const words = AI_PERSONALITIES[randomStrategyName];
      if (words) {
        entity.personalityWord =
          words[Math.floor(Math.random() * words.length)];
      }
      log(
        `[System] Enemy Type: ${randomStrategyName} (${entity.personalityWord})`
      );
    }

    return entity;
  }

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }

  function initBattle() {
    player = createEntity("Player", selectedWeapon, selectedArmor, selectedAcc);
    const wKeys = Object.keys(EQUIPMENT.WEAPONS);
    const aKeys = Object.keys(EQUIPMENT.ARMORS);
    const accKeys = Object.keys(EQUIPMENT.GADGETS);
    const ew = wKeys[Math.floor(Math.random() * wKeys.length)];
    const ea = aKeys[Math.floor(Math.random() * aKeys.length)];
    const eacc = accKeys[Math.floor(Math.random() * accKeys.length)];
    enemy = createEntity("Enemy", ew, ea, eacc);
    const pTag = document.getElementById("e-personality");
    if (enemy.personalityWord) {
      pTag.innerText = `《 ${enemy.personalityWord} 》`;
      pTag.style.display = "inline-block";
    } else {
      pTag.style.display = "none";
    }
    startTurn();
  }

  // MBTI Profiles (Weights) - Same as before
  const AI_PROFILES = {
    ISTJ: {
      aggression: 1.0,
      defense: 3.0,
      breakFocus: 1.0,
      efficiency: 2.0,
      setupPriority: 1.0,
      trinityFocus: 3.0,
      counterBias: 0.1,
    },
    INFJ: {
      aggression: 1.0,
      defense: 1.5,
      breakFocus: 1.0,
      efficiency: 1.0,
      setupPriority: 2.0,
      trinityFocus: 1.0,
      counterBias: 0.7,
    },
    ESTP: {
      aggression: 3.0,
      defense: 0.1,
      breakFocus: 1.0,
      efficiency: 0.0,
      setupPriority: 0.5,
      trinityFocus: 0.5,
      counterBias: 0.2,
    },
    ENTJ: {
      aggression: 2.0,
      defense: 0.5,
      breakFocus: 3.0,
      efficiency: 1.0,
      setupPriority: 3.0,
      trinityFocus: 1.5,
      counterBias: 0.1,
    },
    INTJ: {
      aggression: 1.0,
      defense: 2.0,
      breakFocus: 1.5,
      efficiency: 2.5,
      setupPriority: 3.0,
      trinityFocus: 1.0,
      counterBias: 0.5,
    },
    ISFJ: {
      aggression: 0.8,
      defense: 4.0,
      breakFocus: 0.5,
      efficiency: 1.5,
      setupPriority: 1.0,
      trinityFocus: 1.5,
      counterBias: 0.3,
    },
    INTP: {
      aggression: 1.5,
      defense: 1.0,
      breakFocus: 1.0,
      efficiency: 1.5,
      setupPriority: 2.0,
      trinityFocus: 0.5,
      counterBias: 0.4,
    },
    ENFP: {
      aggression: 2.0,
      defense: 0.5,
      breakFocus: 0.5,
      efficiency: 0.5,
      setupPriority: 1.0,
      trinityFocus: 4.0,
      counterBias: 0.4,
    },
  };

  const AI_STRATEGIES = {};
  Object.keys(AI_PROFILES).forEach((key) => {
    AI_STRATEGIES[key] = (ai, opponent) =>
      runAdvancedAI(ai, opponent, AI_PROFILES[key]);
  });

  const AI_PERSONALITIES = {
    ISTJ: ["規律", "堅実", "定石"],
    INFJ: ["受動的", "静観", "見切"],
    ESTP: ["好戦的", "無謀", "自信"],
    ENTJ: ["支配的", "計画的", "姑息"],
    INTJ: ["狡猾", "合理", "計画的"],
    ISFJ: ["臆病", "保守的", "慎重"],
    INTP: ["多角的", "奇襲", "変則的"],
    ENFP: ["博打", "運任せ", "楽観的"],
  };

  // --- Advanced AI Logic ---
  function getRealCost(entity, cost) {
    if (entity.tags.has("OVERLOAD")) return 0;
    return cost;
  }

  // 予測関数: プレイヤーがどの手札を使う可能性が高いか（簡易確率モデル）
  function predictPlayerHand(p, e) {
    // SMOKE FIX: Check if observer (e) is blinded by stealth
    if (e.stealthTurns > 0) {
      // Blinded! Return dummy data (average assumption)
      return [
        { type: "Attack", cost: 3 },
        { type: "Guard", cost: 2 },
        { type: "Break", cost: 2 },
      ];
    }

    let predictedHand = [...p.hand];
    if (p.secret) predictedHand.push({ ...p.secret, cost: 3 }); // Secretは平均値として扱う
    if (p.reservedSP && p.sp >= MAX_SP) predictedHand.push(p.reservedSP);

    // ジャミングされたカードは除外
    predictedHand = predictedHand.filter(
      (_, i) => !p.jammedIndices.includes(i)
    );

    return predictedHand;
  }

  // シミュレーション＆スコアリング
  function runAdvancedAI(ai, opponent, weights) {
    const opponentForcedCard = opponent.forcedSlot1;

    // Check if player *can* use SP
    const playerHasSPCard = opponent.hand.some((c) => c.isSP);
    const playerHasGauge = opponent.sp >= MAX_SP;
    const playerCanUseSP = playerHasSPCard && playerHasGauge;

    const aiIsLowHP = ai.hp <= ai.maxHp * 0.4;
    const playerIsLowHP = opponent.hp <= opponent.maxHp * 0.4;

    let decidedToCounter = false;

    // 1. カウンター判断
    if (!ai.hasUsedCounter && ai.ep >= 4) {
      let counterProbability = weights.counterBias;

      if (playerCanUseSP) {
        let desperationFactor = 0;
        if (aiIsLowHP) desperationFactor += 0.4;
        if (playerIsLowHP) desperationFactor += 0.2;
        if (ai.hp > ai.maxHp * 0.7) desperationFactor -= 0.1;

        counterProbability = Math.min(
          0.95,
          counterProbability + 0.3 + desperationFactor
        );

        if (Math.random() < counterProbability) {
          return { slots: [null, null], action: "COUNTER" };
        }
      }
    }

    // 2. カード選択
    let hand = ai.hand.map((c, i) => ({ ...c, originalIndex: i }));
    if (ai.reservedSP && ai.sp >= MAX_SP && !ai.hasUsedSP) {
      hand.push({ ...ai.reservedSP, originalIndex: -1 });
    }
    hand = hand.filter((c) =>
      c.originalIndex === -1
        ? true
        : !ai.jammedIndices.includes(c.originalIndex)
    );

    let validPairs = [];

    // If AI's Slot 1 is FORCED:
    if (ai.forcedSlot1) {
      const fCard = ai.forcedSlot1;
      for (let j = 0; j < hand.length; j++) {
        validPairs.push([fCard, hand[j]]);
        validPairs.push([fCard, null]);
      }
      validPairs.push([fCard, null]); // Just in case hand is empty
    } else {
      // Normal logic
      for (let i = 0; i < hand.length; i++) {
        for (let j = 0; j < hand.length; j++) {
          if (i === j) continue;
          validPairs.push([hand[i], hand[j]]);
        }
        validPairs.push([hand[i], null]);
        validPairs.push([null, hand[i]]);
      }
      validPairs.push([null, null]);
    }

    // Budget Filtering
    validPairs = validPairs.filter((pair) => {
      let c1 = pair[0] ? getRealCost(ai, pair[0].cost) : 0;
      let c2 = pair[1] ? getRealCost(ai, pair[1].cost) : 0;
      if (c1 + c2 > ai.ep) return false;
      if (pair[0] && pair[0].isSP && ai.sp < MAX_SP) return false;
      if (pair[1] && pair[1].isSP && ai.sp < MAX_SP) return false;
      return true;
    });

    if (validPairs.length === 0) return { slots: [null, null], action: "WAIT" };

    let bestScore = -Infinity;
    let bestPair = validPairs[0];

    const playerLikelyCards = predictPlayerHand(opponent, ai);
    const wantsToBluff = playerCanUseSP && !decidedToCounter && ai.ep >= 4;

    validPairs.forEach((pair) => {
      let score = 0;
      const card1 = pair[0];
      const card2 = pair[1];
      const cost =
        (card1 ? getRealCost(ai, card1.cost) : 0) +
        (card2 ? getRealCost(ai, card2.cost) : 0);

      if (wantsToBluff) {
        if (cost === 4) score += 60;
        else if (cost < 4) score -= 30;
      }

      if (
        card1 &&
        ai.trinityTarget &&
        card1.type === ai.trinityTarget &&
        ai.isTrinityReady
      ) {
        score += 50 * weights.trinityFocus;
      }

      const remainingEP = ai.ep - cost;
      if (remainingEP === 0) score -= 10 * weights.efficiency;
      if (remainingEP > 2) score += 5 * weights.efficiency;

      // Simulation
      let totalSims = 0;

      const simTargetCards = opponentForcedCard
        ? [opponentForcedCard]
        : playerLikelyCards;

      simTargetCards.forEach((pCard) => {
        totalSims++;
        // Slot 1 Simulation
        // --- FIX: Phantom Weight Logic ---
        let aiCost = card1 ? card1.cost : 0;
        let pCost = pCard ? pCard.cost : 0;

        if (ai.isPhantomWeight && card1) aiCost = 6;
        if (opponent.isPhantomWeight && pCard) pCost = 6;
        // ---------------------------------

        let s1Res = "DRAW";
        if (card1 && pCard) {
          if (WIN_MAP[card1.type] === pCard.type) s1Res = "WIN";
          else if (WIN_MAP[pCard.type] === card1.type) s1Res = "LOSE";
          else {
            // Draw Case: Compare Adjusted Costs
            if (aiCost > pCost) s1Res = "WIN";
            else if (pCost > aiCost) s1Res = "LOSE";
          }
        } else if (card1) s1Res = "WIN";

        // --- FIX: Polarity Shift Logic Check ---
        let simPolarityReversed = isPolarityReversed;
        if (s1Res === "WIN" && card1 && card1.ability === "POLARITY_SHIFT") {
          simPolarityReversed = !simPolarityReversed;
        }
        // ---------------------------------------

        if (s1Res === "WIN") {
          score += 10;
          if (opponentForcedCard) score += 500;

          if (card1.ability) {
            const ab = ABILITIES[card1.ability];
            if (ab.type === "SETUP") score += 20 * weights.setupPriority;
            if (ab.type === "INSTANT") score += 10;
          }
        } else if (s1Res === "LOSE") {
          score -= 15 * weights.defense;
          if (opponentForcedCard) score -= 500;
        }

        // Slot 2
        playerLikelyCards.forEach((pCard2) => {
          let s2Res = "DRAW";
          if (card2 && pCard2) {
            // --- FIX: Polarity Shift Applied to S2 Logic ---
            if (simPolarityReversed) {
              // Inverted Win Condition
              if (WIN_MAP[pCard2.type] === card2.type)
                s2Res = "WIN"; // Originally Lose -> Win
              else if (WIN_MAP[card2.type] === pCard2.type) s2Res = "LOSE"; // Originally Win -> Lose
            } else {
              // Normal Win Condition
              if (WIN_MAP[card2.type] === pCard2.type) s2Res = "WIN";
              else if (WIN_MAP[pCard2.type] === card2.type) s2Res = "LOSE";
            }
            // -----------------------------------------------
          }
          if (s2Res === "WIN") {
            let dmg = card2.dmg || 0;
            if (s1Res === "WIN") dmg *= 1.2;
            else if (s1Res === "LOSE") dmg *= 0.25;
            score += dmg * weights.aggression;

            if (card2.ability) {
              const ab = ABILITIES[card2.ability];
              if (ab.type === "EXECUTE" && opponent.tags.has(ab.reqTag)) {
                score += 100;
              }
            }
          }
        });
      });

      if (score > bestScore) {
        bestScore = score;
        bestPair = pair;
      }
    });

    return { slots: bestPair, action: "COMMIT" };
  }

  // --- Main Logic ---

  function startTurn() {
    pSlots = [null, null];
    isCounterMode = false;
    isAnimating = false;
    isPolarityReversed = false;

    [player, enemy].forEach((e) => {
      if (e.stealthTurns > 0) e.stealthTurns--;
      e.damageImmune = false;
      e.isManaBarrier = false;
      e.isPhantomWeight = false;

      // Reveal Slots Logic (Removed old logic, just logging)
      if (e.revealPending) e.revealPending = false; // Cleanup old prop

      if (e.phantomWeightPending) {
        e.isPhantomWeight = true;
        e.phantomWeightPending = false;
        log(`>> ${e.name} Phantom Weight Active: Slot 1 is Cost 6!`);
      }

      e.jammedIndices = [];
      if (e.isJammedPending) {
        const jammedIdx = Math.floor(Math.random() * 3);
        e.jammedIndices.push(jammedIdx);
        e.isJammedPending = false;
        log(`>> ${e.name} is JAMMED! Card #${jammedIdx + 1} unusable.`);
      }

      if (e.breakState) {
        e.burnout = true;
      }
      if (!e.burnout && !e.breakState) {
        e.pos = Math.min(e.maxPos, e.pos + 2.7);
      }

      let recovery = 4;
      if (e.doubleEpNext) {
        recovery = 8;
        log(`>> ${e.name} recovers DOUBLE EP (Iron Will)!`);
        e.doubleEpNext = false;
      }
      e.ep = Math.min(e.maxEp, e.ep + recovery);
      e.sp = Math.min(MAX_SP, e.sp + 1);

      if (e.tags.has("INFECTED")) {
        e.ep = Math.max(0, e.ep - 2);
        log(`[Virus] ${e.name} loses 2 EP from Infection.`);
        e.virusTurns--;
        if (e.virusTurns <= 0) {
          e.tags.delete("INFECTED");
          log(`[Virus] ${e.name}'s Infection cured.`);
        }
      }

      if (e.corrosionTurns > 0) {
        e.hp -= 3;
        log(`[Corrosion] ${e.name} takes 3 poison damage.`);
        e.corrosionTurns--;
      }

      if (e.tags.has("OVERLOAD")) {
        e.overclockTurns--;
        if (e.overclockTurns <= 0) {
          e.tags.delete("OVERLOAD");
          e.burnout = true;
          e.ep = 0;
          log(
            `[Limit Over] ${e.name}'s Overclock ended. FORCED BURNOUT & EP DRAIN!`
          );
        }
      }

      e.trinityTarget = null;
    });

    // SP CARD INJECTION
    // SP CARD INJECTION
    if (turn === 4) {
      [player, enemy].forEach((e) => {
        if (e.reservedSP) {
          if (e.hp <= e.maxHp * 0.3) {
            e.deck.push(e.reservedSP);
            log(
              `[System] ${e.name}: Crisis Bonus! SP Card added to TOP of deck.`
            );
          } else {
            const idx = Math.floor(Math.random() * (e.deck.length + 1));
            e.deck.splice(idx, 0, e.reservedSP);
            log(`[System] ${e.name}: SP Card added to deck.`);
          }

          // ▼▼▼ 追加: 山札循環用リスト(initialDeckList)にもSPカードを追加する ▼▼▼
          if (e.initialDeckList) {
            e.initialDeckList.push(e.reservedSP);
          }
          // ▲▲▲ 追加ここまで ▲▲▲

          e.reservedSP = null;
        }
      });
    }
    if (!player.initialDeckList && player.deck.length > 0) {
      player.initialDeckList = buildDeck(
        selectedWeapon,
        selectedArmor,
        selectedAcc
      ).deck.filter((c) => !c.isSP);
      enemy.initialDeckList = enemy.deck.filter((c) => !c.isSP);
    }
    // Draw Loop
    [player, enemy].forEach((e) => {
      while (e.hand.length < 3) {
        if (e.deck.length === 0) {
          if (!e.initialDeckList) {
            e.initialDeckList = JSON.parse(JSON.stringify(e.deck));
          } else {
            e.deck = JSON.parse(JSON.stringify(e.initialDeckList));
            shuffle(e.deck);
            log(`[System] ${e.name}'s Deck Recycled`);
          }
        }
        if (e.deck.length === 0 && e.initialDeckList) {
          e.deck = JSON.parse(JSON.stringify(e.initialDeckList));
          shuffle(e.deck);
        }
        if (e.deck.length > 0) {
          e.hand.push(e.deck.pop());
        }
        if (e.hand.length >= 3) break;
      }
    });

    // --- PREDICTION FIX: Forced Slot 1 Logic ---
    [player, enemy].forEach((e) => {
      e.forcedSlot1 = null; // リセット

      if (e.predictionPending) {
        e.predictionPending = false;
        // 手札がある場合のみ発動
        if (e.hand.length > 0) {
          const fIdx = Math.floor(Math.random() * e.hand.length);
          // 手札から抜き出し、ロックフラグを付与
          const forcedCard = e.hand.splice(fIdx, 1)[0];
          e.forcedSlot1 = { ...forcedCard, _locked: true };

          log(
            `>> PREDICTION Effect: ${e.name}'s Slot 1 is FORCED to [${e.forcedSlot1.type}]!`
          );
        }
      }
    });

    // ■ プレイヤーの強制スロットをUI用配列にセット
    if (player.forcedSlot1) {
      pSlots[0] = player.forcedSlot1;
      // ※UI上で選択解除できないように selectCard/clearSlot でのガードも必要（既存コードに含まれています）
    }

    // ■ 敵の強制スロットを「保留中スロット(pendingEnemySlots)」にセット
    // これにより、updateSlotUIが呼ばれたときに表示対象となります
    pendingEnemySlots = [null, null]; // 初期化
    if (enemy.forcedSlot1) {
      pendingEnemySlots[0] = enemy.forcedSlot1;
    }

    // ... (既存の checkTrinityReady() など) ...
    checkTrinityReady();

    // --- AI ACTION DECISION ---
    if (enemy.burnout) {
      // ... (既存のBurnout処理) ...
    } else {
      // AI思考実行
      // AIは player.forcedSlot1 を見てカウンターを決められるようになります
      const aiRes = AI_STRATEGIES[enemy.strategy](enemy, player);

      // AIの結果を適用するが、Slot1が強制されている場合はAIの決定を上書きする
      if (enemy.forcedSlot1) {
        // AIが何を選ぼうとSlot1は強制カードになる
        aiRes.slots[0] = enemy.forcedSlot1;
      }

      pendingEnemySlots = aiRes.slots;
      enemy.isCounterMode = aiRes.action === "COUNTER";

      if (enemy.isCounterMode) {
        log(`[Intel] Enemy is preparing a COUNTER!`);
      }
    }

    log(`--- TURN ${turn} START ---`);
    render();
  }
  function checkTrinityReady() {
    const check = (ent) => {
      const types = new Set(ent.hand.map((c) => c.type));
      ent.isTrinityReady =
        types.has("Attack") && types.has("Guard") && types.has("Break");

      if (ent.isTrinityReady) {
        const targets = ["Attack", "Guard", "Break"];
        ent.trinityTarget = targets[Math.floor(Math.random() * targets.length)];
      } else {
        ent.trinityTarget = null;
      }
    };
    check(player);
    check(enemy);

    const ctxBanner = document.getElementById("battle-context");
    const ctxMsg = document.getElementById("context-msg");
    let activeMsgs = [];

    if (player.isTrinityReady) {
      activeMsgs.push(
        `<span style="color:#ffeb3b">PLAYER:</span> Slot1で <span style="font-weight:bold; color:#fff; text-decoration:underline">${player.trinityTarget}</span> で勝利時、効果上昇。`
      );
    }
    if (enemy.isTrinityReady) {
      activeMsgs.push(
        `<span style="color:#ef5350">ENEMY:</span> Slot1で <span style="font-weight:bold; color:#fff; text-decoration:underline">${enemy.trinityTarget}</span> で勝利時、効果上昇。`
      );
    }

    if (activeMsgs.length > 0) {
      ctxBanner.style.display = "block";
      ctxMsg.innerHTML = activeMsgs.join("<br>");
      if (player.isTrinityReady && enemy.isTrinityReady) {
        ctxBanner.style.background = "linear-gradient(90deg, #555, #999)";
        ctxBanner.style.border = "1px solid #fff";
      } else if (player.isTrinityReady) {
        ctxBanner.style.background = "linear-gradient(90deg, #082954, #3f5ad1)";
        ctxBanner.style.border = "1px solid #91c4ff";
        ctxBanner.style.color = "#fff";
      } else {
        ctxBanner.style.background = "linear-gradient(90deg, #3e2723, #bf360c)";
        ctxBanner.style.border = "1px solid #ffab91";
        ctxBanner.style.color = "#fff";
      }
    } else {
      ctxBanner.style.display = "none";
    }
  }

  function finishTurnProcessing() {
    [player, enemy].forEach((e) => {
      if (e.breakState) {
        if (e.justBroken) {
          e.justBroken = false;
          e.burnout = true;
        } else {
          e.pos = e.maxPos;
          e.breakState = false;
          if (e.ep > 0) e.burnout = false;
          log(`${e.name} RECOVERED from Break!`);
        }
      } else {
        if (e.ep <= 0) {
          e.burnout = true;
          log(`${e.name} enters EP BURNOUT!`);
        } else {
          e.burnout = false;
        }
      }
    });

    turn++;
    render();

    if (player.hp <= 0 || enemy.hp <= 0) {
      setTimeout(() => {
        if (player.hp <= 0) {
          // 敗北時
          game.showResult(false, turn); // ゲームオーバー画面へ
        } else {
          // 勝利時
          alert("YOU WIN!");

          // ★HPの引継ぎ: 戦闘後のHPをゲーム本体に反映
          game.player.hp = Math.max(1, player.hp);

          // ▼▼▼ 修正: ボス戦かどうかで分岐 ▼▼▼
          if (isBossBattle) {
            // ボス戦勝利 -> ゲームクリア画面へ (ターン数を渡す)
            game.showResult(true, turn);
          } else {
            // 通常戦闘勝利 -> 探索画面に戻る
            game.returnToDungeon(true);
          }
          // ▲▲▲ 修正ここまで ▲▲▲
        }
      }, 500);
      return;
    }
    // 戦闘継続なら次のターンへ
    setTimeout(startTurn, 1000);
  }

  function selectCard(card, isSecret, handIndex) {
    if (isAnimating) return;
    hideTooltip();
    if (player.burnout) {
      alert("BURNOUT（行動不能）のため、カードを選択できません。");
      return;
    }
    if (isCounterMode) {
      alert("カウンターモード中はカードを選択できません。");
      return;
    }

    if (!isSecret && player.jammedIndices.includes(handIndex)) {
      alert("このカードはジャミングで使用不能です！");
      return;
    }

    const srcId = isSecret ? "secret" : handIndex;
    // Check if removing from slot 1, but slot 1 is locked
    if (pSlots[0] && pSlots[0]._src === srcId) {
      if (pSlots[0]._locked) {
        alert("このカードはPREDICTION効果により固定されています！");
        return;
      }
      pSlots[0] = null;
      render();
      return;
    }
    if (pSlots[1] && pSlots[1]._src === srcId) {
      pSlots[1] = null;
      render();
      return;
    }

    const realCost = getRealCost(player, card.cost);

    if (card.isSP) {
      if (player.sp < MAX_SP) {
        alert(`SP技を使用するにはSPゲージが最大(${MAX_SP})必要です。`);
        return;
      }
      if (player.ep < realCost) {
        alert(`SP技の発動にはEPが${realCost}必要です。`);
        return;
      }
    }

    if (player.burnout && card.type === TYPE.GUARD) {
      alert("BURNOUT中はガードカードを使用できません！");
      return;
    }

    let currentCost =
      (pSlots[0] ? getRealCost(player, pSlots[0].cost) : 0) +
      (pSlots[1] ? getRealCost(player, pSlots[1].cost) : 0);

    if (currentCost + realCost > player.ep) {
      alert(`EPが足りません！`);
      return;
    }

    if (!pSlots[0]) {
      pSlots[0] = { ...card, _src: srcId };
    } else if (!pSlots[1]) {
      pSlots[1] = { ...card, _src: srcId };
    } else {
      alert("スロットがいっぱいです。");
      return;
    }
    render();
  }

  document.addEventListener("click", (e) => {
    const tt = document.getElementById("card-tooltip");
    if (tt.style.display === "block") hideTooltip();
  });
  document.getElementById("card-tooltip").onclick = (e) => {
    e.stopPropagation();
    hideTooltip();
  };

  function clearSlot(num) {
    if (isAnimating) return;
    if (pSlots[num - 1] && pSlots[num - 1]._locked) {
      alert("このスロットはPREDICTION効果により固定されています！");
      return;
    }
    pSlots[num - 1] = null;
    render();
  }

  function toggleCounter() {
    if (isAnimating) return;
    if (player.burnout) {
      alert("BURNOUT（行動不能）のため、カウンターは使用できません。");
      return;
    }
    if (hasUsedCounter) {
      alert("カウンターは1試合に1回しか使用できません。");
      return;
    }
    if (pSlots[0] && pSlots[0]._locked) {
      alert("強制スロットがあるため、カウンターは選択できません！");
      return;
    }

    const cost = getRealCost(player, COUNTER_EP_COST);
    if (!isCounterMode && player.ep < cost) {
      alert(`カウンター攻撃にはEPが ${cost} 必要です。（現在: ${player.ep}）`);
      return;
    }
    isCounterMode = !isCounterMode;
    if (isCounterMode) pSlots = [null, null];
    render();
  }

  async function commitTurn() {
    if (isAnimating) return;
    let pCost = 0;
    if (isCounterMode) {
      pCost = getRealCost(player, COUNTER_EP_COST);
    } else {
      pCost =
        (pSlots[0] ? getRealCost(player, pSlots[0].cost) : 0) +
        (pSlots[1] ? getRealCost(player, pSlots[1].cost) : 0);
    }

    if (pSlots[0] && pSlots[0]._locked && !pSlots[0]) {
      // Should be handled by UI, but safety check
    }

    isAnimating = true;

    const eSlots = pendingEnemySlots;
    const eCost = enemy.isCounterMode
      ? getRealCost(enemy, COUNTER_EP_COST)
      : (eSlots[0] ? getRealCost(enemy, eSlots[0].cost) : 0) +
        (eSlots[1] ? getRealCost(enemy, eSlots[1].cost) : 0);

    player.ep -= pCost;
    enemy.ep -= eCost;

    if (pSlots.some((c) => c?.isSP)) player.sp = Math.max(0, player.sp - 5);
    if (!enemy.isCounterMode && eSlots.some((c) => c?.isSP)) {
      enemy.sp = Math.max(0, enemy.sp - 5);
      enemy.hasUsedSP = true; // Flag for AI logic
    }

    processHandUsage(player, pSlots);
    if (!enemy.isCounterMode) processHandUsage(enemy, eSlots);
    render();

    if (player.burnout) log("Player is Stunned (Burnout)...");
    if (enemy.burnout) log("Enemy is Stunned (Burnout)...");

    const pAction = isCounterMode ? "COUNTER" : `Cost ${pCost}`;
    const eAction = enemy.isCounterMode ? "COUNTER" : `Cost ${eCost}`;
    log(`Battle! P:[${pAction}] vs E:[${eAction}]`);

    await sleep(600);

    let pCards = [...pSlots];
    let eCards = [...eSlots];
    const pSP = pCards.some((c) => c?.isSP);
    const eSP = eCards.some((c) => c?.isSP);

    // ▼▼▼▼▼ 修正: カットイン演出の追加 ▼▼▼▼▼
    if (pSP && eSP) {
      log("!!! SP CLASH !!! 双方がSPを使用 -> 相殺！");
      await showAbilityAnnouncement(
        "SYSTEM",
        "SP CLASH!!",
        "双方のSP技が衝突し、霧散した！"
      );
      pCards = [null, null];
      eCards = [null, null];
    } else if (eSP && isCounterMode) {
      log("!!! PLAYER COUNTER SUCCESS !!!");
      // ★追加: プレイヤーのカウンター成功演出
      await showAbilityAnnouncement(
        "PLAYER",
        "SP COUNTER!!",
        "敵のSP技を見切り、無効化した！"
      );
      hasUsedCounter = true;
      eCards = [null, null];
    } else if (pSP && enemy.isCounterMode) {
      log("!!! ENEMY COUNTER SUCCESS !!!");
      // ★追加: 敵のカウンター成功演出
      await showAbilityAnnouncement(
        "ENEMY",
        "SP COUNTER!!",
        "プレイヤーのSP技が妨害された！"
      );
      enemy.hasUsedCounter = true;
      pCards = [null, null];
    } else {
      // カウンター失敗時の演出
      if (isCounterMode) {
        log("Player Counter Missed... (EP consumed)");
        // ★追加: プレイヤーのカウンター失敗（空振り）
        await showAbilityAnnouncement(
          "PLAYER",
          "COUNTER FAILED...",
          "読みが外れた… EPを無駄に消費した。"
        );
        hasUsedCounter = true;
      }
      if (enemy.isCounterMode) {
        log("Enemy Counter Missed... (EP consumed)");
        // ★追加: 敵のカウンター失敗
        await showAbilityAnnouncement(
          "ENEMY",
          "COUNTER FAILED...",
          "敵はタイミングを見誤った！"
        );
        enemy.hasUsedCounter = true;
      }
    }
    // ▲▲▲▲▲ 修正ここまで ▲▲▲▲▲

    let pMul = 1.0;
    let eMul = 1.0;

    log("--- SLOT 1 ---");
    const res1 = await resolveStep(1, pCards[0], eCards[0], pMul, eMul, null);

    // GRAVITY logic... (omitted detailed log duplication, assumed handled)
    if (res1 === "WIN" && pCards[0]?.ability === "GRAVITY" && eCards[1]) {
      eCards[1].cost += 3;
      if (enemy.ep < 3) {
        eCards[1] = null;
        enemy.burnout = true;
        log("GRAVITY CRUSH!");
      } else {
        enemy.ep -= 3;
      }
    } else if (
      res1 === "LOSE" &&
      eCards[0]?.ability === "GRAVITY" &&
      pCards[1]
    ) {
      pCards[1].cost += 3;
      if (player.ep < 3) {
        pCards[1] = null;
        player.burnout = true;
        log("GRAVITY CRUSH!");
      } else {
        player.ep -= 3;
      }
    }

    if (res1 === "WIN") {
      pMul = 1.2;
      eMul = 0.25;
      log(">> WIN Bonus: Next x1.2");
    } else if (res1 === "LOSE") {
      pMul = 0.25;
      eMul = 1.2;
      log(">> LOSE Penalty: Next x0.25");
    }

    log("--- SLOT 2 ---");
    await resolveStep(2, pCards[1], eCards[1], pMul, eMul, res1);

    finishTurnProcessing();
  }

  function getMatchupResult(pCard, eCard, isSlot2 = false) {
    if (!eCard) return "WIN";
    if (pCard.type === eCard.type) {
      let pCost = pCard.cost;
      let eCost = eCard.cost;

      if (!isSlot2 && player.isPhantomWeight) pCost = 6;
      if (!isSlot2 && enemy.isPhantomWeight) eCost = 6;

      if (pCost > eCost) return "WIN";
      if (eCost > pCost) return "LOSE";
      return "DRAW";
    }
    if (pCard.type === TYPE.SP) return "WIN";
    if (eCard.type === TYPE.SP) return "LOSE";

    if (isSlot2 && isPolarityReversed) {
      if (WIN_MAP[eCard.type] === pCard.type) return "WIN";
      return "LOSE";
    } else {
      if (WIN_MAP[pCard.type] === eCard.type) return "WIN";
      return "LOSE";
    }
  }

  async function resolveStep(slotNum, pCard, eCard, pMul, eMul, prevResult) {
    const pSlotEl = document.getElementById(`p-slot${slotNum}`);
    const eSlotEl = document.getElementById(`e-slot${slotNum}`);
    pSlotEl.classList.add("active-battle-slot");
    eSlotEl.classList.add("active-battle-slot");

    if (eCard) {
      eSlotEl.className = `slot type-${eCard.type} active-battle-slot`;
      eSlotEl.innerHTML = renderCardContent(eCard);
    } else {
      eSlotEl.className = `slot active-battle-slot`;
      eSlotEl.innerHTML = "Empty";
    }

    if (pCard) {
      pSlotEl.className = `slot type-${pCard.type} active-battle-slot`;
      pSlotEl.innerHTML = renderCardContent(pCard);
    } else {
      pSlotEl.className = `slot active-battle-slot`;
      pSlotEl.innerHTML = "Empty";
    }

    await sleep(1500);

    let result = "DRAW";
    const isSlot2 = slotNum === 2;
    if (!pCard && !eCard) result = "DRAW";
    else if (!pCard) result = "LOSE";
    else if (!eCard) result = "WIN";
    else result = getMatchupResult(pCard, eCard, isSlot2);

    let pBonusMul = 1.0;
    let eBonusMul = 1.0;
    let pFlatDmgBonus = 0;
    let eFlatDmgBonus = 0;
    let pForceBreak = false;
    let eForceBreak = false;
    let pMemoryLeakActive = false;
    let eMemoryLeakActive = false;
    // プレイヤーのSP技発動
    if (result === "WIN" && pCard?.isSP) {
      log(`>>> PLAYER SP ABILITY UNLEASHED!`);
      await showAbilityAnnouncement(
        "PLAYER",
        "SPECIAL ATTACK", // 汎用SP技名
        "最大出力によるガード不能攻撃！"
      );
    }
    // 敵のSP技発動
    if (result === "LOSE" && eCard?.isSP) {
      log(`>>> ENEMY SP ABILITY UNLEASHED!`);
      await showAbilityAnnouncement(
        "ENEMY",
        "SPECIAL ATTACK",
        "敵の最大出力攻撃！ 防御できない！"
      );
    }
    if (slotNum === 1) {
      if (
        result === "WIN" &&
        player.trinityTarget &&
        pCard &&
        pCard.type === player.trinityTarget
      ) {
        pBonusMul *= 1.5;
        showTrinitySuccess(pSlotEl, "PLAYER");
        log(`>>> PLAYER MISSION COMPLETE! (Dmg x1.5)`);
      }
      if (
        result === "LOSE" &&
        enemy.trinityTarget &&
        eCard &&
        eCard.type === enemy.trinityTarget
      ) {
        eBonusMul *= 1.5;
        showTrinitySuccess(eSlotEl, "ENEMY");
        log(`>>> ENEMY MISSION COMPLETE! (Dmg x1.5)`);
      }
    }

    if (result === "WIN" && pCard?.ability) {
      const ab = ABILITIES[pCard.ability];
      if (slotNum === 1 && ["INSTANT", "SETUP", "CLEAR"].includes(ab.type)) {
        let conditionMet = true;
        if (ab.id === "IRON_WILL" && player.hp > MAX_HP * 0.3)
          conditionMet = false;
        if (ab.id === "DESPERATE_STRIKE" && player.hp >= enemy.hp)
          conditionMet = false;

        if (conditionMet) {
          log(`★ Player Trigger: ${ab.name}`);
          await showAbilityAnnouncement(player.name, ab.name, ab.desc);

          if (ab.type === "SETUP") {
            addTag(enemy, ab.tag, ab.tagName);
            if (ab.id === "OVERCLOCK") {
              player.tags.add(ab.tag);
              player.overclockTurns = 3;
              log(">> LIMIT OVER: All Costs 0 for 3 turns!");
            } else if (ab.id === "VIRUS_INSTALL") {
              enemy.virusTurns = 3;
            }
          } else if (ab.type === "CLEAR") {
            clearTags(player);
          } else if (ab.type === "INSTANT") {
            const bonus = await resolveInstantAbility(player, enemy, ab.id);
            if (ab.id === "DESPERATE_STRIKE" && bonus) pFlatDmgBonus = bonus;
          }
        }
      } else if (slotNum === 2 && ab.type === "EXECUTE") {
        if (hasTag(enemy, ab.reqTag)) {
          log(`★ Player Trigger: ${ab.name}`);
          await showAbilityAnnouncement(player.name, ab.name, ab.desc);
          log(`>>> SYNERGY EXECUTION! [${ab.name}] Activated!`);

          if (ab.id === "FIRE_BLAST") {
            pBonusMul *= 3.0;
            enemy.burnout = true;
            log(">> Execute Effect: Enemy Burnout Applied!");
          } else if (ab.id === "FATAL_THRUST") {
            pBonusMul *= 3.0;
          } else if (ab.id === "DATA_DRAIN") {
            const drain = enemy.sp;
            enemy.sp = 0;
            player.sp = Math.min(MAX_SP, player.sp + drain);
            log(`>> DATA DRAIN: Stole ${drain} SP!`);
          } else if (ab.id === "POSTURE_BREAK_EXEC") {
            pForceBreak = true;
            log(">> POSTURE BREAK: Immediate Break Status!");
          } else if (ab.id === "ECHO_STRIKE") {
            pBonusMul *= 2.0;
            log(">> ECHO STRIKE: Damage x2!");
          } else if (ab.id === "MEMORY_LEAK") {
            pMemoryLeakActive = true;
          }
        }
      }
    } else if (result === "LOSE" && eCard?.ability) {
      const ab = ABILITIES[eCard.ability];

      if (slotNum === 1 && ["INSTANT", "SETUP", "CLEAR"].includes(ab.type)) {
        let conditionMet = true;
        if (ab.id === "IRON_WILL" && enemy.hp > MAX_HP * 0.3)
          conditionMet = false;
        if (ab.id === "DESPERATE_STRIKE" && enemy.hp >= player.hp)
          conditionMet = false;

        if (conditionMet) {
          log(`★ Enemy Trigger: ${ab.name}`);
          await showAbilityAnnouncement(enemy.name, ab.name, ab.desc);

          if (ab.type === "SETUP") {
            addTag(player, ab.tag, ab.tagName);
            if (ab.id === "OVERCLOCK") {
              enemy.tags.add(ab.tag);
              enemy.overclockTurns = 3;
            } else if (ab.id === "VIRUS_INSTALL") {
              player.virusTurns = 3;
            }
          } else if (ab.type === "CLEAR") {
            clearTags(enemy);
          } else if (ab.type === "INSTANT") {
            const bonus = await resolveInstantAbility(enemy, player, ab.id);
            if (ab.id === "DESPERATE_STRIKE" && bonus) eFlatDmgBonus = bonus;
          }
        }
      } else if (slotNum === 2 && ab.type === "EXECUTE") {
        if (hasTag(player, ab.reqTag)) {
          log(`★ Enemy Trigger: ${ab.name}`);
          await showAbilityAnnouncement(enemy.name, ab.name, ab.desc);
          log(`>>> SYNERGY EXECUTION! [${ab.name}] Activated!`);

          if (ab.id === "FIRE_BLAST") {
            eBonusMul *= 3.0;
            player.burnout = true;
            log(">> Execute Effect: Player Burnout Applied!");
          } else if (ab.id === "FATAL_THRUST") {
            eBonusMul *= 3.0;
          } else if (ab.id === "DATA_DRAIN") {
            const drain = player.sp;
            player.sp = 0;
            enemy.sp = Math.min(MAX_SP, enemy.sp + drain);
            log(`>> DATA DRAIN: Stole ${drain} SP!`);
          } else if (ab.id === "POSTURE_BREAK_EXEC") {
            eForceBreak = true;
            log(">> POSTURE BREAK: Immediate Break Status!");
          } else if (ab.id === "ECHO_STRIKE") {
            eBonusMul *= 2.0;
            log(">> ECHO STRIKE: Damage x2!");
          } else if (ab.id === "MEMORY_LEAK") {
            eMemoryLeakActive = true;
          }
        }
      }
    }

    const isPlayerGuardVsAtk =
      result === "WIN" &&
      pCard?.type === TYPE.GUARD &&
      eCard?.type === TYPE.ATTACK;
    const isEnemyGuardVsAtk =
      result === "LOSE" &&
      eCard?.type === TYPE.GUARD &&
      pCard?.type === TYPE.ATTACK;

    if (isPlayerGuardVsAtk) {
      log(`Guard Logic: Enemy Attack x0.5 vs Player Armor`);
      await resolveGuardDeflect(player, pCard, eCard, eMul * eBonusMul);
    } else if (isEnemyGuardVsAtk) {
      log(`Guard Logic: Player Attack x0.5 vs Enemy Armor`);
      await resolveGuardDeflect(enemy, eCard, pCard, pMul * pBonusMul);
    } else {
      if (result === "DRAW") {
        if (prevResult === "WIN") {
          const dmg = applyDmg(
            player, // Attacker
            enemy, // Target
            pCard,
            1.5 * pBonusMul,
            pFlatDmgBonus,
            pForceBreak
          );
          if (pMemoryLeakActive && dmg > 0) {
            const loss = Math.floor(dmg * 0.5);
            enemy.sp = Math.max(0, enemy.sp - loss);
            log(`>> MEMORY LEAK: Enemy lost ${loss} SP!`);
          }
          result = "WIN";
        } else if (prevResult === "LOSE") {
          const dmg = applyDmg(
            enemy, // Attacker
            player, // Target
            eCard,
            1.5 * eBonusMul,
            eFlatDmgBonus,
            eForceBreak
          );
          if (eMemoryLeakActive && dmg > 0) {
            const loss = Math.floor(dmg * 0.5);
            player.sp = Math.max(0, player.sp - loss);
            log(`>> MEMORY LEAK: Player lost ${loss} SP!`);
          }
          result = "LOSE";
        } else {
          if (pCard && eCard) {
            player.hp -= 2;
            enemy.hp -= 2;
            log("Draw (Clash)! Both take 2 dmg.");
          }
        }
      } else {
        if (result === "WIN") {
          const dmg = applyDmg(
            player,
            enemy,
            pCard,
            pMul * pBonusMul,
            pFlatDmgBonus,
            pForceBreak
          );
          if (pMemoryLeakActive && dmg > 0) {
            const loss = Math.floor(dmg * 0.5);
            enemy.sp = Math.max(0, enemy.sp - loss);
            log(`>> MEMORY LEAK: Enemy lost ${loss} SP!`);
          }
        } else if (result === "LOSE") {
          const dmg = applyDmg(
            enemy,
            player,
            eCard,
            eMul * eBonusMul,
            eFlatDmgBonus,
            eForceBreak
          );
          if (eMemoryLeakActive && dmg > 0) {
            const loss = Math.floor(dmg * 0.5);
            player.sp = Math.max(0, player.sp - loss);
            log(`>> MEMORY LEAK: Player lost ${loss} SP!`);
          }
        }
      }
    }

    render();
    let overlayText = result;
    if (isSlot2 && isPolarityReversed) overlayText += "?!";

    showResultOverlay(pSlotEl, overlayText);
    showResultOverlay(
      eSlotEl,
      result === "WIN" ? "LOSE" : result === "LOSE" ? "WIN" : "DRAW"
    );

    await sleep(1200);

    pSlotEl.classList.remove("active-battle-slot");
    eSlotEl.classList.remove("active-battle-slot");
    clearOverlays(pSlotEl);
    clearOverlays(eSlotEl);

    return result;
  }

  function addTag(target, tagCode, tagName) {
    if (tagCode === "OVERLOAD") {
      return;
    }
    target.tags.add(tagCode);
    log(`>> Effect: ${target.name} is now [${tagName}]!`);
  }

  function hasTag(target, tagCode) {
    return target.tags.has(tagCode);
  }

  function clearTags(target) {
    target.tags.clear();
    target.virusTurns = 0;
    target.corrosionTurns = 0;
    target.overclockTurns = 0;
    log(`>> Effect: ${target.name} Cleansed all status tags!`);
  }

  function showTrinitySuccess(el, who) {
    const div = document.createElement("div");
    div.className = "trinity-success-overlay";
    div.innerHTML = `★ ${who} CRITICAL ★<br>x1.5 BOOST!`;
    el.appendChild(div);
  }

  async function resolveInstantAbility(user, opponent, abilityId) {
    switch (abilityId) {
      case "EP_CHARGE":
        user.ep = Math.min(user.maxEp, user.ep + 3);
        log(`>> [Instant] ${user.name} recovered 3 EP!`);
        break;
      case "SMOKE":
        opponent.stealthTurns = 2;
        log(`>> [Instant] ${user.name} deploys Smokescreen!`);
        break;
      case "FEINT":
        opponent.ep = Math.max(0, opponent.ep - 2);
        log(`>> [Instant] Feint! ${opponent.name} lost 2 EP.`);
        break;
      case "PREP_ATK":
        const atkIdx = user.deck.findIndex(
          (c) => c.type === TYPE.ATTACK && !c.isSP
        );
        if (atkIdx !== -1) {
          const c = user.deck.splice(atkIdx, 1)[0];
          user.deck.push(c);
          log(`>> [Instant] ${user.name} prepares Attack card.`);
        }
        break;
      case "POLARITY_SHIFT":
        isPolarityReversed = true;
        log(`>> [Polarity Shift] Slot 2 Matchups REVERSED!`);
        break;
      case "GRAVITY":
        break;
      case "IRON_WILL":
        user.damageImmune = true;
        user.doubleEpNext = true;
        log(`>> [Iron Will] Immune this turn & Double EP next turn!`);
        break;
      case "DESPERATE_STRIKE":
        const sacrifice = Math.floor(user.pos / 2);
        user.pos -= sacrifice;
        log(`>> [Desperate Strike] Sacrificed ${sacrifice} Pos for Attack!`);
        return sacrifice;
        break;
      case "PREDICTION":
        opponent.predictionPending = true; // Set Pending flag for forced slot next turn
        log(`>> [Prediction] Opponent's next Slot 1 will be FORCED!`);
        break;
      case "PHANTOM_WEIGHT":
        user.phantomWeightPending = true;
        log(`>> [Phantom Weight] Next turn Slot 1 acts as Cost 6!`);
        break;
      case "JAMMING":
        opponent.isJammedPending = true;
        log(`>> [Jamming] Opponent card will be disabled next turn!`);
        break;
      case "MANA_BARRIER":
        // BUG FIX: EP Check
        if (user.ep >= 3) {
          user.isManaBarrier = true;
          user.ep -= 3;
          log(`>> [Mana Barrier] Barrier Active! (Consumed 3 EP)`);
        } else {
          log(`>> [Mana Barrier] FAILED! Not enough EP (Need 3).`);
        }
        break;
      case "EMERGENCY_REPAIR":
        user.hp = Math.min(user.maxHp, user.hp + 10);
        log(`>> [Repair] Recovered 10 HP!`);
        break;
      case "ENERGY_DRAIN":
        // 相手のEPから最大3を減らす（相手が3未満ならその分だけ）
        const drainAmount = Math.min(opponent.ep, 3);
        opponent.ep -= drainAmount;

        // 自分のEPに加算する（最大値MAX_EPを超えないように）
        user.ep = Math.min(user.maxEp, user.ep + drainAmount);

        log(`>> [Energy Drain] Drained ${drainAmount} EP from opponent!`);
        break;
      case "STUN_SHOT":
        let maxCost = -1;
        let maxIdx = -1;
        opponent.hand.forEach((c, i) => {
          if (c.cost > maxCost) {
            maxCost = c.cost;
            maxIdx = i;
          }
        });
        if (maxIdx !== -1) {
          opponent.hand[maxIdx].cost += 3;
          log(`>> [Stun Shot] Opponent's highest cost card +3 Cost!`);
        }
        break;
      case "CORROSION":
        opponent.corrosionTurns = 2;
        log(`>> [Corrosion] Opponent Poisoned for 2 turns!`);
        break;
      case "SCAN":
        break;
      case "SONAR":
        break;
    }
    return 0;
  }

  function showAbilityAnnouncement(userName, abilityName, abilityDesc) {
    return new Promise((resolve) => {
      const container = document.getElementById("ability-cutin");
      const userEl = document.getElementById("ac-user");
      const nameEl = document.getElementById("ac-name");
      const descEl = document.getElementById("ac-desc");

      userEl.innerText = `${userName}'s Ability!`;
      nameEl.innerText = abilityName;
      descEl.innerText = abilityDesc;

      container.classList.remove("active");
      void container.offsetWidth;
      container.classList.add("active");

      setTimeout(() => {
        resolve();
      }, 2800);
    });
  }

  async function resolveGuardDeflect(
    defender,
    guardCard,
    attackCard,
    attackerMul
  ) {
    if (defender.damageImmune || defender.isManaBarrier) {
      log(`IMMUNE! ${defender.name} takes no damage!`);
      return;
    }
    const rawAtk = (attackCard.dmg || 0) * attackerMul;
    const reducedAtk = Math.floor(rawAtk * 0.5);
    const baseArmor = defender.baseDef || 0;
    const cardArmor = guardCard.arm || 0;
    const armor = cardArmor + baseArmor;
    const finalDmg = Math.max(0, reducedAtk - armor);

    if (finalDmg > 0) {
      defender.hp -= finalDmg;
      log(`GUARD! Dmg: ${finalDmg}`);
    } else {
      log(`BLOCKED!`);
    }
  }

  function showResultOverlay(el, text) {
    const div = document.createElement("div");
    div.className = "slot-result-overlay";
    if (text.includes("WIN")) div.classList.add("res-win");
    if (text.includes("LOSE")) div.classList.add("res-lose");
    if (text.includes("DRAW")) div.classList.add("res-draw");
    div.innerText = text;
    el.appendChild(div);
  }

  function clearOverlays(el) {
    const overs = el.querySelectorAll(
      ".slot-result-overlay, .trinity-success-overlay"
    );
    overs.forEach((o) => o.remove());
  }

  function processHandUsage(entity, slots) {
    slots.forEach((s) => {
      if (!s) return;
      if (s._src === "secret") {
        if (entity.deck.length > 0) entity.secret = entity.deck.pop();
        else entity.secret = null;
      } else {
        const idx = entity.hand.findIndex(
          (c) => c.type === s.type && c.cost === s.cost
        );
        if (idx !== -1) entity.hand.splice(idx, 1);
      }
    });
  }

  function applyDmg(
    attacker,
    target,
    card,
    mul,
    flatBonus = 0,
    forceBreak = false
  ) {
    if (!card && flatBonus === 0) return 0;

    if (target.isManaBarrier && card && !card.isSP) {
      log(`BARRIER! ${target.name} negates damage!`);
      return 0;
    }

    if (target.damageImmune) {
      log(`IMMUNE! ${target.name} takes no damage (Iron Will)!`);
      return 0;
    }

    let finalMul = mul;

    if (target.breakState) finalMul *= 2.0;
    if (target.burnout && !target.breakState) finalMul *= 1.5;

    let dmg = 0;
    if (card && (card.type === TYPE.ATTACK || card.type === TYPE.SP)) {
      const baseVal = attacker.baseAtk || 0;
      const cardVal = card.dmg || 0;
      dmg = Math.floor((baseVal + cardVal) * finalMul);
    }

    if (flatBonus > 0) {
      dmg += flatBonus;
    }

    let pos = 0;
    if (card && card.type !== TYPE.GUARD) {
      const basePos = attacker.baseBreak || 0;
      const cardPos = card.pos || 0;
      pos = Math.floor((basePos + cardPos) * finalMul);
    }

    target.hp -= dmg;
    target.pos -= pos;

    let logMsg = `${target.name} takes `;
    if (dmg > 0) logMsg += `${dmg} HP Dmg`;
    if (dmg > 0 && pos > 0) logMsg += " & ";
    if (pos > 0) logMsg += `${pos} Posture Dmg`;
    if (dmg === 0 && pos === 0) logMsg += "no damage";
    log(logMsg);

    if (forceBreak && !target.breakState) {
      target.pos = 0;
      target.breakState = true;
      target.justBroken = true;
      log(`!!! ${target.name} FORCED BREAK !!!`);
    } else if (target.pos <= 0 && !target.breakState) {
      target.breakState = true;
      target.justBroken = true;
      target.pos = 0;
      log(`!!! ${target.name} POSTURE BREAK !!!`);
    } else if (target.pos < 0) {
      target.pos = 0;
    }
    return dmg;
  }

  function render() {
    ["p", "e"].forEach((prefix) => {
      const e = prefix === "p" ? player : enemy;
      document.getElementById(`${prefix}-hp`).innerText = e.hp;
      if (prefix === "e") {
        document.getElementById(`e-ep`).innerText = e.ep;
        document.getElementById(`e-sp`).innerText = e.sp;
      }

      document.getElementById(`${prefix}-pos`).innerText = Math.floor(e.pos);

      const hpPercent = (e.hp / e.maxHp) * 100;
      const posPercent = (e.pos / e.maxPos) * 100;
      document.getElementById(`${prefix}-hp-bar`).style.width = `${Math.max(
        0,
        hpPercent
      )}%`;
      document.getElementById(`${prefix}-pos-bar`).style.width = `${Math.max(
        0,
        posPercent
      )}%`;
      document.getElementById(`${prefix}-burnout`).style.display = e.burnout
        ? "inline"
        : "none";

      const tagContainer = document.getElementById(`${prefix}-tags`);
      tagContainer.innerHTML = "";
      e.tags.forEach((t) => {
        let name = t;
        for (let key in ABILITIES) {
          if (ABILITIES[key].tag === t) name = ABILITIES[key].tagName || t;
        }
        const badge = document.createElement("span");
        badge.className = "tag-badge";
        badge.innerText = name;
        tagContainer.appendChild(badge);
      });
      if (e.damageImmune) {
        const badge = document.createElement("span");
        badge.className = "tag-badge";
        badge.style.background = "#fff176";
        badge.style.color = "#000";
        badge.innerText = "DMG IMMUNE";
        tagContainer.appendChild(badge);
      }
      if (e.corrosionTurns > 0) {
        const badge = document.createElement("span");
        badge.className = "tag-badge";
        badge.style.background = "#ab47bc";
        badge.innerText = `毒 (${e.corrosionTurns})`;
        tagContainer.appendChild(badge);
      }
      if (e.isPhantomWeight) {
        const badge = document.createElement("span");
        badge.className = "tag-badge";
        badge.style.background = "#90a4ae";
        badge.innerText = `COST OVERRIDE`;
        tagContainer.appendChild(badge);
      }
    });

    const pendingCost = isCounterMode
      ? getRealCost(player, COUNTER_EP_COST)
      : (pSlots[0] ? getRealCost(player, pSlots[0].cost) : 0) +
        (pSlots[1] ? getRealCost(player, pSlots[1].cost) : 0);

    const pendingSP = pSlots.some((c) => c?.isSP) ? 5 : 0;
    const predictedEP = Math.max(0, player.ep - pendingCost);
    const predictedSP = Math.max(0, player.sp - pendingSP);

    const epTxt =
      pendingCost > 0
        ? `${player.ep} <span style="color:#aaa; font-size:0.8em">(-${pendingCost})</span>`
        : player.ep;
    document.getElementById("p-ep-txt").innerHTML = epTxt;

    const spTxt =
      pendingSP > 0
        ? `${player.sp} <span style="color:#aaa; font-size:0.8em">(-${pendingSP})</span>`
        : player.sp;
    document.getElementById("p-sp-txt").innerHTML = spTxt;

    document.getElementById("p-ep-ghost").style.width = `${
      (player.ep / MAX_EP) * 100
    }%`;
    document.getElementById("p-ep-fill").style.width = `${
      (predictedEP / MAX_EP) * 100
    }%`;
    document.getElementById("p-sp-ghost").style.width = `${
      (player.sp / MAX_SP) * 100
    }%`;
    document.getElementById("p-sp-fill").style.width = `${
      (predictedSP / MAX_SP) * 100
    }%`;

    document.getElementById("e-ep-fill").style.width = `${
      (enemy.ep / MAX_EP) * 100
    }%`;
    document.getElementById("e-sp-fill").style.width = `${
      (enemy.sp / MAX_SP) * 100
    }%`;

    const intelBox = document.getElementById("e-intel-box");
    intelBox.style.display = "flex";
    const cost = enemy.isCounterMode
      ? getRealCost(enemy, COUNTER_EP_COST)
      : (pendingEnemySlots[0]
          ? getRealCost(enemy, pendingEnemySlots[0].cost)
          : 0) +
        (pendingEnemySlots[1]
          ? getRealCost(enemy, pendingEnemySlots[1].cost)
          : 0);
    document.getElementById("e-pending-cost").innerText = cost + " EP";

    const eZone = document.getElementById("enemy-hand-view");
    eZone.innerHTML = "";
    const secretDiv = document.createElement("div");
    secretDiv.className = "card type-Secret";
    secretDiv.innerHTML = `<div class="card-type">SECRET</div><div class="card-cost">?</div>`;
    eZone.appendChild(secretDiv);

    enemy.hand.forEach((c) => {
      const isBlinded = player.stealthTurns > 0;
      const cardDiv = document.createElement("div");
      if (isBlinded) {
        cardDiv.className = "card type-Secret";
        cardDiv.innerHTML = `<div class="card-type">SECRET</div><div class="card-cost">?</div>`;
      } else {
        cardDiv.className = `card type-${c.type}`;
        let statsHtml = "";
        if (c.dmg)
          statsHtml += `<div class="stat-row"><span>⚔️</span><span>${c.dmg}</span></div>`;
        if (c.pos)
          statsHtml += `<div class="stat-row"><span style="font-size:0.7em">POS</span><span>${c.pos}</span></div>`;
        if (c.arm)
          statsHtml += `<div class="stat-row"><span>🛡️</span><span>${c.arm}</span></div>`;

        let abilityHtml = "";
        if (c.ability && ABILITIES[c.ability]) {
          const ab = ABILITIES[c.ability];
          let cls = "";
          if (ab.type === "SETUP") cls = "ability-setup";
          if (ab.type === "EXECUTE") cls = "ability-exec";
          abilityHtml = `<div class="ability-badge ${cls}">${ab.name}</div>`;
        }

        cardDiv.innerHTML = `
                <div class="card-type">${c.type}</div>
                <div class="card-cost">${c.cost}</div>
                <div class="card-stats">${statsHtml}</div>
                ${abilityHtml}`;
      }

      if (!isAnimating && !isBlinded) {
        if (pSlots[0]) {
          const res1 = getMatchupResult(pSlots[0], c);
          const badge1 = document.createElement("span");
          badge1.className = `matchup-badge mb-slot1 mb-${res1.toLowerCase()}`;
          badge1.innerText = res1;
          cardDiv.appendChild(badge1);
        }
        if (pSlots[1]) {
          const res2 = getMatchupResult(pSlots[1], c, true);
          const badge2 = document.createElement("span");
          badge2.className = `matchup-badge mb-slot2 mb-${res2.toLowerCase()}`;
          badge2.innerText = res2;
          cardDiv.appendChild(badge2);
        }
      }

      if (!isBlinded) {
        if (!isTouchDevice) {
          cardDiv.onmouseenter = (e) => showTooltip(e, c);
          cardDiv.onmousemove = (e) => moveTooltip(e);
          cardDiv.onmouseleave = () => hideTooltip();
        } else {
          cardDiv.onclick = (e) => {
            showTooltip(e, c);
          };
        }
      }
      eZone.appendChild(cardDiv);
    });

    const pZone = document.getElementById("player-hand-view");
    pZone.innerHTML = "";

    if (player.secret) {
      pZone.appendChild(createCardDiv(player.secret, true, -1));
    }
    player.hand.forEach((c, i) => {
      const div = createCardDiv(c, false, i);
      if (player.jammedIndices.includes(i)) {
        div.classList.add("jammed");
        div.classList.add("disabled");
      }
      pZone.appendChild(div);
    });

    if (!isAnimating) {
      updateSlotUI("p", pSlots);
      updateSlotUI("e", pendingEnemySlots, enemy.revealSlots);
    }

    const btnC = document.getElementById("btn-counter");
    const counterCost = getRealCost(player, COUNTER_EP_COST);
    btnC.innerText = hasUsedCounter
      ? "使用不可"
      : isCounterMode
      ? `カウンター準備中 (Cost: ${counterCost})`
      : `SP カウンター攻撃 (Cost: ${counterCost})`;
    btnC.className = isCounterMode ? "active" : "";
    btnC.disabled = hasUsedCounter || isAnimating || player.burnout;

    const btnCommit = document.getElementById("btn-commit");
    if (isAnimating) {
      btnCommit.innerText = "BATTLE IN PROGRESS...";
      btnCommit.disabled = true;
    } else if (player.burnout) {
      btnCommit.innerText = "ターンをスキップ (BURNOUT)";
      btnCommit.disabled = false;
      btnCommit.style.background = "#555";
    } else {
      btnCommit.innerText = `コマンド決定 (Cost: ${pendingCost})`;
      btnCommit.disabled = pendingCost > player.ep;
      btnCommit.style.background = "var(--accent-color)";
    }
  }

  function createCardDiv(card, isSecret, idx) {
    const div = document.createElement("div");
    div.className = `card type-${card.type}`;
    let disabled = false;
    if (typeof player !== "undefined" && player) {
      if (player.burnout && card.type === TYPE.GUARD) disabled = true;
      const realCost = getRealCost(player, card.cost);
      if (card.isSP && (player.sp < MAX_SP || player.ep < realCost))
        disabled = true;
      const isSel =
        pSlots[0]?._src === (isSecret ? "secret" : idx) ||
        pSlots[1]?._src === (isSecret ? "secret" : idx);
      if (isSel) {
        div.classList.add("selected");
        div.classList.remove("disabled");
      }
    }
    if (disabled) div.classList.add("disabled");

    let statsHtml = "";
    if (card.dmg)
      statsHtml += `<div class="stat-row"><span>⚔️</span><span>${card.dmg}</span></div>`;
    if (card.pos)
      statsHtml += `<div class="stat-row"><span style="font-size:0.7em">POS</span><span>${card.pos}</span></div>`;
    if (card.arm)
      statsHtml += `<div class="stat-row"><span>🛡️</span><span>${card.arm}</span></div>`;

    let abilityHtml = "";
    if (card.ability && ABILITIES[card.ability]) {
      const ab = ABILITIES[card.ability];
      let cls = "";
      if (ab.type === "SETUP") cls = "ability-setup";
      if (ab.type === "EXECUTE") cls = "ability-exec";
      abilityHtml = `<div class="ability-badge ${cls}">${ab.name}</div>`;
    }

    div.innerHTML = `<div class="card-type">${card.type}</div>
             <div class="card-cost">${card.cost}</div>
             <div class="card-stats">${statsHtml}</div>
             ${abilityHtml}
             ${
               isSecret
                 ? '<div style="position:absolute; top:2px; right:2px; font-size:0.5rem; color:#90a4ae; background:rgba(0,0,0,0.7); padding:1px 3px; border-radius:2px;">SECRET</div>'
                 : ""
             }`;

    if (!isTouchDevice) {
      div.onclick = () => selectCard(card, isSecret, idx);
      div.onmouseenter = (e) => showTooltip(e, card);
      div.onmousemove = (e) => moveTooltip(e);
      div.onmouseleave = () => hideTooltip();
    } else {
      let pressTimer;
      let isLongPress = false;
      let isScrolling = false;

      div.addEventListener(
        "touchstart",
        (e) => {
          isLongPress = false;
          isScrolling = false;
          pressTimer = setTimeout(() => {
            isLongPress = true;
            if (navigator.vibrate) navigator.vibrate(50);
            showTooltip(e, card);
          }, 500);
        },
        { passive: true }
      );

      div.addEventListener(
        "touchmove",
        () => {
          clearTimeout(pressTimer);
          isScrolling = true;
        },
        { passive: true }
      );

      div.addEventListener("touchend", (e) => {
        clearTimeout(pressTimer);
        if (isLongPress) {
          if (e.cancelable) e.preventDefault();
        }
      });

      div.onclick = (e) => {
        if (!isLongPress && !isScrolling) {
          selectCard(card, isSecret, idx);
        }
      };
    }
    return div;
  }

  function updateSlotUI(prefix, slots, forceReveal = false) {
    for (let i = 1; i <= 2; i++) {
      const el = document.getElementById(`${prefix}-slot${i}`);
      const c = slots[i - 1];
      // Check locked status
      const isLocked = c && c._locked;

      if (c) {
        el.className = `slot type-${c.type}`;
        if (isLocked) el.classList.add("locked"); // スタイル適用

        // ■ 修正ポイント: 敵(prefix 'e')であっても isLocked なら表示する
        if (prefix === "e" && !forceReveal && !isLocked) {
          // 通常の敵スロット（隠す）
          el.className = `slot`;
          el.innerHTML = `Enemy<br>Slot ${i}`;
        } else {
          // プレイヤー、または強制公開(Reveal)、またはロックされたカード（表示）
          el.innerHTML = renderCardContent(c);
        }
      } else {
        // 空のスロット
        el.className = "slot";
        if (prefix === "p") {
          el.innerHTML = `Tap Card<br>to Set`;
        } else {
          el.innerHTML = `Slot ${i}`;
        }
      }
    }
  }

  function renderCardContent(c) {
    if (!c) return "Empty";
    let abHtml = "";
    if (c.ability && ABILITIES[c.ability]) {
      abHtml = `<div style="font-size:0.6rem; color:var(--accent-color); margin-top:-2px">${
        ABILITIES[c.ability].name
      }</div>`;
    }
    return `<div style="font-weight:bold">${c.type}</div><div style="font-size:1.2rem">${c.cost}</div>${abHtml}`;
  }

  function log(msg) {
    const l = document.getElementById("log");
    l.innerHTML += `<div>${msg}</div>`;
    l.scrollTop = l.scrollHeight;
  }

  // --- Public Interface for game.js ---

  // game.js から呼び出される戦闘開始関数
  function start(mapEntity, isAmbush, bossData = null) {
    hasUsedCounter = false;
    selectedWeapon = game.player.loadout.weapon;
    selectedArmor = game.player.loadout.armor;
    // ★修正7: GADGETS
    selectedAcc = game.player.loadout.gadget;

    // プレイヤーエンティティの作成
    player = createEntity("Player", selectedWeapon, selectedArmor, selectedAcc);

    // HPなどのステータスを同期
    player.hp = game.player.hp;
    player.maxHp = game.player.maxHp;
    // ▼▼▼ 追加: プレイヤーの基礎ステータスと最大EPを同期 ▼▼▼
    player.baseAtk = game.player.baseAtk || 0;
    player.baseDef = game.player.baseDef || 0;
    player.baseBreak = game.player.baseBreak || 0;
    player.maxEp = game.player.maxEp || 8;
    // ▲▲▲ 追加ここまで ▲▲▲

    // 2. 敵データの同期
    // マップ上の敵情報をベースにするか、新規生成するか
    if (bossData) {
      // ボスデータが渡された場合はそれを使用
      enemy = bossData;
      if (typeof enemy.maxEp === "undefined") enemy.maxEp = 8;
      if (typeof enemy.baseAtk === "undefined") enemy.baseAtk = 0;
      if (typeof enemy.baseDef === "undefined") enemy.baseDef = 0;
      if (typeof enemy.baseBreak === "undefined") enemy.baseBreak = 0;
      // 必要な初期化（デッキ構築など）がまだならここで行う
      // ただしボスデータが不完全な場合は補完が必要
      if (!enemy.deck) {
        const keys = Object.keys(EQUIPMENT.WEAPONS);
        const tmp = createEntity("Boss", keys[0], "reaction", "none");
        enemy.deck = tmp.deck;
        enemy.hand = [];
        enemy.tags = new Set();
      }
    } else if (mapEntity && mapEntity.type === "enemy") {
      const wKeys = Object.keys(EQUIPMENT.WEAPONS);
      const aKeys = Object.keys(EQUIPMENT.ARMORS);
      const gKeys = Object.keys(EQUIPMENT.GADGETS);
      const ew = wKeys[Math.floor(Math.random() * wKeys.length)];
      const ea = aKeys[Math.floor(Math.random() * aKeys.length)];
      const eg = gKeys[Math.floor(Math.random() * gKeys.length)];

      enemy = createEntity("Enemy", ew, ea, eg);
    } else {
      const wKeys = Object.keys(EQUIPMENT.WEAPONS);
      enemy = createEntity(
        "Enemy",
        wKeys[0],
        Object.keys(EQUIPMENT.ARMORS)[0],
        Object.keys(EQUIPMENT.GADGETS)[0]
      );
    }

    if (isAmbush) {
      log(">> AMBUSH! Player gets initiative!");
      enemy.hp = Math.floor(enemy.hp * 0.9);
    }

    // 3. UIの表示とターン開始
    // 既存の initBattle の代わり
    const pTag = document.getElementById("e-personality");
    if (enemy.personalityWord) {
      pTag.innerText = `《 ${enemy.personalityWord} 》`;
      pTag.style.display = "inline-block";
    } else {
      pTag.style.display = "none";
    }

    turn = 1;
    startTurn();
  }

  // ★修正9: 外部からのアクセス用にゲッター/セッターを提供
  // ★修正9: 外部からのアクセス用にゲッター/セッターを提供
  // ★修正9: 外部からのアクセス用にゲッター/セッターを提供
  return {
    start: start,
    commitTurn: commitTurn,
    clearSlot: clearSlot,
    toggleCounter: toggleCounter,

    // ★追加: ツールチップ関数を外部に公開する
    showTooltip: showTooltip,
    moveTooltip: moveTooltip,
    hideTooltip: hideTooltip,

    get player() {
      return player;
    },
    get enemy() {
      return enemy;
    },
    set enemy(val) {
      enemy = val;
    },
    get isBossBattle() {
      return isBossBattle;
    },
    set isBossBattle(val) {
      isBossBattle = val;
    },
  };
})();
