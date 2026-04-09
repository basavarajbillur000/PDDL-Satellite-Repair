/**
 * ════════════════════════════════════════════════════════════════════
 * PDDL Satellite Repair — Interactive Visualizer
 * P21: Logical Agents (PDDL) | Basavaraj Babasab Billur
 * ════════════════════════════════════════════════════════════════════
 * 
 * This application provides:
 * 1. PDDL plan simulation with step-by-step execution
 * 2. Interactive satellite schematic animation
 * 3. Real-time world state (predicate) tracking
 * 4. Plan metrics and analysis
 * 5. Workflow diagrams
 * 6. PDDL source code viewer with syntax highlighting
 */

// ═════════════════════════════════════════════════════════════════════
// DATA: Pre-computed plans (from pyperplan solver)
// ═════════════════════════════════════════════════════════════════════

const SCENARIOS = {
    scenario1: {
        id: "scenario1",
        name: "Basic Single-Panel Repair",
        description: "Robot navigates to solar wing, clears debris, grasps wrench, repairs one panel.",
        areas: ["docking-bay", "solar-wing-a"],
        tools: ["wrench"],
        panels: ["solar-panel-1"],
        robots: ["repair-bot"],
        connections: [["docking-bay", "solar-wing-a"]],
        initialState: {
            "robot-at(repair-bot,docking-bay)": true,
            "hand-free(repair-bot)": true,
            "tool-at(wrench,docking-bay)": true,
            "panel-in(solar-panel-1,solar-wing-a)": true,
            "panel-closed(solar-panel-1)": true,
            "panel-damaged(solar-panel-1)": true,
            "requires-tool(solar-panel-1,wrench)": true,
            "debris-present(solar-wing-a)": true,
            "debris-cleared(docking-bay)": true,
        },
        plan: [
            { action: "grasp-tool", params: ["repair-bot", "wrench", "docking-bay"], desc: "Robot grasps wrench at docking bay" },
            { action: "navigate", params: ["repair-bot", "docking-bay", "solar-wing-a"], desc: "Robot navigates from docking bay to solar wing A" },
            { action: "release-tool", params: ["repair-bot", "wrench", "solar-wing-a"], desc: "Robot releases wrench at solar wing A" },
            { action: "clear-debris", params: ["repair-bot", "solar-wing-a"], desc: "Robot clears debris at solar wing A" },
            { action: "make-panel-accessible", params: ["solar-panel-1", "solar-wing-a"], desc: "Solar panel 1 becomes accessible" },
            { action: "grasp-tool", params: ["repair-bot", "wrench", "solar-wing-a"], desc: "Robot grasps wrench at solar wing A" },
            { action: "open-panel", params: ["repair-bot", "solar-panel-1", "solar-wing-a"], desc: "Robot opens solar panel 1" },
            { action: "repair-panel", params: ["repair-bot", "solar-panel-1", "wrench", "solar-wing-a"], desc: "Robot repairs solar panel 1 using wrench" },
            { action: "close-panel", params: ["repair-bot", "solar-panel-1", "solar-wing-a"], desc: "Robot closes solar panel 1 — repair complete!" },
        ],
    },
    scenario2: {
        id: "scenario2",
        name: "Multi-Panel Repair Mission",
        description: "Robot repairs three panels across different areas with tool management.",
        areas: ["docking-bay", "solar-wing-a", "comm-module", "thermal-section"],
        tools: ["wrench", "screwdriver", "soldering-iron"],
        panels: ["solar-panel-1", "comm-panel", "thermal-panel"],
        robots: ["repair-bot"],
        connections: [
            ["docking-bay", "solar-wing-a"],
            ["docking-bay", "comm-module"],
            ["docking-bay", "thermal-section"],
            ["solar-wing-a", "comm-module"],
        ],
        initialState: {
            "robot-at(repair-bot,docking-bay)": true,
            "hand-free(repair-bot)": true,
            "tool-at(wrench,docking-bay)": true,
            "tool-at(screwdriver,docking-bay)": true,
            "tool-at(soldering-iron,docking-bay)": true,
            "panel-in(solar-panel-1,solar-wing-a)": true,
            "panel-closed(solar-panel-1)": true,
            "panel-damaged(solar-panel-1)": true,
            "requires-tool(solar-panel-1,wrench)": true,
            "panel-in(comm-panel,comm-module)": true,
            "panel-closed(comm-panel)": true,
            "panel-damaged(comm-panel)": true,
            "requires-tool(comm-panel,screwdriver)": true,
            "panel-in(thermal-panel,thermal-section)": true,
            "panel-closed(thermal-panel)": true,
            "panel-damaged(thermal-panel)": true,
            "requires-tool(thermal-panel,soldering-iron)": true,
            "debris-present(solar-wing-a)": true,
            "debris-present(comm-module)": true,
            "debris-cleared(thermal-section)": true,
            "debris-cleared(docking-bay)": true,
        },
        plan: [
            { action: "grasp-tool", params: ["repair-bot", "wrench", "docking-bay"], desc: "Robot grasps wrench at docking bay" },
            { action: "navigate", params: ["repair-bot", "docking-bay", "solar-wing-a"], desc: "Navigate to solar wing A" },
            { action: "release-tool", params: ["repair-bot", "wrench", "solar-wing-a"], desc: "Release wrench temporarily" },
            { action: "clear-debris", params: ["repair-bot", "solar-wing-a"], desc: "Clear debris at solar wing A" },
            { action: "make-panel-accessible", params: ["solar-panel-1", "solar-wing-a"], desc: "Solar panel 1 becomes accessible" },
            { action: "grasp-tool", params: ["repair-bot", "wrench", "solar-wing-a"], desc: "Re-grasp wrench" },
            { action: "open-panel", params: ["repair-bot", "solar-panel-1", "solar-wing-a"], desc: "Open solar panel 1" },
            { action: "repair-panel", params: ["repair-bot", "solar-panel-1", "wrench", "solar-wing-a"], desc: "Repair solar panel 1" },
            { action: "close-panel", params: ["repair-bot", "solar-panel-1", "solar-wing-a"], desc: "Close solar panel 1 ✓" },
            { action: "release-tool", params: ["repair-bot", "wrench", "solar-wing-a"], desc: "Release wrench" },
            { action: "navigate", params: ["repair-bot", "solar-wing-a", "comm-module"], desc: "Navigate to comm module" },
            { action: "clear-debris", params: ["repair-bot", "comm-module"], desc: "Clear debris at comm module" },
            { action: "make-panel-accessible", params: ["comm-panel", "comm-module"], desc: "Comm panel becomes accessible" },
            { action: "navigate", params: ["repair-bot", "comm-module", "docking-bay"], desc: "Return to docking bay for screwdriver" },
            { action: "grasp-tool", params: ["repair-bot", "screwdriver", "docking-bay"], desc: "Grasp screwdriver" },
            { action: "navigate", params: ["repair-bot", "docking-bay", "comm-module"], desc: "Navigate back to comm module" },
            { action: "open-panel", params: ["repair-bot", "comm-panel", "comm-module"], desc: "Open comm panel" },
            { action: "repair-panel", params: ["repair-bot", "comm-panel", "screwdriver", "comm-module"], desc: "Repair comm panel" },
            { action: "close-panel", params: ["repair-bot", "comm-panel", "comm-module"], desc: "Close comm panel ✓" },
            { action: "release-tool", params: ["repair-bot", "screwdriver", "comm-module"], desc: "Release screwdriver" },
            { action: "navigate", params: ["repair-bot", "comm-module", "docking-bay"], desc: "Return to docking bay" },
            { action: "grasp-tool", params: ["repair-bot", "soldering-iron", "docking-bay"], desc: "Grasp soldering iron" },
            { action: "navigate", params: ["repair-bot", "docking-bay", "thermal-section"], desc: "Navigate to thermal section" },
            { action: "make-panel-accessible", params: ["thermal-panel", "thermal-section"], desc: "Thermal panel becomes accessible" },
            { action: "open-panel", params: ["repair-bot", "thermal-panel", "thermal-section"], desc: "Open thermal panel" },
            { action: "repair-panel", params: ["repair-bot", "thermal-panel", "soldering-iron", "thermal-section"], desc: "Repair thermal panel" },
            { action: "close-panel", params: ["repair-bot", "thermal-panel", "thermal-section"], desc: "Close thermal panel ✓ — All repairs complete!" },
        ],
    },
    scenario3: {
        id: "scenario3",
        name: "Complex Multi-Step Mission",
        description: "Five panels, six areas, distributed tools — the ultimate planning challenge.",
        areas: ["docking-bay", "solar-wing-a", "solar-wing-b", "comm-module", "nav-bay", "power-hub"],
        tools: ["wrench", "screwdriver", "soldering-iron", "diagnostic-probe"],
        panels: ["solar-panel-1", "solar-panel-2", "comm-panel", "nav-panel", "power-regulator"],
        robots: ["repair-bot"],
        connections: [
            ["docking-bay", "solar-wing-a"],
            ["docking-bay", "comm-module"],
            ["docking-bay", "nav-bay"],
            ["solar-wing-a", "solar-wing-b"],
            ["comm-module", "nav-bay"],
            ["power-hub", "comm-module"],
            ["power-hub", "nav-bay"],
        ],
        initialState: {
            "robot-at(repair-bot,docking-bay)": true,
            "hand-free(repair-bot)": true,
            "tool-at(wrench,docking-bay)": true,
            "tool-at(screwdriver,docking-bay)": true,
            "tool-at(soldering-iron,comm-module)": true,
            "tool-at(diagnostic-probe,nav-bay)": true,
            "panel-in(solar-panel-1,solar-wing-a)": true, "panel-closed(solar-panel-1)": true, "panel-damaged(solar-panel-1)": true, "requires-tool(solar-panel-1,wrench)": true,
            "panel-in(solar-panel-2,solar-wing-b)": true, "panel-closed(solar-panel-2)": true, "panel-damaged(solar-panel-2)": true, "requires-tool(solar-panel-2,wrench)": true,
            "panel-in(comm-panel,comm-module)": true, "panel-closed(comm-panel)": true, "panel-damaged(comm-panel)": true, "requires-tool(comm-panel,screwdriver)": true,
            "panel-in(nav-panel,nav-bay)": true, "panel-closed(nav-panel)": true, "panel-damaged(nav-panel)": true, "requires-tool(nav-panel,diagnostic-probe)": true,
            "panel-in(power-regulator,power-hub)": true, "panel-closed(power-regulator)": true, "panel-damaged(power-regulator)": true, "requires-tool(power-regulator,soldering-iron)": true,
            "debris-present(solar-wing-a)": true,
            "debris-present(solar-wing-b)": true,
            "debris-present(comm-module)": true,
            "debris-present(power-hub)": true,
            "debris-cleared(docking-bay)": true,
            "debris-cleared(nav-bay)": true,
        },
        plan: [
            { action: "grasp-tool", params: ["repair-bot", "wrench", "docking-bay"], desc: "Grasp wrench at docking bay" },
            { action: "navigate", params: ["repair-bot", "docking-bay", "solar-wing-a"], desc: "Navigate to solar wing A" },
            { action: "release-tool", params: ["repair-bot", "wrench", "solar-wing-a"], desc: "Release wrench to free hand" },
            { action: "clear-debris", params: ["repair-bot", "solar-wing-a"], desc: "Clear debris at solar wing A" },
            { action: "make-panel-accessible", params: ["solar-panel-1", "solar-wing-a"], desc: "Solar panel 1 accessible" },
            { action: "grasp-tool", params: ["repair-bot", "wrench", "solar-wing-a"], desc: "Re-grasp wrench" },
            { action: "open-panel", params: ["repair-bot", "solar-panel-1", "solar-wing-a"], desc: "Open solar panel 1" },
            { action: "repair-panel", params: ["repair-bot", "solar-panel-1", "wrench", "solar-wing-a"], desc: "Repair solar panel 1" },
            { action: "close-panel", params: ["repair-bot", "solar-panel-1", "solar-wing-a"], desc: "Close solar panel 1 ✓" },
            { action: "navigate", params: ["repair-bot", "solar-wing-a", "solar-wing-b"], desc: "Move to solar wing B" },
            { action: "release-tool", params: ["repair-bot", "wrench", "solar-wing-b"], desc: "Release wrench" },
            { action: "clear-debris", params: ["repair-bot", "solar-wing-b"], desc: "Clear debris at solar wing B" },
            { action: "make-panel-accessible", params: ["solar-panel-2", "solar-wing-b"], desc: "Solar panel 2 accessible" },
            { action: "grasp-tool", params: ["repair-bot", "wrench", "solar-wing-b"], desc: "Re-grasp wrench" },
            { action: "open-panel", params: ["repair-bot", "solar-panel-2", "solar-wing-b"], desc: "Open solar panel 2" },
            { action: "repair-panel", params: ["repair-bot", "solar-panel-2", "wrench", "solar-wing-b"], desc: "Repair solar panel 2" },
            { action: "close-panel", params: ["repair-bot", "solar-panel-2", "solar-wing-b"], desc: "Close solar panel 2 ✓" },
            { action: "release-tool", params: ["repair-bot", "wrench", "solar-wing-b"], desc: "Release wrench" },
            { action: "navigate", params: ["repair-bot", "solar-wing-b", "solar-wing-a"], desc: "Navigate via solar wing A" },
            { action: "navigate", params: ["repair-bot", "solar-wing-a", "docking-bay"], desc: "Return to docking bay" },
            { action: "grasp-tool", params: ["repair-bot", "screwdriver", "docking-bay"], desc: "Grasp screwdriver" },
            { action: "navigate", params: ["repair-bot", "docking-bay", "comm-module"], desc: "Navigate to comm module" },
            { action: "release-tool", params: ["repair-bot", "screwdriver", "comm-module"], desc: "Release screwdriver" },
            { action: "clear-debris", params: ["repair-bot", "comm-module"], desc: "Clear debris at comm module" },
            { action: "make-panel-accessible", params: ["comm-panel", "comm-module"], desc: "Comm panel accessible" },
            { action: "grasp-tool", params: ["repair-bot", "screwdriver", "comm-module"], desc: "Re-grasp screwdriver" },
            { action: "open-panel", params: ["repair-bot", "comm-panel", "comm-module"], desc: "Open comm panel" },
            { action: "repair-panel", params: ["repair-bot", "comm-panel", "screwdriver", "comm-module"], desc: "Repair comm panel" },
            { action: "close-panel", params: ["repair-bot", "comm-panel", "comm-module"], desc: "Close comm panel ✓" },
            { action: "release-tool", params: ["repair-bot", "screwdriver", "comm-module"], desc: "Release screwdriver" },
            { action: "grasp-tool", params: ["repair-bot", "soldering-iron", "comm-module"], desc: "Grasp soldering iron (stored here)" },
            { action: "navigate", params: ["repair-bot", "comm-module", "nav-bay"], desc: "Navigate to nav bay" },
            { action: "release-tool", params: ["repair-bot", "soldering-iron", "nav-bay"], desc: "Temporarily store soldering iron" },
            { action: "make-panel-accessible", params: ["nav-panel", "nav-bay"], desc: "Nav panel accessible (no debris)" },
            { action: "grasp-tool", params: ["repair-bot", "diagnostic-probe", "nav-bay"], desc: "Grasp diagnostic probe" },
            { action: "open-panel", params: ["repair-bot", "nav-panel", "nav-bay"], desc: "Open nav panel" },
            { action: "repair-panel", params: ["repair-bot", "nav-panel", "diagnostic-probe", "nav-bay"], desc: "Repair nav panel" },
            { action: "close-panel", params: ["repair-bot", "nav-panel", "nav-bay"], desc: "Close nav panel ✓" },
            { action: "release-tool", params: ["repair-bot", "diagnostic-probe", "nav-bay"], desc: "Release diagnostic probe" },
            { action: "grasp-tool", params: ["repair-bot", "soldering-iron", "nav-bay"], desc: "Retrieve soldering iron" },
            { action: "navigate", params: ["repair-bot", "nav-bay", "power-hub"], desc: "Navigate to power hub" },
            { action: "release-tool", params: ["repair-bot", "soldering-iron", "power-hub"], desc: "Release soldering iron" },
            { action: "clear-debris", params: ["repair-bot", "power-hub"], desc: "Clear debris at power hub" },
            { action: "make-panel-accessible", params: ["power-regulator", "power-hub"], desc: "Power regulator accessible" },
            { action: "grasp-tool", params: ["repair-bot", "soldering-iron", "power-hub"], desc: "Re-grasp soldering iron" },
            { action: "open-panel", params: ["repair-bot", "power-regulator", "power-hub"], desc: "Open power regulator" },
            { action: "repair-panel", params: ["repair-bot", "power-regulator", "soldering-iron", "power-hub"], desc: "Repair power regulator" },
            { action: "close-panel", params: ["repair-bot", "power-regulator", "power-hub"], desc: "Close power regulator ✓ — ALL REPAIRS COMPLETE!" },
        ],
    },
};

