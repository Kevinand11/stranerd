import { DatabaseGetClauses } from '@modules/core/data/datasources/base'
import { ChatBaseDataSource } from '../datasources/chat-base'
import { ChatTransformer } from '../transformers/chat'
import { IChatRepository } from '../../domain/irepositories/ichat'
import { ChatFromModel, ChatToModel } from '../models/chat'
import { ChatEntity } from '../../domain/entities/chat'

export class ChatRepository implements IChatRepository {
	private dataSource: ChatBaseDataSource
	private transformer: ChatTransformer

	constructor (dataSource: ChatBaseDataSource, transformer: ChatTransformer) {
		this.dataSource = dataSource
		this.transformer = transformer
	}

	async add (path: [string, string], data: ChatToModel) {
		return await this.dataSource.create(path, data)
	}

	async get (path: [string, string], conditions?: DatabaseGetClauses) {
		const models = await this.dataSource.get(path, conditions)
		return models.map(this.transformer.fromJSON)
	}

	async find (path: [string, string], id: string) {
		const model = await this.dataSource.find(path, id)
		return model ? this.transformer.fromJSON(model) : model
	}

	async listen (path: [string, string], callback: (entities: ChatEntity[]) => void, conditions?: DatabaseGetClauses) {
		const listenCB = (documents: ChatFromModel[]) => callback(documents.map(this.transformer.fromJSON))
		return await this.dataSource.listen(path, listenCB, conditions)
	}

	async markRead (path: [string, string], id: string) {
		await this.dataSource.markRead(path, id)
	}

	async delete (path: [string, string], id: string) {
		return await this.dataSource.delete(path, id)
	}
}
