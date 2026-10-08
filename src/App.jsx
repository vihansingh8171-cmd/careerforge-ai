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

const initialNodes = [
  {
    id: "goal",
    position: { x: 350, y: 20 },
    data: { label: "🎯 Dream Job" },
    className: "goal-node",
  },
  {
    id: "foundation",
    position: { x: 100, y: 180 },
    data: { label: "📚 Foundations" },
  },
  {
    id: "frontend",
    position: { x: 350, y: 180 },
    data: { label: "⚛️ Frontend Development" },
  },
  {
    id: "backend",
    position: { x: 600, y: 180 },
    data: { label: "🖥️ Backend Development" },
  },
  {
    id: "projects",
    position: { x: 350, y: 340 },
    data: { label: "🚀 Real-World Projects" },
  },
  {
    id: "internship",
    position: { x: 350, y: 500 },
    data: { label: "💼 Internship Ready" },
  },
  {
    id: "job",
    position: { x: 350, y: 660 },
    data: { label: "🏆 Dream Job Ready" },
  },
];

const initialEdges = [
  {
    id: "e1",
    source: "goal",
    target: "foundation",
    animated: true,
  },
  {
    id: "e2",
    source: "goal",
    target: "frontend",
    animated: true,
  },
  {
    id: "e3",
    source: "goal",
    target: "backend",
    animated: true,
  },
  {
    id: "e4",
    source: "foundation",
    target: "projects",
  },
  {
    id: "e5",
    source: "frontend",
    target: "projects",
  },
  {
    id: "e6",
    source: "backend",
    target: "projects",
  },
  {
    id: "e7",
    source: "projects",
    target: "internship",
  },
  {
    id: "e8",
    source: "internship",
    target: "job",
  },
];
const careerTemplates = {
  developer: {
    keywords: [
      "developer",
      "software",
      "web",
      "frontend",
      "backend",
      "full stack",
      "app developer",
    ],
    stages: [
      "📚 Programming Foundations",
      "⚛️ Frontend Development",
      "🖥️ Backend & APIs",
      "🚀 Full-Stack Projects",
      "💼 Internship Ready",
      "🏆 Developer Job Ready",
    ],
  },

  data: {
    keywords: [
      "data scientist",
      "data science",
      "machine learning",
      "ml engineer",
      "ai engineer",
      "artificial intelligence",
      "data analyst",
    ],
    stages: [
      "🐍 Python & Mathematics",
      "📊 Data Analysis",
      "🤖 Machine Learning",
      "🚀 AI/Data Projects",
      "💼 Internship Ready",
      "🏆 Data Career Ready",
    ],
  },

  cybersecurity: {
    keywords: [
      "cybersecurity",
      "cyber security",
      "security engineer",
      "ethical hacker",
      "penetration tester",
      "soc analyst",
      "information security",
    ],
    stages: [
      "🌐 Networking & Linux",
      "🔐 Security Fundamentals",
      "🕵️ Ethical Hacking",
      "🚀 Security Projects",
      "💼 Internship Ready",
      "🏆 Security Career Ready",
    ],
  },

  design: {
    keywords: [
      "ui ux",
      "ui/ux",
      "ux designer",
      "ui designer",
      "product designer",
      "graphic designer",
    ],
    stages: [
      "🎨 Design Fundamentals",
      "🖌️ Figma & UI Design",
      "🧠 UX Research",
      "🚀 Portfolio Projects",
      "💼 Internship Ready",
      "🏆 Design Career Ready",
    ],
  },

  marketing: {
    keywords: [
      "digital marketing",
      "marketing",
      "social media",
      "seo",
      "content creator",
      "brand manager",
    ],
    stages: [
      "📢 Marketing Fundamentals",
      "🔎 SEO & Analytics",
      "📱 Social Media",
      "🚀 Campaign Projects",
      "💼 Internship Ready",
      "🏆 Marketing Career Ready",
    ],
  },
};