// ═════════════════════════════════════════════════════════════════════
// PDDL SOURCE CODE (for code viewer)
// ═════════════════════════════════════════════════════════════════════

const PDDL_DOMAIN = `(define (domain satellite-repair)
  (:requirements :strips :typing :equality)
  
  (:types
    robot tool panel area
  )

  (:predicates
    ;; Spatial predicates
    (robot-at ?r - robot ?a - area)
    (tool-at ?t - tool ?a - area)
    (panel-in ?p - panel ?a - area)
    (connected ?a1 - area ?a2 - area)

    ;; Core predicates (task requirements)
    (tool-grasped ?t - tool ?r - robot)
    (panel-accessible ?p - panel)
    (debris-cleared ?a - area)

    ;; Robot state
    (hand-free ?r - robot)
    (debris-present ?a - area)

    ;; Panel state
    (panel-open ?p - panel)
    (panel-repaired ?p - panel)
    (panel-closed ?p - panel)
    (panel-damaged ?p - panel)
    (requires-tool ?p - panel ?t - tool)
    (panel-depends-on ?p1 - panel ?p2 - panel)
  )

  (:action navigate
    :parameters (?r - robot ?from - area ?to - area)
    :precondition (and
      (robot-at ?r ?from)
      (connected ?from ?to))
    :effect (and
      (robot-at ?r ?to)
      (not (robot-at ?r ?from))))

  (:action clear-debris
    :parameters (?r - robot ?a - area)
    :precondition (and
      (robot-at ?r ?a)
      (debris-present ?a)
      (hand-free ?r))
    :effect (and
      (debris-cleared ?a)
      (not (debris-present ?a))))

  (:action make-panel-accessible
    :parameters (?p - panel ?a - area)
    :precondition (and
      (panel-in ?p ?a)
      (debris-cleared ?a)
      (not (panel-accessible ?p)))
    :effect (panel-accessible ?p))

  (:action grasp-tool
    :parameters (?r - robot ?t - tool ?a - area)
    :precondition (and
      (robot-at ?r ?a)
      (tool-at ?t ?a)
      (hand-free ?r))
    :effect (and
      (tool-grasped ?t ?r)
      (not (hand-free ?r))
      (not (tool-at ?t ?a))))

  (:action release-tool
    :parameters (?r - robot ?t - tool ?a - area)
    :precondition (and
      (robot-at ?r ?a)
      (tool-grasped ?t ?r))
    :effect (and
      (tool-at ?t ?a)
      (hand-free ?r)
      (not (tool-grasped ?t ?r))))

  (:action open-panel
    :parameters (?r - robot ?p - panel ?a - area)
    :precondition (and
      (robot-at ?r ?a)
      (panel-in ?p ?a)
      (panel-accessible ?p)
      (panel-closed ?p))
    :effect (and
      (panel-open ?p)
      (not (panel-closed ?p))))

  (:action repair-panel
    :parameters (?r - robot ?p - panel ?t - tool ?a - area)
    :precondition (and
      (robot-at ?r ?a)
      (panel-in ?p ?a)
      (panel-open ?p)
      (panel-damaged ?p)
      (tool-grasped ?t ?r)
      (requires-tool ?p ?t))
    :effect (and
      (panel-repaired ?p)
      (not (panel-damaged ?p))))

  (:action close-panel
    :parameters (?r - robot ?p - panel ?a - area)
    :precondition (and
      (robot-at ?r ?a)
      (panel-in ?p ?a)
      (panel-open ?p)
      (panel-repaired ?p))
    :effect (and
      (panel-closed ?p)
      (not (panel-open ?p))))
)`;

