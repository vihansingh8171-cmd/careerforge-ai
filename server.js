import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});


// ==========================================
// TIMELINE HELPERS
// ==========================================

function timelineToWeeks(timeline) {
  const value = String(timeline || "3 months").toLowerCase().trim();

  const match = value.match(/\d+(\.\d+)?/);
  const amount = match ? Number(match[0]) : 12;

  if (value.includes("day")) {
    return Math.max(1, Math.ceil(amount / 7));
  }

  if (value.includes("week")) {
    return Math.max(1, Math.ceil(amount));
  }

  if (value.includes("month")) {
    return Math.max(1, Math.ceil(amount * 4.33));
  }

  if (value.includes("year")) {
    return Math.max(1, Math.ceil(amount * 52));
  }

  return 12;
}


// ==========================================
// SKILL PATH
// ==========================================

function createSkillPath(skill, dreamJob, project, proof) {
  return {
    learn: `Learn the core concepts of ${skill} that are relevant to becoming a ${dreamJob}.`,

    practice: `Practice ${skill} using focused exercises, coding tasks and small challenges.`,

    build:
      project ||
      `Build a practical project related to ${dreamJob} using ${skill}.`,

    prove:
      proof ||
      `Show proof of ${skill} through GitHub, portfolio work or a project demonstration.`,
  };
}


// ==========================================
// FALLBACK ROADMAP
// ==========================================

function createFallbackRoadmap({
  dreamJob,
  currentLevel,
  hoursPerWeek,
  knownSkills,
  targetTimeline,
}) {
  const timelineWeeks = timelineToWeeks(targetTimeline);

  const milestones = [
    {
      id: "m1",
      title: "Career Skill Gap",
      shortTitle: "Skill Gap",
      description: `Analyze the skills required for ${dreamJob} and compare them with your current level.`,
      skills: ["Career requirements", "Skill assessment"],
      action: `Identify the most important skills required for a ${dreamJob} role.`,
      project: `Create a personal ${dreamJob} skill-gap checklist.`,
      proof: "Document your current skills and target skills.",
      estimatedWeeks: 1,
      priority: "High",
    },

    {
      id: "m2",
      title: "Core Foundations",
      shortTitle: "Foundations",
      description: `Build the technical foundations required for ${dreamJob}.`,
      skills: ["Programming fundamentals", "Problem solving"],
      action: `Practice the core programming and problem-solving concepts used in ${dreamJob}.`,
      project: "Build 3 small practice projects.",
      proof: "Upload your practice work to GitHub.",
      estimatedWeeks: 2,
      priority: "High",
    },

    {
      id: "m3",
      title: "Role-Specific Skills",
      shortTitle: "Core Skills",
      description: `Develop the most important technical skills for ${dreamJob}.`,
      skills: ["Technical tools", "APIs"],
      action: `Learn and practice tools commonly used in your target role.`,
      project: `Build a small ${dreamJob}-related application.`,
      proof: "Publish the project with a README.",
      estimatedWeeks: 2,
      priority: "High",
    },

    {
      id: "m4",
      title: "Practical Project",
      shortTitle: "Project",
      description: `Convert your knowledge into a realistic portfolio project.`,
      skills: ["Project development", "GitHub"],
      action: `Build an end-to-end project that solves a real-world problem.`,
      project: `Create a portfolio-ready ${dreamJob} project.`,
      proof: "Publish the source code and project documentation.",
      estimatedWeeks: 2,
      priority: "High",
    },

    {
      id: "m5",
      title: "Advanced Practice",
      shortTitle: "Advanced",
      description: `Strengthen your skills through advanced tasks and debugging.`,
      skills: ["Advanced concepts", "Debugging"],
      action: "Solve harder problems and improve your existing project.",
      project: "Add an advanced feature to your main project.",
      proof: "Document the improvement and technical decisions.",
      estimatedWeeks: 2,
      priority: "Medium",
    },

    {
      id: "m6",
      title: "Portfolio & Resume",
      shortTitle: "Portfolio",
      description: `Prepare strong proof of your skills for recruiters.`,
      skills: ["Portfolio", "Resume"],
      action: `Create a portfolio and resume focused on ${dreamJob}.`,
      project: "Build a professional portfolio.",
      proof: "Keep GitHub, resume and portfolio links ready.",
      estimatedWeeks: 1,
      priority: "High",
    },

    {
      id: "m7",
      title: "Job Readiness",
      shortTitle: "Job Ready",
      description: `Prepare for internships, interviews and entry-level opportunities.`,
      skills: ["Interview preparation", "Communication"],
      action: "Practice technical and behavioral interview questions.",
      project: "Complete mock interviews and a timed technical assessment.",
      proof: "Track your mock interview performance.",
      estimatedWeeks: 1,
      priority: "High",
    },
  ];


  // ------------------------------------------
  // Adjust roadmap to selected timeline
  // ------------------------------------------

  const totalDefaultWeeks = milestones.reduce(
    (total, milestone) => total + milestone.estimatedWeeks,
    0
  );

  const scale = timelineWeeks / totalDefaultWeeks;

  let remainingWeeks = timelineWeeks;

  milestones.forEach((milestone, index) => {
    if (index === milestones.length - 1) {
      milestone.estimatedWeeks = Math.max(1, remainingWeeks);
      return;
    }

    const calculatedWeeks = Math.max(
      1,
      Math.round(milestone.estimatedWeeks * scale)
    );

    const weeksLeftAfterThis = milestones.length - index - 1;

    milestone.estimatedWeeks = Math.min(
      calculatedWeeks,
      Math.max(1, remainingWeeks - weeksLeftAfterThis)
    );

    remainingWeeks -= milestone.estimatedWeeks;
  });


  // ------------------------------------------
  // Add skill learning paths
  // ------------------------------------------

  milestones.forEach((milestone) => {
    milestone.skillPaths = {};

    milestone.skills.forEach((skill) => {
      milestone.skillPaths[skill] = createSkillPath(
        skill,
        dreamJob,
        milestone.project,
        milestone.proof
      );
    });
  });


  // ------------------------------------------
  // Existing skills customization
  // ------------------------------------------

  const existingSkills = String(knownSkills || "")
    .split(",")
    .map((skill) => skill.trim().toLowerCase());

  if (
    existingSkills.includes("html") &&
    existingSkills.includes("css")
  ) {
    milestones[2].description =
      "You already know HTML and CSS, so this stage focuses on JavaScript, React and API integration.";

    milestones[2].skills = ["JavaScript", "React", "APIs"];

    milestones[2].skillPaths = {};

    milestones[2].skills.forEach((skill) => {
      milestones[2].skillPaths[skill] = createSkillPath(
        skill,
        dreamJob,
        milestones[2].project,
        milestones[2].proof
      );
    });
  }


  return {
    careerTitle: dreamJob,

    summary: `A ${targetTimeline} roadmap personalized for a ${currentLevel} learner studying approximately ${hoursPerWeek} hours per week.`,

    targetTimeline,

    totalWeeks: timelineWeeks,

    milestones,

    source: "fallback",
  };
}


