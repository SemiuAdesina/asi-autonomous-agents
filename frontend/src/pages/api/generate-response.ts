import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { prompt, agentType } = req.body

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' })
  }

  try {
    // Call the backend Flask API for real AI responses
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5001'
    const response = await fetch(`${backendUrl}/api/generate-response`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, agentType })
    })

    if (response.ok) {
      const data = await response.json()
      res.status(200).json({ response: data.response })
    } else {
      // Fallback to rule-based response if backend is unavailable
      const fallbackResponse = generateIntelligentResponse(prompt, agentType)
      res.status(200).json({ response: fallbackResponse })
    }
  } catch (error) {
    console.error('Error calling backend AI service:', error)
    // Fallback to rule-based response
    const fallbackResponse = generateIntelligentResponse(prompt, agentType)
    res.status(200).json({ response: fallbackResponse })
  }
}

function generateIntelligentResponse(prompt: string, agentType: string): string {
  const lowerPrompt = prompt.toLowerCase()
  
  // Healthcare Assistant responses
  if (agentType === 'Healthcare Assistant') {
    if (lowerPrompt.includes('symptom') || lowerPrompt.includes('pain') || lowerPrompt.includes('ache')) {
      return `I understand you're experiencing symptoms. While I can provide general health guidance, it's important to consult with a healthcare professional for proper diagnosis. For immediate concerns, please contact your doctor or visit an emergency room. I can help you understand common symptoms and when to seek medical attention.`
    }
    if (lowerPrompt.includes('medication') || lowerPrompt.includes('drug') || lowerPrompt.includes('medicine')) {
      return `I can help you understand medications and their general uses. However, medication decisions should always be made in consultation with a healthcare provider who knows your medical history. Never start, stop, or change medications without professional guidance.`
    }
    if (lowerPrompt.includes('diet') || lowerPrompt.includes('nutrition') || lowerPrompt.includes('food')) {
      return `I can provide general nutrition guidance. A balanced diet rich in fruits, vegetables, whole grains, and lean proteins supports overall health. Consider consulting a registered dietitian for personalized nutrition advice based on your specific health needs.`
    }
    return `As your Healthcare Assistant, I'm here to provide general health information and guidance. For specific medical concerns, symptoms, or treatment decisions, please consult with a qualified healthcare professional who can provide personalized medical advice.`
  }
  
  // Logistics Coordinator responses
  if (agentType === 'Logistics Coordinator') {
    if (lowerPrompt.includes('route') || lowerPrompt.includes('delivery') || lowerPrompt.includes('shipping')) {
      return `I can help optimize your delivery routes and shipping strategies. For route optimization, I recommend analyzing traffic patterns, delivery windows, and vehicle capacity. Consider implementing GPS tracking and real-time route adjustments for maximum efficiency.`
    }
    if (lowerPrompt.includes('inventory') || lowerPrompt.includes('stock') || lowerPrompt.includes('warehouse')) {
      return `For inventory management, I suggest implementing automated tracking systems, demand forecasting, and just-in-time inventory strategies. This can reduce carrying costs while maintaining optimal stock levels.`
    }
    if (lowerPrompt.includes('supply chain') || lowerPrompt.includes('procurement')) {
      return `Supply chain optimization involves analyzing your entire procurement and distribution network. I can help identify bottlenecks, optimize supplier relationships, and implement cost-saving measures throughout your supply chain.`
    }
    return `As your Logistics Coordinator, I specialize in optimizing supply chains, managing inventory, and improving delivery efficiency. I can help you reduce costs, improve delivery times, and enhance overall operational performance.`
  }
  
  // Financial Advisor responses
  if (agentType === 'Financial Advisor') {
    if (lowerPrompt.includes('portfolio') || lowerPrompt.includes('investment') || lowerPrompt.includes('stocks')) {
      return `For portfolio management, I recommend diversifying across different asset classes including stocks, bonds, and alternative investments. Consider your risk tolerance, time horizon, and financial goals when making investment decisions.`
    }
    if (lowerPrompt.includes('defi') || lowerPrompt.includes('crypto') || lowerPrompt.includes('blockchain')) {
      return `DeFi protocols offer innovative financial services but come with higher risks. I can help you understand yield farming, liquidity provision, and staking opportunities. Always research protocols thoroughly and never invest more than you can afford to lose.`
    }
    if (lowerPrompt.includes('risk') || lowerPrompt.includes('volatility') || lowerPrompt.includes('security')) {
      return `Risk management is crucial for financial success. I recommend diversifying your investments, setting stop-loss orders, and maintaining an emergency fund. For DeFi investments, consider using audited protocols and never put all your funds in one place.`
    }
    return `As your Financial Advisor, I can help with portfolio optimization, risk assessment, and DeFi strategies. I'll provide insights on traditional investments and emerging DeFi opportunities while helping you manage risk appropriately.`
  }
  
  // General responses
  return `I understand your query: "${prompt}". I'm processing this information and will provide comprehensive assistance based on my expertise in ${agentType}. Let me analyze your request and provide detailed guidance.`
}
