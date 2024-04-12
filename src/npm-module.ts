import axios from 'axios'

export const getLatestPackageVersion = async (
  packageName: string,
): Promise<string | null> => {
  const url = `https://registry.npmjs.org/${packageName}`
  try {
    const response = await axios.get(url)
    return (response.data as { 'dist-tags': { latest: string } })['dist-tags']
      .latest
  } catch (error) {
    console.error('Failed to fetch package version from npm:', error)
    return null
  }
}
