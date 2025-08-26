import { createStep, createWorkflow } from "@mastra/core";
import z from "zod";
import { tweetAgent } from "../agents/tweet-agent";

const stepOne = createStep({
  id: "stepOne",
  description: "Step one",
  inputSchema: z.object({ tweet: z.string() }),
  outputSchema: z.object({ tweet: z.string() }),
  execute: async ({ inputData }) => {
    const { text } = await tweetAgent.generate(inputData.tweet, {
      temperature: 1.2,
      topP: 0.9,
    });
    console.log("generated tweet", text);
    return { tweet: text, approved: false };
  },
});

const stepTwo = createStep({
  id: "stepTwo",
  description: "Step two",
  inputSchema: z.object({ tweet: z.string() }),
  resumeSchema: z.object({
    approved: z.boolean().optional()
  }),
  outputSchema: z.object({ 
    tweet: z.string(),
    approved: z.boolean() 
  }),
  execute: async ({ inputData, resumeData, suspend }) => {
    if (resumeData) {
      return { tweet: inputData.tweet, approved: resumeData.approved };
    }
    return suspend({})
  },
})

const generateTweetWorkflow = createWorkflow({
  id: "tweet-workflow",
  inputSchema: z.object({ tweet: z.string() }),
  outputSchema: z.object({
    tweet: z.string(),
    approved: z.boolean()
  }),
})
.then(stepOne)
.then(stepTwo)
.commit();

export const tweetWorkflow = createWorkflow({
  id: "tweetWorkflow",
  inputSchema: z.object({ tweet: z.string() }),
  outputSchema: z.object({ tweet: z.string() }),
})
  .dountil(generateTweetWorkflow, async ({ inputData }) => inputData.approved)
  .commit();