const PDDL_PROBLEMS = {
    scenario1: `(define (problem basic-repair)
  (:domain satellite-repair)
  (:objects
    repair-bot - robot
    wrench - tool
    solar-panel-1 - panel
    docking-bay solar-wing-a - area)
  (:init
    (robot-at repair-bot docking-bay)
    (hand-free repair-bot)
    (tool-at wrench docking-bay)
    (panel-in solar-panel-1 solar-wing-a)
    (panel-closed solar-panel-1)
    (panel-damaged solar-panel-1)
    (requires-tool solar-panel-1 wrench)
    (debris-present solar-wing-a)
    (connected docking-bay solar-wing-a)
    (connected solar-wing-a docking-bay))
  (:goal (and
    (panel-repaired solar-panel-1)
    (panel-closed solar-panel-1))))`,
    scenario2: `(define (problem multi-panel-repair)
  (:domain satellite-repair)
  (:objects
    repair-bot - robot
    wrench screwdriver soldering-iron - tool
    solar-panel-1 comm-panel thermal-panel - panel
    docking-bay solar-wing-a comm-module thermal-section - area)
  (:init
    ;; ... 3 panels, 3 tools, 4 areas
    ;; See full source in domain files)
  (:goal (and
    (panel-repaired solar-panel-1) (panel-closed solar-panel-1)
    (panel-repaired comm-panel) (panel-closed comm-panel)
    (panel-repaired thermal-panel) (panel-closed thermal-panel))))`,
    scenario3: `(define (problem complex-mission)
  (:domain satellite-repair)
  (:objects
    repair-bot - robot
    wrench screwdriver soldering-iron diagnostic-probe - tool
    solar-panel-1 solar-panel-2 comm-panel nav-panel power-regulator - panel
    docking-bay solar-wing-a solar-wing-b comm-module nav-bay power-hub - area)
  (:init
    ;; ... 5 panels, 4 tools, 6 areas
    ;; See full source in domain files)
  (:goal (and
    (panel-repaired solar-panel-1) (panel-closed solar-panel-1)
    (panel-repaired solar-panel-2) (panel-closed solar-panel-2)
    (panel-repaired comm-panel) (panel-closed comm-panel)
    (panel-repaired nav-panel) (panel-closed nav-panel)
    (panel-repaired power-regulator) (panel-closed power-regulator))))`,
};

