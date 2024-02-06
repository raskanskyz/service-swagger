import { useContext, useEffect, useState } from 'react'
import { List, Button, Typography } from 'antd'
import ListItem from '../components/ListItem'
import NewTargetForm from '../components/NewTargetForm'
import { Spin } from 'antd'
import { PlusCircleOutlined, MinusCircleOutlined } from '@ant-design/icons'
import { EnvironmentsContext } from '../contexts/EnvironmentsContext'

const { Text } = Typography

function TargetsList(): JSX.Element {
  const [targets, setTargets] = useState()
  const [showNewTargetForm, setShowNewTargetForm] = useState(false)
  const { selectedEnv } = useContext(EnvironmentsContext)

  useEffect(() => {
    window.electron.ipcRenderer.send('LOAD_TARGETS', selectedEnv)

    window.electron.ipcRenderer.on('LOAD_TARGETS', (_, payload) => {
      setTargets(payload ?? [])
    })
    window.electron.ipcRenderer.on('TARGET_ADDED', (_, targets) => {
      setTargets(targets)
      setShowNewTargetForm(false)
    })
  }, [])

  if (targets === undefined) {
    return <Spin fullscreen={true} />
  }

  return (
    <>
      <Button
        type="text"
        icon={showNewTargetForm ? <MinusCircleOutlined /> : <PlusCircleOutlined />}
        onClick={() => setShowNewTargetForm(!showNewTargetForm)}
      >
        <Text>{showNewTargetForm ? 'cancel' : 'add target'}</Text>
      </Button>
      {showNewTargetForm && <NewTargetForm />}
      <List
        itemLayout="horizontal"
        dataSource={targets}
        renderItem={(item) => <ListItem item={item} />}
      />
    </>
  )
}

export default TargetsList
