// src/App.tsx
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './lib/firebase';
import { useAuthStore } from './store/useAuthStore';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import PrivateRoute from './routes/PrivateRoute';

function App() {
  const { setUser, setInitialized } = useAuthStore();

  // 앱이 켜질 때 딱 한 번, 구글 서버에 로그인 상태를 물어봅니다.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);    // 유저 정보를 보관함에 저장
      setInitialized(true);    // 확인 완료 표시
    });
    return () => unsubscribe();
  }, [setUser, setInitialized]);

  return (
    <BrowserRouter>
      <Routes>
        {/* 누구나 볼 수 있는 첫 화면 */}
        <Route path="/" element={<Home />} />

        {/* 보안 검색대를 통과해야만 볼 수 있는 화면들 */}
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;