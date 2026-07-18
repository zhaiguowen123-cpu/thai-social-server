const canvas = document.querySelector("#starfield");
const ctx = canvas.getContext("2d");
const stars = [];
let width = 0;
let height = 0;
let audioContext;
let soundEnabled = false;

function resizeCanvas() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * ratio);
  canvas.height = Math.floor(height * ratio);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function seedStars(count = 130) {
  stars.length = 0;
  for (let index = 0; index < count; index += 1) {
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      z: 0.4 + Math.random() * 1.8,
      size: 0.7 + Math.random() * 2.4,
      hue: [198, 326, 42, 273][Math.floor(Math.random() * 4)],
      drift: -0.12 + Math.random() * 0.24,
    });
  }
}

function drawStars() {
  ctx.clearRect(0, 0, width, height);
  for (const star of stars) {
    star.y += star.z * 0.18;
    star.x += star.drift;
    if (star.y > height + 10) star.y = -10;
    if (star.x < -10) star.x = width + 10;
    if (star.x > width + 10) star.x = -10;

    const glow = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.size * 7);
    glow.addColorStop(0, `hsla(${star.hue}, 100%, 72%, 0.8)`);
    glow.addColorStop(1, `hsla(${star.hue}, 100%, 72%, 0)`);
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size * 7, 0, Math.PI * 2);
    ctx.fill();
  }
  requestAnimationFrame(drawStars);
}

function setupTilt() {
  const cards = document.querySelectorAll("[data-tilt]");
  cards.forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `rotateX(${y * -9}deg) rotateY(${x * 11}deg) translateZ(0)`;
    });

    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });
  });
}

function setupCharacters() {
  const zone = document.querySelector(".kimetsu-zone");
  const tabs = document.querySelectorAll("[data-pick]");
  const cards = document.querySelectorAll("[data-copy]");

  function activateCharacter(character) {
    zone.dataset.character = character;

    tabs.forEach((item) => {
      const isActive = item.dataset.pick === character;
      item.classList.toggle("is-active", isActive);
      item.setAttribute("aria-selected", String(isActive));
    });

    cards.forEach((card) => {
      card.classList.toggle("is-active", card.dataset.copy === character);
    });
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      activateCharacter(tab.dataset.pick);
      burstSparkles(window.innerWidth * 0.5, window.innerHeight * 0.44, 10);
    });
  });

  setupKimetsuGame(activateCharacter);
}

function ensureAudio() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  soundEnabled = true;
  document.querySelector("#soundButton").setAttribute("aria-label", "声音已开启");
}

function playTone(frequency) {
  ensureAudio();
  const oscillator = audioContext.createOscillator();
  const overtone = audioContext.createOscillator();
  const filter = audioContext.createBiquadFilter();
  const gain = audioContext.createGain();
  oscillator.type = "sawtooth";
  oscillator.frequency.value = frequency;
  overtone.type = "sine";
  overtone.frequency.value = frequency * 2.01;
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(2600, audioContext.currentTime);
  filter.frequency.exponentialRampToValueAtTime(720, audioContext.currentTime + 0.52);
  gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.12, audioContext.currentTime + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.58);
  oscillator.connect(filter).connect(gain).connect(audioContext.destination);
  overtone.connect(filter);
  oscillator.start();
  overtone.start();
  oscillator.stop(audioContext.currentTime + 0.6);
  overtone.stop(audioContext.currentTime + 0.6);
}

function setupGuzheng() {
  document.querySelectorAll(".string").forEach((string, index) => {
    const wave = Math.sin(index * 0.78) * 8;
    string.style.setProperty("--i", String(index + 1));
    string.style.setProperty("--bridge", `${44 + index * 0.72 + wave}%`);
    string.style.setProperty("--lean", `${index % 2 === 0 ? -10 : 8}deg`);

    string.addEventListener("click", () => {
      const rawFrequency = Number(string.dataset.note);
      const frequency = Math.min(rawFrequency, 1760);
      playTone(frequency);
      string.classList.add("is-playing");
      const rect = string.getBoundingClientRect();
      burstSparkles(rect.left + rect.width / 2, rect.top + rect.height * 0.45, 4);
      setTimeout(() => string.classList.remove("is-playing"), 220);
    });
  });
}

