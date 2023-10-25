import PACKAGE from '../../package.json'
import { createBlockbenchMod } from '../util/moddingTools'

createBlockbenchMod(
	`${PACKAGE.name}:animation`,
	{
		extend: Blockbench.Animation.prototype.extend,
		propertyExport: undefined as Property<'boolean'> | undefined,
		propertyEnableCurve: undefined as Property<'boolean'> | undefined,
		propertyVariableName: undefined as Property<'string'> | undefined,
	},
	context => {
		context.propertyExport = new Property(Blockbench.Animation, 'boolean', 'export', {
			default: true,
			condition: () => true,
		})

		context.propertyEnableCurve = new Property(
			Blockbench.Animation,
			'boolean',
			'enable_curve',
			{
				default: true,
				condition: () => true,
			}
		)

		context.propertyVariableName = new Property(
			Blockbench.Animation,
			'string',
			'variable_name',
			{
				default: 'data',
				condition: () => true,
			}
		)

		Blockbench.Animation.prototype.extend = function (
			this: _Animation,
			data: AnimationOptions
		) {
			context.extend.call(this, data)
			this.snapping = 100
			return this
		}

		return context
	},
	context => {
		context.propertyExport?.delete()
		context.propertyVariableName?.delete()
		Blockbench.Animation.prototype.extend = context.extend
	}
)
