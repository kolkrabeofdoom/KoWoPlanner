import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../db';
import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET /api/users
router.get('/', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarInitials: true,
        color: true
      }
    });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Fehler beim Laden der Benutzer.' });
  }
});

// POST /api/users
router.post('/', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  const { name, email, password, role, avatarInitials, color } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'Name, E-Mail, Passwort und Rolle sind erforderlich.' });
  }

  try {
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return res.status(400).json({ error: 'Ein Benutzer mit dieser E-Mail-Adresse existiert bereits.' });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role,
        avatarInitials: avatarInitials || name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2),
        color: color || '#8b5cf6'
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarInitials: true,
        color: true
      }
    });

    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Benutzer konnte nicht erstellt werden.' });
  }
});

// PUT /api/users/:id
router.put('/:id', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { name, email, password, role, avatarInitials, color } = req.body;

  try {
    const data: any = {
      name,
      email,
      role,
      avatarInitials,
      color
    };

    if (password) {
      data.passwordHash = bcrypt.hashSync(password, 10);
    }

    const user = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarInitials: true,
        color: true
      }
    });

    res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Benutzer konnte nicht aktualisiert werden.' });
  }
});

// DELETE /api/users/:id
router.delete('/:id', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  // Protect Active Administrator Frank Kröner against self-deletion in standard prototype mode
  if (req.user && req.user.id === id) {
    return res.status(400).json({ error: 'Sie können sich nicht selbst löschen.' });
  }

  try {
    await prisma.user.delete({ where: { id } });
    res.json({ success: true, message: 'Benutzer erfolgreich gelöscht.' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Benutzer konnte nicht gelöscht werden.' });
  }
});

export default router;
