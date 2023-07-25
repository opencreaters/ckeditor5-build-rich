// webpack.config.js

const path = require('path');
const { CKEditorTranslationsPlugin } = require('@ckeditor/ckeditor5-dev-translations');
const { loaders } = require('@ckeditor/ckeditor5-dev-utils');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
	devtool: 'source-map',
	performance: { hints: false },

	entry: path.resolve(__dirname, 'src', 'ckeditor.ts'),

	output: {
		// The name under which the editor will be exported.
		library: 'ClassicEditor',

		path: path.resolve(__dirname, 'build'),
		filename: 'ckeditor.js',
		libraryTarget: 'umd',
		libraryExport: 'default'
	},
	optimization: {
		minimizer: [
			new TerserPlugin({
				terserOptions: {
					sourceMap: true,
					output: {
						// Preserve CKEditor 5 license comments.
						comments: /^!/
					}
				},
				extractComments: false
			})
		]
	},
	plugins: [
		// More plugins.
		// ...

		new CKEditorTranslationsPlugin({
			// See https://ckeditor.com/docs/ckeditor5/latest/features/ui-language.html
			language: 'en',
			additionalLanguages: 'all'
		})
	],
	module: {
		rules: [
			loaders.getTypeScriptLoader(),
			loaders.getIconsLoader({ matchExtensionOnly: true }),
			loaders.getStylesLoader({
				themePath: require.resolve('@ckeditor/ckeditor5-theme-lark'),
				minify: true
			})
		]
	},
	resolve: {
		extensions: ['.ts', '.js', '.json']
	}
};