function setupDance() {
  const button = document.querySelector("#danceButton");
  const scene = document.querySelector(".dance-scene");
  button.addEventListener("click", () => {
    scene.classList.toggle("is-dancing");
    button.textContent = scene.classList.contains("is-dancing") ? "定格闪耀" : "开始共舞";
    const rect = scene.getBoundingClientRect();
    burstSparkles(rect.left + rect.width / 2, rect.top + rect.height * 0.44, 16);
    if (soundEnabled) {
      [329.63, 392, 493.88, 659.25].forEach((note, index) => {
        setTimeout(() => playTone(note), index * 90);
      });
    }
  });
}

function setupKimetsuGame(activateCharacter) {
  const result = document.querySelector("#breathResult");
  const button = document.querySelector("#breathButton");
  const plotResult = document.querySelector("#plotResult");
  const fortunes = [
    ["giyu", "水之呼吸：今天负责稳住全场。表面冷静，内心已经给朋友点了 100 个赞。"],
    ["mitsuri", "恋之呼吸：今日幸运动作是疯狂夸夸。夸到朋友害羞，任务就算成功。"],
    ["muichiro", "霞之呼吸：今天可以短暂发呆，但不能忘记自己很可爱这件事。"],
    ["genya", "燃之任务：遇到尴尬不要慌，把它变成一个很响亮的笑点。"],
  ];
  const plots = [
    ["giyu", "隐藏剧情：义勇负责装冷酷，结果被朋友一句“你今天很帅”击中，冷静值掉了 3 点。"],
    ["mitsuri", "隐藏剧情：蜜璃发动爱心夸夸，所有人获得“被喜欢包围”增益，持续一整天。"],
    ["muichiro", "隐藏剧情：无一郎说自己忘了任务，但没忘记把星光留给馨妍。"],
    ["genya", "隐藏剧情：玄弥本来想帅气登场，结果踩到笑点，热血值和喜剧值同时爆表。"],
  ];

  button.addEventListener("click", () => {
    const [character, text] = fortunes[Math.floor(Math.random() * fortunes.length)];
    activateCharacter(character);
    result.textContent = text;
    burstSparkles(window.innerWidth * 0.68, window.innerHeight * 0.48, 16);
  });

  document.querySelectorAll(".mission").forEach((mission) => {
    mission.addEventListener("click", () => {
      result.textContent = mission.dataset.task;
      burstSparkles(window.innerWidth * 0.7, window.innerHeight * 0.5, 8);
    });
  });

  document.querySelector("#plotButton").addEventListener("click", () => {
    const [character, text] = plots[Math.floor(Math.random() * plots.length)];
    activateCharacter(character);
    plotResult.textContent = text;
    burstSparkles(window.innerWidth * 0.55, window.innerHeight * 0.5, 18);
  });
}

function setupYushanComedy() {
  const scene = document.querySelector(".dance-scene");
  const joke = document.querySelector("#yushanJoke");
  const barrage = document.querySelector("#stageBarrage");
  const lines = [
    "雨珊一拨弦：优雅。再一转身：全场自动鼓掌，连月亮都说再来一遍。",
    "古筝老师路过：这孩子有灵气。朋友路过：这孩子有喜剧天赋。",
    "今日舞步：左脚负责仙气，右脚负责把气氛带跑偏。",
    "如果弹错一个音，那不是失误，是雨珊原创限量版转音。",
    "舞台灯一亮，雨珊：我很端庄。下一秒：端庄开始高速旋转。",
  ];
  const danceNames = ["云朵滑步", "假装很专业转圈", "月光小碎步", "古筝侠登场步"];
  const barrageLines = [
    "前方高能：古筝仙女突然开始整活",
    "这段舞蹈我愿称之为：优雅版小旋风",
    "弹错？不存在，这是雨珊原创流派",
    "掌声别停，月亮已经在录屏了",
    "朋友认证：可爱值超标，退回重夸",
  ];

  function launchBarrage(text) {
    barrage.innerHTML = "";
    const chip = document.createElement("span");
    chip.textContent = text;
    chip.className = "is-flying";
    chip.style.top = `${28 + Math.random() * 44}%`;
    barrage.appendChild(chip);
  }

  document.querySelector("#complimentButton").addEventListener("click", () => {
    joke.textContent = lines[Math.floor(Math.random() * lines.length)];
    burstSparkles(window.innerWidth * 0.58, window.innerHeight * 0.62, 10);
  });

  document.querySelector("#shuffleDanceButton").addEventListener("click", () => {
    const name = danceNames[Math.floor(Math.random() * danceNames.length)];
    scene.classList.add("is-dancing", "is-silly");
    joke.textContent = `随机舞步已解锁：${name}。优雅值 80%，搞笑值 120%。`;
    burstSparkles(window.innerWidth * 0.32, window.innerHeight * 0.62, 14);
  });

  document.querySelector("#applauseButton").addEventListener("click", () => {
    joke.textContent = "掌声拉满：啪啪啪！这不是普通表演，这是雨珊限定返场。";
    launchBarrage("👏👏👏 雨珊返场！不要下班！");
    burstSparkles(window.innerWidth * 0.5, window.innerHeight * 0.72, 26);
    if (soundEnabled) {
      [523.25, 659.25, 783.99, 1046.5].forEach((note, index) => {
        setTimeout(() => playTone(note), index * 70);
      });
    }
  });

  document.querySelector("#barrageButton").addEventListener("click", () => {
    const line = barrageLines[Math.floor(Math.random() * barrageLines.length)];
    joke.textContent = `弹幕发射成功：${line}`;
    launchBarrage(line);
    burstSparkles(window.innerWidth * 0.42, window.innerHeight * 0.66, 12);
  });
}

