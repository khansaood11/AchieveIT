
'use client';

import { auth, db, isFirebaseConfigured } from '@/lib/firebase';
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
  type UserCredential,
  createUserWithEmailAndPassword,
  updateProfile,
  linkWithPopup,
  signInWithCredential,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useRouter, usePathname } from 'next/navigation';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { useToast } from './use-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  fitToken: string | null;
  isConnectingFit: boolean;
  signInWithEmail: (email: string, pass: string) => Promise<any>;
  signUpWithEmail: (name: string, email: string, pass: string) => Promise<any>;
  signInWithGoogle: () => Promise<any>;
  signOut: () => Promise<void>;
  connectGoogleFit: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [fitToken, setFitToken] = useState<string | null>(null);
  const [isConnectingFit, setIsConnectingFit] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if(user) {
        const storedToken = sessionStorage.getItem('fit_token');
        if (storedToken) {
          setFitToken(storedToken);
        }
      } else {
        // Clear token if user logs out
        setFitToken(null);
        sessionStorage.removeItem('fit_token');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);

  useEffect(() => {
    if (loading) return;
    
    const publicPaths = ['/login', '/signup', '/'];
    const pathIsProtected = !publicPaths.includes(pathname);

    if (!user && isFirebaseConfigured && pathIsProtected) {
      router.push('/login');
    }
    
    if (user && !pathIsProtected && pathname !== '/') {
      router.push('/dashboard');
    }
  }, [user, loading, router, pathname]);

  const handleUserCredential = async (userCredential: UserCredential) => {
    const user = userCredential.user;
    const userRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(userRef);

    if (!docSnap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        createdAt: new Date().toISOString(),
        stepGoal: 8000,
      });
    }
    return userCredential;
  }

  const signUpWithEmail = async (name: string, email: string, pass: string) => {
    if (!isFirebaseConfigured) return Promise.reject(new Error("Firebase not configured"));
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    await updateProfile(userCredential.user, { displayName: name });
    return handleUserCredential(userCredential);
  };

  const signInWithEmail = (email: string, pass: string) => {
    if (!isFirebaseConfigured) return Promise.reject(new Error("Firebase not configured"));
    return signInWithEmailAndPassword(auth, email, pass);
  };
  
  const signInWithGoogle = async () => {
    if (!isFirebaseConfigured) return Promise.reject(new Error("Firebase not configured"));
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return handleUserCredential(result);
  };

  const connectGoogleFit = async () => {
      if (!isFirebaseConfigured || !auth.currentUser) {
        toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to connect Google Fit.' });
        return;
      }
      
      setIsConnectingFit(true);
      const provider = new GoogleAuthProvider();
      provider.addScope('https://www.googleapis.com/auth/fitness.activity.read');
      
      try {
          const result = await linkWithPopup(auth.currentUser, provider);
          const credential = GoogleAuthProvider.credentialFromResult(result);
          if (credential?.accessToken) {
              setFitToken(credential.accessToken);
              sessionStorage.setItem('fit_token', credential.accessToken);
              toast({ title: 'Success!', description: 'Google Fit connected successfully.' });
          } else {
             throw new Error("Could not get access token.");
          }
      } catch (error: any) {
          if (error.code === 'auth/credential-already-in-use') {
            try {
              const credential = GoogleAuthProvider.credentialFromError(error);
              if (credential) {
                const result = await signInWithCredential(auth, credential);
                 if (result.user && credential.accessToken) {
                    setFitToken(credential.accessToken);
                    sessionStorage.setItem('fit_token', credential.accessToken);
                    toast({ title: 'Success!', description: 'Google Fit connected successfully.' });
                 }
              }
            } catch (mergeError: any) {
               console.error("Error merging accounts:", mergeError);
               toast({ variant: 'destructive', title: 'Connection Failed', description: 'Could not link accounts. Please contact support.' });
            }
          } else if (error.code !== 'auth/popup-closed-by-user') {
            console.error("Error connecting Google Fit:", error);
            toast({ variant: 'destructive', title: 'Connection Failed', description: error.message });
          }
      } finally {
        setIsConnectingFit(false);
      }
  };

  const signOut = async () => {
    if (!isFirebaseConfigured) return;
    await firebaseSignOut(auth);
    // Force redirect to the landing page immediately after signing out.
    // This prevents the useEffect hook from incorrectly redirecting to /login.
    window.location.href = '/';
  };

  const value = { user, loading, fitToken, isConnectingFit, signInWithEmail, signUpWithEmail, signInWithGoogle, signOut, connectGoogleFit };
  
   if (!isFirebaseConfigured && !loading) {
     return (
        <div className="flex h-screen items-center justify-center p-4 text-center">
            <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-destructive">
                <h2 className="font-bold">Firebase Not Configured</h2>
                <p>Please check your `.env.local` file and ensure all Firebase variables are set correctly. See `HOW_TO_GET_FIREBASE_KEYS.md` for instructions.</p>
            </div>
        </div>
     )
  }

  if (loading && pathname !== '/') {
      return (
          <div className="flex h-screen items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
          </div>
      )
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
