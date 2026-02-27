const state = {
  scene: "street",
  inventory: new Set(),
  flags: {
    appleMoved: false,
    hatTaken: false,
    bellRung: false,
    spokeTruth: false,
  },
};

const sceneEl = document.getElementById("scene-art");
const hotspotsEl = document.getElementById("hotspots");
const descriptionEl = document.getElementById("description");
const inventoryEl = document.getElementById("inventory");
const restartBtn = document.getElementById("restart");
const hotspotTemplate = document.getElementById("hotspot-template");

const scenes = {
  street: {
    describe:
      "A narrow evening street. A gentleman stands very still, as if waiting for a thought to arrive by post.",
    objects: [
      { cls: "object man" },
      { cls: "object hat" },
      { cls: "object apple" },
      { cls: "object door" },
      { cls: "object cloud-window" },
    ],
    hotspots: [
      {
        label: "The floating apple",
        box: ["59%", "39%", "64px", "64px"],
        action: () => {
          state.flags.appleMoved = true;
          say(
            "You nudge the apple aside. Behind it, the gentleman has your own worried eyebrows. He mouths: 'Finally.'",
          );
          gain("A reluctant smile");
        },
      },
      {
        label: "The hat",
        box: ["58%", "31%", "95px", "60px"],
        action: () => {
          if (!state.flags.hatTaken) {
            state.flags.hatTaken = true;
            gain("Bowler hat");
            say(
              "You borrow the bowler hat. Instantly you feel 15% more mysterious and 40% more employable.",
            );
          } else {
            say("The hat now smells faintly of rain and unfinished apologies.");
          }
        },
      },
      {
        label: "The door with no wall",
        box: ["12%", "36%", "100px", "190px"],
        action: () => {
          if (state.flags.hatTaken) {
            state.scene = "room";
            render();
            say(
              "You open the freestanding door. It is polite enough to pretend this makes architectural sense.",
            );
          } else {
            say("The doorknob whispers: 'Hat first, dignity second.'");
          }
        },
      },
      {
        label: "The cloud window",
        box: ["70%", "12%", "180px", "130px"],
        action: () => {
          say(
            "Outside the window: daytime clouds. Inside the roomless street: evening. Weather has begun freelancing.",
          );
        },
      },
    ],
  },
  room: {
    describe:
      "Inside: moonlight, indoor rain, and a bell dangling above a single chair. The air tastes like old letters.",
    objects: [
      { cls: "object rain-room" },
      { cls: "object moon" },
      { cls: "object bell" },
      { cls: "object door" },
      { cls: "object cloud-window" },
    ],
    hotspots: [
      {
        label: "The bell",
        box: ["51%", "16%", "70px", "95px"],
        action: () => {
          state.flags.bellRung = true;
          gain("A clear note");
          say(
            "You ring the bell. The rain pauses to listen. Somewhere, a memory sits down beside you.",
          );
        },
      },
      {
        label: "The moon",
        box: ["7%", "7%", "102px", "102px"],
        action: () => {
          if (state.flags.appleMoved) {
            gain("Moonlit seed");
            say(
              "You peel a tiny seed of light from the moon. It hums in your palm like a brave little idea.",
            );
          } else {
            say("The moon looks at you kindly, as if waiting for you to be honest first.");
          }
        },
      },
      {
        label: "The return door",
        box: ["12%", "36%", "100px", "190px"],
        action: () => {
          state.scene = "street";
          render();
          say("You step back outside. The gentleman pretends not to have missed you.");
        },
      },
      {
        label: "Sit with yourself",
        box: ["66%", "58%", "160px", "100px"],
        action: finalBeat,
      },
    ],
  },
};

function gain(item) {
  state.inventory.add(item);
  renderInventory();
}

function say(text) {
  descriptionEl.textContent = text;
}

function finalBeat() {
  const hasPoem =
    state.inventory.has("Bowler hat") &&
    state.inventory.has("A clear note") &&
    state.inventory.has("Moonlit seed");

  if (hasPoem) {
    state.flags.spokeTruth = true;
    say(
      "You place hat, note, and seed on the chair. The gentleman appears, now without the apple, and says: 'Grief is just love with nowhere to stand.' You both laugh at the absurdity of being sincere in a surreal room. The rain resumes, softer. End.",
    );
    gain("A small peace");
  } else {
    say(
      "You sit. The chair suggests that closure is a craft project, not a lightning strike. Maybe gather a few more impossible things first.",
    );
  }
}

function renderSceneArt() {
  sceneEl.innerHTML = "";
  const scene = scenes[state.scene];
  for (const obj of scene.objects) {
    const el = document.createElement("div");
    el.className = obj.cls;
    sceneEl.appendChild(el);
  }
}

function renderHotspots() {
  hotspotsEl.innerHTML = "";
  const scene = scenes[state.scene];
  for (const spot of scene.hotspots) {
    const fragment = hotspotTemplate.content.cloneNode(true);
    const btn = fragment.querySelector(".hotspot");
    btn.setAttribute("aria-label", spot.label);
    btn.style.left = spot.box[0];
    btn.style.top = spot.box[1];
    btn.style.width = spot.box[2];
    btn.style.height = spot.box[3];
    btn.addEventListener("click", spot.action);
    hotspotsEl.appendChild(btn);
  }
}

function renderInventory() {
  inventoryEl.innerHTML = "";
  if (state.inventory.size === 0) {
    const li = document.createElement("li");
    li.textContent = "(empty pockets, loud thoughts)";
    inventoryEl.appendChild(li);
    return;
  }
  [...state.inventory].forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    inventoryEl.appendChild(li);
  });
}

function render() {
  renderSceneArt();
  renderHotspots();
  renderInventory();
  if (!state.flags.spokeTruth) {
    descriptionEl.textContent = scenes[state.scene].describe;
  }
}

restartBtn.addEventListener("click", () => {
  state.scene = "street";
  state.inventory.clear();
  Object.keys(state.flags).forEach((key) => {
    state.flags[key] = false;
  });
  render();
  say("The sky resets itself. You get another chance at impossible honesty.");
});

render();
