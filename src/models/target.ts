export default interface Target {
  name: string
  endpoint: string
  notifyChanges: boolean
  method: 'GET' | 'POST'
  interval: number
  version?: string
}
