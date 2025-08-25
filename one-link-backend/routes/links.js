const express = require('express');
const { Link, User } = require('../models');
const router = express.Router();

/**
 * GET /api/links
 * Get all links for the authenticated user
 * Requires authentication middleware to provide req.user
 */
router.get('/', async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user.user_id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Fetch all links for the authenticated user, ordered by the order field
    const links = await Link.findAll({
      where: { user_id: req.user.user_id },
      order: [['order', 'ASC'], ['created_at', 'ASC']],
      attributes: ['link_id', 'title', 'url', 'order', 'created_at', 'updated_at']
    });

    res.json({
      success: true,
      data: links,
      message: `Found ${links.length} links`
    });

  } catch (error) {
    console.error('Error fetching links:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching links',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/links
 * Add a new link for the authenticated user
 * Requires authentication middleware to provide req.user
 */
router.post('/', async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user.user_id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const { title, url, order } = req.body;

    // Basic validation
    if (!title || !url) {
      return res.status(400).json({
        success: false,
        message: 'Title and URL are required fields'
      });
    }

    if (title.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Title must be 100 characters or less'
      });
    }

    if (url.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'URL must be 500 characters or less'
      });
    }

    // If no order is provided, find the highest order and add 1
    let linkOrder = order;
    if (linkOrder === undefined || linkOrder === null) {
      const lastLink = await Link.findOne({
        where: { user_id: req.user.user_id },
        order: [['order', 'DESC']]
      });
      linkOrder = lastLink ? lastLink.order + 1 : 0;
    }

    // Create the new link
    const newLink = await Link.create({
      user_id: req.user.user_id,
      title: title.trim(),
      url: url.trim(),
      order: linkOrder
    });

    res.status(201).json({
      success: true,
      data: newLink.getFormattedLink(),
      message: 'Link created successfully'
    });

  } catch (error) {
    console.error('Error creating link:', error);
    
    // Handle Sequelize validation errors
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error while creating link',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * PUT /api/links/:id
 * Update a link by ID for the authenticated user
 * Requires authentication middleware to provide req.user
 */
router.put('/:id', async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user.user_id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const linkId = parseInt(req.params.id);
    const { title, url, order } = req.body;

    // Validate link ID
    if (isNaN(linkId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid link ID'
      });
    }

    // Find the link and ensure it belongs to the authenticated user
    const link = await Link.findOne({
      where: {
        link_id: linkId,
        user_id: req.user.user_id
      }
    });

    if (!link) {
      return res.status(404).json({
        success: false,
        message: 'Link not found or access denied'
      });
    }

    // Prepare update data
    const updateData = {};
    if (title !== undefined) {
      if (!title || title.length > 100) {
        return res.status(400).json({
          success: false,
          message: 'Title must be between 1 and 100 characters'
        });
      }
      updateData.title = title.trim();
    }

    if (url !== undefined) {
      if (!url || url.length > 500) {
        return res.status(400).json({
          success: false,
          message: 'URL must be between 1 and 500 characters'
        });
      }
      updateData.url = url.trim();
    }

    if (order !== undefined) {
      if (order < 0) {
        return res.status(400).json({
          success: false,
          message: 'Order must be a non-negative number'
        });
      }
      updateData.order = order;
    }

    // Update the link
    await link.update(updateData);

    res.json({
      success: true,
      data: link.getFormattedLink(),
      message: 'Link updated successfully'
    });

  } catch (error) {
    console.error('Error updating link:', error);
    
    // Handle Sequelize validation errors
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map(err => ({
          field: err.path,
          message: err.message
        }))
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error while updating link',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * DELETE /api/links/:id
 * Delete a link by ID for the authenticated user
 * Requires authentication middleware to provide req.user
 */
router.delete('/:id', async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user.user_id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const linkId = parseInt(req.params.id);

    // Validate link ID
    if (isNaN(linkId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid link ID'
      });
    }

    // Find the link and ensure it belongs to the authenticated user
    const link = await Link.findOne({
      where: {
        link_id: linkId,
        user_id: req.user.user_id
      }
    });

    if (!link) {
      return res.status(404).json({
        success: false,
        message: 'Link not found or access denied'
      });
    }

    // Delete the link
    await link.destroy();

    res.json({
      success: true,
      message: 'Link deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting link:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while deleting link',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
