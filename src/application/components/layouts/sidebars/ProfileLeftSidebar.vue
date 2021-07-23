<template>
	<div v-if="user" :class="['d-flex flex-column ', min ? 'bg-line gap-0-5' : 'gap-2-25']">
		<div :class="['d-flex flex-column gap-1 bg-white' , min ? 'mini-box pb-2' : 'box']">
			<div class="d-flex flex-column gap-1-5 align-items-center text-blue">
				<div class="position-relative">
					<Avatar :src="user.avatar" :size="144" />
					<NuxtLink v-if="user.id === id" to="/account/edit">
						<i class="fa fa-pen pen" />
					</NuxtLink>
				</div>

				<div class="d-flex flex-column gap-0-25 align-items-center">
					<h1>
						<DynamicText>{{ user.fullName }}</DynamicText>
					</h1>
					<NuxtLink to="/users/ranks" class="text-primary">
						<DynamicText>{{ user.rank.id }}</DynamicText>
					</NuxtLink>
					<div class="d-flex align-items-center gap-0-5">
						<ShowRatings :rating="user.averageRating" />
						<DynamicText>{{ formatNumber(user.ratingCount) }} {{ pluralize(user.ratingCount, 'review', 'reviews') }}</DynamicText>
					</div>
				</div>
				<button v-if="canRequestSession" class="sidebar-btn px-2" @click="requestNewSession">
					Request a Session
				</button>
			</div>

			<div class="thick mx-n1" />

			<div class="stats">
				<div class="stat-title gap-1">
					<img src="@app/assets/images/icons/profileSidebar/questions.svg" alt="">
					<span>Questions</span>
				</div>
				<DynamicText class="count fw-bold">
					{{ formatNumber(Object.entries(user.meta.questions).length) }}
				</DynamicText>
			</div>
			<div class="stats">
				<div class="stat-title gap-1">
					<img src="@app/assets/images/icons/profileSidebar/answered.svg" alt="">
					<span>Answered Questions</span>
				</div>
				<DynamicText class="count fw-bold">
					{{ formatNumber(Object.entries(user.meta.answeredQuestions).length) }}
				</DynamicText>
			</div>
			<div class="stats">
				<div class="stat-title gap-1">
					<img src="@app/assets/images/icons/profileSidebar/answers.svg" alt="">
					<span>Answers</span>
				</div>
				<DynamicText class="count fw-bold">
					{{ formatNumber(Object.entries(user.meta.answers).length) }}
				</DynamicText>
			</div>
			<div class="stats">
				<div class="stat-title gap-1">
					<img src="@app/assets/images/icons/profileSidebar/best-answer.svg" alt="">
					<span>Best Answers</span>
				</div>
				<DynamicText class="count">
					{{ formatNumber(Object.entries(user.meta.bestAnswers).length) }}
				</DynamicText>
			</div>
			<div class="stats">
				<div class="stat-title gap-1">
					<img src="@app/assets/images/icons/profileSidebar/sessions-attended.svg" alt="">
					<span>Sessions Attended</span>
				</div>
				<DynamicText class="count">
					{{ formatNumber(Object.entries(user.meta.sessions).length) }}
				</DynamicText>
			</div>
			<div v-if="user.isScholar" class="stats">
				<div class="stat-title gap-1">
					<img src="@app/assets/images/icons/profileSidebar/sessions-hosted.svg" alt="">
					<span>Sessions Hosted</span>
				</div>
				<DynamicText class="count">
					{{ formatNumber(Object.entries(user.meta.sessions).length) }}
				</DynamicText>
			</div>
			<div class="stats">
				<div class="stat-title gap-1">
					<img src="@app/assets/images/icons/profileSidebar/member-since.svg" alt="">
					<span>Member Since</span>
				</div>
				<DynamicText class="count">
					{{ formatTime(user.dates.signedUpAt) }}
				</DynamicText>
			</div>
		</div>

		<div
			v-if="user.description || user.strongestSubject || user.tags.length > 0"
			:class="['d-flex flex-column gap-0-5 text-dark bg-white', min ?'mini-box pt-2': 'box']"
		>
			<template v-if="user.description">
				<h1 class="fw-bold">
					About Me
				</h1>
				<DynamicText>{{ user.description }}</DynamicText>
				<div class="thick mx-n1" />
			</template>

			<template v-if="user.strongestSubject">
				<h1 class="fw-bold">
					Strongest In
				</h1>
				<Subject :subject-id="user.strongestSubject.id" />
				<div class="thick mx-n1" />
			</template>

			<template v-if="user.weakerSubjects.length > 0">
				<h1 class="fw-bold">
					Also Good In
				</h1>
				<div class="d-flex flex-wrap gap-0-25">
					<Subject v-for="subject in user.weakerSubjects" :key="subject.id" :subject-id="subject.id" />
				</div>
				<div class="thick mx-n1" />
			</template>

			<template v-if="user.tags.length > 0">
				<h1 class="fw-bold">
					Frequent Tags
				</h1>
				<div class="d-flex flex-wrap gap-0-5">
					<Tag v-for="tag in user.tags" :key="tag.id" :tag="tag.id" />
				</div>
			</template>
		</div>
		<!--  -->
		<div v-if="min" :class="['bg-white d-flex align-items-center justify-content-evenly', min ?'mini-box pt-2': 'box']">
			<img :src="user.rank.image" alt="" class="img-rank">
			<DonutChart :score="user.score <= user.expectedScore ? user.score : user.expectedScore" :total="user.expectedScore" :size="100" />
		</div>
	</div>
