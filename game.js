/* --- 1. DATA DEFINITIONS --- */
const TYPE = {
  ATTACK: "Attack",
  GUARD: "Guard",
  BREAK: "Break",
  SP: "SP",
};

// --- Ability Definitions ---
const ABILITIES = {
  EP_CHARGE: {
    id: "EP_CHARGE",
    type: "INSTANT",
    name: "急速充電",
    desc: "【単発】Slot1勝利時、自身のEPを3回復する。",
  },
  SMOKE: {
    id: "SMOKE",
    type: "INSTANT",
    name: "煙幕",
    desc: "【単発】Slot1勝利時、2ターンの間 相手の手札を強制的に隠す。",
  },
  FEINT: {
    id: "FEINT",
    type: "INSTANT",
    name: "EPロスト",
    desc: "【単発】Slot1勝利時、相手のEPを2減らす（妨害）。",
  },
  PREP_ATK: {
    id: "PREP_ATK",
    type: "INSTANT",
    name: "予備動作",
    desc: "【単発】Slot1勝利時、山札から「Attack」カードを探す。",
  },
  PREDICTION: {
    id: "PREDICTION",
    type: "INSTANT",
    name: "未来予測",
    desc: "【単発】Slot1勝利時、次ターンの相手のSlot1を強制的に固定する。",
  },
  ARMOR_BREAK: {
    id: "ARMOR_BREAK",
    type: "SETUP",
    name: "装甲溶解",
    tag: "ARMOR_BROKEN",
    tagName: "装甲劣化",
    desc: "【設置】Slot1勝利時: 相手に『装甲劣化』タグを付与。",
  },
  FATAL_THRUST: {
    id: "FATAL_THRUST",
    type: "EXECUTE",
    name: "急所突き",
    reqTag: "ARMOR_BROKEN",
    desc: "【実行】Slot2勝利時: 相手が『装甲劣化』ならダメージ3倍。",
  },
  OIL_JAR: {
    id: "OIL_JAR",
    type: "SETUP",
    name: "燃料散布",
    tag: "OILED",
    tagName: "引火性",
    desc: "【設置】Slot1勝利時: 相手に『引火性』タグを付与。",
  },
  FIRE_BLAST: {
    id: "FIRE_BLAST",
    type: "EXECUTE",
    name: "点火",
    reqTag: "OILED",
    desc: "【実行】Slot2勝利時: 相手が『引火性』ならDmg 2倍 + 相手Burnout付与。",
  },
  PURIFY: {
    id: "PURIFY",
    type: "CLEAR",
    name: "ナノ洗浄",
    desc: "【単発】Slot1勝利時: 自身の悪い状態タグを全て解除する。",
  },
  OVERCLOCK: {
    id: "OVERCLOCK",
    type: "SETUP",
    name: "リミッター解除",
    tag: "OVERLOAD",
    tagName: "暴走",
    desc: "【設置】Slot1勝利時: 自身に『暴走』付与(3ターン)。全コスト0になるが、終了時に強制Burnout。",
  },
  VIRUS_INSTALL: {
    id: "VIRUS_INSTALL",
    type: "SETUP",
    name: "ウイルス送信",
    tag: "INFECTED",
    tagName: "感染",
    desc: "【設置】Slot1勝利時: 相手に『感染』付与(3T)。毎ターン開始時にEP-2。",
  },
  POLARITY_SHIFT: {
    id: "POLARITY_SHIFT",
    type: "INSTANT",
    name: "位相反転",
    desc: "【単発】Slot1勝利時、このターンSlot2の三竦みを逆転させる（AttackがGuardに勝つ等）。",
  },
  GRAVITY: {
    id: "GRAVITY",
    type: "INSTANT",
    name: "グラビティ",
    desc: "【単発】Slot1勝利時、相手Slot2のコスト+3。EP不足なら強制的にバーンアウトさせる。",
  },
  IRON_WILL: {
    id: "IRON_WILL",
    type: "INSTANT",
    name: "不屈の精神",
    desc: "【単発/HP30%以下】Slot1勝利時、被ダメ0＆次ターンEP回復2倍。",
  },
  DESPERATE_STRIKE: {
    id: "DESPERATE_STRIKE",
    type: "INSTANT",
    name: "捨て身の一撃",
    desc: "【単発/劣勢時】Slot1勝利時、現在姿勢値を半減しその分攻撃力に加算。",
  },
  PHANTOM_WEIGHT: {
    id: "PHANTOM_WEIGHT",
    type: "INSTANT",
    name: "幻影質量",
    desc: "【単発】次ターン、使用者のSlot1の判定コストを6として扱う(EP消費はそのまま)。",
  },
  JAMMING: {
    id: "JAMMING",
    type: "INSTANT",
    name: "ジャミング",
    desc: "【単発】次ターン、相手の手札1枚を使用不可にする。",
  },
  MANA_BARRIER: {
    id: "MANA_BARRIER",
    type: "INSTANT",
    name: "電磁バリア",
    desc: "【単発】HPダメ無効(SP除)。代償:EP-3。",
  },
  EMERGENCY_REPAIR: {
    id: "EMERGENCY_REPAIR",
    type: "INSTANT",
    name: "緊急修復",
    desc: "【単発】HPを10回復する。",
  },
  ENERGY_DRAIN: {
    id: "ENERGY_DRAIN",
    type: "INSTANT",
    name: "EP吸収",
    desc: "【単発】相手EP-3。",
  },
  STUN_SHOT: {
    id: "STUN_SHOT",
    type: "INSTANT",
    name: "重めの一手",
    desc: "【単発】相手手札の最大コストのカードをコスト+3。",
  },
  CORROSION: {
    id: "CORROSION",
    type: "INSTANT",
    name: "有毒ガス",
    desc: "【単発】相手に毒付与(2ターン)。毎ターンHP-3。",
  },
  SCAN: {
    id: "SCAN",
    type: "SETUP",
    name: "スキャン",
    tag: "DETECTED",
    tagName: "解析済",
    desc: "【設置】Slot1勝利時: 相手に『解析済』タグを付与。",
  },
  SONAR: {
    id: "SONAR",
    type: "SETUP",
    name: "ソナー",
    tag: "RESONANCE",
    tagName: "共鳴",
    desc: "【設置】Slot1勝利時: 相手に『共鳴』タグを付与。",
  },
  DATA_DRAIN: {
    id: "DATA_DRAIN",
    type: "EXECUTE",
    name: "SP強奪",
    reqTag: "DETECTED",
    desc: "【実行】Slot2勝利時: 相手が『解析済』ならSPを全て奪う。",
  },
  POSTURE_BREAK_EXEC: {
    id: "POSTURE_BREAK_EXEC",
    type: "EXECUTE",
    name: "クラッシュ",
    reqTag: "ARMOR_BROKEN",
    desc: "【実行】Slot2勝利時: 相手が『装甲劣化』なら強制ブレイク(姿勢0)。",
  },
  ECHO_STRIKE: {
    id: "ECHO_STRIKE",
    type: "EXECUTE",
    name: "二連撃",
    reqTag: "RESONANCE",
    desc: "【実行】Slot2勝利時: 相手が『共鳴』ならダメージを2回与える(x2)。",
  },
  MEMORY_LEAK: {
    id: "MEMORY_LEAK",
    type: "EXECUTE",
    name: "SP破壊",
    reqTag: "INFECTED",
    desc: "【実行】Slot2勝利時: 相手が『感染』なら与ダメの50%分SP減少。",
  },
};