// ═════════════════════════════════════════════════════════════════════
// WORKFLOW DIAGRAMS
// ═════════════════════════════════════════════════════════════════════

const WORKFLOWS = {
    "pddl-workflow": `
<div class="workflow-diagram">
<span class="box">┌─────────────────────────────────────────────────────────────────────┐</span>
<span class="box">│</span>              <span class="highlight">PDDL PLANNING WORKFLOW — SATELLITE REPAIR</span>              <span class="box">│</span>
<span class="box">└─────────────────────────────────────────────────────────────────────┘</span>

  <span class="highlight">Step 1: Domain Modeling</span>
  <span class="box">┌──────────────────────────┐</span>
  <span class="box">│</span>   Define PDDL Domain     <span class="box">│</span>
  <span class="box">│</span>  ─────────────────────   <span class="box">│</span>
  <span class="box">│</span>  • Types: robot, tool,   <span class="box">│</span>
  <span class="box">│</span>    panel, area            <span class="box">│</span>
  <span class="box">│</span>  • 13 Predicates          <span class="box">│</span>
  <span class="box">│</span>  • 8 Actions              <span class="box">│</span>
  <span class="box">└────────────┬─────────────┘</span>
               <span class="arrow">│</span>
               <span class="arrow">▼</span>
  <span class="highlight">Step 2: Problem Specification</span>
  <span class="box">┌──────────────────────────┐</span>
  <span class="box">│</span>   Define Problem File    <span class="box">│</span>
  <span class="box">│</span>  ─────────────────────   <span class="box">│</span>
  <span class="box">│</span>  • Objects (instances)    <span class="box">│</span>
  <span class="box">│</span>  • Initial state (:init)  <span class="box">│</span>
  <span class="box">│</span>  • Goal state (:goal)     <span class="box">│</span>
  <span class="box">└────────────┬─────────────┘</span>
               <span class="arrow">│</span>
               <span class="arrow">▼</span>
  <span class="highlight">Step 3: Grounding</span>
  <span class="box">┌──────────────────────────┐</span>
  <span class="box">│</span>   Ground the Problem     <span class="box">│</span>
  <span class="box">│</span>  ─────────────────────   <span class="box">│</span>
  <span class="box">│</span>  • Instantiate actions    <span class="box">│</span>
  <span class="box">│</span>    with all valid params  <span class="box">│</span>
  <span class="box">│</span>  • Build state space      <span class="box">│</span>
  <span class="box">└────────────┬─────────────┘</span>
               <span class="arrow">│</span>
               <span class="arrow">▼</span>
  <span class="highlight">Step 4: Search (Planning)</span>
  <span class="box">┌──────────────────────────┐</span>
  <span class="box">│</span>   Greedy Best-First      <span class="box">│</span>
  <span class="box">│</span>   Search + FF Heuristic  <span class="box">│</span>
  <span class="box">│</span>  ─────────────────────   <span class="box">│</span>
  <span class="box">│</span>  • Explore state space    <span class="box">│</span>
  <span class="box">│</span>  • Find optimal path to   <span class="box">│</span>
  <span class="box">│</span>    goal state             <span class="box">│</span>
  <span class="box">└────────────┬─────────────┘</span>
               <span class="arrow">│</span>
               <span class="arrow">▼</span>
  <span class="highlight">Step 5: Plan Output</span>
  <span class="box">┌──────────────────────────┐</span>
  <span class="box">│</span>   Ordered Action Plan    <span class="box">│</span>
  <span class="box">│</span>  ─────────────────────   <span class="box">│</span>
  <span class="box">│</span>  1. grasp-tool            <span class="box">│</span>
  <span class="box">│</span>  2. navigate              <span class="box">│</span>
  <span class="box">│</span>  3. clear-debris          <span class="box">│</span>
  <span class="box">│</span>  4. ... → goal reached    <span class="box">│</span>
  <span class="box">└──────────────────────────┘</span>
</div>`,

    "integration-workflow": `
<div class="workflow-diagram">
<span class="box">┌─────────────────────────────────────────────────────────────────────┐</span>
<span class="box">│</span>        <span class="highlight">P21 ↔ P22 ↔ P29 INTEGRATION ARCHITECTURE</span>                  <span class="box">│</span>
<span class="box">└─────────────────────────────────────────────────────────────────────┘</span>

  <span class="highlight">DELIBERATIVE LAYER</span>
  <span class="box">┌────────────────────────────────────────────────────────────────┐</span>
  <span class="box">│</span>                                                                <span class="box">│</span>
  <span class="box">│</span>   <span class="highlight">P21: PDDL Task Planner</span>          <span class="highlight">P22: POMDP Planner</span>         <span class="box">│</span>
  <span class="box">│</span>   ┌──────────────────┐           ┌──────────────────┐         <span class="box">│</span>
  <span class="box">│</span>   │ • Domain model   │ <span class="arrow">──goal──▶</span> │ • Belief state   │         <span class="box">│</span>
  <span class="box">│</span>   │ • Problem spec   │ <span class="arrow">  seq.  </span> │ • Observation    │         <span class="box">│</span>
  <span class="box">│</span>   │ • Deterministic  │           │   model          │         <span class="box">│</span>
  <span class="box">│</span>   │   action plan    │ <span class="arrow">◀─state─</span> │ • Policy under   │         <span class="box">│</span>
  <span class="box">│</span>   │                  │ <span class="arrow"> trans. </span> │   uncertainty    │         <span class="box">│</span>
  <span class="box">│</span>   └────────┬─────────┘           └────────┬─────────┘         <span class="box">│</span>
  <span class="box">│</span>            <span class="arrow">│</span>                              <span class="arrow">│</span>                    <span class="box">│</span>
  <span class="box">└────────────┼──────────────────────────────┼────────────────────┘</span>
               <span class="arrow">│                              │</span>
               <span class="arrow">│  goal sequence               │  policy / next action</span>
               <span class="arrow">│  + state transitions         │</span>
               <span class="arrow">▼                              ▼</span>

  <span class="highlight">EXECUTIVE LAYER</span>
  <span class="box">┌────────────────────────────────────────────────────────────────┐</span>
  <span class="box">│</span>   <span class="highlight">P29: SMACH State Machine</span>                                     <span class="box">│</span>
  <span class="box">│</span>   ┌──────────────────────────────────────────────────────┐     <span class="box">│</span>
  <span class="box">│</span>   │                                                      │     <span class="box">│</span>
  <span class="box">│</span>   │  [IDLE] <span class="arrow">──▶</span> [NAVIGATE] <span class="arrow">──▶</span> [CLEAR_DEBRIS] <span class="arrow">──▶</span> ...    │     <span class="box">│</span>
  <span class="box">│</span>   │    <span class="arrow">▲</span>                                          <span class="arrow">│</span>      │     <span class="box">│</span>
  <span class="box">│</span>   │    <span class="arrow">└──────────── [MISSION_COMPLETE] ◀────────┘</span>      │     <span class="box">│</span>
  <span class="box">│</span>   │                                                      │     <span class="box">│</span>
  <span class="box">│</span>   │  • Maps PDDL actions to robot behaviors              │     <span class="box">│</span>
  <span class="box">│</span>   │  • Handles errors & recovery                         │     <span class="box">│</span>
  <span class="box">│</span>   │  • Monitors execution                                │     <span class="box">│</span>
  <span class="box">│</span>   └──────────────────────────────────────────────────────┘     <span class="box">│</span>
  <span class="box">└────────────────────────────────────────────────────────────────┘</span>

  <span class="highlight">KEY CONNECTIONS:</span>
  • P21 <span class="arrow">→</span> P22: PDDL plan provides deterministic goal sequence;
                POMDP adds uncertainty handling (sensor noise, partial obs.)
  • P21 <span class="arrow">→</span> P29: PDDL state transitions define the SMACH states
                and transition conditions for behavior execution
  • P22 <span class="arrow">→</span> P29: POMDP policy decides which SMACH state to activate
                under uncertain observations
</div>`,

    "state-transitions": `
<div class="workflow-diagram">
<span class="box">┌─────────────────────────────────────────────────────────────────────┐</span>
<span class="box">│</span>           <span class="highlight">SATELLITE REPAIR — STATE TRANSITION DIAGRAM</span>             <span class="box">│</span>
<span class="box">└─────────────────────────────────────────────────────────────────────┘</span>

  <span class="highlight">Per-Panel Repair State Machine:</span>

  ┌──────────┐    clear      ┌──────────┐   make       ┌──────────┐
  │ DEBRIS   │ <span class="arrow">──debris──▶</span>  │ AREA     │ <span class="arrow">─accessible▶</span>│ PANEL    │
  │ PRESENT  │              │ CLEARED  │              │ ACCESSIBLE│
  └──────────┘              └──────────┘              └─────┬─────┘
                                                            <span class="arrow">│</span>
                                                       open-panel
                                                            <span class="arrow">│</span>
                                                            <span class="arrow">▼</span>
  ┌──────────┐    close     ┌──────────┐   repair     ┌──────────┐
  │ REPAIR   │ <span class="arrow">◀──panel───</span>  │ PANEL    │ <span class="arrow">◀──panel───</span> │ PANEL    │
  │ COMPLETE │              │ REPAIRED │              │ OPEN     │
  └──────────┘              └──────────┘              └──────────┘


  <span class="highlight">Predicate Changes at Each Transition:</span>

  ┌─────────────────┬────────────────────┬───────────────────────┐
  │ Action          │ Predicates Added   │ Predicates Removed    │
  ├─────────────────┼────────────────────┼───────────────────────┤
  │ clear-debris    │ debris-cleared     │ debris-present        │
  │ make-accessible │ panel-accessible   │ —                     │
  │ grasp-tool      │ tool-grasped       │ hand-free, tool-at    │
  │ open-panel      │ panel-open         │ panel-closed          │
  │ repair-panel    │ panel-repaired     │ panel-damaged         │
  │ close-panel     │ panel-closed       │ panel-open            │
  │ release-tool    │ tool-at, hand-free │ tool-grasped          │
  │ navigate        │ robot-at(dest)     │ robot-at(source)      │
  └─────────────────┴────────────────────┴───────────────────────┘
</div>`,
};

