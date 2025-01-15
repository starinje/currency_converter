import { createApp } from './app';

const port = process.env.PORT || 3000;

createApp().then(app => {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}).catch(error => {
  console.error('Error starting server:', error);
  process.exit(1);
}); 