/**
 * Settings API Routes
 * 
 * GET /api/settings - Get all settings or filtered settings
 * PATCH /api/settings - Update settings (admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAllSettings, setSetting, getSettings } from '@/lib/services/settings-service';
import { createAuditLog, AUDIT_ACTIONS } from '@/lib/services/audit-logger';

/**
 * GET /api/settings
 * Get settings (all or filtered by query params)
 * 
 * @access Admin only
 * @query keys - Comma-separated list of setting keys (optional)
 * @returns 200 OK + Settings array or object
 * @errors 401 Unauthorized, 403 Forbidden
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check authentication
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check admin role
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Get keys from query params
    const { searchParams } = new URL(request.url);
    const keysParam = searchParams.get('keys');

    let settings;
    
    if (keysParam) {
      // Get specific settings
      const keys = keysParam.split(',').map(k => k.trim());
      settings = await getSettings(keys);
    } else {
      // Get all settings
      settings = await getAllSettings();
    }

    return NextResponse.json({
      success: true,
      settings,
    });

  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/settings
 * Update one or more settings
 * 
 * @access Admin only
 * @body { settings: { key: string, value: string }[] }
 * @returns 200 OK + Updated settings
 * @errors 400 Bad Request, 401 Unauthorized, 403 Forbidden
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check authentication
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check admin role
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate body
    if (!body.settings || !Array.isArray(body.settings)) {
      return NextResponse.json(
        { error: 'Invalid request body. Expected { settings: [{ key, value }] }' },
        { status: 400 }
      );
    }

    // Validate each setting
    for (const setting of body.settings) {
      if (!setting.key || typeof setting.key !== 'string') {
        return NextResponse.json(
          { error: 'Invalid setting: key is required' },
          { status: 400 }
        );
      }
      if (setting.value === undefined || setting.value === null) {
        return NextResponse.json(
          { error: `Invalid setting: value is required for key ${setting.key}` },
          { status: 400 }
        );
      }
    }

    // Update each setting
    const updatedSettings = [];
    for (const setting of body.settings) {
      const updated = await setSetting(
        setting.key,
        String(setting.value),
        session.user.id
      );
      updatedSettings.push(updated);

      // Create audit log for sensitive settings
      if (['approval_mode', 'lead_price_default', 'lead_price_call_visit', 'lead_price_written_quote', 'lead_price_bidding'].includes(setting.key)) {
        await createAuditLog({
          userId: session.user.id,
          action: AUDIT_ACTIONS.ADMIN_SETTINGS_CHANGED,
          entityType: 'settings',
          entityId: setting.key,
          metadata: {
            key: setting.key,
            value: String(setting.value),
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      settings: updatedSettings,
    });

  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
