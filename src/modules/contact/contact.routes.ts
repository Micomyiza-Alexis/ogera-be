import express from 'express';
import { submitContact } from './contact.controller';

const contactRouter = express.Router();

// Public endpoint - contact form submission from landing page
contactRouter.post('/', submitContact);

export default contactRouter;
