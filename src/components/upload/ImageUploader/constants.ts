import { MAX_FILE_SIZE, ACCEPTED_IMAGE_TYPES } from '@/lib/constants/app'

export const UPLOAD_CONSTRAINTS = {
  maxSize: MAX_FILE_SIZE,
  acceptedTypes: ACCEPTED_IMAGE_TYPES,
  maxSizeMB: MAX_FILE_SIZE / 1024 / 1024,
}

export const ERROR_MESSAGES = {
  NO_FILE: '이미지를 먼저 선택해주세요',
  INVALID_TYPE: '이미지 파일만 업로드 가능합니다 (JPEG, PNG, WebP)',
  FILE_TOO_LARGE: `이미지 크기는 ${UPLOAD_CONSTRAINTS.maxSizeMB}MB 이하여야 합니다`,
  UPLOAD_FAILED: '분석 중 오류가 발생했습니다',
  UNKNOWN_ERROR: '알 수 없는 오류가 발생했습니다',
}
