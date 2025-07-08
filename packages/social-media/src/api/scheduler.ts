import { CronJob } from 'cron';
import { SocialPostType, PostStatusType } from '../types';
import { PostManager } from './post-manager';
import { createSupabaseClient } from '@sasarjan/database';

export class Scheduler {
  private jobs: Map<string, CronJob> = new Map();
  private supabase = createSupabaseClient();
  private postManager?: PostManager;

  constructor() {
    this.initializeScheduler();
  }

  /**
   * Set post manager reference (to avoid circular dependency)
   */
  setPostManager(postManager: PostManager): void {
    this.postManager = postManager;
  }

  /**
   * Initialize the scheduler
   */
  private initializeScheduler(): void {
    // Run every minute to check for posts to publish
    const mainJob = new CronJob('0 * * * * *', () => {
      this.processScheduledPosts();
    });

    mainJob.start();
    this.jobs.set('main-scheduler', mainJob);
  }

  /**
   * Schedule a post for future publishing
   */
  async schedulePost(post: SocialPostType): Promise<void> {
    if (!post.scheduledAt) {
      throw new Error('Post must have a scheduled time');
    }

    // Store the scheduled post
    await this.supabase
      .from('scheduled_posts')
      .insert({
        postId: post.id,
        userId: post.userId,
        scheduledAt: post.scheduledAt,
        platforms: post.platforms,
        status: 'pending',
        createdAt: new Date(),
      });

    console.log(`Post ${post.id} scheduled for ${post.scheduledAt}`);
  }

  /**
   * Reschedule an existing post
   */
  async reschedulePost(post: SocialPostType): Promise<void> {
    if (!post.scheduledAt) {
      throw new Error('Post must have a scheduled time');
    }

    await this.supabase
      .from('scheduled_posts')
      .update({
        scheduledAt: post.scheduledAt,
        updatedAt: new Date(),
      })
      .eq('postId', post.id);

    console.log(`Post ${post.id} rescheduled for ${post.scheduledAt}`);
  }

  /**
   * Cancel a scheduled post
   */
  async cancelScheduledPost(postId: string): Promise<void> {
    await this.supabase
      .from('scheduled_posts')
      .update({
        status: 'cancelled',
        updatedAt: new Date(),
      })
      .eq('postId', postId);

    console.log(`Scheduled post ${postId} cancelled`);
  }

  /**
   * Process scheduled posts that are due
   */
  private async processScheduledPosts(): Promise<void> {
    try {
      const now = new Date();
      
      // Get posts scheduled for now or earlier
      const { data: scheduledPosts, error } = await this.supabase
        .from('scheduled_posts')
        .select(`
          *,
          social_posts (*)
        `)
        .eq('status', 'pending')
        .lte('scheduledAt', now.toISOString())
        .limit(50); // Process in batches

      if (error) {
        console.error('Error fetching scheduled posts:', error);
        return;
      }

      if (!scheduledPosts || scheduledPosts.length === 0) {
        return;
      }

      console.log(`Processing ${scheduledPosts.length} scheduled posts`);

      // Process each scheduled post
      for (const scheduledPost of scheduledPosts) {
        try {
          await this.processScheduledPost(scheduledPost);
        } catch (error) {
          console.error(`Error processing scheduled post ${scheduledPost.postId}:`, error);
          
          // Mark as failed
          await this.supabase
            .from('scheduled_posts')
            .update({
              status: 'failed',
              error: error instanceof Error ? error.message : 'Unknown error',
              updatedAt: new Date(),
            })
            .eq('id', scheduledPost.id);
        }
      }
    } catch (error) {
      console.error('Error in processScheduledPosts:', error);
    }
  }

  /**
   * Process a single scheduled post
   */
  private async processScheduledPost(scheduledPost: any): Promise<void> {
    if (!this.postManager) {
      throw new Error('PostManager not set');
    }

    const post = scheduledPost.social_posts;
    if (!post) {
      throw new Error('Post not found');
    }

    // Mark as processing
    await this.supabase
      .from('scheduled_posts')
      .update({
        status: 'processing',
        updatedAt: new Date(),
      })
      .eq('id', scheduledPost.id);

    try {
      // Publish the post
      const result = await this.postManager.publishPost(post.userId, post.id);

      // Update scheduled post status
      await this.supabase
        .from('scheduled_posts')
        .update({
          status: result.success ? 'completed' : 'failed',
          results: result.results,
          updatedAt: new Date(),
        })
        .eq('id', scheduledPost.id);

      console.log(`Scheduled post ${post.id} processed successfully`);
    } catch (error) {
      // Mark as failed
      await this.supabase
        .from('scheduled_posts')
        .update({
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
          updatedAt: new Date(),
        })
        .eq('id', scheduledPost.id);

      throw error;
    }
  }

