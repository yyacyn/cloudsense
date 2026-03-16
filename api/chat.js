export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const groqKey = process.env.GROQ_API_KEY;
    
    if (!groqKey) {
        return res.status(500).json({ error: 'GROQ_API_KEY is not configured on the server' });
    }

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${groqKey}`
            },
            // Pass the exact body sent from frontend directly to Groq
            body: JSON.stringify(req.body)
        });

        if (!response.ok) {
            const errBody = await response.text();
            console.error(`Groq API Error (${response.status}):`, errBody);
            return res.status(response.status).json({ error: `Groq API Error: ${response.status}`, details: errBody });
        }

        const data = await response.json();
        return res.status(200).json(data);

    } catch (error) {
        console.error("Serverless Function Error:", error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
