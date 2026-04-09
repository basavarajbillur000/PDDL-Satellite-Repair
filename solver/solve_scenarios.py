"""
PDDL Satellite Repair — Scenario Solver & Analyzer
====================================================
Author: Basavaraj Babasab Billur (P21)
Course: AI in Autonomous Systems

This script uses pyperplan to solve all three satellite repair scenarios
and exports detailed analysis data (JSON) for the web visualizer.

Usage:
    pip install pyperplan
    python solve_scenarios.py
"""

import os
import sys
import json
import time
from pathlib import Path

# Try importing pyperplan
try:
    import pyperplan
    from pyperplan.planner import (
        search_plan,
        SEARCHES,
        HEURISTICS,
    )
    from pyperplan.pddl.parser import Parser
    from pyperplan.grounding import ground
    HAS_PYPERPLAN = True
except ImportError:
    HAS_PYPERPLAN = False
    print("WARNING: pyperplan not found. Install with: pip install pyperplan")
    print("Running in demo mode with pre-computed plans.\n")


# ─── Configuration ───────────────────────────────────────────────────────────

PDDL_DIR = Path(__file__).parent.parent / "pddl"
OUTPUT_DIR = Path(__file__).parent.parent / "web" / "data"

SCENARIOS = [
    {
        "id": "scenario1",
        "name": "Basic Single-Panel Repair",
        "domain": PDDL_DIR / "satellite_repair_domain.pddl",
        "problem": PDDL_DIR / "scenario1_basic_repair.pddl",
        "description": "Robot navigates to solar wing, clears debris, grasps wrench, repairs one panel."
    },
    {
        "id": "scenario2",
        "name": "Multi-Panel Repair Mission",
        "domain": PDDL_DIR / "satellite_repair_domain.pddl",
        "problem": PDDL_DIR / "scenario2_multi_panel.pddl",
        "description": "Robot repairs three panels across different areas with tool management."
    },
    {
        "id": "scenario3",
        "name": "Complex Multi-Step Mission",
        "domain": PDDL_DIR / "satellite_repair_domain.pddl",
        "problem": PDDL_DIR / "scenario3_complex_mission.pddl",
        "description": "Five panels, six areas, distributed tools, heavy debris — the ultimate test."
    },
]

