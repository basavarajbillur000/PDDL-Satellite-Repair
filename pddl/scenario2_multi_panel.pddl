;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;; PDDL Problem: Scenario 2 — Multi-Panel Repair Mission
;;; Description: Robot must repair three panels in different areas.
;;;              Each panel requires a specific tool. The robot must
;;;              manage tool swaps and navigate between areas.
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

(define (problem multi-panel-repair)
  (:domain satellite-repair)

  ;; Objects in this scenario
  (:objects
    ;; The autonomous repair robot
    repair-bot - robot

    ;; Specialized tools
    wrench - tool
    screwdriver - tool
    soldering-iron - tool

    ;; Satellite panels
    solar-panel-1 - panel
    comm-panel - panel
    thermal-panel - panel

    ;; Satellite areas/regions
    docking-bay - area
    solar-wing-a - area
    comm-module - area
    thermal-section - area
  )

  ;; Initial state of the world
  (:init
    ;; Robot starts at the docking bay
    (robot-at repair-bot docking-bay)
    (hand-free repair-bot)

    ;; Tools are stored at the docking bay (tool storage area)
    (tool-at wrench docking-bay)
    (tool-at screwdriver docking-bay)
    (tool-at soldering-iron docking-bay)

    ;; Panel locations and states
    (panel-in solar-panel-1 solar-wing-a)
    (panel-closed solar-panel-1)
    (panel-damaged solar-panel-1)
    (requires-tool solar-panel-1 wrench)

    (panel-in comm-panel comm-module)
    (panel-closed comm-panel)
    (panel-damaged comm-panel)
    (requires-tool comm-panel screwdriver)

    (panel-in thermal-panel thermal-section)
    (panel-closed thermal-panel)
    (panel-damaged thermal-panel)
    (requires-tool thermal-panel soldering-iron)

    ;; Debris situation — debris in two areas
    (debris-present solar-wing-a)
    (debris-present comm-module)
    ;; Thermal section is already clear
    (debris-cleared thermal-section)

    ;; Docking bay is clear (it's a controlled environment)
    (debris-cleared docking-bay)

    ;; Area connectivity (star topology with docking bay as hub)
    (connected docking-bay solar-wing-a)
    (connected solar-wing-a docking-bay)
    (connected docking-bay comm-module)
    (connected comm-module docking-bay)
    (connected docking-bay thermal-section)
    (connected thermal-section docking-bay)
    ;; Direct connection between some modules
    (connected solar-wing-a comm-module)
    (connected comm-module solar-wing-a)
  )

  ;; Goal: repair and close ALL three panels
  (:goal (and
    (panel-repaired solar-panel-1)
    (panel-closed solar-panel-1)
    (panel-repaired comm-panel)
    (panel-closed comm-panel)
    (panel-repaired thermal-panel)
    (panel-closed thermal-panel)
  ))
)
