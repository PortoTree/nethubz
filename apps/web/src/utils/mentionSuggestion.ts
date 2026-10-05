import { ReactRenderer } from '@tiptap/react';
import tippy from 'tippy.js';
import { MentionList } from '../components/MentionList';
import { searchUsersForMention } from '@/app/actions/profile';

export const getMentionSuggestion = () => {
  return {
    items: async ({ query }: { query: string }) => {
      try {
        if (!query) {
          const users = await searchUsersForMention('');
          return users;
        }
        const users = await searchUsersForMention(query);
        return users;
      } catch (e) {
        return [];
      }
    },
    render: () => {
      let reactRenderer: ReactRenderer;
      let popup: any;

      return {
        onStart: (props: any) => {
          reactRenderer = new ReactRenderer(MentionList, {
            props,
            editor: props.editor,
          });

          if (!props.clientRect) {
            return;
          }

          popup = tippy('body', {
            getReferenceClientRect: props.clientRect,
            appendTo: () => document.body,
            content: reactRenderer.element,
            showOnCreate: true,
            interactive: true,
            trigger: 'manual',
            placement: 'top-start',
            zIndex: 999999, // Ensure it's above the modal
          });
        },
        onUpdate: (props: any) => {
          reactRenderer.updateProps(props);

          if (!props.clientRect) {
            return;
          }

          popup[0].setProps({
            getReferenceClientRect: props.clientRect,
          });
        },
        onKeyDown: (props: any) => {
          if (props.event.key === 'Escape') {
            popup[0].hide();
            return true;
          }

          return (reactRenderer.ref as any)?.onKeyDown(props);
        },
        onExit: () => {
          popup[0].destroy();
          reactRenderer.destroy();
        },
      };
    },
  };
};
