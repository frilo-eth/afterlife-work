export const uploadLogo = async (file: File): Promise<string> => {
  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', 'logos_preset')
    formData.append('folder', 'logos')

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    if (!cloudName) {
      throw new Error('Cloudinary cloud name is not configured')
    }

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Upload error:', error)
      throw new Error(`Upload failed: ${error.message ?? 'Unknown error'}`)
    }

    const data = await response.json()
    return data.secure_url
  } catch (error) {
    console.error('Upload error:', error)
    throw new Error(error instanceof Error ? error.message : 'Unknown upload error')
  }
}
