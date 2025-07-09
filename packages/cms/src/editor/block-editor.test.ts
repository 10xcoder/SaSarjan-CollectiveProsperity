import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BlockEditor } from './block-editor';
import { createMockContentBlock } from '../test/mocks';

describe('BlockEditor', () => {
  let editor: BlockEditor;

  beforeEach(() => {
    editor = new BlockEditor();
  });

  describe('initialization', () => {
    it('should initialize with empty state', () => {
      const state = editor.getState();
      expect(state.blocks).toHaveLength(0);
      expect(state.selectedBlockId).toBeNull();
      expect(state.isDirty).toBe(false);
      expect(state.history).toHaveLength(1);
      expect(state.historyIndex).toBe(0);
    });

    it('should initialize with provided blocks', () => {
      const initialBlocks = [
        createMockContentBlock(),
        createMockContentBlock({ id: 'block-2' }),
      ];
      const editorWithBlocks = new BlockEditor(initialBlocks);
      const state = editorWithBlocks.getState();
      
      expect(state.blocks).toHaveLength(2);
      expect(state.blocks[0].id).toBe('block-123');
      expect(state.blocks[1].id).toBe('block-2');
    });
  });

  describe('state management', () => {
    it('should notify listeners on state change', () => {
      const listener = vi.fn();
      const unsubscribe = editor.subscribe(listener);
      
      editor.addBlock('text');
      
      expect(listener).toHaveBeenCalledWith(expect.objectContaining({
        blocks: expect.arrayContaining([
          expect.objectContaining({ type: 'text' }),
        ]),
      }));
      
      unsubscribe();
    });

    it('should remove listener on unsubscribe', () => {
      const listener = vi.fn();
      const unsubscribe = editor.subscribe(listener);
      
      unsubscribe();
      editor.addBlock('text');
      
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('block operations', () => {
    it('should add block at specified position', () => {
      editor.addBlock('text', 0);
      editor.addBlock('hero', 0);
      
      const state = editor.getState();
      expect(state.blocks).toHaveLength(2);
      expect(state.blocks[0].type).toBe('hero');
      expect(state.blocks[1].type).toBe('text');
    });

    it('should add block at end when no position specified', () => {
      editor.addBlock('text');
      editor.addBlock('hero');
      
      const state = editor.getState();
      expect(state.blocks).toHaveLength(2);
      expect(state.blocks[0].type).toBe('text');
      expect(state.blocks[1].type).toBe('hero');
    });

    it('should update block data', () => {
      const blockId = editor.addBlock('text');
      const success = editor.updateBlock(blockId, {
        data: { content: 'Updated content' },
      });
      
      expect(success).toBe(true);
      const state = editor.getState();
      expect(state.blocks[0].data.content).toBe('Updated content');
    });

    it('should delete block', () => {
      const blockId = editor.addBlock('text');
      editor.selectBlock(blockId);
      
      const success = editor.deleteBlock(blockId);
      
      expect(success).toBe(true);
      const state = editor.getState();
      expect(state.blocks).toHaveLength(0);
      expect(state.selectedBlockId).toBeNull();
    });

    it('should move block to new position', () => {
      const blockId1 = editor.addBlock('text');
      const blockId2 = editor.addBlock('hero');
      const blockId3 = editor.addBlock('image');
      
      const success = editor.moveBlock(blockId3, 0);
      
      expect(success).toBe(true);
      const state = editor.getState();
      expect(state.blocks[0].id).toBe(blockId3);
      expect(state.blocks[1].id).toBe(blockId1);
      expect(state.blocks[2].id).toBe(blockId2);
    });

    it('should duplicate block', () => {
      const blockId = editor.addBlock('text', 0, { data: { content: 'Original' } });
      const success = editor.duplicateBlock(blockId);
      
      expect(success).toBe(true);
      const state = editor.getState();
      expect(state.blocks).toHaveLength(2);
      expect(state.blocks[0].data.content).toBe('Original');
      expect(state.blocks[1].data.content).toBe('Original');
      expect(state.blocks[0].id).not.toBe(state.blocks[1].id);
    });
  });

  describe('selection', () => {
    it('should select block', () => {
      const blockId = editor.addBlock('text');
      editor.selectBlock(blockId);
      
      const state = editor.getState();
      expect(state.selectedBlockId).toBe(blockId);
    });

    it('should deselect block', () => {
      const blockId = editor.addBlock('text');
      editor.selectBlock(blockId);
      editor.selectBlock(null);
      
      const state = editor.getState();
      expect(state.selectedBlockId).toBeNull();
    });
  });

  describe('clipboard operations', () => {
    it('should copy block to clipboard', () => {
      const blockId = editor.addBlock('text', 0, { data: { content: 'Copy me' } });
      const success = editor.copyBlock(blockId);
      
      expect(success).toBe(true);
      const state = editor.getState();
      expect(state.clipboardBlock).toBeTruthy();
      expect(state.clipboardBlock?.data.content).toBe('Copy me');
    });

    it('should paste block from clipboard', () => {
      const blockId = editor.addBlock('text', 0, { data: { content: 'Copy me' } });
      editor.copyBlock(blockId);
      
      const pastedBlockId = editor.pasteBlock();
      
      expect(pastedBlockId).toBeTruthy();
      const state = editor.getState();
      expect(state.blocks).toHaveLength(2);
      expect(state.blocks[1].data.content).toBe('Copy me');
      expect(state.blocks[1].id).not.toBe(blockId);
    });

    it('should return null when pasting with empty clipboard', () => {
      const pastedBlockId = editor.pasteBlock();
      
      expect(pastedBlockId).toBeNull();
      const state = editor.getState();
      expect(state.blocks).toHaveLength(0);
    });
  });

  describe('history management', () => {
    it('should track history on changes', () => {
      editor.addBlock('text');
      editor.addBlock('hero');
      
      const state = editor.getState();
      expect(state.history).toHaveLength(3); // Initial + 2 additions
      expect(state.historyIndex).toBe(2);
      expect(state.isDirty).toBe(true);
    });

    it('should undo operation', () => {
      editor.addBlock('text');
      const blockId = editor.addBlock('hero');
      
      const success = editor.undo();
      
      expect(success).toBe(true);
      const state = editor.getState();
      expect(state.blocks).toHaveLength(1);
      expect(state.blocks[0].type).toBe('text');
      expect(state.historyIndex).toBe(1);
    });

    it('should redo operation', () => {
      editor.addBlock('text');
      editor.addBlock('hero');
      editor.undo();
      
      const success = editor.redo();
      
      expect(success).toBe(true);
      const state = editor.getState();
      expect(state.blocks).toHaveLength(2);
      expect(state.blocks[1].type).toBe('hero');
      expect(state.historyIndex).toBe(2);
    });

    it('should return false when no undo available', () => {
      const success = editor.undo();
      expect(success).toBe(false);
    });

    it('should return false when no redo available', () => {
      editor.addBlock('text');
      const success = editor.redo();
      expect(success).toBe(false);
    });
  });

  describe('import/export', () => {
    it('should export blocks to JSON', () => {
      const blockId = editor.addBlock('text', 0, { data: { content: 'Export me' } });
      const exported = editor.exportBlocks();
      
      expect(exported).toHaveLength(1);
      expect(exported[0].id).toBe(blockId);
      expect(exported[0].data.content).toBe('Export me');
    });

    it('should import blocks from JSON', () => {
      const blocks = [
        createMockContentBlock({ data: { content: 'Imported' } }),
        createMockContentBlock({ id: 'block-2', type: 'hero' }),
      ];
      
      const success = editor.importBlocks(blocks);
      
      expect(success).toBe(true);
      const state = editor.getState();
      expect(state.blocks).toHaveLength(2);
      expect(state.blocks[0].data.content).toBe('Imported');
      expect(state.blocks[1].type).toBe('hero');
    });
  });

  describe('utility methods', () => {
    it('should clear all blocks', () => {
      editor.addBlock('text');
      editor.addBlock('hero');
      editor.selectBlock(editor.getState().blocks[0].id);
      
      editor.clear();
      
      const state = editor.getState();
      expect(state.blocks).toHaveLength(0);
      expect(state.selectedBlockId).toBeNull();
    });

    it('should mark as saved', () => {
      editor.addBlock('text');
      expect(editor.getState().isDirty).toBe(true);
      
      editor.markAsSaved();
      
      expect(editor.getState().isDirty).toBe(false);
    });

    it('should handle drag operations', () => {
      const blockId = editor.addBlock('text');
      
      editor.startDrag(blockId);
      expect(editor.getState().draggedBlockId).toBe(blockId);
      
      editor.endDrag();
      expect(editor.getState().draggedBlockId).toBeNull();
    });
  });

  describe('block creation', () => {
    it('should create hero block with default data', () => {
      const blockId = editor.addBlock('hero');
      const state = editor.getState();
      const block = state.blocks[0];
      
      expect(block.type).toBe('hero');
      expect(block.data.headline).toBe('Welcome to Our Platform');
      expect(block.data.alignment).toBe('center');
    });

    it('should create text block with default data', () => {
      const blockId = editor.addBlock('text');
      const state = editor.getState();
      const block = state.blocks[0];
      
      expect(block.type).toBe('text');
      expect(block.data.content).toBe('<p>Add your content here...</p>');
      expect(block.data.format).toBe('html');
    });

    it('should create image block with default data', () => {
      const blockId = editor.addBlock('image');
      const state = editor.getState();
      const block = state.blocks[0];
      
      expect(block.type).toBe('image');
      expect(block.data.src).toBe('https://via.placeholder.com/800x400');
      expect(block.data.lazy).toBe(true);
    });

    it('should throw error for unknown block type', () => {
      expect(() => editor.addBlock('unknown-type')).toThrow('Unknown block type: unknown-type');
    });
  });

  describe('block templates', () => {
    it('should return available block templates', () => {
      const templates = BlockEditor.getBlockTemplates();
      
      expect(templates).toBeInstanceOf(Array);
      expect(templates.length).toBeGreaterThan(0);
      
      const heroTemplate = templates.find(t => t.id === 'hero-simple');
      expect(heroTemplate).toBeTruthy();
      expect(heroTemplate?.name).toBe('Simple Hero');
      expect(heroTemplate?.category).toBe('Headers');
    });
  });
});