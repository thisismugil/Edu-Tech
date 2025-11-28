import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function generateSyllabus(
  topic: string,
  level: string,
  duration: string,
  tone: string,
  goals: string
) {
  if (!genAI) throw new Error('GEMINI_API_KEY is not set');

  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const prompt = `
    You are an expert curriculum designer. Create a structured course syllabus for the following course:
    Topic: ${topic}
    Target Level: ${level}
    Duration: ${duration}
    Tone: ${tone}
    Learning Goals: ${goals}

    Output strictly valid JSON with the following structure:
    {
      "modules": [
        {
          "title": "Module Title",
          "description": "Short description",
          "lessons": [
            {
              "title": "Lesson Title"
            }
          ]
        }
      ]
    }
    Do not include markdown formatting like \`\`\`json. Just the raw JSON string.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    // Clean up if markdown is present
    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    let cleanText = jsonMatch[0];

    // Attempt to fix common JSON issues from LLMs
    // 1. Remove trailing commas
    cleanText = cleanText.replace(/,(\s*[}\]])/g, '$1');
    // 2. Fix unescaped newlines in strings (basic attempt)
    // This is risky but often needed for markdown content inside JSON strings
    // A better approach is to ask the LLM to avoid this, but we can try to patch it.

    try {
      return JSON.parse(cleanText);
    } catch (e: any) {
      console.log('JSON Parse failed, attempting to repair:', cleanText.substring(0, 200) + '...');
      // Fallback: Try to use a more permissive parser or just fail with better error
      // For now, let's try to escape unescaped control characters
      cleanText = cleanText.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t');
      // This might break the structure if we replace newlines outside of strings, 
      // but standard JSON shouldn't have newlines outside of whitespace anyway.
      // However, we need to be careful not to double escape.

      // Let's try a different approach: The prompt asks for "strictly valid JSON".
      // Maybe we should just log the error and text for debugging if it fails again.
      throw new Error('Failed to parse JSON response: ' + e.message);
    }
  } catch (error) {
    console.error('AI Syllabus Generation Error:', error);
    throw new Error('Failed to generate syllabus');
  }
}

export async function generateLessonContent(
  courseTopic: string,
  moduleTitle: string,
  lessonTitle: string,
  tone: string
) {
  if (!genAI) throw new Error('GEMINI_API_KEY is not set');

  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const prompt = `
    You are an expert educator. Write detailed lesson content for:
    Course Topic: ${courseTopic}
    Module: ${moduleTitle}
    Lesson: ${lessonTitle}
    Tone: ${tone}

    The content should be in Markdown format.
    Include:
    1. Introduction
    2. Key Concepts (explained clearly)
    3. Examples
    4. Summary
    5. A list of 3-5 suggested reference links (URLs) or search terms if real URLs are not possible.
    
    Output strictly valid JSON with the following structure. 
    IMPORTANT: 
    1. The "content" field MUST be a single line string. Use literal \\n for newlines.
    2. Escape all double quotes inside the content string with \\".
    3. Do not use trailing commas.
    {
      "content": "Markdown content string with \\n for newlines...",
      "referenceLinks": ["url1", "url2"]
    }
    Do not include markdown formatting like \`\`\`json. Just the raw JSON string.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    let cleanText = jsonMatch[0];

    try {
      return JSON.parse(cleanText);
    } catch (e: any) {
      console.log('JSON Parse failed, attempting to repair...');

      // Aggressive repair:
      // 1. Replace real newlines with \n (if they are inside the string, this helps. If outside, it's fine for JSON)
      cleanText = cleanText.replace(/\n/g, '\\n').replace(/\r/g, '');

      // 2. Try to fix unescaped quotes? (Very hard to do reliably with regex)
      // Instead, let's try to parse it again.
      try {
        return JSON.parse(cleanText);
      } catch (e2) {
        // Fallback: Manual extraction if JSON fails completely
        // This is a last resort to get at least the content
        console.log('Repair failed, attempting manual extraction');
        const contentMatch = text.match(/"content"\s*:\s*"([\s\S]*?)"\s*,\s*"referenceLinks"/);
        if (contentMatch) {
          return {
            content: contentMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"'),
            referenceLinks: [] // Lost links but saved content
          };
        }
        throw new Error('Failed to parse JSON response: ' + e.message);
      }
    }
  } catch (error) {
    console.error('AI Content Generation Error:', error);
    throw new Error('Failed to generate content');
  }
}