const getCareerTemplate = (job) => {
  const normalizedJob = job.toLowerCase();

  for (const template of Object.values(careerTemplates)) {
    if (template.keywords.some((keyword) => normalizedJob.includes(keyword))) {
      return template;
    }
  }

  return careerTemplates.developer;
};
const nodeDetails = {
  goal: {
    title: "🎯 Dream Job",
    description:
      "This is your final career destination. CareerForge works backwards from this goal to create the skills and milestones you need.",
    action:
      "Define the exact role, industry and company type you want to target.",
    proof:
      "Create a clear target profile with required skills, projects and experience.",
  },

  foundation: {
    title: "📚 Foundations",
    description:
      "Build the fundamental knowledge required before moving into advanced technologies.",
    action:
      "Learn programming fundamentals, problem solving, Git and core computer science concepts.",
    proof: "Complete small practice projects and maintain your work on GitHub.",
  },

  frontend: {
    title: "⚛️ Frontend Development",
    description:
      "Learn how to create modern, responsive and interactive web applications.",
    action:
      "Master HTML, CSS, JavaScript, React and responsive UI development.",
    proof: "Build 2–3 polished frontend projects and publish them on GitHub.",
  },

  backend: {
    title: "🖥️ Backend Development",
    description:
      "Learn how applications handle data, authentication, APIs and server-side logic.",
    action: "Learn Node.js, Express, REST APIs, databases and authentication.",
    proof: "Build a backend API and connect it to a real frontend application.",
  },

  projects: {
    title: "🚀 Real-World Projects",
    description:
      "Projects convert your knowledge into visible proof that you can actually build.",
    action:
      "Build projects that solve real problems instead of only following tutorials.",
    proof:
      "Publish projects with GitHub repositories, live demos and clear documentation.",
  },

  internship: {
    title: "💼 Internship Ready",
    description: "Prepare yourself to work in a real development environment.",
    action:
      "Improve your resume, GitHub profile, communication and technical interview skills.",
    proof:
      "Complete internship applications and be ready to explain your projects.",
  },

  job: {
    title: "🏆 Dream Job Ready",
    description:
      "You have reached the final stage of the roadmap and are ready to target your desired role.",
    action:
      "Apply strategically, practice interviews and continue improving your skills.",
    proof:
      "Resume + GitHub + portfolio + interview preparation + real project experience.",
  },
};

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

  const getPersonalizedStages = (
    template,
    currentLevel,
    weeklyHours,
    knownSkills,
  ) => {
    const hours = Number(weeklyHours);

    const skillsText = knownSkills
      .toLowerCase()
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean);

    const hasSkills = skillsText.length > 0;

    let stages = [...template.stages];

    // BEGINNER
    if (currentLevel === "Beginner") {
      stages[0] = hasSkills ? `🧩 Skill Gap Analysis` : stages[0];

      stages[3] =
        hours <= 5 ? "🚀 Guided Mini Projects" : "🚀 Real-World Projects";
    }

    // INTERMEDIATE
    if (currentLevel === "Intermediate") {
      stages[0] = hasSkills ? "⚡ Existing Skills → Skill Gap" : stages[0];

      stages[3] =
        hours >= 15
          ? "🚀 Advanced Portfolio Projects"
          : "🚀 Practical Projects";
    }

    // ADVANCED
    if (currentLevel === "Advanced") {
      stages[0] = "🎯 Advanced Skill Gap";

      stages[3] =
        hours >= 15
          ? "🚀 Industry-Level Projects"
          : "🚀 Focused Capstone Project";
    }

    // TIME ADAPTATION
    if (hours <= 5) {
      stages[4] = "💼 Internship Ready · Slow Track";
      stages[5] = "🏆 Career Ready · Long Track";
    } else if (hours >= 15) {
      stages[4] = "💼 Internship Ready · Fast Track";
      stages[5] = "🏆 Career Ready · Accelerated";
    }

    return stages;
  };
 const generateRoadmap = () => {
  if (!dreamJob.trim()) {
    alert("Please enter your dream job first.");
    return;
  }

  const template = getCareerTemplate(dreamJob);

  const personalizedStages = getPersonalizedStages(
    template,
    level,
    hours,
    skills
  );

  const dynamicNodes = [
    {
      id: "goal",
      position: { x: 350, y: 20 },
      data: {
        label: `🎯 ${dreamJob}`,
      },
      className: "goal-node",
    },

    {
      id: "foundation",
      position: { x: 100, y: 180 },
      data: {
        label: personalizedStages[0],
      },
    },

    {
      id: "frontend",
      position: { x: 350, y: 180 },
      data: {
        label: personalizedStages[1],
      },
    },

    {
      id: "backend",
      position: { x: 600, y: 180 },
      data: {
        label: personalizedStages[2],
      },
    },

    {
      id: "projects",
      position: { x: 350, y: 340 },
      data: {
        label: personalizedStages[3],
      },
    },

    {
      id: "internship",
      position: { x: 350, y: 500 },
      data: {
        label: personalizedStages[4],
      },
    },

    {
      id: "job",
      position: { x: 350, y: 660 },
      data: {
        label: personalizedStages[5],
      },
    },
  ];

  setNodes(dynamicNodes);

  setCompletedNodes([]);

  setSelectedNode(null);

  setStarted(true);
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

  const progress = Math.round(
    (completedNodes.length / initialNodes.length) * 100,
  );

  if (started) {
    const selectedDetails = selectedNode ? nodeDetails[selectedNode.id] : null;

    return (
      <div className="app roadmap-page">
        {/* TOP BAR */}

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

        {/* ROADMAP HEADER */}

        <div className="roadmap-header">
          <div>
            <p className="eyebrow">YOUR PERSONALIZED ROADMAP</p>

            <h1>{dreamJob}</h1>

            <p>
              {level} · {hours} hours/week
              {skills ? ` · Already know: ${skills}` : ""}
            </p>
          </div>

          <div className="progress-card">
            <span>Career Progress</span>

            <strong>{progress}%</strong>

            <div className="progress-bar">
              <div
                style={{
                  width: `${progress}%`,
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* MAIN ROADMAP AREA */}

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
                console.log("NODE CLICKED:", node.id);
                setSelectedNode(node);
              }}
              nodesDraggable={false}
              nodesConnectable={false}
              elementsSelectable={true}
              fitView
              attributionPosition="bottom-left"
            >
              <Background gap={20} size={1} />

              <Controls />

              <MiniMap />
            </ReactFlow>

            {/* NODE DETAILS PANEL */}

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

                <div className="detail-box">
                  <strong>🎯 What to do</strong>

                  <p>{selectedDetails.action}</p>
                </div>

                <div className="detail-box">
                  <strong>💼 Proof of skill</strong>

                  <p>{selectedDetails.proof}</p>
                </div>

                {completedNodes.includes(selectedNode.id) ? (
                  <button className="complete-btn completed" disabled>
                    ✓ Completed
                  </button>
                ) : (
                  <button className="complete-btn" onClick={markCompleted}>
                    ✓ Mark as completed
                  </button>
                )}
              </div>
            )}
          </div>

          {/* SIDE PANEL */}

          <aside className="side-panel">
            <p className="eyebrow">HOW IT WORKS</p>

            <h2>Your journey</h2>

            <div className="info-item">
              <span>01</span>

              <div>
                <strong>Build foundations</strong>

                <p>Master the essential concepts for your target role.</p>
              </div>
            </div>

            <div className="info-item">
              <span>02</span>

              <div>
                <strong>Develop job skills</strong>

                <p>Learn the technologies companies actually use.</p>
              </div>
            </div>

            <div className="info-item">
              <span>03</span>

              <div>
                <strong>Build proof</strong>

                <p>Create real projects that demonstrate your ability.</p>
              </div>
            </div>

            <div className="info-item">
              <span>04</span>

              <div>
                <strong>Become job ready</strong>

                <p>Prepare for interviews and real-world roles.</p>
              </div>
            </div>

            <div className="ai-note">
              <span>✦</span>

              <div>
                <strong>AI-Powered</strong>

                <p>
                  Your roadmap will adapt to your existing skills, time and
                  career goal.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    );
  }

  {
    /* LANDING PAGE */
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

            <button className="generate-btn" onClick={generateRoadmap}>
              Generate My Career Roadmap
              <span>→</span>
            </button>
          </div>

          <div className="trust-row">
            <span>✓ Personalized</span>

            <span>✓ Skill-aware</span>

            <span>✓ Time-aware</span>

            <span>✓ Interactive</span>
          </div>
        </section>

        {/* PREVIEW */}

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

              <span>5 milestones</span>
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
