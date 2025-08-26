import { openai } from "@ai-sdk/openai";
import { Agent } from "@mastra/core/agent";

export const tweetAgent = new Agent({
    name: 'Tweet Agent',
    instructions: `Turn the given input into a piffy tweet`,
    model: openai('gpt-4o-mini'),
})