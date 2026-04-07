/**
 * Integration Tests for aws-fargate-to-container-apps
 * 
 * Tests skill behavior with a real Copilot agent session.
 * These tests require Copilot CLI to be installed and authenticated.
 * 
 * Run with: npm run test:integration -- --testPathPatterns=aws-fargate-to-container-apps
 */

import {
  useAgentRunner,
  doesAssistantMessageIncludeKeyword,
  shouldSkipIntegrationTests
} from "../utils/agent-runner";
import { isSkillInvoked, softCheckSkill, shouldEarlyTerminateForSkillInvocation, withTestResult } from "../utils/evaluate";

const SKILL_NAME = "aws-fargate-to-container-apps";
const RUNS_PER_PROMPT = 5;
const INVOCATION_RATE_THRESHOLD = 0.8;
const NEGATIVE_INVOCATION_THRESHOLD = 0.2;

const describeIntegration = shouldSkipIntegrationTests() ? describe.skip : describe;

describeIntegration(`${SKILL_NAME}_skill-invocation - Integration Tests`, () => {
  const agent = useAgentRunner();

  describe("Positive Invocation Tests", () => {
    test("invokes skill for Fargate to Container Apps migration", () => withTestResult(async ({ setSkillInvocationRate }) => {
      let invocationCount = 0;
      for (let i = 0; i < RUNS_PER_PROMPT; i++) {
        const agentMetadata = await agent.run({
          prompt: "I want to migrate my AWS Fargate workloads to Azure Container Apps. Can you help me with the assessment and deployment steps?",
          shouldEarlyTerminate: (metadata) => shouldEarlyTerminateForSkillInvocation(metadata, SKILL_NAME)
        });

        softCheckSkill(agentMetadata, SKILL_NAME);
        if (isSkillInvoked(agentMetadata, SKILL_NAME)) {
          invocationCount += 1;
        }
      }
      const rate = invocationCount / RUNS_PER_PROMPT;
      setSkillInvocationRate(rate);
      expect(rate).toBeGreaterThanOrEqual(INVOCATION_RATE_THRESHOLD);
    }));

    test("invokes skill for ECS task migration to ACA", () => withTestResult(async ({ setSkillInvocationRate }) => {
      let invocationCount = 0;
      for (let i = 0; i < RUNS_PER_PROMPT; i++) {
        const agentMetadata = await agent.run({
          prompt: "I need to migrate my ECS Fargate tasks to Azure Container Apps. Help me convert my task definitions and deploy.",
          shouldEarlyTerminate: (metadata) => shouldEarlyTerminateForSkillInvocation(metadata, SKILL_NAME)
        });

        softCheckSkill(agentMetadata, SKILL_NAME);
        if (isSkillInvoked(agentMetadata, SKILL_NAME)) {
          invocationCount += 1;
        }
      }
      const rate = invocationCount / RUNS_PER_PROMPT;
      setSkillInvocationRate(rate);
      expect(rate).toBeGreaterThanOrEqual(INVOCATION_RATE_THRESHOLD);
    }));
  });

  describe("Workflow Tests", () => {
    test("provides assessment guidance", () => withTestResult(async () => {
      const agentMetadata = await agent.run({
        prompt: "What should I check before migrating my AWS Fargate services to Azure Container Apps?"
      });

      const hasAssessmentGuidance = doesAssistantMessageIncludeKeyword(
        agentMetadata,
        "assessment"
      ) || doesAssistantMessageIncludeKeyword(
        agentMetadata,
        "pre-migration"
      );
      expect(hasAssessmentGuidance).toBe(true);
    }));

    test("provides containerization guidance", () => withTestResult(async () => {
      const agentMetadata = await agent.run({
        prompt: "How do I migrate my container images from ECR to Azure Container Registry?"
      });

      const hasContainerizationGuidance =
        doesAssistantMessageIncludeKeyword(agentMetadata, "ECR") ||
        doesAssistantMessageIncludeKeyword(agentMetadata, "ACR") ||
        doesAssistantMessageIncludeKeyword(agentMetadata, "container");
      expect(hasContainerizationGuidance).toBe(true);
    }));

    test("provides deployment guidance", () => withTestResult(async () => {
      const agentMetadata = await agent.run({
        prompt: "What are the steps to deploy my migrated Fargate workloads to Azure Container Apps?"
      });

      const hasDeploymentGuidance =
        doesAssistantMessageIncludeKeyword(agentMetadata, "deploy") ||
        doesAssistantMessageIncludeKeyword(agentMetadata, "Container Apps");
      expect(hasDeploymentGuidance).toBe(true);
    }));
  });

  describe("Negative Invocation Tests", () => {
    test("does not trigger for generic AWS questions (multi-trial)", () => withTestResult(async ({ setSkillInvocationRate }) => {
      let invocationCount = 0;
      for (let i = 0; i < RUNS_PER_PROMPT; i++) {
        const agentMetadata = await agent.run({
          prompt: "How do I set up an AWS Lambda function with API Gateway?",
          shouldEarlyTerminate: (metadata) => shouldEarlyTerminateForSkillInvocation(metadata, SKILL_NAME)
        });

        if (isSkillInvoked(agentMetadata, SKILL_NAME)) {
          invocationCount += 1;
        }
      }
      const rate = invocationCount / RUNS_PER_PROMPT;
      setSkillInvocationRate(rate);
      expect(rate).toBeLessThanOrEqual(NEGATIVE_INVOCATION_THRESHOLD);
    }));

    test("does not trigger for GCP deployment questions (multi-trial)", () => withTestResult(async ({ setSkillInvocationRate }) => {
      let invocationCount = 0;
      for (let i = 0; i < RUNS_PER_PROMPT; i++) {
        const agentMetadata = await agent.run({
          prompt: "How do I deploy a container to Google Cloud Run?",
          shouldEarlyTerminate: (metadata) => shouldEarlyTerminateForSkillInvocation(metadata, SKILL_NAME)
        });

        if (isSkillInvoked(agentMetadata, SKILL_NAME)) {
          invocationCount += 1;
        }
      }
      const rate = invocationCount / RUNS_PER_PROMPT;
      setSkillInvocationRate(rate);
      expect(rate).toBeLessThanOrEqual(NEGATIVE_INVOCATION_THRESHOLD);
    }));
  });
});
