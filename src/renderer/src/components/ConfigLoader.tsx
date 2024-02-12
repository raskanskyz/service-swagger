import { Button, Form, Input } from 'antd'

function ConfigLoader(): JSX.Element {
  const [form] = Form.useForm()
  const onFinish = ({ config }): void => {
    console.log('🚀 DOZI ~ onFinish ~ config:', typeof config)
    window.electron.ipcRenderer.send('store:set', config)
  }
  return (
    <Form size="small" form={form} onFinish={onFinish}>
      <Form.Item
        name="config"
        rules={[
          {
            required: true,
            message: 'Invalid Config',
            validator: (_, value): Promise<void> => {
              try {
                // TODO: validate against a schema
                JSON.parse(value)

                return Promise.resolve()
              } catch (e) {
                return Promise.reject()
              }
            }
          }
        ]}
      >
        <Input.TextArea />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>
    </Form>
  )
}

export default ConfigLoader
