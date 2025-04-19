import { useEffect } from 'react';
import { useRouter } from 'expo-router';

// This is a simple redirect page to handle any direct navigation to /auth
export default function AuthIndex() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to login page if someone tries to access /auth directly
    router.replace('/login');
  }, [router]);
  
  // Return null while redirecting
  return null;
} 