</template>

<script lang="ts">
import { computed, defineComponent, useRoute } from '@nuxtjs/composition-api'
import { useUser } from '@app/hooks/users/user'
import { formatNumber, pluralize } from '@utils/commons'
import { formatTime } from '@utils/dates'
import Tag from '@app/components/questions/tags/Tag.vue'
import DonutChart from '@app/components/core/DonutChart/index.vue'
import Subject from '@app/components/questions/subjects/Subject.vue'
import { useAuth } from '@app/hooks/auth/auth'
import { useSessionModal } from '@app/hooks/core/modals'
import { setNewSessionTutorIdBio } from '@app/hooks/sessions/sessions'
export default defineComponent({
	name: 'ProfileLeftSidebar',
	components: { Tag, Subject, DonutChart },
	props: {
		min: {
			default: false,
			type: Boolean
		}
	},
	setup () {
		const { id, user: authUser } = useAuth()
		const { userId } = useRoute().value.params
		const { error, loading, user } = useUser(userId)
		const canRequestSession = computed({
			get: () => authUser.value &&
				authUser.value.id !== user.value?.id &&
				authUser.value.canRequestSessions &&
				user.value?.canHostSessions,
			set: () => {}
		})
		const requestNewSession = () => {
			setNewSessionTutorIdBio({ id: user.value?.id!, user: user.value?.bio! })
			useSessionModal().openCreateSession()
		}
		return { id, error, loading, user, formatNumber, formatTime, pluralize, canRequestSession, requestNewSession }
	}
})
</script>

<style lang="scss" scoped>
	.img-rank {
		width: 6.25rem;
	}

	.pen {
		background-color: $color-primary;
		color: white;
		position: absolute;
		bottom: 0;
		right: 0;
		border-radius: 50px;
		width: 45px;
		height: 45px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	p {
		margin: 0;
	}

	.box {
		background: $color-white;
		border-radius: 6px;
		border: 1px solid $color-line;
		padding: 36px;
		max-width: 30rem;

		h1 {
			font-size: 1.5rem;
			margin: 0;
		}
	}

	.mini-box {
		padding: 1rem;
	}

	.sidebar-btn {
		border: none;
		outline: none;
		border-radius: 6px;
		font-size: 1rem;
	}

	.stats {
		display: flex;
		justify-content: space-between;
		align-items: center;
		color: $color-dark;

		.stat-title {
			display: flex;
			align-items: center;

			img {
				height: 1.5rem;
				width: 1.5rem;
			}
		}

		.count { font-weight: bold; }
	}
</style>