# Pre-computed plans (fallback if pyperplan is not available)
PRECOMPUTED_PLANS = {
    "scenario1": [
        "(grasp-tool repair-bot wrench docking-bay)",
        "(navigate repair-bot docking-bay solar-wing-a)",
        "(clear-debris repair-bot solar-wing-a)",
        "(release-tool repair-bot wrench solar-wing-a)",
        "(make-panel-accessible solar-panel-1 solar-wing-a)",
        "(grasp-tool repair-bot wrench solar-wing-a)",
        "(open-panel repair-bot solar-panel-1 solar-wing-a)",
        "(repair-panel repair-bot solar-panel-1 wrench solar-wing-a)",
        "(close-panel repair-bot solar-panel-1 solar-wing-a)",
    ],
    "scenario2": [
        "(grasp-tool repair-bot wrench docking-bay)",
        "(navigate repair-bot docking-bay solar-wing-a)",
        "(release-tool repair-bot wrench solar-wing-a)",
        "(clear-debris repair-bot solar-wing-a)",
        "(make-panel-accessible solar-panel-1 solar-wing-a)",
        "(grasp-tool repair-bot wrench solar-wing-a)",
        "(open-panel repair-bot solar-panel-1 solar-wing-a)",
        "(repair-panel repair-bot solar-panel-1 wrench solar-wing-a)",
        "(close-panel repair-bot solar-panel-1 solar-wing-a)",
        "(release-tool repair-bot wrench solar-wing-a)",
        "(navigate repair-bot solar-wing-a comm-module)",
        "(clear-debris repair-bot comm-module)",
        "(make-panel-accessible comm-panel comm-module)",
        "(navigate repair-bot comm-module docking-bay)",
        "(grasp-tool repair-bot screwdriver docking-bay)",
        "(navigate repair-bot docking-bay comm-module)",
        "(open-panel repair-bot comm-panel comm-module)",
        "(repair-panel repair-bot comm-panel screwdriver comm-module)",
        "(close-panel repair-bot comm-panel comm-module)",
        "(release-tool repair-bot screwdriver comm-module)",
        "(navigate repair-bot comm-module docking-bay)",
        "(grasp-tool repair-bot soldering-iron docking-bay)",
        "(navigate repair-bot docking-bay thermal-section)",
        "(make-panel-accessible thermal-panel thermal-section)",
        "(open-panel repair-bot thermal-panel thermal-section)",
        "(repair-panel repair-bot thermal-panel soldering-iron thermal-section)",
        "(close-panel repair-bot thermal-panel thermal-section)",
    ],
    "scenario3": [
        "(grasp-tool repair-bot wrench docking-bay)",
        "(navigate repair-bot docking-bay solar-wing-a)",
        "(release-tool repair-bot wrench solar-wing-a)",
        "(clear-debris repair-bot solar-wing-a)",
        "(make-panel-accessible solar-panel-1 solar-wing-a)",
        "(grasp-tool repair-bot wrench solar-wing-a)",
        "(open-panel repair-bot solar-panel-1 solar-wing-a)",
        "(repair-panel repair-bot solar-panel-1 wrench solar-wing-a)",
        "(close-panel repair-bot solar-panel-1 solar-wing-a)",
        "(navigate repair-bot solar-wing-a solar-wing-b)",
        "(release-tool repair-bot wrench solar-wing-b)",
        "(clear-debris repair-bot solar-wing-b)",
        "(make-panel-accessible solar-panel-2 solar-wing-b)",
        "(grasp-tool repair-bot wrench solar-wing-b)",
        "(open-panel repair-bot solar-panel-2 solar-wing-b)",
        "(repair-panel repair-bot solar-panel-2 wrench solar-wing-b)",
        "(close-panel repair-bot solar-panel-2 solar-wing-b)",
        "(release-tool repair-bot wrench solar-wing-b)",
        "(navigate repair-bot solar-wing-b solar-wing-a)",
        "(navigate repair-bot solar-wing-a docking-bay)",
        "(grasp-tool repair-bot screwdriver docking-bay)",
        "(navigate repair-bot docking-bay comm-module)",
        "(release-tool repair-bot screwdriver comm-module)",
        "(clear-debris repair-bot comm-module)",
        "(make-panel-accessible comm-panel comm-module)",
        "(grasp-tool repair-bot screwdriver comm-module)",
        "(open-panel repair-bot comm-panel comm-module)",
        "(repair-panel repair-bot comm-panel screwdriver comm-module)",
        "(close-panel repair-bot comm-panel comm-module)",
        "(release-tool repair-bot screwdriver comm-module)",
        "(grasp-tool repair-bot soldering-iron comm-module)",
        "(navigate repair-bot comm-module nav-bay)",
        "(make-panel-accessible nav-panel nav-bay)",
        "(release-tool repair-bot soldering-iron nav-bay)",
        "(grasp-tool repair-bot diagnostic-probe nav-bay)",
        "(open-panel repair-bot nav-panel nav-bay)",
        "(repair-panel repair-bot nav-panel diagnostic-probe nav-bay)",
        "(close-panel repair-bot nav-panel nav-bay)",
        "(release-tool repair-bot diagnostic-probe nav-bay)",
        "(grasp-tool repair-bot soldering-iron nav-bay)",
        "(navigate repair-bot nav-bay power-hub)",
        "(release-tool repair-bot soldering-iron power-hub)",
        "(clear-debris repair-bot power-hub)",
        "(make-panel-accessible power-regulator power-hub)",
        "(grasp-tool repair-bot soldering-iron power-hub)",
        "(open-panel repair-bot power-regulator power-hub)",
        "(repair-panel repair-bot power-regulator soldering-iron power-hub)",
        "(close-panel repair-bot power-regulator power-hub)",
    ],
}


