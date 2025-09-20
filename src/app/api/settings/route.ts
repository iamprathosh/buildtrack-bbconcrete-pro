import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { supabase } from '@/lib/supabase'
import { z } from 'zod'

// Validation schemas
const companySettingsSchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Invalid email format').optional(),
  website: z.string().url('Invalid URL format').optional(),
  taxId: z.string().optional(),
  logo: z.string().optional(),
  timezone: z.string().min(1, 'Timezone is required'),
  currency: z.string().min(1, 'Currency is required'),
  dateFormat: z.string().min(1, 'Date format is required'),
  timeFormat: z.enum(['12h', '24h'])
})

const notificationSettingsSchema = z.object({
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  projectUpdates: z.boolean(),
  inventoryAlerts: z.boolean(),
  maintenanceReminders: z.boolean(),
  overdueTaskAlerts: z.boolean(),
  weeklyReports: z.boolean(),
  monthlyReports: z.boolean()
})

const securitySettingsSchema = z.object({
  twoFactorAuth: z.boolean(),
  sessionTimeout: z.number().min(1).max(168), // 1 hour to 1 week
  passwordPolicy: z.object({
    minLength: z.number().min(6).max(20),
    requireUppercase: z.boolean(),
    requireNumbers: z.boolean(),
    requireSymbols: z.boolean()
  }),
  ipWhitelist: z.array(z.string()),
  auditLogging: z.boolean()
})

const integrationSettingsSchema = z.object({
  webhookUrl: z.string().url('Invalid webhook URL').optional(),
  apiKeys: z.array(z.object({
    name: z.string().min(1, 'API key name is required'),
    permissions: z.array(z.string())
  })),
  connectedServices: z.array(z.object({
    name: z.string(),
    status: z.enum(['connected', 'disconnected', 'error']),
    config: z.record(z.string(), z.any()).optional()
  }))
})

