import type { Workflow, Cube, Connection } from "@/lib/types"

export class WorkflowValidator {
  /**
   * Validates a workflow structure
   */
  static validate(workflow: Workflow): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    // Check if workflow has cubes
    if (!workflow.cubes || workflow.cubes.length === 0) {
      errors.push("Workflow must contain at least one cube")
      return { valid: false, errors }
    }

    // Validate cube IDs are unique
    const cubeIds = new Set<string>()
    for (const cube of workflow.cubes) {
      if (cubeIds.has(cube.id)) {
        errors.push(`Duplicate cube ID: ${cube.id}`)
      }
      cubeIds.add(cube.id)
    }

    // Validate connections reference existing cubes
    for (const conn of workflow.connections) {
      if (!cubeIds.has(conn.sourceId)) {
        errors.push(`Connection references non-existent source cube: ${conn.sourceId}`)
      }
      if (!cubeIds.has(conn.targetId)) {
        errors.push(`Connection references non-existent target cube: ${conn.targetId}`)
      }
    }

    // Check for cycles (would cause infinite loops)
    const cycleError = this.detectCycles(workflow.cubes, workflow.connections)
    if (cycleError) {
      errors.push(cycleError)
    }

    // Validate execution order can be determined
    const orderError = this.validateExecutionOrder(workflow.cubes, workflow.connections)
    if (orderError) {
      errors.push(orderError)
    }

    return { valid: errors.length === 0, errors }
  }

  /**
   * Detects cycles in the workflow graph
   */
  private static detectCycles(cubes: Cube[], connections: Connection[]): string | null {
    const graph = this.buildGraph(cubes, connections)
    const visited = new Set<string>()
    const recStack = new Set<string>()

    for (const cubeId of graph.keys()) {
      if (this.hasCycle(cubeId, graph, visited, recStack)) {
        return "Workflow contains a cycle which would cause infinite execution"
      }
    }

    return null
  }

  /**
   * DFS cycle detection
   */
  private static hasCycle(
    cubeId: string,
    graph: Map<string, string[]>,
    visited: Set<string>,
    recStack: Set<string>,
  ): boolean {
    if (recStack.has(cubeId)) return true
    if (visited.has(cubeId)) return false

    visited.add(cubeId)
    recStack.add(cubeId)

    const neighbors = graph.get(cubeId) || []
    for (const neighbor of neighbors) {
      if (this.hasCycle(neighbor, graph, visited, recStack)) {
        return true
      }
    }

    recStack.delete(cubeId)
    return false
  }

  /**
   * Validates that execution order can be determined (DAG structure)
   */
  private static validateExecutionOrder(cubes: Cube[], connections: Connection[]): string | null {
    const graph = this.buildGraph(cubes, connections)
    const inDegree = new Map<string, number>()

    // Initialize in-degree
    for (const cube of cubes) {
      inDegree.set(cube.id, 0)
    }

    // Calculate in-degree
    for (const conn of connections) {
      inDegree.set(conn.targetId, (inDegree.get(conn.targetId) || 0) + 1)
    }

    // Find starting nodes (in-degree = 0)
    const startNodes = Array.from(inDegree.entries())
      .filter(([_, degree]) => degree === 0)
      .map(([id, _]) => id)

    if (startNodes.length === 0) {
      return "Workflow has no starting point (all cubes have incoming connections)"
    }

    return null
  }

  /**
   * Builds adjacency list representation of workflow graph
   */
  private static buildGraph(cubes: Cube[], connections: Connection[]): Map<string, string[]> {
    const graph = new Map<string, string[]>()

    for (const cube of cubes) {
      graph.set(cube.id, [])
    }

    for (const conn of connections) {
      const neighbors = graph.get(conn.sourceId) || []
      neighbors.push(conn.targetId)
      graph.set(conn.sourceId, neighbors)
    }

    return graph
  }

  /**
   * Gets execution order using topological sort
   */
  static getExecutionOrder(cubes: Cube[], connections: Connection[]): string[] {
    const graph = this.buildGraph(cubes, connections)
    const inDegree = new Map<string, number>()
    const order: string[] = []

    // Initialize in-degree
    for (const cube of cubes) {
      inDegree.set(cube.id, 0)
    }

    // Calculate in-degree
    for (const conn of connections) {
      inDegree.set(conn.targetId, (inDegree.get(conn.targetId) || 0) + 1)
    }

    // Queue for nodes with in-degree 0
    const queue: string[] = []
    for (const [cubeId, degree] of inDegree.entries()) {
      if (degree === 0) {
        queue.push(cubeId)
      }
    }

    // Process queue
    while (queue.length > 0) {
      const cubeId = queue.shift()!
      order.push(cubeId)

      const neighbors = graph.get(cubeId) || []
      for (const neighbor of neighbors) {
        const newDegree = (inDegree.get(neighbor) || 0) - 1
        inDegree.set(neighbor, newDegree)
        if (newDegree === 0) {
          queue.push(neighbor)
        }
      }
    }

    return order
  }
}
