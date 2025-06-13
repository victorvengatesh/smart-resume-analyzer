import React from 'react';
import { AnalyzedResume, ContactInfo, ExperienceEntry, EducationEntry, ProjectEntry } from '../types';

interface SectionProps {
  title: string;
  emoji?: string;
  children: React.ReactNode;
  className?: string;
  itemCount?: number; // For staggered animation of the card itself
}

// Defines the base delay factor for each SectionCard.
const CARD_STAGGER_MULTIPLIER = 0.15;
// Defines a small pause after a card starts animating before its direct content begins.
const CONTENT_OFFSET_DELAY = 0.15; 
// Defines the stagger factor for items within a content group.
const ITEM_STAGGER_FACTOR_NORMAL = 0.08;
const ITEM_STAGGER_FACTOR_FAST = 0.05;


const SectionCard: React.FC<SectionProps> = ({ title, emoji, children, className, itemCount = 0 }) => {
  const cardEntryDelay = CARD_STAGGER_MULTIPLIER * itemCount;
  const contentEntryDelay = cardEntryDelay + CONTENT_OFFSET_DELAY;

  return (
    <div 
      className={`glassmorphic-card p-6 mb-8 ${className} animate-fadeInUp`} 
      style={{ animationDelay: `${cardEntryDelay}s` }}
    >
      <h3 
        className="text-2xl font-semibold text-sky-300 mb-4 pb-3 border-b border-sky-400/30 animate-fadeInUp"
        style={{ animationDelay: `${contentEntryDelay}s` }} 
      >
        {emoji && <span className="mr-3 text-2xl">{emoji}</span>}{title}
      </h3>
      {/* The children will be responsible for applying their own contentEntryDelay if they are simple content,
          or calculating item-specific delays if they are lists. */}
      {children}
    </div>
  );
};

const ContactInfoDisplay: React.FC<{ info?: ContactInfo; index: number }> = ({ info, index }) => {
  if (!info || Object.keys(info).every(key => !info[key as keyof ContactInfo])) return null;
  
  const cardEntryDelay = CARD_STAGGER_MULTIPLIER * index;
  const firstItemDelay = cardEntryDelay + CONTENT_OFFSET_DELAY;

  const items = [
    info.email && { label: "Email:", value: <a href={`mailto:${info.email}`}>{info.email}</a> },
    info.phone && { label: "Phone:", value: info.phone },
    info.linkedin && { label: "LinkedIn:", value: <a href={info.linkedin} target="_blank" rel="noopener noreferrer">{info.linkedin}</a> },
    info.github && { label: "GitHub:", value: <a href={info.github} target="_blank" rel="noopener noreferrer">{info.github}</a> },
    info.portfolio && { label: "Portfolio:", value: <a href={info.portfolio} target="_blank" rel="noopener noreferrer">{info.portfolio}</a> },
    info.address && { label: "Address:", value: info.address },
  ].filter(Boolean) as {label: string, value: React.ReactNode}[];

  return (
    <SectionCard title="Contact Information" emoji="📞" itemCount={index}>
      <ul className="space-y-2">
        {items.map((item, idx) => (
          <li 
            key={idx} 
            className="animate-fadeInUp" 
            style={{ animationDelay: `${firstItemDelay + (ITEM_STAGGER_FACTOR_NORMAL * idx)}s` }}
          >
            <strong>{item.label}</strong> {item.value}
          </li>
        ))}
      </ul>
    </SectionCard>
  );
};

const ExperienceSection: React.FC<{ entries?: ExperienceEntry[]; index: number }> = ({ entries, index }) => {
  if (!entries || entries.length === 0) return null;
  const cardEntryDelay = CARD_STAGGER_MULTIPLIER * index;
  const firstItemDelay = cardEntryDelay + CONTENT_OFFSET_DELAY;

  return (
    <SectionCard title="Work Experience" emoji="💼" itemCount={index}>
      {entries.map((entry, idx) => (
        <div 
          key={idx} 
          className="mb-6 pb-4 border-b border-slate-700/50 last:border-b-0 last:pb-0 last:mb-0 animate-fadeInUp" 
          style={{ animationDelay: `${firstItemDelay + (ITEM_STAGGER_FACTOR_NORMAL * idx)}s` }}
        >
          <h4 className="text-lg font-semibold text-slate-100">{entry.jobTitle}</h4>
          <p className="text-md text-sky-400">{entry.company}{entry.location && `, ${entry.location}`}</p>
          <p className="text-sm text-slate-400 mb-2">{entry.dates}</p>
          {entry.responsibilities && entry.responsibilities.length > 0 && (
            <ul className="list-disc list-outside space-y-1 pl-5">
              {entry.responsibilities.map((resp, i) => <li key={i}>{resp}</li>)}
            </ul>
          )}
        </div>
      ))}
    </SectionCard>
  );
};

