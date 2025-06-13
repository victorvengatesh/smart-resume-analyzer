
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { AnalyzedResume } from '../types';

// Ensure process.env.API_KEY is handled by the build/runtime environment
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API_KEY for Gemini is not set. Please ensure the API_KEY environment variable is configured.");
  // Potentially throw an error or handle this state in the UI more gracefully
}

const ai = new GoogleGenAI({ apiKey: API_KEY || "MISSING_API_KEY" }); // Fallback to prevent crash if API_KEY is undefined at init

const getResumeAnalysisPrompt = (resumeText: string): string => `
You are an expert resume analyzer. Your task is to extract key information from the provided resume text and return it as a structured JSON object.
The JSON object should conform to the following TypeScript interface structure:

interface ContactInfo {
  email?: string;
  phone?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  address?: string;
}

interface ExperienceEntry {
  jobTitle: string; // e.g., "Software Engineer"
  company: string; // e.g., "Google"
  location?: string; // e.g., "Mountain View, CA"
  dates: string; // e.g., "Jan 2020 - Present" or "2018 - 2019"
  responsibilities: string[]; // List of accomplishments or duties. Each responsibility should be a concise string.
}

interface EducationEntry {
  degree: string; // e.g., "B.S. in Computer Science"
  institution: string; // e.g., "Stanford University"
  location?: string; // e.g., "Stanford, CA"
  graduationDate: string; // e.g., "May 2018" or "Expected Dec 2024"
  details?: string[]; // e.g., GPA, honors, relevant coursework
}

interface ProjectEntry {
  name: string; // e.g., "Personal Portfolio Website"
  description: string; // Brief description of the project
  technologiesUsed?: string[]; // e.g., ["React", "Node.js", "MongoDB"]
  link?: string; // URL to the project if available
}

interface AnalyzedResume {
  name?: string; // Full name of the candidate
  contactInfo?: ContactInfo;
  summary?: string; // Professional summary or objective statement
  experience?: ExperienceEntry[];
  education?: EducationEntry[];
  skills?: string[] | Record<string, string[]>; // If skills are clearly categorized (e.g., "Languages", "Frameworks", "Tools"), use Record<string, string[]>. Otherwise, use a flat string[] for general skills.
  projects?: ProjectEntry[];
  // If you find other distinct sections like "Awards", "Certifications", "Publications", "Languages" (human languages), etc.,
  // include them in a 'customSections' object where the key is the section title (e.g., "Awards")
  // and the value is an array of strings representing the items in that section.
  customSections?: Record<string, string[]>;
}

Analyze the following resume text and provide the extracted information in the specified JSON format.
It is critical that the output is a single, valid JSON object. All property names (keys) MUST be enclosed in double quotes (e.g., "name": "John Doe"). All string values must also be enclosed in double quotes.
Ensure all text values are strings. For lists like responsibilities or skills, provide an array of strings.
If a section or field is not present in the resume, omit it from the JSON or use null where appropriate for optional fields.
Prioritize accuracy and completeness based on the provided text.

Resume Text:
---
${resumeText}
---
`;

export const analyzeResume = async (resumeText: string): Promise<AnalyzedResume> => {
  if (!API_KEY) {
    throw new Error("Gemini API Key is not configured. Cannot analyze resume.");
  }

  const prompt = getResumeAnalysisPrompt(resumeText);

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-04-17", // Recommended model
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        // temperature: 0.2, // Lower temperature for more deterministic, factual extraction
      },
    });

    let jsonStr = response.text.trim();
    
    // Remove Markdown code fences if present
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }
    
    // Additional check for potential leading/trailing non-JSON characters if fences aren't perfect
    if (!jsonStr.startsWith('{') && jsonStr.includes('{') && jsonStr.includes('}')) {
        jsonStr = jsonStr.substring(jsonStr.indexOf('{'), jsonStr.lastIndexOf('}') + 1);
    }


    try {
        const parsedData: AnalyzedResume = JSON.parse(jsonStr);
        return parsedData;
    } catch (parseError) {
        console.error("Failed to parse JSON response from API. Raw string:", jsonStr);
        console.error("Parsing error details:", parseError);
        if (parseError instanceof Error) {
            throw new Error(`Failed to parse API response as JSON: ${parseError.message}. Raw response logged to console.`);
        }
        throw new Error("Failed to parse API response as JSON. Raw response logged to console.");
    }


  } catch (error) {
    console.error("Error analyzing resume with Gemini API:", error);
    if (error instanceof Error) {
        if (error.message.includes("API key not valid")) {
             throw new Error("Invalid Gemini API Key. Please check your configuration.");
        }
         throw new Error(`Failed to analyze resume. Gemini API error: ${error.message}`);
    }
    throw new Error("An unknown error occurred while analyzing the resume.");
  }
};
