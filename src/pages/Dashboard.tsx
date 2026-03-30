// src/pages/Dashboard.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { useAuthStore } from '../store/useAuthStore';
import { LogOut, Image as ImageIcon } from 'lucide-react';
import PhotoUpload from '../components/photo/PhotoUpload';

interface Photo {
  id: string;
  originalUrl: string;
}

export default function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const [photos, setPhotos] = useState<Photo[]>([]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/', { replace: true });
  };

  // 대시보드가 켜지면 Firestore를 실시간으로 감시합니다.
  useEffect(() => {
    // ✅ 전체 공유 갤러리: 모든 유저의 사진을 최신순으로 표시합니다.
    // 본인 사진만 보려면 where('uploaderUid', '==', user?.uid) 조건을 추가하세요.
    const q = query(collection(db, 'photos'), orderBy('createdAt', 'desc'));

    // onSnapshot: 데이터 변화가 생길 때마다 자동으로 실행됩니다.
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const photoData = snapshot.docs.map((doc) => ({
        id: doc.id,
        originalUrl: doc.data().originalUrl,
      }));
      setPhotos(photoData);
    });

    return () => unsubscribe(); // 화면을 벗어나면 감시 종료
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">

      {/* 상단 네비게이션 바 */}
      <header className="sticky top-0 z-10 border-b bg-white px-6 py-4 shadow-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center space-x-2 text-blue-600">
            <ImageIcon size={28} />
            <h1 className="text-xl font-bold text-gray-900">PicVault</h1>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-600">
              {user?.displayName || '사용자'}님
            </span>
            <PhotoUpload />
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 rounded-md p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-red-500"
              title="로그아웃"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* 메인 사진 갤러리 */}
      <main className="mx-auto max-w-6xl p-6">
        {photos.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 py-32 text-gray-500">
            <ImageIcon size={48} className="mb-4 text-gray-300" />
            <p className="text-lg">아직 업로드된 사진이 없습니다.</p>
            <p className="text-sm">우측 상단의 '사진 올리기' 버튼을 눌러보세요!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="group relative aspect-square overflow-hidden rounded-xl bg-gray-200 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md"
              >
                <img
                  src={photo.originalUrl}
                  alt="uploaded"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}