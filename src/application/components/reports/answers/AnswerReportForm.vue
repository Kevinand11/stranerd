<template>
	<form @submit.prevent="submit">
		<p>What is wrong with this answer?</p>
		<div class="d-flex flex-column gap-0-5 mb-1">
			<span v-for="message in AnswerMessages" :key="message.id" class="d-flex gap-0-5 align-items-center fw-bold">
				<input v-model="factory.message" name="message" type="radio" :value="message.id">
				<DynamicText>It {{ message.body }}</DynamicText>
			</span>
		</div>
		<button class="btn btn-primary fw-bold" type="submit" :disabled="loading || !factory.valid">
			<PageLoading v-if="loading" />
			<span>Report</span>
		</button>
		<DisplayError :error="error" />
	</form>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@nuxtjs/composition-api'
import { AnswerReportFactory } from '@modules/reports'
import { AnswerMessages } from '@app/hooks/reports/form'
export default defineComponent({
	name: 'AnswerReportForm',
	props: {
		factory: {
			type: Object as PropType<AnswerReportFactory>,
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
	setup () {
		return { AnswerMessages }
	}
})
</script>
