// import { Request, Response } from 'express';
// import { register } from '../service/auth.service.ts';
// import { errorResponse } from '../utils/Api.response.ts';

// export const registerUser = (req: Request, res: Response) => {
//     const { name, email, password } = req.body;

//     // validation
//     if(!email || !password) {
//         return res.status(400).json(
//             errorResponse(
//                 "Email and Password required"
//             )
//         );
//     }

//     const result = register({name, email, password});

    
// }