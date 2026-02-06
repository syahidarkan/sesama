'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';

const IDLE_TIMEOUT = 5 * 60 * 1000; // 5 menit dalam milidetik

export default function IdleTimeout() {
  const router = useRouter();
  const { isAuthenticated, logout } = useAuthStore();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimeout = () => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    if (isAuthenticated()) {
      timeoutRef.current = setTimeout(() => {
        console.log('⏱️ Session timeout - User idle selama 5 menit');
        alert('Sesi Anda telah berakhir karena tidak ada aktivitas selama 5 menit. Silakan login kembali.');
        logout();
        router.push('/login');
      }, IDLE_TIMEOUT);
    }
  };

  useEffect(() => {
    if (!isAuthenticated()) {
      return;
    }

    // Events yang mendeteksi user activity
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ];

    // Reset timeout setiap kali ada activity
    events.forEach((event) => {
      window.addEventListener(event, resetTimeout);
    });

    // Initialize timeout
    resetTimeout();

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      events.forEach((event) => {
        window.removeEventListener(event, resetTimeout);
      });
    };
  }, [isAuthenticated, logout, router]);

  return null; // Component ini tidak render apapun
}
