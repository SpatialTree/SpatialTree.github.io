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
  const galleryContainer = document.querySelector('.gallery-carousel-track');
  const galleryBtns = document.querySelectorAll('.gallery-btn');
  const prevBtn = document.querySelector('.prev-btn');
  const nextBtn = document.querySelector('.next-btn');
  
  // Define video lists for each level (excluding non-suffixed versions)
  const galleryData = {
    L4: [
      "demo_video_L4_1.mp4",
      "demo_video_L4_2.mp4"
    ],
    L3: [
      "demo_video_L3_1.mp4",
      "demo_video_L3_2.mp4"
    ],
    L2: [
      "demo_video_L2_1.mp4",
      "demo_video_L2_2.mp4",
      "demo_video_L2_3.mp4",
      "demo_video_L2_4.mp4"
    ],
    L1: [
      "demo_video_L1_1.mp4",
      "demo_video_L1_2.mp4",
      "demo_video_L1_3.mp4",
      "demo_video_L1_4.mp4",
      "demo_video_L1_5.mp4",
      "demo_video_L1_6.mp4"
    ]
  };

  let currentLevel = 'L4';
  let currentIndex = 0;
  let items = [];

  function initCarousel(level) {
    if (!galleryContainer) return;
    
    // Clear existing items
    galleryContainer.innerHTML = '';
    items = [];
    currentLevel = level;
    currentIndex = 0;
    
    let videos = galleryData[level];
    
    // Duplicate videos if only 2 to ensure loop effect (left/right preview)
    if (videos && videos.length === 2) {
      videos = [...videos, ...videos];
    }
    
    // Create DOM elements for all videos in this level
    videos.forEach((videoFile, index) => {
      const item = document.createElement('div');
      item.className = 'carousel-item';
      
      const video = document.createElement('video');
      video.src = `assets/figures/${videoFile}`;
      video.muted = true;
      video.loop = false;
      video.playsInline = true;
      video.setAttribute('playsinline', '');
      
      item.appendChild(video);
      galleryContainer.appendChild(item);
      items.push(item);
      
      // Add click listener to item to make it active if clicked
      item.addEventListener('click', () => {
        if (currentIndex !== index) {
          updateCarousel(index);
        }
      });
    });
    
    updateCarousel(0);
  }

  function updateCarousel(index) {
    if (items.length === 0) return;
    
    // Wrap index
    if (index < 0) index = items.length - 1;
    if (index >= items.length) index = 0;
    
    currentIndex = index;
    
    items.forEach((item, i) => {
      item.className = 'carousel-item'; // Reset classes
      const video = item.querySelector('video');
      
      // Determine relative position
      // We need to handle wrapping for prev/next logic visually
      let diff = i - currentIndex;
      
      // Adjust diff for wrapping to find shortest path
      const total = items.length;
      if (diff > total / 2) diff -= total;
      if (diff < -total / 2) diff += total;
      
      if (i === currentIndex) {
        item.classList.add('active');
        video.play().catch(e => {});
        video.controls = true; // Show controls only on active
      } else {
        video.pause();
        video.currentTime = 0; // Reset time
        video.controls = false;
        
        if (diff === -1) {
           item.classList.add('prev');
        } else if (diff === 1) {
           item.classList.add('next');
        } else {
           item.classList.add('hidden');
        }
      }
    });
  }

  if (galleryContainer && galleryBtns.length > 0) {
    // Initialize with default level
    initCarousel('L4');

    // Category buttons
    galleryBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        if (this.classList.contains('active')) return;
        
        // Update active state
        galleryBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        
        // Switch level
        const level = this.getAttribute('data-video');
        initCarousel(level);
      });
    });

    // Navigation buttons
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        updateCarousel(currentIndex - 1);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        updateCarousel(currentIndex + 1);
      });
    }
  }
});

// ECharts Sunburst Visualization
let sunburstChart = null;
let sunburstOption = null;

