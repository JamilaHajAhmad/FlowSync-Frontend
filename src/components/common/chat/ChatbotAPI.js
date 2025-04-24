const API_KEY = import.meta.env.VITE_API_KEY;

export const sendMessageToAI = async (userMessage) => {
    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": "deepseek/deepseek-r1:free",
                "messages": [
                    {
                        "role": "user",
                        "content": userMessage 
                    }
                ],
                "temperature": 0.7,
                "max_tokens": 1000,
                "format": "markdown"
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("API Error:", errorData);
            throw new Error(`API error: ${errorData.error?.message || 'Unknown error'}`);
        }

        const data = await response.json();
        // Return an array containing the message object
        return [{
            type: 'bot',
            content: data.choices[0]?.message?.content?.toString() || '', // Ensure content is a string
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            likes: 0,
            dislikes: 0
        }];
    } catch (error) {
        console.error("Error details:", error);
        return [{
            type: 'bot',
            content: "Sorry, I couldn't process your request. Please try again later.",
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            likes: 0,
            dislikes: 0
        }];
    }
};

// Add sound effects
export const chatSounds = {
    messageSent: new Audio('/sounds/message-send.mp3'),
    messageReceived: new Audio('/sounds/message-received.mp3'),
};

// Text-to-speech function
export const speakMessage = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
};
