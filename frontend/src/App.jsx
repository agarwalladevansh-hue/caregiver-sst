import { useMemo, useState } from 'react'
import {
  Activity,
  Brain,
  LayoutDashboard,
  LineChart,
  Moon,
  PlayCircle,
  Settings,
  Sun,
  Users,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart as ReLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const navItems = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'match', label: 'Match', icon: Users },
  { key: 'analytics', label: 'Analytics', icon: LineChart },
  { key: 'training', label: 'Settings', icon: Settings },
]

const summaryCards = [
  { label: 'Total Requests', value: '4,218', delta: '+8.1%' },
  { label: 'Successful Matches', value: '3,987', delta: '+5.7%' },
  { label: 'Average Quality Score', value: '92.4%', delta: '+1.2%' },
  { label: 'Active Caregivers', value: '265', delta: '+11.9%' },
]

const recentMatches = [
  { id: 'M-1001', parent: 'Parker', caregiver: 'Sophia L', score: 96, status: 'Matched' },
  { id: 'M-1002', parent: 'Miller', caregiver: 'Liam C', score: 91, status: 'Matched' },
  { id: 'M-1003', parent: 'Adams', caregiver: 'Ava M', score: 87, status: 'Pending' },
  { id: 'M-1004', parent: 'Clark', caregiver: 'Noah P', score: 94, status: 'Matched' },
  { id: 'M-1005', parent: 'Lewis', caregiver: 'Emma R', score: 89, status: 'Reviewing' },
]

const caregiverPool = [
  { id: 'CG-01', rating: 4.9, available: true, distance: 2.1, experience: 6, cancellationRate: 2, bookings: 181, responseTime: 7 },
  { id: 'CG-02', rating: 4.7, available: true, distance: 3.8, experience: 8, cancellationRate: 4, bookings: 220, responseTime: 11 },
  { id: 'CG-03', rating: 4.8, available: true, distance: 1.4, experience: 5, cancellationRate: 1, bookings: 160, responseTime: 6 },
  { id: 'CG-04', rating: 4.6, available: false, distance: 2.7, experience: 9, cancellationRate: 5, bookings: 245, responseTime: 10 },
  { id: 'CG-05', rating: 4.5, available: true, distance: 4.2, experience: 7, cancellationRate: 3, bookings: 205, responseTime: 9 },
]

const successRateData = [
  { month: 'Jan', success: 86 },
  { month: 'Feb', success: 89 },
  { month: 'Mar', success: 90 },
  { month: 'Apr', success: 93 },
  { month: 'May', success: 92 },
  { month: 'Jun', success: 95 },
]

const rewardData = [
  { epoch: 'E1', reward: 18 },
  { epoch: 'E2', reward: 24 },
  { epoch: 'E3', reward: 32 },
  { epoch: 'E4', reward: 29 },
  { epoch: 'E5', reward: 36 },
  { epoch: 'E6', reward: 41 },
]

const caregiverPerformance = [
  { name: 'CG-01', score: 95 },
  { name: 'CG-02', score: 89 },
  { name: 'CG-03', score: 93 },
  { name: 'CG-04', score: 85 },
  { name: 'CG-05', score: 88 },
]

function Card({ children, className = '' }) {
  return (
    <div className={`rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-soft backdrop-blur-sm transition hover:shadow-soft-lg dark:border-slate-700 dark:bg-slate-900/70 ${className}`}>
      {children}
    </div>
  )
}

function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-md bg-slate-200 dark:bg-slate-700 ${className}`}></div>
}

function DashboardPage() {
  return (
    <section className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((item) => (
          <Card key={item.label}>
            <p className="text-sm text-slate-500 dark:text-slate-300">{item.label}</p>
            <div className="mt-2 flex items-end justify-between">
              <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{item.value}</h3>
              <span className="rounded-full bg-secondary/20 px-2 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                {item.delta}
              </span>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Recent Matches</h3>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">Live Queue</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="text-slate-500 dark:text-slate-300">
              <tr>
                <th className="py-3">Match ID</th><th>Parent</th><th>Caregiver</th><th>Score</th><th>Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {recentMatches.map((match) => (
                <tr key={match.id} className="transition hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="py-3 font-medium text-slate-800 dark:text-slate-200">{match.id}</td>
                  <td>{match.parent}</td>
                  <td>{match.caregiver}</td>
                  <td>{match.score}%</td>
                  <td>
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
                      match.status === 'Matched'
                        ? 'bg-secondary/20 text-emerald-700 dark:text-emerald-300'
                        : 'bg-accent/20 text-amber-700 dark:text-amber-300'
                    }`}>
                      {match.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </section>
  )
}

