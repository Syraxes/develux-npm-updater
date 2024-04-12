import readline from 'readline'
import { v4 as uuidv4 } from 'uuid'
import {
  checkDirectory,
  checkFileExists,
  cleanup,
  readJsonFile,
  writeJsonFile,
} from './fileUtils'
import {
  checkExistingPullRequests,
  createPullRequest,
  updateToken,
} from './bitbucketUtils'
import { executeCommand } from './commandUtils'
import path from 'path'
import { PackageJson } from './types'

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

const getUserInput = async (question: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim())
    })
  })
}

const extractWorkspace = (repoUrl: string): string => {
  const pathParts = new URL(repoUrl).pathname.split('/')
  return pathParts[1]
}

const updateDependenciesBitbucket = async (): Promise<void> => {
  const repoUrl = await getUserInput('Enter repository URL: ')
  const token = await getUserInput('Enter Bitbucket token: ')
  const packageName = await getUserInput('Enter package name: ')
  const packageVersion = await getUserInput('Enter package version: ')

  updateToken(token)

  const workspace = extractWorkspace(repoUrl)
  const repoSlug = repoUrl.split('/').pop()!.replace('.git', '')
  const repoPath = path.join(process.cwd(), repoSlug)
  await checkDirectory(repoPath)

  const cloneCommand = `git clone ${repoUrl} ${repoPath}`
  try {
    await executeCommand(cloneCommand)
    console.log(`Repository cloned into ${repoPath}`)
  } catch (error) {
    console.error(`Failed to clone repository: ${error}`)
    return
  }

  const uniqueId = uuidv4()
  const branchName = `update-${packageName}-${packageVersion}-${uniqueId}`
  const packagePath = path.join(repoPath, 'package.json')

  if (!await checkFileExists(packagePath)) {
    console.error('Package.json file not found in the repository.')
    await cleanup(repoPath)
    return
  }

  const packageJson = readJsonFile(packagePath) as PackageJson
  packageJson.dependencies[packageName] = packageVersion
  writeJsonFile(packagePath, packageJson)

  process.chdir(repoPath)
  await executeCommand(`git checkout -b ${branchName}`)
  await executeCommand('git add .')
  await executeCommand(
    `git commit -m "Update ${packageName} to version ${packageVersion}"`,
  )
  await executeCommand(`git push -u origin ${branchName}`)

  const pullRequestExists = await checkExistingPullRequests(
    repoSlug,
    branchName,
    workspace,
  )
  if (pullRequestExists) {
    console.log('Pull Request already exists. Skipping creation.')
    return
  }

  await createPullRequest(
    repoSlug,
    branchName,
    workspace,
    `Update Dependencies (${uniqueId})`,
    'Automated dependency update.',
  )
  await cleanup(repoPath)
}

updateDependenciesBitbucket().finally(() => {
  rl.close()
})
