import { UIMessage } from "ai"
import { WorkflowDataPart } from "@mastra/ai-sdk"

export function parseMessages(messages: UIMessage[]) {
  // extract the most recent user input by finding the last message with the role "user"
  // and retrieving its text part.
  const lastUserMessage = messages
    .findLast(m => m.role === "user")
    ?.parts.find(p => p.type === "text")
    ?.text

  // identify the most recent workflow interaction by scanning all message parts
  // for a "data-workflow" type.
  const lastWorkflowPart = messages
    .flatMap(m => m.parts)
    .findLast((p): p is WorkflowDataPart => p.type === "data-workflow")

  // steps where status is not success
  const lastStepName = Object
    .values(lastWorkflowPart?.data.steps|| {})
    .find(
      step => step.status !== "success",
    )?.name

  // determine the active run id:
  // - if the workflow completed successfully, the run id is cleared (undefined)
  //   so the next message can restart the workflow.
  // - otherwise, return the id of the last workflow part to resume or track it.
  const activeRunId =
    lastWorkflowPart?.data?.status === "success"
      ? undefined
      : lastWorkflowPart?.id

  return {
    lastStepName,
    lastUserMessage,
    activeRunId,
  }
}
