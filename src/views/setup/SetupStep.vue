<template>
	<div class="setup-step">
		<div></div>
		<div class="setup-info">
			<slot name="info"></slot>
		</div>
		<div class="setup-content-wrapper">
			<div class="setup-contents">
				<slot></slot>
			</div>
		</div>
		<div></div>
		<div class="setup-controls">
			<slot name="controls"></slot>
		</div>
	</div>
</template>

<style lang="stylus">
.setup-step {
	display: grid;
	width: 100%;
	height: 100%;
	grid-template-rows: 1fr auto auto 1fr auto;

	.setup-icon.setup-icon {
		color: primary;
		margin: 0 auto 30px;

		svg {
			display: block;
			width: auto;
			height: 80px;
			margin: 0 auto;
		}
	}

	h1, h3 {
		text-align: center;
		color: primary;
		margin: 0 0 25px;
	}

	p {
		width: 100%;
		margin: 0 0 10px;
		color: rgba(0, 0, 0, 0.54);
		text-align: left;
	}

	.setup-info, .setup-contents {
		width: 100%;
		margin: auto;
		padding: 0 10vw;
	}

	.setup-info {
		padding: 30px 10vw;
	}

	.setup-content-wrapper {
		display: flex;
		width: 100%;
		flex:1;
		flex-direction: column;
		overflow-y: auto;
		overflow-x: hidden;
	}

	.setup-controls {
		padding: 15px;
		text-align: center;

		* {
			margin-bottom: 0;
			margin-right: 15px;

			&:last-child {
				margin-right: 0;
			}
		}
	}
}

body.dark {

	.setup-step p {
		color: rgba(255, 255, 255, 0.54);
	}

}
</style>
