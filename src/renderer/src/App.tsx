import { useEffect, useState } from 'react'
import { Spin, Tabs, ConfigProvider, theme } from 'antd'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { EnvironmentsContext } from './contexts/EnvironmentsContext'
import SettingsPage from './pages/SettingsPage'

const queryClient = new QueryClient()

function App(): JSX.Element {
  // const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

  const [envs, setEnvs] = useState<string[]>([])
  const [selectedEnv, setSelectedEnv] = useState<string | null>(null)

  const onChange = (env): void => {
    window.electron.ipcRenderer.send('LOAD_TARGETS', env)
    setSelectedEnv(env)
  }

  // * init selectedEnv
  useEffect(() => {
    if (envs?.length) {
      setSelectedEnv(envs[0])
    }
  }, [envs?.length])

  useEffect(() => {
    window.electron.ipcRenderer.send('LOAD_ENVS')

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    window.electron.ipcRenderer.on('ENVS_UPDATED', (envs: any) => {
      setEnvs(envs)
      // setSelectedEnv(env)
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    window.electron.ipcRenderer.on('LOAD_ENVS', (envs: any) => {
      setEnvs(envs)
      // setSelectedEnv(env)
    })
  }, [])

  if (envs === null) {
    return <Spin fullscreen={true} />
  }

  const envTabs = envs.map((env) => ({
    key: env,
    label: env,
    children: <>{/* <TargetsList env={env} /> */}</>
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
