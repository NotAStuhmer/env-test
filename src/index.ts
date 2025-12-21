import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import { supabase } from './supabaseClient.js';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get('/test-db', async (req: Request, res: Response) => {
  try {
    // Attempting a simple query to verify the handshake
    const { data, error } = await supabase.from('profiles').select('*');

    if (error) {
      // This catches errors returned by Supabase (like invalid keys)
      throw error;
    }

    res.json({
      status: 'Connection Successful',
      message: 'Your Supabase URL and Key are correct!',
      data
    });

  } catch (error: any) { 
    // We will use 'any' here just to satisfy the compiler for this test,
    // as Supabase error objects have unique structures.
    const errorMessage = error.message || 'Unknown error';
    console.error('❌ Connection Error:', errorMessage);
    
    res.status(error.status || 500).json({
      status: 'Connection Failed',
      message: errorMessage
    });
  }
});

app.post('/create-profile', async (req: Request, res: Response) => {
  try {

    // Destructure the data incoming from the request body
    const { username, bio } = req.body;

    const { data, error } = await supabase
      .from('profiles')
      .insert([{ username, bio }]) // Insert into SQL
      .select(); // Returns the created record

    if (error) throw error;

    res.status(201).json({
      status: 'Success',
      message: 'Profile created!',
      data: data[0]
    });
  } catch (error: any) {
      console.error('❌ Insert Error:', error.message);
      res.status(400).json({ status: 'Error', message: error.message });
  }
});

app.delete('/delete-profile', async (req: Request, res: Response) => {
  try {
    const { username } = req.body;

    const { data, error } = await supabase
      .from('profiles')
      .delete()
      .eq('username', username) // Finds the row where username matches
      .select()

    if (error) throw error;

    res.json({
      status: 'Success',
      message: `Profile '${username}' deleted!`,
      data
    });
  } catch (error: any) {
    console.error('❌ Delete Error:', error.message);
    res.status(400).json({ status: 'Error', message: error.message });
  }
});

app.patch('/update-profile/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // Get the ID from the URL path
    const { bio } = req.body; // Get the new bio from the request body

    const { data, error } = await supabase
      .from('profiles')
      .update({ bio })
      .eq('id',id)
      .select();

    if (error) throw error;

    res.json({
      status: 'Success',
      message: `Profile ID ${id} updated!`,
      data: data[0]
    });

  } catch (error: any) {
    console.error('❌ Update Error:', error.message);
    res.status(400).json({ status: 'Error', message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`🔗 Test your DB at: http://localhost:${PORT}/test-db`);
});