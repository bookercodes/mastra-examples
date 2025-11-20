import { Agent } from "@mastra/core/agent";

export const sentimentAgent = new Agent({
  id: "sentimentAgent",
  name: "Sentiment Agent",
  model: "openai/gpt-4.1-nano",
  instructions:
    "You are a sentiment analysis agent. Your task is to determine if a user's input is affirmative or negative. 'Yes', 'Yeah', 'Go ahead', 'Do it' are examples of affirmative responses. 'Maybe', 'No', 'False', 'Not sure', or gibberish are examples of negative responses.",
});

