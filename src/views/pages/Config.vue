<template>
	<div class="page page-config">
		<div class="controls controls-header">
			<div class="control control-inline">
				<input type="checkbox" v-model="acceptContracts" id="chk-accepting-contracts" />
				<label for="chk-accepting-contracts">Accept Contracts</label>
			</div>
			<button class="btn btn-inline" @click="modal='announce'">Announce</button>
		</div>
		<div class="host-config">
			<div class="config-header">Storage</div>
			<price-item :value="contractPrice" :average="averageSettings.contract_price" :pinned="isPinned('mincontractprice')" @change="onChangePrice('mincontractprice', $event)">
				<template slot="title">Contract Price</template>
				<template slot="denomination">per contract</template>
				<template slot="description">The amount of Siacoin to form a contract with the host. A contract is required to upload, download and store data. <span class="suggestion">Suggested: less than 1 SC. The contract fee should only be used to cover expected transaction fees.</span></template>
			</price-item>
			<price-item :value="storagePrice" :average="averageSettings.storage_price.times(4320).times(1e12)" :pinned="isPinned('minstorageprice')" @change="onChangePrice('minstorageprice', $event)">
				<template slot="title">Storage Price</template>
				<template slot="denomination">per {{ dataUnit }}/Month</template>
				<template slot="description">The amount of Siacoin to store 1 {{ dataUnit }} for 1 month</template>
			</price-item>
			<price-item :value="collateral" :average="averageSettings.collateral.times(4320).times(1e12)" :pinned="isPinned('collateral')" @change="onChangePrice('collateral', $event)">
				<template slot="title">Collateral</template>
				<template slot="denomination">per sector</template>
				<template slot="description">The amount of Siacoin per 1 {{ dataUnit }}/month stored to be locked as collateral. <span class="suggestion">Suggested: {{ recommendedCollateral }}.</span></template>
			</price-item>
			<price-item :value="maxcollateral" :pinned="isPinned('maxcollateral')" @change="onChangePrice('maxcollateral', $event)">
				<template slot="title">Max Collateral</template>
				<template slot="denomination">per contract</template>
				<template slot="description">The maximum amount of collateral the host will lock into a single contract. This setting also limits the amount of data that the renter can store per contract. <span class="suggestion">Suggested: {{ recommendedMaxCollateral }} (1 TB of uploaded data).</span></template>
			</price-item>
			<price-item :value="collateralBudget" :pinned="isPinned('collateralbudget')" @change="onChangePrice('collateralbudget', $event)">
				<template slot="title">Collateral Budget</template>
				<template slot="description">The maximum amount of Siacoin that can be used as collateral. <span class="suggestion">Suggested: to prevent issues with stale contracts, a very large number or multiple times your wallet balance.</span></template>
			</price-item>
			<duration-item :value="maxDuration" :average="averageSettings.max_duration" @change="onChangeValue('maxduration', $event)">
				<template slot="title">Max Contract Duration</template>
				<template slot="description">The maximum amount of time a contract can be created for. Payouts only occur at the end of the contract. <span class="suggestion">Suggested: at least 3 months.</span></template>
			</duration-item>
			<div class="config-header">Network</div>
			<price-item :value="downloadPrice" :average="averageSettings.download_price.times(1e12)" :pinned="isPinned('mindownloadbandwidthprice')" @change="onChangePrice('mindownloadbandwidthprice', $event)">
				<template slot="title">Download Price</template>
				<template slot="denomination">per {{ dataUnit }}</template>
				<template slot="description">The amount of Siacoin to download 1 {{ dataUnit }} from the host</template>
			</price-item>
			<price-item :value="uploadPrice" :average="averageSettings.upload_price.times(1e12)" :pinned="isPinned('minuploadbandwidthprice')" @change="onChangePrice('minuploadbandwidthprice', $event)">
				<template slot="title">Upload Price</template>
				<template slot="denomination">per {{ dataUnit }}</template>
				<template slot="description">The amount of Siacoin to upload 1 {{ dataUnit }} to the host</template>
			</price-item>
			<size-item :value="downloadBatchSize" :average="averageSettings.max_download_batch_size" @change="onChangeValue('maxdownloadbatchsize', $event)">
				<template slot="title">Download Batch Size</template>
				<template slot="description">The maximum size of a download request. Larger batch size means better performance, but higher risk of losing Siacoin when downloading data.</template>
			</size-item>
			<size-item :value="reviseBatchSize" :average="averageSettings.max_revise_batch_size" @change="onChangeValue('maxrevisebatchsize', $event)">
				<template slot="title">Revise Batch Size</template>
				<template slot="description">The maximum size of an upload request. Larger batch size means better performance, but higher risk of losing Siacoin when uploading data.</template>
			</size-item>
			<div class="config-header">Skynet</div>
			<size-item :value="registrySize" @change="onChangeValue('registrysize', $event)">
				<template slot="title">Registry Size</template>
				<template slot="description">The size of the Skynet Registry. The Skynet Registry is a key value store for linking uploaded data to a constant key. Hosts are payed much more than the resources actually consumed. Make sure that you have enough free space on your disk before allocating the registry. <span class="suggestion">Suggested: 4GB</span></template>
			</size-item>
			<file-item :value="registryPath" @change="onChangeValue('customregistrypath', $event)">
				<template slot="title">Custom Registry Location</template>
				<template slot="description">The location of the Skynet Registry on disk, leave blank for default. Defaults to your Sia data path, usually the disk your operating system is installed on.</template>
			</file-item>
			<div class="config-header">Advanced</div>
			<price-item :value="baseRPCPrice" :average="averageSettings.base_rpc_price" :pinned="isPinned('minbaserpcprice')" @change="onChangePrice('minbaserpcprice', $event)">
				<template slot="title">Base RPC Price</template>
				<template slot="denomination">per RPC</template>
				<template slot="description">The amount of Siacoin required to interact with the host. <span class="suggestion">Suggested: very low or zero since this is charged per interaction.</span></template>
			</price-item>
			<price-item :value="sectorAccessPrice" :average="averageSettings.sector_access_price" :pinned="isPinned('minsectoraccessprice')" @change="onChangePrice('minsectoraccessprice', $event)">
				<template slot="title">Sector Access Price</template>
				<template slot="denomination">per sector</template>
				<template slot="description">The amount of Siacoin required to download or upload a single sector from the host. <span class="suggestion">Suggested: very low or zero since this is charged per sector in addition to download price.</span></template>
			</price-item>
		</div>
		<div class="controls">
			<button class="btn btn-success btn-inline" @click="onClickUpdate" :disabled="!changed || updating">Update Configuration</button>
		</div>
		<announce-host-modal v-if="modal === 'announce'" @close="onModalClose" />
	</div>
