import type { OAuthProvider } from '@magic-ext/oauth'
import { OAuthExtension } from '@magic-ext/oauth'
import { UserRejectedRequestError } from '@wagmi/core'
import type {
  BaseConnectorConnectConfig,
  BaseConnectorConstructorArgs,
  BaseMagicConnectorOptions,
  BaseMagicSdk,
} from '../base/connector'
import { BaseMagicConnector } from '../base/connector'

export type MagicOAuthConnectorOptions<TProviders extends OAuthProvider[]> =
  BaseMagicConnectorOptions<string, OAuthExtension> & {
    oauthOptions?: {
      defaultProvider?: TProviders[number]
      defaultRedirectUri?: string
    }
  }

export type MagicOAuthConnectorConstructorArgs<
  TProviders extends OAuthProvider[]
> = BaseConnectorConstructorArgs<
  string,
  OAuthExtension,
  MagicOAuthConnectorOptions<TProviders>
> & {
  id?: string
  name?: string
}

export type MagicOAuthConnectorConnectConfig<
  TProviders extends OAuthProvider[]
> = {
  provider?: TProviders[number]
  redirectUri?: string
  email?: string
  showUi?: boolean
} & BaseConnectorConnectConfig

export type MagicOAuthSdk = BaseMagicSdk<string, OAuthExtension>

export class MagicOAuthConnector<
  TProviders extends OAuthProvider[] = OAuthProvider[]
> extends BaseMagicConnector<
  string,
  OAuthExtension,
  MagicOAuthConnectorOptions<TProviders>
> {
  readonly id: string
  readonly name: string

  constructor({
    id,
    name,
    ...args
  }: MagicOAuthConnectorConstructorArgs<TProviders>) {
    super(args)

    this.id = id ?? 'magic-oauth'
    this.name = name ?? 'Magic OAuth'
    this.internalConnectOptions = {
      emitConnecting: false,
    }
  }

  private get oauthOptions() {
    return this.options.oauthOptions
  }

  async connect(config: MagicOAuthConnectorConnectConfig<TProviders> = {}) {
    const chainId = config.chainId
    this.emit('message', { type: 'connecting' })

    // Initializes SDK (if null) for every `this.getSdk()` calls
    this.getSdk(chainId)

    if (await this.isAuthorized()) {
      return super.connect({ chainId })
    }

    const email = config.email
    const provider = this.oauthOptions?.defaultProvider ?? config.provider

    const isProvider = email == null
    const isEmail = provider == null

    if (isEmail && isProvider) {
      throw new Error('Must use either social or email login')
    } else if (!isEmail && !isProvider) {
      throw new Error('Must provide one of social or email')
    } else if (isProvider) {
      await this.loginWithRedirect(provider!, config)
    } else if (isEmail) {
      await this.loginWithMagicLink(email, config)
    }

    return super.connect({ chainId })
  }

  async disconnect(): Promise<void> {
    const magic = this.getSdk()
    await magic.user.logout()
    await super.disconnect()
  }

  async isAuthorized() {
    return this.getSdk().user.isLoggedIn()
  }

  protected getExtension() {
    return new OAuthExtension()
  }

  private async loginWithRedirect(
    provider: TProviders[number],
    config: MagicOAuthConnectorConnectConfig<TProviders>
  ) {
    const redirectUri =
      config.redirectUri ?? this.oauthOptions?.defaultRedirectUri
    if (redirectUri == null) {
      throw new Error('Must provide redirectUri for login with redirect')
    }

    return this.getSdk()
      .oauth.loginWithRedirect({
        provider,
        redirectURI: redirectUri,
      })
      .catch(() => {
        throw new UserRejectedRequestError('Something went wrong')
      })
  }

  private async loginWithMagicLink(
    email: string,
    config: MagicOAuthConnectorConnectConfig<TProviders>
  ) {
    return this.getSdk()
      .auth.loginWithMagicLink({
        email,
        redirectURI: config.redirectUri,
        showUI: config.showUi,
      })
      .catch(() => {
        throw new UserRejectedRequestError('Something went wrong')
      })
  }
}
