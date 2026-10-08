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
  const [targetTimeline, setTargetTimeline] = useState("3 months");



  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);

  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);



  const [selectedNode, setSelectedNode] = useState(null);

  const [completedNodes, setCompletedNodes] = useState([]);



  // NEW: selected skill

  const [selectedSkill, setSelectedSkill] = useState(null);



  // NEW: completed/known skills

  const [completedSkills, setCompletedSkills] = useState({});



  const [loading, setLoading] = useState(false);

  const [aiSource, setAiSource] = useState("");

  const [roadmapSummary, setRoadmapSummary] = useState("");



  const [customTimelineValue, setCustomTimelineValue] = useState("30");
  const [customTimelineUnit, setCustomTimelineUnit] = useState("days");

  const generateRoadmap = async () => {

    if (!dreamJob.trim()) {

      alert("Please enter your dream job first.");

      return;

    }



    setLoading(true);

    setSelectedNode(null);

    setSelectedSkill(null);

    setCompletedNodes([]);

    setCompletedSkills({});



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
          targetTimeline:
            targetTimeline === "custom"
              ? `${customTimelineValue} ${customTimelineUnit}`
              : targetTimeline,

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
    setTargetTimeline("3 months");
    setCustomTimelineValue("30");
    setCustomTimelineUnit("days");



    setNodes(initialNodes);

    setEdges(initialEdges);



    setSelectedNode(null);

    setSelectedSkill(null);

    setCompletedNodes([]);

    setCompletedSkills({});

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



    // Don't allow removing the main goal

    if (selectedNode.id === "goal") return;



    const nodeId = selectedNode.id;



    const incomingNodes = edges

      .filter((edge) => edge.target === nodeId)

      .map((edge) => edge.source);



    const outgoingNodes = edges

      .filter((edge) => edge.source === nodeId)

      .map((edge) => edge.target);



    setNodes((currentNodes) =>

      currentNodes.filter((node) => node.id !== nodeId),

    );



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



    // Remove from completed list if necessary

    setCompletedNodes((previous) => previous.filter((id) => id !== nodeId));



    setSelectedNode(null);

    setSelectedSkill(null);

  };



  // -----------------------------------------

  // SKILL FLOW

  // -----------------------------------------



  const getSkillFlow = (skill) => {

    const milestone = selectedNode?.data?.milestone;



    // Gemini-generated skill-specific learning path

    const aiPath = milestone?.skillPaths?.[skill];



    // Fallback in case a skill path is missing

    return [

      {

        number: "01",

        title: `Learn ${skill}`,

        description:

          aiPath?.learn ||

          `Understand the core concepts of ${skill} relevant to your ${dreamJob} goal.`,

        icon: "📚",

      },

      {

        number: "02",

        title: `Practice ${skill}`,

        description:

          aiPath?.practice ||

          `Practice ${skill} through focused exercises and coding tasks.`,

        icon: "🧠",

      },

      {

        number: "03",

        title: `Build with ${skill}`,

        description:

          aiPath?.build || `Build a practical project using ${skill}.`,

        icon: "🚀",

      },

      {

        number: "04",

        title: `Prove ${skill}`,

        description:

          aiPath?.prove ||

          `Create visible proof of your ${skill} through GitHub or a portfolio project.`,

        icon: "💼",

      },

    ];

  };



  const completeSkill = () => {

    if (!selectedSkill || !selectedNode) return;



    const skillKey = `${selectedNode.id}-${selectedSkill}`;



    setCompletedSkills((previous) => {

      const updatedSkills = {

        ...previous,

        [skillKey]: true,

      };



      const milestoneSkills = selectedNode.data?.milestone?.skills || [];



      const allSkillsCompleted =

        milestoneSkills.length > 0 &&

        milestoneSkills.every(

          (skill) => updatedSkills[`${selectedNode.id}-${skill}`],

        );



      // Automatically complete the milestone

      if (allSkillsCompleted) {

        if (!completedNodes.includes(selectedNode.id)) {

          setCompletedNodes((previousNodes) => [

            ...previousNodes,

            selectedNode.id,

          ]);

        }



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



      return updatedSkills;

    });

  };



  const markSkillKnown = () => {

    if (!selectedSkill || !selectedNode) return;



    const skillKey = `${selectedNode.id}-${selectedSkill}`;



    setCompletedSkills((previous) => {

      const updatedSkills = {

        ...previous,

        [skillKey]: "known",

      };



      const milestoneSkills = selectedNode.data?.milestone?.skills || [];



      const allSkillsCompleted =

        milestoneSkills.length > 0 &&

        milestoneSkills.every(

          (skill) => updatedSkills[`${selectedNode.id}-${skill}`],

        );



      if (allSkillsCompleted) {

        setCompletedNodes((previousNodes) => {

          if (previousNodes.includes(selectedNode.id)) {

            return previousNodes;

          }



          return [...previousNodes, selectedNode.id];

        });



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



      return updatedSkills;

    });



    setSelectedSkill(null);

  };



  const roadmapMilestones = nodes.filter((node) => node.id !== "goal");



  const progress =

    roadmapMilestones.length > 0

      ? Math.min(

          100,

          Math.round((completedNodes.length / roadmapMilestones.length) * 100),

        )

      : 0;



  if (started) {

    const selectedDetails = selectedNode?.data?.milestone || null;



    const skillFlow = selectedSkill ? getSkillFlow(selectedSkill) : [];



    const skillKey =

      selectedSkill && selectedNode

        ? `${selectedNode.id}-${selectedSkill}`

        : "";



    const currentSkillStatus = completedSkills[skillKey];



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

              {level} · {hours} hours/week · Target:{" "}
              {targetTimeline === "custom"
                ? `${customTimelineValue} ${customTimelineUnit}`
                : targetTimeline}

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

                setSelectedSkill(null);

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



            {/* -------------------------------- */}

            {/* MILESTONE DETAILS */}

            {/* -------------------------------- */}



            {selectedNode && selectedDetails && !selectedSkill && (

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



                {/* CLICKABLE SKILLS */}

                {selectedDetails.skills?.length > 0 && (

                  <div className="detail-box">

                    <strong>🧠 Skills</strong>



                    <div

                      style={{

                        display: "flex",

                        flexWrap: "wrap",

                        gap: "8px",

                        marginTop: "12px",

                      }}

                    >

                      {selectedDetails.skills.map((skill, index) => {

                        const key = `${selectedNode.id}-${skill}`;

                        const status = completedSkills[key];



                        return (

                          <button

                            key={`${skill}-${index}`}

                            onClick={() => setSelectedSkill(skill)}

                            style={{

                              border: "1px solid #31577e",

                              background: status

                                ? "rgba(34,197,94,.12)"

                                : "#10253c",

                              color: status ? "#86efac" : "#bfdbfe",

                              borderRadius: "9px",

                              padding: "9px 11px",

                              cursor: "pointer",

                              fontSize: "12px",

                              fontWeight: 600,

                              transition: "0.2s ease",

                            }}

                          >

                            {status === "known" ? "✓ " : status ? "✓ " : "→ "}

                            {skill}

                          </button>

                        );

                      })}

                    </div>



                    <p

                      style={{

                        marginTop: "10px",

                        fontSize: "11px",

                        opacity: 0.6,

                      }}

                    >

                      Click a skill to open its learning path.

                    </p>

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



            {/* -------------------------------- */}

            {/* SKILL LEARNING FLOW */}

            {/* -------------------------------- */}



            {selectedNode && selectedDetails && selectedSkill && (

              <div

                className="node-details"

                style={{

                  width: "340px",

                }}

              >

                <button

                  className="close-details"

                  onClick={() => setSelectedSkill(null)}

                >

                  ×

                </button>



                <button

                  onClick={() => setSelectedSkill(null)}

                  style={{

                    background: "transparent",

                    border: "none",

                    color: "#60a5fa",

                    cursor: "pointer",

                    fontSize: "12px",

                    marginBottom: "10px",

                    padding: 0,

                  }}

                >

                  ← Back to milestone

                </button>



                <p className="eyebrow">SKILL LEARNING PATH</p>



                <h2>{selectedSkill}</h2>



                <p className="detail-text">

                  A practical path to build this skill for your{" "}

                  <strong>{dreamJob}</strong> goal.

                </p>



                {/* FLOWCHART */}

                <div

                  style={{

                    marginTop: "18px",

                    display: "flex",

                    flexDirection: "column",

                    gap: "0",

                  }}

                >

                  {skillFlow.map((step, index) => (

                    <div key={step.number}>

                      <div

                        style={{

                          display: "flex",

                          gap: "12px",

                          alignItems: "flex-start",

                        }}

                      >

                        <div

                          style={{

                            minWidth: "36px",

                            height: "36px",

                            borderRadius: "50%",

                            display: "flex",

                            alignItems: "center",

                            justifyContent: "center",

                            background:

                              index === skillFlow.length - 1

                                ? "rgba(34,197,94,.15)"

                                : "rgba(37,99,235,.15)",

                            border:

                              index === skillFlow.length - 1

                                ? "1px solid #22c55e"

                                : "1px solid #3b82f6",

                            fontSize: "15px",

                          }}

                        >

                          {step.icon}

                        </div>



                        <div

                          style={{

                            flex: 1,

                            background: "#0d1d30",

                            border: "1px solid #1f3853",

                            borderRadius: "10px",

                            padding: "11px",

                          }}

                        >

                          <div

                            style={{

                              fontSize: "10px",

                              color: "#60a5fa",

                              fontWeight: 700,

                              letterSpacing: "1px",

                            }}

                          >

                            STEP {step.number}

                          </div>



                          <strong

                            style={{

                              display: "block",

                              marginTop: "3px",

                              color: "#e2e8f0",

                            }}

                          >

                            {step.title}

                          </strong>



                          <p

                            style={{

                              margin: "6px 0 0",

                              fontSize: "11px",

                              lineHeight: 1.5,

                              color: "#8da1b7",

                            }}

                          >

                            {step.description}

                          </p>

                        </div>

                      </div>



                      {index < skillFlow.length - 1 && (

                        <div

                          style={{

                            width: "1px",

                            height: "20px",

                            background: "#31577e",

                            marginLeft: "18px",

                          }}

                        />

                      )}

                    </div>

                  ))}

                </div>



                {/* SKILL STATUS */}

                {currentSkillStatus ? (

                  <button

                    className="complete-btn completed"

                    disabled

                    style={{ marginTop: "18px" }}

                  >

                    ✓{" "}

                    {currentSkillStatus === "known"

                      ? "Already Known"

                      : "Skill Completed"}

                  </button>

                ) : (

                  <>

                    <button

                      className="complete-btn"

                      onClick={markSkillKnown}

                      style={{ marginTop: "18px" }}

                    >

                      ✓ I already know this skill

                    </button>



                    <button className="complete-btn" onClick={completeSkill}>

                      ✓ Mark skill as completed

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



            <div className="form-grid">
              <label>
                Target Timeline
                <select
                  value={targetTimeline}
                  onChange={(e) => setTargetTimeline(e.target.value)}
                >
                  <option value="4 weeks">4 weeks</option>
                  <option value="8 weeks">8 weeks</option>
                  <option value="3 months">3 months</option>
                  <option value="6 months">6 months</option>
                  <option value="9 months">9 months</option>
                  <option value="1 year">1 year</option>
                  <option value="custom">Custom</option>
                </select>
              </label>

              {targetTimeline === "custom" && (
                <>
                  <label>
                    Custom Duration
                    <input
                      type="number"
                      min="1"
                      max="120"
                      value={customTimelineValue}
                      onChange={(e) => setCustomTimelineValue(e.target.value)}
                    />
                  </label>

                  <label>
                    Unit
                    <select
                      value={customTimelineUnit}
                      onChange={(e) => setCustomTimelineUnit(e.target.value)}
                    >
                      <option value="days">Days</option>
                      <option value="weeks">Weeks</option>
                      <option value="months">Months</option>
                    </select>
                  </label>
                </>
              )}
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