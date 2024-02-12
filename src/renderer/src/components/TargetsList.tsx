import { useState } from 'react'
import { List, Button, Typography } from 'antd'
import ListItem from '../components/ListItem'
import NewTargetForm from '../components/NewTargetForm'
import { PlusCircleOutlined, MinusCircleOutlined } from '@ant-design/icons'
import { Target } from '../../../models'
import PropTypes from 'prop-types'

const { Text } = Typography

function TargetsList({ targets }): JSX.Element {
  const [showNewTargetForm, setShowNewTargetForm] = useState(false)

  const onFinish = (target, env): void => {
    window.electron.ipcRenderer.send('target:added', { target, env })
    setShowNewTargetForm(!showNewTargetForm)
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
      {showNewTargetForm && <NewTargetForm onFinish={onFinish} />}
      <List
        itemLayout="horizontal"
        dataSource={targets}
        renderItem={(item: Target) => <ListItem item={item} />}
      />
    </>
  )
}

TargetsList.propTypes = {
  targets: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      endpoint: PropTypes.string.isRequired,
      notifyChanges: PropTypes.bool,
      version: PropTypes.string
    })
  )
}

export default TargetsList
