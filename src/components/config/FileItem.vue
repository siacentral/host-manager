<template>
	<div class="config-item">
		<div class="config-title">
			<slot name="title" />
		</div>
		<div class="config-error"><slot name="error" /></div>
		<div class="control control-search">
			<input type="text" v-model="path" @input="$emit('update', path)" />
			<button @click="onSelectDir"><icon icon="search" /> Browse</button>
		</div>
		<div class="config-denom"><slot name="denomination" /></div>
		<p class="config-description"><slot name="description" /></p>
	</div>
</template>

<script>
import { remote } from 'electron';

const dialog = remote.dialog;

export default {
	props: {
		value: String
	},
	emits: ['update'],
	beforeMount() {
		this.path = this.value;
	},
	data() {
		return {
			path: ''
		};
	},
	methods: {
		async onSelectDir() {
			const { filePath } = await dialog.showSaveDialog({ title: 'Select Your Registry Location', defaultPath: 'registry.dat', nameFieldLabel: 'Filename', buttonLabel: 'Select' });

			this.path = filePath || '';

			this.$emit('update', this.path);
		}
	}
};
</script>

<style lang="stylus" scoped>
.config-item {
	background: #191919;
	border-radius: 8px;
	margin-bottom: 15px;
	padding: 15px;

	.config-title {
		display: grid;
		color: rgba(255, 255, 255, 0.54);
		grid-template-columns: repeat(2, auto);
		justify-content: space-between
		align-content: center;
		margin-bottom: 15px;

		.control {
			margin: 0;
			padding: 0;
		}
	}

	.config-description {
		color: rgba(255, 255, 255, 0.54);
		font-size: 0.9rem;
	}

	.config-denom {
		text-align: right;
		color: rgba(255, 255, 255, 0.54);
	}

	.control input {
		text-align: right;
	}
}
</style>