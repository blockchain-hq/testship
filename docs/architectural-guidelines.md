Architectural Guidelines
Philosophy

Don't add until needed. No library, pattern, or abstraction until the requirement is proven.
Keep it simple. Straightforward, minimal architecture. Prioritize readability and maintainability over cleverness.
Use boring technology. Modern and proven beats novel and exciting.
Build for the next 6 months, not the next 5 years. Avoid speculative complexity.
If it works and isn't causing pain, leave it alone. Refactor with purpose, not habit.

Code

Write for the stranger. Assume future-you or a teammate will inherit this code with zero context.
One way to do it. Pick one approach for state management, styling, error handling, etc. Enforce with linters. Consistency beats theoretical best practices.
Minimize dependencies. Each one is maintenance debt. Audit periodically.
Default to monorepo. Reduces cognitive overhead when juggling multiple concerns.

Testing

Protect the critical path. Write tests for what matters most and the parts that scare you.
Prefer integration tests. They often give better ROI than unit tests for small teams.

Documentation

Document decisions, not just how. A simple ADR in markdown is enough.
Keep docs next to the code. External wikis get stale.
README essentials. What is this? How do I run it? How do I deploy it?
Runbooks for incidents. Even bullet points help when things break at 2am.

Infrastructure & Operations

Prefer managed services. Your time is expensive. Self-host only when it clearly makes sense.
Automate deployments from day one. Even a shell script counts.
Observability over debugging. Set up logging, basic metrics, and alerts early.

Security

No secrets in code. Use environment variables or a secret manager.
Keep dependencies patched. Security updates are not optional.
Shared access to critical systems. All credentials in a password manager. Nothing lives only in one person's head.

Shipping

Ship small, ship often. Large PRs are where momentum goes to die.
When in doubt, ship and iterate. Perfectionism kills velocity at your scale.
Feature flags over long-lived branches. Merge to main frequently; hide unfinished work behind simple booleans.

Team

Optimize for context-switching. You're wearing many hats—reduce friction between tasks.
Share knowledge by default. If only one person can deploy or fix something, that's a risk.
