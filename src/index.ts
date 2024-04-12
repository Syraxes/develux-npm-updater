import { getUserInput, closeReadline } from './io-module'
import { getLatestPackageVersion } from './npm-module'
import {
  createBranch,
  commitChanges,
  createPullRequest,
  getFile,
} from './bitbucket-module'
import { updatePackageJson } from './package-json-module'
import { v4 as uuidv4 } from 'uuid'
import { APIClient } from 'bitbucket/src/plugins/register-endpoints/types'
import { Bitbucket } from 'bitbucket'

const main = async (): Promise<void> => {
  const repoUrl = await getUserInput('Enter repository URL: ')
  const token = await getUserInput('Enter Bitbucket token: ')
  const packageName = await getUserInput('Enter package name: ')

  const latestVersion = await getLatestPackageVersion(packageName)
  const packageVersion = await getUserInput(
    `Enter package version (latest is ${latestVersion}): `,
  )

  if (latestVersion && packageVersion < latestVersion) {
    const confirmation = await getUserInput(
      `A newer version (${latestVersion}) is available. Do you still want to proceed with version ${packageVersion}? (yes/no): `,
    )
    if (confirmation.toLowerCase() !== 'yes') {
      console.log('Update cancelled by the user.')
      return
    }
  }

  const bitbucket: APIClient = new Bitbucket({
    auth: {
      token: token,
    },
  })

  const match = /https:\/\/bitbucket.org\/([^/]+)\/([^/]+)/.exec(repoUrl)
  if (!match) {
    console.error('Incorrect URL')
    return
  }

  const workspace = match[1]
  const repoSlug = match[2]
  const uniqueId = uuidv4()
  const newBranchName = `update-${packageName}-${packageVersion}-${uniqueId}`

  await createBranch(bitbucket, workspace, repoSlug, newBranchName)
  const filePath = 'package.json'
  const content = await getFile(workspace, repoSlug, filePath, bitbucket)

  if (content) {
    const updatedContent = updatePackageJson(
      content,
      packageName,
      packageVersion,
    )
    await commitChanges(
      workspace,
      repoSlug,
      filePath,
      updatedContent,
      packageVersion,
      bitbucket,
      newBranchName,
    )
    await createPullRequest(
      bitbucket,
      workspace,
      repoSlug,
      newBranchName,
      `Update ${packageName}`,
      `Automated update of ${packageName} to version ${packageVersion}`,
    )
  }
}

main().finally(closeReadline)
