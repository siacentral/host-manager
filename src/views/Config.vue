<template>
	<div class="page page-config">
		<div class="controls controls-header">
			<div class="control control-inline">
				<input type="checkbox" :checked="acceptingContracts" id="chk-accepting-contracts" />
				<label id="chk-accepting-contracts">Accept Contracts</label>
			</div>
			<button class="btn btn-inline" @click="modal='announce'">Announce</button>
		</div>
		<div class="host-config-header">
			<div>Current</div>
			<div>Average</div>
		</div>
		<div class="host-config">
			<div class="config-header">Financials</div>
			<config-item title="Contract Price"
				configKey="mincontractprice"
				:value="currentConfig.contractPrice"
				:avgValue="formatPriceString(avgContractPrice, 2)"
				:error="errors['mincontractprice']"
				description="The amount of money to form a contract
					with the host."
				@change="onChangePrice" />
			<config-item title="Storage Price"
				configKey="minstorageprice"
				:value="currentConfig.storagePrice"
				:avgValue="formatPriceString(avgStoragePrice.times(1e12).times(4320), 2)"
				sublabel="per tb/month"
				:error="errors['minstorageprice']"
				description="The amount of money that the renter will be charged
					for storing 1 terabyte of data for a month. Payment is not received until after
					the contract has expired and a valid proof has been submitted."
				@change="onChangeMonthlyPrice" />
			<config-item title="Download Price"
				configKey="mindownloadbandwidthprice"
				:value="currentConfig.downloadPrice"
				:avgValue="formatPriceString(avgDownloadPrice.times(1e12), 2)"
				sublabel="per tb/month"
				:error="errors['mindownloadbandwidthprice']"
				description="The amount of money that the renter will be
					charged to download 1 terabyte of stored data. Payment is not received until after
					the contract has expired and a valid proof has been submitted."
				@change="onChangeDataPrice" />
			<config-item title="Upload Price"
				configKey="minuploadbandwidthprice"
				:value="currentConfig.uploadPrice"
				:avgValue="formatPriceString(avgUploadPrice.times(1e12), 2)"
				sublabel="per tb/month"
				:error="errors['minuploadbandwidthprice']"
				description="The amount of money that the renter will be
					charged to upload 1 terabyte of data to store. Payment is not received until after
					the contract has expired and a valid proof has been submitted."
				@change="onChangeDataPrice" />
			<config-item title="Base RPC Price"
				configKey="minbaserpcprice"
				:value="currentConfig.baseRPCPrice"
				:avgValue="formatPriceString(avgBaseRPCPrice, 2)"
				sublabel="per request"
				:error="errors['minuploadbandwidthprice']"
				description="The amount of money that the renter will be
					charged to for each upload, download, and contract formation request to the host."
				@change="onChangePrice" />
			<config-item title="Sector Access Price"
				configKey="minsectoraccessprice"
				:value="currentConfig.sectorAccessPrice"
				:avgValue="formatPriceString(avgSectorAccessPrice, 2)"
				sublabel="per sector"
				:error="errors['minuploadbandwidthprice']"
				description="The amount of money that the renter will be charged to read a
					single sector of data from disk. The host has to read at least one full 4MB sector
					from disk regardless of how much the renter intends to download
					this is charged to pay for the physical disk resources the renter consumes."
				@change="onChangePrice" />
			<div class="config-header">Collateral</div>
			<config-item title="Collateral Budget"
				configKey="collateralbudget"
				:value="currentConfig.collateralBudget"
				:error="errors['collateralbudget']"
				description="The maximum amount of collateral
					the host will lock for all contracts. When this is full the host will reject new
					contracts"
				@change="onChangePrice" />
			<config-item title="Max Collateral"
				configKey="maxcollateral"
				:value="currentConfig.maxCollateral"
				:avgValue="formatPriceString(avgMaxCollateral, 2)"
				sublabel="per contract"
				:error="errors['maxcollateral']"
				description="The maximum amount of collateral
					that the host will risk per contract. If an individual contract reaches this maximum
					the host will refuse to accept any more data from that contract."
				@change="onChangeNumber" />
			<config-item title="Collateral"
				configKey="collateral"
				:value="currentConfig.collateral"
				:avgValue="formatPriceString(avgCollateral.times(1e12).times(4320), 2)"
				sublabel="per tb/month"
				:error="errors['collateral']"
				description="The amount of collateral the host will
					risk for 1 terabyte of stored data per month. A good amount is 2x Storage Price.
					Any risked collateral will be lost if a valid storage proof is not
					submitted after contract expiration"
				@change="onChangeMonthlyPrice" />
			<div class="config-header">Duration</div>
			<config-item title="Max Duration"
				configKey="maxduration"
				:value="currentConfig.maxDuration"
				:avgValue="formatBlockTimeString(avgMaxDuration)"
				:error="errors['maxduration']"
				description="The maximum amount of time the host will
					accept for a storage contract. Hosts are only payed at the end of a storage contract."
				@change="onChangeTime" />
			<config-item title="Proof Window Duration"
				configKey="windowsize"
				:value="currentConfig.windowSize"
				:avgValue="formatBlockTimeString(avgWindowSize)"
				:error="errors['windowsize']"
				description="The amount of time the host has to submit
					a storage proof when the contract expires."
				@change="onChangeNumber" />
			<div class="config-header">Network</div>
			<config-item title="Download Batch Size"
				configKey="maxdownloadbatchsize"
				:value="currentConfig.maxDownloadSize"
				:avgValue="formatByteString(avgMaxDownloadSize, 2)"
				:error="errors['maxdownloadbatchsize']"
				description="The maximum size of a single download request from
					the renter. Larger batch sizes mean fewer round trips and better performance,
					but more financial risk for the host."
				@change="onChangeBytes" />
			<config-item title="Revise Batch Size"
				configKey="maxrevisebatchsize"
				:value="currentConfig.maxReviseSize"
				:avgValue="formatByteString(avgMaxReviseSize, 2)"
				:error="errors['maxrevisebatchsize']"
				description="The maximum size of a single file contract revision.
					Larger batch sizes allow for higher throughput of renters, but more financial risk for the host."
				@change="onChangeBytes" />
		</div>
		<div class="controls">
			<button class="btn btn-success btn-inline" @click="onClickUpdate" :disabled="updating">Update Configuration</button>
		</div>
		<announce-host-modal v-if="modal === 'announce'" @close="modal = null" />
	</div>
