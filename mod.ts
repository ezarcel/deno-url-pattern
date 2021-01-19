import { globToRegExp } from 'https://deno.land/std@0.83.0/path/glob.ts'

export interface URLPatternParameter {
	index: number
	name: string
	position: number
}
export type URLPatternParameters = {
	[ key: string ]: string
}

export class URLPattern {
	protected parameters: URLPatternParameter[]
	protected regExp: RegExp

	constructor(urlPattern: string) {
		const { parameters, regExp } = URLPattern.parse(urlPattern)
		this.parameters = parameters
		this.regExp = regExp
	}

	match(url: string): URLPatternParameters | null {
		if (url.match(this.regExp) === null) return null
		let parameters: URLPatternParameters = {}
		for (const parameter of this.parameters) {
			const parameterValue = url.split('/')[ parameter.index ].slice(parameter.position)
			if (parameterValue === '') return null
			parameters[ parameter.name ] = parameterValue
		}
		return parameters
	}

	static parse(urlPattern: string): {
		parameters: URLPatternParameter[],
		regExp: RegExp
	} {
		if (!urlPattern.startsWith('/')) urlPattern = '/' + urlPattern
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
		return {
			parameters,
			regExp: globToRegExp(urlPatternWithoutParameters, { extended: true, os: 'linux' })
		}
	}

	static join(...data: (string | URLPatternParameters)[]) {
		let inputParameters: URLPatternParameters = {}
		Object.assign(inputParameters, ...data.filter(e => typeof e !== 'string') as URLPatternParameters[])

		let fullURL = (data.filter(e => typeof e === 'string') as string[]).join('')
		while (fullURL.includes('//')) fullURL = fullURL.split('//').join('/')

		const { parameters } = this.parse(fullURL)
		let newURL = fullURL.slice().split('/')
		parameters.forEach(p => {
			newURL[ p.index ] = newURL[ p.index ].replace(`:${p.name}`, inputParameters[ p.name ])
		})

		return newURL.join('/')
	}
}