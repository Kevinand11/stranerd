<template>
	<div class="position-relative">
		<div class="center">
			<div class="spinner-border text-dark" role="status" :style="`width:${size}rem;height:${size}rem;z-index:999999999999999999999999999999999;`">
				<span class="sr-only">Loading...</span>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api'
export default defineComponent({
	name: 'PageLoading',
	props: {
		size: {
			type: Number,
			default: () => 3.5
		}
	}
})
</script>

<style lang="scss" scoped>
	.center {
		background: rgba($color-white, 0.6);
		position: fixed;
		left: 0;
		top: 0;
		width: 100vw;
		height: vh(100);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 1000000;
	}
</style>
