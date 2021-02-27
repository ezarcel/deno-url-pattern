# URLPattern for Deno
An easy and simple approach for URL patterns in Deno. Inspired by [snd's url-pattern](https://github.com/snd/url-pattern).

## Usage
```javascript
import { URLPattern } from 'https://deno.land/x/url_pattern/mod.ts'

const pattern = new URLPattern('/book/:id')
pattern.match('/book/')              // >>> null
pattern.match('/book/123')           // >>> { id: '123' }

const pattern2 = new URLPattern('*') // This will accept everything
pattern.match('')                    // >>> {}
pattern.match('/')                   // >>> {}
```