// Central export for all cube types
export * from "./loader-cubes"
export * from "./recognition-cubes"
export * from "./math-cube"
export * from "./decider-cube"
export * from "./text-cube"
export * from "./image-cube"
export * from "./saver-cubes"

export interface BaseCube {
  id: string
  type: string // Assuming CubeType is defined elsewhere now
  name: string
  config: Record<string, any>
}
