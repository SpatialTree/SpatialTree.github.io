# SpatialTree Paper Notes

## Core Idea
- SpatialTree introduces a capability-centric taxonomy for spatial intelligence in MLLMs, decomposing skills into four hierarchical levels (L1 perception, L2 mental mapping, L3 mental simulation, L4 agentic competence).
- Builds SpatialTree-Bench, first benchmark organized by capabilities rather than tasks, and SpatialEngine for scalable annotation.

## Capability Levels
- **L1 Perception**: Orientation (gravity, object pose), Geometry (size, shape, distance), Motion (ego vs allocentric), Relation (correspondence, relative direction), Localization (3D detection & grounding).
- **L2 Mental Mapping**: Combines spatial understanding (multi-view correspondence, perspective taking, relational grounding) with memory (memory retrieval, cognitive maps).
- **L3 Mental Simulation**: Causal reasoning (predict dynamics, relationships) and sequential planning (goal-driven action plans, route reasoning).
- **L4 Agentic Competence**: Goal-driven execution, open-world exploration, self-goaling, knowledge acquisition, navigation, manipulation using unified spatial action mapping.

## SpatialEngine
- 3-layer modular data engine: models → pipelines → workflows.
- 12 reusable pipelines (metric 3D reconstruction, orientation alignment, point tracking, affordance pointing, etc.) feed 24 workflows across abilities.
- Aggregates data from >10 public datasets (VSI-Bench, MMSI-Bench, LLaVa3D, SpatialEval, MindCube, CameraBench, Omnispatial, EmbodiedBench, SpatialViz, Multi-SPA, 3DSR-Bench) plus new SpatialPlus data to fill gaps (Orientation, Shape, Spatial Caption, L4 agentic tasks) using videos from games, egocentric manipulation, robotics.

## Spatial Action Mapping
- Defines 6 fundamental navigation primitives (truck, dolly, pedestal, pan, tilt, roll) with thresholds (±0.01 m/s translations, ±0.5°/s rotations).
- Adds manipulation primitives (gripper open/close, push/pull, grab) for robot and human-hand settings.
- Provides unified discrete interface for MLLM planning & evaluation.

## Benchmark & Metrics
- Evaluates diverse MLLMs (GPT-5, GPT-4o, Gemini 2.5 family, Claude 3.7, GLM-4.5V, SeedVL, Qwen2.5VL variants, Kimi-VL) across 4 layers with ability-specific metrics (accuracy, MSE, angular error, task success, positional/orientation error).
- Weighted aggregation to balance ability coverage.

## Key Findings
- Gemini2.5-Pro leads SpatialTree-Bench with ~53.9 average; Gemini2.5-Flash second (~47.8). Best open-source: Qwen2.5VL-72B (~41.3).
- Reasoning-enhanced “thinking” models consistently outperform non-thinking counterparts (e.g., Gemini2.5-Pro vs Gemini2.5-Pro-NT: +2.5 avg).
- Higher-level abilities (L3/L4) show strong interdependencies; L1 abilities mostly independent.
- Foundational L1 abilities (geometry size/dist, correspondence) strongly correlate with L4 agentic performance.
- Atomic prompting: injecting low-level cues (correspondence, depth, size) improves L4 navigation by 5–22% (e.g., correspondence prompt yields +12%).

## Takeaways
- Capability-centric hierarchy offers interpretable roadmap for training embodied MLLMs.
- SpatialEngine enables scalable, modular annotation across capability tree.
- SpatialTree-Bench reveals gaps in current models, emphasizing need for better perception and grounding to unlock agentic competence.
