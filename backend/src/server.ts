import config from "./config/env.ts"
import app from './app.ts';


const port = config.PORT;

app.listen(port, () => {
   console.log(`Server is Running on port ${port}`);
});




