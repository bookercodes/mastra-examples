import { Mastra } from "@mastra/core/mastra";
import { PinoLogger } from "@mastra/loggers";
import { LibSQLStore } from "@mastra/libsql";
import { queryClassifierAgent } from "./agents/query-classifier-agent";
import { sentimentAgent } from "./agents/sentiment-agent";
import { contactSalesWorkflow } from "./workflows/contact-sales-workflow";

export const mastra = new Mastra({
  workflows: { contactSalesWorkflow },
  agents: { queryClassifierAgent, sentimentAgent },
  storage: new LibSQLStore({
    url: "file:./mastra.db",
  }),
});
