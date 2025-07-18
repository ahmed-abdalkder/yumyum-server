
 
import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  
  max: 100,  
  message: {
    status: 429,
    message: "Too many requests, please try again later.",
  },
  standardHeaders: true,  
  legacyHeaders: false,   
});
