import { Editor } from "@ckeditor/ckeditor5-core";
import { WordCount } from "@ckeditor/ckeditor5-word-count";
import { Template, View } from '@ckeditor/ckeditor5-ui';
import { isNil } from "../util";

export default class WordCountPlugin extends WordCount {
    private outputView: View | undefined;

    constructor(editor: Editor) {
        super(editor)
    }

    init(): void {
        super.init();
        this.listenTo(this.editor, 'ready', () => {
            if (this.editor.plugins.get('WordCount')) {
                this.editor.ui.element?.querySelector('.ck.ck-editor__main')?.appendChild(this.wordCountContainer);
            }
        })
    }

    public get wordCountContainer(): HTMLElement {
        this
        const editor = this.editor;
        const t = editor.t;
        const displayWords = editor.config.get('wordCount.displayWords');
        const displayCharacters = editor.config.get('wordCount.displayCharacters');
        const maxWords = editor.config.get('wordCount.maxWords') as number;
        const maxCharacters = editor.config.get('wordCount.maxCharacters') as number;
        const bind = Template.bind(this, this);
        const children = [];

        if (!this.outputView) {
            this.outputView = new View();
            if (displayWords || displayWords === undefined) {
                this.bind('_wordsLabel').to(this, 'words', words => t(`Words: %0${isNil(maxWords) ? '' : `/${maxWords}`}`, words));

                children.push({
                    tag: 'div',
                    children: [
                        {
                            text: [bind.to('_wordsLabel')]
                        }
                    ],
                    attributes: {
                        class: 'ck-word-count__words'
                    }
                });
            }

            if (displayCharacters || displayCharacters === undefined) {
                this.bind('_charactersLabel').to(this, 'characters', words => t(`Characters: %0${isNil(maxCharacters) ? '' : `/${maxCharacters}`}`, words));

                children.push({
                    tag: 'div',
                    children: [
                        {
                            text: [bind.to('_charactersLabel')]
                        }
                    ],
                    attributes: {
                        class: 'ck-word-count__characters'
                    }
                });
            }

            this.outputView.setTemplate({
                tag: 'div',
                attributes: {
                    class: [
                        'ck',
                        'ck-word-count'
                    ]
                },
                children
            });

            this.outputView.render();
        }

        return this.outputView.element!;
    }

    destroy(): void {
        this.stopListening();
    }
}