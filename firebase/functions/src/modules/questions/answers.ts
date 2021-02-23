import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import { deleteFromStorage } from '../../helpers/storage'
import { createTransaction, BRONZE_CURRENCY_PLURAL } from '../../helpers/modules/payments/transactions'

export const answerCreated = functions.firestore.document('answers/{answerId}')
	.onCreate(async (snap) => {
		const { coins, userId, questionId } = snap.data()

		await admin.firestore().collection('questions')
			.doc(questionId)
			.set({
				answers: admin.firestore.FieldValue.increment(1)
			}, { merge: true })

		if (coins && userId) {
			await admin.database().ref('profiles')
				.child(userId)
				.update({
					'account/coins/bronze': admin.database.ServerValue.increment(coins ?? 0),
					'meta/answerCount': admin.database.ServerValue.increment(1)
				})
			await admin.database().ref('users')
				.child(userId)
				.child('answers')
				.child(snap.id)
				.set(true)
			await createTransaction(userId, {
				amount: coins,
				event: `You got ${coins} ${BRONZE_CURRENCY_PLURAL} from answering a question`
			})
		}
	})

export const answerUpdated = functions.firestore.document('answers/{answerId}')
	.onUpdate(async (snap) => {
		const after = snap.after.data()
		const before = snap.before.data()

		const oldAttachments = before.attachments as any[]
		const newAttachments = after.attachments as any[]

		await Promise.all(oldAttachments?.map(async (attachment) => {
			const wasNotRemoved = newAttachments?.find((doc) => attachment?.path === doc?.path)
			if(!wasNotRemoved) await deleteFromStorage(attachment?.path)
		}))
	})

export const answerDeleted = functions.firestore.document('answers/{answerId}')
	.onDelete(async (snap) => {
		const { questionId, attachments, userId } = snap.data()

		attachments?.map(async (attachment: any) => await deleteFromStorage(attachment.path))

		await admin.database().ref('profiles')
			.child(userId)
			.child('meta/answerCount')
			.set(admin.database.ServerValue.increment(-1))

		await admin.database().ref('users')
			.child(userId)
			.child('answers')
			.child(snap.id)
			.set(null)

		await admin.firestore().collection('questions')
			.doc(questionId)
			.set({
				answers: admin.firestore.FieldValue.increment(-1)
			}, { merge: true })
	})

export const answerLiked = functions.database.ref('answers/{answerId}/likes')
	.onWrite(async (snap, context) => {
		const { answerId } = context.params

		const likesCount = Object.values(snap.after.val() ?? {})
			.filter((liked) => liked)
			.length

		await admin.firestore().collection('answers')
			.doc(answerId)
			.set({
				likes: likesCount
			}, { merge: true })
	})

export const answerRated = functions.database.ref('answers/{answerId}/ratings')
	.onWrite(async (snap, context) => {
		const { answerId } = context.params

		const ratings = Object.values(snap.after.val() ?? {}) as number[]
		const averageRating = ratings.length === 0 ? 0 : ratings.reduce((acc, curr) => acc + curr, 0) / ratings.length

		await admin.firestore().collection('answers')
			.doc(answerId)
			.set({
				ratings: averageRating
			}, { merge: true })
	})
