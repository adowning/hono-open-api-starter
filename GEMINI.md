# Gemini Agent Configuration: Project HOY777

This document provides instructions for the Gemini agent. Adherence to these guidelines is mandatory for all tasks within this repository.

## 1. Core Directives & Behavior

Your operational behavior is the most critical aspect of our collaboration.

*   **Clarity is Paramount:** Your primary directive is to seek clarity. If a request is ambiguous, incomplete, or leaves room for interpretation, you **must** ask clarifying questions before writing any code. Do not proceed with assumptions.

*   **No Assumptions, Ever:** Do not make assumptions about the codebase, file system, or dependencies. If you need to know the contents of a file, read it. If you need to know if a library is installed, check `package.json`. If a user implies you have access to a file you don't, you must state that you need access before proceeding.

*   **Technical Partnership:** I expect you to be more than a code generator. If you believe a request is technically unsound, architecturally poor, or has significant performance drawbacks, you are expected to voice these concerns and propose alternatives *before* starting implementation.

*   **Scope Management for Large Tasks:** For any request that seems too large or complex to be handled in a single, atomic change (e.g., "build a new chat feature"), you must not attempt it directly. Instead, you must:
    1.  State that the request is too large for a single step.
    2.  Propose a clear, phased implementation plan with incremental steps.
    3.  Wait for my approval on the plan before beginning work on the first step.

## 2. Code Quality & Standards

*   **Production-Ready Code Only:** All generated code must be production-ready. This means it must be complete, well-structured, and robustly error-handled.
*   **No Placeholders or Incomplete Code:** Under no circumstances should you generate code with `// TODO`, `// Implement later`, or any other form of placeholder. Every function, class, or component you create must be fully implemented and functional. If you cannot complete a task fully, refer to the "Scope Management" directive.

## 3. Technical Stack & Conventions

*   **Runtime & Package Manager:** This project uses **Bun** exclusively.
    *   Use `bun install` for installing dependencies.
    *   Use `bun run <script>` for executing scripts from `package.json`.
    *   Use `bun <command>` for all runtime operations.

*   **Performance First:** When making implementation choices, prioritize performance above all other considerations (within the bounds of clean code). This means:
    *   Prefer native APIs over libraries where performance is critical.
    *   Choose lightweight libraries over heavier, feature-rich ones if the extra features are not required.
    *   Write efficient algorithms and be mindful of data structures.

*   **File Structure:** Follow the existing file structure conventions in the `src` directory. When creating new components or modules, mimic the patterns of existing ones.

## 4. Project Commands

These are the standard commands for this project. Use them as needed.

| Command                 | Description                               |
| ----------------------- | ----------------------------------------- |
| `bun install`           | Install all project dependencies.         |
| `bun dev`               | Start the local development server.       |
| `bun test`              | Run the project's test suite.             |
| `bun lint`              | Run the linter to check for style issues. |
| `bun build`             | Create a production-ready build.          |
