import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../db';
import { generateAccessToken, generateRefreshToken } from '../utils/helpers';
import { Role } from '../types';
import { AuthenticatedRequest } from '../middleware/auth';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name, role, details } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user and their specific profile (Customer or Employee)
    const userRole = role as Role;
    
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role: userRole,
        },
      });

      if (userRole === Role.CUSTOMER) {
        await tx.customerProfile.create({
          data: {
            userId: newUser.id,
            companyName: details?.companyName || name,
            contactPerson: details?.contactPerson || name,
            mobileNumber: details?.mobileNumber || '',
            email: email,
            gstNumber: details?.gstNumber || null,
            panNumber: details?.panNumber || null,
            address: details?.address || '',
            city: details?.city || '',
            state: details?.state || '',
            country: details?.country || '',
            postalCode: details?.postalCode || '',
            customerType: details?.customerType || 'Shipper',
            creditLimit: parseFloat(details?.creditLimit || '0'),
            paymentTerms: details?.paymentTerms || 'Net 30',
          },
        });
      } else {
        // All non-customers are treated as employees
        const count = await tx.employeeProfile.count();
        const employeeId = `EMP${1000 + count + 1}`;
        await tx.employeeProfile.create({
          data: {
            userId: newUser.id,
            employeeId,
            name,
            mobile: details?.mobile || '',
            role: userRole,
            salary: parseFloat(details?.salary || '0'),
            attendance: '',
            leaveRecords: '',
          },
        });
      }

      // Log activity
      await tx.auditLog.create({
        data: {
          userId: newUser.id,
          action: 'Create',
          entity: 'User',
          details: `Registered user ${newUser.email} as ${userRole}`,
          ipAddress: req.ip,
        },
      });

      return newUser;
    });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    return res.status(201).json({
      message: 'User registered successfully',
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      accessToken,
      refreshToken,
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Log login
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'Login',
        entity: 'User',
        details: `Logged in successfully`,
        ipAddress: req.ip,
      },
    });

    return res.json({
      message: 'Login successful',
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      accessToken,
      refreshToken,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        customer: true,
        employee: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({ user });
  } catch (error: any) {
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const getAllEmployees = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const employees = await prisma.employeeProfile.findMany({
      include: { user: { select: { email: true, createdAt: true } } },
    });
    return res.json({ employees });
  } catch (error: any) {
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

export const updateEmployee = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, mobile, salary, attendance, leaveRecords } = req.body;

    const employee = await prisma.employeeProfile.update({
      where: { id: parseInt(id) },
      data: { name, mobile, salary: parseFloat(salary || '0'), attendance, leaveRecords },
    });

    // Log edit
    await prisma.auditLog.create({
      data: {
        userId: req.user?.id,
        action: 'Update',
        entity: 'EmployeeProfile',
        details: `Updated employee profile: ${employee.employeeId}`,
        ipAddress: req.ip,
      },
    });

    return res.json({ message: 'Employee updated successfully', employee });
  } catch (error: any) {
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
