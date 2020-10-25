import { Context } from '@nuxt/types'
import Cookie from 'cookie'
import { USERID_SESSION_NAME } from '@utils/constants'
import { isServer } from '@utils/environment'
import { Action } from 'vuex'

export const actions = {
	nuxtServerInit: async (ctx, { req }: Context) => {
		const cookies = isServer() ? Cookie.parse(req.headers.cookie ?? '') : {}
		const id = cookies[USERID_SESSION_NAME]
		if (id) await ctx.dispatch('auth/setId', id)
	}
} as { [key: string]: Action<any, any> }
