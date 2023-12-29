/**
 * @license Copyright (c) 2014-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */


import { ClassicEditor as ClassicEditorBase } from '@ckeditor/ckeditor5-editor-classic';
import { Alignment } from '@ckeditor/ckeditor5-alignment';
import { AutoImage } from '@ckeditor/ckeditor5-image';
import { AutoLink, Link, LinkImage } from '@ckeditor/ckeditor5-link';
import { BlockQuote } from '@ckeditor/ckeditor5-block-quote';
import { Bold, Code } from '@ckeditor/ckeditor5-basic-styles';
import { CodeBlock } from '@ckeditor/ckeditor5-code-block';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { GeneralHtmlSupport, HtmlComment, DataFilter, FullPage } from '@ckeditor/ckeditor5-html-support';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { Image, ImageCaption, ImageInsert, ImageResize, ImageStyle, ImageToolbar, ImageUpload } from '@ckeditor/ckeditor5-image';
import { Indent, IndentBlock } from '@ckeditor/ckeditor5-indent';
import { Italic, Underline } from '@ckeditor/ckeditor5-basic-styles';
import { List, ListProperties, TodoList } from '@ckeditor/ckeditor5-list';
import { MediaEmbed } from '@ckeditor/ckeditor5-media-embed';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { SourceEditing } from '@ckeditor/ckeditor5-source-editing';
import { SpecialCharacters, SpecialCharactersEssentials } from '@ckeditor/ckeditor5-special-characters';
import { Subscript, Superscript, Strikethrough } from '@ckeditor/ckeditor5-basic-styles';
import { Table, TableCaption, TableCellProperties, TableColumnResize, TableProperties, TableToolbar } from '@ckeditor/ckeditor5-table';
import { TextTransformation } from '@ckeditor/ckeditor5-typing';
import { WordCount } from '@ckeditor/ckeditor5-word-count';
import { Highlight } from '@ckeditor/ckeditor5-highlight';
import { Font } from '@ckeditor/ckeditor5-font';
import { Style } from '@ckeditor/ckeditor5-style';

import { Plugin, type Editor } from 'ckeditor5/src/core';
import { S3UploadAdapter } from "./s3-upload-adapter";
import { EMOJIS_ARRAY, LANGUAGES, REDUCED_MATERIAL_COLORS } from "./data";
import { Locale } from '@ckeditor/ckeditor5-utils';

import { createLabeledInputText, LabeledFieldView } from '@ckeditor/ckeditor5-ui';


import './styles.css'
import './content.css'

/**
 * Enrich the special characters plugin with emojis.
 */
class SpecialCharactersEmoji extends Plugin {
	afterInit(): void {
		this.editor.plugins.get('SpecialCharacters')?.addItems('Emoji', EMOJIS_ARRAY);
	}
}


class CodeBlockSearchPlugin extends Plugin {

	element: HTMLInputElement;

	init(): void {
		this.listenTo(this.editor, 'ready', () => {
			const locale = new Locale();
			const enabledInput = new LabeledFieldView(locale, createLabeledInputText);
			enabledInput.set({ isEnabled: true });
			enabledInput.class = 'ck-dropdown__search'
			enabledInput.render();
			this.element = enabledInput.fieldView.element!;
			this.element.placeholder = 'Search...'
			const dropdownPanel = this.editor.ui.element?.querySelector('.ck-code-block-dropdown .ck-dropdown__panel')!;
			dropdownPanel.append(enabledInput.element!);
			const languages: { text: string; className: string; }[] = [];
			this.element!.onkeyup = () => {
				if (!languages.length) {
					dropdownPanel?.querySelectorAll('.ck-list .ck-list__item').forEach(x => {
						const text = x.querySelector('button')!.innerText;
						const className = `language-${x.querySelector('.ck-button__label')?.id}`;
						x.classList.add(className);
						languages.push({ text, className });
					})
				}
				languages.forEach(language => {
					const list = dropdownPanel.querySelector<HTMLDataListElement>(`.${language.className}`)!
					if (!language.text.toLowerCase().includes(this.element.value.toLowerCase())) {
						list.style.display = 'none';
					} else {
						list.style.display = '';
					}
				})
			};
			if (this.editor.plugins.get('WordCount')) { this.editor.ui.element?.querySelector('.ck.ck-editor__main')?.appendChild(this.editor.plugins.get('WordCount').wordCountContainer); }
		})
	}

	destroy(): void {
		this.stopListening();
		this.element.onkeyup = null;
	}
}

function S3UploadAdapterPlugin(editor: Editor) {
	editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
		return new S3UploadAdapter(loader, editor);
	};
}




export default class ClassicEditor extends ClassicEditorBase { };