// Sequential animation: reveal sectors one by one
// This function adds sectors incrementally to create the "one by one" appearance effect
function revealSectorsSequentially(chart, fullData, baseOption, delay = 120) {
  // Start with empty data but full configuration
  const emptyOption = {
    ...baseOption,
    series: [{
      ...baseOption.series,
      data: [],
      animation: true,
      animationDuration: 500,
      animationEasing: 'cubicOut',
      animationType: 'scale'
    }]
  };
  chart.setOption(emptyOption, { notMerge: true });
  
  // Flatten all sectors (main + children) for sequential reveal
  const allSectors = [];
  fullData.forEach((mainSector) => {
    // Add main sector first
    allSectors.push({ type: 'main', data: mainSector, parentIndex: -1 });
    // Then add all its children
    if (mainSector.children) {
      mainSector.children.forEach((child) => {
        allSectors.push({ type: 'child', data: child, parentIndex: fullData.indexOf(mainSector) });
      });
    }
  });
  
  // Reveal sectors one by one
  let currentData = [];
  let currentMainIndex = -1;
  let currentMainSector = null;
  
  function revealNext(index) {
    if (index >= allSectors.length) return;
    
    const sector = allSectors[index];
    
    if (sector.type === 'main') {
      // Add new main sector
      currentMainIndex++;
      // Use structuredClone for better performance
      currentMainSector = typeof structuredClone !== 'undefined' 
        ? structuredClone(sector.data) 
        : JSON.parse(JSON.stringify(sector.data));
      currentMainSector.children = []; // Start with no children
      currentData.push(currentMainSector);
    } else {
      // Add child to current main sector
      if (currentMainSector) {
        const childCopy = typeof structuredClone !== 'undefined' 
          ? structuredClone(sector.data) 
          : JSON.parse(JSON.stringify(sector.data));
        currentMainSector.children.push(childCopy);
      }
    }
    
    // Update chart with current data
    // Use structuredClone for better performance, fallback to JSON if not available
    const dataCopy = typeof structuredClone !== 'undefined' 
      ? structuredClone(currentData) 
      : JSON.parse(JSON.stringify(currentData));
    
    chart.setOption({
      series: [{
        data: dataCopy,
        animation: true,
        animationDuration: 500,
        animationEasing: 'cubicOut',
        animationType: 'scale'
      }]
    }, { notMerge: false, lazyUpdate: true });
    
    // Use requestAnimationFrame for smoother timing
    requestAnimationFrame(() => {
      setTimeout(() => revealNext(index + 1), delay);
    });
  }
  
  // Start revealing
  revealNext(0);
}

