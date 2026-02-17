# AI Agent Guidelines (AGENTS.md)

This document outlines the rules and communication protocols for AI agents (like Antigravity) working on the **dbpeek** project.

## 1. Planning Before Coding

> [!IMPORTANT]
> **No code should be written without a detailed implementation plan first.**

- Before modifying or adding any feature, the agent must provide a step-by-step breakdown of the proposed implementation.
- This plan must be approved by the user or maintainer before the agent proceeds to execution.
- If a plan is rejected, the agent should iterate based on feedback.

## 2. Documentation Standards

Every new feature or major change must be documented.

- **Mandatory Documentation**: No PR or feature is considered complete without accompanying documentation.
- **Location**: Technical documentation must reside in the `docs/` folder.
- **Reference**: The `README.md` should link to the detailed documentation where appropriate.

## 3. Testing Requirements

Every feature must be verified.

- **Automated Tests**: New code should include tests (unit or integration) in the `tests/` folder.
- **Verification Logs**: After implementation, the agent must show proof of work (e.g., terminal output, test results, or screenshots).
- **Documentation of Verification**: The verification steps and results must be recorded in the `docs/` folder for that specific feature.

## 4. Folder Structure Consistency

Agents must respect the modular folder structure:

- `src/docker/`: Docker interaction
- `src/database/`: Database drivers
- `src/core/`: Orchestration
- `src/web/`: Web server/UI
- `src/utils/`: Formatting/Helpers

---

_By following these rules, we ensure that dbpeek remains maintainable, reliable, and easy to contribute to._
