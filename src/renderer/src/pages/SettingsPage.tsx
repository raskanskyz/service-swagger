import { Typography } from 'antd'
import EnvironmentTags from '../components/EnvironmentTags'
import ConfigLoader from '../components/ConfigLoader'

const { Title } = Typography

function SettingsPage(): JSX.Element {
  return (
    <>
      <Title level={5}>Environments:</Title>
      <EnvironmentTags />

      <Title level={5}>Load Config:</Title>
      <ConfigLoader />
    </>
  
  )
}

export default SettingsPage
