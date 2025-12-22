const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      } else {
        // Remove visible class when leaving viewport to allow re-animation
        entry.target.classList.remove("visible");
      }
    });
  },
  {
    threshold: 0.18,
  }
);

// Ensure DOM is ready before observing elements
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
  });
} else {
  // DOM already loaded
  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
}

// Observer for transfer text animation (now uses reveal class, so handled by main observer)
// Keeping this for backward compatibility if needed
const transferObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      } else {
        // Remove visible class when leaving viewport to allow re-animation
        entry.target.classList.remove("visible");
      }
    });
  },
  {
    threshold: 0.1,
  }
);

// Observe transfer text when DOM is ready (as backup)
function observeTransferText() {
  const transferText = document.querySelector(".transfer-text");
  if (transferText && !transferText.classList.contains("reveal")) {
    // Only observe if it doesn't have reveal class (backward compatibility)
    transferObserver.observe(transferText);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener("DOMContentLoaded", observeTransferText);
} else {
  // DOM already loaded
  observeTransferText();
}

const capabilityNodes = {
  L4: {
    title: "L4 · Agentic Competence",
    description:
      "Aligned with the formal operational stage, this level represents the ultimate integration of perception, understanding, and reasoning. It executes coherent actions, interprets feedback, and self-corrects to accomplish long-horizon tasks in the space.",
    examples: [
      "Tasks: goal-driven navigation, open-world self-goaling, gripper / push / grab primitives.",
      "Datasets & sources: SpatialPlus agentic traces, EmbodiedBench, SITE, SpatialViz."
    ]
  },
  L3: {
    title: "L3 · Mental Simulation",
    description:
      "Reflecting the concrete operational stage, this level progresses to leverage complex textual logic to reason about spatial-temporal causality and perform planning for multi-step operations.",
    examples: [
      "Tasks: multi-step route planning, what-if reasoning about dynamics, affordance QA.",
      "Datasets & sources: SpatialViz reasoning splits, SITE, MMSI-Bench, Omnispatial."
    ]
  },
  L2: {
    title: "L2 · Mental Mapping",
    description:
      "Corresponding to the pre-operational stage, this level begins to establish the mapping from raw perception to semantic concepts, focusing on aligning space with language semantics and language-structured memory.",
    examples: [
      "Tasks: perspective taking, relational grounding, long-horizon memory queries and cognitive mapping.",
      "Datasets & sources: VSI-Bench, MMSI-Bench, SpatialPlus memory retrieval, Multi-SPA, MindCube."
    ]
  },
  L1: {
    title: "L1 · Perception Atoms",
    description:
      "Mirroring the sensorimotor stage, this level focuses on raw geometric and physical attributes, which aligns with pre-linguistic early human perception.",
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

// Map layer levels to video timestamps
const layerToTime = {
  L1: 0,
  L2: 21,
  L3: 61,
  L4: 72
};

// Map layer levels to end timestamps (stop before next section)
const layerToEndTime = {
  L1: 21,
  L2: 61,
  L3: 72,
  L4: null // Play to end for L4
};

let currentLevelEndTime = null;
let timeCheckInterval = null;

nodeButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    nodeButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    const level = btn.getAttribute("data-node");
    updateNodeDetail(level);
    
    // Jump to corresponding video timestamp and set end time
    if (overviewPlayer && ytPlayerReady && layerToTime[level] !== undefined) {
      try {
        const startTime = layerToTime[level];
        currentLevelEndTime = layerToEndTime[level];
        
        overviewPlayer.seekTo(startTime, true);
        overviewPlayer.playVideo();
        
        // Start monitoring playback time
        startTimeMonitoring();
      } catch (e) {
        console.error("Error seeking video:", e);
      }
    }
    
    // Update chapter button selection
    const chapterButtons = document.querySelectorAll(".chapter-btn");
    chapterButtons.forEach((cb) => {
      if (cb.getAttribute("data-node") === level) {
        chapterButtons.forEach((b) => b.classList.remove("selected"));
        cb.classList.add("selected");
      }
    });
  });
});

// Ensure default detail matches initial active button
updateNodeDetail("L4");

// YouTube Player API for chapter navigation
let overviewPlayer;
let ytPlayerReady = false;

// Function to monitor video time and pause at end of section
function startTimeMonitoring() {
  // Clear existing interval
  if (timeCheckInterval) {
    clearInterval(timeCheckInterval);
  }
  
  timeCheckInterval = setInterval(function() {
    if (!overviewPlayer || !ytPlayerReady || !currentLevelEndTime) return;
    
    try {
      const state = overviewPlayer.getPlayerState();
      if (state === YT.PlayerState.PLAYING) {
        const currentTime = overviewPlayer.getCurrentTime();
        
        // If reached end time, pause video
        if (currentTime >= currentLevelEndTime) {
          overviewPlayer.pauseVideo();
          clearInterval(timeCheckInterval);
          timeCheckInterval = null;
        }
      }
    } catch (e) {
      // Ignore errors
    }
  }, 100); // Check every 100ms
}

