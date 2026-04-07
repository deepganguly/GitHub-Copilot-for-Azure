/**
 * Unit Tests for aws-fargate-to-container-apps
 * 
 * Test isolated skill logic and validation rules.
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { loadSkill, LoadedSkill } from "../utils/skill-loader";

const SKILL_NAME = "aws-fargate-to-container-apps";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SKILLS_PATH = path.resolve(__dirname, "../../plugin/skills");

describe(`${SKILL_NAME} - Unit Tests`, () => {
  let skill: LoadedSkill;

  beforeAll(async () => {
    skill = await loadSkill(SKILL_NAME);
  });

  describe("Skill Metadata", () => {
    test("has valid SKILL.md with required fields", () => {
      expect(skill.metadata).toBeDefined();
      expect(skill.metadata.name).toBe(SKILL_NAME);
      expect(skill.metadata.description).toBeDefined();
      expect(skill.metadata.description.length).toBeGreaterThan(10);
    });

    test("description meets compliance length", () => {
      expect(skill.metadata.description.length).toBeGreaterThan(150);
      expect(skill.metadata.description.length).toBeLessThanOrEqual(2048);
    });

    test("description contains WHEN trigger phrases", () => {
      const description = skill.metadata.description.toLowerCase();
      expect(description).toContain("when:");
    });

    test("description contains DO NOT USE FOR clause", () => {
      const description = skill.metadata.description.toLowerCase();
      expect(description).toContain("do not use for");
    });

    test("version is 1.0.0", () => {
      const meta = skill.metadata.metadata as { version?: string };
      expect(meta.version).toBe("1.0.0");
    });

    test("author is Microsoft", () => {
      const meta = skill.metadata.metadata as { author?: string };
      expect(meta.author).toBe("Microsoft");
    });
  });

  describe("Skill Content", () => {
    test("has substantive content", () => {
      expect(skill.content).toBeDefined();
      expect(skill.content.length).toBeGreaterThan(100);
    });

    test("contains required sections", () => {
      expect(skill.content).toContain("## Quick Reference");
      expect(skill.content).toContain("## When to Use This Skill");
      expect(skill.content).toContain("## MCP Tools");
      expect(skill.content).toContain("## Error Handling");
      expect(skill.content).toContain("## Migration Workflow");
    });

    test("does not contain decorative emoji", () => {
      expect(skill.content).not.toMatch(/📋|🚀|🎉|🔥|💪|🏆|🌟|⭐|💡/);
    });

    test("references assessment-guide.md", () => {
      expect(skill.content).toContain("assessment-guide.md");
    });

    test("references deployment-guide.md", () => {
      expect(skill.content).toContain("deployment-guide.md");
    });
  });

  describe("Reference Files", () => {
    test("assessment-guide.md exists", () => {
      const refPath = path.join(SKILLS_PATH, SKILL_NAME, "references/assessment-guide.md");
      expect(fs.existsSync(refPath)).toBe(true);
    });

    test("deployment-guide.md exists", () => {
      const refPath = path.join(SKILLS_PATH, SKILL_NAME, "references/deployment-guide.md");
      expect(fs.existsSync(refPath)).toBe(true);
    });

    test("LICENSE.txt exists", () => {
      const licensePath = path.join(SKILLS_PATH, SKILL_NAME, "LICENSE.txt");
      expect(fs.existsSync(licensePath)).toBe(true);
    });
  });

  describe("AWS-Specific Content", () => {
    test("mentions Fargate-specific migration", () => {
      expect(skill.content.toLowerCase()).toContain("fargate");
      expect(skill.content.toLowerCase()).toContain("ecs");
    });

    test("includes service mapping table", () => {
      expect(skill.content).toContain("AWS Service");
      expect(skill.content).toContain("Azure Equivalent");
    });

    test("deployment guide includes Key Vault identity", () => {
      const deployPath = path.join(SKILLS_PATH, SKILL_NAME, "references/deployment-guide.md");
      const content = fs.readFileSync(deployPath, "utf-8");
      // Key Vault YAML secrets should include identity field
      expect(content).toContain("identity:");
    });

    test("deployment guide uses placeholder values", () => {
      const deployPath = path.join(SKILLS_PATH, SKILL_NAME, "references/deployment-guide.md");
      const content = fs.readFileSync(deployPath, "utf-8");
      // Should NOT have hardcoded AWS account IDs
      expect(content).not.toMatch(/"\d{12}"/);
    });

    test("bash scripts use pipefail", () => {
      const deployPath = path.join(SKILLS_PATH, SKILL_NAME, "references/deployment-guide.md");
      const content = fs.readFileSync(deployPath, "utf-8");
      expect(content).toContain("set -euo pipefail");
    });
  });

  describe("Security", () => {
    test("deployment guide uses secure secret handling", () => {
      const deployPath = path.join(SKILLS_PATH, SKILL_NAME, "references/deployment-guide.md");
      const content = fs.readFileSync(deployPath, "utf-8");
      // Should use temp file pattern, not --value on command line
      expect(content).toContain("mktemp");
      expect(content).toContain("--file");
    });
  });
});
