import { useContext } from 'react'
import { Button, Form, Input } from 'antd'
import { EnvironmentsContext } from '../contexts/EnvironmentsContext'

const onFinish = (target, env): void => {
  window.electron.ipcRenderer.send('TARGET_ADDED', { target, env })
}

function NewTargetForm(): JSX.Element {
  const { selectedEnv } = useContext(EnvironmentsContext)
  const [form] = Form.useForm()

  return (
    <Form
      size="small"
      wrapperCol={{ span: 14 }}
      layout="vertical"
      form={form}
      initialValues={{
        layout: 'vertical'
      }}
      onFinish={(target) => onFinish(target, selectedEnv)}
      style={{}}
    >
      <Form.Item
        label="Name"
        name="name"
        rules={[{ required: true, message: 'Please input the target name!' }]}
      >
        <Input placeholder="name" />
      </Form.Item>
      <Form.Item
        label="Url"
        name="endpoint"
        rules={[{ required: true, message: 'Please input the target endpoint!' }]}
      >
        <Input placeholder="endpoint" />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>
    </Form>
  )
}

export default NewTargetForm
