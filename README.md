# TryAngleTree (TAT) Playground

A canonical example of a **TAT-powered application**.

This project demonstrates how to build apps where:

- **TAT defines structure and behavior**
- **Projections define the interface**
- **JSX renders without interpreting meaning**

---

# What is TAT?

TryAngleTree (TAT) is a structural language for building systems as graphs.

It acts as a semantic layer between:

```

Data (structure) ↔ Meaning (UI)

```

Instead of writing logic directly in JavaScript, you:

1. Define structure and behavior in TAT
2. Execute that structure
3. Project it into UI-friendly formats
4. Render those projections

---

# Core Architecture

This diagram represents the core mental model of TAT:

```md
                  BRANCHES                     (UI / Meaning)
                      ▲
                      │
client  ─────────── <T@T> ─────────── server   (Projection / Surface)
                      │
                      ▼
                    ROOTS                      (Data / Engine)
```

```

TAT source
→ execute
→ projections
→ render
→ user interaction
→ update source
→ repeat

```

This project implements that loop through a **TatFeature system**.

---

# TatFeature Model

Each feature defines:

- **TAT source** → the semantic program
- **Projections** → what the UI can see
- **Renderers** → how projections are displayed
- **Interactions** → how user actions update source

Example features:

- Battle system
- Curriculum system

The app shell does not know about the domain.

It only knows:

- run the feature
- render projections
- apply updates

---

# Projection System

TAT produces structured projections:

| Projection | Purpose |
|----------|--------|
| `graph` | full structural state |
| `menu` | available actions |
| `detail` | focused node |
| `summary` | condensed info |
| `list` | related nodes |
| `tree` | hierarchical structure |
| `trace` | interaction history |
| `timeline` | human-readable events |

---

# Key Principle

> TAT owns meaning. JSX renders meaning.

JSX does not:
- interpret graph state
- infer semantics
- derive behavior

It only renders what TAT provides.

---

# Live Debugging (Core Feature)

One of the most powerful aspects of this system:

## Errors are visible in the UI

Instead of hidden console logs, errors are:

- returned from the TAT runtime
- rendered directly in the app
- updated in real time as code changes

### What this looks like

- Codex edits TAT → errors appear immediately
- Partial fixes → errors update live
- Final fix → errors disappear

The app never crashes.

The UI stays stable while semantics evolve.

---

# Why This Matters

This creates a completely different development experience:

## Traditional apps

```

edit → break → reload → debug → repeat

```

## TAT apps

```

edit → system updates → errors visible → refine → stabilize

````

You can literally **watch the system converge**.

---

# Why This App Feels Stable

The architecture enforces strict separation:

- TAT → structure + behavior
- projections → interface contract
- JSX → rendering only

This prevents:

- fragile coupling
- cascading UI failures
- hidden state assumptions

---

# Example

```tat
-> @apply(<heroNode.attack.goblinNode>)
````

Produces:

## Trace

```
Hero attack Goblin
```

## Timeline

```
Hero targeted Goblin with Attack
```

## Graph update

```
Goblin.hp = 0
status = defeated
```

All of this comes from TAT — not JSX.

---

# Folder Structure

```
src/app/
  features/        → TatFeatures (battle, curriculum)
  projections/     → shared renderers
  registry/        → feature + projection wiring
  hooks/           → TAT execution
  utils/           → helpers
```

Each feature contains:

```
feature/
  feature.js
  tat/
    source.tat
```

---

# Adding a New Feature

1. Create a `.tat` file
2. Define projections using `@project`
3. Create a feature file with:

   * source
   * tabs
   * projection bindings
   * interactions
4. Register the feature

No changes to the shell required.

---

# What Belongs Where

## In TAT

* structure
* relationships
* actions
* state transitions
* projections
* interaction history

## In JSX

* layout
* styling
* rendering projections

## In the Shell

* execution loop
* feature switching
* state orchestration

---

# Why TAT?

This project exists to answer one question:

> What if structure, behavior, and UI contracts were all defined in one place?

The result:

* less fragile code
* clearer mental model
* better AI collaboration
* live, observable systems

---

# Status

Phase 3 complete:

* trace → TAT-native
* timeline → TAT-native
* tree → TAT-native
* no JS-derived interaction history
* projections are the source of truth

Next: Phase 4 (documentation + refinement)

---

# Future Directions

* richer projection types
* event semantics (`@when`)
* conditional logic (`@if`)
* collection/option derivation
* domain-specific features (music, teaching, etc.)

---

# Final Thought

This is not just a demo.

It is a **reference implementation of a TAT-powered app**.

A system where:

* structure drives behavior
* behavior drives interface
* and the UI never breaks when the system evolves

```

---

# 💬 Why this README works

It captures exactly what you experienced:

- **fluid iteration**
- **visible debugging**
- **no breakage during change**
- **clear separation of concerns**

And it reinforces your core idea:

> TAT is the structural membrane between data and meaning