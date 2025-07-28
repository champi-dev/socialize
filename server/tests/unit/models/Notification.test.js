const mongoose = require('mongoose');
const Notification = require('../../../models/Notification');

describe('Notification Model', () => {
  describe('Schema Validation', () => {
    it('should create a valid notification', () => {
      const notificationData = {
        recipient: new mongoose.Types.ObjectId(),
        sender: new mongoose.Types.ObjectId(),
        type: 'follow'
      };
      
      const notification = new Notification(notificationData);
      const error = notification.validateSync();
      expect(error).toBeUndefined();
    });

    it('should require recipient', () => {
      const notification = new Notification({
        sender: new mongoose.Types.ObjectId(),
        type: 'like'
      });
      
      const error = notification.validateSync();
      expect(error.errors.recipient).toBeDefined();
    });

    it('should require sender', () => {
      const notification = new Notification({
        recipient: new mongoose.Types.ObjectId(),
        type: 'comment'
      });
      
      const error = notification.validateSync();
      expect(error.errors.sender).toBeDefined();
    });

    it('should require type', () => {
      const notification = new Notification({
        recipient: new mongoose.Types.ObjectId(),
        sender: new mongoose.Types.ObjectId()
      });
      
      const error = notification.validateSync();
      expect(error.errors.type).toBeDefined();
    });

    it('should validate type enum', () => {
      const notification = new Notification({
        recipient: new mongoose.Types.ObjectId(),
        sender: new mongoose.Types.ObjectId(),
        type: 'invalid'
      });
      
      const error = notification.validateSync();
      expect(error.errors.type).toBeDefined();
    });

    it('should accept all valid notification types', () => {
      const types = ['follow', 'like', 'comment', 'mention', 'share'];
      
      types.forEach(type => {
        const notification = new Notification({
          recipient: new mongoose.Types.ObjectId(),
          sender: new mongoose.Types.ObjectId(),
          type
        });
        
        const error = notification.validateSync();
        expect(error).toBeUndefined();
      });
    });

    it('should set default values', () => {
      const notification = new Notification({
        recipient: new mongoose.Types.ObjectId(),
        sender: new mongoose.Types.ObjectId(),
        type: 'follow'
      });
      
      expect(notification.isRead).toBe(false);
      expect(notification.createdAt).toBeDefined();
    });

    it('should accept optional post reference', () => {
      const notification = new Notification({
        recipient: new mongoose.Types.ObjectId(),
        sender: new mongoose.Types.ObjectId(),
        type: 'like',
        post: new mongoose.Types.ObjectId()
      });
      
      const error = notification.validateSync();
      expect(error).toBeUndefined();
    });

    it('should accept optional comment text', () => {
      const notification = new Notification({
        recipient: new mongoose.Types.ObjectId(),
        sender: new mongoose.Types.ObjectId(),
        type: 'comment',
        post: new mongoose.Types.ObjectId(),
        comment: 'Great post!'
      });
      
      const error = notification.validateSync();
      expect(error).toBeUndefined();
      expect(notification.comment).toBe('Great post!');
    });

    it('should handle isRead updates', () => {
      const notification = new Notification({
        recipient: new mongoose.Types.ObjectId(),
        sender: new mongoose.Types.ObjectId(),
        type: 'follow',
        isRead: true
      });
      
      expect(notification.isRead).toBe(true);
    });
  });

  describe('Indexes', () => {
    it('should have required indexes defined', () => {
      const indexes = Notification.schema.indexes();
      
      expect(indexes).toContainEqual([
        { recipient: 1, createdAt: -1 }, 
        expect.any(Object)
      ]);
      expect(indexes).toContainEqual([
        { recipient: 1, isRead: 1 }, 
        expect.any(Object)
      ]);
    });
  });

  describe('Type-specific fields', () => {
    it('should handle follow notification without post', () => {
      const notification = new Notification({
        recipient: new mongoose.Types.ObjectId(),
        sender: new mongoose.Types.ObjectId(),
        type: 'follow'
      });
      
      const error = notification.validateSync();
      expect(error).toBeUndefined();
      expect(notification.post).toBeUndefined();
    });

    it('should handle like notification with post', () => {
      const postId = new mongoose.Types.ObjectId();
      const notification = new Notification({
        recipient: new mongoose.Types.ObjectId(),
        sender: new mongoose.Types.ObjectId(),
        type: 'like',
        post: postId
      });
      
      const error = notification.validateSync();
      expect(error).toBeUndefined();
      expect(notification.post).toEqual(postId);
    });

    it('should handle comment notification with post and comment', () => {
      const notification = new Notification({
        recipient: new mongoose.Types.ObjectId(),
        sender: new mongoose.Types.ObjectId(),
        type: 'comment',
        post: new mongoose.Types.ObjectId(),
        comment: 'Nice work!'
      });
      
      const error = notification.validateSync();
      expect(error).toBeUndefined();
      expect(notification.comment).toBe('Nice work!');
    });
  });
});