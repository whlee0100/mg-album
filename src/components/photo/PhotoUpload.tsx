// src/components/photo/PhotoUpload.tsx
import { useState, useRef, useCallback } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { uploadToCloudinary } from '../../lib/cloudinary';
import { useAuthStore } from '../../store/useAuthStore';
import { UploadCloud, Loader2, X, Check } from 'lucide-react';
import type { Area } from 'react-easy-crop';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../../lib/cropImage';

export default function PhotoUpload() {
    const user = useAuthStore((state) => state.user);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    // ✅ 수정
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const tempUrl = URL.createObjectURL(file);
        setImageSrc(tempUrl);
    };

    const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleUpload = async () => {
        if (!imageSrc || !croppedAreaPixels || !user) return;
        setIsUploading(true);
        try {
            const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
            if (!croppedImageBlob) throw new Error('이미지 변환 실패');

            const downloadUrl = await uploadToCloudinary(croppedImageBlob);

            await addDoc(collection(db, 'photos'), {
                uploaderUid: user.uid,
                originalUrl: downloadUrl,
                createdAt: serverTimestamp(),
            });

            alert('사진이 성공적으로 업로드되었습니다!');
            setImageSrc(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (error) {
            console.error('업로드 실패:', error);
            alert('업로드 중 문제가 발생했습니다.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleCancel = () => {
        setImageSrc(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <>
            <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:bg-blue-300"
            >
                <UploadCloud size={20} />
                <span>사진 올리기</span>
            </button>

            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />

            {imageSrc && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm">
                    <div className="relative flex w-full max-w-2xl flex-col rounded-2xl bg-white p-6 shadow-2xl">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-xl font-bold text-gray-900">사진 자르기 (4:3)</h3>
                            <button onClick={handleCancel} className="text-gray-500 hover:text-gray-800">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="relative h-[50vh] w-full overflow-hidden rounded-lg bg-gray-100 sm:h-[60vh]">
                            <Cropper
                                image={imageSrc}
                                crop={crop}
                                zoom={zoom}
                                aspect={4 / 3}
                                onCropChange={setCrop}
                                onZoomChange={setZoom}
                                onCropComplete={onCropComplete}
                            />
                        </div>
                        <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
                            <input
                                type="range"
                                value={zoom}
                                min={1}
                                max={3}
                                step={0.1}
                                onChange={(e) => setZoom(Number(e.target.value))}
                                className="w-full sm:w-1/2"
                            />
                            <div className="flex w-full space-x-3 sm:w-auto">
                                <button
                                    onClick={handleCancel}
                                    disabled={isUploading}
                                    className="w-full rounded-lg bg-gray-200 px-6 py-2.5 font-medium text-gray-700 hover:bg-gray-300 sm:w-auto"
                                >
                                    취소
                                </button>
                                <button
                                    onClick={handleUpload}
                                    disabled={isUploading}
                                    className="flex w-full items-center justify-center space-x-2 rounded-lg bg-blue-600 px-6 py-2.5 font-medium text-white hover:bg-blue-700 disabled:bg-blue-400 sm:w-auto"
                                >
                                    {isUploading ? (
                                        <>
                                            <Loader2 className="animate-spin" size={20} />
                                            <span>처리 중...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Check size={20} />
                                            <span>업로드</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}