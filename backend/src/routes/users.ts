import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../db';
import { authenticateJWT, requireAdmin, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

const PUBLIC_USER_FIELDS = {
  id: true,
  name: true,
  email: true,
  role: true,
  avatarInitials: true,
  color: true,
  isAdmin: true
} as const;

const MIN_PASSWORD_LENGTH = 8;

// GET /api/users
router.get('/', authenticateJWT, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: PUBLIC_USER_FIELDS
    });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Fehler beim Laden der Benutzer.' });
  }
});

// POST /api/users
router.post('/', authenticateJWT, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const { name, email, password, role, avatarInitials, color, isAdmin } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'Name, E-Mail, Passwort und Rolle sind erforderlich.' });
  }

  if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
    return res.status(400).json({ error: `Das Passwort muss mindestens ${MIN_PASSWORD_LENGTH} Zeichen lang sein.` });
  }

  try {
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return res.status(400).json({ error: 'Ein Benutzer mit dieser E-Mail-Adresse existiert bereits.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role,
        isAdmin: Boolean(isAdmin),
        avatarInitials: avatarInitials || name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2),
        color: color || '#8b5cf6'
      },
      select: PUBLIC_USER_FIELDS
    });

    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Benutzer konnte nicht erstellt werden.' });
  }
});

// PUT /api/users/:id
router.put('/:id', authenticateJWT, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { name, email, password, role, avatarInitials, color, isAdmin } = req.body;

  // Admins cannot revoke their own admin rights (avoids locking everyone out)
  if (req.user && req.user.id === id && isAdmin === false) {
    return res.status(400).json({ error: 'Sie können Ihre eigenen Administrator-Rechte nicht entziehen.' });
  }

  try {
    const data: any = {
      name,
      email,
      role,
      avatarInitials,
      color,
      isAdmin: typeof isAdmin === 'boolean' ? isAdmin : undefined
    };

    if (password) {
      if (typeof password !== 'string' || password.length < MIN_PASSWORD_LENGTH) {
        return res.status(400).json({ error: `Das Passwort muss mindestens ${MIN_PASSWORD_LENGTH} Zeichen lang sein.` });
      }
      data.passwordHash = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { id },
      data,
      select: PUBLIC_USER_FIELDS
    });

    res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Benutzer konnte nicht aktualisiert werden.' });
  }
});

// DELETE /api/users/:id
router.delete('/:id', authenticateJWT, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

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