function setupBingxuanBase() {
  const mission = document.querySelector("#flightMission");
  const legoResult = document.querySelector("#legoResult");
  const toyBoxResult = document.querySelector("#toyBoxResult");
  const levelNumber = document.querySelector("#levelNumber");
  const score = document.querySelector("#bxScore");
  const plane = document.querySelector("#bxPlane");
  const stations = document.querySelectorAll(".station");
  const towerSlots = document.querySelectorAll(".tower-slot");
  let stationIndex = 0;
  let towerHeight = 0;
  let level = 1;
  const flightTasks = [
    "起飞成功：秉轩队长收到第一件快乐包裹，准备冲向云站。",
    "到达云站：云朵补给完成，下一站去乐高城市找神秘零件。",
    "抵达积木城：发现一块会发光的机翼，装上以后速度加倍。",
    "快乐家送达：任务完成，收件人秉轩获得今日超级开心章。",
  ];
  const toys = [
    "打开玩具盒：抽到红色机翼。小飞机速度 +1，开心声音 +3。",
    "打开玩具盒：抽到乐高小门。穿过去以后，下一站直接变成快乐家。",
    "打开玩具盒：抽到彩色跑道。所有积木排队说：轮到我发光了。",
    "打开玩具盒：抽到超级维修包。飞机：我又可以出发啦！",
    "打开玩具盒：抽到隐藏零件“秉轩队长徽章”。今天由你发布任务。",
  ];

  function refreshGame() {
    const planePositions = ["0%", "29%", "58%", "82%"];
    plane.style.setProperty("--plane-x", planePositions[stationIndex]);
    stations.forEach((station, index) => {
      station.classList.toggle("is-active", index <= stationIndex);
    });
    towerSlots.forEach((slot, index) => {
      slot.classList.toggle("is-built", index < towerHeight);
    });
    score.textContent = `积木 ${towerHeight}/6`;
  }

  document.querySelector("#bxFlyButton").addEventListener("click", () => {
    stationIndex = (stationIndex + 1) % stations.length;
    mission.textContent = flightTasks[stationIndex];
    refreshGame();
    burstSparkles(window.innerWidth * 0.5, window.innerHeight * 0.58, 18);
    if (soundEnabled) {
      [392, 523.25, 659.25].forEach((note, index) => {
        setTimeout(() => playTone(note), index * 90);
      });
    }
  });

  document.querySelector("#bxBuildButton").addEventListener("click", () => {
    if (towerHeight < towerSlots.length) {
      towerHeight += 1;
      legoResult.textContent = `第 ${towerHeight} 块积木搭上去了。秉轩的起飞塔正在长高。`;
    } else {
      legoResult.textContent = `第 ${level} 关完成：起飞塔满格，超级飞侠可以从塔顶出发。`;
      level += 1;
      levelNumber.textContent = String(level);
      stationIndex = stations.length - 1;
      burstSparkles(window.innerWidth * 0.5, window.innerHeight * 0.68, 28);
    }
    refreshGame();
    burstSparkles(window.innerWidth * 0.58, window.innerHeight * 0.66, 10);
  });

  document.querySelector("#bxResetButton").addEventListener("click", () => {
    stationIndex = 0;
    towerHeight = 0;
    mission.textContent = "新一局开始：秉轩的小飞机准备起飞，快乐包裹已经装好。";
    legoResult.textContent = "乐高高塔清空，准备重新搭一个更高的起飞塔。";
    toyBoxResult.textContent = "神秘玩具盒也重新装满了，里面正在咔哒咔哒准备惊喜。";
    refreshGame();
    burstSparkles(window.innerWidth * 0.5, window.innerHeight * 0.62, 14);
  });

  document.querySelector("#toyBoxButton").addEventListener("click", () => {
    toyBoxResult.textContent = toys[Math.floor(Math.random() * toys.length)];
    if (towerHeight < towerSlots.length) {
      towerHeight += 1;
    }
    refreshGame();
    burstSparkles(window.innerWidth * 0.5, window.innerHeight * 0.68, 18);
  });

  refreshGame();
}