</template>

<script>
import log from 'electron-log';
import BigNumber from 'bignumber.js';
import { mapState, mapActions } from 'vuex';
import { writeConfig } from '@/utils';
import { parseCurrencyString } from '@/utils/parse';
import SiaApiClient from '@/api/sia';
import { refreshHostConfig } from '@/sync/config';
import { formatPriceString } from '@/utils/format';

import AnnounceHostModal from '@/components/config/AnnounceHostModal';
import PriceItem from '@/components/config/PriceItem';
import SizeItem from '@/components/config/SizeItem';
import FileItem from '@/components/config/FileItem';
import DurationItem from '@/components/config/DurationItem';

export default {
	components: {
		AnnounceHostModal,
		FileItem,
		DurationItem,
		PriceItem,
		SizeItem
	},
	computed: {
		...mapState({
			appConfig: state => state.config,
			hostConfig: state => state.hostConfig.config,
			averageSettings: state => state.explorer.averageSettings,
			currency: state => state.config.currency,
			coinPrice: state => state.coinPrice
		}),
		dataUnit() {
			return this.appConfig.data_unit === 'decimal' ? 'TB' : 'TiB';
		},
		recommendedCollateral() {
			const rec = this.storagePrice.times(2),
				fmt = formatPriceString(rec, 2, 'sc', 1);

			return `${fmt.value} SC`;
		},
		recommendedMaxCollateral() {
			const rec = this.collateral.div(1e12).div(4320).times(this.maxDuration).times(1e12),
				fmt = formatPriceString(rec, 2, 'sc', 1);

			return `${fmt.value} SC`;
		}
	},
	data() {
		return {
			acceptContracts: false,
			contractPrice: new BigNumber(0),
			storagePrice: new BigNumber(0),
			downloadPrice: new BigNumber(0),
			uploadPrice: new BigNumber(0),
			sectorAccessPrice: new BigNumber(0),
			baseRPCPrice: new BigNumber(0),
			collateralBudget: new BigNumber(0),
			maxcollateral: new BigNumber(0),
			collateral: new BigNumber(0),
			downloadBatchSize: new BigNumber(0),
			reviseBatchSize: new BigNumber(0),
			maxDuration: 0,
			registrySize: new BigNumber(0),
			registryPath: '',
			errors: {},
			config: {},
			currentConfig: {},
			pinned: {},
			updating: false,
			changed: false,
			modal: null
		};
	},
	beforeMount() {
		this.updateConfig();
	},
	methods: {
		...mapActions(['pushNotification', 'setConfig']),
		isPinned(key) {
			return this.appConfig.host_pricing_pins && this.appConfig.host_pricing_pins[key] && typeof this.appConfig.host_pricing_pins[key].currency === 'string' && typeof this.appConfig.host_pricing_pins[key].value === 'string';
		},
		convertToBasePrice(value, key) {
			const byteFactor = this.appConfig.data_unit === 'decimal' ? 1e12 : 1099511627776;

			switch (key) {
			case 'minstorageprice':
			case 'collateral':
				value = value.div(byteFactor).div(4320);
				break;
			case 'mindownloadbandwidthprice':
			case 'minuploadbandwidthprice':
				value = value.div(byteFactor);
				break;
			}

			return value;
		},
		convertToPrice(value, key) {
			const byteFactor = this.appConfig.data_unit === 'decimal' ? 1e12 : 1099511627776;

			switch (key) {
			case 'minstorageprice':
			case 'collateral':
				value = value.times(byteFactor).times(4320);
				break;
			case 'mindownloadbandwidthprice':
			case 'minuploadbandwidthprice':
				value = value.times(byteFactor);
				break;
			}

			return value;
		},
		setValueOrPin(key) {
			if (!this.isPinned(key))
				return this.convertToPrice(this.hostConfig[key], key);

			const { value, currency } = this.appConfig.host_pricing_pins[key];

			return parseCurrencyString(value, this.coinPrice[currency]);
		},
		updateConfig() {
			this.acceptContracts = this.hostConfig.acceptingcontracts;
			this.contractPrice = this.setValueOrPin('mincontractprice');
			this.storagePrice = this.setValueOrPin('minstorageprice');
			this.downloadPrice = this.setValueOrPin('mindownloadbandwidthprice');
			this.uploadPrice = this.setValueOrPin('minuploadbandwidthprice');
			this.baseRPCPrice = this.setValueOrPin('minbaserpcprice');
			this.sectorAccessPrice = this.setValueOrPin('minsectoraccessprice');
			this.collateralBudget = this.setValueOrPin('collateralbudget');
			this.collateral = this.setValueOrPin('collateral');
			this.maxcollateral = this.setValueOrPin('maxcollateral');
			this.maxDuration = this.hostConfig.maxduration;

			this.reviseBatchSize = this.hostConfig.maxrevisebatchsize;
			this.downloadBatchSize = this.hostConfig.maxdownloadbatchsize;

			this.registrySize = this.hostConfig.registrysize;
			this.registryPath = this.hostConfig.customregistrypath;
		},
		async onModalClose() {
			try {
				this.modal = null;
				this.updating = true;

				await refreshHostConfig();
				this.updateConfig();
			} catch (ex) {
				log.error('config modal close', ex.message);
			} finally {
				this.updating = false;
			}
		},
		onChangePrice(key, { value, fiat, pinned }) {
			try {
				if (pinned) {
					this.pinned[key] = {
						currency: this.appConfig.currency,
						value: fiat
					};
				} else
					this.pinned[key] = false;

				this.config[key] = this.convertToBasePrice(value, key).toFixed(0).toString(10);
				this.changed = true;
			} catch (ex) {
				console.error(`Config.onChangePrice (${key})`, ex);
			}
		},
		onChangeValue(key, value) {
			try {
				this.config[key] = value;
				this.changed = true;
			} catch (ex) {
				console.error(`Config.onChangeSize (${key})`, ex);
			}
		},
		async onClickUpdate() {
			if (this.updating)
				return;

			try {
				this.updating = true;

				const client = new SiaApiClient(this.appConfig),
					configPins = { ...this.appConfig.host_pricing_pins };

				await client.updateHost({
					...this.config,
					windowsize: 144
				});

				for (let pin in this.pinned) {
					if (!pin)
						continue;

					if (this.pinned[pin] === false) {
						configPins[pin] = null;
						continue;
					}

					configPins[pin] = this.pinned[pin];
				}

				this.setConfig({ host_pricing_pins: configPins });

				await refreshHostConfig();
				this.updateConfig();
				await writeConfig(this.appConfig);
				this.config = {};

				this.pushNotification({
					message: 'Host Configuration Updated',
					icon: 'cogs',
					style: 'success'
				});
			} catch (ex) {
				this.pushNotification({
					message: ex.message,
					icon: 'cogs',
					style: 'danger'
				});
			} finally {
				this.updating = false;
				this.changed = false;
			}
		}
	},
	watch: {
		acceptContracts(value) {
			if (this.hostConfig.acceptingcontracts === value)
				return;

			this.config['acceptingcontracts'] = value;
			this.changed = true;
		}
	}
};
</script>

<style lang="stylus" scoped>
.page-config {
	display: grid;
	grid-template-rows: auto minmax(0, 1fr) auto;
	overflow: hidden;
}

.controls {
	padding: 15px 5px;
	text-align: center;

	&.controls-header {
		text-align: right;
	}

	.control {
		margin-bottom: 0;
		margin-right: 15px;
	}
}

.host-config {
	display: grid;
	grid-template-columns: repeat(1, minmax(0, 1fr));
	grid-gap: 15px;
	padding: 15px;
	width: 100%;
	height: 100%;
	overflow-y: auto;

	@media screen and (min-width: 1000px) {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}

	@media screen and (min-width: 1500px) {
		grid-template-columns: repeat(3, minmax(0, 1fr));
	}
}

.config-header {
    font-size: 1rem;
	background: bg-dark;
    color: rgba(255, 255, 255, 0.54);
	grid-column: 1 / -1;
	z-index: 1;

    &:first-of-type {
        margin-top: 0;
    }
}

.suggestion {
	color: primary;
	font-size: 0.9em;
}
</style>
