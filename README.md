# TryAngleTree (TAT)

## Overview

TryAngleTree (TAT) is a structural language and runtime for building applications where **meaning, interaction, and state evolution are owned by the graph itself**, not by UI code.

TAT acts as the semantic layer between data and rendering:

```md
                  BRANCHES                     (UI / Meaning)
                      ▲
                      │
client  ─────────── <T@T> ─────────── server   (Projection / Surface)
                      │
                      ▼
                    ROOTS                      (Data / Engine)
```

* **ROOTS** → raw data + runtime execution
* **TAT** → structure + semantics + interaction
* **BRANCHES** → UI rendering (JSX, CSS, media)

---

## Core Principle

> **TAT owns meaning. JSX renders meaning.**

* TAT defines:

  * structure (nodes, edges)
  * state (state, meta)
  * valid interactions (`@action`, `@apply`)
  * projections (`@project`)

* JSX defines:

  * layout
  * styling
  * human-readable phrasing
  * media (images, sound, animation)

---

## The Runtime Model 

TAT  operates as a **true runtime system**, not just a compiled source loop.

### Canonical Interaction Flow

```txt
Author source once
→ create TAT runtime session
→ interact through runtime actions
→ regenerate projections
→ render UI
→ reset by reloading authored source
```

### What this means

* `.tat` files are **initial programs**, not mutable runtime state
* Runtime session becomes the **source of truth** during interaction
* UI actions call into the runtime directly
* No source string mutation occurs during interaction

---

## Authoring vs Runtime Modes

### Authoring Mode (Playground)

* edit `.tat` source
* run program
* inspect projections

### Runtime Mode (Applications)

* load `.tat` once
* create runtime session
* interact via actions
* projections update automatically

---

## TAT Language Basics

### Nodes

```tat
heroNode = <{ id: "hero", type: "character", name: "Hero" }>
```

### Edges

```tat
[heroNode : "can" : attackNode]
[heroNode : "targets" : goblinNode]
```

### Actions

```tat
attack := @action {
  guard:
    @query { node: to state: "hp" }
  pipeline:
    -> @graft.branch(from, "attacks", to)
    -> @graft.state(to, "hp", 0)
}
```

### Seed

```tat
@seed:
  nodes: [heroNode, goblinNode]
  edges: [...]
```

### Apply

```tat
@apply(<heroNode.attack.goblinNode>)
```

---

## Runtime API

### Create session

```ts
const session = createTatRuntimeSession(source);
```

### Apply action

```ts
applyTatAction(session, {
  graphBinding: "battle",
  from: "heroNode",
  action: "attack",
  target: "goblinNode",
});
```

### Inspect projections

```ts
inspectTatRuntimeSession(session);
```

---

## Projection System

TAT projections are fully runtime-owned.

### Supported formats

* `graph`
* `detail`
* `summary`
* `list`
* `menu`
* `tree`
* `trace`
* `timeline`

### Example

```tat
battleDetail = battle <> @project {
  format: "detail"
  focus: goblinNode
}
```

### Key idea

> Projections are **semantic views**, not UI transformations.

JSX does not interpret meaning — it only renders projection output.

---

## Interaction Model

```txt
UI → runtime action → mutate graph → reproject
```

This removes:

* regex-based source mutation
* duplicated logic in JS
* desynchronization between source and runtime

---

## Architectural Guarantees

TAT now guarantees:

### 1. Semantic Ownership

All meaning is defined in TAT:

* relationships
* actions
* state transitions
* projections

### 2. Deterministic Execution

Runtime applies actions directly to graph state.

### 3. Projection Contracts

Each format has strict output rules enforced at runtime.

### 4. UI Independence

UI does not interpret logic — it renders structured data.

---

## Example Mental Model

```txt
TAT = semantic grammar
JSX = expressive voice
```

Same meaning can be rendered as:

* Debug: `heroNode.attack.goblinNode`
* Teacher: `Hero attacked Goblin`
* Student: `You hit the Goblin`

---

## What TAT Is Not

TAT does NOT:

* render UI
* format human language
* manage layout
* control styling

These jobs belong to JSX/CSS.

---

## Current Status

### Completed

* Projection system fully TAT-native
* Runtime interaction API implemented
* No source mutation during interaction
* Feature system supports domain-specific graphs

### Next Areas

* further runtime ergonomics
* persistence / save state
* multi-session orchestration

---

## TAT App Development Workflow

Building a TAT-powered app differs from traditional app development in one key way:

> **You are not wiring UI to logic—you are observing and interacting with a live semantic system.**

### Traditional workflow

```txt
UI event → JS logic → state update → re-render
```

### TAT workflow

```txt
UI event → runtime action → graph mutation → projection update → render
```

### What this feels like in practice

* Clicking a button does not call arbitrary JS logic
* It dispatches a structured action into the runtime
* The runtime mutates the graph deterministically
* Projections immediately reflect the new state
* The UI updates without needing to interpret meaning

### Live mutation

A defining feature of TAT apps is that you can **watch the system evolve in real time**:

* Actions mutate graph state directly
* Timeline/trace projections update live
* Detail/summary/list reflect current semantic state
* No hidden state transformations exist in UI code

This creates a development experience where:

* bugs surface as structural inconsistencies, not UI glitches
* behavior is inspectable through projections
* the app becomes a transparent system, not a black box

### Mental shift

Instead of writing:

```js
if (hp <= 0) setStatus("defeated");
```

You define:

```tat
-> @graft.meta(target, "status", defeated)
```

And let projections express that meaning.

---

## Summary

TAT is a system where:

* **Structure defines meaning**
* **Actions evolve structure**
* **Projections expose meaning**
* **UI renders meaning**

In short:

> **TAT is not just compiled — it runs.**

---

## Why TAT?

This project exists to answer one question:

> What if structure, behavior, and UI contracts were all defined in one place?

The result:

* less fragile code
* clearer mental model
* better AI collaboration
* live, observable systems

---

## Future Directions

* richer projection types
* event semantics (`@when`)
* conditional logic (`@if`)
* collection/option derivation
* persistence / save state
* multi-session orchestration
* domain-specific features (music, teaching, etc.)

---

## Final Thought

This is not just a demo.

It is a **reference implementation of a TAT-powered app**:

* structure drives behavior
* behavior drives interface
* UI renders meaning without owning semantics