// ═════════════════════════════════════════════════════════════════════
// APPLICATION STATE
// ═════════════════════════════════════════════════════════════════════

const APP = {
    currentScenario: "scenario1",
    currentStep: -1,
    isPlaying: false,
    playInterval: null,
    worldState: {},
    speed: 5,
};

// ═════════════════════════════════════════════════════════════════════
// SATELLITE LAYOUT CONFIGS
// ═════════════════════════════════════════════════════════════════════

const AREA_LAYOUTS = {
    scenario1: {
        "docking-bay": { x: 200, y: 180, w: 140, h: 100, label: "Docking Bay" },
        "solar-wing-a": { x: 440, y: 180, w: 140, h: 100, label: "Solar Wing A" },
    },
    scenario2: {
        "docking-bay": { x: 300, y: 50, w: 130, h: 85, label: "Docking Bay" },
        "solar-wing-a": { x: 100, y: 200, w: 130, h: 85, label: "Solar Wing A" },
        "comm-module": { x: 500, y: 200, w: 130, h: 85, label: "Comm Module" },
        "thermal-section": { x: 300, y: 300, w: 130, h: 85, label: "Thermal Section" },
    },
    scenario3: {
        "docking-bay": { x: 300, y: 30, w: 120, h: 70, label: "Docking Bay" },
        "solar-wing-a": { x: 80, y: 130, w: 120, h: 70, label: "Solar Wing A" },
        "solar-wing-b": { x: 80, y: 270, w: 120, h: 70, label: "Solar Wing B" },
        "comm-module": { x: 510, y: 130, w: 120, h: 70, label: "Comm Module" },
        "nav-bay": { x: 510, y: 270, w: 120, h: 70, label: "Nav Bay" },
        "power-hub": { x: 300, y: 330, w: 120, h: 70, label: "Power Hub" },
    },
};

// ═════════════════════════════════════════════════════════════════════
// INITIALIZATION
// ═════════════════════════════════════════════════════════════════════

document.addEventListener("DOMContentLoaded", () => {
    initScenarioCards();
    initPlaybackControls();
    initWorkflowTabs();
    initCodeTabs();
    loadScenario("scenario1");
});

