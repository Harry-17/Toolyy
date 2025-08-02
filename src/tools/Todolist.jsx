import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { 
    getFirestore, 
    collection, 
    addDoc, 
    serverTimestamp, 
    onSnapshot, 
    query, 
    doc, 
    deleteDoc, 
    updateDoc 
} from 'firebase/firestore';

// --- Helper Components ---

// Icon for the delete button
const TrashIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
);

// Main Application Component
export default function App() {
  // --- State Management ---
  const [todos, setTodos] = useState([]); // Holds the list of tasks
  const [input, setInput] = useState(''); // The current value of the input field
  const [loading, setLoading] = useState(true); // True while initially fetching data
  const [error, setError] = useState(null); // Holds any error messages
  
  // --- Firebase State ---
  // These refs will hold the initialized Firebase services
  const db = useRef(null);
  const auth = useRef(null);
  const userId = useRef(null);
  const todosCollectionRef = useRef(null);

  // --- Firebase Initialization and Data Fetching ---
  useEffect(() => {
    // This effect runs once on component mount to set up Firebase and fetch data.

    // 1. Your specific Firebase configuration has been added here.
    const appId = "to-do-list-dec98";
    const firebaseConfig = {
      apiKey: "AIzaSyD3WUvWL8NWT6o1GMEIjzFbof8A75FicDI",
      authDomain: "to-do-list-dec98.firebaseapp.com",
      projectId: "to-do-list-dec98",
      storageBucket: "to-do-list-dec98.appspot.com",
      messagingSenderId: "822484510395",
      appId: "1:822484510395:web:614b07d8da46159d53eb9e",
      measurementId: "G-WWWWPT9F51"
    };

    if (!firebaseConfig) {
        setError("Firebase configuration is missing. The app cannot connect to the database.");
        setLoading(false);
        return;
    }

    // 2. Initialize Firebase App, Auth, and Firestore
    const app = initializeApp(firebaseConfig);
    auth.current = getAuth(app);
    db.current = getFirestore(app);

    // 3. Set up Authentication State Listener
    const unsubscribeAuth = onAuthStateChanged(auth.current, async (user) => {
      if (user) {
        // User is signed in.
        userId.current = user.uid;

        // 4. Define the path to the user's private "todos" collection
        // This ensures that each user can only see their own to-do items.
        const collectionPath = `/artifacts/${appId}/users/${userId.current}/todos`;
        todosCollectionRef.current = collection(db.current, collectionPath);

        // 5. Set up the Real-Time Data Listener (onSnapshot)
        // This listener will automatically update the UI whenever data changes in Firestore.
        const q = query(todosCollectionRef.current);
        const unsubscribeSnapshot = onSnapshot(q, (querySnapshot) => {
          const items = [];
          querySnapshot.forEach((doc) => {
            // Pushes each document's data along with its unique ID into an array
            items.push({ id: doc.id, ...doc.data() });
          });
          // Sort items by creation date, newest first
          items.sort((a, b) => b.createdAt - a.createdAt);
          setTodos(items); // Update the state with the new list
          setLoading(false); // Data has loaded
        }, (err) => {
          // Handle errors from the snapshot listener
          console.error("Firestore snapshot error:", err);
          setError("Could not fetch to-do items. Please refresh the page.");
          setLoading(false);
        });

        // Return a cleanup function for the snapshot listener
        return () => unsubscribeSnapshot();
      } else {
        // User is signed out. Attempt to sign in.
        try {
            // Use the custom token if available, otherwise sign in anonymously
            if (typeof __initial_auth_token !== 'undefined') {
                await signInWithCustomToken(auth.current, __initial_auth_token);
            } else {
                await signInAnonymously(auth.current);
            }
        } catch (err) {
            console.error("Authentication error:", err);
            setError("Could not authenticate. Please check your connection.");
            setLoading(false);
        }
      }
    });

    // Return a cleanup function for the authentication listener
    return () => unsubscribeAuth();
  }, []); // The empty dependency array ensures this effect runs only once.

  // --- CRUD Functions (Create, Update, Delete) ---

  // Function to add a new to-do item
  const addTodo = async (e) => {
    e.preventDefault(); // Prevent form submission from reloading the page
    if (input.trim() === '' || !todosCollectionRef.current) return;

    try {
      // Add a new document to the "todos" collection in Firestore
      await addDoc(todosCollectionRef.current, {
        text: input,
        completed: false,
        createdAt: serverTimestamp(), // Use server's timestamp for consistency
      });
      setInput(''); // Clear the input field after adding
    } catch (err) {
      console.error("Error adding document: ", err);
      setError("Failed to add the task. Please try again.");
    }
  };

  // Function to toggle the 'completed' status of a to-do item
  const toggleComplete = async (todo) => {
    if (!db.current) return;
    const todoRef = doc(db.current, todosCollectionRef.current.path, todo.id);
    try {
      // Update the 'completed' field to the opposite of its current value
      await updateDoc(todoRef, {
        completed: !todo.completed,
      });
    } catch (err) {
      console.error("Error updating document: ", err);
      setError("Failed to update the task's status.");
    }
  };

  // Function to delete a to-do item
  const deleteTodo = async (id) => {
    if (!db.current) return;
    const todoRef = doc(db.current, todosCollectionRef.current.path, id);
    try {
      // Delete the document from Firestore
      await deleteDoc(todoRef);
    } catch (err) {
      console.error("Error deleting document: ", err);
      setError("Failed to delete the task.");
    }
  };

  // --- UI Rendering ---
  return (
    <div className="bg-gray-900 min-h-screen text-white font-sans flex justify-center p-4">
      <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl">
        <div className="p-6 md:p-8">
          <h1 className="text-4xl font-bold text-center text-cyan-400 mb-6">My To-Do List</h1>
          
          {/* Input Form */}
          <form onSubmit={addTodo} className="flex gap-4 mb-6">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-grow bg-gray-700 border border-gray-600 rounded-lg py-3 px-4 text-white text-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
              placeholder="Add a new task..."
            />
            <button type="submit" className="bg-cyan-500 text-gray-900 font-bold py-3 px-6 rounded-lg hover:bg-cyan-400 transition-transform duration-200 active:scale-95 shadow-lg disabled:bg-gray-600" disabled={!input.trim()}>
              Add
            </button>
          </form>

          {/* To-Do List */}
          <div className="space-y-4">
            {loading && <p className="text-center text-gray-400">Loading tasks...</p>}
            {error && <p className="text-center text-red-400 bg-red-500/10 p-3 rounded-lg">{error}</p>}
            
            {!loading && todos.length === 0 && !error && (
              <p className="text-center text-gray-500 py-8">Your list is empty. Add a task to get started!</p>
            )}

            {todos.map((todo) => (
              <div key={todo.id} className={`flex items-center bg-gray-700 p-4 rounded-lg shadow-md transition-all duration-300 ${todo.completed ? 'opacity-50' : 'opacity-100'}`}>
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleComplete(todo)}
                  className="w-6 h-6 bg-gray-600 border-gray-500 rounded text-cyan-500 focus:ring-cyan-600 cursor-pointer"
                />
                <p className={`flex-grow mx-4 text-lg ${todo.completed ? 'line-through text-gray-400' : ''}`}>
                  {todo.text}
                </p>
                <button onClick={() => deleteTodo(todo.id)} className="text-gray-400 hover:text-red-500 p-2 rounded-full transition-colors">
                  <TrashIcon />
                </button>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
