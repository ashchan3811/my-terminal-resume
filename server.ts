import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Lazily initialize the Google Gen AI client to prevent crashes if key is initially absent
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
  }
  return aiClient;
}

// Programmer jokes list for the `joke` command
const JOKES = [
  "There are 10 types of people in the world: those who understand binary, and those who don't.",
  "How many programmers does it take to change a light bulb? None, that's a hardware problem.",
  "Why do programmers wear glasses? Because they can't C#.",
  "A SQL query goes into a bar, walks up to two tables and asks, 'Can I join you?'",
  "['hip', 'hip'] (hip hip array!)",
  "Why did the programmer quit his job? Because he didn't get arrays.",
  "What is a programmer's favorite hangout place? Foo Bar.",
  "An optimist says: 'The glass is half-full.' A pessimist says: 'The glass is half-empty.' A programmer says: 'The glass is twice as large as it needs to be.'",
  "Why do Java programmers have to wear glasses? Because they don't C#.",
  "What do you call a programmer from Finland? Nerdic.",
  "How do you comfort a JavaScript bug? You console it."
];

// Mock weather conditions based on cities
const WEATHER_REPORTS: Record<string, { temp: string; humidity: string; wind: string; condition: string }> = {
  san_francisco: { temp: "15°C / 59°F", humidity: "72%", wind: "18 km/h NW", condition: "Foggy & Cool" },
  new_york: { temp: "22°C / 71°F", humidity: "50%", wind: "12 km/h E", condition: "Partly Cloudy" },
  london: { temp: "14°C / 57°F", humidity: "85%", wind: "24 km/h SW", condition: "Light Rain" },
  tokyo: { temp: "26°C / 78°F", humidity: "65%", wind: "8 km/h S", condition: "Clear Sky" },
  bengaluru: { temp: "28°C / 82°F", humidity: "55%", wind: "14 km/h W", condition: "Pleasant & Sunny" },
  default: { temp: "21°C / 70°F", humidity: "60%", wind: "10 km/h", condition: "Mild & Clear" }
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // Dynamic Weather API
  app.get("/api/weather", (req, res) => {
    const city = typeof req.query.city === "string" ? req.query.city.trim().toLowerCase() : "";
    const report = WEATHER_REPORTS[city] || WEATHER_REPORTS.default;
    res.json({
      city: req.query.city || "San Francisco",
      ...report
    });
  });

  // Joke API
  app.get("/api/joke", (req, res) => {
    const randomIdx = Math.floor(Math.random() * JOKES.length);
    res.json({ joke: JOKES[randomIdx] });
  });

  // Server-side Gemini AI Resume Assistant API
  app.post("/api/ai", async (req, res) => {
    const { prompt, history } = req.body;
    if (!prompt) {
       res.status(400).json({ error: "Prompt is required" });
       return;
    }

    try {
      const client = getGeminiClient();
      if (!client) {
         res.json({
          response: "System notice: GEMINI_API_KEY is not configured in environment variables. To chat with Ashwani's AI Copilot, please configure the key under Settings > Secrets. In the meantime, you can continue exploring other shell commands!"
        });
        return;
      }

      // Read resume details dynamically or embed them inside systemInstruction
      const systemInstruction = `You are 'Ashwani's Terminal Copilot' – an interactive AI terminal assistant embedded inside Ashwani Kumar's retro Terminal Portfolio Website.
Your mission is to help visitors (recruiters, engineers, managers) explore Ashwani's background, projects, skills, and resume.

Ashwani's details:
Name: Ashwani Kumar
Title: Senior Full Stack Engineer
Bio: Senior Full Stack Engineer with 10+ years of expertise crafting resilient web architectures, highly-scalable backend microservices, and slick, responsive frontends. Specialized in Node.js, React, Angular, AWS, and distributed database tuning.
Contact:
- Email: ashwanikumar3811@gmail.com
- GitHub: https://github.com/ashwani3811
- LinkedIn: https://linkedin.com/in/ashwani3811
- Website: https://ashwani.dev

Skills:
- Frontend: React / Next.js, Angular, TypeScript, Tailwind CSS, Redux / Zustand
- Backend: Node.js / Express, NestJS, Python (FastAPI / Django), Go, GraphQL / REST APIs
- Databases: PostgreSQL, Redis (Caching & Streams), MongoDB, MySQL
- Cloud & DevOps: AWS (EC2, ECS, Lambda, SES), Docker / Containerization, CI/CD (GitHub Actions / Jenkins), Kubernetes

Experience:
1. Senior Full Stack Engineer (Independent Consultant / Freelance, 2022-Present):
   - Architected and delivered custom enterprise solutions for multi-tenant SaaS clients globally, leveraging Next.js, Node.js, and Serverless AWS frameworks.
   - Engineered 'motomate', an on-demand fleet-servicing application which reduced dispatch latency by 35% using geohashing and WebSockets.
   - Tuned heavy database architectures to support up to 5,000 requests per second, achieving a 45% reduction in PostgreSQL CPU consumption via aggressive query analysis and Redis buffering.
2. Senior Engineer (Turing, 2022):
   - Vetted and collaborated with elite engineering talent worldwide to build robust server architectures for high-growth US startups.
   - Refactored complex state management layers in legacy Angular systems to modern reactive patterns, leading to 50% faster UI paint speeds.
   - Created scalable third-party APIs using NestJS and unified authentication filters using JSON Web Tokens and Redis-backed session revoking.
3. Lead System Engineer (TCS, 2016-2022):
   - Promoted rapidly from Assistant Systems Engineer to Lead Systems Engineer owing to strong execution of banking compliance architectures.
   - Headed a team of 6 developers in designing a real-time risk mitigation and transaction monitoring pipeline for global financial clients, reducing fraudulent alert overhead by 22%.
   - Pioneered the adoption of TypeScript and clean architecture principles within the branch division, conducting workshops and drafting strict lint rules.

Projects:
- MotoMate: On-demand fleet servicing and mechanics dispatch portal (Next.js, Express, Redis, PostgreSQL, WebSockets).
- Risk Mitigation Engine: Real-time compliance audit and fraudulent transaction monitoring platform (NestJS, Apache Kafka, PostgreSQL, Docker).
- TradeSync Telegram Bot: Scalable trading automation, technical alert parser, and Web3 tracking bot (Node.js, Telegraf, SQLite, Ethers.js).
- Dynamic Price Surge Engine: Surge pricing and demand-supply modeling algorithm for ride-sharing (FastAPI, React, Redis Grid, Python).
- LexSphere Practice Suite: Legal practice case management, document assembly, and invoicing (Express, React, AWS S3, Stripe API).
- EchoPulse Review Hub: Corporate 360 feedback tracker (React, Node.js, MongoDB, HuggingFace sentiment API).

Keep your responses concise, structured, and matching a terminal aesthetic (feel free to use text bullet points, light spacing, and a helpful technical tone). Be witty, friendly, and act as a reliable guide to Ashwani's accomplishments. If asked to write code or help solve a problem, you can provide elegant, high-quality snippets!`;

      // Structure contents with history for full conversational capabilities
      const contents = [];
      if (history && Array.isArray(history)) {
        for (const turn of history) {
          contents.push({
            role: turn.role === "user" ? "user" : "model",
            parts: [{ text: turn.content }]
          });
        }
      }
      contents.push({
        role: "user",
        parts: [{ text: prompt }]
      });

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      res.json({ response: response.text || "I was unable to formulate a response." });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: "Failed to communicate with AI Copilot.", details: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
