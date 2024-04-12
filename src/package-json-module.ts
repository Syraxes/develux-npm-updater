export const updatePackageJson = (
  content: string,
  packageName: string,
  version: string,
): string => {
  const json = JSON.parse(content)
  let updated = false

  if (json.dependencies && packageName in json.dependencies) {
    json.dependencies[packageName] = version
    updated = true
  }

  if (json.devDependencies && packageName in json.devDependencies) {
    json.devDependencies[packageName] = version
    updated = true
  }

  if (!updated) {
    console.error(
      `Package ${packageName} not found in dependencies or devDependencies.`,
    )
    throw new Error(
      `Package ${packageName} not found in dependencies or devDependencies.`,
    )
  }

  return JSON.stringify(json, null, 2)
}
