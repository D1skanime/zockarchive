---
id: 261123-idc
title: Pydantic-ForwardRef-Namenskollision im PS3-Download-Startpfad beheben
status: complete
---

# Quick Plan

1. Reproduce the response-model and OpenAPI resolution through the actual Dev
   container runtime.
2. Replace the shadowed module alias with direct capability-schema bindings.
3. Cold-start the existing Dev app and verify backend OpenAPI plus Vite proxy.
