import { Command, Plugin } from '@ckeditor/ckeditor5-core';
import { ButtonView } from '@ckeditor/ckeditor5-ui';
import { exitFullScreenIcon, fullScreenIcon } from '../icons';

class FullscreenCommand extends Command {
    execute() {
        const className = 'fullscreen-mode';
        const isFullscreen = this.editor.ui.element?.classList.contains(className);
        const toolbarHeight = this.editor.ui.element?.querySelector('.ck.ck-editor__top')?.clientHeight;
        const mainEle = this.editor.ui.element?.querySelector('.ck.ck-editor__main') as HTMLDivElement;
        if (isFullscreen) {
            this.editor.ui.element?.classList.remove(className);
        } else {
            this.editor.ui.element?.classList.add(className);
            mainEle.style.height = `calc(100% - ${toolbarHeight}px)`;
            console.log(mainEle);
        }
        this.value = !isFullscreen;
    }
}


export default class FullScreenPlugin extends Plugin {
    init() {
        const editor = this.editor;

        editor.commands.add('toggleFullScreen', new FullscreenCommand(editor));

        editor.ui.componentFactory.add('fullScreen', locale => {
            const button = new ButtonView(locale);
            const command = editor.commands.get('toggleFullScreen')!;
            console.log(command);
            const t = editor.t;
            const setView = (isFullscreen: boolean) => button.set({
                label: t(isFullscreen ? 'Normal Mode' : 'Fullscreen Mode'),
                icon: isFullscreen ? exitFullScreenIcon : fullScreenIcon,
                tooltip: true,
                isToggleable: true
            });
            setView(!!command?.value);

            button.on('execute', () => {
                editor.execute('toggleFullScreen');
                setView(!!command?.value);
            });

            button.bind('isOn', 'isEnabled').to(command as any, 'value', 'isEnabled');

            return button;
        });
    }
}