
import { mastra } from "@/mastra";
import { createUIMessageStreamResponse, UIMessage } from "ai";
import { toAISdkFormat } from "@mastra/ai-sdk";
import { parseMessages } from "@/lib/ui-message-utils";

export async function POST(req: Request) {
  const { messages } = await req.json()
  const { lastUserMessage, activeRunId } = parseMessages(messages);
  const workflow = mastra.getWorkflow("contactSalesWorkflow");

  if (!activeRunId) {
    const run = await workflow.createRunAsync();
    const stream = run.stream();
    return createUIMessageStreamResponse({
      stream: toAISdkFormat(stream, {
        from: "workflow"
      }),
    });
  }

  const run = await workflow.createRunAsync({ runId: activeRunId });
  const stream = run.resumeStreamVNext({
    resumeData: {
      input: lastUserMessage,
    } as any,
  });
  return createUIMessageStreamResponse({
    stream: toAISdkFormat(stream, {
      from: "workflow"
    }),
  });
}

export async function GET() {
  // TODO: implement message history retrieval
  // - accept a run id query parameter
  // - retrieve the workflow run status/history using the run id
  // - return the messages in the UI message format
  return new Response("OK");
}
