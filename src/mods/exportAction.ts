import PACKAGE from '../../package.json'
import { renderAnimationAsFSK } from '../animationRenderer'
import { createAction } from '../util/moddingTools'

function convertPlayerCubes(input: any) {
	const lines: any = input.split(/\r?\n/) // keep original line structure

	const axes: any = { X: [1, 0, 0], Y: [0, 1, 0], Z: [0, 0, 1] }
	let output = []
	let prevGroup = null

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i]
		const trimmed = line.trim()

		if (!trimmed) {
			prevGroup = null
			output.push('') // preserve blank line
			continue
		}

		// Detect any line with curve animate2
		const isIndexLine = /=\s*curve animate2\s*\(/i.test(trimmed)
		if (isIndexLine) {
			output.push(line)

			// Look ahead to see if the next line is also an index
			const nextLine = lines[i + 1]?.trim()
			const nextIsIndex = nextLine && /=\s*curve animate2\s*\(/i.test(nextLine)

			if (!nextIsIndex) {
				output.push('') // add blank line after last index
			}
			prevGroup = null
			continue
		}

		// Match Player_ or t_ rotations/positions
		const match = trimmed.match(
			/\{(Player|t)_(rot|pos)([XYZ])\}\s*\+=\s*([+-]?\d+(?:\.\d+)?)'?\s*(\{[^}]+\})?/i
		)
		if (!match) {
			output.push(line)
			prevGroup = null
			continue
		}

		const [, group, type, axis, value, index = ''] = match
		let num = parseFloat(value)

		// Flip X and Y
		if (axis === 'X' || axis === 'Y') num = -num

		let converted
		if (type === 'rot') {
			converted = `out "rotate" (${num}${index}, ${axes[axis].join(', ')});${line}`
		} else if (type === 'pos') {
			const conv = num / 16
			converted = `out "translate" (${axes[axis]
				.map((v: any) => (v ? `${conv}${index}` : 0))
				.join(', ')});${line}`
		} else {
			converted = line
		}

		// Insert blank line if group changes
		if (prevGroup && prevGroup !== group) output.push('')
		output.push(converted)
		prevGroup = group
	}

	return output.join('\n')
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
