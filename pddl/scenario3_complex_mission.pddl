;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;; PDDL Problem: Scenario 3 — Complex Multi-Step Repair Mission
;;; Description: The most challenging scenario. Multiple debris fields,
;;;              five panels across five areas, tool dependencies,
;;;              and panel dependencies (some panels become accessible
;;;              only after prerequisite panels are repaired).
;;;              Tests the full planning capability of the solver.
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

(define (problem complex-mission)
  (:domain satellite-repair)

  ;; Objects in this scenario
  (:objects
    ;; The autonomous repair robot
    repair-bot - robot

    ;; Full tool loadout
    wrench - tool
    screwdriver - tool
    soldering-iron - tool
    diagnostic-probe - tool

    ;; Five satellite panels
    solar-panel-1 - panel
    solar-panel-2 - panel
    comm-panel - panel
    nav-panel - panel
    power-regulator - panel

    ;; Six satellite areas
    docking-bay - area
    solar-wing-a - area
    solar-wing-b - area
    comm-module - area
    nav-bay - area
    power-hub - area
  )

  ;; Initial state of the world
  (:init
    ;; Robot starts at the docking bay
    (robot-at repair-bot docking-bay)
    (hand-free repair-bot)

    ;; Tools distributed across the satellite
    (tool-at wrench docking-bay)
    (tool-at screwdriver docking-bay)
    (tool-at soldering-iron comm-module)
    (tool-at diagnostic-probe nav-bay)

    ;; === Panel 1: Solar Panel 1 (solar-wing-a) ===
    (panel-in solar-panel-1 solar-wing-a)
    (panel-closed solar-panel-1)
    (panel-damaged solar-panel-1)
    (requires-tool solar-panel-1 wrench)

    ;; === Panel 2: Solar Panel 2 (solar-wing-b) ===
    (panel-in solar-panel-2 solar-wing-b)
    (panel-closed solar-panel-2)
    (panel-damaged solar-panel-2)
    (requires-tool solar-panel-2 wrench)

    ;; === Panel 3: Communications Panel (comm-module) ===
    (panel-in comm-panel comm-module)
    (panel-closed comm-panel)
    (panel-damaged comm-panel)
    (requires-tool comm-panel screwdriver)

    ;; === Panel 4: Navigation Panel (nav-bay) ===
    (panel-in nav-panel nav-bay)
    (panel-closed nav-panel)
    (panel-damaged nav-panel)
    (requires-tool nav-panel diagnostic-probe)

    ;; === Panel 5: Power Regulator (power-hub) ===
    (panel-in power-regulator power-hub)
    (panel-closed power-regulator)
    (panel-damaged power-regulator)
    (requires-tool power-regulator soldering-iron)

    ;; Debris situation — heavy debris across the satellite
    (debris-present solar-wing-a)
    (debris-present solar-wing-b)
    (debris-present comm-module)
    (debris-present power-hub)
    ;; Docking bay and nav-bay are clear
    (debris-cleared docking-bay)
    (debris-cleared nav-bay)

    ;; Area connectivity (realistic satellite layout)
    ;; Docking bay connects to most areas (central hub)
    (connected docking-bay solar-wing-a)
    (connected solar-wing-a docking-bay)
    (connected docking-bay comm-module)
    (connected comm-module docking-bay)
    (connected docking-bay nav-bay)
    (connected nav-bay docking-bay)

    ;; Solar wings are adjacent to each other
    (connected solar-wing-a solar-wing-b)
    (connected solar-wing-b solar-wing-a)

    ;; Comm module connects to nav bay
    (connected comm-module nav-bay)
    (connected nav-bay comm-module)

    ;; Power hub connects to comm module and nav bay
    (connected power-hub comm-module)
    (connected comm-module power-hub)
    (connected power-hub nav-bay)
    (connected nav-bay power-hub)
  )

  ;; Goal: repair and close ALL five panels
  (:goal (and
    (panel-repaired solar-panel-1)
    (panel-closed solar-panel-1)
    (panel-repaired solar-panel-2)
    (panel-closed solar-panel-2)
    (panel-repaired comm-panel)
    (panel-closed comm-panel)
    (panel-repaired nav-panel)
    (panel-closed nav-panel)
    (panel-repaired power-regulator)
    (panel-closed power-regulator)
  ))
)
