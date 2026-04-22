import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, isFirebaseConfigured } from './firebase';
import { useAuthStore } from './store/authStore';
import { getUserById } from './lib/auth';

import { Login }                from './pages/Login';
import { Setup }                from './pages/Setup';

import { ChildHome }            from './pages/child/ChildHome';
import { AskGrandparent }       from './pages/child/AskGrandparent';
import { ChildConversationView } from './pages/child/ConversationView';
import { ChildMyConversations } from './pages/child/MyConversations';

import { GrandparentHome }             from './pages/grandparent/GrandparentHome';
import { GrandparentConversationView } from './pages/grandparent/ConversationView';
import { GrandparentMyConversations }  from './pages/grandparent/MyConversations';
import { SuggestPrompt }               from './pages/grandparent/SuggestPrompt';

import { ParentDashboard }        from './pages/parent/ParentDashboard';
import { ManageAccounts }         from './pages/parent/ManageAccounts';
import { ManagePrompts }          from './pages/parent/ManagePrompts';
import { AllConversations }       from './pages/parent/AllConversations';
import { ParentConversationView } from './pages/parent/ParentConversationView';
import { ExportPage }             from './pages/parent/ExportPage';

function NotConfigured() {
  return (
    <div className="min-h-screen bg-amber-50 flex items-center justify-center px-6">
      <div className="max-w-sm bg-white rounded-3xl shadow-card-lg p-8 text-center">
        <p className="text-4xl mb-4">⚙️</p>
        <h1 className="text-xl font-black text-gray-800 mb-2">Firebase Not Configured</h1>
        <p className="text-sm text-gray-500 mb-4">
          Copy <code className="bg-gray-100 px-1 rounded">.env.example</code> to{' '}
          <code className="bg-gray-100 px-1 rounded">.env.local</code> and fill in your Firebase credentials, then restart the dev server.
        </p>
        <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-primary-600 text-sm font-semibold underline">
          Open Firebase Console →
        </a>
      </div>
    </div>
  );
}

function AuthWatcher() {
  const { user, setUser } = useAuthStore();

  useEffect(() => {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser && !user) {
        try {
          const profile = await getUserById(firebaseUser.uid);
          if (profile) setUser(profile);
        } catch {
          // silent — user will stay on login
        }
      } else if (!firebaseUser) {
        setUser(null);
      }
    });
  }, []);

  return null;
}

function ProtectedRoute({ children, role }: { children: React.ReactNode; role: string }) {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/" replace />;
  if (user.role !== role) return <Navigate to={`/${user.role === 'grandchild' ? 'child' : user.role}`} replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <>
      <AuthWatcher />
      <Routes>
        <Route path="/"      element={<Login />} />
        <Route path="/setup" element={<Setup />} />

        {/* Child */}
        <Route path="/child" element={<ProtectedRoute role="grandchild"><ChildHome /></ProtectedRoute>} />
        <Route path="/child/ask/:grandparentId" element={<ProtectedRoute role="grandchild"><AskGrandparent /></ProtectedRoute>} />
        <Route path="/child/conversation/:conversationId" element={<ProtectedRoute role="grandchild"><ChildConversationView /></ProtectedRoute>} />
        <Route path="/child/conversations" element={<ProtectedRoute role="grandchild"><ChildMyConversations /></ProtectedRoute>} />

        {/* Grandparent */}
        <Route path="/grandparent" element={<ProtectedRoute role="grandparent"><GrandparentHome /></ProtectedRoute>} />
        <Route path="/grandparent/unanswered" element={<ProtectedRoute role="grandparent"><GrandparentMyConversations unansweredOnly /></ProtectedRoute>} />
        <Route path="/grandparent/conversations" element={<ProtectedRoute role="grandparent"><GrandparentMyConversations /></ProtectedRoute>} />
        <Route path="/grandparent/conversation/:conversationId" element={<ProtectedRoute role="grandparent"><GrandparentConversationView /></ProtectedRoute>} />
        <Route path="/grandparent/suggest" element={<ProtectedRoute role="grandparent"><SuggestPrompt /></ProtectedRoute>} />

        {/* Parent */}
        <Route path="/parent" element={<ProtectedRoute role="parent"><ParentDashboard /></ProtectedRoute>} />
        <Route path="/parent/accounts" element={<ProtectedRoute role="parent"><ManageAccounts /></ProtectedRoute>} />
        <Route path="/parent/prompts" element={<ProtectedRoute role="parent"><ManagePrompts /></ProtectedRoute>} />
        <Route path="/parent/conversations" element={<ProtectedRoute role="parent"><AllConversations /></ProtectedRoute>} />
        <Route path="/parent/conversation/:conversationId" element={<ProtectedRoute role="parent"><ParentConversationView /></ProtectedRoute>} />
        <Route path="/parent/export" element={<ProtectedRoute role="parent"><ExportPage /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  if (!isFirebaseConfigured()) return <NotConfigured />;
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
