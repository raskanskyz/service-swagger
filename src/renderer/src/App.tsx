import { useEffect, useState } from 'react'
import { Spin, Tabs, ConfigProvider, theme } from 'antd'
import { useQueries, useQueryClient } from '@tanstack/react-query'
import { EnvironmentsContext } from './contexts/EnvironmentsContext'
import SettingsPage from './pages/SettingsPage'
import TargetsList from './components/TargetsList'
import { Target } from '../../models'
import { QueriesContext } from './contexts/QueriesContext'

function App(): JSX.Element {
  const [store, setStore] = useState<{
    environments: string[]
    targets: Record<string, Target[]>
  }>()
  const [allTargets, setAllTargets] = useState<Target[]>([])
  const [selectedEnv, setSelectedEnv] = useState<string>('')
  const queryClient = useQueryClient()

  // * load store
  useEffect(() => {
    window.electron.ipcRenderer.on(
      'store:load',
      (
        _,
        { environments, targets }: { environments: string[]; targets: Record<string, Target[]> }
      ) => {
        setStore({ environments, targets })
        setAllTargets(Object.values(targets).flatMap((i) => i))
      }
    )
  }, [])

  // * set default env in initial render
  useEffect(() => {
    if (!selectedEnv && store?.environments?.length) {
      setSelectedEnv(store.environments[0])
    }
  }, [store])

  // * register all targets
  const results = useQueries({
    queries: allTargets
      ? allTargets.map((t) => ({
          queryKey: [t.name],
          refetchInterval: t.interval ?? 5 * 1000, // TODO: configurable
          refetchIntervalInBackground: true,
          retry: 2,
          queryFn: async (): Promise<Response> => {
            const prevData: Record<string, unknown> | undefined = queryClient.getQueryData([t.name])
            try {
              const response = await fetch(t.endpoint, {
                method: t.method ?? 'GET'
              })
              if (!response.ok) {
                throw new Error('Network response was not ok')
              }

              // * transition from down to up
              if (!prevData && t.notifyChanges) {
                new Notification(t.name, { body: `${t.name} is UP!` })
              }

              // * notify when version updated
              if (t.version && t.version !== prevData?.version) {
                new Notification('version updated!', {
                  body: `service went from ${prevData?.version} to ${t.version}`
                })
              }

              return response.json()
            } catch (error) {
              // * transition from up to down
              if (!prevData?.hasFailedBefore) {
                const hasFailedBefore = true
                queryClient.setQueryData([t.name], { hasFailedBefore })

                if (t.notifyChanges) {
                  new Notification(t.name, { body: `${t.name} is DOWN!` })
                }
              }

              throw new Error('Network response was not ok')
            }
          }
        }))
      : []
  })

  const onChange = (env): void => {
    setSelectedEnv(env)
  }

  if (!store?.environments) {
    return <Spin fullscreen={true} />
  }

  const envTabs = store.environments.map((env) => ({
    key: env,
    label: env,
    forceRender: true,
    children: <TargetsList targets={store.targets[env]} />
  }))

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm
      }}
    >
      <EnvironmentsContext.Provider value={{ envs: store.environments, selectedEnv }}>
        <QueriesContext.Provider value={{ results }}>
          <Tabs
            defaultActiveKey="settingsPage"
            activeKey={selectedEnv || 'settingsPage'}
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
        </QueriesContext.Provider>
      </EnvironmentsContext.Provider>
    </ConfigProvider>
  )
}

export default App
