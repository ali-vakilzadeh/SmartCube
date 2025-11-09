import { AppError } from "@/lib/utils/error-handler"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"

/**
 * Saver Text Cube - Saves text content to file
 */
export class SaverTextCube {
  async execute(inputs: Record<string, any>, config: Record<string, any>): Promise<{ filePath: string }> {
    const { content } = inputs
    const { filename, destination } = config

    if (!content) {
      throw new AppError("Content is required for text saver", 400)
    }

    const textData = typeof content === "string" ? content : JSON.stringify(content)
    const filePath = await this.saveFile(textData, filename || `text_${Date.now()}.txt`, destination || "text")

    return { filePath }
  }

  private async saveFile(data: string, filename: string, destination: string): Promise<string> {
    const uploadDir = join(process.cwd(), "uploads", destination)
    await mkdir(uploadDir, { recursive: true })

    const filePath = join(uploadDir, filename)
    await writeFile(filePath, data, "utf-8")

    return `/uploads/${destination}/${filename}`
  }
}

/**
 * Saver Image Cube - Saves image data to file
 */
export class SaverImageCube {
  async execute(inputs: Record<string, any>, config: Record<string, any>): Promise<{ filePath: string }> {
    const { imageData } = inputs
    const { filename, destination } = config

    if (!imageData) {
      throw new AppError("Image data is required for image saver", 400)
    }

    let buffer: Buffer
    if (Buffer.isBuffer(imageData)) {
      buffer = imageData
    } else if (typeof imageData === "string") {
      // Handle base64 or URL
      if (imageData.startsWith("data:")) {
        const base64Data = imageData.split(",")[1]
        buffer = Buffer.from(base64Data, "base64")
      } else {
        buffer = Buffer.from(imageData, "base64")
      }
    } else {
      throw new AppError("Invalid image data format", 400)
    }

    const uploadDir = join(process.cwd(), "uploads", destination || "images")
    await mkdir(uploadDir, { recursive: true })

    const finalFilename = filename || `image_${Date.now()}.png`
    const filePath = join(uploadDir, finalFilename)
    await writeFile(filePath, buffer)

    return { filePath: `/uploads/${destination || "images"}/${finalFilename}` }
  }
}

/**
 * Saver Table Cube - Saves table data as CSV
 */
export class SaverTableCube {
  async execute(inputs: Record<string, any>, config: Record<string, any>): Promise<{ filePath: string }> {
    const { data } = inputs
    const { filename, destination } = config

    if (!Array.isArray(data)) {
      throw new AppError("Table data must be an array", 400)
    }

    const csvData = this.convertToCSV(data)
    const uploadDir = join(process.cwd(), "uploads", destination || "tables")
    await mkdir(uploadDir, { recursive: true })

    const finalFilename = filename || `table_${Date.now()}.csv`
    const filePath = join(uploadDir, finalFilename)
    await writeFile(filePath, csvData, "utf-8")

    return { filePath: `/uploads/${destination || "tables"}/${finalFilename}` }
  }

  private convertToCSV(data: any[]): string {
    if (data.length === 0) return ""

    const headers = Object.keys(data[0])
    const csvRows = [headers.join(",")]

    for (const row of data) {
      const values = headers.map((header) => {
        const value = row[header]
        const escaped = String(value).replace(/"/g, '""')
        return `"${escaped}"`
      })
      csvRows.push(values.join(","))
    }

    return csvRows.join("\n")
  }
}

/**
 * Saver JSON Cube - Saves JSON data to file
 */
export class SaverJsonCube {
  async execute(inputs: Record<string, any>, config: Record<string, any>): Promise<{ filePath: string }> {
    const { data } = inputs
    const { filename, destination } = config

    if (!data) {
      throw new AppError("Data is required for JSON saver", 400)
    }

    const jsonData = JSON.stringify(data, null, 2)
    const uploadDir = join(process.cwd(), "uploads", destination || "json")
    await mkdir(uploadDir, { recursive: true })

    const finalFilename = filename || `data_${Date.now()}.json`
    const filePath = join(uploadDir, finalFilename)
    await writeFile(filePath, jsonData, "utf-8")

    return { filePath: `/uploads/${destination || "json"}/${finalFilename}` }
  }
}
