<template>
	<form class="mx-2" @submit.prevent="submit">
		<div class="form-group my-2">
			<textarea
				v-model="factory.body"
				class="form-control"
				placeholder="Question"
				rows="4"
				:class="{'is-invalid': factory.errors.body, 'is-valid': factory.isValid('body')}"
			/>
			<small v-if="factory.errors.body" class="small text-danger d-block">{{ factory.errors.body }}</small>
		</div>
		<div class="form-group d-flex flex-column flex-sm-row my-2">
			<select v-model="factory.subjectId" class="form-control form-control-sm rounded-pill">
				<option disabled value="">
					Select a subject
				</option>
				<option v-for="subject in subjects" :key="subject.id" :value="subject.id">
					{{ subject.name }}
				</option>
			</select>
			<select v-model="factory.credits" class="form-control form-control-sm rounded-pill">
				<option disabled value="0">
					Select credits
				</option>
				<option v-for="credit in credits" :key="credit" :value="credit">
					{{ credit }}
				</option>
			</select>
		</div>
		<div class="form-group my-2">
			<label class="label d-block">Attachments</label>
			<input
				ref="attachments"
				type="file"
				class="d-none"
				accept="image/*"
				multiple
				@change="catchAttachments"
			>
			<p>
				<span v-for="attachment in factory.attachments" :key="attachment.name" class="mr-1">
					<span style="margin-right:0.25rem;">{{ attachment.name }}</span>
					<a class="text-danger" @click.prevent="factory.removeAttachment(attachment)">
						<i class="fas fa-times" />
					</a>
				</span>
			</p>
			<span v-if="factory.icon">{{ factory.icon.name }}</span>
			<a class="text-info my-1" @click.prevent="() => { $refs.attachments.value= ''; $refs.attachments.click() }">
				Upload attachments
			</a>
			<small v-if="factory.errors.attachments" class="small text-danger d-block">{{ factory.errors.attachments }}</small>
		</div>
		<hr>
		<div class="d-flex justify-content-end my-3">
			<button class="btn btn-red text-white" type="submit" :disabled="loading || !factory.valid">
				<PageLoading v-if="loading" />
				<span><slot name="buttonText">Submit</slot></span>
			</button>
		</div>
		<PageLoading v-if="subLoading" />
		<DisplayError :error="error" />
		<DisplayError :error="subError" />
	</form>
</template>

<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api'
import { useMultipleFileInputs } from '@app/hooks/core/forms'
import { QuestionFactory } from '@modules/questions'
import { useSubjectList } from '@app/hooks/questions/subjects'
export default defineComponent({
	name: 'QuestionForm',
	props: {
		factory: {
			type: QuestionFactory,
			required: true
		},
		credits: {
			type: Array,
			required: true
		},
		submit: {
			type: Function,
			required: true
		},
		loading: {
			type: Boolean,
			required: true
		},
		error: {
			type: String,
			required: true
		}
	},
	setup (props) {
		const { subjects, loading: subLoading, error: subError } = useSubjectList()
		const { catchMultipleFiles: catchAttachments } = useMultipleFileInputs(
			(files: File[]) => files.map(props.factory.addAttachment)
		)
		return {
			subjects, subLoading, subError,
			catchAttachments
		}
	}
})
</script>