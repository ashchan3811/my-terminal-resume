import { useState, useEffect, useRef, FormEvent, KeyboardEvent } from "react";
import { motion } from "motion/react";
import { Terminal as TerminalIcon, Sparkles, Folder, FileText, CheckCircle2 } from "lucide-react";
import { THEMES, Theme, HistoryItem, FileSystemNode } from "../types";
import resumeData from "../data/resume.json";
import MatrixBackground from "./MatrixBackground";

// Staggered boot sequence lines
const BOOT_LINES = [
  "Initializing Ashwani's Portfolio Shell [v2.1.0]...",
  "Loading microkernel modules [OK]",
  "Establishing secure sandbox VFS...",
  "Loading Projects [motomate, risk-system, telegram-bot, pricing, law-practice, engagement-review] [OK]",
  "Loading Resume & Credentials for Ashwani Kumar... [OK]",
  "Connecting virtual telemetry bridge to ashwani.dev...",
  "Access granted. Secure terminal ready."
];

export default function Terminal() {
  const [theme, setTheme] = useState<Theme>(THEMES.geometric);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [commandValue, setCommandValue] = useState("");
  const [currentDir, setCurrentDir] = useState("/");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyPointer, setHistoryPointer] = useState<number>(-1);
  const [isBooting, setIsBooting] = useState(true);
  const [bootIndex, setBootIndex] = useState(0);
  const [matrixActive, setMatrixActive] = useState(false);
  const [crtActive, setCrtActive] = useState(true);
  const [aiHistory, setAiHistory] = useState<Array<{ role: string; content: string }>>([]);
  const [isExecuting, setIsExecuting] = useState(false);

  const [cpu, setCpu] = useState(12);
  const [mem, setMem] = useState(4.2);
  const [uptime, setUptime] = useState("00:00:00");
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    const metricsInterval = setInterval(() => {
      setCpu((prev) => {
        const change = Math.floor(Math.random() * 5) - 2;
        return Math.max(5, Math.min(95, prev + change));
      });
      setMem((prev) => {
        const change = (Math.random() * 0.2) - 0.1;
        const next = parseFloat((prev + change).toFixed(1));
        return Math.max(2.1, Math.min(15.8, next));
      });
    }, 3000);

    const uptimeInterval = setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const hrs = Math.floor(elapsedSeconds / 3600).toString().padStart(2, "0");
      const mins = Math.floor((elapsedSeconds % 3600) / 60).toString().padStart(2, "0");
      const secs = (elapsedSeconds % 60).toString().padStart(2, "0");
      setUptime(`${hrs}:${mins}:${secs}`);
    }, 1000);

    return () => {
      clearInterval(metricsInterval);
      clearInterval(uptimeInterval);
    };
  }, []);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("terminal_portfolio_theme");
    if (savedTheme && THEMES[savedTheme]) {
      setTheme(THEMES[savedTheme]);
    }
  }, []);

  // Sync window toggles with local React state for commands that change options
  useEffect(() => {
    (window as any).toggleMatrix = () => {
      setMatrixActive((prev) => {
        const next = !prev;
        printSystemMessage(next ? "Matrix background: ON" : "Matrix background: OFF");
        return next;
      });
    };
  }, []);

  // Sequential boot loader
  useEffect(() => {
    if (!isBooting) return;

    if (bootIndex < BOOT_LINES.length) {
      const delay = bootIndex === 0 ? 300 : Math.random() * 250 + 100;
      const timer = setTimeout(() => {
        setBootIndex((prev) => prev + 1);
      }, delay);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setIsBooting(false);
        // Print welcome sequence
        printWelcome();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [bootIndex, isBooting]);

  // Scroll to bottom whenever history increases
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [history, bootIndex]);

  // Build the VFS dynamically from resumeData
  const vfs: Record<string, any> = {
    "/": {
      "about.txt": `=============================================================================
                          ABOUT ME: ASHWANI KUMAR
=============================================================================
Personal Intro:
  I am a senior systems engineer with over a decade of experience crafting
  resilient web architectures, highly-scalable backend microservices, and
  slick, responsive user interfaces. I love debugging performance bottlenecks,
  tuning database indexes, and designing robust event-driven systems.

Key Specializations & Expertise:
  ✦ Backend Architecture : Node.js (Express, NestJS), Python, Go, REST, GraphQL
  ✦ Frontend Engineering : React, Next.js, Angular, Tailwind CSS, State Management
  ✦ Scalability & Storage: PostgreSQL, Redis (Streams/Caching), MongoDB, Kafka
  ✦ Cloud & Automation   : AWS (ECS, Lambda, SES), Docker, CI/CD, Kubernetes

Career Aspirations & Interests:
  I aim to partner with high-velocity engineering teams to build next-generation
  SaaS products, with a heavy emphasis on zero-downtime deployments, real-time
  synchronization channels, and conversational AI model integrations (like Gemini).
  Outside of active coding, I enjoy deep-diving into spatial databases (H3/geohash),
  writing technical articles, and enjoying a hot cup of oat-milk coffee.

-----------------------------------------------------------------------------
Type "whoareyou" for a detailed developer profile or "skills" for visual metrics.
`,
      "resume.txt": `=========================================================
                      ASHWANI KUMAR
               Senior Full Stack Engineer
=========================================================
Location: ${resumeData.personal.location}
Email:    ${resumeData.personal.email}
GitHub:   ${resumeData.personal.github}
LinkedIn: ${resumeData.personal.linkedin}
Website:  ${resumeData.personal.website}

--- PROFILE SUMMARY ---
${resumeData.personal.bio}

--- PROFESSIONAL EXPERIENCE ---
${resumeData.experience.map(exp => `
* ${exp.role} | ${exp.company} (${exp.period})
${exp.highlights.map(h => `  - ${h}`).join("\n")}`).join("\n")}

--- TECHNICAL SKILLS ---
${Object.entries(resumeData.skills).map(([category, list]) => `
[${category}]
${list.map(s => ` - ${s.name}: ${s.level}%`).join("\n")}`).join("\n")}
`,
      "contact.txt": `Contact details for Ashwani Kumar:
---------------------------------------------------------
Email:     ${resumeData.personal.email}
LinkedIn:  ${resumeData.personal.linkedin}
GitHub:    ${resumeData.personal.github}
Portfolio: ${resumeData.personal.website}

Type "hireme" for custom booking details and downloadable materials!
`,
      "skills.txt": `Technical Proficiencies & Competency Index:
---------------------------------------------------------
${Object.entries(resumeData.skills).map(([category, list]) => `
[${category}]
${list.map(s => {
  const barsCount = Math.round(s.level / 10);
  const bars = "█".repeat(barsCount) + "░".repeat(10 - barsCount);
  return `  ${s.name.padEnd(26)} ${bars} ${s.level}%`;
}).join("\n")}`).join("\n")}
`,
      "projects": {},
      "blog": {}
    }
  };

  // Hydrate projects directory
  resumeData.projects.forEach((p) => {
    vfs["/"]["projects"][`${p.id}.txt`] = `=========================================================
PROJECT: ${p.name.toUpperCase()}
=========================================================
Description:  ${p.description}
Architecture: ${p.architecture}
Technologies: ${p.technologies.join(", ")}

[Challenges Faced]
${p.challenges}

[Key Learnings]
${p.learnings}
`;
  });

  // Hydrate blog directory
  resumeData.articles.forEach((a) => {
    vfs["/"]["blog"][`${a.slug}.txt`] = `=========================================================
ARTICLE: ${a.title}
Published: ${a.date}
=========================================================
${a.content}
`;
  });

  // Print text dynamically to prompt history
  const printSystemMessage = (text: string) => {
    setHistory((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        command: "sys",
        output: text,
        timestamp: new Date(),
        dir: currentDir
      }
    ]);
  };

  const printWelcome = () => {
    setHistory([
      {
        id: "welcome-main",
        command: "welcome",
        output: `
  _    _  _   _  _  _   _   _   _   _  _    _  _  _  _    _ 
 / \\  / \\/ \\_/ \\/ \\/ \\ / \\ / \\ / \\ / \\/ \\  / \\/ \\/ \\/ \\  / \\
( A )( s )( h )( w )( a )( n )( i )( ' )( s )  ( S )( h )( e )( l )( l )
 \\_/  \\_/\\_/ \\_/\\_/\\_/ \\_/ \\_/ \\_/ \\_/\\_/  \\_/\\_/\\_/\\_/  \\_/

Welcome, traveler, to Ashwani Kumar's Sandbox Shell! (v2.1.0)
This terminal interacts with a sandboxed file system of Ashwani's professional career.

* Type "help" to list all available commands.
* Type "about", "resume", or "projects" to quickly fetch portfolio topics.
* Type "ai <query>" to talk with my smart resume assistant copilot.

-----------------------------------------------------------------------------
`,
        timestamp: new Date(),
        dir: "/"
      }
    ]);
  };

  const skipBoot = () => {
    setIsBooting(false);
    printWelcome();
  };

  // Keyboard Navigation: Command history and autocomplete
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // Ctrl + L: Clear terminal
    if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      setHistory([]);
      return;
    }

    // Arrow Up: Previous command
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length === 0) return;
      const nextIdx = historyPointer + 1;
      if (nextIdx < commandHistory.length) {
        setHistoryPointer(nextIdx);
        setCommandValue(commandHistory[commandHistory.length - 1 - nextIdx]);
      }
    }

    // Arrow Down: Next command
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const nextIdx = historyPointer - 1;
      if (nextIdx >= 0) {
        setHistoryPointer(nextIdx);
        setCommandValue(commandHistory[commandHistory.length - 1 - nextIdx]);
      } else {
        setHistoryPointer(-1);
        setCommandValue("");
      }
    }

    // Tab autocomplete
    if (e.key === "Tab") {
      e.preventDefault();
      handleAutocomplete();
    }
  };

  // Autocomplete logic
  const handleAutocomplete = () => {
    const val = commandValue.trim().toLowerCase();
    if (!val) return;

    const parts = val.split(" ");
    const cmd = parts[0];

    // Simple single-level commands autocomplete
    const commandsList = [
      "help", "about", "whoareyou", "resume", "projects", "project", "experience",
      "skills", "stack", "opensource", "blog", "articles", "contact", "hireme",
      "github", "linkedin", "website", "theme", "matrix", "clear", "history",
      "pwd", "ls", "cd", "cat", "echo", "date", "time", "weather", "sudo",
      "coffee", "joke", "exit", "ai", "search"
    ];

    if (parts.length === 1) {
      const matches = commandsList.filter((c) => c.startsWith(cmd));
      if (matches.length === 1) {
        setCommandValue(matches[0]);
      } else if (matches.length > 1) {
        printSystemMessage(`Possible commands: ${matches.join(", ")}`);
      }
    } else if (parts.length === 2) {
      const arg = parts[1];
      // Cat autocomplete (match files in current directory)
      if (cmd === "cat") {
        const files = getFilesForDir();
        const matches = files.filter((f) => f.toLowerCase().startsWith(arg));
        if (matches.length === 1) {
          setCommandValue(`cat ${matches[0]}`);
        } else if (matches.length > 1) {
          printSystemMessage(`Possible files: ${matches.join(", ")}`);
        }
      }
      // Cd autocomplete (match subdirectories)
      else if (cmd === "cd") {
        const dirs = getSubdirsForDir();
        const matches = dirs.filter((d) => d.toLowerCase().startsWith(arg));
        if (matches.length === 1) {
          setCommandValue(`cd ${matches[0]}`);
        } else if (matches.length > 1) {
          printSystemMessage(`Possible directories: ${matches.join(", ")}`);
        }
      }
      // Theme autocomplete
      else if (cmd === "theme") {
        const matches = Object.keys(THEMES).filter((t) => t.startsWith(arg));
        if (matches.length === 1) {
          setCommandValue(`theme ${matches[0]}`);
        } else if (matches.length > 1) {
          printSystemMessage(`Possible themes: ${matches.join(", ")}`);
        }
      }
      // Project autocomplete
      else if (cmd === "project") {
        const matches = resumeData.projects.map(p => p.id).filter((pId) => pId.startsWith(arg));
        if (matches.length === 1) {
          setCommandValue(`project ${matches[0]}`);
        } else if (matches.length > 1) {
          printSystemMessage(`Possible projects: ${matches.join(", ")}`);
        }
      }
    }
  };

  const getFilesForDir = (): string[] => {
    if (currentDir === "/") {
      return Object.keys(vfs["/"]).filter(k => typeof vfs["/"][k] === "string");
    } else if (currentDir === "/projects") {
      return Object.keys(vfs["/"]["projects"]);
    } else if (currentDir === "/blog") {
      return Object.keys(vfs["/"]["blog"]);
    }
    return [];
  };

  const getSubdirsForDir = (): string[] => {
    if (currentDir === "/") {
      return ["projects", "blog"];
    }
    return [".."];
  };

  // Submit terminal command
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const rawVal = commandValue;
    const trimmed = rawVal.trim();
    setCommandValue("");
    setHistoryPointer(-1);

    if (!trimmed) return;

    // Add to local history list
    setCommandHistory((prev) => [...prev, trimmed]);

    const parts = trimmed.split(" ");
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    setIsExecuting(true);
    let output = "";

    try {
      switch (cmd) {
        case "help":
          output = `Available Commands:
-----------------------------------------------------------------------------
about                 - Displays a short summary of Ashwani's background.
whoareyou             - Detailed background with full skills list.
resume [download]     - Renders formatted resume. Run 'resume download' for PDF link.
projects              - Lists all development projects.
project <name>        - Deep dive info on a specific project (e.g., 'project motomate').
experience            - Shows Ashwani's technical engineering timeline.
skills                - Displays interactive competency progress bars.
blog                  - Lists technical blog articles.
article <slug>        - Renders full blog article (e.g., 'article redis-event-bus').
contact               - Displays email, LinkedIn, and social references.
hireme                - Displays contract info & credentials download.
github                - Opens Ashwani's GitHub.
linkedin              - Opens Ashwani's LinkedIn.
website               - Opens portfolio link.
theme <theme-name>    - Sets terminal theme (hacker, dracula, matrix, ubuntu, nord, light).
matrix                - Toggles dynamic digital raining background.
crt                   - Toggles cathode ray monitor scanline flickers.
clear                 - Clears the terminal terminal screen logs.
history               - Lists terminal session input histories.
pwd                   - Prints current working directory.
ls                    - Lists directory files and folders.
cd <dir>              - Navigates through sandboxed directories ('cd projects', 'cd blog', 'cd ..').
cat <file>            - Outputs text of any sandboxed file (e.g., 'cat about.txt').
echo <text>           - Echoes back parameters.
date / time           - Outputs current timestamp parameters.
weather [city]        - Fetches weather conditions. Try 'weather tokyo' or 'weather london'.
joke                  - Retrieves a random programming humor anecdote.
sudo [action]         - Grants superuser sandbox accesses. (Try 'sudo hire ashwani').
coffee                - Synthesizes a virtual cup of fresh coffee.
search <query>        - Queries skills, experiences, and projects for matches.
exit                  - Closes session back to standard welcome screen.
ai <question>         - Ask anything to Ashwani's conversational Gemini AI Copilot!
-----------------------------------------------------------------------------`;
          break;

        case "clear":
          setHistory([]);
          setIsExecuting(false);
          return;

        case "about":
          output = `=============================================================================
                          ABOUT ME: ASHWANI KUMAR
=============================================================================
Personal Intro:
  I am a senior systems engineer with over a decade of experience crafting
  resilient web architectures, highly-scalable backend microservices, and
  slick, responsive user interfaces. I love debugging performance bottlenecks,
  tuning database indexes, and designing robust event-driven systems.

Key Specializations & Expertise:
  ✦ Backend Architecture : Node.js (Express, NestJS), Python, Go, REST, GraphQL
  ✦ Frontend Engineering : React, Next.js, Angular, Tailwind CSS, State Management
  ✦ Scalability & Storage: PostgreSQL, Redis (Streams/Caching), MongoDB, Kafka
  ✦ Cloud & Automation   : AWS (ECS, Lambda, SES), Docker, CI/CD, Kubernetes

Career Aspirations & Interests:
  I aim to partner with high-velocity engineering teams to build next-generation
  SaaS products, with a heavy emphasis on zero-downtime deployments, real-time
  synchronization channels, and conversational AI model integrations (like Gemini).
  Outside of active coding, I enjoy deep-diving into spatial databases (H3/geohash),
  writing technical articles, and enjoying a hot cup of oat-milk coffee.

-----------------------------------------------------------------------------
Type "whoareyou" for a detailed developer profile or "skills" for visual metrics.
`;
          break;

        case "whoareyou":
          output = `
=========================================================
          ENGINEER PROFILE OVERVIEW: ASHWANI KUMAR
=========================================================
Specialization:   High-Performance Scalable Backend Microservices & Modern Frontends
Current Practice: Senior Full Stack Architect & Freelance Consultant
Experience Level: 10+ Years of Professional Enterprise Systems Engineering

Principal Tech Stack:
- Core Languages: TypeScript, JavaScript, Go, Python, SQL
- Frontend Ecosystem: React, Next.js, Angular, Zustand, Redux, Tailwind CSS
- Server Frameworks: Node.js, NestJS, Express.js, FastAPI, Django
- Infrastructure & Storage: AWS, Docker, Kubernetes, PostgreSQL, Redis, MongoDB, Kafka

Core Philosophy:
  "I build high-availability software architectures with simple, maintainable code structures.
   I believe optimal system performance is forged in fine-tuned DB layouts and secure caching gates."
`;
          break;

        case "resume":
          if (args[0] === "download") {
            output = `Preparing package download...
[====================] 100% Complete!

Direct Link: Click or Open to download:
${resumeData.personal.website}/ashwani_resume.pdf

(Redirecting to resume URL in a new tab shortly...)`;
            setTimeout(() => {
              window.open(resumeData.personal.website, "_blank");
            }, 1500);
          } else {
            output = vfs["/"]["resume.txt"];
          }
          break;

        case "skills":
        case "stack":
          output = vfs["/"]["skills.txt"];
          break;

        case "experience":
          output = `=========================================================
                 CAREER ENGINEERING TIMELINE
=========================================================
${resumeData.experience.map(exp => `
[${exp.period}]
Role:        ${exp.role}
Enterprise:  ${exp.company}
Achievements:
${exp.highlights.map(h => `  - ${h}`).join("\n")}
---------------------------------------------------------`).join("\n")}`;
          break;

        case "projects":
          output = `Available Sandboxed Project Specs:
---------------------------------------------------------
${resumeData.projects.map(p => `
* ${p.id.padEnd(20)} - ${p.description}
  (Type "project ${p.id}" for full technical breakdown)`).join("\n")}
`;
          break;

        case "project":
          if (!args[0]) {
            output = "Usage: project <project-name>\nExample: project motomate\n\nType 'projects' to list all project names.";
          } else {
            const projId = args[0].toLowerCase();
            const projFile = `${projId}.txt`;
            if (vfs["/"]["projects"][projFile]) {
              output = vfs["/"]["projects"][projFile];
            } else {
              output = `Error: Project specs for '${projId}' not found. Type 'projects' to view available list.`;
            }
          }
          break;

        case "blog":
        case "articles":
          output = `Ashwani Kumar's Engineering Notebook (Technical Articles):
-----------------------------------------------------------------------------
${resumeData.articles.map(art => `
* ${art.slug.padEnd(25)} - ${art.title} (${art.date})
  (Type "article ${art.slug}" to render inline)`).join("\n")}
`;
          break;

        case "article":
          if (!args[0]) {
            output = "Usage: article <slug>\nExample: article redis-event-bus\n\nType 'blog' to list all technical articles.";
          } else {
            const slug = args[0].toLowerCase();
            const artFile = `${slug}.txt`;
            if (vfs["/"]["blog"][artFile]) {
              output = vfs["/"]["blog"][artFile];
            } else {
              output = `Error: Article '${slug}' not found. Type 'blog' to list all available technical write-ups.`;
            }
          }
          break;

        case "contact":
          output = vfs["/"]["contact.txt"];
          break;

        case "hire":
        case "hireme":
          output = `=========================================================
                BOOKING PORTAL & AVAILABILITY
=========================================================
Ashwani is currently open to Senior-level Full-Stack consulting contracts,
architecture vetting, and permanent remote roles.

Hiring Actions:
1. Schedule direct sync:  Email ashwanikumar3811@gmail.com
2. Explore GitHub code:   Type "github"
3. Connect on LinkedIn:   Type "linkedin"
4. Download Resume PDF:   Type "resume download"

Availability: Remote Worldwide (GMT+5:30)
Contract terms: Hourly or Retainer structured.
`;
          break;

        case "github":
          output = `Opening GitHub repository in a new window... (${resumeData.personal.github})`;
          setTimeout(() => {
            window.open(resumeData.personal.github, "_blank");
          }, 1000);
          break;

        case "linkedin":
          output = `Opening LinkedIn connection hub... (${resumeData.personal.linkedin})`;
          setTimeout(() => {
            window.open(resumeData.personal.linkedin, "_blank");
          }, 1000);
          break;

        case "website":
          output = `Opening production portfolio website... (${resumeData.personal.website})`;
          setTimeout(() => {
            window.open(resumeData.personal.website, "_blank");
          }, 1000);
          break;

        case "theme":
          if (!args[0]) {
            output = `Usage: theme <theme-name>\nAvailable Themes: ${Object.keys(THEMES).join(", ")}\n\nCurrent Theme: ${theme.name}`;
          } else {
            const targetTheme = args[0].toLowerCase();
            if (THEMES[targetTheme]) {
              setTheme(THEMES[targetTheme]);
              localStorage.setItem("terminal_portfolio_theme", targetTheme);
              output = `Theme successfully updated to '${targetTheme}'!`;
            } else {
              output = `Error: Theme '${targetTheme}' does not exist. Available themes: ${Object.keys(THEMES).join(", ")}`;
            }
          }
          break;

        case "matrix":
          setMatrixActive((prev) => !prev);
          output = `Toggled Matrix falling code background: ${!matrixActive ? "ENABLED" : "DISABLED"}`;
          break;

        case "crt":
          if ((window as any).toggleCRT) {
            const res = (window as any).toggleCRT();
            setCrtActive(res);
            output = `Cathode Ray Tube scanner effect: ${res ? "ENABLED" : "DISABLED"}`;
          } else {
            output = "CRT handler is offline.";
          }
          break;

        case "pwd":
          output = currentDir;
          break;

        case "dir":
        case "ls":
          if (currentDir === "/") {
            output = `Mode          Name
------------------------
drwxr-xr-x    projects/
drwxr-xr-x    blog/
-rw-r--r--    about.txt
-rw-r--r--    resume.txt
-rw-r--r--    contact.txt
-rw-r--r--    skills.txt`;
          } else if (currentDir === "/projects") {
            output = `Mode          Name
------------------------
${Object.keys(vfs["/"]["projects"]).map(f => `-rw-r--r--    ${f}`).join("\n")}`;
          } else if (currentDir === "/blog") {
            output = `Mode          Name
------------------------
${Object.keys(vfs["/"]["blog"]).map(f => `-rw-r--r--    ${f}`).join("\n")}`;
          }
          break;

        case "cd":
          if (!args[0]) {
            setCurrentDir("/");
            output = "Returned to root directory: /";
          } else {
            const target = args[0].toLowerCase();
            if (target === "..") {
              setCurrentDir("/");
              output = "Directory changed: /";
            } else if (target === "projects" && currentDir === "/") {
              setCurrentDir("/projects");
              output = "Directory changed: /projects";
            } else if (target === "blog" && currentDir === "/") {
              setCurrentDir("/blog");
              output = "Directory changed: /blog";
            } else {
              output = `cd: no such file or directory: ${target}`;
            }
          }
          break;

        case "cat":
          if (!args[0]) {
            output = "Usage: cat <filename>\nExample: cat about.txt";
          } else {
            const file = args[0].toLowerCase();
            if (currentDir === "/") {
              if (vfs["/"][file] && typeof vfs["/"][file] === "string") {
                output = vfs["/"][file];
              } else {
                output = `cat: ${file}: No such file or directory`;
              }
            } else if (currentDir === "/projects") {
              const fullFile = file.endsWith(".txt") ? file : `${file}.txt`;
              if (vfs["/"]["projects"][fullFile]) {
                output = vfs["/"]["projects"][fullFile];
              } else {
                output = `cat: ${file}: Spec file not found inside /projects.`;
              }
            } else if (currentDir === "/blog") {
              const fullFile = file.endsWith(".txt") ? file : `${file}.txt`;
              if (vfs["/"]["blog"][fullFile]) {
                output = vfs["/"]["blog"][fullFile];
              } else {
                output = `cat: ${file}: Article spec not found inside /blog.`;
              }
            }
          }
          break;

        case "echo":
          output = args.join(" ");
          break;

        case "date":
        case "time":
          output = new Date().toLocaleString();
          break;

        case "joke":
          try {
            const res = await fetch("/api/joke");
            const data = await res.json();
            output = `[Humor Daemon Node]\n"${data.joke}"`;
          } catch {
            output = "Failed to communicate with humor APIs. Please verify developer routes.";
          }
          break;

        case "weather":
          try {
            const city = args[0] || "san_francisco";
            const res = await fetch(`/api/weather?city=${city}`);
            const data = await res.json();
            output = `[Telemetry Station: ${data.city.toUpperCase()}]
---------------------------------------------------------
Condition:   ${data.condition}
Temperature: ${data.temp}
Humidity:    ${data.humidity}
Wind Vector: ${data.wind}`;
          } catch {
            output = "Failed to communicate with weather stations.";
          }
          break;

        case "sudo":
          if (args[0] === "hire" && args[1] === "ashwani") {
            output = `[SUDO INITIALIZATION]
Password for guest: *******

Access Granted.
Unlocking full priority dispatch protocols...
Initializing resume delivery in new tab...

Type "contact" or "hireme" to finalize contract terms!`;
            setTimeout(() => {
              window.open(resumeData.personal.website, "_blank");
            }, 1000);
          } else {
            output = `[SUDO WARNING]
Guest shell permissions: DENIED.
This incident has been logged to /dev/null.`;
          }
          break;

        case "coffee":
          output = `Brewing rich developer stimulant...
[▓░░░░░░░░░] 10% - Boiling water
[▓▓▓░░░░░░░] 30% - Grinding dark beans
[▓▓▓▓▓▓░░░░] 60% - Extracting espresso core
[▓▓▓▓▓▓▓▓▓░] 90% - Frothing oat milk
[▓▓▓▓▓▓▓▓▓▓] 100% - Poured.

Enjoy your virtual hot coffee ☕! Keep on hacking.`;
          break;

        case "search":
          if (!args[0]) {
            output = "Usage: search <query>\nExample: search redis";
          } else {
            const query = args.join(" ").toLowerCase();
            const results: string[] = [];

            // Search projects
            resumeData.projects.forEach(p => {
              if (p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query) || p.technologies.some(t => t.toLowerCase().includes(query))) {
                results.push(`Project: ${p.name} -> Type 'project ${p.id}'`);
              }
            });

            // Search articles
            resumeData.articles.forEach(a => {
              if (a.title.toLowerCase().includes(query) || a.summary.toLowerCase().includes(query)) {
                results.push(`Blog Post: ${a.title} -> Type 'article ${a.slug}'`);
              }
            });

            // Search skills
            Object.entries(resumeData.skills).forEach(([cat, list]) => {
              list.forEach(s => {
                if (s.name.toLowerCase().includes(query)) {
                  results.push(`Skill: ${s.name} (${cat}) - Level: ${s.level}%`);
                }
              });
            });

            if (results.length > 0) {
              output = `Search results for '${query}':\n---------------------------------------------------------\n` + results.join("\n");
            } else {
              output = `No results found in portfolio VFS for query '${query}'. Try 'skills' or 'projects' to browse directly.`;
            }
          }
          break;

        case "ai":
          if (!args[0]) {
            output = "Usage: ai <your question>\nExample: ai What is Ashwani's experience with Angular?";
          } else {
            const aiPrompt = args.join(" ");
            output = "AI Copilot: Connecting to Gemini Engine...\n";
            setHistory((prev) => [
              ...prev,
              {
                id: Math.random().toString(),
                command: trimmed,
                output,
                timestamp: new Date(),
                dir: currentDir
              }
            ]);

            try {
              const response = await fetch("/api/ai", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({ prompt: aiPrompt, history: aiHistory })
              });
              const data = await response.json();

              // Update AI conversational states
              setAiHistory((prev) => [
                ...prev,
                { role: "user", content: aiPrompt },
                { role: "model", content: data.response || data.error }
              ]);

              // Update the latest item with real response
              setHistory((prev) => {
                const updated = [...prev];
                if (updated.length > 0) {
                  updated[updated.length - 1].output = data.response || "AI returned an empty response.";
                }
                return updated;
              });
              setIsExecuting(false);
              return;
            } catch (err: any) {
              output = "AI Copilot Error: Failed to contact central proxy node. Verify secrets config.";
            }
          }
          break;

        case "exit":
          output = "Resetting shell. Clearing local session buffer...";
          setHistory([]);
          setCommandHistory([]);
          setTimeout(() => {
            printWelcome();
          }, 500);
          break;

        default:
          output = `Command not found: '${cmd}'. Type "help" to view list of available directives.`;
          break;
      }
    } catch (err: any) {
      output = `Shell runtime error: ${err.message}`;
    }

    setHistory((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        command: trimmed,
        output,
        timestamp: new Date(),
        dir: currentDir
      }
    ]);
    setIsExecuting(false);
  };

  // Click anywhere on terminal to focus command input
  const handleTerminalClick = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div
      onClick={handleTerminalClick}
      className={`min-h-screen font-mono text-xs sm:text-sm ${theme.bg} ${theme.fg} transition-colors duration-500 flex flex-col selection:bg-slate-700 selection:text-white relative overflow-hidden h-screen`}
    >
      <MatrixBackground active={matrixActive} />

      {/* Geometric Balance Outer Frame & Layout container */}
      <div className="flex-1 flex flex-col border-[12px] border-[#1A1F29] overflow-hidden relative">
        
        {/* Terminal Header Bar */}
        <div className="h-8 bg-[#1A1F29] flex items-center px-4 justify-between border-b border-[#0A0E14] select-none shrink-0 z-10">
          <div className="flex gap-2">
            <span className="w-3 h-3 rounded-full bg-[#FF5F56]" />
            <span className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
            <span className="w-3 h-3 rounded-full bg-[#27C93F]" />
          </div>
          <div className="text-xs text-[#707A8C] font-semibold tracking-wider">
            ashwani_kumar — zsh — 1024×768
          </div>
          <div className="w-12 text-right hidden sm:block">
            <span className="text-[10px] text-[#707A8C] font-mono tracking-widest uppercase">G-BAL</span>
          </div>
        </div>

        {/* Dynamic Multi-column Bento Grid Layout */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative z-10">
          
          {/* Left Main Terminal viewport */}
          <main
            ref={containerRef}
            className="flex-1 p-4 md:p-6 overflow-y-auto flex flex-col justify-start gap-2 relative"
          >
            {isBooting ? (
              <div className="space-y-1 text-zinc-300">
                {BOOT_LINES.slice(0, bootIndex).map((line, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-blue-500">❖</span>
                    <span>{line}</span>
                  </div>
                ))}
                <div className="pt-4 flex items-center gap-2">
                  <span className="animate-ping rounded-full h-1.5 w-1.5 bg-green-400" />
                  <button
                    onClick={skipBoot}
                    className="text-[10px] text-[#707A8C] hover:text-white border border-zinc-700 rounded px-1.5 py-0.5"
                  >
                    Press ENTER or Click here to skip boot sequence
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Command logs */}
                {history.map((item) => (
                  <div key={item.id} className="space-y-1">
                    {item.command !== "welcome" && item.command !== "sys" && (
                      <div className="flex items-start gap-1 select-none">
                        <span className="text-[#59C2FF] font-semibold">➜</span>
                        <span className="text-[#73D0FF]">{item.dir !== "/" ? item.dir : "~"}</span>
                        <span className="text-zinc-200">{item.command}</span>
                      </div>
                    )}
                    <div className="whitespace-pre-wrap leading-relaxed opacity-95">
                      {item.output}
                    </div>
                  </div>
                ))}

                {/* Input line */}
                {!isExecuting && (
                  <form onSubmit={handleSubmit} className="flex items-center gap-1 select-none pb-12">
                    <span className="text-[#F29718] font-semibold">➜</span>
                    <span className="text-[#73D0FF] font-semibold">{currentDir !== "/" ? currentDir : "~"}</span>
                    <div className="relative flex-1 flex items-center ml-1">
                      <input
                        ref={inputRef}
                        type="text"
                        value={commandValue}
                        onChange={(e) => setCommandValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="w-full bg-transparent outline-none border-none p-0 focus:ring-0 text-zinc-100"
                        autoFocus
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="none"
                        spellCheck="false"
                      />
                      {commandValue === "" && (
                        <span className={`w-2 h-4 animate-pulse ${theme.caret}`} />
                      )}
                    </div>
                  </form>
                )}

                {isExecuting && (
                  <div className="flex items-center gap-2 opacity-50 select-none pb-12">
                    <span className="animate-spin text-zinc-400">⚡</span>
                    <span>Executing payload query...</span>
                  </div>
                )}
              </div>
            )}
          </main>

          {/* Right Status Panel Sidebar */}
          <aside className="w-full md:w-64 border-t md:border-t-0 md:border-l border-[#1A1F29] p-6 flex flex-col justify-between select-none shrink-0 bg-black/30 backdrop-blur-xs text-[#B3B1AD]">
            <div className="space-y-8">
              {/* System gauges */}
              <div>
                <h3 className="text-xs font-bold text-[#707A8C] uppercase tracking-widest mb-4">System Status</h3>
                <div className="space-y-4 font-mono text-xs">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>CPU</span>
                      <span className="text-[#C2D94C]">{cpu}%</span>
                    </div>
                    <div className="h-1 bg-[#1A1F29] w-full rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#C2D94C] transition-all duration-1000" 
                        style={{ width: `${cpu}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>MEM</span>
                      <span className="text-[#F29718]">{mem}GB / 16GB</span>
                    </div>
                    <div className="h-1 bg-[#1A1F29] w-full rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#F29718] transition-all duration-1000" 
                        style={{ width: `${(mem / 16) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Navigation Directories */}
              <div>
                <h3 className="text-xs font-bold text-[#707A8C] uppercase tracking-widest mb-4">Directories</h3>
                <ul className="text-xs space-y-2.5 font-semibold">
                  <li 
                    onClick={() => setCommandValue("cat about.txt")}
                    className="hover:text-white cursor-pointer flex items-center gap-2 group text-[#59C2FF]"
                  >
                    <span className="text-[#F29718] group-hover:translate-x-1 transition-transform">➜</span>
                    <span>~/about.txt</span>
                  </li>
                  <li 
                    onClick={() => setCommandValue("resume")}
                    className="hover:text-white cursor-pointer flex items-center gap-2 group text-[#59C2FF]"
                  >
                    <span className="text-[#F29718] group-hover:translate-x-1 transition-transform">➜</span>
                    <span>~/resume.txt</span>
                  </li>
                  <li 
                    onClick={() => setCommandValue("projects")}
                    className="hover:text-white cursor-pointer flex items-center gap-2 group text-[#59C2FF]"
                  >
                    <span className="text-[#F29718] group-hover:translate-x-1 transition-transform">➜</span>
                    <span>~/projects/</span>
                  </li>
                  <li 
                    onClick={() => setCommandValue("blog")}
                    className="hover:text-white cursor-pointer flex items-center gap-2 group text-[#59C2FF]"
                  >
                    <span className="text-[#F29718] group-hover:translate-x-1 transition-transform">➜</span>
                    <span>~/blog/</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Static & Ticker Metadata block */}
            <div className="text-[10px] text-[#707A8C] border-t border-[#1A1F29] pt-4 space-y-1">
              <div>UPTIME: {uptime}</div>
              <div>IP: 192.168.1.104</div>
              <div>SHELL: zsh 5.8.1</div>
            </div>
          </aside>
        </div>

        {/* Custom Vim Status Line at the bottom */}
        <div className="h-6 bg-[#F29718] shrink-0 flex items-center px-3 justify-between text-[#0A0E14] text-[10px] font-bold select-none z-10">
          <div className="flex gap-4">
            <div className="flex items-center gap-1 uppercase tracking-wide">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-4H9V5h2v4z"/>
              </svg>
              NORMAL
            </div>
            <span>UTF-8</span>
            <span>main*</span>
          </div>
          <div className="flex gap-4">
            <span>LN: {history.length + 1}, COL: {commandValue.length + 1}</span>
            <span>100%</span>
            <span>TOP</span>
          </div>
        </div>
      </div>
    </div>
  );
}
