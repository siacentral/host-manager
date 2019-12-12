<template>
	<div class="column-select-wrapper">
		<div class="column-select-columns">
			<div class="control" v-for="column in columns" :key="column.key">
				<input ref="columns" type="checkbox" :column="column.key" :id="`chk-show-${column.key}`" @change="onChangeVisible" />
				<label :for="`chk-show-${column.key}`">{{ column.text }}</label>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	props: {
		columns: Array,
		value: Array
	},
	mounted() {
		this.onUpdateValue();
	},
	methods: {
		onUpdateValue() {
			for (let i = 0; i < this.$refs.columns.length; i++) {
				const chk = this.$refs.columns[i],
					key = chk.getAttribute('column');

				chk.checked = this.value.indexOf(key) !== -1;
			}
		},
		onChangeVisible() {
			const visible = [];

			for (let i = 0; i < this.$refs.columns.length; i++) {
				const chk = this.$refs.columns[i];

				if (chk.checked)
					visible.push(chk.getAttribute('column'));
			}

			this.$emit('input', visible);
		}
	},
	watch: {
		value: {
			deep: true,
			handler: function() {
				this.onUpdateValue();
			}
		}
	}
};
</script>

<style lang="stylus" scoped>
.column-select-wrapper {
	position: absolute;
	right: 4px;
	top: 30px;
	padding: 8px;
	background: bg-dark-accent;
	border-radius: 4px;
	box-shadow: global-box-shadow;

	&:before {
		position: absolute;
		content: '';
		top: -5px;
		right: 5px;
		width: 10px;
		height: 10px;
		transform: rotateZ(45deg);
		background: bg-dark-accent;
		z-index: 1000;
	}

	.column-select-columns {
		height: 100%;
		max-height: 300px;
		overflow-x: hidden;
		overflow-y: auto;
	}

}
</style>