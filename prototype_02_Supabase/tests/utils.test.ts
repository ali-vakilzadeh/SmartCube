import { describe, it, expect } from "@jest/globals"
import { DataTypeValidator } from "../lib/utils/data-type-validator"
import { OutputFormatter } from "../lib/utils/output-formatter"
import { LoopController } from "../lib/utils/loop-controller"

describe("DataTypeValidator", () => {
  it("should validate text type correctly", () => {
    expect(DataTypeValidator.validate("Hello", "text")).toBe(true)
    expect(DataTypeValidator.validate(123, "text")).toBe(false)
  })

  it("should validate number type correctly", () => {
    expect(DataTypeValidator.validate(123, "number")).toBe(true)
    expect(DataTypeValidator.validate("123", "number")).toBe(false)
  })

  it("should validate JSON type correctly", () => {
    expect(DataTypeValidator.validate({ key: "value" }, "json")).toBe(true)
    expect(DataTypeValidator.validate("not json", "json")).toBe(false)
  })

  it("should validate image type correctly", () => {
    expect(DataTypeValidator.validate("data:image/png;base64,abc", "image")).toBe(true)
    expect(DataTypeValidator.validate("http://example.com/image.png", "image")).toBe(true)
    expect(DataTypeValidator.validate("not an image", "image")).toBe(false)
  })

  it("should validate table type correctly", () => {
    expect(DataTypeValidator.validate([{ a: 1 }, { a: 2 }], "table")).toBe(true)
    expect(DataTypeValidator.validate("not a table", "table")).toBe(false)
  })

  it("should validate boolean type correctly", () => {
    expect(DataTypeValidator.validate(true, "boolean")).toBe(true)
    expect(DataTypeValidator.validate(false, "boolean")).toBe(true)
    expect(DataTypeValidator.validate("true", "boolean")).toBe(false)
  })
})

describe("OutputFormatter", () => {
  it("should format text output", () => {
    const result = OutputFormatter.format("Hello World", "text")
    expect(result.type).toBe("text")
    expect(result.value).toBe("Hello World")
  })

  it("should format number output", () => {
    const result = OutputFormatter.format(42, "number")
    expect(result.type).toBe("number")
    expect(result.value).toBe(42)
  })

  it("should format JSON output", () => {
    const data = { key: "value" }
    const result = OutputFormatter.format(data, "json")
    expect(result.type).toBe("json")
    expect(result.value).toEqual(data)
  })

  it("should format table output", () => {
    const table = [{ name: "Alice" }, { name: "Bob" }]
    const result = OutputFormatter.format(table, "table")
    expect(result.type).toBe("table")
    expect(result.value).toEqual(table)
  })

  it("should include metadata", () => {
    const result = OutputFormatter.format("test", "text")
    expect(result.metadata).toBeDefined()
    expect(result.metadata.timestamp).toBeDefined()
  })
})

describe("LoopController", () => {
  it("should allow first iteration", () => {
    const controller = new LoopController()
    expect(controller.canIterate("loop1")).toBe(true)
  })

  it("should allow second iteration", () => {
    const controller = new LoopController()
    controller.incrementIteration("loop1")
    expect(controller.canIterate("loop1")).toBe(true)
  })

  it("should block third iteration", () => {
    const controller = new LoopController()
    controller.incrementIteration("loop1")
    controller.incrementIteration("loop1")
    expect(controller.canIterate("loop1")).toBe(false)
  })

  it("should track multiple loops independently", () => {
    const controller = new LoopController()
    controller.incrementIteration("loop1")
    controller.incrementIteration("loop1")
    expect(controller.canIterate("loop1")).toBe(false)
    expect(controller.canIterate("loop2")).toBe(true)
  })

  it("should reset loop counter", () => {
    const controller = new LoopController()
    controller.incrementIteration("loop1")
    controller.incrementIteration("loop1")
    controller.resetLoop("loop1")
    expect(controller.canIterate("loop1")).toBe(true)
  })

  it("should get current iteration count", () => {
    const controller = new LoopController()
    expect(controller.getIterationCount("loop1")).toBe(0)
    controller.incrementIteration("loop1")
    expect(controller.getIterationCount("loop1")).toBe(1)
  })
})
