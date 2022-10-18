import type { ConnectExtension } from '@magic-ext/connect'
import type { Chain, Connector } from '@wagmi/core'
import type { BaseMagicConnectorOptions } from '../../base'
import { MagicConnectConnector } from '../../connect'

export type MagicConnectWalletConfig = {
  apiKey: string
  chains: Chain[]
  id?: string
  name?: string
  iconUrl?: string
  iconBackground?: string
  connectorOptions?: Omit<
    BaseMagicConnectorOptions<string, ConnectExtension>,
    'apiKey'
  >
}

export function magicConnectWallet(config: MagicConnectWalletConfig) {
  const {
    chains,
    id,
    name,
    iconUrl,
    iconBackground,
    apiKey,
    connectorOptions,
  } = config

  return {
    id: id ?? 'magic-connect',
    name: name ?? 'Magic',
    iconUrl: iconUrl ?? 'https://svgshare.com/i/iJK.svg',
    iconBackground: iconBackground ?? '#fff',
    createConnector: (): { connector: Connector } => ({
      connector: <Connector>(<unknown>new MagicConnectConnector({
        id,
        name,
        chains,
        options: {
          apiKey,
          ...connectorOptions,
        },
      })),
    }),
  }
}
