import * as functions from 'firebase-functions'
import { deleteFromStorage } from '../helpers/storage'

export const subjectIconUpdated = functions.database.ref('subjects/{subjectId}/icon').onUpdate(async (snap) => {
	await deleteFromStorage(snap.before.val()?.path)
})

export const subjectDeleted = functions.database.ref('subjects/{subjectId}').onDelete(async (snap) => {
	await deleteFromStorage(snap.val().icon?.path)
})