  /**
   * Get scheduled posts for a user
   */
  async getScheduledPosts(userId: string, options: {
    status?: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
    limit?: number;
    offset?: number;
  } = {}): Promise<{ posts: any[]; total: number }> {
    let query = this.supabase
      .from('scheduled_posts')
      .select(`
        *,
        social_posts (*)
      `, { count: 'exact' })
      .eq('userId', userId);

    if (options.status) {
      query = query.eq('status', options.status);
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    query = query.order('scheduledAt', { ascending: true });

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to get scheduled posts: ${error.message}`);
    }

    return {
      posts: data || [],
      total: count || 0,
    };
  }

  /**
   * Get optimal posting times for platforms
   */
  getOptimalPostingTimes(): Record<string, { hour: number; dayOfWeek: number }[]> {
    // Based on industry research and analytics
    return {
      linkedin: [
        { hour: 9, dayOfWeek: 2 }, // Tuesday 9 AM
        { hour: 12, dayOfWeek: 3 }, // Wednesday 12 PM
        { hour: 15, dayOfWeek: 4 }, // Thursday 3 PM
      ],
      twitter: [
        { hour: 9, dayOfWeek: 2 }, // Tuesday 9 AM
        { hour: 12, dayOfWeek: 3 }, // Wednesday 12 PM
        { hour: 15, dayOfWeek: 5 }, // Friday 3 PM
      ],
      facebook: [
        { hour: 9, dayOfWeek: 2 }, // Tuesday 9 AM
        { hour: 13, dayOfWeek: 3 }, // Wednesday 1 PM
        { hour: 15, dayOfWeek: 4 }, // Thursday 3 PM
      ],
      instagram: [
        { hour: 11, dayOfWeek: 2 }, // Tuesday 11 AM
        { hour: 14, dayOfWeek: 5 }, // Friday 2 PM
        { hour: 17, dayOfWeek: 6 }, // Saturday 5 PM
      ],
    };
  }

  /**
   * Suggest optimal posting time
   */
  suggestOptimalTime(platforms: string[], userTimezone = 'UTC'): Date {
    const now = new Date();
    const optimalTimes = this.getOptimalPostingTimes();
    
    // Find common optimal times across platforms
    const allTimes = platforms.flatMap(platform => optimalTimes[platform] || []);
    
    if (allTimes.length === 0) {
      // Default to next business day at 10 AM
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(10, 0, 0, 0);
      return tomorrow;
    }

    // Find the next occurrence of any optimal time
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);

    for (let i = 0; i < 7; i++) {
      const checkDate = new Date(now);
      checkDate.setDate(checkDate.getDate() + i);
      
      const dayOfWeek = checkDate.getDay();
      
      for (const time of allTimes) {
        if (time.dayOfWeek === dayOfWeek) {
          checkDate.setHours(time.hour, 0, 0, 0);
          
          if (checkDate > now) {
            return checkDate;
          }
        }
      }
    }

    // Fallback to tomorrow at 10 AM
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    return tomorrow;
  }

  /**
   * Bulk schedule posts
   */
  async bulkSchedulePosts(posts: Array<{
    post: SocialPostType;
    scheduledAt: Date;
  }>): Promise<void> {
    const schedulePromises = posts.map(({ post, scheduledAt }) => {
      const updatedPost = { ...post, scheduledAt };
      return this.schedulePost(updatedPost);
    });

    await Promise.all(schedulePromises);
  }

  /**
   * Create posting schedule for a series
   */
  createPostingSchedule(
    startDate: Date,
    frequency: 'daily' | 'weekly' | 'monthly',
    count: number,
    timeOfDay = '10:00'
  ): Date[] {
    const schedule: Date[] = [];
    const [hour, minute] = timeOfDay.split(':').map(Number);

    for (let i = 0; i < count; i++) {
      const date = new Date(startDate);
      
      switch (frequency) {
        case 'daily':
          date.setDate(date.getDate() + i);
          break;
        case 'weekly':
          date.setDate(date.getDate() + (i * 7));
          break;
        case 'monthly':
          date.setMonth(date.getMonth() + i);
          break;
      }
      
      date.setHours(hour, minute, 0, 0);
      schedule.push(date);
    }

    return schedule;
  }

  /**
   * Stop the scheduler
   */
  stop(): void {
    this.jobs.forEach(job => job.stop());
    this.jobs.clear();
  }
}