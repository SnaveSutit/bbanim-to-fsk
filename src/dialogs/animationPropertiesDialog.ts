import PACKAGE from '../../package.json'
import AnimationPropertiesSvelteComponent from '../components/animationPropertiesDialog.svelte'
import { createBlockbenchMod } from '../util/moddingTools'
import { SvelteDialog } from '../util/svelteDialog'
import { writable } from 'svelte/store'

function openAnimationPropertiesDialog(animation: _Animation) {
	const name = writable(animation.name)
	const doExport = writable(animation.export)
	const enableCurve = writable(animation.enable_curve)
	const snapping = writable(animation.snapping)
	const variableName = writable(animation.variable_name)

	name.subscribe(value => {
		animation.name = value
	})
	doExport.subscribe(value => {
		animation.export = value
	})
	enableCurve.subscribe(value => {
		animation.enable_curve = value
	})
	snapping.subscribe(value => {
		animation.snapping = value
	})
	variableName.subscribe(value => {
		animation.variable_name = value
	})

	new SvelteDialog({
		id: `${PACKAGE.name}:animation_properties`,
		title: 'Animation Properties',
		width: 400,
		svelteComponent: AnimationPropertiesSvelteComponent,
		svelteComponentProps: { name, doExport, enableCurve, snapping, variableName },
	}).show()
}

createBlockbenchMod(
	`${PACKAGE.name}:animation_properties_dialog`,
	{
		original: Blockbench.Animation.prototype.propertiesDialog,
	},
	context => {
		Blockbench.Animation.prototype.propertiesDialog = function (this: _Animation) {
			openAnimationPropertiesDialog(this)
		}
		return context
	},
	context => {
		Blockbench.Animation.prototype.propertiesDialog = context.original
	}
)
