import { Web3Provider } from '@ethersproject/providers'
import { ConnectExtension } from '@magic-ext/connect'
import type { InstanceWithExtensions, SDKBase } from '@magic-sdk/provider'
import {
  AddChainError,
  chain,
  Chain,
  ChainNotConfiguredError,
  Connector,
  normalizeChainId,
  ProviderRpcError,
  SwitchChainError,
  UserRejectedRequestError,
} from '@wagmi/core'
import { getAddress, hexValue } from 'ethers/lib/utils'
import { Magic, MagicSDKAdditionalConfiguration } from 'magic-sdk'

const IS_SERVER = typeof window === 'undefined'

export type MagicSdkOptions = {
  accentColor?: string
  isDarkMode?: boolean
  customLogo?: string
  customHeaderText?: string
  additionalMagicOptions?: Omit<
    MagicSDKAdditionalConfiguration<string, ConnectExtension[]>,
    'extensions' | 'network'
  >
}

export type MagicConnectorOptions = {
  chainId?: number
  apiKey: string
  additionalOptions?: MagicSdkOptions
}

export type MagicSdk = InstanceWithExtensions<SDKBase, ConnectExtension[]>
type Args = {
  chains: Chain[]
  options: MagicConnectorOptions
}
type Config = {
  chainId?: number
}

export class MagicConnector extends Connector {
  readonly ready = !IS_SERVER
  readonly id = 'magic'
  readonly name = 'Magic'

  options: MagicConnectorOptions

  private _provider?: Web3Provider
  private _magicSdk?: MagicSdk

  constructor({ chains: _chains, options }: Args) {
    const chains = _chains.length === 0 ? [chain.mainnet] : _chains
    super({ chains, options })
  }

  async connect(config: Config = {}) {
    try {
      this.emit('message', { type: 'connecting' })

      // This would also initialize the SDK and the provider.
      const provider = await this.getProvider({ chainId: config.chainId })

      if (provider.on) {
        provider.on('accountsChanged', this.onAccountsChanged)
        provider.on('chainChanged', this.onChainChanged)
        provider.on('disconnect', this.onDisconnect)
      }

      // Calling get address will prompt login if needed
      const account = await this.getAccount()

      // Switch to chain if provided
      let id = await this.getChainId()
      let unsupported = this.isChainUnsupported(id)
      if (config.chainId && id !== config.chainId) {
        const chain = await this.switchChain(id)
        id = chain.id
        unsupported = this.isChainUnsupported(id)
      }

      return { account, chain: { id, unsupported }, provider }
    } catch (error) {
      throw new UserRejectedRequestError('Something went wrong')
    }
  }

  async getAccount() {
    const signer = await this.getSigner()
    return getAddress(await signer.getAddress())
  }

  async getProvider(config: Config = {}) {
    if (this._provider == null) {
      const magic = this.getSdk(config)
      this._provider = new Web3Provider(
        magic.rpcProvider as any,
        config.chainId ?? (await this.getChainId())
      )
    }
    return this._provider
  }

  async getSigner() {
    const provider = await this.getProvider()
    return provider.getSigner()
  }

  async isAuthorized() {
    try {
      const account = await this.getAccount()
      return account != null
    } catch {
      return false
    }
  }

  async getChainId() {
    let chainId = this._provider?.network.chainId
    if (chainId == null) {
      chainId = this.options.chainId ?? this.chains[0].id
    }
    if (chainId != null) return normalizeChainId(chainId)
    throw new ChainNotConfiguredError('Missing network in provider')
  }

  async switchChain(chainId: number) {
    const provider = await this.getProvider()
    const id = hexValue(chainId)

    try {
      await provider.send('wallet_switchEthereumChain', [{ chainId: id }])
      return this.getChain(chainId)
    } catch (error) {
      const chain = this.chains.find((x) => x.id === chainId)
      if (chain == null) throw new ChainNotConfiguredError()

      // Indicates chain is not added to provider
      if ((<ProviderRpcError>error).code === 4902) {
        try {
          await provider.send('wallet_addEthereumChain', [
            {
              chainId: id,
              chainName: chain.name,
              nativeCurrency: chain.nativeCurrency,
              rpcUrls: [chain.rpcUrls.public ?? chain.rpcUrls.default],
              blockExplorerUrls: this.getBlockExplorerUrls(chain),
            },
          ])
          return chain
        } catch (addError) {
          throw new AddChainError()
        }
      }
      throw new SwitchChainError(error)
    }
  }

  async disconnect(): Promise<void> {
    const magic = this.getSdk()
    await magic.connect.disconnect()

    this._provider?.removeListener('accountsChanged', this.onAccountsChanged)
    this._provider?.removeListener('chainChanged', this.onChainChanged)
    this._provider?.removeListener('disconnect', this.onDisconnect)
  }

  getSdk(config: Config = {}) {
    if (this._magicSdk == null) {
      const optedChainId = config.chainId ?? this.options.chainId
      const chain =
        // chains will always have at least one element, enforced in constructor
        optedChainId == null ? this.chains[0] : this.getChain(optedChainId)

      this._magicSdk = new Magic(this.options.apiKey, {
        network: {
          rpcUrl: chain.rpcUrls.default ?? chain.rpcUrls.public,
          chainId: chain.id,
        },
        extensions: [new ConnectExtension()],
        ...this.options.additionalOptions,
      })
    }
    return this._magicSdk
  }

  protected onAccountsChanged(accounts: string[]): void {
    if (accounts.length === 0) this.emit('disconnect')
    else this.emit('change', { account: getAddress(accounts[0]) })
  }

  protected onChainChanged(chainId: string | number): void {
    const id = normalizeChainId(chainId)
    const unsupported = this.isChainUnsupported(id)
    this.emit('change', { chain: { id, unsupported } })
  }

  protected onDisconnect(): void {
    this.emit('disconnect')
  }

  private getChain(chainId: number) {
    const chain = this.chains.find((chain) => chain.id === chainId)
    if (chain != null) return chain
    throw new ChainNotConfiguredError()
  }
}