function initScenarioCards() {
    document.querySelectorAll(".scenario-card").forEach(card => {
        card.addEventListener("click", () => {
            document.querySelectorAll(".scenario-card").forEach(c => c.classList.remove("active"));
            card.classList.add("active");
            loadScenario(card.dataset.scenario);
        });
    });
}

function initPlaybackControls() {
    document.getElementById("btn-play").addEventListener("click", togglePlay);
    document.getElementById("btn-next").addEventListener("click", stepForward);
    document.getElementById("btn-prev").addEventListener("click", stepBackward);
    document.getElementById("btn-reset").addEventListener("click", resetPlan);
    document.getElementById("speed-slider").addEventListener("input", (e) => {
        APP.speed = parseInt(e.target.value);
    });
}

function initWorkflowTabs() {
    document.querySelectorAll(".workflow-tab").forEach(tab => {
        tab.addEventListener("click", () => {
            document.querySelectorAll(".workflow-tab").forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            showWorkflow(tab.dataset.tab);
        });
    });
    showWorkflow("pddl-workflow");
}

function initCodeTabs() {
    document.querySelectorAll(".code-tab").forEach(tab => {
        tab.addEventListener("click", () => {
            document.querySelectorAll(".code-tab").forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            showCode(tab.dataset.code);
        });
    });
}

// ═════════════════════════════════════════════════════════════════════
// SCENARIO LOADING
// ═════════════════════════════════════════════════════════════════════

function loadScenario(scenarioId) {
    stopPlay();
    APP.currentScenario = scenarioId;
    APP.currentStep = -1;
    APP.worldState = { ...SCENARIOS[scenarioId].initialState };

    renderSatellite();
    renderPlanSteps();
    renderPredicates();
    renderMetrics();
    updateCurrentAction();
    updateProgress();
    showCode("domain");
}

// ═════════════════════════════════════════════════════════════════════
// SATELLITE SVG RENDERING
// ═════════════════════════════════════════════════════════════════════

function renderSatellite() {
    const scenario = SCENARIOS[APP.currentScenario];
    const layout = AREA_LAYOUTS[APP.currentScenario];
    const container = document.getElementById("satellite-container");

    let svg = `<svg viewBox="0 0 720 420" xmlns="http://www.w3.org/2000/svg">`;

    // Background grid
    svg += `<defs>
        <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.02)" stroke-width="0.5"/>
        </pattern>
        <radialGradient id="robotGlow">
            <stop offset="0%" stop-color="rgba(0,212,255,0.3)"/>
            <stop offset="100%" stop-color="rgba(0,212,255,0)"/>
        </radialGradient>
        <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
    </defs>
    <rect width="100%" height="100%" fill="url(#grid)"/>`;

    // Draw connections
    scenario.connections.forEach(([a, b]) => {
        const la = layout[a], lb = layout[b];
        if (la && lb) {
            svg += `<line class="sat-connection" 
                x1="${la.x + la.w/2}" y1="${la.y + la.h/2}" 
                x2="${lb.x + lb.w/2}" y2="${lb.y + lb.h/2}"/>`;
        }
    });

    // Draw areas
    Object.entries(layout).forEach(([areaId, pos]) => {
        const hasDebris = APP.worldState[`debris-present(${areaId})`];
        const robotHere = APP.worldState[`robot-at(repair-bot,${areaId})`];
        let classes = "sat-area";
        if (robotHere) classes += " has-robot";
        if (hasDebris) classes += " has-debris";

        svg += `<rect class="${classes}" x="${pos.x}" y="${pos.y}" width="${pos.w}" height="${pos.h}" rx="8"/>`;
        svg += `<text class="sat-area-label" x="${pos.x + pos.w/2}" y="${pos.y + 15}">${pos.label}</text>`;

        // Draw debris particles
        if (hasDebris) {
            for (let i = 0; i < 5; i++) {
                const dx = pos.x + 15 + Math.random() * (pos.w - 30);
                const dy = pos.y + 25 + Math.random() * (pos.h - 40);
                svg += `<circle class="sat-debris" cx="${dx}" cy="${dy}" r="${2 + Math.random() * 2}" style="animation-delay: ${i * 0.3}s"/>`;
            }
        }

        // Draw tools at this area
        scenario.tools.forEach((tool, ti) => {
            if (APP.worldState[`tool-at(${tool},${areaId})`]) {
                const tx = pos.x + 15 + (ti * 25);
                const ty = pos.y + pos.h - 18;
                svg += `<rect class="sat-tool" x="${tx}" y="${ty}" width="18" height="10" rx="2"/>`;
                svg += `<text class="sat-panel-label" x="${tx + 9}" y="${ty + 8}" fill="#ffd700" font-size="6">${tool.substring(0, 3)}</text>`;
            }
        });

        // Draw panels in this area
        scenario.panels.forEach((panel, pi) => {
            if (APP.worldState[`panel-in(${panel},${areaId})`]) {
                const px = pos.x + pos.w - 35 - (pi * 25);
                const py = pos.y + 22;
                let panelClass = "sat-panel";
                if (APP.worldState[`panel-repaired(${panel})`]) panelClass += " repaired";
                else if (APP.worldState[`panel-open(${panel})`]) panelClass += " open";
                else if (APP.worldState[`panel-damaged(${panel})`]) panelClass += " damaged";

                svg += `<rect class="${panelClass}" x="${px}" y="${py}" width="22" height="22" rx="3"/>`;
                const labelColor = APP.worldState[`panel-repaired(${panel})`] ? "#00ff88" : 
                                   APP.worldState[`panel-damaged(${panel})`] ? "#ff4057" : "#a78bfa";
                svg += `<text class="sat-panel-label" x="${px + 11}" y="${py + 14}" fill="${labelColor}" font-size="6">P${pi+1}</text>`;
            }
        });

        // Draw robot
        if (robotHere) {
            const rx = pos.x + pos.w / 2;
            const ry = pos.y + pos.h / 2 + 5;
            svg += `<circle cx="${rx}" cy="${ry}" r="25" fill="url(#robotGlow)"/>`;
            svg += `<circle class="sat-robot-body" cx="${rx}" cy="${ry}" r="10" filter="url(#glow)"/>`;
            svg += `<text class="sat-robot-label" x="${rx}" y="${ry + 3}" font-size="7">🤖</text>`;

            // Show held tool
            scenario.tools.forEach(tool => {
                if (APP.worldState[`tool-grasped(${tool},repair-bot)`]) {
                    svg += `<text x="${rx + 14}" y="${ry - 5}" font-size="7" fill="#ffd700" font-family="var(--font-mono)">🔧${tool.substring(0,3)}</text>`;
                }
            });
        }
    });

    svg += `</svg>`;
    container.innerHTML = svg;
}

// ═════════════════════════════════════════════════════════════════════
// PLAN STEPS RENDERING
// ═════════════════════════════════════════════════════════════════════

