import { Storage, Auth } from "aws-amplify"

export async function s3Upload(file) {
  const user = await Auth.currentAuthenticatedUser()

  const filename = `${user.attributes.sub}:${Date.now()}-${file.name}`

  const stored = await Storage.put(filename, file, {
    contentType: file.type
  })

  return stored.key
}
