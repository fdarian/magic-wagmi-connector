import { ConnectExtension } from '@magic-ext/connect'
import {
  BaseConnectorConstructorArgs,
  BaseMagicConnector,
} from '../base/connector'

export type MagicConnectConnectorConstructorArgs = BaseConnectorConstructorArgs<
  string,
  ConnectExtension
> & {
  id?: string
  name?: string
}

export class MagicConnectConnector extends BaseMagicConnector<
  string,
  ConnectExtension
> {
  readonly id: string
  readonly name: string

  constructor({ id, name, ...args }: MagicConnectConnectorConstructorArgs) {
    super(args)
    this.id = id ?? 'magic-connect'
    this.name = name ?? 'Magic Connect'
  }

  async disconnect(): Promise<void> {
    const magic = this.getSdk()
    await magic.connect.disconnect()
    await super.disconnect()
  }

  protected getExtension() {
    return new ConnectExtension()
  }
}