def parse_action(action_str):
    """Parse a PDDL action string like '(navigate repair-bot a b)' into components."""
    # Remove parentheses and split
    clean = action_str.strip("() ")
    parts = clean.split()
    return {
        "name": parts[0],
        "params": parts[1:],
        "raw": action_str,
    }


def classify_action(action_name):
    """Classify actions into categories for analysis."""
    categories = {
        "navigate": "Navigation",
        "clear-debris": "Debris Clearance",
        "make-panel-accessible": "Panel Access",
        "grasp-tool": "Tool Management",
        "release-tool": "Tool Management",
        "open-panel": "Panel Operations",
        "repair-panel": "Repair",
        "close-panel": "Panel Operations",
    }
    return categories.get(action_name, "Unknown")


def analyze_plan(plan_steps, scenario_info):
    """Generate detailed analysis of a plan."""
    parsed = [parse_action(s) for s in plan_steps]

    # Count action types
    action_counts = {}
    category_counts = {}
    for p in parsed:
        action_counts[p["name"]] = action_counts.get(p["name"], 0) + 1
        cat = classify_action(p["name"])
        category_counts[cat] = category_counts.get(cat, 0) + 1

    # Build step-by-step state trace
    steps = []
    for i, p in enumerate(parsed):
        step = {
            "step": i + 1,
            "action": p["name"],
            "parameters": p["params"],
            "raw": p["raw"],
            "category": classify_action(p["name"]),
            "description": generate_description(p),
        }
        steps.append(step)

    analysis = {
        "scenario_id": scenario_info["id"],
        "scenario_name": scenario_info["name"],
        "scenario_description": scenario_info["description"],
        "total_steps": len(plan_steps),
        "action_counts": action_counts,
        "category_counts": category_counts,
        "steps": steps,
        "metrics": {
            "plan_length": len(plan_steps),
            "navigation_steps": action_counts.get("navigate", 0),
            "debris_clearances": action_counts.get("clear-debris", 0),
            "tool_operations": action_counts.get("grasp-tool", 0) + action_counts.get("release-tool", 0),
            "panel_repairs": action_counts.get("repair-panel", 0),
            "efficiency_ratio": round(
                action_counts.get("repair-panel", 0) / max(len(plan_steps), 1) * 100, 1
            ),
        },
    }

    return analysis


def generate_description(parsed_action):
    """Generate a human-readable description for an action."""
    name = parsed_action["name"]
    params = parsed_action["params"]

    descriptions = {
        "navigate": f"Robot {params[0]} navigates from {params[1]} to {params[2]}",
        "clear-debris": f"Robot {params[0]} clears debris at {params[1]}",
        "make-panel-accessible": f"Panel {params[0]} becomes accessible at {params[1]}",
        "grasp-tool": f"Robot {params[0]} grasps {params[1]} at {params[2]}",
        "release-tool": f"Robot {params[0]} releases {params[1]} at {params[2]}",
        "open-panel": f"Robot {params[0]} opens {params[1]} at {params[2]}",
        "repair-panel": f"Robot {params[0]} repairs {params[1]} using {params[2]} at {params[3]}",
        "close-panel": f"Robot {params[0]} closes {params[1]} at {params[2]}",
    }

    return descriptions.get(name, f"Action: {name} with parameters {params}")


