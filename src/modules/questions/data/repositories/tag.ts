import { DatabaseGetClauses } from '@modules/core'
import { ITagRepository } from '../../domain/irepositories/itag'
import { TagEntity } from '../../domain/entities/tag'
import { TagBaseDataSource } from '../datasources/tag-base'
import { TagTransformer } from '../transformers/tag'
import { TagFromModel } from '../models/tag'

export class TagRepository implements ITagRepository {
	private dataSource: TagBaseDataSource
	private transformer: TagTransformer

	constructor (dataSource: TagBaseDataSource, transformer: TagTransformer) {
		this.dataSource = dataSource
		this.transformer = transformer
	}

	async get (conditions?: DatabaseGetClauses) {
		const models = await this.dataSource.get(conditions)
		return models.map(this.transformer.fromJSON)
	}

	async listen (callback: (entities: TagEntity[]) => void, conditions?: DatabaseGetClauses) {
		const cb = (documents: TagFromModel[]) => {
			const entities = documents.map(this.transformer.fromJSON)
			callback(entities)
		}
		return this.dataSource.listen(cb, conditions)
	}
}
