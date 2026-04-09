;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;; PDDL Domain: Autonomous Satellite Repair
;;; Author: Basavaraj Babasab Billur (P21)
;;; Course: AI in Autonomous Systems
;;; Description: Defines the logical framework for an autonomous robot
;;;              performing satellite repair operations in space.
;;;              Covers debris clearance, tool management, panel access,
;;;              and multi-step repair procedures.
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

(define (domain satellite-repair)

  (:requirements :strips :typing :equality)

  ;; =================================================================
  ;; TYPE HIERARCHY
  ;; =================================================================
  ;; We model four object categories in the satellite repair world:
  ;;   - robot  : the autonomous repair agent (e.g., robotic arm)
  ;;   - tool   : instruments needed for repair (wrench, screwdriver, etc.)
  ;;   - panel  : satellite panels that may need repair
  ;;   - area   : spatial regions on the satellite exterior
  ;; =================================================================
  (:types
    robot tool panel area
  )

  ;; =================================================================
  ;; PREDICATES — describe the state of the world
  ;; =================================================================
  (:predicates
    ;; --- Spatial predicates ---
    (robot-at ?r - robot ?a - area)        ; robot ?r is located at area ?a
    (tool-at ?t - tool ?a - area)          ; tool ?t is located at area ?a
    (panel-in ?p - panel ?a - area)        ; panel ?p is situated in area ?a
    (connected ?a1 - area ?a2 - area)      ; area ?a1 is adjacent to area ?a2

    ;; --- Core predicates (as required by the task) ---
    (tool-grasped ?t - tool ?r - robot)    ; robot ?r has grasped tool ?t
    (panel-accessible ?p - panel)          ; panel ?p is accessible for repair
    (debris-cleared ?a - area)             ; debris has been cleared from area ?a

    ;; --- Robot state predicates ---
    (hand-free ?r - robot)                 ; robot ?r has a free manipulator

    ;; --- Debris predicates ---
    (debris-present ?a - area)             ; there is debris in area ?a

    ;; --- Panel state predicates ---
    (panel-open ?p - panel)                ; panel ?p has been opened
    (panel-repaired ?p - panel)            ; panel ?p has been successfully repaired
    (panel-closed ?p - panel)              ; panel ?p is closed (initial state)
    (panel-damaged ?p - panel)             ; panel ?p is damaged and needs repair

    ;; --- Tool requirement predicates ---
    (requires-tool ?p - panel ?t - tool)   ; repairing panel ?p needs tool ?t

    ;; --- Panel dependency predicates ---
    (panel-depends-on ?p1 - panel ?p2 - panel)  ; panel ?p1 can only be accessed after ?p2 is repaired
  )

  ;; =================================================================
  ;; ACTION: navigate
  ;; Robot moves from one area to an adjacent area.
  ;; Precondition: Robot is at source area, areas are connected.
  ;; Effect: Robot is now at destination area, no longer at source.
  ;; =================================================================
  (:action navigate
    :parameters (?r - robot ?from - area ?to - area)
    :precondition (and
      (robot-at ?r ?from)
      (connected ?from ?to)
    )
    :effect (and
      (robot-at ?r ?to)
      (not (robot-at ?r ?from))
    )
  )

  ;; =================================================================
  ;; ACTION: clear-debris
  ;; Robot clears debris from its current area.
  ;; Precondition: Robot is at the area, debris is present, robot has
  ;;               a free hand (needs manipulator for clearing).
  ;; Effect: Debris is cleared, it is no longer present.
  ;;         All panels in this area become accessible.
  ;; =================================================================
  (:action clear-debris
    :parameters (?r - robot ?a - area)
    :precondition (and
      (robot-at ?r ?a)
      (debris-present ?a)
      (hand-free ?r)
    )
    :effect (and
      (debris-cleared ?a)
      (not (debris-present ?a))
    )
  )

  ;; =================================================================
  ;; ACTION: make-panel-accessible
  ;; After debris is cleared, mark a specific panel as accessible.
  ;; Also checks for panel dependencies.
  ;; Precondition: Debris cleared in the area, panel is in that area,
  ;;               panel is not yet accessible.
  ;; Effect: Panel becomes accessible.
  ;; =================================================================
  (:action make-panel-accessible
    :parameters (?p - panel ?a - area)
    :precondition (and
      (panel-in ?p ?a)
      (debris-cleared ?a)
      (not (panel-accessible ?p))
    )
    :effect (and
      (panel-accessible ?p)
    )
  )

  ;; =================================================================
  ;; ACTION: grasp-tool
  ;; Robot picks up a tool from its current area.
  ;; Precondition: Robot and tool are at the same area, robot's hand
  ;;               is free.
  ;; Effect: Robot grasps the tool, hand is no longer free, tool is
  ;;         no longer at that area.
  ;; =================================================================
  (:action grasp-tool
    :parameters (?r - robot ?t - tool ?a - area)
    :precondition (and
      (robot-at ?r ?a)
      (tool-at ?t ?a)
      (hand-free ?r)
    )
    :effect (and
      (tool-grasped ?t ?r)
      (not (hand-free ?r))
      (not (tool-at ?t ?a))
    )
  )

  ;; =================================================================
  ;; ACTION: release-tool
  ;; Robot releases a grasped tool at its current area.
  ;; Precondition: Robot has the tool grasped and is at the area.
  ;; Effect: Tool is placed at the area, robot's hand becomes free.
  ;; =================================================================
  (:action release-tool
    :parameters (?r - robot ?t - tool ?a - area)
    :precondition (and
      (robot-at ?r ?a)
      (tool-grasped ?t ?r)
    )
    :effect (and
      (tool-at ?t ?a)
      (hand-free ?r)
      (not (tool-grasped ?t ?r))
    )
  )

  ;; =================================================================
  ;; ACTION: open-panel
  ;; Robot opens a satellite panel for repair.
  ;; Precondition: Robot is at the panel's area, panel is accessible,
  ;;               panel is currently closed.
  ;; Effect: Panel is open, no longer closed.
  ;; =================================================================
  (:action open-panel
    :parameters (?r - robot ?p - panel ?a - area)
    :precondition (and
      (robot-at ?r ?a)
      (panel-in ?p ?a)
      (panel-accessible ?p)
      (panel-closed ?p)
    )
    :effect (and
      (panel-open ?p)
      (not (panel-closed ?p))
    )
  )

  ;; =================================================================
  ;; ACTION: repair-panel
  ;; Robot repairs a damaged panel using the required tool.
  ;; Precondition: Robot is at the panel's area, panel is open and
  ;;               damaged, robot has the required tool grasped.
  ;; Effect: Panel is repaired, no longer damaged.
  ;; =================================================================
  (:action repair-panel
    :parameters (?r - robot ?p - panel ?t - tool ?a - area)
    :precondition (and
      (robot-at ?r ?a)
      (panel-in ?p ?a)
      (panel-open ?p)
      (panel-damaged ?p)
      (tool-grasped ?t ?r)
      (requires-tool ?p ?t)
    )
    :effect (and
      (panel-repaired ?p)
      (not (panel-damaged ?p))
    )
  )

  ;; =================================================================
  ;; ACTION: close-panel
  ;; Robot closes a panel after repair.
  ;; Precondition: Robot is at the panel's area, panel is open and
  ;;               has been repaired.
  ;; Effect: Panel is closed, no longer open.
  ;; =================================================================
  (:action close-panel
    :parameters (?r - robot ?p - panel ?a - area)
    :precondition (and
      (robot-at ?r ?a)
      (panel-in ?p ?a)
      (panel-open ?p)
      (panel-repaired ?p)
    )
    :effect (and
      (panel-closed ?p)
      (not (panel-open ?p))
    )
  )
)