// ==========================================
// HEALTH CHECK
// ==========================================

app.get("/", (req, res) => {
  res.send(
    "CareerForge AI backend running on http://localhost:5000"
  );
});


// ==========================================
// GENERATE ROADMAP
// ==========================================

app.post("/api/generate-roadmap", async (req, res) => {
  const {
    dreamJob,
    currentLevel,
    hoursPerWeek,
    knownSkills,
    targetTimeline,
  } = req.body;


  if (!dreamJob || !dreamJob.trim()) {
    return res.status(400).json({
      error: "Dream job is required.",
    });
  }


  const timeline = targetTimeline || "3 months";

  const timelineWeeks = timelineToWeeks(timeline);


  // ========================================
  // GEMINI PROMPT
  // ========================================

  const prompt = `
You are CareerForge AI, an expert career roadmap planner.

Create a highly personalized and realistic roadmap.

USER INFORMATION:

Target Career:
${dreamJob.trim()}

Current Level:
${currentLevel || "Beginner"}

Available Hours Per Week:
${hoursPerWeek || "10"}

Existing Skills:
${knownSkills || "None"}

TARGET TIMELINE:
${timeline}

TARGET TIMELINE IN WEEKS:
${timelineWeeks}


VERY IMPORTANT TIMELINE RULE:

The complete roadmap MUST fit inside the user's target timeline.

The total estimatedWeeks of all milestones should equal approximately ${timelineWeeks} weeks.

If the timeline is short:
- Prioritize essential skills.
- Reduce unnecessary learning.
- Focus on high-impact projects.

If the timeline is long:
- Add deeper practice.
- Add advanced concepts.
- Add stronger portfolio projects.
- Add interview preparation.


ROADMAP REQUIREMENTS:

1. Generate 6 to 8 milestones.

2. Make every milestone specific to the target career.

3. Use the user's current level.

4. Use the user's existing skills.

5. Do not waste time teaching skills the user already knows.

6. Include realistic technical skills.

7. Include concrete projects.

8. Include proof-of-skill activities.

9. Include job/interview preparation.

10. Every milestone must have estimatedWeeks.

11. Every skill must have its own personalized learning path.


SKILL LEARNING PATH:

For EVERY skill create:

Learn
Practice
Build
Prove

These must be specific to the actual skill.

Do NOT repeat generic text for every skill.


RETURN ONLY VALID JSON.

Use exactly this structure:

{
  "careerTitle": "string",
  "summary": "string",
  "targetTimeline": "${timeline}",
  "totalWeeks": ${timelineWeeks},
  "milestones": [
    {
      "id": "m1",
      "title": "string",
      "shortTitle": "string",
      "description": "string",
      "skills": [
        "string",
        "string"
      ],
      "skillPaths": {
        "Skill Name": {
          "learn": "specific learning action",
          "practice": "specific practice action",
          "build": "specific project action",
          "prove": "specific proof action"
        }
      },
      "action": "string",
      "project": "string",
      "proof": "string",
      "estimatedWeeks": 2,
      "priority": "High"
    }
  ]
}
`;


  try {

    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is missing.");
    }


    const response = await ai.models.generateContent({

      model: "gemini-3.5-flash-lite",

      contents: prompt,

      config: {
        responseMimeType: "application/json",
      },

    });


    const roadmap = JSON.parse(response.text);


    if (
      !roadmap.milestones ||
      !Array.isArray(roadmap.milestones) ||
      roadmap.milestones.length === 0
    ) {
      throw new Error("Invalid roadmap received from Gemini.");
    }


    res.json({
      ...roadmap,

      targetTimeline: timeline,

      totalWeeks: timelineWeeks,

      source: "gemini",
    });


  } catch (error) {

    console.error("GEMINI ERROR:", error);

    console.log("Using CareerForge fallback roadmap...");


    const fallback = createFallbackRoadmap({

      dreamJob: dreamJob.trim(),

      currentLevel,

      hoursPerWeek,

      knownSkills,

      targetTimeline: timeline,

    });


    res.json(fallback);
  }
});


// ==========================================
// START SERVER
// ==========================================

app.listen(PORT, () => {

  console.log(
    `CareerForge AI backend running on http://localhost:${PORT}`
  );

});
