import { createWorkflow, createStep } from "@mastra/core/workflows";
import { z } from "zod";
import { secretsScannerAgent } from "../agents/secrets-scanner-agent";
import { injectionScannerAgent } from "../agents/injection-scanner-agent";
import { summaryAgent } from "../agents/summary-agent";

const vulnerabilitySchema = z.object({
  type: z.string(),
  severity: z.enum(["low", "medium", "high", "critical"]).optional(),
  recommendation: z.string().optional(),
});

const secretsScanStep = createStep({
  id: "secrets-scan",
  description: "Scans code for hardcoded secrets and credentials",
  inputSchema: z.object({
    codeFileText: z.string(),
  }),
  outputSchema: z.array(vulnerabilitySchema),
  execute: async ({ inputData }) => {
    const { object } = await secretsScannerAgent.generate(
      inputData.codeFileText,
      {
        output: z.array(vulnerabilitySchema),
      }
    );
    return object;
  },
});

const injectionScanStep = createStep({
  id: "injection-scan",
  description:
    "Scans code for SQL, command, and code injection vulnerabilities",
  inputSchema: z.object({
    codeFileText: z.string(),
  }),
  outputSchema: z.array(vulnerabilitySchema),
  execute: async ({ inputData }) => {
    const { object } = await injectionScannerAgent.generate(
      inputData.codeFileText,
      {
        output: z.array(vulnerabilitySchema),
      }
    );
    return object;
  },
});

const aggregateResultsStep = createStep({
  id: "aggregate-results",
  description: "Aggregates scan results and generates summary",
  inputSchema: z.object({
    "secrets-scan": z.array(vulnerabilitySchema),
    "injection-scan": z.array(vulnerabilitySchema),
  }),
  outputSchema: z.object({
    vulns: z.array(vulnerabilitySchema),
  }),
  execute: async ({ inputData }) => {

    const aggregate = [
      ...inputData["secrets-scan"],
      ...inputData["injection-scan"],
    ];
    const toStr = JSON.stringify(aggregate, null, 2);
    const summary = await summaryAgent.generate(toStr);

    return {
      safe: aggregate.length < 1,
      summary: summary.text,
      vulns: aggregate,
    };
  },
});

export const securityScanWorkflow = createWorkflow({
  id: "security-scan-workflow",
  description:
    "Parallel security scanning workflow for vulnerabilities and secrets",
  inputSchema: z.object({
    codeFileText: z.string(),
  }),
  outputSchema: z.array(vulnerabilitySchema),
})
.parallel([secretsScanStep, injectionScanStep])
.then(aggregateResultsStep)
.commit();