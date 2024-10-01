import PACKAGE from '../../package.json'
import { renderAnimationAsFSK } from '../animationRenderer'
import { createAction } from '../util/moddingTools'

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
		const content = renderAnimationAsFSK(Animator.selected!)
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
			const content = renderAnimationAsFSK(animation)
			file.push(content)
		}
		// @ts-ignore
		electron.dialog
			.showSaveDialog({
				title: 'Export to FSK',
				defaultPath: Project?.lastExportPath,
				properties: [],
			})
			.then((result: any) => {
				if (!result.canceled) {
					// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
					Blockbench.writeFile(result.filePath, {
						content: file.join('\n\n'),
						savetype: 'text',
					})
					Project!.lastExportPath = result.filePath
				}
			})
	},
})
MenuBar.addAction(EXPORT_AS_ACTION, 'file.export.1')
