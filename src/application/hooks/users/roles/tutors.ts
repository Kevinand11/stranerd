import { reactive, ssrRef, toRefs, useFetch } from '@nuxtjs/composition-api'
import {
	AddTutorSubject, FindUser, GetAllTutors, GetUsersByEmail,
	MakeTutor, RemoveTutor, RemoveTutorSubject, UserEntity, TutorEntity
} from '@modules/users'
import { useErrorHandler, useLoadingHandler, useSuccessHandler } from '@app/hooks/core/states'
import { Alert } from '@app/hooks/core/notifications'
import { isServer } from '@utils/environment'

const global = {
	fetched: ssrRef(false),
	tutors: ssrRef([] as UserEntity[])
}
const { error, setError } = useErrorHandler()
const { loading, setLoading } = useLoadingHandler()

const addToGlobalTutors = (tutor: UserEntity) => {
	const index = global.tutors.value.findIndex((t) => t.id === tutor.id)
	if (index !== -1) global.tutors.value.splice(index, 1, tutor)
	else global.tutors.value.push(tutor)
}

export const useTutorList = () => {
	const fetchTutors = async () => {
		setError('')
		if (isServer()) global.tutors.value = []
		setLoading(true)
		try {
			global.tutors.value = await GetAllTutors.call()
			global.fetched.value = true
		} catch (error) { setError(error) }
		setLoading(false)
	}
	if (!global.fetched.value || isServer()) useFetch(fetchTutors)

	return { ...global, error, loading }
}

export const useTutorRoles = () => {
	const state = reactive({
		fetched: false,
		email: '',
		users: [] as UserEntity[]
	})
	const { error, setError } = useErrorHandler()
	const { setMessage } = useSuccessHandler()
	const { loading, setLoading } = useLoadingHandler()

	const getUsersByEmail = async () => {
		if (state.email) {
			setLoading(true)
			try {
				state.users = reactive(await GetUsersByEmail.call(state.email))
				state.fetched = true
			} catch (error) { setError(error) }
			setLoading(false)
		}
	}

	const reset = () => {
		state.email = ''
		state.users.length = 0
		state.fetched = false
	}

	const makeTutor = async (user: UserEntity) => {
		setError('')
		setLoading(true)
		try {
			await MakeTutor.call(user.id)
			user.roles.isTutor = true
			const tutor = await FindUser.call(user.id)
			if (tutor) addToGlobalTutors(tutor)
			reset()
			setMessage('Successfully made a tutor')
		} catch (error) { setError(error) }
		setLoading(false)
	}

	const removeTutor = async (tutor: TutorEntity) => {
		setError('')
		const accepted = await Alert({
			title: 'Are you sure you want to remove this tutor?',
			text: 'Note that this action will delete the tutor\'s records. This cannot be reversed',
			icon: 'warning',
			confirmButtonText: 'Yes, remove'
		})
		if (accepted) {
			setLoading(true)
			try {
				await RemoveTutor.call(tutor.id)
				global.tutors.value = global.tutors.value
					.filter((t) => t.id !== tutor.id)
				setMessage('Successfully removed tutor')
			} catch (error) { setError(error) }
			setLoading(false)
		}
	}

	return {
		...toRefs(state), error, loading,
		getUsersByEmail, makeTutor, removeTutor, reset
	}
}

let currentTutor = null as UserEntity | null
export const setCurrentTutor = (tutor: UserEntity) => currentTutor = tutor

export const useSingleTutor = () => {
	const tutor = ssrRef(currentTutor)
	const { loading, setLoading } = useLoadingHandler()
	const { error, setError } = useErrorHandler()
	const { setMessage } = useSuccessHandler()

	const addSubject = async (subject: string) => {
		setError('')
		setLoading(true)
		try {
			const id = tutor.value?.id
			if (id) {
				await AddTutorSubject.call(id, subject)
				const t = await FindUser.call(id)
				if (t) {
					tutor.value = t
					addToGlobalTutors(t)
				}
				setMessage('Successfully added subject')
			}
		} catch (error) { setError(error) }
		setLoading(false)
	}

	const removeSubject = async (subject: string) => {
		setError('')
		const accepted = await Alert({
			title: 'Are you sure you want to remove this subject?',
			text: 'Note that this action will reset the tutor\'s level for this subject to 0. This cannot be reversed',
			icon: 'warning',
			confirmButtonText: 'Yes, remove'
		})
		if (accepted) {
			setLoading(true)
			try {
				const id = tutor.value?.id
				if (id) {
					await RemoveTutorSubject.call(id, subject)
					const t = await FindUser.call(id)
					if (t) {
						tutor.value = t
						addToGlobalTutors(t)
					}
					setMessage('Successfully removed subject')
				}
			} catch (error) { setError(error) }
			setLoading(false)
		}
	}

	return {
		tutor, loading, error,
		addSubject, removeSubject
	}
}
