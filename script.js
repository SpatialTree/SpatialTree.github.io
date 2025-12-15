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
      "Transforms perception, mapping, and simulation into executable behaviors via the Spatial Action Mapping (navigation, manipulation, open exploration).",
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
      "Tasks: perspective taking, relational grounding, long-horizon memory queries.",
      "Datasets & sources: VSI-Bench, MMSI-Bench, SpatialPlus memory retrieval, Multi-SPA."
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

// PDF embedding optimization - remove borders and handle height
document.addEventListener("DOMContentLoaded", () => {
  const pdfObject = document.getElementById("teaser-pdf");
  if (pdfObject) {
    // Try to access the PDF content and adjust height
    pdfObject.addEventListener("load", () => {
      try {
        // Hide any scrollbars and borders
        const pdfDoc = pdfObject.contentDocument || pdfObject.contentWindow.document;
        if (pdfDoc) {
          pdfDoc.body.style.overflow = "hidden";
          pdfDoc.body.style.margin = "0";
          pdfDoc.body.style.padding = "0";
          
          // Try to get the actual PDF height
          const embed = pdfDoc.querySelector("embed");
          if (embed) {
            embed.style.border = "none";
            embed.style.outline = "none";
          }
        }
      } catch (e) {
        // Cross-origin restrictions may prevent access
        console.log("Cannot access PDF content (cross-origin)");
      }
    });
    
    // Force remove borders via CSS
    const style = document.createElement("style");
    style.textContent = `
      #teaser-pdf,
      #teaser-pdf * {
        border: 0 !important;
        outline: 0 !important;
        box-shadow: none !important;
      }
      #teaser-pdf embed,
      #teaser-pdf iframe {
        border: 0 !important;
        outline: 0 !important;
      }
    `;
    document.head.appendChild(style);
  }
});
