---
name: gcp-cloudrun-to-container-apps
description: "Migrate Cloud Run to Azure Container Apps with assessment and deployment. WHEN: migrate Cloud Run to Container Apps, Cloud Run to Azure, convert Cloud Run to ACA, Cloud Run migration. DO NOT USE FOR: general GCP migration (use azure-cloud-migrate), new Container Apps (use azure-prepare), Kubernetes (use k8s-to-container-apps)."
license: MIT
metadata:
  version: "1.0.0"
  author: Microsoft
---

# Google Cloud Run to Azure Container Apps

## Quick Reference

| Item | Details |
|------|---------|
| **Source/Target** | Cloud Run → Container Apps |
| **Steps** | Assess → Images → Config → Deploy |
| **Tools** | `gcloud`, `az acr`, `az containerapp` |
| **Docs** | [assessment-guide.md](references/assessment-guide.md), [deployment-guide.md](references/deployment-guide.md) |

## When to Use This Skill

Migrate Cloud Run serverless containers to Azure Container Apps.

## Rules

1. Follow: assessment → images → config → deployment
2. Create assessment report; output to `<source>-azure/`
3. Never modify source GCP files

## Inputs

Cloud Run location, target sub/RG/region, VNet (yes/no), scaling (min/max)

## Migration Workflow

**Phase 1: Assessment** — Analyze config ([assessment-guide.md](references/assessment-guide.md))

**Phase 2: Image Migration** — GCR/Artifact Registry → ACR

**Phase 3: Configuration** — Convert YAML, secrets → Key Vault, IaC

**Phase 4: Deployment** — Container Apps, ingress/scaling ([deployment-guide.md](references/deployment-guide.md))

## MCP Tools

| Tool | Parameters | Required | Example |
|------|-----------|----------|---------|
| `mcp_azure_mcp_documentation` | `resource: "container-apps"` | Yes | `await mcp_azure_mcp_documentation({resource: "container-apps", topic: "ingress"})` |
| `mcp_azure_mcp_get_bestpractices` | `resource: "container-apps"`, `action: "deploy"` | Yes | `await mcp_azure_mcp_get_bestpractices({resource: "container-apps", action: "deploy"})` |

## Error Handling

| Error | Message Contains | Resolution |
|-------|------------------|------------|
| ACR auth failure | "unauthorized" | Run `az acr login --name <acr>` or verify managed identity ACRPull role |
| Key Vault access denied | "forbidden" | Grant managed identity Key Vault Secrets User role or set-policy |
| Environment exists | "already exists" | Use existing environment or choose a different name |
| Image pull failure | "ImagePullBackOff" | Verify image exists in ACR and registry credentials are configured |

## Done

Ask: **"Test or optimize costs?"**