function MatchPage() {
  const [request, setRequest] = useState({ urgency: 0.6, duration: 4, age: 5 })
  const [running, setRunning] = useState(false)
  const [selectedId, setSelectedId] = useState('')

  const scoredCaregivers = useMemo(
    () =>
      caregiverPool.map((caregiver) => {
        const score =
          caregiver.rating * 16 +
          (caregiver.available ? 15 : 0) +
          (8 - caregiver.distance) * 4 +
          caregiver.experience * 2 -
          caregiver.cancellationRate * 2 +
          caregiver.bookings / 15 -
          caregiver.responseTime
        return { ...caregiver, score: Math.max(0, Math.min(100, Math.round(score))) }
      }),
    []
  )

  const runMatch = () => {
    setRunning(true)
    setSelectedId('')
    setTimeout(() => {
      const top = [...scoredCaregivers].sort((a, b) => b.score - a.score)[0]
      setSelectedId(top.id)
      setRunning(false)
    }, 1200)
  }

  return (
    <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
      <Card className="xl:col-span-4">
        <h3 className="mb-5 text-lg font-semibold text-slate-800 dark:text-slate-100">Parent Request Panel</h3>
        <div className="space-y-5">
          <label className="block">
            <div className="mb-2 flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
              <span>Urgency (0-1)</span>
              <span className="font-semibold text-primary">{request.urgency.toFixed(2)}</span>
            </div>
            <input type="range" min="0" max="1" step="0.01" value={request.urgency} onChange={(e) => setRequest((p) => ({ ...p, urgency: Number(e.target.value) }))} className="w-full accent-primary" />
          </label>
          <label className="block text-sm text-slate-600 dark:text-slate-300">
            Duration (hours)
            <input type="number" min="1" max="12" value={request.duration} onChange={(e) => setRequest((p) => ({ ...p, duration: Number(e.target.value) }))} className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 outline-none transition focus:border-primary dark:border-slate-600 dark:bg-slate-800" />
          </label>
          <label className="block text-sm text-slate-600 dark:text-slate-300">
            Child age
            <input type="number" min="0" max="15" value={request.age} onChange={(e) => setRequest((p) => ({ ...p, age: Number(e.target.value) }))} className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 outline-none transition focus:border-primary dark:border-slate-600 dark:bg-slate-800" />
          </label>
          <button onClick={runMatch} className="w-full rounded-xl bg-gradient-to-r from-primary to-blue-400 px-4 py-2.5 font-semibold text-white transition hover:scale-[1.01] hover:shadow-lg">
            {running ? 'Running Match...' : 'Run Match'}
          </button>
        </div>
      </Card>

      <div className="space-y-6 xl:col-span-8">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {running
            ? Array.from({ length: 5 }).map((_, index) => (
                <Card key={index}>
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="mt-3 h-3 w-full" />
                  <Skeleton className="mt-2 h-3 w-4/5" />
                  <Skeleton className="mt-4 h-9 w-full" />
                </Card>
              ))
            : scoredCaregivers.map((c) => (
                <Card
                  key={c.id}
                  className={`border transition-all ${selectedId === c.id ? 'border-secondary ring-2 ring-secondary/30' : ''}`}
                >
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="font-semibold text-slate-800 dark:text-slate-100">{c.id}</h4>
                    <span className="tooltip rounded-full bg-primary/10 px-2 py-1 text-xs text-primary" data-tip="Model confidence score">
                      {c.score}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300">
                    <span>Rating: {c.rating}</span><span>Availability: {c.available ? 'Yes' : 'No'}</span>
                    <span>Distance: {c.distance} km</span><span>Experience: {c.experience} yrs</span>
                    <span>Cancellation: {c.cancellationRate}%</span><span>Bookings: {c.bookings}</span>
                    <span>Response: {c.responseTime} min</span>
                  </div>
                </Card>
              ))}
        </div>
        <Card>
          <h4 className="mb-4 font-semibold text-slate-800 dark:text-slate-100">Match Score Visualization</h4>
          <div className="h-60 w-full">
            <ResponsiveContainer>
              <BarChart data={scoredCaregivers}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="id" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="score" fill="#4F8EF7" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {selectedId ? (
            <p className="mt-3 inline-flex rounded-full bg-secondary/20 px-3 py-1 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
              AI Selected Caregiver: {selectedId}
            </p>
          ) : null}
        </Card>
      </div>
    </section>
  )
}

