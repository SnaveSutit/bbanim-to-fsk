import PACKAGE from '../../package.json'
import { renderAnimationAsFSK } from '../animationRenderer'
import { createAction } from '../util/moddingTools'

let lastExportPath = 'animation.fsk'

const EXPORT_ACTION = createAction(`${PACKAGE.name}:exportAction`, {
	name: 'Export to FSK',
	icon: 'create_session',
	condition: () => true,
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
				defaultPath: lastExportPath,
				promptToCreate: true,
				properties: ['openFile'],
			})
			.then((result: any) => {
				if (!result.canceled) {
					// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
					Blockbench.writeFile(result.filePath, {
						content: file.join('\n\n'),
						savetype: 'text',
					})
					lastExportPath = result.filePath
				}
			})
	},
})

MenuBar.addAction(EXPORT_ACTION, 'tools')
