export const uploadLogo = async (file: File): Promise<string> => {
  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', 'logos_preset')
    formData.append('folder', 'logos')

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    )

    if (!response.ok) {
      const error = await response.json()
      console.error('Upload error:', error)
      throw new Error('Upload failed: ' + error.message)
    }

    const data = await response.json()
    return data.secure_url
  } catch (error) {
    console.error('Upload error:', error)
    throw error
  }
} 