function renderPlanSteps() {
    const scenario = SCENARIOS[APP.currentScenario];
    const container = document.getElementById("plan-steps");

    container.innerHTML = scenario.plan.map((step, i) => {
        const status = i < APP.currentStep ? "completed" : i === APP.currentStep ? "active" : "pending";
        const cat = getCategoryClass(step.action);
        const catLabel = getCategoryLabel(step.action);
        return `<div class="plan-step ${status}" data-step="${i}" onclick="jumpToStep(${i})">
            <span class="step-num">${String(i + 1).padStart(2, '0')}</span>
            <span class="step-action">${step.desc}</span>
            <span class="step-category ${cat}">${catLabel}</span>
        </div>`;
    }).join("");
}

function getCategoryClass(action) {
    const map = {
        "navigate": "navigation",
        "clear-debris": "debris",
        "make-panel-accessible": "access",
        "grasp-tool": "tool",
        "release-tool": "tool",
        "open-panel": "panel",
        "repair-panel": "repair",
        "close-panel": "panel",
    };
    return map[action] || "";
}

function getCategoryLabel(action) {
    const map = {
        "navigate": "NAV",
        "clear-debris": "DEBRIS",
        "make-panel-accessible": "ACCESS",
        "grasp-tool": "TOOL",
        "release-tool": "TOOL",
        "open-panel": "PANEL",
        "repair-panel": "REPAIR",
        "close-panel": "PANEL",
    };
    return map[action] || action;
}

// ═════════════════════════════════════════════════════════════════════
// WORLD STATE / PREDICATE RENDERING
// ═════════════════════════════════════════════════════════════════════

function renderPredicates() {
    const container = document.getElementById("predicates-grid");
    const state = APP.worldState;

    // Group predicates by type
    const groups = {
        "Core (Task Required)": [],
        "Robot State": [],
        "Panel State": [],
        "Spatial": [],
    };

    Object.entries(state).forEach(([pred, val]) => {
        if (pred.startsWith("tool-grasped") || pred.startsWith("panel-accessible") || pred.startsWith("debris-cleared") || pred.startsWith("debris-present")) {
            groups["Core (Task Required)"].push({ pred, val });
        } else if (pred.startsWith("hand-free") || pred.startsWith("robot-at")) {
            groups["Robot State"].push({ pred, val });
        } else if (pred.startsWith("panel-")) {
            groups["Panel State"].push({ pred, val });
        } else {
            groups["Spatial"].push({ pred, val });
        }
    });

    let html = "";
    Object.entries(groups).forEach(([group, preds]) => {
        if (preds.length === 0) return;
        html += `<div style="grid-column: 1 / -1; margin-top: 8px; font-size: 0.7rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.06em;">${group}</div>`;
        preds.forEach(({ pred, val }) => {
            html += `<div class="predicate-item ${val ? 'true' : 'false'}">
                <span class="pred-indicator"></span>
                <span>${pred}</span>
            </div>`;
        });
    });

    container.innerHTML = html;
}

// ═════════════════════════════════════════════════════════════════════
// METRICS RENDERING
// ═════════════════════════════════════════════════════════════════════

function renderMetrics() {
    const scenario = SCENARIOS[APP.currentScenario];
    const plan = scenario.plan;

    // Count actions
    const counts = {};
    plan.forEach(s => { counts[s.action] = (counts[s.action] || 0) + 1; });

    const navSteps = counts["navigate"] || 0;
    const repairSteps = counts["repair-panel"] || 0;
    const totalSteps = plan.length;
    const efficiency = ((repairSteps / totalSteps) * 100).toFixed(1);

    document.getElementById("metrics-grid").innerHTML = `
        <div class="metric-card">
            <div class="metric-value">${totalSteps}</div>
            <div class="metric-label">Total Steps</div>
        </div>
        <div class="metric-card">
            <div class="metric-value">${repairSteps}</div>
            <div class="metric-label">Repairs Made</div>
        </div>
        <div class="metric-card">
            <div class="metric-value">${efficiency}%</div>
            <div class="metric-label">Efficiency</div>
        </div>
        <div class="metric-card">
            <div class="metric-value">${navSteps}</div>
            <div class="metric-label">Navigation</div>
        </div>
        <div class="metric-card">
            <div class="metric-value">${counts["clear-debris"] || 0}</div>
            <div class="metric-label">Debris Cleared</div>
        </div>
        <div class="metric-card">
            <div class="metric-value">${(counts["grasp-tool"] || 0) + (counts["release-tool"] || 0)}</div>
            <div class="metric-label">Tool Ops</div>
        </div>
    `;

    // Draw simple bar chart
    renderActionChart(counts);
}

function renderActionChart(counts) {
    const canvas = document.getElementById("action-chart");
    const ctx = canvas.getContext("2d");

    // Set canvas size
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = 200;

    const actions = Object.keys(counts);
    const values = Object.values(counts);
    const maxVal = Math.max(...values);

    const barWidth = Math.min(60, (canvas.width - 40) / actions.length - 10);
    const chartHeight = canvas.height - 50;
    const startX = (canvas.width - (barWidth + 10) * actions.length) / 2;

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Colors for each action
    const colors = {
        "navigate": "#3b82f6",
        "clear-debris": "#ff8a00",
        "make-panel-accessible": "#00d4ff",
        "grasp-tool": "#ffd700",
        "release-tool": "#ffaa00",
        "open-panel": "#7b2fff",
        "repair-panel": "#00ff88",
        "close-panel": "#a78bfa",
    };

    actions.forEach((action, i) => {
        const x = startX + i * (barWidth + 10);
        const barH = (values[i] / maxVal) * (chartHeight - 20);
        const y = chartHeight - barH;

        // Bar
        const color = colors[action] || "#888";
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barH, 4);
        ctx.fill();

        // Value
        ctx.fillStyle = "#e8eaf6";
        ctx.font = "bold 12px Inter";
        ctx.textAlign = "center";
        ctx.fillText(values[i], x + barWidth / 2, y - 5);

        // Label (abbreviated)
        ctx.fillStyle = "#5a6380";
        ctx.font = "9px Inter";
        ctx.save();
        ctx.translate(x + barWidth / 2, chartHeight + 8);
        ctx.rotate(-0.4);
        ctx.textAlign = "right";
        ctx.fillText(action.replace("-", " "), 0, 0);
        ctx.restore();
    });
}

// ═════════════════════════════════════════════════════════════════════
// PLAN EXECUTION ENGINE
// ═════════════════════════════════════════════════════════════════════

function applyAction(step) {
    const state = APP.worldState;
    const { action, params } = step;

    switch (action) {
        case "navigate":
            state[`robot-at(${params[0]},${params[2]})`] = true;
            state[`robot-at(${params[0]},${params[1]})`] = false;
            break;

        case "clear-debris":
            state[`debris-cleared(${params[1]})`] = true;
            state[`debris-present(${params[1]})`] = false;
            break;

        case "make-panel-accessible":
            state[`panel-accessible(${params[0]})`] = true;
            break;

        case "grasp-tool":
            state[`tool-grasped(${params[1]},${params[0]})`] = true;
            state[`hand-free(${params[0]})`] = false;
            state[`tool-at(${params[1]},${params[2]})`] = false;
            break;

        case "release-tool":
            state[`tool-at(${params[1]},${params[2]})`] = true;
            state[`hand-free(${params[0]})`] = true;
            state[`tool-grasped(${params[1]},${params[0]})`] = false;
            break;

        case "open-panel":
            state[`panel-open(${params[1]})`] = true;
            state[`panel-closed(${params[1]})`] = false;
            break;

        case "repair-panel":
            state[`panel-repaired(${params[1]})`] = true;
            state[`panel-damaged(${params[1]})`] = false;
            break;

        case "close-panel":
            state[`panel-closed(${params[1]})`] = true;
            state[`panel-open(${params[1]})`] = false;
            break;
    }
}

