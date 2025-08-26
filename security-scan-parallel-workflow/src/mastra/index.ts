import { Mastra } from "@mastra/core/mastra";
import { PinoLogger } from "@mastra/loggers";
import { LibSQLStore } from "@mastra/libsql";
import { injectionScannerAgent } from "./agents/injection-scanner-agent";
import { secretsScannerAgent } from "./agents/secrets-scanner-agent";
import { summaryAgent } from "./agents/summary-agent";
import { securityScanWorkflow } from "./workflows/security-scan-workflow";

export const mastra = new Mastra({
  agents: { injectionScannerAgent, secretsScannerAgent, summaryAgent },
  workflows: { securityScanWorkflow },
  storage: new LibSQLStore({
    // stores telemetry, evals, ... into memory storage, if it needs to persist, change to file:../mastra.db
    url: ":memory:",
  }),
  logger: new PinoLogger({
    name: "Mastra",
    level: "info",
  }),
});
