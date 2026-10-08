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

// --------------------------------------------------
// FALLBACK ROADMAP
// --------------------------------------------------
function createFallbackRoadmap({
  dreamJob,
  currentLevel,
  hoursPerWeek,
  knownSkills,
}) {
  const skills = (knownSkills || "")
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);

  const hasHTML = skills.some(
    (s) => s.toLowerCase() === "html"
  );

  const hasCSS = skills.some(
    (s) => s.toLowerCase() === "css"
  );

  const makeSkillPath = (skill, project, proof) => ({
    learn: `Learn the core concepts of ${skill} that are relevant to becoming a ${dreamJob}.`,
    practice: `Practice ${skill} through focused exercises, coding tasks and small challenges.`,
    build: project || `Build a small practical project using ${skill}.`,
    prove: proof || `Create visible proof of ${skill} through GitHub or a portfolio project.`,
  });

  const milestones = [
    {
      id: "m1",
      title: "Career Skill Gap",
      shortTitle: "Skill Gap",
      description: `Analyze the skills required for ${dreamJob} and compare them with your current ${currentLevel} level.`,
      skills: ["Career requirements", "Skill assessment"],
      skillPaths: {
        "Career requirements": makeSkillPath(
          "Career requirements",
          "Create a target-role requirements checklist.",
          "Completed career requirements checklist."
        ),
        "Skill assessment": makeSkillPath(
          "Skill assessment",
          "Build a personal skill-gap tracker.",
          "Completed skill-gap analysis."
        ),
      },
      action:
        "Create a checklist of the top skills required for your target role and mark your current strengths and gaps.",
      project: "Build a personal skill-gap tracker.",
      proof: "Completed skill-gap checklist and learning plan.",
      estimatedWeeks: 1,
      priority: "High",
    },

    {
      id: "m2",
      title: "Programming Foundations",
      shortTitle: "Foundations",
      description:
        "Strengthen programming fundamentals, problem solving and core computer science concepts.",
      skills: [
        "Programming",
        "Data structures",
        "Problem solving",
      ],
      skillPaths: {
        Programming: makeSkillPath(
          "Programming",
          "Build a command-line utility using your strongest programming language.",
          "GitHub repository containing working code."
        ),
        "Data structures": makeSkillPath(
          "Data structures",
          "Implement arrays, stacks, queues and linked lists.",
          "GitHub repository with implementations and examples."
        ),
        "Problem solving": makeSkillPath(
          "Problem solving",
          "Solve a set of progressively harder programming problems.",
          "Problem-solving repository with documented solutions."
        ),
      },
      action:
        "Practice programming problems regularly and revise the fundamentals required for your target role.",
      project:
        "Build a command-line utility using your strongest programming language.",
      proof:
        "GitHub repository containing working code.",
      estimatedWeeks: 3,
      priority: "High",
    },

    {
      id: "m3",
      title: "Core Technical Skills",
      shortTitle: "Core Skills",
      description: `Develop the practical technologies most commonly used in ${dreamJob} roles.`,
      skills: [
        "Technical tools",
        "Development workflow",
      ],
      skillPaths: {
        "Technical tools": makeSkillPath(
          "Technical tools",
          `Build a small ${dreamJob}-related application using the required tools.`,
          "Working application with README documentation."
        ),
        "Development workflow": makeSkillPath(
          "Development workflow",
          "Practice Git, debugging, testing and project organization.",
          "Well-structured GitHub repository with commits and README."
        ),
      },
      action:
        "Choose 2–3 technologies directly relevant to your target job and build small exercises with them.",
      project:
        "Create a small practical application using the selected technologies.",
      proof:
        "Working application plus GitHub README.",
      estimatedWeeks: 3,
      priority: "High",
    },

    {
      id: "m4",
      title: "Portfolio Project",
      shortTitle: "Project",
      description:
        "Turn your skills into a substantial project that demonstrates real-world problem solving.",
      skills: [
        "Project development",
        "Git",
        "Documentation",
      ],
      skillPaths: {
        "Project development": makeSkillPath(
          "Project development",
          `Build a production-style project related to ${dreamJob}.`,
          "Live project demo and source code."
        ),
        Git: makeSkillPath(
          "Git",
          "Use branches, meaningful commits and version control throughout the project.",
          "Public GitHub repository with clean commit history."
        ),
        Documentation: makeSkillPath(
          "Documentation",
          "Write a clear README containing setup, features and screenshots.",
          "Complete GitHub README with project documentation."
        ),
      },
      action:
        "Build one polished project solving a real problem. Add documentation, screenshots and clear setup instructions.",
      project:
        `Build a production-style project related to ${dreamJob}.`,
      proof:
        "Live demo + GitHub repository + project README.",
      estimatedWeeks: 4,
      priority: "High",
    },

    {
      id: "m5",
      title: "Interview Preparation",
      shortTitle: "Interview",
      description:
        "Prepare for technical and behavioral interviews for your target career.",
      skills: [
        "Interview skills",
        "Communication",
        "Problem solving",
      ],
      skillPaths: {
        "Interview skills": makeSkillPath(
          "Interview skills",
          "Create and practice a role-specific mock interview.",
          "Completed mock interview."
        ),
        Communication: makeSkillPath(
          "Communication",
          "Practice explaining technical concepts and projects clearly.",
          "Recorded project explanation or mock interview."
        ),
        "Problem solving": makeSkillPath(
          "Problem solving",
          "Practice timed technical questions relevant to the role.",
          "Completed interview problem set."
        ),
      },
      action:
        "Practice role-specific interview questions and explain your portfolio project aloud.",
      project:
        "Create a 30-question interview preparation set.",
      proof:
        "Completed mock interview and interview question bank.",
      estimatedWeeks: 2,
      priority: "Medium",
    },

    {
      id: "m6",
      title: "Internship Ready",
      shortTitle: "Internship",
      description:
        "Prepare your profile and start applying for relevant internships.",
      skills: [
        "Resume",
        "GitHub",
        "LinkedIn",
        "Applications",
      ],
      skillPaths: {
        Resume: makeSkillPath(
          "Resume",
          "Create a one-page resume targeted to your desired role.",
          "ATS-friendly resume."
        ),
        GitHub: makeSkillPath(
          "GitHub",
          "Organize your strongest repositories and improve their READMEs.",
          "Clean GitHub profile with pinned projects."
        ),
        LinkedIn: makeSkillPath(
          "LinkedIn",
          "Create a role-focused LinkedIn profile and showcase projects.",
          "Complete professional LinkedIn profile."
        ),
        Applications: makeSkillPath(
          "Applications",
          "Apply consistently to relevant internship opportunities.",
          "Application tracker with submitted applications."
        ),
      },
      action:
        "Polish your resume, GitHub and LinkedIn. Apply consistently to relevant internship openings.",
      project:
        "Create a targeted internship application kit.",
      proof:
        "Resume + GitHub + LinkedIn + application tracker.",
      estimatedWeeks: 2,
      priority: "High",
    },

    {
      id: "m7",
      title: "Career Ready",
      shortTitle: "Job Ready",
      description:
        `Build enough evidence and practical experience to confidently target ${dreamJob} opportunities.`,
      skills: [
        "Portfolio",
        "Interview",
        "Professional skills",
      ],
      skillPaths: {
        Portfolio: makeSkillPath(
          "Portfolio",
          "Create a portfolio containing your strongest 2–3 projects.",
          "Live portfolio website."
        ),
        Interview: makeSkillPath(
          "Interview",
          "Complete multiple mock interviews and improve weak areas.",
          "Interview-ready preparation record."
        ),
        "Professional skills": makeSkillPath(
          "Professional skills",
          "Practice networking, communication and workplace readiness.",
          "Professional profile and networking activity."
        ),
      },
      action:
        "Complete your strongest projects, practice interviews and begin applying for entry-level opportunities.",
      project:
        "Create a final portfolio containing your 2–3 strongest projects.",
      proof:
        "Portfolio website + GitHub + interview-ready resume.",
      estimatedWeeks: 3,
      priority: "High",
    },
  ];

  if (hasHTML && hasCSS) {
    milestones[2].description =
      "You already know HTML and CSS, so use them as a foundation and move toward more advanced development skills.";

    milestones[2].skills = [
      "JavaScript",
      "React",
      "APIs",
    ];

    milestones[2].skillPaths = {
      JavaScript: makeSkillPath(
        "JavaScript",
        "Build an interactive browser application using JavaScript.",
        "GitHub repository with a working JavaScript project."
      ),
      React: makeSkillPath(
        "React",
        "Build a component-based React application.",
        "Deployed React application and GitHub repository."
      ),
      APIs: makeSkillPath(
        "APIs",
        "Build an application that consumes a real API.",
        "Working API-integrated project."
      ),
    };
  }

  return {
    careerTitle: dreamJob,
    summary: `A personalized ${dreamJob} roadmap designed for a ${currentLevel} learner with approximately ${hoursPerWeek} hours per week.`,
    milestones,
    source: "fallback",
  };
};