function AnalyticsPage() {
  return (
    <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card>
        <h4 className="mb-4 font-semibold text-slate-800 dark:text-slate-100">Success Rate Graph</h4>
        <div className="h-64">
          <ResponsiveContainer>
            <ReLineChart data={successRateData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="success" stroke="#4F8EF7" strokeWidth={3} />
            </ReLineChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card>
        <h4 className="mb-4 font-semibold text-slate-800 dark:text-slate-100">Reward Distribution</h4>
        <div className="h-64">
          <ResponsiveContainer>
            <AreaChart data={rewardData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="epoch" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="reward" stroke="#F59E0B" fill="#F59E0B55" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card className="lg:col-span-2">
        <h4 className="mb-4 font-semibold text-slate-800 dark:text-slate-100">Caregiver Performance</h4>
        <div className="h-72">
          <ResponsiveContainer>
            <BarChart data={caregiverPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="score" fill="#6EE7B7" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </section>
  )
}

function TrainingPage() {
  const [running, setRunning] = useState(false)
  const [progress, setProgress] = useState(42)
  const [steps, setSteps] = useState(42000)

  const toggleTraining = () => {
    if (running) {
      setRunning(false)
      return
    }
    setRunning(true)
    const timer = setInterval(() => {
      setProgress((p) => Math.min(p + 2, 100))
      setSteps((s) => s + 1200)
    }, 600)
    setTimeout(() => {
      clearInterval(timer)
      setRunning(false)
    }, 4200)
  }

  return (
    <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card>
        <h4 className="mb-4 font-semibold text-slate-800 dark:text-slate-100">Model Training</h4>
        <div className="space-y-4">
          <div>
            <div className="mb-1 flex justify-between text-sm">
              <span>Training Progress</span>
              <span className="font-semibold">{progress}%</span>
            </div>
            <div className="h-3 w-full rounded-full bg-slate-200 dark:bg-slate-700">
              <div className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-500" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-slate-100 p-3 dark:bg-slate-800">
            <span className="text-sm text-slate-600 dark:text-slate-300">Timesteps</span>
            <span className="font-semibold">{steps.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className={`h-2.5 w-2.5 rounded-full ${running ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
            <span className="text-slate-600 dark:text-slate-300">Model Status: {running ? 'Training' : 'Idle'}</span>
          </div>
          <button onClick={toggleTraining} className="rounded-xl bg-slate-900 px-4 py-2.5 font-semibold text-white transition hover:opacity-90 dark:bg-white dark:text-slate-900">
            {running ? 'Stop Training' : 'Start Training'}
          </button>
        </div>
      </Card>
      <Card>
        <h4 className="mb-4 font-semibold text-slate-800 dark:text-slate-100">Reward Graph</h4>
        <div className="h-72">
          <ResponsiveContainer>
            <ReLineChart data={rewardData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="epoch" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="reward" stroke="#4F8EF7" strokeWidth={3} />
            </ReLineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </section>
  )
}

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [darkMode, setDarkMode] = useState(false)

  const renderPage = () => {
    if (activeTab === 'dashboard') return <DashboardPage />
    if (activeTab === 'match') return <MatchPage />
    if (activeTab === 'analytics') return <AnalyticsPage />
    return <TrainingPage />
  }

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-bg text-text transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
        <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/70">
          <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-gradient-to-r from-primary to-secondary p-2 text-white shadow">
                <Brain size={18} />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight">CareMatch RL</h1>
                <p className="text-xs text-slate-500 dark:text-slate-300">Reinforcement learning childcare matching</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="rounded-xl border border-slate-300 p-2 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                onClick={() => setDarkMode((prev) => !prev)}
                aria-label="Toggle theme"
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl px-4 py-6">
          <nav className="mb-6 flex flex-wrap gap-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = activeTab === item.key
              return (
                <button
                  key={item.key}
                  onClick={() => setActiveTab(item.key)}
                  className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition ${
                    active
                      ? 'border-primary bg-primary text-white shadow'
                      : 'border-slate-300 bg-white text-slate-700 hover:border-primary/50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200'
                  }`}
                >
                  <Icon size={16} />
                  {item.label}
                </button>
              )
            })}
          </nav>

          <section className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-3">
            <Card className="md:col-span-2 bg-gradient-to-r from-primary/10 via-white to-secondary/10 dark:from-primary/20 dark:via-slate-900 dark:to-secondary/20">
              <div className="flex items-center gap-3">
                <Activity className="text-primary" size={20} />
                <p className="text-sm text-slate-700 dark:text-slate-200">
                  RL policy health is stable and serving matches in real-time.
                </p>
              </div>
            </Card>
            <Card>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500 dark:text-slate-300">Model Runtime</span>
                <PlayCircle size={18} className="text-accent" />
              </div>
              <p className="mt-2 text-xl font-semibold">Online</p>
            </Card>
          </section>

          {renderPage()}
        </main>
      </div>
    </div>
  )
}
