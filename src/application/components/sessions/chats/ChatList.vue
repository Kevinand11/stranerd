<template>
	<div class="d-flex flex-column px-2 py-1 background gap-0-5">
		<span v-if="hasMore" class="small mb-1 mx-auto cursor-pointer" @click="fetchOlderChats">Fetch more</span>
		<p v-if="chats.length === 0" class="text-center my-auto">
			No messages found. Send a message now
		</p>
		<div v-for="session in chats" :key="session.hash" class="d-flex flex-column gap-0-5">
			<DynamicText class="bg-line session-date mx-auto">
				{{ formatTime(session.date, true) }}
			</DynamicText>
			<ChatListCard v-for="chat in session.chats" :key="chat.hash" :chat="chat" :user-id="userId" />
		</div>
		<PageLoading v-if="loading" />
		<DisplayError :error="error" />
	</div>
</template>

<script lang="ts">
import { defineComponent, onBeforeUnmount, onMounted } from '@nuxtjs/composition-api'
import { useChats } from '@app/hooks/sessions/chats'
import ChatListCard from '@app/components/sessions/chats/ChatListCard.vue'
import { formatTime } from '@utils/dates'
export default defineComponent({
	name: 'ChatList',
	components: { ChatListCard },
	props: {
		userId: {
			type: String,
			required: true
		}
	},
	setup (props) {
		const { chats, listener, fetchOlderChats, hasMore, error, loading } = useChats(props.userId)
		onMounted(listener.startListener)
		onBeforeUnmount(listener.closeListener)
		return { chats, error, loading, fetchOlderChats, hasMore, formatTime }
	}
})
</script>

<style lang="scss" scoped>
	.session-date {
		width: fit-content;
		padding: 3px 12px;
		border-radius: 4px;
	}

	.background {
		background: url("@app/assets/images/doodle.png");
	}
</style>
