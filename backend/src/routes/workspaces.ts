import { Router, Response } from 'express';
import { prisma } from '../db';
import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET /api/workspaces
router.get('/', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const workspaces = await prisma.workspace.findMany();
    res.json(workspaces);
  } catch (error) {
    res.status(500).json({ error: 'Fehler beim Laden der Arbeitsbereiche.' });
  }
});

// POST /api/workspaces
router.post('/', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Name des Arbeitsbereichs ist erforderlich.' });
  }

  try {
    const workspace = await prisma.workspace.create({
      data: {
        name,
        description: description || ''
      }
    });
    res.status(201).json(workspace);
  } catch (error) {
    res.status(500).json({ error: 'Arbeitsbereich konnte nicht erstellt werden.' });
  }
});

// DELETE /api/workspaces/:id
router.delete('/:id', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  try {
    await prisma.workspace.delete({ where: { id } });
    res.json({ success: true, message: 'Arbeitsbereich gelöscht.' });
  } catch (error) {
    res.status(500).json({ error: 'Arbeitsbereich konnte nicht gelöscht werden.' });
  }
});

export default router;