function stopTimeMonitoring() {
  if (timeCheckInterval) {
    clearInterval(timeCheckInterval);
    timeCheckInterval = null;
  }
  currentLevelEndTime = null;
}

// This function must be global for YouTube API to call it
window.onYouTubeIframeAPIReady = function() {
  const playerEl = document.getElementById("overview-player");
  if (!playerEl) {
    console.error("Player element not found");
    return;
  }
  
  if (typeof YT === "undefined" || !YT.Player) {
    console.error("YouTube API not loaded");
    return;
  }

  try {
    // Use existing iframe element
    overviewPlayer = new YT.Player("overview-player", {
      events: {
        onReady: function(event) {
          ytPlayerReady = true;
          console.log("YouTube player ready");
          // Set high quality if available
          try {
            event.target.setPlaybackQuality("hd1080");
          } catch (e) {
            console.log("YT quality setup error", e);
          }
          setupChapterButtons();
        },
        onStateChange: function(event) {
          // Update active chapter based on current time
          if (event.data === YT.PlayerState.PLAYING) {
            updateActiveChapter();
          } else if (event.data === YT.PlayerState.PAUSED) {
            // Stop monitoring when paused
            stopTimeMonitoring();
          }
        },
        onError: function(event) {
          console.error("YouTube player error:", event.data);
        }
      }
    });
  } catch (e) {
    console.error("Error creating YouTube player:", e);
  }
};

function setupChapterButtons() {
  const chapterButtons = document.querySelectorAll(".chapter-btn");
  console.log("Setting up chapter buttons, found:", chapterButtons.length);
  
  chapterButtons.forEach((button) => {
    // Remove any existing listeners
    const newButton = button.cloneNode(true);
    button.parentNode.replaceChild(newButton, button);
    
    newButton.addEventListener("click", function(e) {
      e.preventDefault();
      console.log("Chapter button clicked");
      
      if (!ytPlayerReady) {
        console.error("Player not ready yet");
        return;
      }
      
      if (!overviewPlayer) {
        console.error("Player not initialized");
        return;
      }
      
      const time = parseFloat(newButton.getAttribute("data-time"));
      const nodeLevel = newButton.getAttribute("data-node");
      console.log("Seeking to time:", time, "for level:", nodeLevel);
      
      try {
        const startTime = parseFloat(newButton.getAttribute("data-time"));
        currentLevelEndTime = layerToEndTime[nodeLevel] || null;
        
        overviewPlayer.seekTo(startTime, true);
        overviewPlayer.playVideo();
        
        // Start monitoring playback time
        startTimeMonitoring();
        
        // Update chapter button selection
        chapterButtons.forEach((btn) => btn.classList.remove("selected"));
        newButton.classList.add("selected");
        
        // Update corresponding node button
        if (nodeLevel) {
          const nodeBtn = document.querySelector(`.node-btn[data-node="${nodeLevel}"]`);
          if (nodeBtn) {
            nodeButtons.forEach((b) => b.classList.remove("active"));
            nodeBtn.classList.add("active");
            updateNodeDetail(nodeLevel);
          }
        }
      } catch (e) {
        console.error("Error seeking video:", e);
      }
    });
  });
}

function updateActiveChapter() {
  if (!overviewPlayer || !ytPlayerReady) return;
  
  try {
    if (typeof overviewPlayer.getCurrentTime !== "function") return;
    
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
  } catch (e) {
    // Ignore errors
  }
}

// Update active chapter periodically when playing
setInterval(function() {
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

// Fallback: if API loads after DOM is ready, try to initialize
document.addEventListener("DOMContentLoaded", function() {
  // Check if API is already loaded
  if (typeof YT !== "undefined" && YT.Player && typeof window.onYouTubeIframeAPIReady === "function") {
    // Small delay to ensure iframe is ready
    setTimeout(function() {
      if (!ytPlayerReady) {
        window.onYouTubeIframeAPIReady();
      }
    }, 1000);
  }
});

// Video Gallery Logic
document.addEventListener('DOMContentLoaded', function() {
  const galleryVideo = document.getElementById('gallery-video');
  const galleryBtns = document.querySelectorAll('.gallery-btn');
  
  if (galleryVideo && galleryBtns.length > 0) {
    galleryBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        // Update active state
        galleryBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        
        // Update video source
        const level = this.getAttribute('data-video');
        const videoSrc = `assets/figures/demo_video_${level}.mp4`;
        
        // Smooth transition
        galleryVideo.style.opacity = '0.5';
        
        setTimeout(() => {
          galleryVideo.src = videoSrc;
          galleryVideo.play().catch(e => console.log('Auto-play prevented:', e));
          galleryVideo.style.opacity = '1';
        }, 200);
      });
    });
  }
});
