import { defineNuxtMiddleware } from '@nuxtjs/composition-api'
import { GenerateLink } from '@utils/router'
import { useAuth } from '@app/hooks/auth/auth'

export default defineNuxtMiddleware(({ redirect }) => {
	if (!useAuth().isAdmin.value) {
		redirect(GenerateLink({ path: '/', differentSubdomain: true }))
	}
})