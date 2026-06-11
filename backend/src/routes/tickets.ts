import { Router, Response } from 'express';
import { prisma } from '../db';
import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET /api/tickets
router.get('/', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tickets = await prisma.ticket.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(tickets);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ error: 'Fehler beim Laden der Support-Tickets.' });
  }
});

// POST /api/tickets
router.post('/', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  const { title, description, reporter, category, priority, slaHours } = req.body;

  if (!title || !reporter || !description) {
    return res.status(400).json({ error: 'Titel, Melder und Beschreibung sind erforderlich.' });
  }

  try {
    const ticket = await prisma.ticket.create({
      data: {
        title,
        description,
        reporter,
        category: category || 'Hardware',
        priority: priority || 'medium',
        status: 'open',
        slaHours: Number(slaHours) || 24
      }
    });
    res.status(201).json(ticket);
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ error: 'Support-Ticket konnte nicht erstellt werden.' });
  }
});

// PUT /api/tickets/:id/status
router.put('/:id/status', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status || !['open', 'in_progress', 'resolved'].includes(status)) {
    return res.status(400).json({ error: 'Gültiger Status ist erforderlich.' });
  }

  try {
    const ticket = await prisma.ticket.update({
      where: { id },
      data: { status }
    });
    res.json(ticket);
  } catch (error) {
    console.error('Error updating ticket status:', error);
    res.status(500).json({ error: 'Ticket-Status konnte nicht aktualisiert werden.' });
  }
});

// POST /api/tickets/:id/convert
router.post('/:id/convert', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { workspaceId, assigneeId, dueDate } = req.body;

  if (!workspaceId || !assigneeId || !dueDate) {
    return res.status(400).json({ error: 'Projekt-ID, Bearbeiter-ID und Fälligkeit sind erforderlich.' });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Fetch ticket
      const ticket = await tx.ticket.findUnique({ where: { id } });
      if (!ticket) {
        throw new Error('Ticket nicht gefunden.');
      }

      // 2. Create task
      const task = await tx.task.create({
        data: {
          workspaceId,
          title: `Ticket #${ticket.id.slice(0, 8)}: ${ticket.title}`,
          description: `Ticket-Beschreibung:\n${ticket.description}\n\nGemeldet von: ${ticket.reporter}`,
          status: 'planning',
          priority: ticket.priority,
          startDate: new Date().toISOString().split('T')[0],
          dueDate,
          address: `Support-Ticket`,
          assignees: {
            connect: [{ id: assigneeId }]
          }
        },
        include: {
          assignees: true,
          checklist: true,
          comments: true
        }
      });

      // 3. Mark ticket as resolved
      const updatedTicket = await tx.ticket.update({
        where: { id },
        data: { status: 'resolved' }
      });

      return { task, ticket: updatedTicket };
    });

    res.json({
      success: true,
      ticket: result.ticket,
      task: {
        ...result.task,
        assignees: result.task.assignees.map(u => u.id),
        comments: []
      }
    });
  } catch (error: any) {
    console.error('Error converting ticket to task:', error);
    res.status(500).json({ error: error.message || 'Ticket-Konvertierung fehlgeschlagen.' });
  }
});

export default router;
