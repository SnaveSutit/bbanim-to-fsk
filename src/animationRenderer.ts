function roundTo(n: number, d: number) {
	return Math.round(n * 10 ** d) / 10 ** d
}

const PRECISION = 10

function scaleTime(time: number, length: number) {
	return length == 0 ? 0 : time / length
}

export function renderAnimationAsFSK(animation: _Animation) {
	const animVariable = `{${animation.name}_time}`
	const curve = animation.enable_curve ? 'curve ' : ''

	const file: string[] = []

	file.push(`; Animation: ${animation.name}`)
	file.push(`${animVariable} = {${animation.variable_name}}`)

	for (const bone of Blockbench.Group.all) {
		file.push(`\n; Bone: ${bone.name}`)
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

				const peak = Math.abs(prevKeyframeScaledTime - thisKeyframeScaledTime)
				const valley = Math.abs(nextKeyframeScaledTime - thisKeyframeScaledTime)
				const startTime = prevKeyframeScaledTime
				const duration = nextKeyframeScaledTime - prevKeyframeScaledTime

				let channel = keyframe.channel
				if (channel == 'position') channel = 'pos'
				else if (channel == 'rotation') channel = 'rot'
				else if (channel == 'scale') continue

				const keyframeFunction = `${curve}animate2(${animVariable}, ${duration}, ${startTime}, ${peak}, ${valley})`
				const keyframeVariable = `{${animation.name}_${
					bone.name
				}_keyframe_${channel}_${keyframes.indexOf(keyframe)}}`

				file.push(`${keyframeVariable} = ${keyframeFunction}`)

				const boneVariable = `{${bone.name}_${channel}%AXIS%}`
				const degreeFlag = channel == 'rot' ? "'" : ''

				file.push(
					`${boneVariable.replace('%AXIS%', 'X')} @ ${keyframeVariable} -> ${roundTo(
						Number(keyframe.data_points[0].x),
						PRECISION
					)}${degreeFlag} + ${boneVariable.replace('%AXIS%', 'X')}`
				)
				file.push(
					`${boneVariable.replace('%AXIS%', 'Y')} @ ${keyframeVariable} -> ${roundTo(
						channel == 'pos'
							? -Number(keyframe.data_points[0].y)
							: Number(keyframe.data_points[0].y),
						PRECISION
					)}${degreeFlag} + ${boneVariable.replace('%AXIS%', 'Y')}`
				)
				file.push(
					`${boneVariable.replace('%AXIS%', 'Z')} @ ${keyframeVariable} -> ${roundTo(
						Number(keyframe.data_points[0].z),
						PRECISION
					)}${degreeFlag} + ${boneVariable.replace('%AXIS%', 'Z')}`
				)

				prevKeyframe = keyframe
			}
		}

		generateKeyframes(rotationKeyframes)
		generateKeyframes(positionKeyframes)
	}

	return file.join('\n')
}
