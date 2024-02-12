import { useContext, useState, useEffect } from 'react'
import { List, Badge, Switch, Typography, Popconfirm, Tooltip } from 'antd'
import { QueryObserver, useQueryClient } from '@tanstack/react-query'
import PropTypes from 'prop-types'

import { EnvironmentsContext } from '../contexts/EnvironmentsContext'

const { Text } = Typography

type BadgeStatus = 'success' | 'error' | 'processing' | 'default' | 'warning' | undefined

function ListItem({ item }): JSX.Element {
  const { selectedEnv } = useContext(EnvironmentsContext)
  const [status, setStatus] = useState<BadgeStatus>('processing')
  const [version, setVersion] = useState(null)

  const queryClient = useQueryClient()
  const observer = new QueryObserver(queryClient, { queryKey: [item.name] })

  useEffect(() => {
    const unsubscribe = observer.subscribe(({ isFetching, isError, isSuccess }) => {
      if (isError) {
        setStatus('error')
      }
      if (isSuccess) {
        setStatus('success')
      }
      if (isFetching) {
        setStatus('processing')
      }
      // * transition from up to down
      if (item.notifyChanges && isError && status === 'success') {
        new Notification(`${item.name} is down!`, {
          body: `service has been down for approx. 10 seconds`
        })
      }

      // * transition from down to up
      if (item.notifyChanges && isSuccess && status === 'error') {
        new Notification(`${item.name} is back up!`)
      }

      // * notify when version updated
      if (version && item.version && version !== item.version) {
        new Notification('version updated!', {
          body: `service went from ${version} to ${item.version}`
        })

        setVersion(item.version)
      }
    })

    return () => {
      unsubscribe()
    }
  }, [selectedEnv])

  const confirm = (): void => {
    window.electron.ipcRenderer.send('target:deleted', { item, selectedEnv })
  }
  const cancel = (): boolean => false

  const badgeRenderer = (status: BadgeStatus = 'processing'): JSX.Element => {
    return (
      <Badge
        status={status}
        style={{ marginRight: 6 }}
        color={status === 'processing' ? '#faad14' : undefined}
      />
    )
  }

  return (
    <List.Item
      style={{ paddingLeft: '16px', paddingRight: '16px' }}
      actions={[
        <Popconfirm
          key="list-delete"
          title="Delete the target"
          description="Are you sure to delete this target?"
          onConfirm={confirm}
          onCancel={cancel}
          okText="Yes"
          cancelText="No"
        >
          <a>
            <Text style={{ color: 'red' }}>delete</Text>
          </a>
        </Popconfirm>
      ]}
    >
      <List.Item.Meta
        title={
          <>
            {badgeRenderer(status)}
            <Tooltip title={item.endpoint}>
              <span>{item?.name}</span>
            </Tooltip>
          </>
        }
        description={item?.version ?? ''}
      />
      <Switch
        checked={item?.notifyChanges}
        size="small"
        onChange={() => window.electron.ipcRenderer.send('notify:updated', { item, selectedEnv })}
      />
    </List.Item>
  )
}

ListItem.propTypes = {
  item: PropTypes.shape({
    name: PropTypes.string.isRequired,
    endpoint: PropTypes.string.isRequired,
    notifyChanges: PropTypes.bool,
    version: PropTypes.string
  })
}
export default ListItem
