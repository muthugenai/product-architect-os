export interface ChatMessage {
  id: string;
  role: 'bot' | 'user' | 'agent';
  text: string;
  timestamp: number;
  isTyping?: boolean;
}

export interface BotResponse {
  trigger: string[];
  response: string;
  resolved?: boolean;
  followUps?: string[];
}

export const BOT_GREETINGS: Record<string, string> = {
  default: "Hi! I'm Rovo. I'm reviewing your current page context (Support Insights 360). How can I help you today?",
  billing: "Hi! I can see you're experiencing a billing issue. Let me check your account details and recent transactions. Can you describe the specific problem?",
  account: "Hi! I'm Rovo. I can help with account access issues. Are you unable to log in, or is there a permissions problem?",
  product: "Hi! I'm Rovo. I can help with product setup. Which Atlassian product are you trying to configure?",
  technical: "Hi! I'm Rovo. Let me help you troubleshoot this technical issue. What exactly is happening, and what have you already tried?",
};

export const BOT_RESPONSES: BotResponse[] = [
  {
    trigger: ['permission', 'access', 'cannot login', "can't login", 'locked out'],
    response:
      "I can help with that. First, let's try a quick fix: go to your Atlassian account settings at id.atlassian.com and try resetting your password. If you're locked out of a specific product, an admin can reinstate access from User Management. Would you like me to guide you through either of these steps?",
    followUps: ['Reset my password', 'Contact my admin', 'Still need help'],
  },
  {
    trigger: ['billing', 'invoice', 'charge', 'payment', 'subscription'],
    response:
      "I've looked up your account. Your current subscription is Jira Service Management Premium (50 agents). Your last invoice was processed on Jan 15, 2026 for $2,450. If you're seeing an unexpected charge, it may relate to the recent seat count adjustment. Would you like me to pull the full billing history?",
    followUps: ['Show billing history', 'Dispute a charge', 'Still need help'],
  },
  {
    trigger: ['slow', 'performance', 'latency', 'loading', 'timeout'],
    response:
      "I've checked the Atlassian status page — there are no active incidents in your region. Performance issues like this are often caused by browser extensions, network configuration, or a large number of active dashboard widgets. Try opening the page in an incognito window. Did that help?",
    followUps: ['Yes, it worked!', 'No, still slow', 'Still need help'],
  },
  {
    trigger: ['sla', 'breach', 'ticket', 'queue'],
    response:
      "Based on your Support Insights 360 dashboard, your EMEA Billing queue has a current SLA breach rate of 8.2%, exceeding your 5% target. The primary cause appears to be a 93% spike in P1/P2 tickets over the last 24 hours. I recommend reviewing the 'What caused the resolution time spike?' prompt below for a full analysis.",
    resolved: true,
    followUps: ['Analyze root cause', 'Set up an alert', 'Still need help'],
  },
];

export const BOT_FALLBACK =
  "I wasn't able to fully resolve this automatically. Let me connect you with a human support agent who can help. They'll have your full conversation context, so you won't need to repeat yourself.";

export function getBotResponse(userMessage: string): BotResponse | null {
  const msg = userMessage.toLowerCase();
  for (const resp of BOT_RESPONSES) {
    if (resp.trigger.some(t => msg.includes(t))) {
      return resp;
    }
  }
  return null;
}