function initChart() {
  const chartDom = document.getElementById('sunburst-chart');
  if (!chartDom) return;

  if (sunburstChart) {
    sunburstChart.dispose();
  }

  sunburstChart = echarts.init(chartDom);
  
  // Get root font size to match HTML's responsive scaling strategy
  // Root uses: clamp(5.333px, calc(100vw / 60), 16px)
  // Other elements use rem units that scale with root font-size
  const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  const baseRootFontSize = 16; // Base font size used in clamp
  
  // Calculate scale factor based on root font size (same strategy as HTML)
  const scaleFactor = rootFontSize / baseRootFontSize;
  
  // Calculate font sizes using the same scaling strategy as HTML
  // Base sizes: inner 11px, outer 10px (at 16px root font size)
  const innerFontSize = Math.round(11 * scaleFactor);
  const innerLineHeight = Math.round(13 * scaleFactor);
  const outerFontSize = Math.round(10 * scaleFactor);
  const labelPush = Math.round(24 * scaleFactor);
  
  const data = [
    {
      name: 'L1 Perception',
      itemStyle: { color: '#8b5cf6' }, // Violet
      children: [
        { name: 'Geometry', value: 1330, itemStyle: { color: '#a78bfa' } },
        { name: 'Motion', value: 150, itemStyle: { color: '#c4b5fd' } },
        { name: 'Relation', value: 550, itemStyle: { color: '#ddd6fe' } },
        { name: 'Localization', value: 534, itemStyle: { color: '#9f7aea' } },
        { name: 'Orientation', value: 350, itemStyle: { color: '#b794f4' } }
      ]
    },
    {
      name: 'L2 Mental\nMapping',
      itemStyle: { color: '#f59e0b' }, // Amber
      children: [
        { name: 'Underst.', value: 1795, itemStyle: { color: '#fbbf24' } },
        { name: 'Memory', value: 1150, itemStyle: { color: '#fcd34d' } }
      ]
    },
    {
      name: 'L3 Mental\nSimulation',
      itemStyle: { color: '#10b981' }, // Emerald green
      children: [
        { name: 'Caus. Reas.', value: 667, itemStyle: { color: '#34d399' } },
        { name: 'Seq. Plan.', value: 342, itemStyle: { color: '#6ee7b7' } }
      ]
    },
    {
      name: 'L4 Agentic\nCompetence',
      itemStyle: { color: '#3655ff' }, // Site accent blue
      children: [
        { name: 'Goal-Driven\nExecution', value: 500, itemStyle: { color: '#6b85ff' } },
        { name: 'Open-world\nExploration', value: 182, itemStyle: { color: '#8ba1ff' } }
      ]
    }
  ];

  // Sunburst chart configuration: displays L1-L4 spatial abilities hierarchy
  // The chart uses a transparent background and fits exactly within its container (radius 100%)
  const option = {
    // Explicitly set transparent background to remove any default ECharts container background
    backgroundColor: 'transparent',
    textStyle: {
      fontFamily:
        '"Plus Jakarta Sans", "Space Grotesk", system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
    },
    tooltip: {
      trigger: 'item',
      formatter: function(params) {
        const value = typeof params.value === 'number' ? params.value : '';
        const percent = typeof params.percent === 'number' ? params.percent.toFixed(1) : null;
        return percent === null ? `${params.name}: ${value}` : `${params.name}: ${value} (${percent}%)`;
      }
    },
    series: {
      type: 'sunburst',
      data: data,
      // Radius set to 100% so the circle is exactly tangent to the container edges (no overflow)
      radius: [0, '100%'],
      nodeClick: false,
      sort: undefined,
      // Hover interaction: highlight hovered sector, dim the rest.
      // Also make the whole palette feel lighter by default via opacity.
      emphasis: {
        focus: 'self',
        itemStyle: {
          opacity: 0.95,
          borderWidth: 0,
          borderColor: 'transparent'
        },
        label: {
          opacity: 1
        }
      },
      blur: {
        itemStyle: {
          opacity: 0.12
        },
        label: {
          opacity: 0.25
        }
      },
      labelLayout: function(params) {
        // Only nudge the inner ring labels (L1–L4) outward.
        // This keeps the ring sizes unchanged and avoids text overflow.
        const text = String(params.text || '');
        if (!/^L[1-4]\n/i.test(text)) return;

        const cx = chartDom.clientWidth / 2;
        const cy = chartDom.clientHeight / 2;
        const ex = params.rect.x + params.rect.width / 2;
        const ey = params.rect.y + params.rect.height / 2;

        const vx = ex - cx;
        const vy = ey - cy;
        const len = Math.hypot(vx, vy) || 1;

        // Positive means "away from center". Keep it very subtle.
        // Use responsive push distance based on container size
        const push = labelPush;
        return {
          dx: (vx / len) * push,
          dy: (vy / len) * push
        };
      },
      // Animation will be controlled manually via revealSectorsSequentially
      // Disable automatic animation here since we're doing it manually
      animation: false,
      levels: [
        {
          // Depth 0: virtual root (hide it to avoid a "donut hole" illusion)
          r0: 0,
          r: '0%',
          itemStyle: {
            borderWidth: 0
          },
          label: {
            show: false
          },
          // No animation for root level
          animation: false
        },
        {
          // Depth 1: L1-L4 Categories (inner ring)
          r0: '0%',
          r: '35%',
          itemStyle: {
            opacity: 0.55,
            borderWidth: 0,
            borderColor: 'transparent'
          },
          label: {
            rotate: 0,
            align: 'center',
            verticalAlign: 'middle',
            position: 'inside',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: innerFontSize,
            lineHeight: innerLineHeight,
            overflow: 'break',
            formatter: function(params) {
              // Abbreviate inner-ring labels to avoid overflow.
              const raw = String(params.name || '').replace(/\s+/g, ' ').trim();
              if (/^L1\b/i.test(raw)) return 'L1\nPerc.';
              if (/^L2\b/i.test(raw)) return 'L2\nMap.';
              if (/^L3\b/i.test(raw)) return 'L3\nSim.';
              if (/^L4\b/i.test(raw)) return 'L4\nAgent.';
              return raw;
            }
          }
        },
        {
          // Depth 2: Subcategories (outer ring)
          r0: '35%',
          r: '68%',
          itemStyle: {
            opacity: 0.55,
            borderWidth: 0,
            borderColor: 'transparent'
          },
          label: {
            rotate: 'radial',
            align: 'center',
            color: '#1c1b1bff',
            fontSize: outerFontSize,
            minAngle: 7
          },
        }
      ]
    }
  };

  sunburstOption = option;
  
  // Instead of setting all data at once, reveal sectors sequentially
  // This creates the "one by one" appearance effect where each sector appears individually
  // Reduced delay (120ms) and duration (500ms) for smoother animation
  revealSectorsSequentially(sunburstChart, data, option, 120);

  function resizeChart() {
    const width = chartDom.clientWidth || 0;
    if (width > 0) {
      chartDom.style.height = width + 'px';
    }
    if (sunburstChart) {
      // Recalculate font sizes using root font size (same as HTML scaling strategy)
      const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      const baseRootFontSize = 16;
      const scaleFactor = rootFontSize / baseRootFontSize;
      
      const newInnerFontSize = Math.round(11 * scaleFactor);
      const newInnerLineHeight = Math.round(13 * scaleFactor);
      const newOuterFontSize = Math.round(10 * scaleFactor);
      
      // Update font sizes in the chart option
      if (sunburstOption && sunburstOption.series && sunburstOption.series.levels) {
        if (sunburstOption.series.levels[1] && sunburstOption.series.levels[1].label) {
          sunburstOption.series.levels[1].label.fontSize = newInnerFontSize;
          sunburstOption.series.levels[1].label.lineHeight = newInnerLineHeight;
        }
        if (sunburstOption.series.levels[2] && sunburstOption.series.levels[2].label) {
          sunburstOption.series.levels[2].label.fontSize = newOuterFontSize;
        }
        sunburstChart.setOption(sunburstOption, { notMerge: false });
      }
      
      sunburstChart.resize();
    }
  }

  resizeChart();
  window.addEventListener('resize', resizeChart);
}

// Init or re-init chart when it scrolls into view so the animation plays each time
// Each time the chart enters the viewport, it will be re-initialized to replay the animation
function setupChartOnReveal() {
  const chartDom = document.getElementById('sunburst-chart');
  if (!chartDom) return;

  const chartObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Re-initialize chart to replay the animation
          // Dispose old instance first to ensure clean state
          if (sunburstChart) {
            sunburstChart.dispose();
            sunburstChart = null;
          }
          // Small delay to ensure DOM is ready, then init with animation
          setTimeout(() => {
            initChart();
          }, 50);
        }
      });
    },
    { threshold: 0.25 }
  );

  chartObserver.observe(chartDom);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupChartOnReveal);
} else {
  setupChartOnReveal();
}
