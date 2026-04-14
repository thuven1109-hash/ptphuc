import { useState, useEffect } from 'react';
import { auth, db, signInWithPopup, googleProvider, signOut, onAuthStateChanged } from '../firebase';
import { doc, getDoc, setDoc, collection, onSnapshot, query, writeBatch } from 'firebase/firestore';
import { ChatSession, UserProfile, MusicState } from '../types';

export function useFirestoreSync(
  setSessions: (sessions: ChatSession[]) => void,
  setUserProfiles: (profiles: UserProfile[]) => void,
  setMusicState: (state: MusicState) => void,
  setApiKey: (key: string | null) => void,
  setSelectedModel: (model: string) => void
) {
  const [user, setUser] = useState(auth.currentUser);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
    });
    return unsubscribe;
  }, []);

  // Load data when user changes
  useEffect(() => {
    if (!isAuthReady) return;
    
    if (user) {
      // Load User Data
      const userRef = doc(db, 'users', user.uid);
      const unsubUser = onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.userProfiles) setUserProfiles(data.userProfiles);
          if (data.musicState) setMusicState(data.musicState);
          if (data.apiKey) setApiKey(data.apiKey);
          if (data.selectedModel) setSelectedModel(data.selectedModel);
        }
      }, (error) => {
        console.error("Error loading user data:", error);
      });

      // Load Sessions
      const sessionsRef = collection(db, `users/${user.uid}/sessions`);
      const unsubSessions = onSnapshot(sessionsRef, (snapshot) => {
        const loadedSessions: ChatSession[] = [];
        snapshot.forEach((doc) => {
          loadedSessions.push(doc.data() as ChatSession);
        });
        // Sort by lastUpdate descending
        loadedSessions.sort((a, b) => b.lastUpdate - a.lastUpdate);
        setSessions(loadedSessions);
      }, (error) => {
        console.error("Error loading sessions:", error);
      });

      return () => {
        unsubUser();
        unsubSessions();
      };
    }
  }, [user, isAuthReady]);

  const login = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const syncUserDataToFirestore = async (
    apiKey: string | null,
    selectedModel: string,
    userProfiles: UserProfile[],
    musicState: MusicState
  ) => {
    if (!user) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        uid: user.uid,
        apiKey: apiKey || '',
        selectedModel,
        userProfiles,
        musicState
      }, { merge: true });
    } catch (error) {
      console.error("Error syncing user data:", error);
    }
  };

  const syncSessionToFirestore = async (session: ChatSession) => {
    if (!user) return;
    try {
      const sessionRef = doc(db, `users/${user.uid}/sessions`, session.id);
      await setDoc(sessionRef, { ...session, uid: user.uid }, { merge: true });
    } catch (error) {
      console.error("Error syncing session:", error);
    }
  };

  const deleteSessionFromFirestore = async (sessionId: string) => {
    if (!user) return;
    try {
      const sessionRef = doc(db, `users/${user.uid}/sessions`, sessionId);
      const batch = writeBatch(db);
      batch.delete(sessionRef);
      await batch.commit();
    } catch (error) {
      console.error("Error deleting session:", error);
    }
  };

  return {
    user,
    isAuthReady,
    login,
    logout,
    syncUserDataToFirestore,
    syncSessionToFirestore,
    deleteSessionFromFirestore
  };
}
