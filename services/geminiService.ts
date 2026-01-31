import { GoogleGenAI, Type } from "@google/genai";
import { StudyTask } from "../types";

// Helper to get the AI instance on demand
const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const generateStudyPlan = async (examName: string, hours: number, weakSubjects: string[]): Promise<StudyTask[]> => {
  const ai = getAI();
  if (!ai) {
    console.error("API Key missing");
    return [];
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Create a daily study plan for a student preparing for ${examName}. 
      They have ${hours} hours available today. 
      Weak subjects: ${weakSubjects.join(', ')}. 
      
      Generate a list of 4-6 specific study tasks.
      Each task should have a specific title, subject, duration (in minutes), and type (Learning, Practice, or Revision).`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              subject: { type: Type.STRING },
              duration: { type: Type.INTEGER },
              type: { type: Type.STRING, enum: ['Learning', 'Practice', 'Revision'] }
            },
            required: ['title', 'subject', 'duration', 'type']
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];

    const data = JSON.parse(text);
    // Add IDs and isCompleted status
    return data.map((task: any, index: number) => ({
      ...task,
      id: `task-${Date.now()}-${index}`,
      isCompleted: false
    }));

  } catch (error) {
    console.error("Gemini Error:", error);
    return [];
  }
};

export const askAITutor = async (context: string, question: string) => {
  const ai = getAI();
  if (!ai) return "I cannot answer right now. Please check your API configuration.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are an expert tutor. 
      Context: ${context}
      
      Student Question: ${question}
      
      Answer using structured Markdown. Use bullet points, bold text for key terms, and space between paragraphs to make it highly readable. Avoid long, dense blocks of text.`,
    });
    return response.text || "No response generated.";
  } catch (error) {
    console.error("Gemini Tutor Error:", error);
    return "Sorry, I encountered an error while thinking.";
  }
};

export const generateAnalyticsTips = async (
  examName: string,
  weakTopics: string[],
  avgAccuracy: number
): Promise<string[]> => {
  const ai = getAI();
  if (!ai) return ["Please connect your API key to get personalized insights."];

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are an expert exam coach for ${examName}.
      
      Student Data:
      - Weak Topics: ${weakTopics.length > 0 ? weakTopics.join(', ') : 'None identified yet'}
      - Average Accuracy: ${avgAccuracy}%
      
      Provide 3 specific, actionable, and short study tips (max 15 words each). 
      Format: Each tip should be clear and punchy.
      Return the response as a JSON array of strings.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    const text = response.text;
    if (!text) return ["Keep practicing to generate insights!"];
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Insights Error:", error);
    return ["Focus on consistent practice.", "Review your mistake book daily.", "Take timed mock tests."];
  }
};


// --- New Admin Features ---

