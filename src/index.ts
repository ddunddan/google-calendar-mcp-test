import express from 'express';
import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';
import { AuthServer } from './auth-server.js';
import { TokenManager } from './token-manager.js';

const app = express();
app.use(express.json());

const oauth2Client = new OAuth2Client();
const authServer = new AuthServer(oauth2Client);
const tokenManager = new TokenManager(oauth2Client);

// Initialize Google Calendar API
const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

// MCP Server endpoints
app.post('/mcp/list-events', async (req, res) => {
  try {
    const tokens = await tokenManager.loadSavedTokens();
    if (!tokens) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const timeMin = new Date();
    timeMin.setHours(0, 0, 0, 0);

    const timeMax = new Date(timeMin);
    timeMax.setDate(timeMax.getDate() + 7);

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = response.data.items;
    res.json({ events });
  } catch (error) {
    console.error('Error listing events:', error);
    res.status(500).json({ error: 'Failed to list events' });
  }
});

app.post('/mcp/create-event', async (req, res) => {
  try {
    const tokens = await tokenManager.loadSavedTokens();
    if (!tokens) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { summary, description, start, end, attendees } = req.body;

    if (!summary || !start || !end) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const event = {
      summary,
      description,
      start: {
        dateTime: new Date(start).toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: new Date(end).toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      attendees: attendees?.map((email: string) => ({ email })),
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
    });

    res.json({ event: response.data });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

app.post('/mcp/update-event', async (req, res) => {
  try {
    const tokens = await tokenManager.loadSavedTokens();
    if (!tokens) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { eventId, summary, description, start, end, attendees } = req.body;

    if (!eventId) {
      res.status(400).json({ error: 'Missing event ID' });
      return;
    }

    const event: any = {};
    if (summary) event.summary = summary;
    if (description) event.description = description;
    if (start) {
      event.start = {
        dateTime: new Date(start).toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };
    }
    if (end) {
      event.end = {
        dateTime: new Date(end).toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };
    }
    if (attendees) {
      event.attendees = attendees.map((email: string) => ({ email }));
    }

    const response = await calendar.events.patch({
      calendarId: 'primary',
      eventId,
      requestBody: event,
    });

    res.json({ event: response.data });
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

app.post('/mcp/delete-event', async (req, res) => {
  try {
    const tokens = await tokenManager.loadSavedTokens();
    if (!tokens) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const { eventId } = req.body;

    if (!eventId) {
      res.status(400).json({ error: 'Missing event ID' });
      return;
    }

    await calendar.events.delete({
      calendarId: 'primary',
      eventId,
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, async () => {
  console.log(`MCP server listening on port ${port}`);
  
  // Start authentication server if needed
  const tokens = await tokenManager.loadSavedTokens();
  if (!tokens) {
    console.log('No valid tokens found, starting authentication server...');
    await authServer.start();
  }
});