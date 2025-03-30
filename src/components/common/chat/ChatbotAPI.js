const API_KEY = import.meta.env.VITE_REACT_APP_OPENAI_API_KEY; // Ensure this is set in your Vite environment variables
const API_URL = "https://api.openai.com/v1/chat/completions";

export const sendMessageToAI = async (message) => {
    // First, check if API key exists
    if (!API_KEY) {
        console.error("OpenAI API key is missing");
        return "Configuration error: API key is missing";
    }

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY.trim()}` // Added trim() to remove any whitespace
            },
            body: JSON.stringify({
                model: "gpt-4o", // Changed from gpt-4 to more widely available model
                messages: [
                    {
                        role: "system",
                        content: "You are a helpful assistant for FlowSync, a project management application. You can help users with tasks, team management, and general workflow questions."
                    },
                    {
                        role: "user",
                        content: message
                    }
                ],
                temperature: 0.7,
                max_tokens: 150
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("API Error:", errorData);
            throw new Error(`API error: ${errorData.error?.message || 'Unknown error'}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error("Error details:", error);
        return "Sorry, I couldn't process your request. Please try again later.";
    }
};