</template>

<script>
import log from 'electron-log';

import { mapState, mapActions } from 'vuex';
import { formatByteString, formatPriceString, formatBlockTimeString } from '@/utils/format';
import { parseCurrencyString, parseByteString, parseBlockTimeString } from '@/utils/parse';
import SiaApiClient from '@/api/sia';
import { refreshHostConfig } from '@/data/config';

import AnnounceHostModal from '@/components/config/AnnounceHostModal';
import ConfigItem from '@/components/config/ConfigItem';

export default {
	components: {
		AnnounceHostModal,
		ConfigItem
	},
	computed: {
		...mapState({
			appConfig: state => state.config
		}),
		...mapState('hostConfig', ['acceptingContracts', 'netaddress', 'maxDuration',
			'maxReviseSize', 'maxDownloadSize', 'windowSize', 'contractPrice', 'downloadPrice',
			'uploadPrice', 'storagePrice', 'collateral', 'maxCollateral',
			'collateralBudget', 'baseRPCPrice', 'sectorAccessPrice']),
		...mapState('avgConfig', ['avgMaxDuration', 'avgWindowSize', 'avgMaxReviseSize',
			'avgMaxDownloadSize', 'avgContractPrice', 'avgDownloadPrice', 'avgUploadPrice',
			'avgStoragePrice', 'avgCollateral', 'avgMaxCollateral', 'avgBaseRPCPrice',
			'avgSectorAccessPrice'])
	},
	data() {
		return {
			errors: {},
			config: {},
			currentConfig: {},
			updating: false,
			modal: null
		};
	},
	mounted() {
		this.updateConfig();
	},
	methods: {
		...mapActions(['pushNotification']),
		formatBlockTimeString,
		formatByteString,
		formatPriceString,
		updateConfig() {
			this.currentConfig = {
				contractPrice: formatPriceString(this.contractPrice, 2),
				storagePrice: formatPriceString(this.storagePrice.times(1e12).times(4320), 2),
				downloadPrice: formatPriceString(this.downloadPrice.times(1e12), 2),
				uploadPrice: formatPriceString(this.uploadPrice.times(1e12), 2),
				collateralBudget: formatPriceString(this.collateralBudget, 2),
				baseRPCPrice: formatPriceString(this.baseRPCPrice, 2),
				sectorAccessPrice: formatPriceString(this.sectorAccessPrice, 2),
				maxCollateral: formatPriceString(this.maxCollateral, 2),
				collateral: formatPriceString(this.collateral.times(1e12).times(4320), 2),
				maxDuration: formatBlockTimeString(this.maxDuration),
				windowSize: formatBlockTimeString(this.windowSize),
				maxDownloadSize: formatByteString(this.maxDownloadSize, 2),
				maxReviseSize: formatByteString(this.maxReviseSize, 2)
			};
		},
		async onClickUpdate() {
			if (this.updating)
				return;

			try {
				this.updating = true;

				const client = new SiaApiClient(this.appConfig),
					resp = await client.updateHost(this.config);

				if (resp.statusCode !== 200) {
					this.pushNotification({
						message: resp.body.message,
						icon: 'cogs',
						style: 'danger'
					});
					return;
				}

				await refreshHostConfig();
				this.updateConfig();

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
			}
		},
		onChangePrice(obj) {
			const { key, value } = obj;

			try {
				this.config[key] = parseCurrencyString(value).toFixed(0).toString(10);

				this.$set(this.errors, key, null);
			} catch (ex) {
				log.error(ex.message);
				this.$set(this.errors, key, ex.message);
			}
		},
		onChangeMonthlyPrice(obj) {
			const { key, value } = obj;

			try {
				const val = parseCurrencyString(value);

				this.config[key] = val.div(1e12).div(4320).toFixed(0).toString(10);
				this.$set(this.errors, key, null);
			} catch (ex) {
				log.error(ex.message);
				this.$set(this.errors, key, ex.message);
			}
		},
		onChangeDataPrice(obj) {
			const { key, value } = obj;

			try {
				this.config[key] = parseCurrencyString(value).div(1e12).toFixed(0).toString(10);
				this.$set(this.errors, key, null);
			} catch (ex) {
				log.error(ex.message);
				this.$set(this.errors, key, ex.message);
			}
		},
		onChangeNumber(obj) {
			const { key, value } = obj;

			try {
				this.config[key] = parseInt(value, 10);
				this.$set(this.errors, key, null);
			} catch (ex) {
				log.error(ex.message);
				this.$set(this.errors, key, ex.message);
			}
		},
		onChangeTime(obj) {
			const { key, value } = obj;

			try {
				this.config[key] = parseBlockTimeString(value);
				this.$set(this.errors, key, null);
			} catch (ex) {
				log.error(ex.message);
				this.$set(this.errors, key, ex.message);
			}
		},
		onChangeBytes(obj) {
			const { key, value } = obj;

			try {
				this.config[key] = parseByteString(value).toString(10);
				this.$set(this.errors, key, null);
			} catch (ex) {
				log.error(ex.message);
				this.$set(this.errors, key, ex.message);
			}
		}
	}
};
</script>

<style lang="stylus" scoped>
.page-config {
	display: grid;
	grid-template-rows: repeat(2, auto) minmax(0, 1fr) auto;
}

.host-config-header {
    display: grid;
    grid-template-columns: 2fr 1fr;
    grid-gap: 30px;
    padding: 15px 30px 5px;
    text-align: right;
    color: rgba(255, 255, 255,0.54);
}

.config-header {
    margin-bottom: 15px;
    font-size: 1rem;
    color: rgba(255, 255, 255, 0.54);
    margin-top: 45px;

    &:first-of-type {
        margin-top: 0;
    }
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
	width: 100%;
	height: 100%;
	padding: 15px;
	overflow-y: auto;
}
</style>
