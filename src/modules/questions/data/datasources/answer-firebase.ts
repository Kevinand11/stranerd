import { DatabaseService } from '@modules/core/services/firebase'
import { DatabaseGetClauses } from '@modules/core/data/datasources/base'
import { AnswerFromModel, AnswerToModel } from '../models/answer'
import { AnswerBaseDataSource } from './answer-base'

export class AnswerFirebaseDataSource implements AnswerBaseDataSource {
	async create (answer: AnswerToModel) {
		return await DatabaseService.create('answers', answer) as string
	}

	async find (id: string) {
		return await DatabaseService.get(`answers${id}`) as AnswerFromModel | null
	}

	async get (conditions?: DatabaseGetClauses) {
		return await DatabaseService.getMany('answers', conditions) as AnswerFromModel[]
	}

	async listen (callback: (documents: AnswerFromModel[]) => void, conditions?: DatabaseGetClauses) {
		return await DatabaseService.listenToMany('answers', callback, conditions)
	}

	async update (id: string, data: object) {
		return await DatabaseService.update(`answers/${id}`, data)
	}
}