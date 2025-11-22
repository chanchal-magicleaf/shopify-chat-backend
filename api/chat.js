const axios = require('axios');

module.exports = async (req, res) => {
  // Allow your Shopify store to use this
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { message, pageContent } = req.body;
    
    const systemPrompt = `You are a helpful product assistant. Based on this product information:

${pageContent || 'No specific product information provided.'}

Provide helpful, positive responses without making absolute claims. Use phrases like "designed to", "features", "includes" instead of guarantees.`;
    
    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: "deepseek/deepseek-r1",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      temperature: 0.7,
      max_tokens: 500
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://your-store.myshopify.com',
        'X-Title': 'Shopify Assistant'
      }
    });
    
    return res.status(200).json({
      message: response.data.choices[0].message.content
    });
    
  } catch (error) {
    console.error('Error:', error.message);
    return res.status(500).json({ 
      error: 'Failed to get response'
    });
  }
};
