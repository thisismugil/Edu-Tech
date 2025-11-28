const fs = require('fs');
const path = require('path');

// Simple .env parser
function loadEnv() {
    try {
        const envPath = path.resolve(__dirname, '.env');
        if (fs.existsSync(envPath)) {
            const envConfig = fs.readFileSync(envPath, 'utf8');
            envConfig.split('\n').forEach(line => {
                const [key, value] = line.split('=');
                if (key && value) {
                    process.env[key.trim()] = value.trim();
                }
            });
        }
    } catch (e) {
        console.error('Error loading .env', e);
    }
}

loadEnv();

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error('GEMINI_API_KEY not found in .env');
        return;
    }

    console.log('Fetching models list...');
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        if (data.models) {
            const models = data.models
                .filter(m => m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent'))
                .map(m => m.name);

            fs.writeFileSync('models.json', JSON.stringify(models, null, 2));
            console.log('Models written to models.json');
        } else {
            console.error('No models found or error:', JSON.stringify(data, null, 2));
            fs.writeFileSync('models.json', JSON.stringify({ error: data }, null, 2));
        }
    } catch (error) {
        console.error('Error fetching models:', error.message);
        fs.writeFileSync('models.json', JSON.stringify({ error: error.message }, null, 2));
    }
}

listModels();
