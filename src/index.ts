import * as PACKAGE from '../package.json'
import { renderAnimationAsFSK } from './animationRenderer'
import { consoleGroupCollapsed } from './util/console'
import * as events from './util/events'
import './util/moddingTools'

//-------------------------------
// Import your source files here
//-------------------------------
import './dialogs/animationPropertiesDialog'
import './mods/animationMod'
import './mods/exportAction'

// Expose this plugin's events globally and to other plugins
// @ts-ignore
globalThis.BBAnimToFSK = {
	events: events,
	renderAnimationAsFSK,
}

BBPlugin.register(PACKAGE.name, {
	title: PACKAGE.title,
	author: PACKAGE.author.name,
	description: PACKAGE.description,
	icon: 'video_file',
	variant: 'desktop',
	version: PACKAGE.version,
	min_version: PACKAGE.min_blockbench_version,
	tags: PACKAGE.tags as [string, string, string],
	onload: consoleGroupCollapsed(`${PACKAGE.name}:onload`, () => {
		events.LOAD.dispatch()
	}),
	onunload: consoleGroupCollapsed(`${PACKAGE.name}:onunload`, () => {
		events.UNLOAD.dispatch()
	}),
	oninstall: consoleGroupCollapsed(`${PACKAGE.name}:oninstall`, () => {
		events.INSTALL.dispatch()
	}),
	onuninstall: consoleGroupCollapsed(`${PACKAGE.name}:onuninstall`, () => {
		events.UNINSTALL.dispatch()
	}),
})
