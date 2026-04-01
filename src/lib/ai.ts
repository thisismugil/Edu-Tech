import OpenAI from 'openai';

const apiKey = process.env.NVIDIA_API_KEY;
const openai = apiKey ? new OpenAI({
  apiKey: apiKey,
  baseURL: 'https://integrate.api.nvidia.com/v1',
}) : null;

export async function generateSyllabus(
  topic: string,
  level: string,
  duration: string,
  tone: string,
  goals: string
) {
  if (!openai) throw new Error('NVIDIA_API_KEY is not set');

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
    const completion = await openai.chat.completions.create({
      model: 'meta/llama-3.3-70b-instruct',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      max_tokens: 2048,
    });
    const text = completion.choices[0]?.message?.content || "";
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

    try {
      return JSON.parse(cleanText);
    } catch (e: any) {
      console.log('JSON Parse failed, attempting to repair:', cleanText.substring(0, 200) + '...');
      // Fallback
      cleanText = cleanText.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t');

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
  if (!openai) throw new Error('NVIDIA_API_KEY is not set');

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
    const completion = await openai.chat.completions.create({
      model: 'meta/llama-3.3-70b-instruct',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      max_tokens: 3000,
    });
    const text = completion.choices[0]?.message?.content || "";

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
      // 1. Replace real newlines with \n
      cleanText = cleanText.replace(/\n/g, '\\n').replace(/\r/g, '');

      try {
        return JSON.parse(cleanText);
      } catch (e2) {
        // Fallback: Manual extraction if JSON fails completely
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
