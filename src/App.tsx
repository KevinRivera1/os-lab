import { Navigate, Route, Routes } from 'react-router-dom'
import { DashboardLayout } from './layouts/DashboardLayout'
import { Dashboard } from './pages/Dashboard'
import { Introduction } from './pages/Introduction'
import { Organization } from './pages/Organization'
import { Processes } from './pages/Processes'
import { Memory } from './pages/Memory'
import { Storage } from './pages/Storage'
import { SystemTimeline } from './labs/introduction/SystemTimeline'
import { ArchitectureExplorer } from './labs/organization/ArchitectureExplorer'
import { CpuScheduling } from './labs/processes/CpuScheduling'
import { ProcessSimulator } from './labs/processes/ProcessSimulator'
import { Synchronization } from './labs/processes/Synchronization'
import { SharedMemory } from './labs/processes/SharedMemory'
import { MessagePassing } from './labs/processes/MessagePassing'
import { Threads } from './labs/processes/Threads'
import { MainMemory } from './labs/memory/MainMemory'
import { Paging } from './labs/memory/Paging'
import { VirtualMemory } from './labs/memory/VirtualMemory'
import { SecondaryStorage } from './labs/storage/SecondaryStorage'
import { FileSystem } from './labs/storage/FileSystem'
import { FileAllocation } from './labs/storage/FileAllocation'

export default function App() {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route index element={<Dashboard />} />

        <Route path="introduction" element={<Introduction />} />
        <Route path="organization" element={<Organization />} />
        <Route path="processes" element={<Processes />} />
        <Route path="memory" element={<Memory />} />
        <Route path="storage" element={<Storage />} />

        <Route path="labs/introduction/timeline" element={<SystemTimeline />} />
        <Route path="labs/organization/architecture" element={<ArchitectureExplorer />} />

        <Route path="labs/processes/cpu-scheduling" element={<CpuScheduling />} />
        <Route path="labs/processes/states" element={<ProcessSimulator />} />
        <Route path="labs/processes/synchronization" element={<Synchronization />} />
        <Route path="labs/processes/shared-memory" element={<SharedMemory />} />
        <Route path="labs/processes/message-passing" element={<MessagePassing />} />
        <Route path="labs/processes/threads" element={<Threads />} />

        <Route path="labs/memory/main-memory" element={<MainMemory />} />
        <Route path="labs/memory/paging" element={<Paging />} />
        <Route path="labs/memory/virtual-memory" element={<VirtualMemory />} />

        <Route path="labs/storage/secondary-storage" element={<SecondaryStorage />} />
        <Route path="labs/storage/file-system" element={<FileSystem />} />
        <Route path="labs/storage/file-allocation" element={<FileAllocation />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
