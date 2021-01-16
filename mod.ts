import { globToRegExp } from 'https://deno.land/std@0.83.0/path/glob.ts'

export interface URLPatternParameter {
	index: number
	name: string
	position: number
}
export type URLPatternParseResult = {
	[ key: string ]: string
}

export class URLPattern {
	protected parameters: URLPatternParameter[]
	protected regExp: RegExp

	constructor(urlPattern: string) {
		let parameters: URLPatternParameter[] = []
		const urlPatternWithoutParameters = urlPattern.split('/').map((part, index) => {
			if (part.includes(':')) {
				const position = part.indexOf(':')
				parameters.push({
					index,
					name: part.slice(position + 1),
					position
				})
				part = `${part.slice(0, position)}*`
			}
			return part
		}).join('/')
		this.parameters = parameters
		this.regExp = globToRegExp(urlPatternWithoutParameters)
	}

	parse(url: string): Promise<URLPatternParseResult | null> {
		return new Promise(resolve => {
			if (!url.match(this.regExp)) resolve(null)
			let parameters: URLPatternParseResult = {}
			const splittedURL = url.split('/')
			this.parameters.forEach(parameter => {
				const portion = splittedURL[ parameter.index ]
				const parameterValue = portion.slice(parameter.position)
				if (parameterValue === '') resolve(null)
				parameters[ parameter.name ] = parameterValue
			})
			resolve(parameters)
		})
	}
}