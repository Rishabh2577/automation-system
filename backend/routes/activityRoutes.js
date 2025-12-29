const express = require('express');
const router = express.Router();
const db = require('../config/database');

/**
 * POST /api/activity/track
 * Track user activity (video generation or download)
 * 
 * Body:
 * {
 *   action: 'generation' | 'download',
 *   userId: string (email),
 *   userName: string,
 *   aspectRatio: string,
 *   imageCount: number,
 *   videoUrl?: string
 * }
 */
router.post('/track', async (req, res) => {
  try {
    const { action, userId, userName, aspectRatio, imageCount, videoUrl } = req.body;

    // Validation
    if (!action || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: action, userId'
      });
    }

    // Insert activity into database
    const [result] = await db.query(
      `INSERT INTO user_activities 
       (action, user_email, user_name, aspect_ratio, image_count, video_url, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [action, userId, userName, aspectRatio, imageCount, videoUrl]
    );

    res.json({
      success: true,
      message: 'Activity tracked successfully',
      activityId: result.insertId
    });

  } catch (error) {
    console.error('Activity tracking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track activity'
    });
  }
});

/**
 * GET /api/activity/history
 * Get all user activity history (admin only)
 * 
 * Query params:
 * - action: filter by 'generation' or 'download'
 * - userId: filter by user email
 * - limit: number of records (default: 100)
 * - offset: pagination offset (default: 0)
 */
router.get('/history', async (req, res) => {
  try {
    const { action, userId, limit = 100, offset = 0 } = req.query;

    let query = 'SELECT * FROM user_activities WHERE 1=1';
    const params = [];

    if (action) {
      query += ' AND action = ?';
      params.push(action);
    }

    if (userId) {
      query += ' AND user_email = ?';
      params.push(userId);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [activities] = await db.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM user_activities WHERE 1=1';
    const countParams = [];

    if (action) {
      countQuery += ' AND action = ?';
      countParams.push(action);
    }

    if (userId) {
      countQuery += ' AND user_email = ?';
      countParams.push(userId);
    }

    const [countResult] = await db.query(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      success: true,
      data: {
        activities,
        pagination: {
          total,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: parseInt(offset) + activities.length < total
        }
      }
    });

  } catch (error) {
    console.error('Get activity history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve activity history'
    });
  }
});

/**
 * GET /api/activity/stats
 * Get activity statistics (admin only)
 */
router.get('/stats', async (req, res) => {
  try {
    // Total activities
    const [totalResult] = await db.query(
      'SELECT COUNT(*) as total FROM user_activities'
    );

    // Count by action type
    const [actionStats] = await db.query(
      `SELECT 
        action,
        COUNT(*) as count
       FROM user_activities
       GROUP BY action`
    );

    // Unique users
    const [usersResult] = await db.query(
      'SELECT COUNT(DISTINCT user_email) as uniqueUsers FROM user_activities'
    );

    // Recent activity (last 7 days)
    const [recentResult] = await db.query(
      `SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
       FROM user_activities
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
       GROUP BY DATE(created_at)
       ORDER BY date DESC`
    );

    // Top users
    const [topUsers] = await db.query(
      `SELECT 
        user_email,
        user_name,
        COUNT(*) as activityCount
       FROM user_activities
       GROUP BY user_email, user_name
       ORDER BY activityCount DESC
       LIMIT 10`
    );

    res.json({
      success: true,
      data: {
        total: totalResult[0].total,
        byAction: actionStats.reduce((acc, item) => {
          acc[item.action] = item.count;
          return acc;
        }, {}),
        uniqueUsers: usersResult[0].uniqueUsers,
        recentActivity: recentResult,
        topUsers
      }
    });

  } catch (error) {
    console.error('Get activity stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve activity statistics'
    });
  }
});

module.exports = router;

