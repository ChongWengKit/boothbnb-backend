import { Prisma, PaymentStatus, EmailLogCategory, EmailLogStatus } from '@prisma/client';
import { CreateEventRequest, EventStatus, SearchEventRequest, UpdateEventRequest, BoothType } from '../types/types.js';
import { prisma } from '../lib/db.js';
import * as slugify from 'slugify';
import { v4 as uuidv4 } from 'uuid';

