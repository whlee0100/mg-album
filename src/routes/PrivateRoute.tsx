// src/routes/PrivateRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export default function PrivateRoute() {
  const { user, isInitialized } = useAuthStore();

  // 아직 로그인 상태를 확인 중이라면 로딩 화면을 보여줍니다.
  if (!isInitialized) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  // 로그인한 유저면 통과(Outlet), 아니면 로그인 화면(/)으로 이동(Navigate).
  return user ? <Outlet /> : <Navigate to="/" replace />;
}