import { BaseFactory } from '@modules/core'
import { isEmail } from 'sd-validate/lib/rules'

type Keys = { email: string }

export class MailingListFactory extends BaseFactory<null, Keys, Keys> {
	public readonly rules = {
		email: { required: true, rules: [isEmail] }
	}

	constructor () {
		super({ email: '' })
	}

	reserved = []

	get email () { return this.values.email }
	set email (value: string) { this.set('email', value) }

	public toModel = async () => {
		if (this.valid)
			return { email: this.validValues.email }
		else
			throw new Error('Validation errors')
	}

	public loadEntity = (entity: null) => {
		throw new Error(`Cannot load an entity into this factory, ${entity}`)
	}
}
