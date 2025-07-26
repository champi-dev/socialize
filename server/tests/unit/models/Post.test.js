const mongoose = require('mongoose');
const Post = require('../../../models/Post');

describe('Post Model', () => {
  describe('Schema Validation', () => {
    it('should create a valid post', () => {
      const postData = {
        author: new mongoose.Types.ObjectId(),
        content: 'This is a test post'
      };
      
      const post = new Post(postData);
      const error = post.validateSync();
      expect(error).toBeUndefined();
    });

    it('should require author', () => {
      const post = new Post({
        content: 'This is a test post'
      });
      
      const error = post.validateSync();
      expect(error.errors.author).toBeDefined();
    });

    it('should require content', () => {
      const post = new Post({
        author: new mongoose.Types.ObjectId()
      });
      
      const error = post.validateSync();
      expect(error.errors.content).toBeDefined();
    });

    it('should enforce content length limit', () => {
      const post = new Post({
        author: new mongoose.Types.ObjectId(),
        content: 'a'.repeat(501)
      });
      
      const error = post.validateSync();
      expect(error.errors.content).toBeDefined();
    });

    it('should set default values', () => {
      const post = new Post({
        author: new mongoose.Types.ObjectId(),
        content: 'Test post'
      });
      
      expect(post.images).toEqual([]);
      expect(post.likes).toEqual([]);
      expect(post.comments).toEqual([]);
      expect(post.shares).toEqual([]);
      expect(post.mentions).toEqual([]);
      expect(post.hashtags).toEqual([]);
      expect(post.visibility).toBe('public');
      expect(post.isDeleted).toBe(false);
      expect(post.createdAt).toBeDefined();
      expect(post.updatedAt).toBeDefined();
    });

    it('should validate visibility enum', () => {
      const post = new Post({
        author: new mongoose.Types.ObjectId(),
        content: 'Test post',
        visibility: 'invalid'
      });
      
      const error = post.validateSync();
      expect(error.errors.visibility).toBeDefined();
    });

    it('should accept valid visibility values', () => {
      const visibilities = ['public', 'followers', 'private'];
      
      visibilities.forEach(visibility => {
        const post = new Post({
          author: new mongoose.Types.ObjectId(),
          content: 'Test post',
          visibility
        });
        
        const error = post.validateSync();
        expect(error).toBeUndefined();
      });
    });
  });

  describe('Pre-save Hook', () => {
    it('should extract hashtags from content', async () => {
      const post = new Post({
        author: new mongoose.Types.ObjectId(),
        content: 'This is a #test post with #multiple #hashtags'
      });
      
      await post.save();
      
      expect(post.hashtags).toEqual(['test', 'multiple', 'hashtags']);
    });

    it('should handle hashtags case-insensitively', async () => {
      const post = new Post({
        author: new mongoose.Types.ObjectId(),
        content: 'This is a #Test post with #HASHTAG'
      });
      
      await post.save();
      
      expect(post.hashtags).toEqual(['test', 'hashtag']);
    });

    it('should handle posts without hashtags', async () => {
      const post = new Post({
        author: new mongoose.Types.ObjectId(),
        content: 'This is a post without hashtags'
      });
      
      await post.save();
      
      expect(post.hashtags).toEqual([]);
    });

    it('should update updatedAt timestamp', async () => {
      const post = new Post({
        author: new mongoose.Types.ObjectId(),
        content: 'Test post'
      });
      
      const initialTime = post.updatedAt;
      
      await new Promise(resolve => setTimeout(resolve, 10));
      await post.save();
      
      expect(post.updatedAt.getTime()).toBeGreaterThan(initialTime.getTime());
    });

    it('should clear mentions array when mentions are found', async () => {
      const post = new Post({
        author: new mongoose.Types.ObjectId(),
        content: 'Hey @user1 and @user2!',
        mentions: [new mongoose.Types.ObjectId()]
      });
      
      await post.save();
      
      expect(post.mentions).toEqual([]);
    });
  });

  describe('Comments', () => {
    it('should add valid comment', () => {
      const post = new Post({
        author: new mongoose.Types.ObjectId(),
        content: 'Test post'
      });
      
      const comment = {
        author: new mongoose.Types.ObjectId(),
        content: 'Test comment',
        likes: [],
        createdAt: new Date()
      };
      
      post.comments.push(comment);
      const error = post.validateSync();
      expect(error).toBeUndefined();
    });

    it('should require comment author', () => {
      const post = new Post({
        author: new mongoose.Types.ObjectId(),
        content: 'Test post'
      });
      
      post.comments.push({
        content: 'Test comment'
      });
      
      const error = post.validateSync();
      expect(error.errors['comments.0.author']).toBeDefined();
    });

    it('should require comment content', () => {
      const post = new Post({
        author: new mongoose.Types.ObjectId(),
        content: 'Test post'
      });
      
      post.comments.push({
        author: new mongoose.Types.ObjectId()
      });
      
      const error = post.validateSync();
      expect(error.errors['comments.0.content']).toBeDefined();
    });

    it('should enforce comment content length', () => {
      const post = new Post({
        author: new mongoose.Types.ObjectId(),
        content: 'Test post'
      });
      
      post.comments.push({
        author: new mongoose.Types.ObjectId(),
        content: 'a'.repeat(201)
      });
      
      const error = post.validateSync();
      expect(error.errors['comments.0.content']).toBeDefined();
    });
  });

  describe('Shares', () => {
    it('should add valid share', () => {
      const post = new Post({
        author: new mongoose.Types.ObjectId(),
        content: 'Test post'
      });
      
      post.shares.push({
        user: new mongoose.Types.ObjectId(),
        sharedAt: new Date()
      });
      
      const error = post.validateSync();
      expect(error).toBeUndefined();
    });

    it('should set default sharedAt date', () => {
      const post = new Post({
        author: new mongoose.Types.ObjectId(),
        content: 'Test post'
      });
      
      post.shares.push({
        user: new mongoose.Types.ObjectId()
      });
      
      expect(post.shares[0].sharedAt).toBeDefined();
    });
  });

  describe('Indexes', () => {
    it('should have required indexes defined', () => {
      const indexes = Post.schema.indexes();
      
      expect(indexes).toContainEqual([{ author: 1, createdAt: -1 }, {}]);
      expect(indexes).toContainEqual([{ hashtags: 1 }, {}]);
      expect(indexes).toContainEqual([{ mentions: 1 }, {}]);
      expect(indexes).toContainEqual([{ createdAt: -1 }, {}]);
    });
  });
});