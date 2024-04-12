import fs from 'fs'

export const checkDirectory = async (repoPath: string): Promise<void> => {
  if (fs.existsSync(repoPath)) {
    await fs.promises.rm(repoPath, { recursive: true })
    console.log(`Removed existing directory: ${repoPath}`)
  }
}

export const readJsonFile = (filePath: string): unknown => {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

export const writeJsonFile = (filePath: string, data: unknown): void => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
}

export const cleanup = async (repoPath: string): Promise<void> => {
  try {
    await fs.promises.rm(repoPath, { recursive: true })
    console.log(`Removed directory: ${repoPath}`)
  } catch (error) {
    console.error(`Failed to remove directory: ${repoPath}, Error: ${error}`)
  }
}

export const checkFileExists = async (filePath: string): Promise<boolean> => {
  return new Promise((resolve) => {
    fs.access(filePath, fs.constants.F_OK, (err) => {
      resolve(!err)
    })
  })
}