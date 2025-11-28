import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/Home'
import AssessmentPage from './pages/Assessment'
import MatchesPage from './pages/Matches'
import JobDetailsPage from './pages/JobDetails'
import AgentsDemoPage from './pages/agents/Demo'
import AgentPage from './pages/agents/[agentId]'
import WorkflowPage from './pages/workflow/[workflowId]'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/assessment" element={<AssessmentPage />} />
        <Route path="/matches" element={<MatchesPage />} />
        <Route path="/jobs/:jobId" element={<JobDetailsPage />} />
        <Route path="/agents/demo" element={<AgentsDemoPage />} />
        <Route path="/agents/:agentId" element={<AgentPage />} />
        <Route path="/workflow/:workflowId" element={<WorkflowPage />} />
        {/* Add other routes as needed */}
      </Routes>
    </Layout>
  )
}

