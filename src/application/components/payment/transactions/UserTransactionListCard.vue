<template>
	<div class="d-flex table-data-style p-1">
		<div class="col-3">
			<DynamicText>{{ formatTime(transaction.createdAt) }}</DynamicText>
		</div>
		<div class="col-3 d-flex align-items-center justify-content-center gap-0-25">
			<Coins :size="24" :gold="transaction.isGold" />
			<DynamicText :class="transaction.isGain ? 'text-success' : 'text-danger'">
				{{ formatNumber(transaction.amount) }}
			</DynamicText>
		</div>
		<div class="col-6">
			<DynamicText>{{ transaction.event }}</DynamicText>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@nuxtjs/composition-api'
import { TransactionEntity } from '@modules/meta'
import { formatNumber } from '@utils/commons'
import { formatTime } from '@utils/dates'
export default defineComponent({
	name: 'UserTransactionListCard',
	props: {
		transaction: {
			required: true,
			type: Object as PropType<TransactionEntity>
		}
	},
	setup () {
		return { formatNumber, formatTime }
	}
})
</script>
<style lang="scss" scoped>
	.table-data-style {
		border: 1px solid $color-line;
		border-radius: 7px;
		background: $color-tags;
		font-size: 15px;
		color: $color-dark;
	}
</style>
