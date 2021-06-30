import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import { deleteFromStorage } from '../../helpers/storage'
import { addUserCoins, addUserXp, XpGainList } from '../../helpers/modules/payments/transactions'
import { addTutorRatings } from '../../helpers/modules/users/tutors'
import { deleteFromAlgolia, saveToAlgolia } from '../../helpers/algolia'
import { createNotification } from '../../helpers/modules/users/notifications'

export const answerCreated = functions.firestore.document('answers/{answerId}')
	.onCreate(async (snap, context) => {
		const answer = snap.data()
		const { coins, userId, questionId } = answer

		const questionRef = await admin.firestore().collection('questions').doc(questionId)

		await questionRef.set({
			answers: admin.firestore.FieldValue.increment(1)
		}, { merge: true })

		if (coins && userId) {
			await admin.database().ref('profiles').child(userId).child('account/meta')
				.update({
					[`answers/${snap.id}`]: true,
					[`answeredQuestions/${questionId}`]: admin.database.ServerValue.increment(1)
				})
			await addUserCoins(userId, { bronze: coins, gold: 0 },
				'You got coins for answering a question'
			)
		}

		const { userId: questionUserId } = (await questionRef.get()).data()!
		await createNotification(questionUserId, {
			body: 'Your question has been answered. Head over to your dashboard to check it out',
			action: `/questions/${questionId}#${context.params.answerId}`
		})
		await createNotification(questionUserId, {
			title: 'New Answer',
			body: 'You asked a question and we\'ve answered! Click here to get on your dashboard and view all answers on your question',
			action: `/questions/${questionId}#${context.params.answerId}`
		})

		if (userId) await addUserXp(userId, XpGainList.ANSWER_QUESTION, true)

		await saveToAlgolia('answers', snap.id, { answer })
	})

export const answerUpdated = functions.firestore.document('answers/{answerId}')
	.onUpdate(async (snap) => {
		const after = snap.after.data()
		const before = snap.before.data()

		const oldAttachments = before.attachments as any[]
		const newAttachments = after.attachments as any[]

		await Promise.all(oldAttachments?.map(async (attachment) => {
			const wasNotRemoved = newAttachments?.find((doc) => attachment?.path === doc?.path)
			if (!wasNotRemoved) await deleteFromStorage(attachment?.path)
		}))

		await saveToAlgolia('answers', snap.after.id, { answer: after })
	})

export const answerDeleted = functions.firestore.document('answers/{answerId}')
	.onDelete(async (snap) => {
		const { questionId, attachments, userId } = snap.data()

		attachments?.map(async (attachment: any) => await deleteFromStorage(attachment.path))

		await admin.firestore().collection('questions')
			.doc(questionId)
			.set({
				answers: admin.firestore.FieldValue.increment(-1)
			}, { merge: true })

		await admin.database().ref('profiles/account').child(userId).child('account/meta')
			.update({
				[`answers/${snap.id}`]: null,
				[`answeredQuestions/${questionId}`]: admin.database.ServerValue.increment(-1)
			})

		await deleteFromAlgolia('answers', snap.id)
	})

export const answerRated = functions.database.ref('answers/{answerId}/ratings/{userId}')
	.onCreate(async (snap, context) => {
		const { answerId, userId } = context.params
		const ratings = snap.val() ?? 0
		let tutorId = ''
		let questionId = ''

		await admin.database().ref('profiles').child(userId).child('account/meta')
			.child(`ratedAnswers/${answerId}`).set(ratings)

		await admin.firestore().runTransaction(async (t) => {
			const answerRef = admin.firestore().collection('answers').doc(answerId)
			const answer = await t.get(answerRef)
			tutorId = answer.data()?.userId ?? ''
			questionId = answer.data()?.questionId ?? ''
			t.set(answerRef, {
				ratings: {
					total: admin.firestore.FieldValue.increment(ratings),
					count: admin.firestore.FieldValue.increment(1)
				}
			}, { merge: true })
		})

		if (tutorId) await addTutorRatings(tutorId, ratings)
		if (questionId && tutorId) await createNotification(tutorId, {
			body: 'Your answer just got rated. Go to your dashboard and have a look',
			action: `/questions/${questionId}#${answerId}`
		})
	})
