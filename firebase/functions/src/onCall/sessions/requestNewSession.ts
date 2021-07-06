import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import { createNotification } from '../../helpers/modules/users/notifications'

export const requestNewSession = functions.https.onCall(async (data, context) => {
	if (!context.auth)
		throw new functions.https.HttpsError('unauthenticated', 'Only authenticated users can request sessions')

	const { tutorId, studentId, price, duration, studentBio, tutorBio } = data.session

	try {
		const session = {
			duration, price, studentId, tutorId, studentBio, tutorBio,
			accepted: false,
			cancelled: { student: false, tutor: false },
			dates: { createdAt: admin.firestore.Timestamp.now() },
			reviews: {}
		}

		const doc = await admin.firestore().collection('sessions').add(session)
		const sessionId = doc.id
		const isBusyRef = await admin.database().ref('profiles')
			.child(tutorId).child('session/currentTutorSession')
			.once('value')

		if (isBusyRef.val()) {
			await doc.delete()
			throw new functions.https.HttpsError('failed-precondition', 'Tutor is currently in a session. Try again later.')
		}

		await admin.database().ref('profiles')
			.update({
				[`${studentId}/account/meta/sessions/${sessionId}`]: true,
				[`${studentId}/session/requests/${sessionId}`]: true,
				[`${tutorId}/account/meta/tutorSessions/${sessionId}`]: true,
				[`${tutorId}/session/lobby/${sessionId}`]: true
			})
		await createNotification(tutorId, {
			title: 'New Session Request',
			body: 'Someone just requested a new session with you. Hurry now and seal the deal',
			action: `/sessions/lobby#${sessionId}`
		})

		return sessionId
	} catch (error) {
		throw new functions.https.HttpsError('unknown', error.message)
	}
})
