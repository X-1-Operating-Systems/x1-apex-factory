import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import { Navigate } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import AppShell from '@/components/AppShell';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import Dashboard from '@/pages/Dashboard';
import Studio from '@/pages/Studio';
import TaskDetail from '@/pages/TaskDetail';
import NewTask from '@/pages/NewTask';
import TemplateLibrary from '@/pages/TemplateLibrary';
import Playbooks from '@/pages/Playbooks';
import SharedView from '@/pages/SharedView';
import Releases from '@/pages/Releases';
import Library from '@/pages/Library';
import Artifacts from '@/pages/Artifacts';
import Files from '@/pages/Files';
import Computers from '@/pages/Computers';
import Agents from '@/pages/Agents';
import Skills from '@/pages/Skills';
import Websites from '@/pages/Websites';
import WebsiteDetail from '@/pages/WebsiteDetail';
import Automations from '@/pages/Automations';
import Plugins from '@/pages/Plugins';
import Account from '@/pages/Account';
import Search from '@/pages/Search';
import Notifications from '@/pages/Notifications';
import SettingsLayout from '@/pages/settings/SettingsLayout';
import SettingsProfile from '@/pages/settings/SettingsProfile';
import SettingsAppearance from '@/pages/settings/SettingsAppearance';
import SettingsNotifications from '@/pages/settings/SettingsNotifications';
import SettingsConnections from '@/pages/settings/SettingsConnections';
import SettingsUsage from '@/pages/settings/SettingsUsage';
import SettingsTeam from '@/pages/settings/SettingsTeam';
import SettingsSecurity from '@/pages/settings/SettingsSecurity';
import SettingsData from '@/pages/settings/SettingsData';
import AdminControl from '@/pages/AdminControl';
import VideoStudio from '@/pages/VideoStudio';
import LiveAvatar from '@/pages/LiveAvatar';
import Autopilot from '@/pages/Autopilot';
import CodeFactory from '@/pages/CodeFactory';
import Guardian from '@/pages/Guardian';
import Truth from '@/pages/Truth';
import OAuthConsent from '@/pages/OAuthConsent';
// Add page imports here

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/share/:token" element={<SharedView />} />
      <Route path="/handoff/:token" element={<SharedView />} />
      <Route path="/oauth/consent" element={<OAuthConsent />} />

      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route element={<AppShell />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/admin" element={<AdminControl />} />
          <Route path="/autopilot" element={<Autopilot />} />
          <Route path="/code-factory" element={<CodeFactory />} />
          <Route path="/guardian" element={<Guardian />} />
          <Route path="/truth" element={<Truth />} />
          <Route path="/video" element={<VideoStudio />} />
          <Route path="/live" element={<LiveAvatar />} />
          <Route path="/studio/:id" element={<Studio />} />
          <Route path="/new" element={<NewTask />} />
          <Route path="/task/:id" element={<TaskDetail />} />
          <Route path="/templates" element={<TemplateLibrary />} />
          <Route path="/playbooks" element={<Playbooks />} />
          <Route path="/releases" element={<Releases />} />
          <Route path="/library" element={<Library />} />
          <Route path="/artifacts" element={<Artifacts />} />
          <Route path="/files" element={<Files />} />
          <Route path="/computers" element={<Computers />} />
          <Route path="/agents" element={<Agents />} />
          <Route path="/skills" element={<Skills />} />
          <Route path="/websites" element={<Websites />} />
          <Route path="/websites/:taskId" element={<WebsiteDetail />} />
          <Route path="/automations" element={<Automations />} />
          <Route path="/plugins" element={<Plugins />} />
          <Route path="/account" element={<Account />} />
          <Route path="/search" element={<Search />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/settings" element={<SettingsLayout />}>
            <Route index element={<Navigate to="/settings/profile" replace />} />
            <Route path="profile" element={<SettingsProfile />} />
            <Route path="appearance" element={<SettingsAppearance />} />
            <Route path="notifications" element={<SettingsNotifications />} />
            <Route path="connections" element={<SettingsConnections />} />
            <Route path="usage" element={<SettingsUsage />} />
            <Route path="team" element={<SettingsTeam />} />
            <Route path="security" element={<SettingsSecurity />} />
            <Route path="data" element={<SettingsData />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App