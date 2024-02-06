export default interface Target {
  name: string
  endpoint: string
  notifyChanges: boolean
  version?: string
}
