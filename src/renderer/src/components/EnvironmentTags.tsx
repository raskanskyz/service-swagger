import { useEffect, useRef, useState, useContext } from 'react'
import { PlusOutlined } from '@ant-design/icons'
import { Input, InputRef, Space, Tag, theme, Tooltip } from 'antd'
import { EnvironmentsContext } from '../contexts/EnvironmentsContext'

function EnvironmentTags(): JSX.Element {
  const { envs } = useContext(EnvironmentsContext)
  const { token } = theme.useToken()
  const [inputVisible, setInputVisible] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [editInputIndex, setEditInputIndex] = useState(-1)
  const [editInputValue, setEditInputValue] = useState('')
  const inputRef = useRef<InputRef>(null)
  const editInputRef = useRef<InputRef>(null)

  useEffect(() => {
    if (inputVisible) {
      inputRef.current?.focus()
    }
  }, [inputVisible])

  useEffect(() => {
    editInputRef.current?.focus()
  }, [editInputValue])

  const handleClose = (removedTag): void => {
    const updatedEnvs = envs.filter((tag) => tag !== removedTag)
    window.electron.ipcRenderer.send('tags:updated', updatedEnvs)
  }
  const showInput = (): void => {
    setInputVisible(true)
  }
  const handleInputChange = (e): void => {
    setInputValue(e.target.value)
  }
  const handleInputConfirm = (): void => {
    if (inputValue && !envs.includes(inputValue)) {
      window.electron.ipcRenderer.send('tags:updated', [...envs, inputValue])
    }
    setInputVisible(false)
    setInputValue('')
  }
  const handleEditInputChange = (e): void => {
    setEditInputValue(e.target.value)
  }
  const handleEditInputConfirm = (): void => {
    const newTags = [...envs]
    newTags[editInputIndex] = editInputValue
    window.electron.ipcRenderer.send('tags:updated', newTags)
    setEditInputIndex(-1)
    setEditInputValue('')
  }
  const tagInputStyle = {
    width: 64,
    height: 22,
    marginInlineEnd: 8,
    verticalAlign: 'top'
  }
  const tagPlusStyle = {
    height: 22,
    background: token.colorBgContainer,
    borderStyle: 'dashed'
  }

  return (
    <Space size={[0, 8]} wrap>
      {envs.map((tag, index) => {
        if (editInputIndex === index) {
          return (
            <Input
              ref={editInputRef}
              key={tag}
              size="small"
              style={tagInputStyle}
              value={editInputValue}
              onChange={handleEditInputChange}
              onBlur={handleEditInputConfirm}
              onPressEnter={handleEditInputConfirm}
            />
          )
        }
        const isLongTag = tag.length > 20
        const tagElem = (
          <Tag
            key={tag}
            closable={true}
            style={{
              userSelect: 'none'
            }}
            onClose={() => handleClose(tag)}
          >
            <span
              onDoubleClick={(e) => {
                if (index !== 0) {
                  setEditInputIndex(index)
                  setEditInputValue(tag)
                  e.preventDefault()
                }
              }}
            >
              {isLongTag ? `${tag.slice(0, 20)}...` : tag}
            </span>
          </Tag>
        )
        return isLongTag ? (
          <Tooltip title={tag} key={tag}>
            {tagElem}
          </Tooltip>
        ) : (
          tagElem
        )
      })}
      {inputVisible ? (
        <Input
          ref={inputRef}
          type="text"
          size="small"
          style={tagInputStyle}
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputConfirm}
          onPressEnter={handleInputConfirm}
        />
      ) : (
        <Tag style={tagPlusStyle} icon={<PlusOutlined />} onClick={showInput}>
          New Tag
        </Tag>
      )}
    </Space>
  )
}

export default EnvironmentTags
