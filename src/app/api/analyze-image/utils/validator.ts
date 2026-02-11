import { MAX_FILE_SIZE, ACCEPTED_IMAGE_TYPES } from '@/lib/constants/app'

export interface ValidationResult {
  success: boolean
  error?: string
}

export function validateImageRequest(body: any): ValidationResult {
  // Check if body exists
  if (!body) {
    return { success: false, error: '요청 본문이 비어있습니다' }
  }

  // Check if image exists
  if (!body.image) {
    return { success: false, error: '이미지가 제공되지 않았습니다' }
  }

  // Check if image is a string
  if (typeof body.image !== 'string') {
    return { success: false, error: '이미지 형식이 올바르지 않습니다' }
  }

  // Check image size (roughly - base64 is ~33% larger than original)
  const estimatedSize = (body.image.length * 3) / 4
  if (estimatedSize > MAX_FILE_SIZE) {
    return {
      success: false,
      error: `이미지 크기는 ${MAX_FILE_SIZE / 1024 / 1024}MB 이하여야 합니다`,
    }
  }

  return { success: true }
}
