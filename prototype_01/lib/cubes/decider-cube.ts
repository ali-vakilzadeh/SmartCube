import { AppError } from "@/lib/utils/error-handler"

/**
 * Decider Cube - Logical decision making for workflow branching
 */
export class DeciderCube {
  async execute(inputs: Record<string, any>, config: Record<string, any>): Promise<{ decision: boolean }> {
    const { value1, operator, value2 } = { ...config, ...inputs }

    if (value1 === undefined || !operator || value2 === undefined) {
      throw new AppError("value1, operator, and value2 are required for decider cube", 400)
    }

    let decision = false

    try {
      switch (operator) {
        case "equals":
          decision = value1 === value2
          break

        case "not_equals":
          decision = value1 !== value2
          break

        case "contains":
          if (typeof value1 === "string") {
            decision = value1.includes(String(value2))
          } else if (Array.isArray(value1)) {
            decision = value1.includes(value2)
          }
          break

        case "greater":
          decision = Number(value1) > Number(value2)
          break

        case "less":
          decision = Number(value1) < Number(value2)
          break

        case "greater_equals":
          decision = Number(value1) >= Number(value2)
          break

        case "less_equals":
          decision = Number(value1) <= Number(value2)
          break

        case "regex":
          if (typeof value1 === "string") {
            const regex = new RegExp(String(value2))
            decision = regex.test(value1)
          }
          break

        default:
          throw new AppError(`Unsupported operator: ${operator}`, 400)
      }

      return { decision }
    } catch (error: any) {
      throw new AppError(`Decision evaluation failed: ${error.message}`, 500)
    }
  }
}
