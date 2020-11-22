import { FirestoreGetClauses } from '@modules/core/data/datasources/base'
import { AnswerToModel } from '../../data/models/answer'
import { AnswerEntity } from '../entities/answer'

export interface IAnswerRepository {
	add: (data: AnswerToModel) => Promise<string>
	get: (conditions?: FirestoreGetClauses) => Promise<AnswerEntity[]>
	listen: (callback: (entities: AnswerEntity[]) => void, conditions?: FirestoreGetClauses) => Promise<() => void>
	find: (id: string) => Promise<AnswerEntity | null>
	update: (id: string, data: object) => Promise<void>
}
