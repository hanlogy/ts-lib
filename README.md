# @hanlogy/ts-lib

Small TypeScript helper utilities used in Hanlogy projects.

## Install

This package is published to GitHub Packages.

```bash
npm i @hanlogy/ts-lib
```

## Usage

```ts
import { isPlainObject, kebabToCamel } from '@hanlogy/ts-lib';

isPlainObject({ a: 1 }); // true
kebabToCamel('hello-world'); // "helloWorld"
```

## Environments

Designed to work in:

- Node.js
- React
- React Native

No DOM-specific APIs.

## Development

```bash
npm ci
npm run lint
npm test
npm run build
```
