enum Numbers {
	thousand = 10 ** 3,
	million = 10 ** 6,
	billion = 10 ** 9,
	trillion = 10 ** 12,
	quadrillion = 10 ** 15,
	quintillion = 10 ** 18,
}

export const catchDivideByZero = (num: number, den: number) => den === 0 ? 0 : num / den

export const formatNumber = (num: number) => {
	num = Math.abs(num)
	if (num < Numbers.thousand) return num.toFixed(0).replace('.0', '')
	else if (num < Numbers.million) return (num / Numbers.thousand).toFixed(1).replace('.0', '') + 'k'
	else if (num < Numbers.billion) return (num / Numbers.million).toFixed(1).replace('.0', '') + 'm'
	else if (num < Numbers.trillion) return (num / Numbers.billion).toFixed(1).replace('.0', '') + 'b'
	else if (num < Numbers.quadrillion) return (num / Numbers.trillion).toFixed(1).replace('.0', '') + 'tr'
	else return num.toFixed(0)
}

export const pluralize = (count: number, singular: string, plural: string) => count === 1 ? singular : plural

export const getRandomValue = () => Date.now() + Math.random().toString(36).substr(2)

export const capitalize = (text: string) => text[0].toUpperCase() + text.slice(1).toLowerCase()

export const extractTextFromHTML = (html: string) => html?.trim().replace(/<[^>]+>/g, '') ?? ''

export const trimToLength = (body: string, length: number) => {
	if (body.length < length) return body
	const index = body.indexOf(' ', length)
	return `${body.slice(0, index)}...`
}
