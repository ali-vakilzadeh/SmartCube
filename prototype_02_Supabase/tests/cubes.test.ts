import { describe, it, expect } from "@jest/globals"
import { LoaderTextCube, LoaderJSONCube } from "../lib/cubes/loader-cubes"
import { MathCube } from "../lib/cubes/math-cube"
import { DeciderCube } from "../lib/cubes/decider-cube"

describe("Loader Cubes", () => {
  describe("LoaderTextCube", () => {
    it("should load text data", async () => {
      const cube = new LoaderTextCube()
      const result = await cube.execute({
        text: "Hello World",
      })
      expect(result.type).toBe("text")
      expect(result.value).toBe("Hello World")
    })

    it("should throw error if text is missing", async () => {
      const cube = new LoaderTextCube()
      await expect(cube.execute({})).rejects.toThrow()
    })
  })

  describe("LoaderJSONCube", () => {
    it("should load JSON data", async () => {
      const cube = new LoaderJSONCube()
      const data = { key: "value", number: 42 }
      const result = await cube.execute({
        json: JSON.stringify(data),
      })
      expect(result.type).toBe("json")
      expect(result.value).toEqual(data)
    })

    it("should throw error for invalid JSON", async () => {
      const cube = new LoaderJSONCube()
      await expect(cube.execute({ json: "not json" })).rejects.toThrow()
    })
  })
})

describe("MathCube", () => {
  it("should evaluate simple expressions", async () => {
    const cube = new MathCube()
    const result = await cube.execute({
      expression: "2 + 2",
    })
    expect(result.type).toBe("number")
    expect(result.value).toBe(4)
  })

  it("should evaluate complex expressions", async () => {
    const cube = new MathCube()
    const result = await cube.execute({
      expression: "sqrt(16) + 3 * 2",
    })
    expect(result.type).toBe("number")
    expect(result.value).toBe(10)
  })

  it("should handle variables", async () => {
    const cube = new MathCube()
    const result = await cube.execute({
      expression: "x + y",
      variables: { x: 5, y: 3 },
    })
    expect(result.type).toBe("number")
    expect(result.value).toBe(8)
  })

  it("should throw error for invalid expressions", async () => {
    const cube = new MathCube()
    await expect(cube.execute({ expression: "invalid" })).rejects.toThrow()
  })
})

describe("DeciderCube", () => {
  it("should evaluate equals condition", async () => {
    const cube = new DeciderCube()
    const result = await cube.execute({
      leftValue: 5,
      operator: "equals",
      rightValue: 5,
    })
    expect(result.type).toBe("boolean")
    expect(result.value).toBe(true)
  })

  it("should evaluate greater than condition", async () => {
    const cube = new DeciderCube()
    const result = await cube.execute({
      leftValue: 10,
      operator: "greaterThan",
      rightValue: 5,
    })
    expect(result.type).toBe("boolean")
    expect(result.value).toBe(true)
  })

  it("should evaluate less than condition", async () => {
    const cube = new DeciderCube()
    const result = await cube.execute({
      leftValue: 3,
      operator: "lessThan",
      rightValue: 5,
    })
    expect(result.type).toBe("boolean")
    expect(result.value).toBe(true)
  })

  it("should evaluate contains condition", async () => {
    const cube = new DeciderCube()
    const result = await cube.execute({
      leftValue: "Hello World",
      operator: "contains",
      rightValue: "World",
    })
    expect(result.type).toBe("boolean")
    expect(result.value).toBe(true)
  })

  it("should return false for non-matching condition", async () => {
    const cube = new DeciderCube()
    const result = await cube.execute({
      leftValue: 5,
      operator: "equals",
      rightValue: 10,
    })
    expect(result.type).toBe("boolean")
    expect(result.value).toBe(false)
  })
})
