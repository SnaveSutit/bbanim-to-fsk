function roundTo(n: number, d: number) {
	return Math.round(n * 10 ** d) / 10 ** d
}

const PRECISION = 10

function scaleTime(time: number, length: number) {
	return length == 0 ? 0 : time / length
}

export function renderAnimationAsFSK(animation: _Animation) {
	const variables: Record<string, string> = {}

	const animVariable = `{${animation.name}_time}`
	const curve = animation.enable_curve ? 'curve ' : ''

	const fileHeader: string[] = [`${animVariable}={${animation.variable_name}}`]
	const file: string[] = []

	for (const bone of Blockbench.Group.all) {
		const boneLines: string[] = [''] // Empty line for readability
		let shouldExport = false

		const animator = animation.animators[bone.uuid]
		if (!animator) continue
		const sortedKeyframes = animator.keyframes.sort((a, b) => Number(a.time) - Number(b.time))
		const positionKeyframes = sortedKeyframes.filter(k => k.channel == 'position')
		const rotationKeyframes = sortedKeyframes.filter(k => k.channel == 'rotation')

		const generateKeyframes = (keyframes: _Keyframe[]) => {
			let prevKeyframe: _Keyframe | undefined
			let nextKeyframe: _Keyframe | undefined
			let prevKeyframeScaledTime: number, nextKeyframeScaledTime: number
			for (const keyframe of keyframes) {
				if (keyframe.has_expressions) {
					Blockbench.showMessageBox({
						title: 'Math-based Keyframe Expressions are Not Supported',
						message: `Math-based keyframe expressions are not supported in the FSK export. Please remove expressions from keyframe at ${keyframe.time}s in '${animation.name}' for '${bone.name}'.`,
						buttons: ['OK'],
					})
					throw new Error(
						'Math-based keyframe expressions are not supported in the FSK export.'
					)
				}
				let channel = keyframe.channel
				if (channel == 'position') channel = 'pos'
				else if (channel == 'rotation') channel = 'rot'
				else if (channel == 'scale') continue

				const xValue = roundTo(Number(keyframe.data_points[0].x), PRECISION)
				const yValue = roundTo(
					channel == 'pos'
						? -Number(keyframe.data_points[0].y)
						: Number(keyframe.data_points[0].y),
					PRECISION
				)
				const zValue = roundTo(Number(keyframe.data_points[0].z), PRECISION)
				if (xValue == 0 && yValue == 0 && zValue == 0) continue
				shouldExport = true

				const thisKeyframeScaledTime = scaleTime(Number(keyframe.time), animation.length)
				prevKeyframe = keyframes[keyframes.indexOf(keyframe) - 1]
				if (prevKeyframe) {
					prevKeyframeScaledTime = scaleTime(Number(prevKeyframe.time), animation.length)
				} else {
					prevKeyframeScaledTime = 0
				}

				nextKeyframe = keyframes[keyframes.indexOf(keyframe) + 1]
				if (nextKeyframe) {
					nextKeyframeScaledTime = scaleTime(Number(nextKeyframe.time), animation.length)
				} else {
					nextKeyframeScaledTime = animation.length * 10
				}

				const peak = roundTo(
					Math.abs(prevKeyframeScaledTime - thisKeyframeScaledTime),
					PRECISION
				)
				const valley = roundTo(
					Math.abs(nextKeyframeScaledTime - thisKeyframeScaledTime),
					PRECISION
				)
				const startTime = prevKeyframeScaledTime
				const duration = roundTo(nextKeyframeScaledTime - prevKeyframeScaledTime, PRECISION)

				const keyframeFunction = `${curve}animate2(${animVariable},${duration},${startTime},${peak},${valley})`
				let keyframeVariable = `{${animation.name}_${Object.keys(variables).length}}`

				if (variables[keyframeFunction]) {
					keyframeVariable = variables[keyframeFunction]
				} else {
					variables[keyframeFunction] = keyframeVariable
					fileHeader.push(`${keyframeVariable}=${keyframeFunction}`)
				}

				const boneVariable = `{${bone.name}_${channel}%AXIS%}`
				const degreeFlag = channel == 'rot' ? "'" : ''

				if (xValue != 0) {
					const boneXVariable = boneVariable.replace('%AXIS%', 'X')
					boneLines.push(`${boneXVariable}+=${xValue}${degreeFlag}${keyframeVariable}`)
				}
				if (yValue != 0) {
					const boneYVariable = boneVariable.replace('%AXIS%', 'Y')
					boneLines.push(`${boneYVariable}+=${yValue}${degreeFlag}${keyframeVariable}`)
				}
				if (zValue != 0) {
					const boneZVariable = boneVariable.replace('%AXIS%', 'Z')
					boneLines.push(`${boneZVariable}+=${zValue}${degreeFlag}${keyframeVariable}`)
				}

				prevKeyframe = keyframe
			}
		}

		generateKeyframes(rotationKeyframes)
		generateKeyframes(positionKeyframes)

		if (shouldExport) file.push(...boneLines)
	}

	return [...fileHeader, ...file].join('\n')
}
