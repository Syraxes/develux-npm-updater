import { APIClient } from 'bitbucket/src/plugins/register-endpoints/types'

export const getFile = async (
  workspace: string,
  repoSlug: string,
  filePath: string,
  bitbucket: APIClient,
): Promise<string | null> => {
  try {
    const response = await bitbucket.repositories.readSrc({
      workspace,
      repo_slug: repoSlug,
      commit: 'main',
      path: filePath,
    })
    return response.data
  } catch (error) {
    console.error('Exception when getting file:', error)
    return null
  }
}

export const createBranch = async (
  bitbucket: APIClient,
  workspace: string,
  repoSlug: string,
  newBranchName: string,
): Promise<void> => {
  try {
    await bitbucket.repositories.createBranch({
      workspace,
      repo_slug: repoSlug,
      _body: {
        name: newBranchName,
        target: {
          hash: 'main',
        },
      },
    })
    console.log(`Branch ${newBranchName} created successfully.`)
  } catch (error) {
    console.error('Failed to create branch:', error)
  }
}

export const commitChanges = async (
  workspace: string,
  repoSlug: string,
  filePath: string,
  newContent: string,
  version: string,
  bitbucket: APIClient,
  branchName: string,
): Promise<void> => {
  try {
    await bitbucket.repositories.createSrcFileCommit({
      workspace,
      repo_slug: repoSlug,
      _body: {
        branch: branchName,
        [filePath]: newContent,
        message: `Update ${filePath} with new version ${version}`,
      },
    })
    console.log('File committed successfully')
  } catch (error) {
    console.error('Exception when committing file:', error)
  }
}

export const createPullRequest = async (
  bitbucket: APIClient,
  workspace: string,
  repoSlug: string,
  sourceBranch: string,
  title: string,
  description: string,
): Promise<void> => {
  try {
    await bitbucket.repositories.createPullRequest({
      workspace,
      repo_slug: repoSlug,
      _body: {
        title: title,
        source: {
          branch: {
            name: sourceBranch,
          },
        },
        destination: {
          branch: {
            name: 'main',
          },
        },
        description: description,
      },
    })
    console.log(`Pull request for ${sourceBranch} created successfully.`)
  } catch (error) {
    console.error('Failed to create pull request:', error)
  }
}
