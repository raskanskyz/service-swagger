import { useContext, useState, useEffect } from 'react'
import { List, Badge, Switch, Typography, Popconfirm, Tooltip } from 'antd'
import { useQuery } from '@tanstack/react-query'
import PropTypes from 'prop-types'

import { EnvironmentsContext } from '../contexts/EnvironmentsContext'

const { Text } = Typography

type BadgeStatus = 'success' | 'error' | 'processing' | 'default' | 'warning' | undefined

function ListItem({ item }): JSX.Element {
  const { selectedEnv } = useContext(EnvironmentsContext)
  const [status, setStatus] = useState<BadgeStatus>('processing')
  const [version, setVersion] = useState(null)

  const confirm = (): void => {
    window.electron.ipcRenderer.send('TARGET_DELETED', { item, selectedEnv })
  }
  const cancel = (): boolean => false

  const { isPending, isError, isSuccess } = useQuery({
    queryKey: ['target', item.url],
    refetchInterval: 5 * 1000, // TODO: configurable
    retry: 2,
    queryFn: async () => {
      const response = await fetch(item.url)
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }

      return response.json()
    }
  })

  useEffect(() => {
    if (isSuccess) {
      setStatus('success')
    }

    if (isError) {
      setStatus('error')
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

    if (isPending) {
      setStatus('processing')
    }
  }, [isSuccess, isError, isPending, status, item.version])

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
            <Tooltip title={item.url}>
              <span>{item?.name}</span>
            </Tooltip>
          </>
        }
        description={item?.version ?? ''}
      />
      <Switch
        checked={item?.notifyChanges}
        size="small"
        onChange={() =>
          window.electron.ipcRenderer.send('NOTIFY_CHANGES_TOGGLED', { item, selectedEnv })
        }
      />
    </List.Item>
  )
}

ListItem.propTypes = {
  item: PropTypes.shape({
    name: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    notifyChanges: PropTypes.bool,
    version: PropTypes.string
  })
}
export default ListItem
