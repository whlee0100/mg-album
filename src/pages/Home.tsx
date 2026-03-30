// src/pages/Home.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { useAuthStore } from '../store/useAuthStore';
import { Camera, LogIn } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  // 이미 로그인된 유저라면 대시보드로 바로 이동시킵니다.
  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);

      // ⭐️ UX용 1차 이메일 검증 (실제 보안은 Firestore Rules에서 처리)
      const userEmail = result.user.email;
      if (!userEmail?.endsWith('@gvcs-mg.org')) {
        alert('학교 공식 이메일(@gvcs-mg.org)로만 로그인할 수 있습니다!');
        await signOut(auth);
        return;
      }

      // 학교 이메일이 맞다면 App.tsx의 onAuthStateChanged가 감지하여
      // 위의 useEffect를 통해 자동으로 대시보드로 이동합니다.

    } catch (error) {
      console.error('로그인 실패:', error);
      alert('로그인 중 오류가 발생했습니다. 다시 시도해 주세요.');
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-10 shadow-xl text-center">

        {/* 로고 및 타이틀 */}
        <div className="flex flex-col items-center space-y-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <Camera size={40} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            PicVault
          </h1>
          <p className="text-sm text-gray-500">
            GVCS 전용 클라우드 사진첩에 오신 것을 환영합니다.<br />
            학교 이메일로 로그인하여 사진을 공유해 보세요.
          </p>
        </div>

        {/* 로그인 버튼 */}
        <div className="pt-8">
          <button
            onClick={handleGoogleLogin}
            className="group relative flex w-full items-center justify-center space-x-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <LogIn size={20} className="text-gray-400 transition-colors group-hover:text-blue-500" />
            <span>Google 계정으로 시작하기</span>
          </button>
        </div>

      </div>
    </div>
  );
}