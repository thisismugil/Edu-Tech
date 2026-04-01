const fs = require('fs');
const path = require('path');
const { OpenAI } = require('openai');

// Simple .env parser
function loadEnv() {
    try {
        const envPath = path.resolve(__dirname, '.env');
        if (fs.existsSync(envPath)) {
            const envConfig = fs.readFileSync(envPath, 'utf8');
            envConfig.split('\n').forEach(line => {
                const parts = line.split('=');
                if (parts.length >= 2) {
                    const key = parts.shift().trim();
                    const value = parts.join('=').trim();
                    if (key) {
                        process.env[key] = value;
                    }
                }
            });
        }
    } catch (e) {
        console.error('Error loading .env', e);
    }
}

loadEnv();

async function testNvidia() {
    const apiKey = process.env.NVIDIA_API_KEY;
    if (!apiKey) {
        console.error('NVIDIA_API_KEY not found in .env');
        return;
    }

    console.log('Testing NVIDIA API with meta/llama-3.3-70b-instruct...');
    
    const openai = new OpenAI({
        apiKey: apiKey,
        baseURL: 'https://integrate.api.nvidia.com/v1',
    });

    try {
        const completion = await openai.chat.completions.create({
            model: 'meta/llama-3.3-70b-instruct',
            messages: [{ role: 'user', content: 'Say hello to the world as an AI assistant!' }],
            temperature: 0.2,
            max_tokens: 50,
        });

        const responseText = completion.choices[0]?.message?.content || "";
        console.log('NVIDIA API Response:');
        console.log(responseText);
        
        fs.writeFileSync('output.txt', responseText);
        console.log('Response written to output.txt');
        
    } catch (error) {
        console.error('Error fetching from NVIDIA API:', error.message);
        fs.writeFileSync('output.txt', JSON.stringify({ error: error.message }, null, 2));
    }
}

testNvidia();