const EQUIPMENT = {
  WEAPONS: {
    鉄塊の大剣: {
      name: "鉄塊の大剣",
      craft_cost: { scrap: 3 },
      cards: [
        { type: TYPE.ATTACK, cost: 5, dmg: 18, pos: 5, ability: "GRAVITY" },
        {
          type: TYPE.ATTACK,
          cost: 3,
          dmg: 15,
          pos: 5,
          ability: "DESPERATE_STRIKE",
        },
        { type: TYPE.BREAK, cost: 4, pos: 15 },
        { type: TYPE.SP, cost: 7, dmg: 50, pos: 20, isSP: true },
      ],
    },
    熱断の刀: {
      name: "熱断の刀",
      craft_cost: { scrap: 5, chip: 2 },
      cards: [
        { type: TYPE.ATTACK, cost: 1, dmg: 6, pos: 2, ability: "OIL_JAR" },
        { type: TYPE.ATTACK, cost: 2, dmg: 8, pos: 2, ability: "FIRE_BLAST" },
        { type: TYPE.GUARD, cost: 2, arm: 6 },
        { type: TYPE.SP, cost: 5, dmg: 30, pos: 5, isSP: true },
      ],
    },
    スタンパイル: {
      name: "スタンパイル",
      craft_cost: { scrap: 5, herb: 2 },
      cards: [
        { type: TYPE.BREAK, cost: 2, pos: 10, ability: "ARMOR_BREAK" },
        {
          type: TYPE.ATTACK,
          cost: 3,
          dmg: 14,
          pos: 6,
          ability: "FATAL_THRUST",
        },
        {
          type: TYPE.ATTACK,
          cost: 5,
          dmg: 18,
          pos: 5,
          ability: "POSTURE_BREAK_EXEC",
        },
        { type: TYPE.SP, cost: 6, dmg: 40, pos: 20, isSP: true },
      ],
    },
    ハックナイフ: {
      name: "ハックナイフ",
      craft_cost: { chip: 5, data: 1 },
      cards: [
        {
          type: TYPE.ATTACK,
          cost: 1,
          dmg: 5,
          pos: 1,
          ability: "VIRUS_INSTALL",
        },
        { type: TYPE.ATTACK, cost: 2, dmg: 10, pos: 3, ability: "MEMORY_LEAK" },
        { type: TYPE.BREAK, cost: 2, pos: 8, ability: "JAMMING" },
        { type: TYPE.SP, cost: 4, dmg: 20, pos: 5, isSP: true },
      ],
    },
    共鳴ブラスター: {
      name: "共鳴ブラスター",
      craft_cost: { chip: 3, scrap: 5 },
      cards: [
        { type: TYPE.BREAK, cost: 2, pos: 5, ability: "SCAN" },
        { type: TYPE.ATTACK, cost: 2, dmg: 8, pos: 2, ability: "SONAR" },
        { type: TYPE.ATTACK, cost: 4, dmg: 14, pos: 5, ability: "ECHO_STRIKE" },
        { type: TYPE.SP, cost: 6, dmg: 45, pos: 10, isSP: true },
      ],
    },
  },
  ARMORS: {
    廃材の鎧: {
      name: "廃材の鎧",
      craft_cost: { scrap: 2 },
      noise: 2, // 隠密性への影響(追加)
      cards: [
        { type: TYPE.GUARD, cost: 2, arm: 8, ability: "PREP_ATK" },
        { type: TYPE.GUARD, cost: 1, arm: 5 },
        { type: TYPE.BREAK, cost: 3, pos: 10 },
      ],
    },
    光学迷彩コート: {
      name: "光学迷彩コート",
      craft_cost: { chip: 3, scrap: 2 },
      noise: 0,
      cards: [
        { type: TYPE.GUARD, cost: 2, arm: 6, ability: "SMOKE" },
        { type: TYPE.GUARD, cost: 2, arm: 8, ability: "FEINT" },
        { type: TYPE.GUARD, cost: 1, arm: 4 },
      ],
    },
    反応装甲: {
      name: "反応装甲",
      craft_cost: { scrap: 8, chip: 2 },
      noise: 3,
      cards: [
        { type: TYPE.GUARD, cost: 4, arm: 20, ability: "IRON_WILL" },
        { type: TYPE.GUARD, cost: 2, arm: 10, ability: "MANA_BARRIER" },
        { type: TYPE.BREAK, cost: 3, pos: 8 },
      ],
    },
    自動修復スーツ: {
      name: "自動修復スーツ",
      craft_cost: { herb: 5, chip: 2 },
      noise: 1,
      cards: [
        { type: TYPE.GUARD, cost: 2, arm: 6, ability: "EMERGENCY_REPAIR" },
        { type: TYPE.GUARD, cost: 2, arm: 8, ability: "PURIFY" },
        { type: TYPE.GUARD, cost: 1, arm: 5 },
      ],
    },
    EP炉心: {
      name: "EP炉心",
      craft_cost: { chip: 5, data: 2 },
      noise: 2,
      cards: [
        { type: TYPE.GUARD, cost: 2, arm: 8, ability: "EP_CHARGE" },
        { type: TYPE.BREAK, cost: 2, pos: 8, ability: "ENERGY_DRAIN" },
        { type: TYPE.GUARD, cost: 1, arm: 5 },
      ],
    },
  },
  GADGETS: {
    解除キー: {
      name: "解除キー",
      craft_cost: { scrap: 2 },
      cards: [
        { type: TYPE.BREAK, cost: 3, pos: 8, ability: "OVERCLOCK" },
        { type: TYPE.BREAK, cost: 3, pos: 8 },
        { type: TYPE.ATTACK, cost: 5, dmg: 20, pos: 0 },
      ],
    },
    戦術バイザー: {
      name: "戦術バイザー",
      craft_cost: { chip: 2 },
      cards: [
        { type: TYPE.GUARD, cost: 2, arm: 6, ability: "PREDICTION" },
        { type: TYPE.BREAK, cost: 2, pos: 6, ability: "SCAN" },
        { type: TYPE.ATTACK, cost: 3, dmg: 10, pos: 5 },
      ],
    },
    位相ズラし装置: {
      name: "位相ズラし装置",
      craft_cost: { data: 1, chip: 2 },
      cards: [
        { type: TYPE.BREAK, cost: 3, pos: 10, ability: "POLARITY_SHIFT" },
        {
          type: TYPE.ATTACK,
          cost: 2,
          dmg: 8,
          pos: 2,
          ability: "PHANTOM_WEIGHT",
        },
        { type: TYPE.GUARD, cost: 2, arm: 6 },
      ],
    },
    汚染アンプル: {
      name: "汚染アンプル",
      craft_cost: { herb: 3, scrap: 2 },
      cards: [
        { type: TYPE.ATTACK, cost: 1, dmg: 5, pos: 2, ability: "CORROSION" },
        { type: TYPE.BREAK, cost: 2, pos: 8, ability: "STUN_SHOT" },
        { type: TYPE.GUARD, cost: 1, arm: 4 },
      ],
    },
    解析端末: {
      name: "解析端末",
      craft_cost: { data: 3 },
      cards: [
        { type: TYPE.BREAK, cost: 3, pos: 10, ability: "DATA_DRAIN" },
        { type: TYPE.BREAK, cost: 2, pos: 5, ability: "SCAN" },
        { type: TYPE.GUARD, cost: 2, arm: 6 },
      ],
    },
  },
};
function openRules() {
  document.getElementById("rule-modal").style.display = "block";
}
function closeRules() {
  document.getElementById("rule-modal").style.display = "none";
}
/* --- 2. GAME ENGINE --- */
const game = {
  state: "INIT",
  day: 1,
  currentEnemy: null, // ★追加: 戦闘中の敵を記憶する変数
  player: {
    hp: 100,
    maxHp: 100,
    stamina: 100,
    maxStamina: 100,
    playerBlock: 0,
    loadout: { weapon: "鉄塊の大剣", armor: "廃材の鎧", gadget: "解除キー" },
    mats: { scrap: 5, chip: 2, herb: 1, data: 0 },
    unlocked: {
      weapon: ["鉄塊の大剣"],
      armor: ["廃材の鎧"],
      gadget: ["解除キー"],
    },
    inventory: [], // 探索中の所持品（最大25個）
  },
  storage: {
    materials: { scrap: 0, chip: 0, herb: 0, data: 0 },
    equipment: [], // 保管庫の装備リスト
  },
  MAX_INVENTORY_SIZE: 25,

  init() {
    this.loadStorage(); // 保管庫を読み込み
    this.showScreen("title-screen");
  },
  // 保管庫をlocalStorageから読み込み
  loadStorage() {
    // ★変更: 読み込み処理をコメントアウトして無効化
    /*
    const saved = localStorage.getItem("dustfall_storage");
    if (saved) {
      try {
        this.storage = JSON.parse(saved);
      } catch (e) {
        console.error("Failed to load storage:", e);
      }
    }
    */
    // 初期状態（空）であることを保証
    this.storage = {
      materials: { scrap: 0, chip: 0, herb: 0, data: 0 },
      equipment: [],
    };
  },

  // 保管庫をlocalStorageに保存
  saveStorage() {
    // ★変更: 保存処理をコメントアウトして無効化
    /*
    try {
      localStorage.setItem("dustfall_storage", JSON.stringify(this.storage));
    } catch (e) {
      console.error("Failed to save storage:", e);
    }
    */
  },
  // 所持品数の計算
  getInventoryCount() {
    let count = 0;
    // 素材の数をカウント
    for (const [mat, amount] of Object.entries(this.player.mats)) {
      count += amount;
    }
    // インベントリ内の装備数をカウント
    count += this.player.inventory.length;
    return count;
  },
  showScreen(id) {
    document
      .querySelectorAll(".screen")
      .forEach((el) => el.classList.remove("active"));
    const target = document.getElementById(id);
    if (target) target.classList.add("active");
  },
  startNewGame() {
    this.day = 1;
    this.player.hp = 100;
    this.updateBaseUI();
    this.showScreen("base-screen");
    this.state = "BASE";
  },
  startExplore() {
    try {
      dungeon.init(this.day);
      this.showScreen("explore-screen");
      this.state = "EXPLORE";
      dungeon.start();
    } catch (error) {
      console.error("Error in startExplore:", error);
      alert("マップ生成に失敗しました: " + error.message);
    }
  },
  rest() {
    this.day++;
    this.player.hp = this.player.maxHp;
    this.updateBaseUI();
    alert(`休憩を終えました。DAY ${this.day} が始まります。`);
  },
  // rest() メソッドの下あたりに追加じゃ
  startBossBattle() {
    if (!confirm("準備はいいか？ これが最後の戦いだ。")) return;

    // ボスのステータス定義
    const boss = {
      name: "THE BOSS",
      hp: 300,
      maxHp: 300,
      pos: 50,
      maxPos: 50,
      ep: 8,
      sp: 0,
      isBroken: false,
      brokenTurns: 0,
      enemyBlock: 0,
      status: { mark: 0 },
      tags: new Set(),

      // ★以下の行を追加してください★
      strategy: "ENTJ", // AIの思考パターン (ENTJ: 支配的・計画的)
      personalityWord: "統率者", // 画面に表示される性格名
      hand: [], // 手札配列の初期化も明示しておくと安全です
    };

    // 状態をBATTLEに変更
    this.state = "BATTLE";
    dungeon.stop();
    battle.isBossBattle = true;

    // バトル開始
    battle.start(null, false, boss);

    // 画面切り替え
    this.showScreen("battle-screen");

    // ボス戦であることをログに出す
    this.log("⚠️ BOSS BATTLE START ⚠️");
  },
  returnToDungeon(enemyKilled) {
    // ★追加: 敵を倒していた場合、その敵を消す（非アクティブにする）
    if (enemyKilled && this.currentEnemy) {
      this.currentEnemy.active = false;
      this.log("敵を撃破した！");
    } else {
      this.log("戦闘から逃れました。");
    }

    this.currentEnemy = null; // リセット
    this.player.playerBlock = 0;

    // 画面切り替え
    this.showScreen("explore-screen");
    this.state = "EXPLORE";

    // HP情報のUI更新
    dungeon.updateUI(); // ★修正: this.updateUI() ではなく dungeon.updateUI() が正しい

    dungeon.start();
  },
  returnToBase(success) {
    dungeon.stop();
    this.day++;

    if (!success) {
      // --- 変更ここから ---
      this.player.hp = Math.max(1, this.player.hp * 0.1);

      // 手荷物 (装備品など) を全消去
      this.player.inventory = [];

      // 素材 (Scrap, Chip, Herb, Data) を全消去
      // ※所持している素材はすべて消えますが、storage(倉庫)の中身は安全です
      this.player.mats = { scrap: 0, chip: 0, herb: 0, data: 0 };

      alert(
        `強制帰還。現在の手荷物・素材は全て喪失しました。\n(DAY ${this.day} になりました)`
      );
      // --- 変更ここまで ---
    } else {
      alert(`安全に帰還しました。\n(DAY ${this.day} になりました)`);
    }

    this.player.playerBlock = 0;
    this.updateBaseUI();
    this.showScreen("base-screen");
    this.state = "BASE";
  },
  log(message) {
    const logEl = document.getElementById("explore-log");
    if (logEl) {
      const msgEl = document.createElement("div");
      msgEl.className = "log-msg";
      msgEl.innerText = message;
      logEl.prepend(msgEl);
      while (logEl.children.length > 20) logEl.removeChild(logEl.lastChild);
    }
  },
  craftItem(itemKey, type, itemCost) {
    // 1. 手荷物容量チェック (探索中のみ)
    if (this.state === "EXPLORE") {
      if (this.getInventoryCount() >= this.MAX_INVENTORY_SIZE) {
        alert("手荷物が一杯です。作成できません。");
        return false;
      }
    }

    // 2. 素材コストのチェック
    for (const [mat, amount] of Object.entries(itemCost)) {
      if (this.player.mats[mat] < amount) {
        alert("資材が足りません。");
        return false;
      }
    }

    // 3. 素材の消費
    for (const [mat, amount] of Object.entries(itemCost)) {
      this.player.mats[mat] -= amount;
    }

    // 4. アイテムの行き先分岐
    // 装備そのもののデータではなく、キー文字列（例: "熱断の刀"）を保存します
    if (this.state === "BASE") {
      // 拠点の場合: 倉庫へ送る
      this.storage.equipment.push(itemKey);
      this.saveStorage(); // 倉庫の状態を保存
      alert(`【${itemKey}】を作成し、倉庫へ送りました。`);
    } else {
      // 探索中の場合: 手荷物へ入れる
      this.player.inventory.push(itemKey);
      alert(`【${itemKey}】を作成し、手荷物に入れました。`);
    }

    // アンロックリストへの追加（図鑑的な用途として残します）
    if (!this.player.unlocked[type].includes(itemKey)) {
      this.player.unlocked[type].push(itemKey);
    }

    // UI更新
    if (this.state === "BASE") {
      this.updateBaseUI();
    } else {
      this.updateExplorePanel();
    }
    return true;
  },
  buildDeck(overrideWeapon, overrideArmor, overrideGadget) {
    // 引数が指定されていればそれを、なければ現在の装備(loadout)を使用
    const wKey = overrideWeapon || this.player.loadout.weapon;
    const aKey = overrideArmor || this.player.loadout.armor;
    const gKey = overrideGadget || this.player.loadout.gadget;

    const deck = [];
    if (EQUIPMENT.WEAPONS[wKey]) deck.push(...EQUIPMENT.WEAPONS[wKey].cards);
    if (EQUIPMENT.ARMORS[aKey]) deck.push(...EQUIPMENT.ARMORS[aKey].cards);
    if (EQUIPMENT.GADGETS[gKey]) deck.push(...EQUIPMENT.GADGETS[gKey].cards);
    return deck;
  },
  renderDeckList(containerId, previewWeapon, previewArmor, previewGadget) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = "";

    // プレビュー用の装備があればそれを渡す
    const deck = this.buildDeck(previewWeapon, previewArmor, previewGadget);

    const countMap = new Map();

    deck.forEach((card) => {
      const key = JSON.stringify({
        type: card.type,
        cost: card.cost,
        ability: card.ability,
        // 数値も区別するために含めるのが安全
        dmg: card.dmg,
        pos: card.pos,
        arm: card.arm,
      });

      if (!countMap.has(key)) {
        countMap.set(key, { count: 0, card: card });
      }
      countMap.get(key).count++;
    });

    countMap.forEach((value) => {
      const { count, card } = value;
      let displayName = card.type;
      if (card.ability && ABILITIES[card.ability]) {
        displayName = ABILITIES[card.ability].name;
      }

      const el = document.createElement("div");
      el.className = "deck-card";
      el.classList.add(`type-${card.type}`);

      el.innerHTML = `
        <div class="deck-card-name">${displayName}${
        count > 1 ? ` x${count}` : ""
      }</div>
        <div class="deck-card-type">${
          card.type
        } <span style="font-size:0.8em">(${card.cost})</span></div>
      `;

      // ★追加: マウスホバーでbattle.jsのツールチップを呼び出す
      // PC向け (マウス操作)
      el.onmouseenter = (e) => {
        if (typeof battle !== "undefined" && battle.showTooltip) {
          battle.showTooltip(e, card);
        }
      };
      el.onmousemove = (e) => {
        if (typeof battle !== "undefined" && battle.moveTooltip) {
          battle.moveTooltip(e);
        }
      };
      el.onmouseleave = () => {
        if (typeof battle !== "undefined" && battle.hideTooltip) {
          battle.hideTooltip();
        }
      };

      // スマホ向け (タップ操作) - 必要であれば有効化
      // タップで詳細表示したい場合は onclick を使用
      el.onclick = (e) => {
        // もし既にツールチップが出ていれば消す、などの制御はお好みで
        if (typeof battle !== "undefined" && battle.showTooltip) {
          battle.showTooltip(e, card);
          e.stopPropagation(); // 親要素への伝播を防ぐ
        }
      };

      container.appendChild(el);
    });
  },
  /* game.js - gameオブジェクト内 */

  renderLoadoutList(listElement, onUpdate, targetDeckId = "base-deck-list") {
    listElement.innerHTML = "";

    const addHeader = (text) => {
      const h3 = document.createElement("h3");
      h3.textContent = text;
      h3.style.fontSize = "14px";
      h3.style.marginTop = "10px";
      listElement.appendChild(h3);
    };

    const renderCat = (db, currentKey, type) => {
      Object.keys(db).forEach((key) => {
        const item = db[key];
        const isEquipped = currentKey === key;
        // インベントリに所持しているかチェック
        const isInInventory = this.player.inventory.includes(key);

        // 作成コストの計算
        let canAfford = true;
        let costDisplay = "";
        if (item.craft_cost) {
          costDisplay = Object.entries(item.craft_cost)
            .map(([k, v]) => `${v} ${k.toUpperCase()}`)
            .join(", ");

          for (const [mat, amount] of Object.entries(item.craft_cost)) {
            if (this.player.mats[mat] < amount) {
              canAfford = false;
              break;
            }
          }
        }

        // 行の作成
        const el = document.createElement("div");
        el.className = `item-row ${isEquipped ? "equipped" : ""}`;
        el.style.display = "flex";
        el.style.flexDirection = "column";
        el.style.alignItems = "stretch";
        el.style.cursor = "default";

        // アイテム名とコスト表示
        const infoDiv = document.createElement("div");
        infoDiv.style.display = "flex";
        infoDiv.style.justifyContent = "space-between";
        infoDiv.innerHTML = `
            <span style="font-weight:bold; color:${
              isEquipped ? "#0f0" : "#ddd"
            }">${item.name}</span>
            <span class="item-cost">${costDisplay}</span>
            `;
        el.appendChild(infoDiv);

        // アクションボタン領域
        const actionsDiv = document.createElement("div");
        actionsDiv.className = "item-actions";
        actionsDiv.style.marginTop = "5px";
        actionsDiv.style.display = "flex";
        actionsDiv.style.gap = "5px";
        actionsDiv.style.justifyContent = "flex-end";

        // 1. プレビューボタン
        const btnPreview = document.createElement("button");
        btnPreview.innerText = "プレビュー";
        btnPreview.className = "btn-preview";
        btnPreview.onclick = (e) => {
          e.stopPropagation();
          let pW = this.player.loadout.weapon;
          let pA = this.player.loadout.armor;
          let pG = this.player.loadout.gadget;
          if (type === "weapon") pW = key;
          if (type === "armor") pA = key;
          if (type === "gadget") pG = key;
          this.renderDeckList(targetDeckId, pW, pA, pG);
        };
        actionsDiv.appendChild(btnPreview);

        // 2. 状態に応じたボタン (装備中 / 装備 / 作成)
        if (isEquipped) {
          const lbl = document.createElement("span");
          lbl.innerText = "装備中";
          lbl.style.fontSize = "11px";
          lbl.style.color = "#0f0";
          lbl.style.alignSelf = "center";
          lbl.style.marginLeft = "5px";
          actionsDiv.appendChild(lbl);
        } else if (isInInventory) {
          // インベントリにある -> 装備ボタン (交換処理)
          const btnEquip = document.createElement("button");
          btnEquip.innerText = "装備";
          btnEquip.className = "btn-equip";
          btnEquip.onclick = (e) => {
            e.stopPropagation();
            this.equipItem(key, type); // ここで交換ロジックを呼ぶ
            if (onUpdate) onUpdate();
          };
          actionsDiv.appendChild(btnEquip);
        } else {
          // インベントリにない -> 作成ボタン
          const btnCraft = document.createElement("button");
          btnCraft.innerText = "作成";
          btnCraft.className = "btn-craft";
          if (!canAfford) {
            btnCraft.disabled = true;
            btnCraft.innerText = "素材不足";
          }
          btnCraft.onclick = (e) => {
            e.stopPropagation();
            if (
              confirm(`【${item.name}】を作成しますか？\n消費: ${costDisplay}`)
            ) {
              // ここで作成ロジックを呼ぶ (buyAndEquip -> craftItem)
              const success = this.craftItem(key, type, item.craft_cost);
              if (success && onUpdate) onUpdate();
            }
          };
          actionsDiv.appendChild(btnCraft);
        }

        el.appendChild(actionsDiv);
        listElement.appendChild(el);
      });
    };

    addHeader("- 武器 -");
    renderCat(EQUIPMENT.WEAPONS, this.player.loadout.weapon, "weapon");
    addHeader("- 防具 -");
    renderCat(EQUIPMENT.ARMORS, this.player.loadout.armor, "armor");
    addHeader("- アビリティ -");
    renderCat(EQUIPMENT.GADGETS, this.player.loadout.gadget, "gadget");
  },
  updateExplorePanel() {
    const list = document.getElementById("explore-loadout-list");
    if (list) {
      // 第3引数に "explore-deck-list" を渡す
      this.renderLoadoutList(
        list,
        () => {
          this.updateExplorePanel();
        },
        "explore-deck-list"
      );
    }
    this.renderDeckList("explore-deck-list");

    // 素材情報を更新
    const matsEl = document.getElementById("explore-mats");
    if (matsEl) {
      const m = this.player.mats;
      matsEl.innerText = `Scrap:${m.scrap} Chip:${m.chip} Herb:${m.herb} Data:${m.data}`;
    }
  },
  /* --- game.js (gameオブジェクト内に追加) --- */

  // 探索画面の装備パネル開閉
  toggleExplorePanel() {
    const panel = document.getElementById("explore-panel");
    if (!panel) return;

    // クラス 'visible' をつけ外しする
    if (panel.classList.contains("visible")) {
      panel.classList.remove("visible");
    } else {
      panel.classList.add("visible");
      // 開いたときに中身を最新化する
      this.updateExplorePanel();
    }
  },
  updateBaseUI() {
    document.getElementById("base-day").innerText = this.day;
    document.getElementById("base-hp").innerText = this.player.hp;
    document.getElementById("base-maxhp").innerText = this.player.maxHp;
    const m = this.player.mats;
    document.getElementById(
      "base-mats"
    ).innerText = `Scrap:${m.scrap} Chip:${m.chip} Herb:${m.herb} Data:${m.data}`;
    document.getElementById("base-decksize").innerText =
      this.buildDeck().length;

    const nav = document.getElementById("base-nav");
    if (nav) {
      // DAYが4以上（3日目の探索終了後）なら、ボス戦モードへ
      if (this.day > 3) {
        nav.innerHTML = `
                <button 
                  onclick="game.startBossBattle()" 
                  style="background: #c3073f; border-color: #f00; width: 100%; font-size: 18px; font-weight: bold;">
                  ⚠️ 決戦に挑む (FINAL BATTLE) ⚠️
                </button>
              `;
      } else {
        // 通常時はいつものボタンを表示
        nav.innerHTML = `
                <button onclick="game.startExplore()">探索に出る</button>
                <button onclick="game.rest()">休憩 (次の日に進む)</button>
              `;
      }
    }

    // インベントリ数の表示
    const invCount = this.getInventoryCount();
    const invCountEl = document.getElementById("inventory-count");
    if (invCountEl) invCountEl.innerText = invCount;

    const list = document.getElementById("loadout-list");
    if (list) {
      // 第3引数に "base-deck-list" を渡す
      this.renderLoadoutList(
        list,
        () => {
          this.updateBaseUI();
        },
        "base-deck-list"
      );
    }
    this.renderDeckList("base-deck-list");

    // インベントリと保管庫の表示
    this.renderInventory();
    this.renderStorage();
  },
  // インベントリの表示
  renderInventory() {
    const container = document.getElementById("inventory-list");
    if (!container) return;
    container.innerHTML = "";

    // 素材を表示
    const matTypes = ["scrap", "chip", "herb", "data"];
    matTypes.forEach((mat) => {
      const amount = this.player.mats[mat] || 0;
      if (amount > 0) {
        const el = document.createElement("div");
        el.className = "item-row";
        el.style.fontSize = "12px";
        el.innerHTML = `<span>${mat.toUpperCase()}: ${amount}</span><button onclick="game.moveToStorage('${mat}', ${amount})" style="padding: 2px 6px; font-size: 10px;">→ Storage</button>`;
        container.appendChild(el);
      }
    });

    // インベントリ内の装備を表示（現在は装備をインベントリに保存する機能がないため、将来の拡張用）
    if (this.player.inventory.length > 0) {
      this.player.inventory.forEach((item, idx) => {
        const el = document.createElement("div");
        el.className = "item-row";
        el.style.fontSize = "12px";
        el.innerHTML = `<span>${
          item.name || item
        }</span><button onclick="game.moveToStorage('equip', ${idx})" style="padding: 2px 6px; font-size: 10px;">→ Storage</button>`;
        container.appendChild(el);
      });
    }

    if (container.children.length === 0) {
      container.innerHTML =
        '<div style="color: #666; font-size: 11px; padding: 5px;">Empty</div>';
    }
  },
  // 保管庫の表示
  renderStorage() {
    const container = document.getElementById("storage-list");
    if (!container) return;
    container.innerHTML = "";

    // 保管庫の素材を表示
    const matTypes = ["scrap", "chip", "herb", "data"];
    matTypes.forEach((mat) => {
      const amount = this.storage.materials[mat] || 0;
      if (amount > 0) {
        const el = document.createElement("div");
        el.className = "item-row";
        el.style.fontSize = "12px";
        el.innerHTML = `<span>${mat.toUpperCase()}: ${amount}</span><div><button onclick="game.moveFromStorage('${mat}', 1)" style="padding: 2px 6px; font-size: 10px; margin-right: 2px;">← 1</button><button onclick="game.takeFromStorage('${mat}')" style="padding: 2px 6px; font-size: 10px;">← All</button></div>`;
        container.appendChild(el);
      }
    });

    // 保管庫の装備を表示
    if (this.storage.equipment && this.storage.equipment.length > 0) {
      this.storage.equipment.forEach((item, idx) => {
        const el = document.createElement("div");
        el.className = "item-row";
        el.style.fontSize = "12px";
        el.innerHTML = `<span>${
          item.name || item
        }</span><button onclick="game.moveFromStorage('equip', ${idx})" style="padding: 2px 6px; font-size: 10px;">← Take</button>`;
        container.appendChild(el);
      });
    }

    if (container.children.length === 0) {
      container.innerHTML =
        '<div style="color: #666; font-size: 11px; padding: 5px;">Empty</div>';
    }
  },
  // 素材を保管庫に移動
  moveToStorage(type, amountOrIndex) {
    if (type === "equip") {
      // 装備を保管庫に移動（将来の拡張用）
      if (this.player.inventory[amountOrIndex]) {
        this.storage.equipment.push(this.player.inventory[amountOrIndex]);
        this.player.inventory.splice(amountOrIndex, 1);
        this.saveStorage();
        this.updateBaseUI();
      }
    } else {
      // 素材を保管庫に移動
      const amount = Math.min(amountOrIndex, this.player.mats[type] || 0);
      if (amount > 0) {
        this.player.mats[type] -= amount;
        this.storage.materials[type] =
          (this.storage.materials[type] || 0) + amount;
        this.saveStorage();
        this.updateBaseUI();
      }
    }
  },
  /* game.js - gameオブジェクト内に追加 */

  equipItem(itemKey, type) {
    // 1. インベントリ内の該当アイテムを探す
    const inventoryIndex = this.player.inventory.indexOf(itemKey);

    if (inventoryIndex === -1) {
      alert(
        "その装備は手荷物(Inventory)にありません。\n倉庫にある場合は手荷物に移してください。"
      );
      return;
    }

    // 2. 現在装備しているアイテムを取得
    const currentEquip = this.player.loadout[type];

    // 3. インベントリから新しい装備を削除
    this.player.inventory.splice(inventoryIndex, 1);

    // 4. 現在の装備をインベントリに戻す
    // (初期装備などで意図せずnullが入っていないか確認)
    if (currentEquip) {
      this.player.inventory.push(currentEquip);
    }

    // 5. 新しい装備を装着
    this.player.loadout[type] = itemKey;

    this.log(`【${itemKey}】を装備しました。`);

    // UI更新
    if (this.state === "BASE") {
      this.updateBaseUI();
    } else {
      this.updateExplorePanel();
    }
  },
  // 保管庫から素材を取り出す
  moveFromStorage(type, amountOrIndex) {
    if (type === "equip") {
      // 装備を取り出す（所持品数のチェック）
      if (this.getInventoryCount() >= this.MAX_INVENTORY_SIZE) {
        alert("手荷物が一杯です。(最大25個)");
        return;
      }
      if (this.storage.equipment[amountOrIndex]) {
        this.player.inventory.push(this.storage.equipment[amountOrIndex]);
        this.storage.equipment.splice(amountOrIndex, 1);
        this.saveStorage();
        this.updateBaseUI();
      }
    } else {
      // 素材を取り出す（所持品数のチェック）
      const available = this.storage.materials[type] || 0;
      if (available === 0) return;

      const currentInvCount = this.getInventoryCount();
      const spaceAvailable = this.MAX_INVENTORY_SIZE - currentInvCount;
      if (spaceAvailable <= 0) {
        alert("手荷物が一杯です。(最大25個)");
        return;
      }

      // 全部取り出すか、一部だけ取り出すかを選択
      const takeAmount = Math.min(amountOrIndex, available, spaceAvailable);
      if (takeAmount > 0) {
        this.storage.materials[type] -= takeAmount;
        this.player.mats[type] = (this.player.mats[type] || 0) + takeAmount;
        this.saveStorage();
        this.updateBaseUI();
      }
    }
  },
  // 保管庫から素材を一部取り出す（ダイアログで数量入力）
  takeFromStorage(type) {
    const available = this.storage.materials[type] || 0;
    if (available === 0) return;

    const currentInvCount = this.getInventoryCount();
    const spaceAvailable = this.MAX_INVENTORY_SIZE - currentInvCount;
    if (spaceAvailable <= 0) {
      alert("手荷物が一杯です。(最大25個)");
      return;
    }

    const maxTake = Math.min(available, spaceAvailable);
    const input = prompt(
      `How many ${type.toUpperCase()} to take? (Available: ${available}, Space: ${spaceAvailable})`,
      maxTake
    );
    if (input === null) return;

    const takeAmount = parseInt(input);
    if (isNaN(takeAmount) || takeAmount <= 0 || takeAmount > maxTake) {
      alert("Invalid amount!");
      return;
    }

    this.storage.materials[type] -= takeAmount;
    this.player.mats[type] = (this.player.mats[type] || 0) + takeAmount;
    this.saveStorage();
    this.updateBaseUI();
  },
  enterBattle(enemy, isAmbush) {
    this.currentEnemy = enemy; // ★戦う敵を記録しておく
    this.state = "BATTLE"; // 状態を戦闘中に変更
    dungeon.stop(); // ★ダンジョンの動き（描画ループ）を止める
    battle.start(enemy, isAmbush); // 戦闘開始
    this.showScreen("battle-screen");
  },
  // ... gameオブジェクトの中に追加 ...

  // スコア計算ロジック
  calculateScore(turns) {
    const hpBonus = this.player.hp * 20;
    // 50ターンを基準に、早ければ早いほど高得点（マイナスにはしない）
    const speedBonus = Math.max(0, (50 - turns) * 30);
    // 所持している素材の総
    return hpBonus + speedBonus;
  },

  // リザルト画面を表示する処理
  showResult(isWin, turns) {
    const container = document.getElementById("result-content");

    if (isWin) {
      // 勝利時：詳細を表示
      const score = this.calculateScore(turns);
      container.innerHTML = `
              <h1 style="color: #4f4;">GAME CLEAR</h1>
              <div class="result-stat">撃破ターン数: <strong>${turns}</strong></div>
              <div class="result-stat">残りHP: <strong>${this.player.hp}</strong></div>
              <div class="score-text">総合ポイント: ${score}点</div>
            `;
    } else {
      // 敗北時：シンプルにGAME OVER
      container.innerHTML = `
              <div class="game-over-text">GAME OVER</div>
            `;
    }

    this.showScreen("result-screen");
  },
};

