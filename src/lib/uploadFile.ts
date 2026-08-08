import { v2 as cloudinary } from 'cloudinary'

interface CloudinaryResponse {
  secure_url: string;
  public_id: string;
  format: string;
  resource_type: string;
}

// Test Cloudinary configuration
const testCloudinaryConfig = () => {
  const requiredVars = [
    'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET'
  ]
  
  const missingVars = requiredVars.filter(varName => !process.env[varName])
  
  if (missingVars.length > 0) {
    throw new Error(`Missing Cloudinary environment variables: ${missingVars.join(', ')}`)
  }

  cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  })

  // Test connection
  return cloudinary.api.ping()
    .then(() => console.log('✅ Cloudinary connection successful'))
    .catch(error => {
      console.error('❌ Cloudinary connection failed:', error)
      throw error
    })
}

// Initialize and test connection on startup
testCloudinaryConfig()
  .catch(error => console.error('Cloudinary initialization failed:', error))

export async function uploadFile(file: File): Promise<CloudinaryResponse> {
  try {
    console.log('Starting file upload...', {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size
    })

    const buffer = await file.arrayBuffer()
    console.log('File buffer created successfully')

    const result = await new Promise<CloudinaryResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { 
          resource_type: 'auto',
          folder: 'logo-submissions'
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error)
            reject(error)
          } else if (!result) {
            reject(new Error('No result from Cloudinary'))
          } else {
            console.log('File uploaded successfully:', result.secure_url)
            resolve(result as CloudinaryResponse)
          }
        }
      )

      // Handle stream errors
      uploadStream.on('error', (error) => {
        console.error('Upload stream error:', error)
        reject(error)
      })

      // Write buffer to stream
      uploadStream.end(Buffer.from(buffer))
    })

    return result
  } catch (error) {
    console.error('Upload error details:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    })
    throw new Error('Failed to upload file')
  }
}

// Test upload function
export async function testUpload() {
  try {
    // Create a small test file
    const testData = new Uint8Array([0, 1, 2, 3, 4])
    const testFile = new File([testData], 'test.txt', { type: 'text/plain' })
    
    console.log('Starting test upload...')
    const result = await uploadFile(testFile)
    console.log('Test upload successful:', result)
    return true
  } catch (error) {
    console.error('Test upload failed:', error)
    return false
  }
}

// Run test if in development
if (process.env.NODE_ENV === 'development') {
  testUpload()
    .then(success => console.log('Upload test:', success ? '✅ Passed' : '❌ Failed'))
    .catch(error => console.error('Upload test error:', error))
} 