const backupSettingsSchema = z.object({
  autoBackup: z.boolean(),
  backupFrequency: z.enum(['daily', 'weekly', 'monthly']),
  retentionPeriod: z.number().min(7).max(365), // 7 days to 1 year
  backupLocation: z.string().optional()
})

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const section = searchParams.get('section') || 'all'

    // Get organization ID for the user
    const { data: userProfile } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', userId)
      .single()

    if (!userProfile?.organization_id) {
      return NextResponse.json({ error: 'User not associated with an organization' }, { status: 400 })
    }

    const orgId = userProfile.organization_id

    if (section === 'all' || section === 'company') {
      const { data: companySettings } = await supabase
        .from('organization_settings')
        .select(`
          name,
          address,
          phone,
          email,
          website,
          tax_id,
          logo,
          timezone,
          currency,
          date_format,
          time_format
        `)
        .eq('organization_id', orgId)
        .single()

      if (section === 'company') {
        return NextResponse.json({
          companySettings: companySettings ? {
            name: companySettings.name,
            address: companySettings.address,
            phone: companySettings.phone,
            email: companySettings.email,
            website: companySettings.website,
            taxId: companySettings.tax_id,
            logo: companySettings.logo,
            timezone: companySettings.timezone,
            currency: companySettings.currency,
            dateFormat: companySettings.date_format,
            timeFormat: companySettings.time_format
          } : null
        })
      }
    }

    if (section === 'all' || section === 'notifications') {
      const { data: notificationSettings } = await supabase
        .from('user_notification_settings')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (section === 'notifications') {
        return NextResponse.json({
          notificationSettings: notificationSettings ? {
            emailNotifications: notificationSettings.email_notifications,
            pushNotifications: notificationSettings.push_notifications,
            projectUpdates: notificationSettings.project_updates,
            inventoryAlerts: notificationSettings.inventory_alerts,
            maintenanceReminders: notificationSettings.maintenance_reminders,
            overdueTaskAlerts: notificationSettings.overdue_task_alerts,
            weeklyReports: notificationSettings.weekly_reports,
            monthlyReports: notificationSettings.monthly_reports
          } : null
        })
      }
    }

    if (section === 'all' || section === 'security') {
      const { data: securitySettings } = await supabase
        .from('organization_security_settings')
        .select('*')
        .eq('organization_id', orgId)
        .single()

      if (section === 'security') {
        return NextResponse.json({
          securitySettings: securitySettings ? {
            twoFactorAuth: securitySettings.two_factor_auth,
            sessionTimeout: securitySettings.session_timeout,
            passwordPolicy: securitySettings.password_policy,
            ipWhitelist: securitySettings.ip_whitelist || [],
            auditLogging: securitySettings.audit_logging
          } : null
        })
      }
    }

    if (section === 'all' || section === 'integrations') {
      const { data: integrationSettings } = await supabase
        .from('organization_integrations')
        .select('*')
        .eq('organization_id', orgId)

      const { data: apiKeys } = await supabase
        .from('api_keys')
        .select('id, name, permissions, created_at, last_used')
        .eq('organization_id', orgId)
        .eq('is_active', true)

      if (section === 'integrations') {
        return NextResponse.json({
          integrationSettings: {
            webhookUrl: integrationSettings?.[0]?.webhook_url || '',
            apiKeys: apiKeys?.map(key => ({
              id: key.id,
              name: key.name,
              key: '••••••••••••••••', // Never return actual keys
              permissions: key.permissions,
              createdDate: new Date(key.created_at),
              lastUsed: key.last_used ? new Date(key.last_used) : undefined
            })) || [],
            connectedServices: integrationSettings?.map(service => ({
              id: service.id,
              name: service.service_name,
              status: service.status,
              lastSync: service.last_sync ? new Date(service.last_sync) : undefined
            })) || []
          }
        })
      }
    }

    if (section === 'all' || section === 'backup') {
      const { data: backupSettings } = await supabase
        .from('organization_backup_settings')
        .select('*')
        .eq('organization_id', orgId)
        .single()

      if (section === 'backup') {
        return NextResponse.json({
          backupSettings: backupSettings ? {
            autoBackup: backupSettings.auto_backup,
            backupFrequency: backupSettings.backup_frequency,
            retentionPeriod: backupSettings.retention_period,
            backupLocation: backupSettings.backup_location
          } : null
        })
      }
    }

    // Return all settings if section is 'all'
    return NextResponse.json({
      message: 'Settings retrieved successfully',
      // Individual settings would be fetched above
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { section, settings } = body

    if (!section || !settings) {
      return NextResponse.json(
        { error: 'Section and settings are required' },
        { status: 400 }
      )
    }

    // Get organization ID for the user
    const { data: userProfile } = await supabase
      .from('users')
      .select('organization_id, role')
      .eq('id', userId)
      .single()

    if (!userProfile?.organization_id) {
      return NextResponse.json({ error: 'User not associated with an organization' }, { status: 400 })
    }

    const orgId = userProfile.organization_id

    switch (section) {
      case 'company': {
        // Only admins can update company settings
        if (userProfile.role !== 'admin') {
          return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
        }

        const validatedSettings = companySettingsSchema.parse(settings)

        const { error } = await supabase
          .from('organization_settings')
          .upsert({
            organization_id: orgId,
            name: validatedSettings.name,
            address: validatedSettings.address,
            phone: validatedSettings.phone,
            email: validatedSettings.email,
            website: validatedSettings.website,
            tax_id: validatedSettings.taxId,
            logo: validatedSettings.logo,
            timezone: validatedSettings.timezone,
            currency: validatedSettings.currency,
            date_format: validatedSettings.dateFormat,
            time_format: validatedSettings.timeFormat,
            updated_at: new Date().toISOString()
          })

        if (error) {
          console.error('Database error:', error)
          return NextResponse.json({ error: 'Failed to update company settings' }, { status: 500 })
        }

        break
      }

      case 'notifications': {
        const validatedSettings = notificationSettingsSchema.parse(settings)

        const { error } = await supabase
          .from('user_notification_settings')
          .upsert({
            user_id: userId,
            email_notifications: validatedSettings.emailNotifications,
            push_notifications: validatedSettings.pushNotifications,
            project_updates: validatedSettings.projectUpdates,
            inventory_alerts: validatedSettings.inventoryAlerts,
            maintenance_reminders: validatedSettings.maintenanceReminders,
            overdue_task_alerts: validatedSettings.overdueTaskAlerts,
            weekly_reports: validatedSettings.weeklyReports,
            monthly_reports: validatedSettings.monthlyReports,
            updated_at: new Date().toISOString()
          })

        if (error) {
          console.error('Database error:', error)
          return NextResponse.json({ error: 'Failed to update notification settings' }, { status: 500 })
        }

        break
      }

      case 'security': {
        // Only admins can update security settings
        if (userProfile.role !== 'admin') {
          return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
        }

        const validatedSettings = securitySettingsSchema.parse(settings)

        const { error } = await supabase
          .from('organization_security_settings')
          .upsert({
            organization_id: orgId,
            two_factor_auth: validatedSettings.twoFactorAuth,
            session_timeout: validatedSettings.sessionTimeout,
            password_policy: validatedSettings.passwordPolicy,
            ip_whitelist: validatedSettings.ipWhitelist,
            audit_logging: validatedSettings.auditLogging,
            updated_at: new Date().toISOString()
          })

        if (error) {
          console.error('Database error:', error)
          return NextResponse.json({ error: 'Failed to update security settings' }, { status: 500 })
        }

        break
      }

      case 'integrations': {
        // Only admins can update integration settings
        if (userProfile.role !== 'admin') {
          return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
        }

        const validatedSettings = integrationSettingsSchema.parse(settings)

        // Update webhook URL
        if (validatedSettings.webhookUrl) {
          const { error } = await supabase
            .from('organization_integrations')
            .upsert({
              organization_id: orgId,
              service_name: 'webhook',
              webhook_url: validatedSettings.webhookUrl,
              status: 'connected',
              updated_at: new Date().toISOString()
            })

          if (error) {
            console.error('Database error:', error)
            return NextResponse.json({ error: 'Failed to update webhook settings' }, { status: 500 })
          }
        }

        break
      }

      case 'backup': {
        // Only admins can update backup settings
        if (userProfile.role !== 'admin') {
          return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
        }

        const validatedSettings = backupSettingsSchema.parse(settings)

        const { error } = await supabase
          .from('organization_backup_settings')
          .upsert({
            organization_id: orgId,
            auto_backup: validatedSettings.autoBackup,
            backup_frequency: validatedSettings.backupFrequency,
            retention_period: validatedSettings.retentionPeriod,
            backup_location: validatedSettings.backupLocation,
            updated_at: new Date().toISOString()
          })

        if (error) {
          console.error('Database error:', error)
          return NextResponse.json({ error: 'Failed to update backup settings' }, { status: 500 })
        }

        break
      }

      default:
        return NextResponse.json({ error: 'Invalid section' }, { status: 400 })
    }

    // Log the activity
    await supabase.from('user_activities').insert({
      user_id: userId,
      action: 'settings_updated',
      details: {
        section,
        timestamp: new Date().toISOString()
      }
    })

    return NextResponse.json({ message: 'Settings updated successfully' })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }

    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}