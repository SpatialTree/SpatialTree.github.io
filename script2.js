const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.18,
  }
);

document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

const capabilityNodes = {
  L4: {
    title: "L4 · Agentic Competence",
    description:
      "Transforms perception, mapping, and simulation into executable behaviors via the Action Mapping (navigation, manipulation, open exploration).",
    examples: [
      "Tasks: goal-driven navigation, open-world self-goaling, gripper / push / grab primitives.",
      "Datasets & sources: SpatialPlus agentic traces, EmbodiedBench, SITE, SpatialViz."
    ]
  },
  L3: {
    title: "L3 · Mental Simulation",
    description:
      "Runs internal rollouts for causal reasoning, sequential planning, and affordance forecasting before issuing actions.",
    examples: [
      "Tasks: multi-step route planning, what-if reasoning about dynamics, affordance QA.",
      "Datasets & sources: SpatialViz reasoning splits, SITE, MMSI-Bench, Omnispatial."
    ]
  },
  L2: {
    title: "L2 · Mental Mapping",
    description:
      "Builds persistent world models by aligning multi-view observations with memory retrieval and correspondence signals.",
    examples: [
      "Tasks: perspective taking, relational grounding, long-horizon memory queries and cognitive mapping.",
      "Datasets & sources: VSI-Bench, MMSI-Bench, SpatialPlus memory retrieval, Multi-SPA, MindCube."
    ]
  },
  L1: {
    title: "L1 · Perception Atoms",
    description:
      "Provides metric, relational, and motion cues (orientation, geometry, correspondence) that anchor higher-level reasoning.",
    examples: [
      "Tasks: size/depth/distance estimation, orientation, motion tracking, 3D grounding.",
      "Datasets & sources: SpatialPlus orientation/geometry, 3DSR-Bench, BLINK, LLaVA-3D extras."
    ]
  }
};

const nodeButtons = document.querySelectorAll(".node-btn");
const nodeTitle = document.getElementById("node-title");
const nodeDescription = document.getElementById("node-description");
const nodeExamples = document.getElementById("node-examples");

function updateNodeDetail(level) {
  const data = capabilityNodes[level];
  if (!data) return;
  nodeTitle.textContent = data.title;
  nodeDescription.textContent = data.description;
  nodeExamples.innerHTML = "";
  data.examples.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    nodeExamples.appendChild(li);
  });
}

nodeButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    nodeButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    const level = btn.getAttribute("data-node");
    updateNodeDetail(level);
  });
});

// Ensure default detail matches initial active button
updateNodeDetail("L4");


// Table column expansion logic
const table = document.querySelector('.benchmark table');
if (table) {
  const groups = ['l1', 'l2', 'l3', 'l4'];
  
  groups.forEach(group => {
    const selector = `.col-${group}-sum, .col-${group}-det`;
    const elements = table.querySelectorAll(selector);
    let timer;

    const expand = () => {
      clearTimeout(timer);
      table.classList.add(`expand-${group}`);
    };

    const collapse = () => {
      timer = setTimeout(() => {
        table.classList.remove(`expand-${group}`);
      }, 100);
    };

    elements.forEach(el => {
      el.addEventListener('mouseenter', expand);
      el.addEventListener('mouseleave', collapse);
    });
  });
}

// YouTube Player API for chapter navigation
let overviewPlayer;
let ytPlayerReady = false;

function onYouTubeIframeAPIReady() {
  const playerEl = document.getElementById("overview-player");
  if (!playerEl || typeof YT === "undefined" || !YT.Player) return;

  overviewPlayer = new YT.Player("overview-player", {
    events: {
      onReady: (event) => {
        ytPlayerReady = true;
        // Set high quality if available
        try {
          event.target.setPlaybackQuality("hd1080");
        } catch (e) {
          console.log("YT quality setup error", e);
        }
        setupChapterButtons();
      },
      onStateChange: (event) => {
        // Update active chapter based on current time
        if (event.data === YT.PlayerState.PLAYING) {
          updateActiveChapter();
        }
      }
    }
  });
}

function setupChapterButtons() {
  const chapterButtons = document.querySelectorAll(".chapter-btn");
  chapterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (!ytPlayerReady || !overviewPlayer) return;
      const time = parseFloat(button.getAttribute("data-time"));
      overviewPlayer.seekTo(time, true);
      overviewPlayer.playVideo();
    });
  });
}

function updateActiveChapter() {
  if (!overviewPlayer || typeof overviewPlayer.getCurrentTime !== "function") return;
  
  const currentTime = overviewPlayer.getCurrentTime();
  const chapterButtons = document.querySelectorAll(".chapter-btn");
  let activeChapter = null;
  
  chapterButtons.forEach((btn) => {
    btn.classList.remove("selected");
    const time = parseFloat(btn.getAttribute("data-time"));
    if (currentTime >= time) {
      activeChapter = btn;
    }
  });
  
  if (activeChapter) {
    activeChapter.classList.add("selected");
  }
}

// Update active chapter periodically when playing
setInterval(() => {
  if (overviewPlayer && ytPlayerReady) {
    try {
      const state = overviewPlayer.getPlayerState();
      if (state === YT.PlayerState.PLAYING) {
        updateActiveChapter();
      }
    } catch (e) {
      // Ignore errors
    }
  }
}, 500);
