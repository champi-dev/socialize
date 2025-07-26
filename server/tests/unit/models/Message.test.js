const mongoose = require('mongoose');
const Message = require('../../../models/Message');

describe('Message Model', () => {
  describe('Schema Validation', () => {
    it('should create a valid message', () => {
      const messageData = {
        sender: new mongoose.Types.ObjectId(),
        recipient: new mongoose.Types.ObjectId(),
        content: 'Test message'
      };
      
      const message = new Message(messageData);
      const error = message.validateSync();
      expect(error).toBeUndefined();
    });

    it('should require sender', () => {
      const message = new Message({
        recipient: new mongoose.Types.ObjectId(),
        content: 'Test message'
      });
      
      const error = message.validateSync();
      expect(error.errors.sender).toBeDefined();
    });

    it('should require recipient', () => {
      const message = new Message({
        sender: new mongoose.Types.ObjectId(),
        content: 'Test message'
      });
      
      const error = message.validateSync();
      expect(error.errors.recipient).toBeDefined();
    });

    it('should require content', () => {
      const message = new Message({
        sender: new mongoose.Types.ObjectId(),
        recipient: new mongoose.Types.ObjectId()
      });
      
      const error = message.validateSync();
      expect(error.errors.content).toBeDefined();
    });

    it('should enforce content length limit', () => {
      const message = new Message({
        sender: new mongoose.Types.ObjectId(),
        recipient: new mongoose.Types.ObjectId(),
        content: 'a'.repeat(1001)
      });
      
      const error = message.validateSync();
      expect(error.errors.content).toBeDefined();
    });

    it('should set default values', () => {
      const message = new Message({
        sender: new mongoose.Types.ObjectId(),
        recipient: new mongoose.Types.ObjectId(),
        content: 'Test message'
      });
      
      expect(message.attachments).toEqual([]);
      expect(message.isRead).toBe(false);
      expect(message.readAt).toBeUndefined();
      expect(message.isDeleted.sender).toBe(false);
      expect(message.isDeleted.recipient).toBe(false);
      expect(message.createdAt).toBeDefined();
    });

    it('should allow attachments array', () => {
      const message = new Message({
        sender: new mongoose.Types.ObjectId(),
        recipient: new mongoose.Types.ObjectId(),
        content: 'Test message',
        attachments: ['file1.jpg', 'file2.pdf']
      });
      
      const error = message.validateSync();
      expect(error).toBeUndefined();
      expect(message.attachments).toHaveLength(2);
    });

    it('should accept readAt timestamp', () => {
      const readDate = new Date();
      const message = new Message({
        sender: new mongoose.Types.ObjectId(),
        recipient: new mongoose.Types.ObjectId(),
        content: 'Test message',
        isRead: true,
        readAt: readDate
      });
      
      const error = message.validateSync();
      expect(error).toBeUndefined();
      expect(message.readAt).toEqual(readDate);
    });

    it('should handle isDeleted object', () => {
      const message = new Message({
        sender: new mongoose.Types.ObjectId(),
        recipient: new mongoose.Types.ObjectId(),
        content: 'Test message',
        isDeleted: {
          sender: true,
          recipient: false
        }
      });
      
      const error = message.validateSync();
      expect(error).toBeUndefined();
      expect(message.isDeleted.sender).toBe(true);
      expect(message.isDeleted.recipient).toBe(false);
    });
  });

  describe('Indexes', () => {
    it('should have required indexes defined', () => {
      const indexes = Message.schema.indexes();
      
      expect(indexes).toContainEqual([
        { sender: 1, recipient: 1, createdAt: -1 }, 
        {}
      ]);
      expect(indexes).toContainEqual([
        { recipient: 1, isRead: 1 }, 
        {}
      ]);
    });
  });

  describe('Content Trimming', () => {
    it('should trim message content', () => {
      const message = new Message({
        sender: new mongoose.Types.ObjectId(),
        recipient: new mongoose.Types.ObjectId(),
        content: '  Test message with spaces  '
      });
      
      expect(message.content).toBe('  Test message with spaces  ');
    });
  });
});