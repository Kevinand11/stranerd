<template>
	<div :id="question.id" class="d-flex flex-column p-1 gap-1 gap-lg-2">
		<div class="question-head d-flex flex-wrap align-items-center gap-1">
			<div class="d-flex align-items-center gap-0-5 me-auto">
				<NuxtLink :to="`/users/${question.userId}`">
					<Avatar :src="question.avatar" :size="36" />
				</NuxtLink>
				<NuxtLink class="name" :to="`/users/${question.userId}`">
					<DynamicText>{{ question.userName }}</DynamicText>
				</NuxtLink>
				<div class="dot" />
				<Subject :subject-id="question.subjectId" class="subject" />
			</div>
			<img v-if="question.isAnswered" src="@app/assets/images/icons/profile-best-answers.svg" alt="" style="width: 2rem; height: 2rem;">
			<div v-else-if="showAnswerButton" class="d-flex align-items-center gap-1">
				<div class="coin d-flex align-items-center gap-0-25">
					<DynamicText>+{{ formatNumber(question.creditable) }}</DynamicText>
					<Coins :size="28" style="z-index: 1;" />
				</div>
				<button class="answer-btn" @click="openAnswerModal">
					Answer
				</button>
			</div>
		</div>

		<NuxtLink class="question-body" :to="`/questions/${question.id}`">
			<DynamicText>
				{{ question.trimmedBody }}
			</DynamicText>
		</NuxtLink>

		<div class="d-flex flex-wrap align-items-center justify-content-between gap-1 gap-md-2">
			<DynamicText class="name order-1 order-md-1">
				Posted {{ formatTime(question.createdAt) }}
			</DynamicText>
			<div class="gap-0-75 d-flex flex-wrap align-items-center order-3 order-md-2">
				<Tag v-for="tag in question.tags" :key="tag" :tag="tag" />
			</div>
			<div class="d-flex align-items-center gap-1 order-md-3 order-2">
				<span class="d-flex align-items-center gap-0-5">
					<img src="@app/assets/images/icons/answers.svg" alt="" class="icons">
					<DynamicText>{{ formatNumber(question.answers) }} {{ pluralize(question.answers, 'answer', 'answers') }}</DynamicText>
				</span>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, useRouter } from '@nuxtjs/composition-api'
import { QuestionEntity } from '@modules/questions'
import { useAuth } from '@app/hooks/auth/auth'
import { openAnswerModal } from '@app/hooks/questions/answers'
import { formatNumber, pluralize } from '@utils/commons'
import { formatTime } from '@utils/dates'
import Tag from '@app/components/questions/tags/Tag.vue'
import Subject from '@app/components/questions/subjects/Subject.vue'
export default defineComponent({
	name: 'QuestionsListCard',
	components: { Tag, Subject },
	props: {
		question: {
			required: true,
			type: Object as PropType<QuestionEntity>
		}
	},
	setup (props) {
		const { id, user } = useAuth()
		const router = useRouter()
		const showAnswerButton = computed({
			get: () => props.question.userId !== id.value && !props.question.isAnswered && !user.value?.meta.answeredQuestions.includes(props.question.id),
			set: () => {}
		})
		return {
			id, formatTime, formatNumber, pluralize, showAnswerButton,
			openAnswerModal: () => openAnswerModal(props.question, router)
		}
	}
})
</script>

<style lang="scss" scoped>
	.question-body {
		font-size: 20px;
	}

	.question-head {
		.dot {
			width: 6px;
			height: 6px;
			background-color: $color-sub;
			margin: 0 12px 0 3px;
			border-radius: 50px;
		}

		.name {
			color: $color-dark;
			font-size: 18px;
			font-weight: 600;
		}

		.subject {
			color: $color-sub;
			font-weight: 600;
		}
	}

	.icons {
		width: 24px;
	}

	.answer-btn {
		background: $color-primary;
		color: $color-white;
		border: none;
		border-radius: 18px;
		width: fit-content;
		padding: 9px 27px;

		&:hover {
			color: $color-white;
			transform: scale(1.1);
			transition: 0.5s;
		}
	}
</style>
