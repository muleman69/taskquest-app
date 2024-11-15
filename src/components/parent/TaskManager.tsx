import React from 'react';
import { PlusCircle, Edit2, Trash2, Users } from 'lucide-react';
import { collection, addDoc, deleteDoc, doc, updateDoc, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import type { Task } from '../../types';

interface TaskFormData {
  title: string;
  description: string;
  coinValue: string;
  icon: string;
  assignedTo: string[];
  type: 'daily' | 'one-time'; // Added type field here
}

interface ChildUser {
  id: string;
  name: string;
  email: string;
}

export function TaskManager() {
  const { currentUser } = useAuth();
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [children, setChildren] = React.useState<ChildUser[]>([]);
  const [isEditing, setIsEditing] = React.useState(false);
  const [editTask, setEditTask] = React.useState<Task | null>(null);
  const [formData, setFormData] = React.useState<TaskFormData>({
    title: '',
    description: '',
    coinValue: '10',
    icon: 'star',
    assignedTo: [],
    type: 'daily', // Default to 'daily'
  });

  // Fetch children accounts
  React.useEffect(() => {
    if (!currentUser) return;

    const fetchChildren = async () => {
      const childrenQuery = query(
        collection(db, 'users'),
        where('parentId', '==', currentUser.uid)
      );

      const snapshot = await getDocs(childrenQuery);
      const childrenData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ChildUser[];
      setChildren(childrenData);
    };

    fetchChildren();
  }, [currentUser]);

  // Fetch tasks
  React.useEffect(() => {
    if (!currentUser) return;

    const tasksQuery = query(
      collection(db, 'tasks'),
      where('createdBy', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(tasksQuery, (snapshot) => {
      const tasksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Task[];
      setTasks(tasksData);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleAddTask = () => {
    setIsEditing(true);
    setEditTask(null);
    setFormData({
      title: '',
      description: '',
      coinValue: '10',
      icon: 'star',
      assignedTo: [],
      type: 'daily' // Default value
    });
  };

  const handleEditTask = (task: Task) => {
    setIsEditing(true);
    setEditTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      coinValue: task.coinValue.toString(),
      icon: task.icon,
      assignedTo: task.assignedTo || [],
      type: task.type || 'daily' // Ensure type is set, default to 'daily'
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const taskData = {
      title: formData.title,
      description: formData.description,
      coinValue: parseInt(formData.coinValue) || 0,
      icon: formData.icon,
      completed: false,
      createdBy: currentUser.uid,
      assignedTo: formData.assignedTo,
      type: formData.type || 'daily', // Include type in submitted data
      lastCompletedAt: null, // Default to null for new tasks
      createdAt: new Date().toISOString()
    };

    try {
      if (editTask) {
        await updateDoc(doc(db, 'tasks', editTask.id), taskData);
      } else {
        await addDoc(collection(db, 'tasks'), taskData);
      }
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const handleDelete = async (taskId: string) => {
    try {
      await deleteDoc(doc(db, 'tasks', taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const toggleChildAssignment = (childId: string) => {
    setFormData(prev => ({
      ...prev,
      assignedTo: prev.assignedTo.includes(childId)
        ? prev.assignedTo.filter(id => id !== childId)
        : [...prev.assignedTo, childId]
    }));
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-900">Task Management</h3>
        <button
          onClick={handleAddTask}
          className="flex items-center space-x-2 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Add Task</span>
        </button>
      </div>

      <div className="space-y-4">
        {tasks.map(task => (
          <div
            key={task.id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
          >
            <div>
              <h4 className="font-semibold text-gray-900">{task.title}</h4>
              <p className="text-sm text-gray-600">{task.description}</p>
              <div className="text-sm text-purple-600 mt-1">
                Reward: {task.coinValue} coins
              </div>
              <div className="text-sm text-gray-700 mt-1">
                Type: {task.type === 'daily' ? 'Daily Task' : 'One-Time Task'}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-500">
                  Assigned to: {children.filter(child => 
                    task.assignedTo?.includes(child.id)
                  ).map(child => child.name).join(', ') || 'No one yet'}
                </span>
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => handleEditTask(task)}
                className="p-2 text-gray-600 hover:text-purple-500 transition-colors"
              >
                <Edit2 className="w-5 h-5" />
              </button>
              <button 
                onClick={() => handleDelete(task.id)}
                className="p-2 text-gray-600 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isEditing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">
              {editTask ? 'Edit Task' : 'Add New Task'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={3}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Coin Value
                </label>
                <input
                  type="number"
                  value={formData.coinValue}
                  onChange={e => setFormData({ ...formData, coinValue: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Task Type
                </label>
                <select
                  value={formData.type}
                  onChange={e => setFormData({ ...formData, type: e.target.value as 'daily' | 'one-time' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                >
                  <option value="daily">Daily</option>
                  <option value="one-time">One-Time</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assign to Children
                </label>
                <div className="space-y-2">
                  {children.length > 0 ? (
                    children.map(child => (
                      <label key={child.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.assignedTo.includes(child.id)}
                          onChange={() => toggleChildAssignment(child.id)}
                          className="rounded text-purple-600 focus:ring-purple-500"
                        />
                        <span>{child.name}</span>
                      </label>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">
                      No child accounts found. Create child accounts first.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                >
                  {editTask ? 'Save Changes' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
