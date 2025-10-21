# Kernel C3: Canary • Contracts • Compliance
### An Architectural Demonstrator for MFE Governance at CNAF

This repository is a high-fidelity prototype designed for an **Architecte Expert Front-end Angular** role. It demonstrates a robust architectural foundation for a Micro-Frontend (MFE) ecosystem based on Native Federation, tailored to the high standards of the French public sector (CNAF).

The core mission of "Kernel C3" is to provide a "control tower" or governance layer that ensures a multi-team MFE environment remains **stable, secure, compliant, and performant**.

---

## 1. Architectural Vision

The Bureau Virtuel de l’Agent (BVA) platform needs to integrate multiple business applications developed by different teams. A Micro-Frontend architecture is a natural fit, but it introduces significant challenges in governance and orchestration.

**Kernel C3** proposes a solution where the central **Shell** application acts not just as an integrator, but as an active **governance kernel**. It enforces a set of rules—**Canary** deployment policies, inter-MFE **Contracts**, and **Compliance** checks—before an MFE is ever allowed to run.

 <!-- Placeholder for a real diagram -->

- **Shell (Host Application):** Orchestrates the layout, routing, and shared services (Auth, EventBus). It hosts the **Governance HUD**, the heart of the C3 kernel.
- **Remotes (MFEs):** Standalone Angular applications representing different business domains (e.g., 'Allocataire', 'Paiements'). They are loaded dynamically based on routing and governance policies.
- **Native Federation:** The underlying mechanism allowing the Shell to load remote applications at runtime without tight coupling at build time.

## 2. Key Features & Demonstrations

### C1: Canary Deployment & Rollback
- **Channel-based Routing:** The application uses dynamic, lazy-loaded routes to load either `stable` or `canary` versions of an MFE (e.g., `/paiements/stable` vs. `/paiements/canary`).
- **Circuit Breaker:** The MFE Loader implements a circuit breaker. If a canary deployment fails validation repeatedly, the circuit opens, and the loader will automatically **fall back to the stable version**, ensuring resilience.
- **Live Switching:** The UI allows for immediate switching between channels to compare versions and test new features in a controlled manner.

### C2: Inter-MFE Contracts
- **Static Contract Definition:** Each MFE statically defines its contract (`version`, `dependencies`, `eventsSupported`), allowing the Shell to inspect it *before* instantiation. This prevents runtime errors from incompatible MFEs.
- **Contract Version Guard:** The Shell enforces a `semver` compatibility range. An MFE with an incompatible contract version is blocked in `strict` mode.
- **Typed EventBus:** A singleton `EventBusService` allows for decoupled, type-safe communication between MFEs and the Shell. Events are automatically logged in the HUD for full visibility.

### C3: Compliance as Code
- **Policy Guards:** Before loading any MFE, the Kernel runs a series of guards:
  - **Performance Guard:** Checks simulated LCP and bundle size against budgets defined in the manifest.
  - **Accessibility (A11y) Guard:** Checks for a minimum number of critical violations (simulated via Axe-core).
  - **Security Guard:** Validates manifest integrity (JWS/SHA256 simulated) and provides a foundation for enforcing HTTP security policies.
- **Strict vs. Soft Mode:** The entire governance model can be toggled. `Strict` mode (for production) blocks any MFE violating a policy, while `Soft` mode (for staging) allows it to load but logs a warning.
- **Governance HUD:** A real-time "cockpit" displaying:
  - **Journal:** A live log of all system events, from MFE loading to contract validations and inter-MFE communications.
  - **Chaos Panel:** A toolkit for simulating failures (network latency, remote down, contract mismatch) to proactively test the system's resilience.
  - **Policy Inspector:** A view of all governance policies applied to each MFE.
  - **Dependency Inspector:** A simulation of a shared scope inspector, highlighting potential dependency duplication risks.

### Transverse Architectural Pillars
- **Dynamic Routing:** The entire application is orchestrated by `@angular/router`, using lazy-loaded components for optimal performance.
- **Authentication:** A simulated `AuthService` and `CanActivate` guard protect MFE routes, demonstrating a secure-by-design approach.
- **Shared UI Library:** A foundational `shared-ui` library (`CnafButtonComponent`) shows the path toward building a consistent Design System across all MFEs.

---

## 3. How to Run

1.  **Prerequisites:** Node.js LTS, Angular CLI.
2.  **Installation:** `npm install`
3.  **Development Server:** The application is configured to run in this development environment.

The Shell (Host) application will be available at `http://localhost:4200`.

---

## 4. CI/CD Industrialization Vision

While this project runs locally, it is designed with a clear vision for automation and industrialization in a real-world CI/CD pipeline.

1.  **MFE Build & Publish:**
    - When an MFE team pushes a new version (e.g., `paiements-v1.4.0`), the pipeline triggers.
    - It runs unit tests, linting, and an end-to-end test suite.
    - **Policy Scans:** Lighthouse (for performance) and Axe-core (for accessibility) are run against the built application. The results (e.g., `perf.json`, `a11y.json`) are archived.
    - **Manifest Generation:** A `manifest.json` entry is generated for this new version, including its version number, contract version, and the results of the policy scans.

2.  **Manifest Signing & Deployment:**
    - The generated bundle is uploaded to a CDN or artifact repository (e.g., S3, Artifactory). Its SHA256 hash is calculated.
    - The central `manifest.json` for the environment (e.g., `staging-manifest.json`) is updated with the new MFE's entry.
    - A signing script (like `tools/sign-manifest.ts`) uses a key from a secure vault (e.g., HashiCorp Vault, AWS KMS) to sign the updated manifest using JWS.
    - The signed manifest is uploaded, becoming the source of truth for the Shell application.

3.  **Shell Deployment:**
    - The Shell application is environment-aware. When deployed to staging, it fetches `staging-manifest.json`.
    - At runtime, it verifies the JWS signature of the manifest and the SHA256 hash of each MFE bundle it downloads, ensuring a secure supply chain from build to browser.

This automated process turns the "Compliance as Code" principles shown in the HUD into a fully governed, secure, and resilient deployment workflow.
