// src/lib/cropImage.ts
export default async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number }
): Promise<Blob | null> {
  const image = new Image();
  image.src = imageSrc;

  // 이미지가 완전히 불러와질 때까지 기다립니다.
  // ✅ onerror 처리 추가 - 실패 시 무한 대기 방지
  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = reject;
  });

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // 고정 크기(4:3 비율)로 캔버스를 강제 설정합니다.
  // 원본이 아무리 커도 무조건 800x600으로 최적화됩니다.
  canvas.width = 800;
  canvas.height = 600;

  // 원본 이미지에서 사용자가 선택한 부분만 잘라내어 800x600 캔버스에 꽉 차게 그립니다.
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    canvas.width,
    canvas.height
  );

  // 캔버스를 실제 파일(Blob) 형태로 변환하여 반환합니다. (화질 90%의 JPEG)
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, 'image/jpeg', 0.9);
  });
}