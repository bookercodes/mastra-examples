import "dotenv/config";

import { mastra } from "./src/mastra";

  (async () => {

    const runId: string | undefined = "0fac7e57-cff4-445c-9928-e2cea4be28d1"
    const input = "true"

    const workflow = mastra.getWorkflow("contactSalesWorkflow")

    if (!runId) {
      console.log("creating new run");
      const run = await workflow.createRunAsync();
      const stream = run.stream({ inputData: { } })
      for await (const chunk of stream.fullStream) {
        console.log(chunk);
      }
      return
    }

    const run = await workflow.createRunAsync({ runId })
    console.log("resuming run", run.runId);
    const stream = run.resumeStreamVNext({
      resumeData: {
        input
      } as any
    })
    for await (const chunk of stream.fullStream) {
      console.log(chunk);
    }
  })()