import { exec } from 'child_process'

export const executeCommand = (command: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error)
        return
      }
      if (stderr) {
        console.error(stderr)
      }
      console.log(stdout)
      resolve()
    })
  })
}
