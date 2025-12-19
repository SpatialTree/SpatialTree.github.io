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

