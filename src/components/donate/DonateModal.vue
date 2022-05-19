<template>
	<modal title="" modalStyle="small" @close="$emit('close')">
		<div class="header text-center">
			<sia-central class="logo" />
		</div>
		<donate class="content" />
	</modal>
</template>

<script>
import Donate from './Donate';
import Modal from '@/components/Modal';
import SiaCentral from '@/components/svg/SiaCentral';

export default {
	components: {
		Donate,
		Modal,
		SiaCentral
	}
};
</script>

<style lang="stylus" scoped>
.header {
	position: absolute;
	top: 0;
	left: 64px;
	right: 64px;
}

.logo {
	width: 64px;
	margin: 15px auto;
}

.content {
	margin-top: 45px;
}
</style>