// --------------------------------------------------
// HOME
// --------------------------------------------------
app.get("/", (req, res) => {
  res.json({
    message: "CareerForge AI backend is running 🚀",
  });
});

// --------------------------------------------------
// AI ROADMAP
// --------------------------------------------------
app.post("/api/generate-roadmap", async (req, res) => {
  try {
    const {
      dreamJob,
      currentLevel,
      hoursPerWeek,
      knownSkills,
    } = req.body;

    if (!dreamJob) {
      return res.status(400).json({
        error: "Dream job is required.",
      });
    }

    const prompt = `
You are CareerForge AI, an expert career roadmap planner.

Create a realistic, highly personalized career roadmap.

TARGET CAREER:
${dreamJob}

CURRENT LEVEL:
${currentLevel || "Beginner"}

HOURS AVAILABLE PER WEEK:
${hoursPerWeek || "10"}

SKILLS ALREADY KNOWN:
${knownSkills || "None"}

Requirements:

- Create 6 to 8 milestones.
- Start from the student's current level.
- Do not unnecessarily repeat skills already known.
- Include realistic technologies and skills.
- Include at least one portfolio project.
- Include internship/job preparation.
- Make the roadmap achievable according to weekly hours.
- Every milestone must contain actionable advice.
- Suggest concrete projects and proof of skill.
- Make the roadmap specific to the target career.

VERY IMPORTANT:

For EVERY skill inside every milestone, generate a personalized
4-step learning path.

The learning path must contain:

1. Learn
2. Practice
3. Build
4. Prove

The steps must be specific to the actual skill and target career.

Do NOT use generic text repeatedly.

For example, if the skill is React for a Full Stack Developer,
the learning path should be specifically about React and Full Stack
development.

If the student already knows a skill, do not make that skill a major
beginner milestone.

Return ONLY valid JSON.

Required JSON structure:

{
  "careerTitle": "string",
  "summary": "string",
  "milestones": [
    {
      "id": "m1",
      "title": "string",
      "shortTitle": "string",
      "description": "string",
      "skills": ["string", "string"],
      "skillPaths": {
        "Skill Name": {
          "learn": "specific learning action",
          "practice": "specific practice action",
          "build": "specific project/build action",
          "prove": "specific proof-of-skill action"
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
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash-lite",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const roadmap = JSON.parse(response.text);

      res.json({
        ...roadmap,
        source: "gemini",
      });
    } catch (aiError) {
      console.error("GEMINI ERROR:", aiError);

      console.log("Using CareerForge fallback roadmap...");

      const fallback = createFallbackRoadmap({
        dreamJob,
        currentLevel,
        hoursPerWeek,
        knownSkills,
      });

      res.json(fallback);
    }
  } catch (error) {
    console.error("Server error:", error);

    res.status(500).json({
      error: "Failed to generate roadmap.",
      details: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(
    `CareerForge AI backend running on http://localhost:${PORT}`
  );
});