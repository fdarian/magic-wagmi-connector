import { Chain, Connector } from '@wagmi/core'
import { MagicConnector, MagicConnectorOptions } from '../connector'

export type MagicWalletConfig = {
  apiKey: string
  chains: Chain[]
  id?: string
  name?: string
  iconUrl?: string
  iconBackground?: string
  connectorOptions?: Omit<MagicConnectorOptions, 'apiKey'>
}

export function magicWallet(config: MagicWalletConfig) {
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
    id: id ?? 'magic',
    name: name ?? 'Magic',
    iconUrl: iconUrl ?? 'https://svgshare.com/i/iJK.svg',
    iconBackground: iconBackground ?? '#fff',
    createConnector: (): { connector: Connector } => ({
      connector: new MagicConnector({
        chains,
        options: {
          apiKey,
          ...connectorOptions,
        },
      }),
    }),
  }
}
