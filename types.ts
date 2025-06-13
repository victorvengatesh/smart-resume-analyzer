
export interface ContactInfo {
  email?: string;
  phone?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  address?: string;
}

export interface ExperienceEntry {
  jobTitle: string;
  company: string;
  location?: string;
  dates: string;
  responsibilities: string[];
}

export interface EducationEntry {
  degree: string;
  institution: string;
  location?: string;
  graduationDate: string;
  details?: string[];
}

export interface ProjectEntry {
  name: string;
  description: string;
  technologiesUsed?: string[];
  link?: string;
}

export interface AnalyzedResume {
  name?: string;
  contactInfo?: ContactInfo;
  summary?: string;
  experience?: ExperienceEntry[];
  education?: EducationEntry[];
  skills?: string[] | Record<string, string[]>;
  projects?: ProjectEntry[];
  customSections?: Record<string, string[]>; // e.g., {"Awards": ["Award 1", "Award 2"]}
}

// Props for UI components
export interface ErrorMessageProps {
  message: string;
}

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
}
