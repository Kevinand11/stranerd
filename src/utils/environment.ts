export const isDev = process.env.ENVIRONMENT === 'development'
export const isProd = process.env.ENVIRONMENT === 'production'

export const isServer = () => process.server
export const isClient = () => process.client

const config = JSON.parse(process.env.FIREBASE_CLIENT_CONFIG ?? '{}')
export const firebaseConfig = {
	apiKey: config.api_key,
	authDomain: config.auth_domain,
	databaseURL: config.database_url,
	projectId: config.project_id,
	storageBucket: config.storage_bucket,
	messagingSenderId: config.messaging_sender_id,
	appId: config.app_id,
	measurementId: config.measurement_id
}
