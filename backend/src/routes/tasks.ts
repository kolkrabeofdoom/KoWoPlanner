import { Router, Response } from 'express';
import { prisma } from '../db';
import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET /api/tasks
router.get('/', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  const { workspaceId } = req.query;

  try {
    const tasks = await prisma.task.findMany({
      where: workspaceId ? { workspaceId: String(workspaceId) } : {},
      include: {
        assignees: true,
        checklist: true,
        comments: true
      }
    });

    // Format output to match frontend interface (assignees as ID string array)
    const formattedTasks = tasks.map(task => ({
      ...task,
      assignees: task.assignees.map(u => u.id),
      comments: task.comments.map(c => ({
        id: c.id,
        authorId: c.authorId,
        text: c.text,
        timestamp: c.timestamp.toISOString()
      }))
    }));

    res.json(formattedTasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Fehler beim Laden der Aufgaben.' });
  }
});

// POST /api/tasks
router.post('/', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  const {
    workspaceId,
    title,
    description,
    status,
    priority,
    startDate,
    dueDate,
    address,
    assignees, // array of user IDs
    checklist // array of checklist items
  } = req.body;

  if (!workspaceId || !title) {
    return res.status(400).json({ error: 'Arbeitsbereich-ID und Titel sind erforderlich.' });
  }

  try {
    const task = await prisma.task.create({
      data: {
        workspaceId,
        title,
        description: description || '',
        status: status || 'planning',
        priority: priority || 'medium',
        startDate: startDate || new Date().toISOString().split('T')[0],
        dueDate: dueDate || new Date().toISOString().split('T')[0],
        address: address || '',
        assignees: assignees && assignees.length > 0 ? {
          connect: assignees.map((id: string) => ({ id }))
        } : undefined,
        checklist: checklist && checklist.length > 0 ? {
          create: checklist.map((item: any) => ({
            text: item.text,
            completed: item.completed || false
          }))
        } : undefined
      },
      include: {
        assignees: true,
        checklist: true,
        comments: true
      }
    });

    res.status(201).json({
      ...task,
      assignees: task.assignees.map(u => u.id),
      comments: []
    });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Aufgabe konnte nicht erstellt werden.' });
  }
});

// PUT /api/tasks/:id
router.put('/:id', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const {
    title,
    description,
    status,
    priority,
    startDate,
    dueDate,
    address,
    assignees, // array of user IDs
    checklist, // array of checklist items text & completed
    comments // array of comments
  } = req.body;

  try {
    // 1. Clear checklist items for this task, we will recreate them
    if (checklist) {
      await prisma.checklistItem.deleteMany({ where: { taskId: id } });
    }

    // 2. Sync comments
    if (comments && Array.isArray(comments)) {
      for (const c of comments) {
        if (!c.text || !c.text.trim()) continue;

        let exists = false;
        if (c.id && !c.id.startsWith('c-') && !c.id.startsWith('temp-')) {
          const check = await prisma.comment.findFirst({
            where: { id: c.id }
          });
          if (check) exists = true;
        } else {
          const check = await prisma.comment.findFirst({
            where: {
              taskId: id,
              authorId: c.authorId,
              text: c.text.trim()
            }
          });
          if (check) exists = true;
        }

        if (!exists) {
          await prisma.comment.create({
            data: {
              taskId: id,
              authorId: c.authorId,
              text: c.text.trim(),
              timestamp: c.timestamp ? new Date(c.timestamp) : new Date()
            }
          });
        }
      }
    }

    // 3. Update task details and connect assignees
    const task = await prisma.task.update({
      where: { id },
      data: {
        title,
        description,
        status,
        priority,
        startDate,
        dueDate,
        address,
        assignees: assignees ? {
          set: assignees.map((userId: string) => ({ id: userId }))
        } : undefined,
        checklist: checklist && checklist.length > 0 ? {
          create: checklist.map((item: any) => ({
            text: item.text,
            completed: item.completed || false
          }))
        } : undefined
      },
      include: {
        assignees: true,
        checklist: true,
        comments: true
      }
    });

    res.json({
      ...task,
      assignees: task.assignees.map(u => u.id),
      comments: task.comments.map(c => ({
        id: c.id,
        authorId: c.authorId,
        text: c.text,
        timestamp: c.timestamp.toISOString()
      }))
    });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Aufgabe konnte nicht aktualisiert werden.' });
  }
});

// DELETE /api/tasks/:id
router.delete('/:id', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  try {
    await prisma.task.delete({ where: { id } });
    res.json({ success: true, message: 'Aufgabe gelöscht.' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Aufgabe konnte nicht gelöscht werden.' });
  }
});

// POST /api/tasks/:id/comments
router.post('/:id/comments', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Kommentartext ist erforderlich.' });
  }

  if (!req.user) return res.status(401).json({ error: 'Nicht authentifiziert' });

  try {
    const comment = await prisma.comment.create({
      data: {
        taskId: id,
        authorId: req.user.id,
        text
      }
    });

    res.status(201).json({
      id: comment.id,
      authorId: comment.authorId,
      text: comment.text,
      timestamp: comment.timestamp.toISOString()
    });
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ error: 'Kommentar konnte nicht hinzugefügt werden.' });
  }
});

// PUT /api/tasks/bulk/status
router.put('/bulk/status', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  const { taskIds, status } = req.body;

  if (!taskIds || !Array.isArray(taskIds) || !status) {
    return res.status(400).json({ error: 'Aufgaben-IDs und Status sind erforderlich.' });
  }

  try {
    await prisma.task.updateMany({
      where: { id: { in: taskIds } },
      data: { status }
    });
    res.json({ success: true, message: 'Status für Aufgaben aktualisiert.' });
  } catch (error) {
    console.error('Bulk status error:', error);
    res.status(500).json({ error: 'Bulk-Statusaktualisierung fehlgeschlagen.' });
  }
});

// POST /api/tasks/bulk/delete
router.post('/bulk/delete', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  const { taskIds } = req.body;

  if (!taskIds || !Array.isArray(taskIds)) {
    return res.status(400).json({ error: 'Aufgaben-IDs sind erforderlich.' });
  }

  try {
    await prisma.task.deleteMany({
      where: { id: { in: taskIds } }
    });
    res.json({ success: true, message: 'Aufgaben erfolgreich gelöscht.' });
  } catch (error) {
    console.error('Bulk delete error:', error);
    res.status(500).json({ error: 'Bulk-Löschen fehlgeschlagen.' });
  }
});

export default router;
