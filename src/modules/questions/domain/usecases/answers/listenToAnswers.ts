import { FirestoreGetClauses } from '@modules/core/data/datasources/base'
import { IAnswerRepository } from '../../irepositories/ianswer'
import { AnswerEntity } from '../../entities/answer'

export class ListenToAnswersUseCase {
    private repository: IAnswerRepository

    constructor (repository: IAnswerRepository) {
	    this.repository = repository
    }

    async call (questionId: string, callback: (entities: AnswerEntity[]) => void) {
	    const conditions: FirestoreGetClauses = {
		    where: [
			    { field: 'questionId', condition: '==', value: questionId }
		    ]
	    }

	    return await this.repository.listen(callback, conditions)
    }
}
