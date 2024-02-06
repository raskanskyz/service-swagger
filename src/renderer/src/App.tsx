import { useEffect, useState } from 'react'
import { Spin, Tabs, ConfigProvider, theme } from 'antd'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { EnvironmentsContext } from './contexts/EnvironmentsContext'
import SettingsPage from './pages/SettingsPage'
import TargetsList from './components/TargetsList'

const queryClient = new QueryClient()

function App(): JSX.Element {
  const [envs, setEnvs] = useState<string[]>([])
  const [selectedEnv, setSelectedEnv] = useState<string | undefined>()

  const onChange = (env): void => {
    setSelectedEnv(env)
    window.electron.ipcRenderer.send('LOAD_TARGETS', env)
  }

  useEffect(() => {
    window.electron.ipcRenderer.send('LOAD_ENVS')

    window.electron.ipcRenderer.on('ENVS_UPDATED', (_, envs: string[]) => {
      setEnvs(envs)
    })

    window.electron.ipcRenderer.on('LOAD_ENVS', (_, envs: string[]) => {
      setEnvs(envs)
      setSelectedEnv(envs[0])
    })
  }, [])

  if (envs === null) {
    return <Spin fullscreen={true} />
  }

  const envTabs = envs.map((env) => ({
    key: env,
    label: env,
    children: <TargetsList />
  }))

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm
      }}
    >
      <QueryClientProvider client={queryClient}>
        <EnvironmentsContext.Provider value={{ envs, selectedEnv }}>
          <Tabs
            defaultActiveKey="1"
            activeKey={selectedEnv}
            items={[
              ...envTabs,
              {
                key: 'settingsPage',
                label: 'Settings',
                children: <SettingsPage />
              }
            ]}
            onChange={onChange}
          />
        </EnvironmentsContext.Provider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ConfigProvider>
  )
}

export default App
