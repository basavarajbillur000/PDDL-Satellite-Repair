;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;; PDDL Problem: Scenario 1 — Basic Single-Panel Repair
;;; Description: The simplest repair scenario. Robot must navigate to
;;;              the damaged area, clear debris, pick up a tool,
;;;              and repair a single panel.
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

(define (problem basic-repair)
  (:domain satellite-repair)

  ;; Objects in this scenario
  (:objects
    ;; The autonomous repair robot
    repair-bot - robot

    ;; Tools available
    wrench - tool

    ;; Satellite panels
    solar-panel-1 - panel

    ;; Satellite areas/regions
    docking-bay - area
    solar-wing-a - area
  )

  ;; Initial state of the world
  (:init
    ;; Robot starts at the docking bay
    (robot-at repair-bot docking-bay)
    (hand-free repair-bot)

    ;; Tool is stored at the docking bay
    (tool-at wrench docking-bay)

    ;; Panel location and state
    (panel-in solar-panel-1 solar-wing-a)
    (panel-closed solar-panel-1)
    (panel-damaged solar-panel-1)
    (requires-tool solar-panel-1 wrench)

    ;; Debris situation
    (debris-present solar-wing-a)

    ;; Area connectivity (bidirectional)
    (connected docking-bay solar-wing-a)
    (connected solar-wing-a docking-bay)
  )

  ;; Goal: repair and close the solar panel
  (:goal (and
    (panel-repaired solar-panel-1)
    (panel-closed solar-panel-1)
  ))
)
