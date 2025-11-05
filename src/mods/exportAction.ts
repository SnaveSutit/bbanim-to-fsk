import PACKAGE from '../../package.json'
import { renderAnimationAsFSK } from '../animationRenderer'
import { createAction } from '../util/moddingTools'

function convertPlayerCubes(input: string) {
	const lines: any = input
		.split(/\r?\n|;/)
		.map(l => l.trim())
		.filter(Boolean)
	const axes: any = { X: [1, 0, 0], Y: [0, 1, 0], Z: [0, 0, 1] }
	return lines
		.map((line: any) => {
			const match = line.match(
				/\{(Player_(rot|pos)([XYZ]))\}\s*\+=\s*([+-]?\d+(?:\.\d+)?)'?(\{\d+\})?/
			)
			if (!match) return line
			const [, , type, axis, value, index = ''] = match
			let num = parseFloat(value)
			if (axis === 'X' || axis === 'Y') {
				num = -num
			}
			if (type === 'rot') {
				return `out "rotate" (${num}${index}, ${axes[axis].join(', ')});${line}`
			}
			if (type === 'pos') {
				const conv = num / 16
				return `out "translate" (${axes[axis]
					.map((v: any) => (v ? `${conv}${index}` : 0))
					.join(', ')});${line}`
			}
			return line
		})
		.join('\n')
}

const condition = () => {
	return !!Project?.format.animation_mode
}

const EXPORT_ACTION = createAction(`${PACKAGE.name}:export`, {
	name: 'Export FSK',
	icon: 'video_file',
	condition,
	description: 'Export the current animation to FSK',
	click: () => {
		if (!Project?.lastExportPath) {
			EXPORT_AS_ACTION.click()
			return
		}
		const content = convertPlayerCubes(renderAnimationAsFSK(Animator.selected!))
		Blockbench.writeFile(Project?.lastExportPath || '', {
			content,
			savetype: 'text',
		})
	},
})
MenuBar.addAction(EXPORT_ACTION, 'file.export.0')

const EXPORT_AS_ACTION = createAction(`${PACKAGE.name}:exportAsAction`, {
	name: 'Export FSK As',
	icon: 'video_file',
	condition,
	description: 'Export all animations to FSK',
	click: () => {
		const file: string[] = []
		for (const animation of Project!.animations) {
			if (!animation.export) continue
			const content = convertPlayerCubes(renderAnimationAsFSK(animation))
			file.push(content)
		}
		Blockbench.export(
			{
				type: 'fsk',
				extensions: ['fsk'],
				name: Project!.name,
				startpath: Project?.lastExportPath,
				content: file.join('\n\n'),
				savetype: 'text',
			},
			(path: string) => {
				Project!.lastExportPath = path
				Blockbench.showQuickMessage('Exported successfully', 2000)
			}
		)
	},
})
MenuBar.addAction(EXPORT_AS_ACTION, 'file.export.1')
