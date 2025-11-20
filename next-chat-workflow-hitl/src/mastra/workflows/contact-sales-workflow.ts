import { createStep, createWorkflow } from "@mastra/core/workflows";
import z from "zod";

const emptySchema = z.object({});

const askEmail = createStep({
  id: "askEmail",
  description: "Ask user their email",
  inputSchema: emptySchema,
  resumeSchema: z.object({
    input: z.string(),
  }),
  outputSchema: emptySchema,
  execute: async ({ resumeData, suspend, setState }) => {
    if (resumeData?.input === undefined) {
      return suspend({
        message: `Thanks for reaching the sales team. I'll grab your email and your question to route you to the right person.
What's your work email?`,
      });
    }

    if (!resumeData.input.includes("@")) {
      return suspend({
        message: `That doesn't look like a valid email. Could you enter a work email like name@company.com?`,
      });
    }

    setState({
      email: resumeData.input,
    });
  },
});

const askName = createStep({
  id: "askName",
  description: "Ask user their name",
  inputSchema: emptySchema,
  resumeSchema: z.object({
    input: z.string(),
  }),
  outputSchema: emptySchema,
  execute: async ({ resumeData, suspend, setState, state }) => {
    if (resumeData?.input === undefined) {
      return suspend({
        message: `What's your name?`,
      });
    }

    setState({
      ...state,
      name: resumeData.input,
    });
  },
});

const askQuery = createStep({
  id: "askQuery",
  description: "Ask user their query",
  inputSchema: emptySchema,
  resumeSchema: z.object({
    input: z.string(),
  }),
  outputSchema: emptySchema,
  execute: async ({ resumeData, suspend, state, setState, mastra }) => {
    // maybe this should be an init step
    if (!resumeData?.input) {
      return suspend({
        message:
          "Great, what would you like help with regarding pricing, plans, procurement, or purchasing?",
      });
    }

    const agent = mastra.getAgent("queryClassifierAgent");
    const { object } = await agent.generate(resumeData.input, {
      structuredOutput: {
        schema: z.object({
          isSalesQuery: z.boolean(),
          rejectionMessage: z.string(),
        }),
      },
    });

    if (!object.isSalesQuery) {
      return suspend({
        message: object.rejectionMessage,
      });
    }

    setState({
      ...state,
      query: resumeData.input,
    });
  },
});

const confirm = createStep({
  id: "confirm",
  description: "Confirm the user's query",
  inputSchema: emptySchema,
  resumeSchema: z.object({
    input: z.string().optional(),
  }),
  outputSchema: emptySchema,
  execute: async ({ resumeData, suspend, state, bail, mastra }) => {
    if (!resumeData) {
      return suspend({
        message: `Here's what I'll send to our sales team:

Email: ${state.email}

Query: ${state.query}

Is this OK to submit?`,
      });
    }

    const agent = mastra.getAgent("sentimentAgent");
    const { object } = await agent.generate(resumeData.input as string, {
      structuredOutput: {
        schema: z.object({
          isAffirmative: z.boolean(),
        }),
      },
    });

    if (!object.isAffirmative) {
      return bail({
        message: `No worries - we'll start again to make sure everything's correct. I'll clear the details collected so far. Type anything to start again!`,
      });
    }
  },
});

const send = createStep({
  id: "send",
  description: "Send the user's query to the sales team",
  inputSchema: z.object({
    message:z.string()
  }),
  outputSchema: z.object({
    message: z.string(),
  }),
  execute: async ({ state }) => {
    console.log("state", state);
    return {
      message: `Thanks! I've sent this to the right salesperson. You'll hear back at ${state.email}. If you have another query, just type below and I gotchu.`,
    };
  },
});

const summarize = createStep({
  id: "summarize",
  description: "Summarize the user's query and email",
  inputSchema:  z.object({
    message: z.string(),
  }),
  outputSchema: z.object({
    message: z.string(),
  }),
  execute: async ({ inputData, state }) => {
    return {
      message: `${inputData.message}\n\n To summarize, you asked about ${state.query} and provided your email as ${state.email}.`,
    };
  },
});

export const contactSalesWorkflow = createWorkflow({
  id: "contactSalesWorkflow",
  inputSchema: emptySchema,
  outputSchema: z.object({
    message: z.string(),
  }),
  steps: [askEmail, askQuery, confirm, send, summarize],
})
  .then(askEmail)
  .then(askName)
  .then(askQuery)
  .then(confirm)
  .then(send)
  .then(summarize)
  .commit();