ClassicEditor.builtinPlugins = [
	Alignment,
	AutoImage,
	AutoLink,
	BlockQuote,
	Bold,
	Code,
	CodeBlock,
	CodeBlockSearchPlugin,
	DataFilter,
	Essentials,
	Font,
	GeneralHtmlSupport,
	Heading,
	HtmlComment,
	FullPage,
	Highlight,
	Image,
	ImageCaption,
	ImageInsert,
	ImageResize,
	ImageStyle,
	ImageToolbar,
	ImageUpload,
	S3UploadAdapterPlugin,
	Indent,
	IndentBlock,
	Italic,
	Link,
	LinkImage,
	List,
	ListProperties,
	MediaEmbed,
	SourceEditing,
	Paragraph,
	SpecialCharacters,
	SpecialCharactersEmoji,
	SpecialCharactersEssentials,
	Strikethrough,
	Style,
	Subscript,
	Superscript,
	Table,
	TableCaption,
	TableCellProperties,
	TableColumnResize,
	TableProperties,
	TableToolbar,
	TextTransformation,
	TodoList,
	Underline,
	WordCount,
];
ClassicEditor.defaultConfig = {
	toolbar: {
		shouldNotGroupWhenFull: false,
		items: [
			'heading',
			'|',
			'style',
			'|',
			'bold',
			'italic',
			'underline',
			{
				label: 'Basic styles',
				icon: 'text',
				items: [
					'fontSize',
					'fontFamily',
					'fontColor',
					'fontBackgroundColor',
					'highlight',
					'superscript',
					'subscript',
					'underline',
					'code',
					'|',
				]
			},
			'|',
			'strikethrough',
			'blockQuote',
			'|',
			// --- Text alignment ---------------------------------------------------------------------------
			'alignment',
			'|',
			// --- Lists and indentation --------------------------------------------------------------------
			'bulletedList',
			'numberedList',
			'todoList',
			'|',
			'insertTable',
			'codeBlock',
			'|',
			'outdent',
			'indent',
			'|',
			'link',
			'insertImage',
			'mediaEmbed',
			'|',
			'specialCharacters',
			'|',
			'sourceEditing'
		]
	},
	language: 'en',
	fontFamily: {
		supportAllValues: true
	},
	fontSize: {
		options: [10, 12, 14, 'default', 18, 20, 22],
		supportAllValues: true
	},
	fontColor: {
		columns: 12,
		colors: REDUCED_MATERIAL_COLORS
	},
	fontBackgroundColor: {
		columns: 12,
		colors: REDUCED_MATERIAL_COLORS
	},
	heading: {
		options: [
			{ model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
			{ model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
			{ model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
			{ model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
			{ model: 'heading4', view: 'h4', title: 'Heading 4', class: 'ck-heading_heading4' },
			{ model: 'heading5', view: 'h5', title: 'Heading 5', class: 'ck-heading_heading5' },
			{ model: 'heading6', view: 'h6', title: 'Heading 6', class: 'ck-heading_heading6' }
		]
	},
	htmlSupport: {
		allow: [
			{
				name: /.*/,
				attributes: true,
				classes: true,
				styles: true
			}
		],
		disallow: [
			{
				attributes: [
					{ key: /.*/, value: /data:(?!image\/(png|jpeg|gif|webp))/i }
				]
			}
		]
	},
	image: {
		resizeOptions: [
			{
				name: 'resizeImage:original',
				label: 'Default image width',
				value: null
			},
			{
				name: 'resizeImage:50',
				label: '50% page width',
				value: '50'
			},
			{
				name: 'resizeImage:75',
				label: '75% page width',
				value: '75'
			}
		],
		toolbar: [
			'imageTextAlternative', 'toggleImageCaption',
			'|',
			'imageStyle:inline', 'imageStyle:wrapText', 'imageStyle:breakText', 'imageStyle:side',
			'|',
			'resizeImage'
		],
		insert: {
			integrations: ['insertImageViaUrl']
		}
	},
	list: {
		properties: {
			styles: true,
			startIndex: true,
			reversed: true
		}
	},
	link: {
		decorators: {
			isExternal: {
				mode: 'automatic',
				callback: (url: string) => url?.startsWith('http://'),
				attributes: {
					target: '_blank',
					rel: 'noopener noreferrer'
				}
			},
			isDownloadable: {
				mode: 'manual',
				label: 'Downloadable',
				attributes: {
					download: 'file',
				}
			}
		},
		addTargetToExternalLinks: true,
		defaultProtocol: 'https://'
	},
	style: {
		definitions: [
			{
				name: 'Article category',
				element: 'h3',
				classes: ['category']
			},
			{
				name: 'Title',
				element: 'h2',
				classes: ['document-title']
			},
			{
				name: 'Subtitle',
				element: 'h3',
				classes: ['document-subtitle']
			},
			{
				name: 'Info box',
				element: 'p',
				classes: ['info-box']
			},
			{
				name: 'Side quote',
				element: 'blockquote',
				classes: ['side-quote']
			},
			{
				name: 'Marker',
				element: 'span',
				classes: ['marker']
			},
			{
				name: 'Spoiler',
				element: 'span',
				classes: ['spoiler']
			},
			{
				name: 'Code (dark)',
				element: 'pre',
				classes: ['fancy-code', 'fancy-code-dark']
			},
			{
				name: 'Code (bright)',
				element: 'pre',
				classes: ['fancy-code', 'fancy-code-bright']
			}
		]
	},
	table: {
		contentToolbar: [
			'tableColumn',
			'tableRow',
			'mergeTableCells',
			'tableProperties',
			'tableCellProperties',
			'toggleTableCaption'
		]
	},
	codeBlock: { languages: LANGUAGES },
	placeholder: 'Type or paste your content here!'
}