const EducationSection: React.FC<{ entries?: EducationEntry[]; index: number }> = ({ entries, index }) => {
  if (!entries || entries.length === 0) return null;
  const cardEntryDelay = CARD_STAGGER_MULTIPLIER * index;
  const firstItemDelay = cardEntryDelay + CONTENT_OFFSET_DELAY;

  return (
    <SectionCard title="Education" emoji="🎓" itemCount={index}>
      {entries.map((entry, idx) => (
        <div 
          key={idx} 
          className="mb-4 pb-4 border-b border-slate-700/50 last:border-b-0 last:pb-0 last:mb-0 animate-fadeInUp" 
          style={{ animationDelay: `${firstItemDelay + (ITEM_STAGGER_FACTOR_NORMAL * idx)}s` }}
        >
          <h4 className="text-lg font-semibold text-slate-100">{entry.degree}</h4>
          <p className="text-md text-sky-400">{entry.institution}{entry.location && `, ${entry.location}`}</p>
          <p className="text-sm text-slate-400 mb-2">{entry.graduationDate}</p>
          {entry.details && entry.details.length > 0 && (
            <ul className="list-disc list-outside space-y-1 pl-5">
              {entry.details.map((detail, i) => <li key={i}>{detail}</li>)}
            </ul>
          )}
        </div>
      ))}
    </SectionCard>
  );
};

