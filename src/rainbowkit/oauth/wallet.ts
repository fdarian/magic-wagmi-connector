import type { OAuthProvider } from '@magic-ext/oauth'
import type { Chain, Connector } from '@wagmi/core'
import { MagicOAuthConnector, MagicOAuthConnectorOptions } from '../../oauth'

export type MagicOAuthWalletConfig<TProviders extends OAuthProvider[]> = {
  apiKey: string
  chains: Chain[]
  id?: string
  name?: string
  iconUrl?: string
  iconBackground?: string
  connectorOptions?: Omit<MagicOAuthConnectorOptions<TProviders>, 'apiKey'>
}

export function magicOAuthWallet<TProviders extends OAuthProvider[]>(
  config: MagicOAuthWalletConfig<TProviders>
) {
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
    id: id ?? 'magic-oauth',
    name: name ?? 'Magic',
    iconUrl: iconUrl ?? 'https://svgshare.com/i/iJK.svg',
    iconBackground: iconBackground ?? '#fff',
    createConnector: (): { connector: Connector } => ({
      connector: <Connector>(<unknown>new MagicOAuthConnector({
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