function setupFriendshipReport() {
  const names = document.querySelector("#squadName");
  const quest = document.querySelector("#squadQuest");
  const report = document.querySelector("#squadReport");
  const squads = ["星星乱入小分队", "今日不许不开心队", "鬼杀队友情分部", "古筝飞侠联名队", "快乐值超标调查组"];
  const quests = [
    "雨珊负责优雅整活，可欣负责帅气点头，馨妍负责雾里发光，秉轩负责起飞。",
    "每个人今天都要收到一句专属夸夸，少一个都不算通关。",
    "遇到无聊就立刻发动友情技能：发一个表情包，气氛加满。",
    "今天的隐藏任务：把普通一天过成小小庆典。",
    "如果有人不开心，全队启动紧急方案：夸夸、弹幕、飞行包裹一起上。",
  ];
  const endings = [
    "快乐值 98%，整活值 120%，友情等级：很难不开心。",
    "主角感 100%，笑点捕获 7 个，今日适合截图留念。",
    "默契值爆表，建议立刻把这个网页发给他们炫耀一下。",
    "友情报告：四个人都很有戏，页面表示它已经尽力跟上了。",
  ];

  document.querySelector("#squadButton").addEventListener("click", () => {
    names.textContent = squads[Math.floor(Math.random() * squads.length)];
    quest.textContent = quests[Math.floor(Math.random() * quests.length)];
    report.textContent = endings[Math.floor(Math.random() * endings.length)];
    burstSparkles(window.innerWidth * 0.5, window.innerHeight * 0.42, 24);
  });
}

function burstSparkles(x, y, amount = 12) {
  const glyphs = ["✦", "♪", "♡", "✧", "⌁"];
  const colors = ["#4cc9ff", "#ff8fd6", "#9dff9a", "#ffd36d", "#b47cff"];
  for (let index = 0; index < amount; index += 1) {
    const note = document.createElement("span");
    note.className = "floating-note";
    note.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
    note.style.setProperty("--x", `${x + (Math.random() - 0.5) * 130}px`);
    note.style.setProperty("--y", `${y + (Math.random() - 0.5) * 80}px`);
    note.style.setProperty("--c", colors[Math.floor(Math.random() * colors.length)]);
    document.body.appendChild(note);
    setTimeout(() => note.remove(), 1000);
  }
}

function setupButtons() {
  document.querySelector("#sparkButton").addEventListener("click", () => {
    burstSparkles(window.innerWidth * 0.5, window.innerHeight * 0.36, 24);
  });

  document.querySelector("#soundButton").addEventListener("click", () => {
    ensureAudio();
    [261.63, 329.63, 392, 523.25].forEach((note, index) => {
      setTimeout(() => playTone(note), index * 120);
    });
  });
}

window.addEventListener("resize", () => {
  resizeCanvas();
  seedStars(window.innerWidth < 700 ? 76 : 130);
});

resizeCanvas();
seedStars(window.innerWidth < 700 ? 76 : 130);
drawStars();
setupTilt();
setupCharacters();
setupGuzheng();
setupDance();
setupYushanComedy();
setupBingxuanBase();
setupFriendshipReport();
setupButtons();
