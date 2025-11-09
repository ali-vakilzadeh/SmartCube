import { describe, it, expect } from "@jest/globals"
import { WorkflowValidator } from "../lib/engine/workflow-validator"

describe("WorkflowValidator", () => {
  it("should validate a simple linear workflow", () => {
    const workflow = {
      nodes: [
        { id: "1", type: "cube", data: { cubeType: "loader_text" } },
        { id: "2", type: "cube", data: { cubeType: "text" } },
      ],
      edges: [{ id: "e1", source: "1", target: "2" }],
    }

    const result = WorkflowValidator.validate(workflow)
    expect(result.isValid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it("should detect cycles in workflow", () => {
    const workflow = {
      nodes: [
        { id: "1", type: "cube", data: { cubeType: "loader_text" } },
        { id: "2", type: "cube", data: { cubeType: "text" } },
      ],
      edges: [
        { id: "e1", source: "1", target: "2" },
        { id: "e2", source: "2", target: "1" },
      ],
    }

    const result = WorkflowValidator.validate(workflow)
    expect(result.isValid).toBe(false)
    expect(result.errors).toContain("Workflow contains cycles")
  })

  it("should detect disconnected nodes", () => {
    const workflow = {
      nodes: [
        { id: "1", type: "cube", data: { cubeType: "loader_text" } },
        { id: "2", type: "cube", data: { cubeType: "text" } },
        { id: "3", type: "cube", data: { cubeType: "saver_text" } },
      ],
      edges: [{ id: "e1", source: "1", target: "2" }],
    }

    const result = WorkflowValidator.validate(workflow)
    expect(result.isValid).toBe(false)
    expect(result.errors.some((e) => e.includes("disconnected"))).toBe(true)
  })

  it("should require at least one node", () => {
    const workflow = {
      nodes: [],
      edges: [],
    }

    const result = WorkflowValidator.validate(workflow)
    expect(result.isValid).toBe(false)
    expect(result.errors).toContain("Workflow must have at least one node")
  })

  it("should validate branching workflows", () => {
    const workflow = {
      nodes: [
        { id: "1", type: "cube", data: { cubeType: "loader_text" } },
        { id: "2", type: "cube", data: { cubeType: "decider" } },
        { id: "3", type: "cube", data: { cubeType: "text" } },
        { id: "4", type: "cube", data: { cubeType: "saver_text" } },
      ],
      edges: [
        { id: "e1", source: "1", target: "2" },
        { id: "e2", source: "2", target: "3" },
        { id: "e3", source: "2", target: "4" },
      ],
    }

    const result = WorkflowValidator.validate(workflow)
    expect(result.isValid).toBe(true)
  })
})
