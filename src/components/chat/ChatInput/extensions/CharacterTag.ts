import { Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import CharacterTagChip from '../CharacterTagChip';

export const CharacterTag = Node.create({
  name: 'characterTag',

  group: 'inline',
  inline: true,
  atom: true,

  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: (el) => el.getAttribute('data-id'),
        renderHTML: (attrs) => (attrs.id ? { 'data-id': attrs.id } : {}),
      },
      name: {
        default: '',
        parseHTML: (el) => el.getAttribute('data-name'),
        renderHTML: (attrs) => (attrs.name ? { 'data-name': attrs.name } : {}),
      },
      image: {
        default: null,
        parseHTML: (el) => el.getAttribute('data-image'),
        renderHTML: (attrs) => (attrs.image ? { 'data-image': attrs.image } : {}),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'span[data-type="character-tag"]' }];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'span',
      { ...HTMLAttributes, 'data-type': 'character-tag', 'data-id': node.attrs.id, 'data-name': node.attrs.name, 'data-image': node.attrs.image },
      node.attrs.name,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(CharacterTagChip);
  },

  renderText({ node }) {
    return ` [Character: ${node.attrs.name ?? ''}]`;
  },
});
