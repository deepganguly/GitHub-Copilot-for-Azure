/**
 * Unit Tests for k8s-to-container-apps
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { loadSkill, LoadedSkill } from "../utils/skill-loader";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SKILL_NAME = "k8s-to-container-apps";
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

    test("has MIT license", () => {
      expect(skill.metadata.license).toBe("MIT");
    });

    test("version is 1.0.0", () => {
      const meta = skill.metadata.metadata as Record<string, string>;
      expect(meta.version).toBe("1.0.0");
    });

    test("author is Microsoft", () => {
      const meta = skill.metadata.metadata as Record<string, string>;
      expect(meta.author).toBe("Microsoft");
    });
  });

  describe("Skill Content Structure", () => {
    test("has Quick Reference section", () => {
      expect(skill.content).toContain("## Quick Reference");
    });

    test("has When to Use This Skill section", () => {
      expect(skill.content).toContain("## When to Use This Skill");
    });

    test("has MCP Tools section with parameters", () => {
      expect(skill.content).toContain("## MCP Tools");
      expect(skill.content).toContain("Parameters");
      expect(skill.content).toContain("Required");
    });

    test("has Error Handling section with resolutions", () => {
      expect(skill.content).toContain("## Error Handling");
      expect(skill.content).toContain("Resolution");
    });

    test("references assessment guide", () => {
      expect(skill.content).toContain("assessment-guide.md");
    });

    test("references deployment guide", () => {
      expect(skill.content).toContain("deployment-guide.md");
    });
  });

  describe("Kubernetes-Specific Content", () => {
    test("mentions k8s migration", () => {
      expect(skill.content.toLowerCase()).toContain("kubernetes");
    });

    test("addresses container orchestration", () => {
      expect(skill.content.toLowerCase()).toContain("container apps");
    });

    test("mentions common k8s concepts", () => {
      const content = skill.content.toLowerCase();
      expect(content).toMatch(/deployment|statefulset|daemonset/);
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

    test("deployment guide includes PowerShell equivalents", () => {
      const deployPath = path.join(SKILLS_PATH, SKILL_NAME, "references/deployment-guide.md");
      const content = fs.readFileSync(deployPath, "utf-8");
      expect(content.toLowerCase()).toContain("powershell");
    });
  });
});
