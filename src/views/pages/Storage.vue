<template>
	<div class="page page-storage">
		<div class="controls">
			<button class="btn btn-inline" @click="modal = 'add-folder'"><icon icon="plus" />Add Folder</button>
		</div>
		<div class="display-grid grid-4">
			<div class="grid-item">
				<div class="item-title">Free Storage</div>
				<div class="item-value">
					{{ formatByteString(totalStorage.minus(usedStorage), 2) }}
				</div>
			</div>
			<div class="grid-item">
				<div class="item-title">Total Storage</div>
				<div class="item-value">{{ formatByteString(totalStorage, 2) }}</div>
			</div>
			<div class="grid-item">
				<div class="item-title">Read Failure Rate</div>
				<div class="item-value">{{ Math.round(readPercent * 100) }}%</div>
			</div>
			<div class="grid-item">
				<div class="item-title">Write Failure Rate</div>
				<div class="item-value">{{ Math.round(writePercent * 100) }}%</div>
			</div>
		</div>
		<div class="storage-folders">
			<empty-state icon="folder" text="You have no storage folders" v-if="folders.length === 0" />
			<div class="grid-wrapper" v-else>
				<table>
					<thead>
						<td></td>
						<td>Path</td>
						<td>Used Capacity</td>
						<td>Total Capacity</td>
						<td>Read Errors</td>
						<td>Write Errors</td>
						<td></td>
					</thead>
					<tbody>
						<tr v-for="folder in sorted" :key="folder.path" :class="{ 'folder-disabled': folder.progress > 0 }">
							<td class="fit-text folder-progress">
								<template v-if="folder.progress > 0">
									<icon icon="sync" />
									{{ Math.round(folder.progress * 100) }}%
								</template>
							</td>
							<td>{{ folder.path }}</td>
							<td>{{ formatByteString(folder.used_capacity, 2) }}</td>
							<td>{{ formatByteString(folder.total_capacity, 2) }}</td>
							<td>{{ folder.failed_reads }}</td>
							<td>{{ folder.failed_writes }}</td>
							<td class="fit-text">
								<button class="expand-btn" @click="onResizeFolder(folder)" :v-if="folder.progress <= 0"><icon icon="expand" /></button>
								<button class="delete-btn" :v-if="folder.progress <= 0" @click="onRemoveFolder(folder)"><icon icon="trash" /></button>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
		<add-folder-modal v-if="modal === 'add-folder'" @close="modal = null" />
		<resize-folder-modal v-if="modal === 'resize-folder'" :folder="selectedFolder" @close="modal = null" />
		<remove-folder-modal v-if="modal === 'remove-folder'" :folder="selectedFolder" @close="modal = null" />
	</div>
</template>

<script>
import log from 'electron-log';

import AddFolderModal from '@/components/storage/AddFolderModal';
import ResizeFolderModal from '@/components/storage/ResizeFolderModal';
import RemoveFolderModal from '@/components/storage/RemoveFolderModal';
import EmptyState from '@/components/EmptyState';

import { mapState } from 'vuex';
import { formatByteString } from '@/utils/format';
import { refreshHostStorage } from '@/data/storage';

export default {
	components: {
		AddFolderModal,
		EmptyState,
		ResizeFolderModal,
		RemoveFolderModal
	},
	beforeMount() {
		this.refreshTimer = setInterval(refreshHostStorage, 5000);
	},
	beforeDestroy() {
		window.clearInterval(this.refreshTimer);
	},
	data() {
		return {
			refreshTimer: null,
			selectedFolder: null,
			modal: null
		};
	},
	computed: {
		...mapState('hostStorage', ['folders', 'usedStorage', 'totalStorage',
			'readPercent', 'writePercent']),
		sorted() {
			const folders = this.folders.slice();

			folders.sort((a, b) => {
				if (a.progress > 0 && b.progress <= 0)
					return -1;

				if (a.progress <= 0 && b.progress > 0)
					return 1;

				if (a.path < b.path)
					return -1;

				if (a.path > b.path)
					return 1;

				return 0;
			});

			return folders;
		}
	},
	methods: {
		formatByteString,
		onResizeFolder(folder) {
			try {
				this.selectedFolder = folder;
				this.modal = 'resize-folder';
			} catch (ex) {
				log.error('storage resize click', ex.message);
			}
		},
		onRemoveFolder(folder) {
			try {
				this.selectedFolder = folder;
				this.modal = 'remove-folder';
			} catch (ex) {
				log.error('storage remove click', ex.message);
			}
		}
	}
};
</script>

<style lang="stylus" scoped>
.page-storage {
	display: grid;
	grid-template-rows: auto auto minmax(0, 1fr);
	overflow: hidden;
}

.controls {
	padding: 15px 5px;
	text-align: right;
}

.display-grid {
	margin-bottom: 15px;
}

.storage-folders {
	width: 100%;
	height: 100%;

	.grid-wrapper {
		width: 100%;
		height: 100%;
		overflow: auto;
	}
}

td.folder-progress.folder-progress {
	color: warning-accent;
	opacity: 1;
}

.folder-disabled {
	td {
		opacity: 0.27;
	}
}

table button {
	padding: 10px;
	color: rgba(255, 255, 255, 0.84);
	font-size: 1.2rem;
	outline: none;
	background: none;
	border: none;
	cursor: pointer;

	&:disabled {
		cursor: default;
		pointer-events: none;
	}
}

</style>