const SkillsDisplay: React.FC<{ skills?: string[] | Record<string, string[]>; index: number }> = ({ skills, index }) => {
  if (!skills || (Array.isArray(skills) && skills.length === 0) || (typeof skills === 'object' && !Array.isArray(skills) && Object.keys(skills).length === 0) ) return null;
  
  const cardEntryDelay = CARD_STAGGER_MULTIPLIER * index;
  const firstItemBaseDelay = cardEntryDelay + CONTENT_OFFSET_DELAY;

  return (
    <SectionCard title="Skills" emoji="🛠️" itemCount={index}>
      {Array.isArray(skills) ? (
        <ul className="flex flex-wrap gap-2">
          {skills.map((skill, idx) => (
            <li 
              key={idx} 
              className="bg-sky-600/70 text-sky-100 px-4 py-1.5 rounded-full text-sm shadow-md animate-fadeInUp" 
              style={{ animationDelay: `${firstItemBaseDelay + (ITEM_STAGGER_FACTOR_FAST * idx)}s` }}
            >
              {skill}
            </li>
          ))}
        </ul>
      ) : (
        <div className="space-y-4">
          {Object.entries(skills).map(([category, skillList], catIdx) => {
            const categoryDelay = firstItemBaseDelay + (ITEM_STAGGER_FACTOR_NORMAL * catIdx);
            return (
              <div 
                key={category} 
                className="animate-fadeInUp" 
                style={{ animationDelay: `${categoryDelay}s` }}
              >
                <h5 className="font-semibold text-slate-100 mb-2">{category}:</h5>
                <ul className="flex flex-wrap gap-2">
                  {skillList.map((skill, skillIdx) => (
                    <li 
                      key={skillIdx} 
                      className="bg-sky-600/70 text-sky-100 px-3 py-1 rounded-full text-sm shadow-sm animate-fadeInUp" 
                      style={{ animationDelay: `${categoryDelay + CONTENT_OFFSET_DELAY + (ITEM_STAGGER_FACTOR_FAST * skillIdx)}s` }}
                    >
                      {skill}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </SectionCard>
  );
};

const ProjectsSection: React.FC<{ entries?: ProjectEntry[]; index: number }> = ({ entries, index }) => {
  if (!entries || entries.length === 0) return null;
  const cardEntryDelay = CARD_STAGGER_MULTIPLIER * index;
  const firstItemBaseDelay = cardEntryDelay + CONTENT_OFFSET_DELAY;

  return (
    <SectionCard title="Projects" emoji="💡" itemCount={index}>
      {entries.map((entry, idx) => {
        const projectEntryDelay = firstItemBaseDelay + (ITEM_STAGGER_FACTOR_NORMAL * idx);
        return (
          <div 
            key={idx} 
            className="mb-6 pb-4 border-b border-slate-700/50 last:border-b-0 last:pb-0 last:mb-0 animate-fadeInUp" 
            style={{ animationDelay: `${projectEntryDelay}s` }}
          >
            <h4 className="text-lg font-semibold text-slate-100">{entry.name}</h4>
            {entry.link && <p className="text-sm mb-1"><a href={entry.link} target="_blank" rel="noopener noreferrer">{entry.link}</a></p>}
            <p className="mb-2">{entry.description}</p>
            {entry.technologiesUsed && entry.technologiesUsed.length > 0 && (
              <div>
                <strong className="text-slate-300 text-sm">Technologies:</strong>
                <ul className="flex flex-wrap gap-2 mt-1">
                  {entry.technologiesUsed.map((tech, i) => (
                    <li 
                      key={i} 
                      className="bg-slate-600/80 text-slate-200 px-2.5 py-1 rounded text-xs shadow-sm animate-fadeInUp" 
                      style={{ animationDelay: `${projectEntryDelay + CONTENT_OFFSET_DELAY + (ITEM_STAGGER_FACTOR_FAST * i)}s` }}
                    >
                      {tech}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      })}
    </SectionCard>
  );
};

const CustomSectionsDisplay: React.FC<{ sections?: Record<string, string[]>; index: number }> = ({ sections, index }) => {
  if (!sections || Object.keys(sections).length === 0) return null;
  let accumulatedDelayIndex = 0; // To ensure each custom card has a unique base index for staggering

  return (
    <>
      {Object.entries(sections).map(([title, items]) => {
        const cardItemCountForStagger = index + accumulatedDelayIndex;
        const cardEntryDelay = CARD_STAGGER_MULTIPLIER * cardItemCountForStagger;
        const firstListItemDelay = cardEntryDelay + CONTENT_OFFSET_DELAY;
        accumulatedDelayIndex++;
        
        return (
            <SectionCard key={title} title={title} emoji="🌟" itemCount={cardItemCountForStagger}>
            {items && items.length > 0 && (
                <ul className="list-disc list-outside space-y-1 pl-5">
                {items.map((item, itemIdx) => (
                  <li 
                    key={itemIdx} 
                    className="animate-fadeInUp" 
                    style={{ animationDelay: `${firstListItemDelay + (ITEM_STAGGER_FACTOR_NORMAL * itemIdx)}s` }}
                  >
                    {item}
                  </li>
                ))}
                </ul>
            )}
            </SectionCard>
        );
      })}
    </>
  );
};


interface AnalyzedDataDisplayProps {
  data: AnalyzedResume | null;
}

const AnalyzedDataDisplay: React.FC<AnalyzedDataDisplayProps> = ({ data }) => {
  if (!data) return null;
  
  let sectionIndex = 0;

  return (
    <div className="mt-8">
      {data.name && (
        <h2 
            className="text-4xl md:text-5xl font-bold text-center gradient-text mb-10 md:mb-12 tracking-tight animate-fadeInUp"
            // The name itself can have a small initial delay, or be tied to the first card's appearance.
            // Let's give it a fixed small delay.
            style={{ animationDelay: `0.1s`}} 
        >
          {data.name}
        </h2>
      )}
      
      <div className="space-y-8 md:space-y-10">
        <ContactInfoDisplay info={data.contactInfo} index={sectionIndex++} />

        {data.summary && (
          <SectionCard title="Summary" emoji="📝" itemCount={sectionIndex++}>
            <p 
              className="whitespace-pre-line animate-fadeInUp"
              style={{ animationDelay: `${(CARD_STAGGER_MULTIPLIER * (sectionIndex -1)) + CONTENT_OFFSET_DELAY}s` }}
            >
              {data.summary}
            </p>
          </SectionCard>
        )}

        <ExperienceSection entries={data.experience} index={sectionIndex++} />
        <EducationSection entries={data.education} index={sectionIndex++} />
        <SkillsDisplay skills={data.skills} index={sectionIndex++} />
        <ProjectsSection entries={data.projects} index={sectionIndex++} />
        <CustomSectionsDisplay sections={data.customSections} index={sectionIndex++} />
      </div>
    </div>
  );
};

export default AnalyzedDataDisplay;