/* --- 3. DUNGEON LOGIC --- */
const MAP_WIDTH = 50;
const MAP_HEIGHT = 50;
const TILE_SIZE = 15;
const dungeon = {
  canvas: null,
  ctx: null,
  gridX: MAP_WIDTH,
  gridY: MAP_HEIGHT,
  tile: TILE_SIZE,
  map: [],
  entities: [],
  p: { x: 1, y: 1 },
  timer: null,
  timeLeft: 180,
  lastTime: 0,
  enemyMoveTimer: 0,
  init(difficulty) {
    this.canvas = document.getElementById("dungeonCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.map = [];
    for (let y = 0; y < this.gridY; y++) {
      let row = [];
      for (let x = 0; x < this.gridX; x++) row.push(1);
      this.map.push(row);
    }

    // Room-and-Corridor 方式のマップ生成
    const rooms = [];
    const minRoomSize = 4;
    const maxRoomSize = 8;
    const roomAttempts = 50;

    // 1. 部屋を生成
    for (let i = 0; i < roomAttempts; i++) {
      const width =
        minRoomSize +
        Math.floor(Math.random() * (maxRoomSize - minRoomSize + 1));
      const height =
        minRoomSize +
        Math.floor(Math.random() * (maxRoomSize - minRoomSize + 1));

      // 境界チェック
      const maxX = Math.max(2, this.gridX - width - 4);
      const maxY = Math.max(2, this.gridY - height - 4);
      if (maxX <= 2 || maxY <= 2) continue; // マップが小さすぎる場合スキップ

      const x = 2 + Math.floor(Math.random() * (maxX - 2));
      const y = 2 + Math.floor(Math.random() * (maxY - 2));

      // 他の部屋と重なっていないかチェック
      let overlaps = false;
      for (const room of rooms) {
        if (
          x < room.x + room.width + 2 &&
          x + width + 2 > room.x &&
          y < room.y + room.height + 2 &&
          y + height + 2 > room.y
        ) {
          overlaps = true;
          break;
        }
      }

      if (!overlaps) {
        rooms.push({ x, y, width, height });
        // 部屋を描画（壁を含めて）
        for (let ry = y; ry < y + height; ry++) {
          for (let rx = x; rx < x + width; rx++) {
            if (
              ry >= 1 &&
              ry < this.gridY - 1 &&
              rx >= 1 &&
              rx < this.gridX - 1
            ) {
              this.map[ry][rx] = 0;
            }
          }
        }
      }
    }

    // 2. 部屋同士を通路で繋ぐ（Minimum Spanning Tree風）
    if (rooms.length > 1) {
      // 各部屋の中心点を計算
      const centers = rooms.map((room) => ({
        x: Math.floor(room.x + room.width / 2),
        y: Math.floor(room.y + room.height / 2),
      }));

      // 近い部屋同士を繋ぐ（全ペアではなく、近いものだけ）
      for (let i = 0; i < centers.length - 1; i++) {
        // 最も近い部屋を探す
        let closestIdx = i + 1;
        let closestDist = Infinity;
        for (let j = i + 1; j < centers.length; j++) {
          const dist =
            Math.abs(centers[i].x - centers[j].x) +
            Math.abs(centers[i].y - centers[j].y);
          if (dist < closestDist) {
            closestDist = dist;
            closestIdx = j;
          }
        }

        // 通路を作る（幅1マス、L字型）
        this.createLShapedCorridor(
          centers[i].x,
          centers[i].y,
          centers[closestIdx].x,
          centers[closestIdx].y
        );
      }

      // 追加の通路をランダムに追加（分岐点を増やす、一部は幅2マス）
      for (let i = 0; i < Math.floor(rooms.length / 3); i++) {
        const r1 = Math.floor(Math.random() * centers.length);
        const r2 = Math.floor(Math.random() * centers.length);
        if (r1 !== r2) {
          // 30%の確率で幅2マス、それ以外は1マス
          if (Math.random() < 0.3) {
            this.createCorridor(
              centers[r1].x,
              centers[r1].y,
              centers[r2].x,
              centers[r2].y,
              1.5
            );
          } else {
            this.createLShapedCorridor(
              centers[r1].x,
              centers[r1].y,
              centers[r2].x,
              centers[r2].y
            );
          }
        }
      }
    }

    // 3. スタート地点とゴール地点を設定
    this.startRoom = null; // スタート部屋を保存（敵のスポーンを避けるため）
    if (rooms.length > 0) {
      // スタート地点（最初の部屋）
      const startRoom = rooms[0];
      this.startRoom = startRoom; // スタート部屋を保存
      this.p = {
        x: Math.floor(startRoom.x + startRoom.width / 2),
        y: Math.floor(startRoom.y + startRoom.height / 2),
      };

      // ゴール地点（最後の部屋）
      const endRoom = rooms[rooms.length - 1];
      const endX = Math.floor(endRoom.x + endRoom.width / 2);
      const endY = Math.floor(endRoom.y + endRoom.height / 2);
      this.map[endY][endX] = 2;
    } else {
      // フォールバック：部屋が生成できなかった場合
      this.p = { x: 2, y: 2 };
      this.map[2][2] = 0;
      this.map[this.gridY - 3][this.gridX - 3] = 2;
      this.startRoom = { x: 1, y: 1, width: 3, height: 3 }; // フォールバック用
    }

    // 4. 通路の拡張は無効化（迷路構造を保つため）
    // this.expandCorridors();

    // 5. プレイヤー位置の確認（フォールバック）
    if (!this.p || this.map[this.p.y][this.p.x] !== 0) {
      // プレイヤー位置が無効な場合、最初の空きマスを探す
      let found = false;
      for (let y = 1; y < this.gridY - 1 && !found; y++) {
        for (let x = 1; x < this.gridX - 1 && !found; x++) {
          if (this.map[y][x] === 0) {
            this.p = { x, y };
            found = true;
          }
        }
      }
      if (!found) {
        this.p = { x: 1, y: 1 };
        this.map[1][1] = 0;
      }
    }

    // 6. プレイヤーとエンティティの初期化
    game.player.stamina = 100;
    this.timeLeft = 180;
    this.entities = [];
    // 敵の数を減らす（8 + difficulty）
    for (let i = 0; i < 8 + difficulty; i++) this.spawnEntity("enemy");
    // ルートアイテムの数も少し減らす
    for (let i = 0; i < 12; i++) this.spawnEntity("loot");
    window.onkeydown = (e) => {
      if (game.state !== "EXPLORE") return;
      const k = e.key.toLowerCase();

      // Eキーで装備パネルを開閉
      if (k === "e") {
        game.toggleExplorePanel();
        return;
      }

      // パネルが開いているときは移動を無効化
      const panel = document.getElementById("explore-panel");
      if (panel && panel.classList.contains("visible")) return;

      if (e.shiftKey) game.player.isStealth = true;
      let dx = 0,
        dy = 0;
      if (k === "w" || k === "arrowup") dy = -1;
      if (k === "s" || k === "arrowdown") dy = 1;
      if (k === "a" || k === "arrowleft") dx = -1;
      if (k === "d" || k === "arrowright") dx = 1;
      if (dx !== 0 || dy !== 0) this.movePlayer(dx, dy);
    };
    window.onkeyup = (e) => {
      if (e.key === "Shift") game.player.isStealth = false;
    };
  },
  // L字型の通路を作る関数（より迷路らしく）
  createLShapedCorridor(x1, y1, x2, y2) {
    // ランダムに横→縦または縦→横を選択
    if (Math.random() < 0.5) {
      // 横→縦: (x1,y1) → (x2,y1) → (x2,y2)
      const startX = Math.min(x1, x2);
      const endX = Math.max(x1, x2);
      for (let x = startX; x <= endX; x++) {
        if (x >= 1 && x < this.gridX - 1 && y1 >= 1 && y1 < this.gridY - 1) {
          this.map[y1][x] = 0;
        }
      }
      const startY = Math.min(y1, y2);
      const endY = Math.max(y1, y2);
      for (let y = startY; y <= endY; y++) {
        if (x2 >= 1 && x2 < this.gridX - 1 && y >= 1 && y < this.gridY - 1) {
          this.map[y][x2] = 0;
        }
      }
    } else {
      // 縦→横: (x1,y1) → (x1,y2) → (x2,y2)
      const startY = Math.min(y1, y2);
      const endY = Math.max(y1, y2);
      for (let y = startY; y <= endY; y++) {
        if (x1 >= 1 && x1 < this.gridX - 1 && y >= 1 && y < this.gridY - 1) {
          this.map[y][x1] = 0;
        }
      }
      const startX = Math.min(x1, x2);
      const endX = Math.max(x1, x2);
      for (let x = startX; x <= endX; x++) {
        if (x >= 1 && x < this.gridX - 1 && y2 >= 1 && y2 < this.gridY - 1) {
          this.map[y2][x] = 0;
        }
      }
    }
  },
  // 通路を作る関数（幅指定可能、主に分岐点用）
  createCorridor(x1, y1, x2, y2, width = 1) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const steps = Math.max(Math.abs(dx), Math.abs(dy));

    for (let i = 0; i <= steps; i++) {
      const t = steps === 0 ? 0 : i / steps;
      const cx = Math.floor(x1 + dx * t);
      const cy = Math.floor(y1 + dy * t);

      // 通路の幅分、周辺も開ける（1.5の場合は2マス幅）
      const halfWidth = width >= 1.5 ? 1 : 0;
      for (let wy = -halfWidth; wy <= halfWidth; wy++) {
        for (let wx = -halfWidth; wx <= halfWidth; wx++) {
          const nx = cx + wx;
          const ny = cy + wy;
          if (
            nx >= 1 &&
            nx < this.gridX - 1 &&
            ny >= 1 &&
            ny < this.gridY - 1
          ) {
            this.map[ny][nx] = 0;
          }
        }
      }
    }
  },
  // 通路を少し拡張する（より広い印象にする）
  expandCorridors() {
    // マップのコピーを作成
    const expanded = [];
    for (let y = 0; y < this.gridY; y++) {
      expanded.push([]);
      for (let x = 0; x < this.gridX; x++) {
        expanded[y].push(this.map[y][x]);
      }
    }

    for (let y = 1; y < this.gridY - 1; y++) {
      for (let x = 1; x < this.gridX - 1; x++) {
        if (this.map[y][x] === 0) {
          // 通路の周辺を少し開ける（確率的に）
          if (Math.random() < 0.3) {
            const dirs = [
              [0, 1],
              [0, -1],
              [1, 0],
              [-1, 0],
            ];
            for (const [dx, dy] of dirs) {
              const nx = x + dx;
              const ny = y + dy;
              if (
                nx >= 1 &&
                nx < this.gridX - 1 &&
                ny >= 1 &&
                ny < this.gridY - 1
              ) {
                if (this.map[ny][nx] === 1 && Math.random() < 0.4) {
                  expanded[ny][nx] = 0;
                }
              }
            }
          }
        }
      }
    }

    // 拡張したマップを適用
    for (let y = 1; y < this.gridY - 1; y++) {
      for (let x = 1; x < this.gridX - 1; x++) {
        this.map[y][x] = expanded[y][x];
      }
    }
  },
  spawnEntity(type) {
    let x, y;
    let attempts = 0;
    let isValid = false;
    do {
      x = Math.floor(Math.random() * (this.gridX - 2)) + 1;
      y = Math.floor(Math.random() * (this.gridY - 2)) + 1;
      attempts++;
      if (attempts > 1000) {
        // 1000回試行しても見つからない場合はスキップ
        console.warn(`Could not spawn ${type} after 1000 attempts`);
        return;
      }

      // チェック条件
      const isWalkable = this.map[y][x] === 0;
      const isPlayerPos = x === this.p.x && y === this.p.y;

      // スタート部屋内かチェック（マージン付き）
      let isInStartRoom = false;
      if (this.startRoom) {
        const margin = 2; // 周辺2マスも安全地帯
        isInStartRoom =
          x >= this.startRoom.x - margin &&
          x < this.startRoom.x + this.startRoom.width + margin &&
          y >= this.startRoom.y - margin &&
          y < this.startRoom.y + this.startRoom.height + margin;
      }

      // プレイヤーから一定距離以内かチェック（敵のみ）
      const distFromPlayer = Math.abs(x - this.p.x) + Math.abs(y - this.p.y);
      const tooCloseToPlayer = type === "enemy" && distFromPlayer < 8; // 8マス以内は敵を配置しない

      isValid =
        isWalkable && !isPlayerPos && !isInStartRoom && !tooCloseToPlayer;
    } while (!isValid);
    const entity = {
      x,
      y,
      type,
      active: true,
      facing: Math.floor(Math.random() * 4),
      aggro: false,
      vision: type === "enemy" ? 4 : 0, // 簡易化: 敵以外は視界0
      lastSeenPlayer: null,
      aggroTimer: 0,
    };

    // typeが 'loot' (素材) の場合、中身を確率で抽選する
    if (type === "loot") {
      const rand = Math.random();
      if (rand < 0.5) {
        entity.lootType = "scrap"; // 50%
      } else if (rand < 0.7) {
        entity.lootType = "herb"; // 20% (0.5~0.7)
      } else if (rand < 0.9) {
        entity.lootType = "chip"; // 20% (0.7~0.9)
      } else {
        entity.lootType = "data"; // 10% (0.9~1.0)
      }
    }

    // 視界の計算（既存コードの調整）
    if (type === "enemy") {
      const pArmor = EQUIPMENT.ARMORS[game.player.loadout.armor];
      let armorNoise = pArmor ? pArmor.noise || 0 : 0;
      entity.vision = 4 + armorNoise;
    }

    this.entities.push(entity);
  },
  start() {
    this.lastTime = Date.now();
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => this.loop(), 50);
  },
  stop() {
    if (this.timer) clearInterval(this.timer);
  },
  loop() {
    if (game.state !== "EXPLORE") return;
    const now = Date.now();
    const dt = (now - this.lastTime) / 1000;
    this.lastTime = now;
    this.timeLeft -= dt;
    if (this.timeLeft <= 0) {
      this.timeLeft = 0;
      game.returnToBase(false);
      return;
    }
    this.enemyMoveTimer += dt;
    if (this.enemyMoveTimer >= 0.65) {
      this.updateEnemies();
      this.enemyMoveTimer = 0;
    }
    if (!game.player.isStealth && game.player.stamina < 100)
      game.player.stamina += 0.5;
    this.draw();
    this.updateUI();
  },
  movePlayer(dx, dy) {
    let cost = 0;
    if (game.player.isStealth) {
      // 修正: EQUIPMENT経由でアクセスし、noiseがない場合はデフォルト0
      const currentArmor = EQUIPMENT.ARMORS[game.player.loadout.armor];
      const currentWeapon = EQUIPMENT.WEAPONS[game.player.loadout.weapon];

      const armorNoise = currentArmor ? currentArmor.noise || 0 : 0;
      const weaponNoise = currentWeapon ? currentWeapon.noise || 0 : 0;

      cost = 1 + armorNoise + weaponNoise;
      // ... (以下略)
      if (game.player.stamina < cost) {
        game.player.isStealth = false;
        cost = 0;
      } else {
        game.player.stamina -= cost;
      }
    }
    const nx = this.p.x + dx;
    const ny = this.p.y + dy;
    if (this.map[ny][nx] === 1) return;
    if (this.map[ny][nx] === 2) {
      game.returnToBase(true);
      return;
    }
    const hit = this.entities.find((e) => e.x === nx && e.y === ny && e.active);
    if (hit) {
      if (hit.type === "enemy") {
        let pDir = -1;
        if (dy === -1) pDir = 0;
        if (dx === 1) pDir = 1;
        if (dy === 1) pDir = 2;
        if (dx === -1) pDir = 3;
        const isFrontal = Math.abs(pDir - hit.facing) === 2;
        let isAmbush = game.player.isStealth && !isFrontal;
        game.enterBattle(hit, isAmbush);
        return;
        // ... (enemyとの衝突判定の直後) ...
      } else if (hit.type === "loot") {
        // 所持品数のチェック
        if (game.getInventoryCount() >= game.MAX_INVENTORY_SIZE) {
          game.log("手荷物が一杯です。(Scrap等を拾えません)");
          return; // active = false にせずにリターンすることで、拾わずに残す
        }

        // アイテムを消す
        hit.active = false;

        // ▼▼▼ 修正箇所: 設定されたlootTypeに応じて素材を増やす ▼▼▼
        const matName = hit.lootType || "scrap"; // 未設定ならscrap
        game.player.mats[matName]++;

        // ログ出力 (先頭を大文字にして表示)
        game.log(`${matName.toUpperCase()}を取得!`);
      }
    }

    // ... (以下、移動処理へ続く) ...
    this.p.x = nx;
    this.p.y = ny;
    if (!game.player.isStealth) {
      this.entities.forEach((e) => {
        if (e.type === "enemy" && e.active && !e.aggro) {
          const dist = Math.abs(e.x - nx) + Math.abs(e.y - ny);
          if (dist <= 4) {
            e.aggro = true;
            if (Math.abs(e.x - nx) > Math.abs(e.y - ny))
              e.facing = e.x > nx ? 3 : 1;
            else e.facing = e.y > ny ? 0 : 2;
          }
        }
      });
    }
  },
  // プレイヤーまでの距離を計算（マンハッタン距離）
  getDistance(x1, y1, x2, y2) {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
  },
  // 幅優先探索（BFS）でターゲットまでのパスを計算（最大深度制限付き）
  findPath(startX, startY, targetX, targetY, maxDepth = 25) {
    const queue = [[startX, startY, []]];
    const visited = new Set();
    visited.add(`${startX},${startY}`);
    const directions = [
      [0, -1],
      [1, 0],
      [0, 1],
      [-1, 0],
    ];

    while (queue.length > 0) {
      const [x, y, path] = queue.shift();

      // 最大深度チェック
      if (path.length >= maxDepth) continue;

      // ターゲットに到達
      if (x === targetX && y === targetY) {
        return path;
      }

      // 4方向を探索
      for (const [dx, dy] of directions) {
        const nx = x + dx;
        const ny = y + dy;
        const key = `${nx},${ny}`;

        if (!visited.has(key) && this.isWalkable(nx, ny)) {
          visited.add(key);
          queue.push([nx, ny, [...path, [dx, dy]]]);
        }
      }
    }

    // パスが見つからない場合、nullを返す
    return null;
  },
  // 最良の移動方向を選択（パスファインディングを使用）
  findBestMove(e, targetX, targetY) {
    const directions = [
      [0, -1, 0], // 上
      [1, 0, 1], // 右
      [0, 1, 2], // 下
      [-1, 0, 3], // 左
    ];

    // パスファインディングで最短経路を探す
    const path = this.findPath(e.x, e.y, targetX, targetY);

    if (path && path.length > 0) {
      // パスが存在する場合、最初のステップを実行
      const [dx, dy] = path[0];
      const facing = directions.findIndex((d) => d[0] === dx && d[1] === dy);
      const nx = e.x + dx;
      const ny = e.y + dy;

      if (this.isWalkable(nx, ny)) {
        return {
          x: nx,
          y: ny,
          facing: facing >= 0 ? facing : e.facing,
          dx: dx,
          dy: dy,
        };
      }
    }

    // パスが見つからない場合、直接距離で最良の方向を選ぶ（フォールバック）
    let bestMove = null;
    let bestDistance = Infinity;
    const currentDist = this.getDistance(e.x, e.y, targetX, targetY);

    // 各方向を評価（2ステップ先も考慮）
    for (const [dx, dy, facing] of directions) {
      const nx = e.x + dx;
      const ny = e.y + dy;

      if (this.isWalkable(nx, ny)) {
        const newDist = this.getDistance(nx, ny, targetX, targetY);

        // さらに2ステップ先を見て、移動可能な経路があるか確認
        let hasPathAhead = false;
        for (const [dx2, dy2] of directions) {
          const nx2 = nx + dx2;
          const ny2 = ny + dy2;
          if (this.isWalkable(nx2, ny2)) {
            hasPathAhead = true;
            break;
          }
        }

        // より近づける方向、または行き詰まりでない方向を優先
        const score = newDist - (hasPathAhead ? 0.5 : -10);
        if (score < bestDistance) {
          bestDistance = score;
          bestMove = { x: nx, y: ny, facing: facing, dx: dx, dy: dy };
        }
      }
    }

    // どの方向も移動できない場合、現在位置を維持
    if (!bestMove) {
      return { x: e.x, y: e.y, facing: e.facing, dx: 0, dy: 0 };
    }

    return bestMove;
  },
  updateEnemies() {
    this.entities.forEach((e) => {
      if (e.type !== "enemy" || !e.active) return;
      const dx = this.p.x - e.x;
      const dy = this.p.y - e.y;
      const dist = Math.abs(dx) + Math.abs(dy);

      // 視界判定（より広い視野角）
      let inSight = false;
      if (dist <= e.vision) {
        // 視野角を広げる（左右90度）
        if (e.facing === 0 && dy < 0 && Math.abs(dx) <= Math.abs(dy) * 2)
          inSight = true;
        if (e.facing === 1 && dx > 0 && Math.abs(dy) <= Math.abs(dx) * 2)
          inSight = true;
        if (e.facing === 2 && dy > 0 && Math.abs(dx) <= Math.abs(dy) * 2)
          inSight = true;
        if (e.facing === 3 && dx < 0 && Math.abs(dy) <= Math.abs(dx) * 2)
          inSight = true;
      }

      // プレイヤーが視界内でステルス状態でない場合、aggro状態にする
      if (inSight && !game.player.isStealth) {
        e.aggro = true;
        e.lastSeenPlayer = { x: this.p.x, y: this.p.y };
        e.aggroTimer = 30; // 30ターン追跡を継続
      }

      // 一定距離以内なら追跡を継続（視界外でも）
      if (e.aggro && dist <= e.vision * 4 && !game.player.isStealth) {
        e.lastSeenPlayer = { x: this.p.x, y: this.p.y };
        e.aggroTimer = Math.max(e.aggroTimer, 15);
      }

      // aggro状態の処理
      if (e.aggro) {
        // タイマーを減らす（プレイヤーを見失った場合の追跡時間）
        if (e.aggroTimer) e.aggroTimer--;

        // 現在プレイヤーが見えているかチェック（ステルスでなく、視界内）
        const currentlyVisible =
          !game.player.isStealth && dist <= e.vision && inSight;

        // ターゲット位置を決定
        let targetX = this.p.x;
        let targetY = this.p.y;

        if (currentlyVisible) {
          // プレイヤーが見えている場合は直接追跡
          e.lastSeenPlayer = { x: this.p.x, y: this.p.y };
          e.aggroTimer = Math.max(e.aggroTimer, 30);
          targetX = this.p.x;
          targetY = this.p.y;
        } else if (e.lastSeenPlayer) {
          // プレイヤーが見えない場合
          const distToLastSeen = this.getDistance(
            e.x,
            e.y,
            e.lastSeenPlayer.x,
            e.lastSeenPlayer.y
          );

          // 最後に見た位置に到達している、またはプレイヤーが近い場合はプレイヤーを直接追跡
          if (distToLastSeen <= 2 || dist <= e.vision * 3) {
            // プレイヤーへのパスがあるか試す
            const pathToPlayer = this.findPath(
              e.x,
              e.y,
              this.p.x,
              this.p.y,
              20
            );
            if (pathToPlayer && pathToPlayer.length > 0) {
              targetX = this.p.x;
              targetY = this.p.y;
              e.lastSeenPlayer = { x: this.p.x, y: this.p.y };
            } else {
              // パスがない場合は最後に見た位置へ
              targetX = e.lastSeenPlayer.x;
              targetY = e.lastSeenPlayer.y;
            }
          } else {
            // まだ最後に見た位置に到達していない
            targetX = e.lastSeenPlayer.x;
            targetY = e.lastSeenPlayer.y;
          }
        }

        // 最良の移動方向を選択（パスファインディング使用）
        const bestMove = this.findBestMove(e, targetX, targetY);

        // 移動が成功した場合のみ位置を更新
        if (bestMove.x !== e.x || bestMove.y !== e.y) {
          e.x = bestMove.x;
          e.y = bestMove.y;
          e.facing = bestMove.facing;
        }

        // プレイヤーと同じ位置になったら戦闘開始
        if (e.x === this.p.x && e.y === this.p.y) {
          game.enterBattle(e, false);
        }

        // タイマー切れで追跡をやめる（距離が遠すぎる場合のみ）
        if (e.aggroTimer <= 0 && dist > e.vision * 5) {
          e.aggro = false;
          e.lastSeenPlayer = null;
        }
      } else {
        // aggroでない場合の通常行動
        if (Math.random() < 0.3) {
          const dirs = [
            [0, -1, 0],
            [1, 0, 1],
            [0, 1, 2],
            [-1, 0, 3],
          ];
          const dIdx = Math.floor(Math.random() * 4);
          const d = dirs[dIdx];
          const nx = e.x + d[0];
          const ny = e.y + d[1];
          e.facing = d[2];
          if (this.isWalkable(nx, ny)) {
            e.x = nx;
            e.y = ny;
          }
        }
      }
    });
  },
  isWalkable(x, y) {
    if (y < 0 || y >= this.gridY || x < 0 || x >= this.gridX) return false;
    if (this.map[y][x] === 1) return false;
    if (
      this.entities.some(
        (e) => e.active && e.x === x && e.y === y && e.type !== "loot"
      )
    )
      return false;
    return true;
  },
  draw() {
    const ctx = this.ctx;
    const ts = this.tile;
    const cw = this.canvas.width;
    const ch = this.canvas.height;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, cw, ch);
    const offsetX = Math.floor(cw / 2 / ts) - this.p.x;
    const offsetY = Math.floor(ch / 2 / ts) - this.p.y;
    for (let y = 0; y < this.gridY; y++) {
      for (let x = 0; x < this.gridX; x++) {
        const drawX = (x + offsetX) * ts;
        const drawY = (y + offsetY) * ts;
        if (drawX < -ts || drawX > cw || drawY < -ts || drawY > ch) continue;
        const dist = Math.sqrt((x - this.p.x) ** 2 + (y - this.p.y) ** 2);
        if (dist < 10) {
          if (this.map[y][x] === 1) {
            ctx.fillStyle = "#444";
            ctx.fillRect(drawX, drawY, ts, ts);
          } else if (this.map[y][x] === 2) {
            ctx.fillStyle = "#0f0";
            ctx.fillRect(drawX, drawY, ts, ts);
          } else {
            ctx.fillStyle = "#222";
            ctx.fillRect(drawX, drawY, ts - 1, ts - 1);
          }
        }
      }
    }
    this.entities.forEach((e) => {
      if (!e.active) return;
      const dist = Math.sqrt((e.x - this.p.x) ** 2 + (e.y - this.p.y) ** 2);
      if (dist < 10) {
        const drawX = (e.x + offsetX) * ts;
        const drawY = (e.y + offsetY) * ts;
        if (e.type === "enemy") {
          ctx.fillStyle = e.aggro ? "#f00" : "#d44";
          ctx.fillRect(drawX + 2, drawY + 2, ts - 4, ts - 4);
          ctx.fillStyle = "rgba(255, 0, 0, 0.2)";
          ctx.beginPath();
          ctx.moveTo(drawX + ts / 2, drawY + ts / 2);
          let startAng = 0;
          if (e.facing === 0) startAng = 1.5 * Math.PI;
          if (e.facing === 1) startAng = 0;
          if (e.facing === 2) startAng = 0.5 * Math.PI;
          if (e.facing === 3) startAng = Math.PI;
          ctx.arc(
            drawX + ts / 2,
            drawY + ts / 2,
            6 * ts,
            startAng - 0.5,
            startAng + 0.5
          );
          ctx.lineTo(drawX + ts / 2, drawY + ts / 2);
          ctx.fill();
        } else {
          // ▼▼▼ 修正: Lootの色分け処理 ▼▼▼
          let lootColor = "#fff"; // デフォルト白
          switch (e.lootType) {
            case "scrap":
              lootColor = "#aaa"; // ★修正: 鉄くずを灰色に (#ff01f2ff から変更)
              break;
            case "herb":
              lootColor = "#4f4"; // ハーブ: 緑
              break;
            case "chip":
              lootColor = "#ff0"; // チップ: 黄
              break;
            case "data":
              lootColor = "#0ff"; // データ: 水色
              break;
            default:
              lootColor = "#fff";
              break;
          }
          ctx.fillStyle = lootColor;
          ctx.beginPath();
          ctx.arc(drawX + ts / 2, drawY + ts / 2, 3, 0, 6.28);
          ctx.fill();
          // ▲▲▲ 修正ここまで ▲▲▲
        }
      }
    });
    const pDrawX = Math.floor(cw / 2 - ts / 2);
    const pDrawY = Math.floor(ch / 2 - ts / 2);
    ctx.fillStyle = game.player.isStealth ? "#00f" : "#0ff";
    ctx.beginPath();
    ctx.arc(pDrawX + ts / 2, pDrawY + ts / 2, 5, 0, 6.28);
    ctx.fill();
  },
  updateUI() {
    document.getElementById("exp-hp").innerText = game.player.hp;
    document.getElementById("exp-st").innerText = Math.floor(
      game.player.stamina
    );
    document.getElementById("exp-time").innerText = Math.floor(this.timeLeft);
    const stInd = document.getElementById("stealth-indicator");
    if (game.player.isStealth) stInd.className = "active";
    else stInd.className = "";
  },
};

window.onload = () => game.init();
