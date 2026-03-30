// src/lib/cloudinary.ts
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export async function uploadToCloudinary(blob: Blob): Promise<string> {
  // FormData에 파일과 preset 이름을 담아서 Cloudinary 서버에 보냅니다.
  const formData = new FormData();
  formData.append('file', blob);
  formData.append('upload_preset', UPLOAD_PRESET);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error('Cloudinary 업로드 실패');
  }

  const data = await response.json();
  return data.secure_url; // 업로드된 이미지의 https URL 반환
}