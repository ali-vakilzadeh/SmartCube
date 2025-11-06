import { create, all } from "mathjs"
import { AppError } from "@/lib/utils/error-handler"

const math = create(all)

/**
 * Math Cube - Safe mathematical expression evaluation
 */
export class MathCube {
  async execute(inputs: Record<string, any>, config: Record<string, any>): Promise<number> {
    const { expression, variables } = { ...config, ...inputs }

    if (!expression) {
      throw new AppError("Expression is required for math cube", 400)
    }

    try {
      const result = math.evaluate(expression, variables || {})

      if (typeof result !== "number" || isNaN(result)) {
        throw new AppError("Expression did not evaluate to a valid number", 400)
      }

      return result
    } catch (error: any) {
      throw new AppError(`Math evaluation failed: ${error.message}`, 500)
    }
  }
}
