// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import vercel from '@astrojs/vercel';

import zeenGrammarFile from './src/assets/zeen.tmLanguage.json';

const zeenLanguage = {
	...zeenGrammarFile,
	aliases: ['zeen', 'zn']
}

// https://astro.build/config
export default defineConfig({
	site: 'https://zeen-lang.tech',
	adapter: vercel({
		webAnalytics: {
			enabled: true,
		},
	}),
	integrations: [
		starlight({
			// branding
			title: 'Zeen',
			description: 'Zeen is a modern systems programming languaged focused on performance, safety and simplicity',
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/zeen-lang/zeen' }],
			logo: {
				light: './public/Zeen.png',
				dark: './public/Zeen.png',
			},

			// code highlight
			expressiveCode: {
				themes: ['kanagawa-wave'],
				shiki: {
					langs: [zeenLanguage]
				},
			},

			// custom styles
			customCss: [
				'./src/styles/custom.css',
				'./src/styles/landing.css',
			],
			components: {
				ThemeSelect: './src/components/ThemeSelect.astro',
				Head: './src/components/Head.astro',
			},

			// sidebar
			sidebar: [
				// Getting Started
				{
					label: 'Getting Started',
					items: [
						{
							label: 'Introduction',
							slug: 'getting-started/introduction',
						},
						{
							label: 'Installation',
							slug: 'getting-started/installation',
						},
						{
							label: 'Examples',
							slug: 'getting-started/examples',
						},
					],
				},

				// Toolchain
				{
					label: 'Toolchain',
					items: [
						{
							label: 'Compiler',
							slug: 'toolchain/compiler',
						},
						{
							label: 'Editors Plugins',
							slug: 'toolchain/editors-plugins',
						},
						{
							label: 'Package Manager',
							slug: 'toolchain/package-manager',
						},
					],
				},

				// Language Basics
				{
					label: 'Language Basics',
					items: [
						{
							label: 'Zeen Modules',
							slug: 'language-basics/zeen-modules',
						},
						{
							label: 'Basic Types',
							slug: 'language-basics/basic-types',
						},
						{
							label: 'Constant Literals',
							slug: 'language-basics/constant-literals',
						},
						{
							label: 'Variables and Bindings',
							slug: 'language-basics/variables-and-bindings',
						},
						{
							label: 'Operators',
							slug: 'language-basics/operators',
						},
						{
							label: 'Constructs',
							slug: 'language-basics/constructs',
						},
						{
							label: 'Arrays, Slices and Ranges',
							slug: 'language-basics/arrays-slices-ranges',
						},
						{
							label: 'Pointers',
							slug: 'language-basics/pointers',
						},
					],
				},

				// Functions & Closures
				{
					label: 'Functions & Closures',
					items: [
						{
							label: 'Functions',
							slug: 'functions-closures/functions',
						},
						{
							label: 'Closures',
							slug: 'functions-closures/closures',
						},
						{
							label: 'Structures and Methods',
							slug: 'functions-closures/structures-and-methods',
						},
						{
							label: 'Enums',
							slug: 'functions-closures/enums',
						},
						{
							label: 'Switch',
							slug: 'functions-closures/switch',
						},
						{
							label: 'Type Aliases',
							slug: 'functions-closures/type-aliases',
						},
						{
							label: 'Imports and Visibility',
							slug: 'functions-closures/imports-and-visibility',
						},
						{
							label: 'Builtin Macros',
							slug: 'functions-closures/macros-builtin',
						},
						{
							label: 'Extern',
							slug: 'functions-closures/extern',
						},
					],
				},

				// Ownership & Types
				{
					label: 'Ownership & Types',
					items: [
						{
							label: 'Stack and Heap',
							slug: 'ownership-types/stack-and-heap',
						},
						{
							label: 'Move Semantics',
							slug: 'ownership-types/move-semantics',
						},
						{
							label: 'Generic Types',
							slug: 'ownership-types/generic-types',
						},
						{
							label: 'User Interfaces',
							slug: 'ownership-types/user-interfaces',
						},
						{
							label: 'Compiler Interfaces',
							slug: 'ownership-types/compiler-interfaces',
						},
						{
							label: 'Printing and Formatting',
							slug: 'ownership-types/printing-formatting',
						},
						{
							label: 'Iterators',
							slug: 'ownership-types/iterators',
						},
						{
							label: 'Compile Time Engine',
							slug: 'ownership-types/compile-time-engine',
						},
					],
				},

				// Library
				{
					label: 'Library',
					collapsed: true,
					items: [
						{
							label: 'core',
							collapsed: true,
							items: [
								{
									label: 'io',
									slug: 'library/core/io',
								},
								{
									label: 'iter',
									slug: 'library/core/iter',
								},
								{
									label: 'ops',
									slug: 'library/core/ops',
								},
								{
									label: 'option',
									slug: 'library/core/option',
								},
								{
									label: 'reflection',
									slug: 'library/core/reflection',
								},
								{
									label: 'result',
									slug: 'library/core/result',
								},
								{
									label: 'slice',
									slug: 'library/core/slice',
								},
							],
						},
						{
							label: 'std',
							collapsed: true,
							items: [
								{
									label: 'collections/',
									collapsed: true,
									items: [
										{
											label: 'list',
											slug: 'library/std/collections/list',
										},
										{
											label: 'map',
											slug: 'library/std/collections/map',
										},
										{
											label: 'set',
											slug: 'library/std/collections/set',
										},
									],
								},
								{
									label: 'crypto/',
									collapsed: true,
									items: [
										{
											label: 'base64',
											slug: 'library/std/crypto/base64',
										},
										{
											label: 'hash',
											slug: 'library/std/crypto/hash',
										},
										{
											label: 'rand',
											slug: 'library/std/crypto/rand',
										},
										{
											label: 'sha256',
											slug: 'library/std/crypto/sha256',
										},
									],
								},
								{
									label: 'c/',
									collapsed: true,
									items: [
										{
											label: 'Overview',
											slug: 'library/std/c/overview',
										},
										{
											label: 'Libc',
											slug: 'library/std/c/libc',
										},
										{
											label: 'Posix',
											slug: 'library/std/c/posix',
										},
										{
											label: 'Windows',
											slug: 'library/std/c/windows',
										},
									],
								},
								{
									label: 'alloc',
									slug: 'library/std/alloc',
								},
								{
									label: 'env',
									slug: 'library/std/env',
								},
								{
									label: 'fn',
									slug: 'library/std/fn',
								},
								{
									label: 'fs',
									slug: 'library/std/fs',
								},
								{
									label: 'http',
									slug: 'library/std/http',
								},
								{
									label: 'io',
									slug: 'library/std/io',
								},
								{
									label: 'json',
									slug: 'library/std/json',
								},
								{
									label: 'log',
									slug: 'library/std/log',
								},
								{
									label: 'math',
									slug: 'library/std/math',
								},
								{
									label: 'net',
									slug: 'library/std/net',
								},
								{
									label: 'path',
									slug: 'library/std/path',
								},
								{
									label: 'process',
									slug: 'library/std/process',
								},
								{
									label: 'ptr',
									slug: 'library/std/ptr',
								},
								{
									label: 'string',
									slug: 'library/std/string',
								},
								{
									label: 'sync',
									slug: 'library/std/sync',
								},
								{
									label: 'testing',
									slug: 'library/std/testing',
								},
								{
									label: 'thread',
									slug: 'library/std/thread',
								},
								{
									label: 'time',
									slug: 'library/std/time',
								},
							],
						},
					],
				},

				// Build & Targets
				{
					label: 'Build & Targets',
					items: [
						{
							label: 'Linking',
							slug: 'toolchain/linking',
						},
						{
							label: 'Conditional Compilation',
							slug: 'toolchain/conditional-compilation',
						},
					],
				},

				// Changelog
				{
					label: 'Changelog',
					link: '/changelog/',
				}
			],
		}),
	],
});
