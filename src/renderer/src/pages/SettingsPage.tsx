import { Typography } from 'antd'
import EnvironmentTags from '../components/EnvironmentTags'

const { Title } = Typography

function SettingsPage(): JSX.Element {
  return (
    <>
      <Title level={5}>Environments:</Title>
      <EnvironmentTags />
    </>
  )
}

export default SettingsPage
