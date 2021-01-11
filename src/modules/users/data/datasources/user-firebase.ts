import { DatabaseService } from '@modules/core/services/firebase'
import { DatabaseGetClauses } from '@modules/core/data/datasources/base'
import { UserBaseDataSource } from '../datasources/user-base'
import { UserFromModel } from '../models/user'

export class UserFirebaseDataSource implements UserBaseDataSource {
	async find (id: string) {
		return await DatabaseService.get(`profiles/${id}`) as UserFromModel | null
	}

	async get (conditions?: DatabaseGetClauses) {
		return await DatabaseService.getMany('profiles', conditions) as UserFromModel[]
	}

	async listen (id: string, callback: (model: UserFromModel | null) => void, updateStatus = false) {
		return await DatabaseService.listen(`profiles/${id}`, callback, undefined, updateStatus)
	}

	async listenToMany (callback: (models: UserFromModel[]) => void, conditions?: DatabaseGetClauses) {
		return await DatabaseService.listenToMany('profiles', callback, conditions)
	}
}
