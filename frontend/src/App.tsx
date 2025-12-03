import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import HomePage from './pages/Home'
import AssessmentPage from './pages/Assessment'
import MatchesPage from './pages/Matches'
import JobDetailsPage from './pages/JobDetails'
import AgentsDemoPage from './pages/agents/Demo'
import AgentPage from './pages/agents/[agentId]'
import WorkflowPage from './pages/workflow/[workflowId]'
import PrivacyPage from './pages/Privacy'
import TermsPage from './pages/Terms'

export default function App() {
  const location = useLocation()
  
  // Don't render React Router for API routes - let them go to backend/Vercel
  // This is a safety check in case React Router still initializes
  if (location.pathname.startsWith('/api') || location.pathname.startsWith('/health')) {
    // Return empty fragment - React Router should not have initialized for these routes
    return <></>
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/assess" element={<Navigate to="/assessment" replace />} />
        <Route path="/assessment" element={<AssessmentPage />} />
        <Route path="/matches" element={<MatchesPage />} />
        <Route path="/jobs/:jobId" element={<JobDetailsPage />} />
        <Route 
          path="/agents/demo" 
          element={
            <ProtectedRoute>
              <AgentsDemoPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/agents/:agentId" 
          element={
            <ProtectedRoute>
              <AgentPage />
            </ProtectedRoute>
          } 
        />
        <Route path="/workflow/:workflowId" element={<WorkflowPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
      </Routes>
    </Layout>
  )
}

