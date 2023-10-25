<script lang="ts">
	import type { Writable } from 'svelte/store'

	export let name: Writable<string>
	export let doExport: Writable<boolean>
	export let enableCurve: Writable<boolean>
	export let snapping: Writable<number>
	export let variableName: Writable<string>
</script>

<div>
	<div class="dialog_bar form_bar">
		<label class="name_space_left" for="name">Name:</label>
		<input
			type="text"
			class="dark_bordered half focusable_input"
			id="name"
			bind:value={$name}
		/>
	</div>
	<div class="dialog_bar form_bar">
		<label class="name_space_left" for="export">Export:</label>
		<input type="checkbox" class="focusable_input" id="export" bind:checked={$doExport} />
	</div>
	<div class="dialog_bar form_bar">
		<label class="name_space_left" for="export">Enable Curve:</label>
		<input type="checkbox" class="focusable_input" id="export" bind:checked={$enableCurve} />
	</div>
	<div class="dialog_bar form_bar">
		<label class="name_space_left" for="name">Snapping:</label>
		<div class="numeric_input">
			<input
				id="snapping"
				class="dark_bordered focusable_input"
				bind:value={$snapping}
				inputmode="decimal"
			/>
			<div class="tool numaric_input_slider">
				<i class="material-icons icon">code</i>
			</div>
		</div>
	</div>
	<div class="dialog_bar form_bar">
		<label class="name_space_left" for="variable_name">Data Var:</label>
		<input
			type="text"
			class="dark_bordered half focusable_input"
			id="variable_name"
			bind:value={$variableName}
		/>
	</div>
</div>

<style>
</style>
