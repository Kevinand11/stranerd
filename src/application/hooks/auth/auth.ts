import { computed, reqSsrRef } from '@nuxtjs/composition-api'
import { FindUser, ListenToUser, UserEntity, UpdateStreak } from '@modules/users'
import { AuthDetails, UserLocation } from '@modules/auth/domain/entities/auth'
import { SessionSignout } from '@modules/auth'
import { isClient } from '@utils/environment'
import { useEditModal } from '@app/hooks/core/modals'
import { analytics, auth } from '@modules/core/services/initFirebase'
import VueRouter from 'vue-router'

const global = {
	auth: reqSsrRef(null as AuthDetails | null),
	user: reqSsrRef(null as UserEntity | null),
	location: reqSsrRef(null as UserLocation | null),
	listener: null as null | (() => void),
	showProfileModal: reqSsrRef(true)
}

export const useAuth = () => {
	const id = computed({ get: () => global.auth.value?.id ?? '', set: () => {} })
	const bio = computed({ get: () => global.user.value?.bio, set: () => {} })

	const isLoggedIn = computed({ get: () => !!id.value && !!global.user.value, set: () => {} })
	const isVerified = computed({ get: () => !!global.auth.value?.isVerified, set: () => {} })
	// const isAdmin = computed({ get: () => !!global.user.value?.roles.isAdmin, set: () => {} })
	const isAdmin = computed({ get: () => true, set: () => {} })
	const currentSessionId = computed({
		get: () => global.user.value?.currentSession ?? null,
		set: () => {}
	})

	const setUserLocation = (data: UserLocation) => {
		global.location.value = data
	}

	const setAuthUser = async (details: AuthDetails | null, router: VueRouter) => {
		if (global.listener) global.listener()
		global.auth.value = details
		if (details?.id) {
			if (!details.isVerified) {
				await router.push('/auth/verify')
				return false
			}
			global.user.value = await FindUser.call(details.id)
		} else global.user.value = null
		return true
	}

	const startProfileListener = async () => {
		if (global.listener) global.listener()

		const id = global.auth.value?.id
		const setUser = (user: UserEntity | null) => {
			if (user?.bio.isNew && global.showProfileModal.value) useEditModal().openAccountProfile()
			global.user.value = user
		}
		if (id) {
			global.listener = await ListenToUser.call(id, setUser, true)
			await UpdateStreak.call().catch(() => {})
		}
	}

	const signin = async (remembered: boolean) => {
		try {
			if (global.auth.value?.token) await auth.signInWithCustomToken(global.auth.value.token)
			await startProfileListener()
			analytics.logEvent('login', { remembered })
		} catch (e) { await signout() }
	}

	const signout = async () => {
		await SessionSignout.call()
		await setAuthUser(null, {} as VueRouter)
		await auth.signOut()
		if (isClient()) window.location.assign('/')
	}

	const getLocalCurrency = () => global.location.value?.currencyCode ?? 'USD'
	const getLocalCurrencySymbol = () => global.location.value?.currencySymbol ?? '$'

	const getLocalAmount = (amount: number) => parseFloat(Number(amount * CONVERSION_RATES[getLocalCurrency()]).toFixed(2))

	return {
		id, bio, user: global.user, auth: global.auth, location: global.location,
		isLoggedIn, isVerified, isAdmin, currentSessionId,
		setAuthUser, setUserLocation, signin, signout,
		getLocalAmount, getLocalCurrency, getLocalCurrencySymbol
	}
}

export const setShowProfileModal = (show: boolean) => global.showProfileModal.value = show

export const CONVERSION_RATES = {
	USD: 1,
	NGN: 421
} as Record<string, number>