def solve_with_pyperplan(domain_path, problem_path):
    """Solve a PDDL problem using pyperplan."""
    if not HAS_PYPERPLAN:
        return None

    try:
        # Parse PDDL files
        parser = Parser(str(domain_path), str(problem_path))
        domain = parser.parse_domain()
        problem = parser.parse_problem(domain)

        # Ground the problem
        task = ground(problem)

        # Search for a plan using breadth-first search
        heuristic_class = HEURISTICS["hff"]
        search_fn = SEARCHES["gbf"]

        heuristic = heuristic_class(task)
        plan = search_plan(task, search_fn, heuristic)

        if plan:
            return [str(action).lower() for action in plan]
        else:
            print("  ✗ No plan found!")
            return None

    except Exception as e:
        print(f"  ✗ Solver error: {e}")
        return None


def main():
    print("=" * 70)
    print("  PDDL Satellite Repair — Scenario Solver & Analyzer")
    print("  P21: Logical Agents (PDDL) — Basavaraj Babasab Billur")
    print("=" * 70)
    print()

    # Ensure output directory exists
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    all_results = {}

    for scenario in SCENARIOS:
        print(f"━━━ Scenario: {scenario['name']} ━━━")
        print(f"    Domain:  {scenario['domain'].name}")
        print(f"    Problem: {scenario['problem'].name}")
        print()

        # Try pyperplan first, fall back to pre-computed
        plan = None
        solver_used = "pyperplan"

        if HAS_PYPERPLAN:
            print("  → Solving with pyperplan (gbf + hff)...")
            start_time = time.time()
            plan = solve_with_pyperplan(scenario["domain"], scenario["problem"])
            solve_time = time.time() - start_time
            if plan:
                print(f"  ✓ Plan found! ({len(plan)} steps in {solve_time:.3f}s)")
            else:
                print("  ⚠ Pyperplan failed, using pre-computed plan.")
                plan = PRECOMPUTED_PLANS.get(scenario["id"])
                solver_used = "pre-computed"
                solve_time = 0
        else:
            plan = PRECOMPUTED_PLANS.get(scenario["id"])
            solver_used = "pre-computed"
            solve_time = 0

        if not plan:
            print("  ✗ No plan available for this scenario!")
            continue

        # Print plan
        print(f"\n  Plan ({len(plan)} steps):")
        for i, step in enumerate(plan):
            print(f"    {i+1:3d}. {step}")

        # Analyze
        analysis = analyze_plan(plan, scenario)
        analysis["solver"] = solver_used
        analysis["solve_time_seconds"] = round(solve_time, 4)
        all_results[scenario["id"]] = analysis

        # Print metrics
        m = analysis["metrics"]
        print(f"\n  Metrics:")
        print(f"    Total Steps:      {m['plan_length']}")
        print(f"    Navigation:       {m['navigation_steps']}")
        print(f"    Debris Cleared:   {m['debris_clearances']}")
        print(f"    Tool Operations:  {m['tool_operations']}")
        print(f"    Panels Repaired:  {m['panel_repairs']}")
        print(f"    Efficiency Ratio: {m['efficiency_ratio']}%")
        print()

    # Save combined results for web visualizer
    output_file = OUTPUT_DIR / "plan_results.json"
    with open(output_file, "w") as f:
        json.dump(all_results, f, indent=2)
    print(f"✓ Results saved to {output_file}")

    # Also save a summary
    summary = {
        "project": "P21 — Logical Agents (PDDL): Satellite Repair",
        "author": "Basavaraj Babasab Billur",
        "scenarios_solved": len(all_results),
        "total_plan_steps": sum(r["total_steps"] for r in all_results.values()),
        "scenarios": {
            sid: {
                "name": data["scenario_name"],
                "steps": data["total_steps"],
                "efficiency": data["metrics"]["efficiency_ratio"],
            }
            for sid, data in all_results.items()
        },
    }
    summary_file = OUTPUT_DIR / "summary.json"
    with open(summary_file, "w") as f:
        json.dump(summary, f, indent=2)
    print(f"✓ Summary saved to {summary_file}")
    print("\n✓ All scenarios processed successfully!")


if __name__ == "__main__":
    main()
