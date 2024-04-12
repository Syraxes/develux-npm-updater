import { Bitbucket, Schema } from 'bitbucket'

interface BitbucketConfig {
  auth: {
    token: string
  }
  baseUrl: string
}

const bitbucketConfig: BitbucketConfig = {
  auth: {
    token: '',
  },
  baseUrl: 'https://api.bitbucket.org/2.0',
}

const bitbucket = new Bitbucket(bitbucketConfig)

export const checkExistingPullRequests = async (
  repoSlug: string,
  branchName: string,
  workspace: string,
): Promise<boolean> => {
  try {
    const { data } = await bitbucket.pullrequests.list({
      repo_slug: repoSlug,
      workspace,
    })
    return data.values
      ? data.values.some(
          (pr) =>
            pr.source &&
            pr.source.branch &&
            pr.source.branch.name === branchName,
        )
      : false
  } catch (error) {
    console.error(`Failed to check existing Pull Requests: ${error}`)
    return true
  }
}

export const createPullRequest = async (
  repoSlug: string,
  branchName: string,
  workspace: string,
  title: string,
  description: string,
): Promise<void> => {
  const body: Schema.Pullrequest = {
    title,
    source: {
      branch: {
        name: branchName,
      },
    },
    destination: {
      branch: {
        name: 'main',
      },
    },
    description,
    type: 'pullrequest',
  }

  try {
    const { data } = await bitbucket.pullrequests.create({
      _body: body,
      repo_slug: repoSlug,
      workspace,
    })
    console.log(`Pull Request created: ${data.links?.html?.href}`)
  } catch (error) {
    console.error(`Failed to create Pull Request: ${error}`)
  }
}

export const updateToken = (token: string): void => {
  bitbucketConfig.auth.token = token
}
