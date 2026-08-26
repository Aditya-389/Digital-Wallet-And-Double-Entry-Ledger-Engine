import 'dotenv/config';
import app from './app.ts';


const PORT = process.env.PORT;

app.listen(PORT, () => {
   console.log(`Server is Running on port ${PORT}`);
});