export const generateExamSyllabus = async (topic: string): Promise<any> => {
  const ai = getAI();
  if (!ai) return null;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', // Using a stable model
      contents: `Act as an expert curriculum designer. Create a detailed syllabus structure for the exam: "${topic}".
            
            Structure Required:
            1. Exam Name & Description
            2. List of Subjects (e.g., Physics, Math, Verbal Ability)
            3. For each Subject, list 3-5 Core Topics.
            4. For each Topic, provide:
               - Description
               - A short study content summary. USE STRUCTURED MARKDOWN: use H3 for sub-headers, bullet points for key concepts, and bolding for definitions. Make it very easy to scan.
               - List of subtopics
               - Difficulty level (Easy, Medium, Hard)
            
            Return ONLY valid JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            description: { type: Type.STRING },
            subjects: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  icon: { type: Type.STRING, description: "Lucide icon name e.g. Book, Calculator, Dna" },
                  topics: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        description: { type: Type.STRING },
                        content: { type: Type.STRING },
                        subtopics: { type: Type.ARRAY, items: { type: Type.STRING } },
                        difficulty: { type: Type.STRING, enum: ['Easy', 'Medium', 'Hard'] }
                      },
                      required: ['name', 'content', 'difficulty']
                    }
                  }
                },
                required: ['name', 'topics']
              }
            }
          },
          required: ['name', 'subjects']
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini Syllabus Error:", error);
    return null;
  }
};

export const generateQuestions = async (examName: string, topicName: string, count: number = 5): Promise<any[]> => {
  const ai = getAI();
  if (!ai) return [];

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Create ${count} multiple-choice questions for the exam "${examName}" on the topic "${topicName}".
            
            Difficulty: Mixed.
            Format:
            - Question text
            - 4 Options
            - Correct Option Index (0-3)
            - Detailed Explanation: Use Structured Markdown. Use bolding for the logic, bullet points for steps, and clear separation between concept and solution.
            
            Return JSON array.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctIndex: { type: Type.INTEGER },
              explanation: { type: Type.STRING }
            },
            required: ['text', 'options', 'correctIndex', 'explanation']
          }
        }
      }
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Gemini Question Error:", error);
    return [];
  }
};

export const generateTopicStudyMaterial = async (
  topicName: string,
  subjectName: string,
  examName: string
): Promise<string | null> => {
  const ai = getAI();
  if (!ai) return null;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are an expert professor for the exam "${examName}".
      
      Create a highly detailed, comprehensive study guide for the topic: "${topicName}" (Subject: ${subjectName}).
      
      Requirements:
      - LENGTH: Provide a deep-dive analysis (at least 1500-2000 characters).
      - FORMAT: Use structured Markdown (H3 headers, bolding, bullet points).
      - STRUCTURE:
        - **Executive Summary**: A high-level overview.
        - **Main Concepts**: Detailed explanation of each sub-component.
        - **Theoretical Framework**: The logic or laws behind the concept.
        - **Practical/Numerical Examples**: Walkthroughs of applications.
        - **Strategic Insights**: "Exam-day" tips and common misconceptions.
        - **Summary Checklist**: Key points for quick revision.
      
      The goal is to provide enough depth that a student can master the topic purely from this guide.`,
    });

    return response.text || null;
  } catch (error) {
    console.error("Gemini Study Material Error:", error);
    return null;
  }
};

export const generateSubtopicDetails = async (
  topicName: string,
  subtopics: string[]
): Promise<any[]> => {
  const ai = getAI();
  if (!ai) return [];

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `For the topic "${topicName}", generate detailed content for the following subtopics: ${subtopics.join(', ')}.
      
      For each subtopic, provide:
      1. Title (exact match from list)
      2. Description (2-3 sentences)
      3. Key Points (3-5 bullet points)

      Return ONLY valid JSON array.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ['title', 'description', 'keyPoints']
          }
        }
      }
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Gemini Subtopic Details Error:", error);
    return [];
  }
};

export const generateMindMap = async (topicName: string, subtopics: string[]): Promise<string> => {
  const ai = getAI();
  if (!ai) return "";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a rich, multi-level Mermaid.js mindmap syntax for the topic "${topicName}".
      Includes these subtopics: ${subtopics.join(', ')}.
      
      Requirements:
      1. Start with 'mindmap'
      2. Root node is the topic name (use a class or specific id if possible)
      3. Create deep branches. Don't just list the subtopics; break each down into 2-3 key concepts. (e.g., Topic -> Subtopic -> Details)
      4. Use icons where appropriate (e.g. ::icon(fa fa-book)) if mermaid supports it, otherwise keep text clean.
      5. Return ONLY the mermaid code, no markdown backticks.
      
      Example Structure:
      mindmap
        root((Topic Name))
          Subtopic 1
            Concept A
            Concept B
          Subtopic 2
            Concept C
            Concept D
      `,
    });

    let text = response.text || "";
    // Clean up if AI returns markdown code blocks
    text = text.replace(/```mermaid/g, '').replace(/```/g, '').trim();

    return text;
  } catch (error) {
    console.error("Gemini Mind Map Error:", error);
    return "";
  }
};