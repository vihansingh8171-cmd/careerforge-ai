import { useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import "./App.css";

const API_URL = "https://careerforge-ai-c71c.onrender.com";

const initialNodes = [
  {
    id: "goal",
    position: { x: 350, y: 20 },
    data: { label: "🎯 Dream Job" },
    className: "goal-node",
  },
];

const initialEdges = [];

function App() {
  const [started, setStarted] = useState(false);

  const [dreamJob, setDreamJob] = useState("");
  const [level, setLevel] = useState("Beginner");
  const [hours, setHours] = useState("10");
  const [skills, setSkills] = useState("");

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const [selectedNode, setSelectedNode] = useState(null);
  const [completedNodes, setCompletedNodes] = useState([]);

  const [loading, setLoading] = useState(false);
  const [aiSource, setAiSource] = useState("");
  const [roadmapSummary, setRoadmapSummary] = useState("");

  const generateRoadmap = async () => {
    if (!dreamJob.trim()) {
      alert("Please enter your dream job first.");
      return;
    }

    setLoading(true);
    setSelectedNode(null);
    setCompletedNodes([]);

    try {
      const response = await fetch(`${API_URL}/api/generate-roadmap`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dreamJob: dreamJob.trim(),
          currentLevel: level,
          hoursPerWeek: hours,
          knownSkills: skills,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to generate roadmap.");
      }

      if (
        !data.milestones ||
        !Array.isArray(data.milestones) ||
        data.milestones.length === 0
      ) {
        throw new Error("AI returned an invalid roadmap.");
      }

      const dynamicNodes = [
        {
          id: "goal",
          position: { x: 350, y: 20 },
          data: {
            label: `🎯 ${data.careerTitle || dreamJob}`,
          },
          className: "goal-node",
        },
      ];

      const positions = [
        { x: 100, y: 180 },
        { x: 350, y: 180 },
        { x: 600, y: 180 },
        { x: 350, y: 340 },
        { x: 350, y: 500 },
        { x: 350, y: 660 },
        { x: 350, y: 820 },
        { x: 350, y: 980 },
      ];

      data.milestones.forEach((milestone, index) => {
        dynamicNodes.push({
          id: milestone.id || `m${index + 1}`,
          position: positions[index] || {
            x: 350,
            y: 180 + index * 160,
          },
          data: {
            label:
              milestone.shortTitle ||
              milestone.title ||
              `Milestone ${index + 1}`,
            milestone,
          },
        });
      });

      const dynamicEdges = [];

      if (data.milestones.length > 0) {
        dynamicEdges.push({
          id: "goal-first",
          source: "goal",
          target: data.milestones[0].id || "m1",
          animated: true,
        });
      }

      for (let i = 1; i < data.milestones.length; i++) {
        dynamicEdges.push({
          id: `roadmap-${i}`,
          source: data.milestones[i - 1].id || `m${i}`,
          target: data.milestones[i].id || `m${i + 1}`,
          animated: i < 3,
        });
      }

      setNodes(dynamicNodes);
      setEdges(dynamicEdges);

      setRoadmapSummary(data.summary || "");
      setAiSource(data.source || "gemini");
      setStarted(true);
    } catch (error) {
      console.error("Roadmap generation error:", error);

      alert(
        "Could not generate the roadmap. Please make sure the CareerForge backend is running.",
      );
    } finally {
      setLoading(false);
    }
  };

  const resetRoadmap = () => {
    setStarted(false);
    setDreamJob("");
    setSkills("");
    setLevel("Beginner");
    setHours("10");

    setNodes(initialNodes);
    setEdges(initialEdges);

    setSelectedNode(null);
    setCompletedNodes([]);
    setAiSource("");
    setRoadmapSummary("");
  };

  const markCompleted = () => {
    if (!selectedNode) return;

    if (!completedNodes.includes(selectedNode.id)) {
      setCompletedNodes((previous) => [...previous, selectedNode.id]);

      setNodes((currentNodes) =>
        currentNodes.map((node) =>
          node.id === selectedNode.id
            ? {
                ...node,
                className: `${node.className || ""} completed-node`,
              }
            : node,
        ),
      );
    }
  };
  const markAsKnown = () => {
    if (!selectedNode) return;

    const nodeId = selectedNode.id;

    // Find nodes connected before and after this milestone
    const incomingNodes = edges
      .filter((edge) => edge.target === nodeId)
      .map((edge) => edge.source);

    const outgoingNodes = edges
      .filter((edge) => edge.source === nodeId)
      .map((edge) => edge.target);

    // Remove the selected milestone
    setNodes((currentNodes) =>
      currentNodes.filter((node) => node.id !== nodeId),
    );

    // Remove old connections and create direct connections
    setEdges((currentEdges) => {
      const remainingEdges = currentEdges.filter(
        (edge) => edge.source !== nodeId && edge.target !== nodeId,
      );

      const newEdges = [];

      incomingNodes.forEach((source) => {
        outgoingNodes.forEach((target) => {
          const bridgeId = `skip-${source}-${target}`;

          if (
            !remainingEdges.some(
              (edge) => edge.source === source && edge.target === target,
            )
          ) {
            newEdges.push({
              id: bridgeId,
              source,
              target,
              animated: true,
            });
          }
        });
      });

      return [...remainingEdges, ...newEdges];
    });

    setSelectedNode(null);
  };

  const roadmapMilestones = nodes.filter((node) => node.id !== "goal");

  const progress =
    roadmapMilestones.length > 0
      ? Math.round((completedNodes.length / roadmapMilestones.length) * 100)
      : 0;

  if (started) {
    const selectedDetails = selectedNode?.data?.milestone || null;

    return (
      <div className="app roadmap-page">
        <header className="topbar">
          <div className="brand">
            <div className="brand-icon">CF</div>

            <div>
              <h2>CareerForge AI</h2>
              <span>Reverse-engineer your dream career</span>
            </div>
          </div>

          <button className="back-btn" onClick={resetRoadmap}>
            ← New Roadmap
          </button>
        </header>

        <div className="roadmap-header">
          <div>
            <p className="eyebrow">YOUR AI-GENERATED ROADMAP</p>

            <h1>{dreamJob}</h1>

            <p>
              {level} · {hours} hours/week
              {skills ? ` · Already know: ${skills}` : ""}
            </p>

            {roadmapSummary && (
              <p
                style={{
                  maxWidth: "720px",
                  marginTop: "10px",
                  opacity: 0.8,
                }}
              >
                {roadmapSummary}
              </p>
            )}

            {aiSource && (
              <div
                style={{
                  marginTop: "10px",
                  fontSize: "12px",
                  opacity: 0.75,
                }}
              >
                ✦{" "}
                {aiSource === "gemini"
                  ? "Generated by Gemini AI"
                  : "CareerForge AI fallback engine"}
              </div>
            )}
          </div>

          <div className="progress-card">
            <span>Career Progress</span>

            <strong>{progress}%</strong>

            <div className="progress-bar">
              <div
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>
          </div>
        </div>

        <div className="roadmap-layout">
          <div className="flow-container">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeClick={(event, node) => {
                event.preventDefault();
                event.stopPropagation();

                setSelectedNode(node);
              }}
              nodesDraggable={false}
              nodesConnectable={false}
              elementsSelectable={true}
              fitView
              fitViewOptions={{
                padding: 0.15,
                minZoom: 0.55,
                maxZoom: 1.2,
              }}
              attributionPosition="bottom-left"
            >
              <Background gap={20} size={1} />
              <Controls />
              <MiniMap />
            </ReactFlow>

            {selectedNode && selectedDetails && (
              <div className="node-details">
                <button
                  className="close-details"
                  onClick={() => setSelectedNode(null)}
                >
                  ×
                </button>

                <p className="eyebrow">MILESTONE DETAILS</p>

                <h2>{selectedDetails.title}</h2>

                <p className="detail-text">{selectedDetails.description}</p>

                {selectedDetails.skills?.length > 0 && (
                  <div className="detail-box">
                    <strong>🧠 Skills</strong>
                    <p>{selectedDetails.skills.join(" • ")}</p>
                  </div>
                )}

                <div className="detail-box">
                  <strong>🎯 What to do</strong>
                  <p>{selectedDetails.action}</p>
                </div>

                <div className="detail-box">
                  <strong>🚀 Suggested project</strong>
                  <p>{selectedDetails.project}</p>
                </div>

                <div className="detail-box">
                  <strong>💼 Proof of skill</strong>
                  <p>{selectedDetails.proof}</p>
                </div>

                <div
                  className="detail-box"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "12px",
                  }}
                >
                  <span>
                    ⏱️ {selectedDetails.estimatedWeeks || 1} week
                    {selectedDetails.estimatedWeeks > 1 ? "s" : ""}
                  </span>

                  <span>⭐ {selectedDetails.priority || "High"} Priority</span>
                </div>

                {completedNodes.includes(selectedNode.id) ? (
                  <button className="complete-btn completed" disabled>
                    ✓ Completed
                  </button>
                ) : (
                  <>
                    <button className="complete-btn" onClick={markAsKnown}>
                      ✓ I already know this
                    </button>

                    <button className="complete-btn" onClick={markCompleted}>
                      ✓ Mark as completed
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          <aside className="side-panel">
            <p className="eyebrow">HOW IT WORKS</p>

            <h2>Your journey</h2>

            <div className="info-item">
              <span>01</span>

              <div>
                <strong>Reverse-engineer the goal</strong>
                <p>Start with the exact career you want.</p>
              </div>
            </div>

            <div className="info-item">
              <span>02</span>

              <div>
                <strong>Identify skill gaps</strong>
                <p>Your existing skills and level influence the roadmap.</p>
              </div>
            </div>

            <div className="info-item">
              <span>03</span>

              <div>
                <strong>Build proof</strong>
                <p>
                  Every milestone includes projects and proof-of-skill actions.
                </p>
              </div>
            </div>

            <div className="info-item">
              <span>04</span>

              <div>
                <strong>Become job ready</strong>
                <p>Finish with internship and job preparation.</p>
              </div>
            </div>

            <div className="ai-note">
              <span>✦</span>

              <div>
                <strong>AI-Powered</strong>

                <p>
                  Your roadmap is generated from your target career, current
                  level, available time and existing skills.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <nav className="navbar">
        <div className="brand">
          <div className="brand-icon">CF</div>

          <div>
            <h2>CareerForge</h2>
            <span>AI Career Roadmapper</span>
          </div>
        </div>

        <div className="nav-status">
          <span className="status-dot">●</span>
          AI Career Engine
        </div>
      </nav>

      <main className="hero">
        <section className="hero-content">
          <div className="badge">✦ PERSONALIZED CAREER INTELLIGENCE</div>

          <h1>
            Don't just choose a career.
            <span>Reverse-engineer it.</span>
          </h1>

          <p className="hero-text">
            Tell CareerForge exactly where you want to go. We'll turn your dream
            job into a realistic, interactive path of skills, projects,
            experience and milestones.
          </p>

          <div className="input-card">
            <div className="card-heading">
              <div>
                <h2>Build your career roadmap</h2>
                <p>Tell us about your career destination.</p>
              </div>

              <span className="step-label">STEP 1 OF 1</span>
            </div>

            <label>
              Dream Job
              <input
                type="text"
                placeholder="e.g. Full Stack Developer at a FinTech startup"
                value={dreamJob}
                onChange={(e) => setDreamJob(e.target.value)}
              />
            </label>

            <div className="form-grid">
              <label>
                Current Level
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                >
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </label>

              <label>
                Hours per week
                <select
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                >
                  <option value="5">5 hours</option>
                  <option value="10">10 hours</option>
                  <option value="15">15 hours</option>
                  <option value="20">20+ hours</option>
                </select>
              </label>
            </div>

            <label>
              Skills you already know
              <input
                type="text"
                placeholder="e.g. HTML, CSS, JavaScript"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
              />
            </label>

            <button
              className="generate-btn"
              onClick={generateRoadmap}
              disabled={loading}
            >
              {loading
                ? "Generating AI Roadmap..."
                : "Generate My Career Roadmap"}

              <span>{loading ? "✦" : "→"}</span>
            </button>
          </div>

          <div className="trust-row">
            <span>✓ Personalized</span>
            <span>✓ Skill-aware</span>
            <span>✓ Time-aware</span>
            <span>✓ Interactive</span>
          </div>
        </section>

        <section className="preview">
          <div className="preview-glow"></div>

          <div className="preview-card">
            <div className="preview-top">
              <span>LIVE ROADMAP PREVIEW</span>
              <span className="live-dot">● LIVE</span>
            </div>

            <div className="preview-job">
              <div className="preview-icon">🎯</div>

              <div>
                <small>DREAM DESTINATION</small>
                <strong>Full Stack Developer</strong>
              </div>
            </div>

            <div className="mini-roadmap">
              <div className="mini-node active">
                <span>01</span>
                Foundations
              </div>

              <div className="mini-line"></div>

              <div className="mini-node">
                <span>02</span>
                Frontend
              </div>

              <div className="mini-line"></div>

              <div className="mini-node">
                <span>03</span>
                Backend
              </div>

              <div className="mini-line"></div>

              <div className="mini-node">
                <span>04</span>
                Projects
              </div>

              <div className="mini-line"></div>

              <div className="mini-node final">
                <span>05</span>
                Job Ready
              </div>
            </div>

            <div className="preview-footer">
              <span>✦ AI GENERATED PATH</span>
              <span>5+ milestones</span>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <span>CareerForge AI</span>
        <span>Built for students preparing for the future of work.</span>
      </footer>
    </div>
  );
}

export default App;