function stepForward() {
    const scenario = SCENARIOS[APP.currentScenario];
    if (APP.currentStep >= scenario.plan.length - 1) {
        stopPlay();
        return;
    }
    APP.currentStep++;
    applyAction(scenario.plan[APP.currentStep]);
    updateUI();
}

function stepBackward() {
    if (APP.currentStep < 0) return;
    // Reset and replay up to previous step
    const targetStep = APP.currentStep - 1;
    resetState();
    for (let i = 0; i <= targetStep; i++) {
        APP.currentStep = i;
        applyAction(SCENARIOS[APP.currentScenario].plan[i]);
    }
    APP.currentStep = targetStep;
    updateUI();
}

function jumpToStep(stepIndex) {
    resetState();
    const scenario = SCENARIOS[APP.currentScenario];
    for (let i = 0; i <= stepIndex; i++) {
        APP.currentStep = i;
        applyAction(scenario.plan[i]);
    }
    APP.currentStep = stepIndex;
    updateUI();
}

function resetPlan() {
    stopPlay();
    resetState();
    APP.currentStep = -1;
    updateUI();
}

function resetState() {
    APP.worldState = { ...SCENARIOS[APP.currentScenario].initialState };
}

function togglePlay() {
    if (APP.isPlaying) {
        stopPlay();
    } else {
        startPlay();
    }
}

function startPlay() {
    const scenario = SCENARIOS[APP.currentScenario];
    if (APP.currentStep >= scenario.plan.length - 1) {
        resetPlan();
    }
    APP.isPlaying = true;
    document.getElementById("play-icon").style.display = "none";
    document.getElementById("pause-icon").style.display = "block";

    APP.playInterval = setInterval(() => {
        stepForward();
        if (APP.currentStep >= scenario.plan.length - 1) {
            stopPlay();
        }
    }, 2000 / APP.speed);
}

function stopPlay() {
    APP.isPlaying = false;
    document.getElementById("play-icon").style.display = "block";
    document.getElementById("pause-icon").style.display = "none";
    if (APP.playInterval) {
        clearInterval(APP.playInterval);
        APP.playInterval = null;
    }
}

function updateUI() {
    renderSatellite();
    renderPlanSteps();
    renderPredicates();
    updateCurrentAction();
    updateProgress();
}

function updateCurrentAction() {
    const scenario = SCENARIOS[APP.currentScenario];
    const iconEl = document.getElementById("action-icon");
    const nameEl = document.getElementById("action-name");
    const descEl = document.getElementById("action-desc");

    if (APP.currentStep < 0) {
        iconEl.textContent = "⏸";
        nameEl.textContent = "Ready to begin";
        descEl.textContent = `${scenario.name} — ${scenario.plan.length} steps planned`;
        return;
    }

    if (APP.currentStep >= scenario.plan.length) {
        iconEl.textContent = "✅";
        nameEl.textContent = "Mission Complete!";
        descEl.textContent = "All panels repaired successfully";
        return;
    }

    const step = scenario.plan[APP.currentStep];
    const icons = {
        "navigate": "🚀",
        "clear-debris": "🧹",
        "make-panel-accessible": "🔓",
        "grasp-tool": "🔧",
        "release-tool": "📦",
        "open-panel": "📂",
        "repair-panel": "⚡",
        "close-panel": "📁",
    };

    iconEl.textContent = icons[step.action] || "⚙️";
    nameEl.textContent = step.action;
    descEl.textContent = step.desc;
}

function updateProgress() {
    const scenario = SCENARIOS[APP.currentScenario];
    const total = scenario.plan.length;
    const pct = total > 0 ? ((APP.currentStep + 1) / total * 100) : 0;
    document.getElementById("progress-bar").style.width = Math.max(0, pct) + "%";
    document.getElementById("step-counter").textContent = `Step ${Math.max(0, APP.currentStep + 1)} / ${total}`;

    // Scroll active step into view
    const activeStep = document.querySelector(".plan-step.active");
    if (activeStep) {
        activeStep.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
}

// ═════════════════════════════════════════════════════════════════════
// WORKFLOW DIAGRAMS
// ═════════════════════════════════════════════════════════════════════

function showWorkflow(tabId) {
    document.getElementById("workflow-content").innerHTML = WORKFLOWS[tabId] || "";
}

// ═════════════════════════════════════════════════════════════════════
// CODE VIEWER WITH SYNTAX HIGHLIGHTING
// ═════════════════════════════════════════════════════════════════════

function showCode(type) {
    const codeEl = document.getElementById("code-content");
    let code = "";

    switch (type) {
        case "domain":
            code = PDDL_DOMAIN;
            break;
        case "problem":
            code = PDDL_PROBLEMS[APP.currentScenario] || "";
            break;
        case "solution":
            const scenario = SCENARIOS[APP.currentScenario];
            code = `; Solution for ${scenario.name}\n; Total steps: ${scenario.plan.length}\n\n`;
            scenario.plan.forEach((step, i) => {
                code += `${String(i + 1).padStart(2, '0')}. (${step.action} ${step.params.join(" ")})\n`;
            });
            break;
    }

    codeEl.innerHTML = highlightPDDL(code);
}

function highlightPDDL(code) {
    return code
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        // Comments
        .replace(/(;.*)/g, '<span class="comment">$1</span>')
        // Keywords
        .replace(/(:requirements|:strips|:typing|:equality|:types|:predicates|:action|:parameters|:precondition|:effect|:objects|:init|:goal|:domain|define|domain|problem)/g, '<span class="keyword">$1</span>')
        // Action names
        .replace(/\b(navigate|clear-debris|make-panel-accessible|grasp-tool|release-tool|open-panel|repair-panel|close-panel)\b/g, '<span class="action-name">$1</span>')
        // Types
        .replace(/\b(robot|tool|panel|area)\b(?!\))/g, '<span class="type">$1</span>')
        // Variables
        .replace(/(\?[a-z0-9_-]+)/g, '<span class="param">$1</span>')
        // Predicates
        .replace(/\b(robot-at|tool-at|panel-in|connected|tool-grasped|panel-accessible|debris-cleared|hand-free|debris-present|panel-open|panel-repaired|panel-closed|panel-damaged|requires-tool|panel-depends-on)\b/g, '<span class="predicate">$1</span>');
}

// Show domain code on init
document.addEventListener("DOMContentLoaded", () => {
    showCode("domain");
});

// Handle window resize for chart
window.addEventListener("resize", () => {
    const scenario = SCENARIOS[APP.currentScenario];
    const counts = {};
    scenario.plan.forEach(s => { counts[s.action] = (counts[s.action] || 0) + 1; });
    renderActionChart(counts);
});
