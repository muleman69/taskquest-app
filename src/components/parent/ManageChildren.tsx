import React, { useState, useEffect } from 'react';
import { User, Mail, Key, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, getDocs, setDoc, deleteDoc, doc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '../../lib/firebase';

interface ChildAccount {
  id: string;
  name: string;
  email: string;
}

export function ManageChildren() {
  const { currentUser, userData } = useAuth();
  const [children, setChildren] = useState<ChildAccount[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!currentUser?.uid || !userData || userData.role !== 'parent') return;
    loadChildren();
  }, [currentUser, userData]);

  const loadChildren = async () => {
    if (!currentUser?.uid || !userData || userData.role !== 'parent') return;
    
    try {
      console.log('Loading children for parent:', currentUser.uid);
      const childrenQuery = query(
        collection(db, 'users'),
        where('parentId', '==', currentUser.uid),
        where('role', '==', 'child')
      );

      const snapshot = await getDocs(childrenQuery);
      const childrenData = snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        email: doc.data().email
      }));
      
      console.log('Children loaded:', childrenData.length);
      setChildren(childrenData);
    } catch (error) {
      console.error('Error loading children:', error);
      setError('Failed to load child accounts. Please try refreshing the page.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!currentUser?.uid || !userData) {
      setError('Parent user not found. Please log in again.');
      setIsLoading(false);
      return;
    }

    if (userData.role !== 'parent') {
      setError('Only parent accounts can create child accounts.');
      setIsLoading(false);
      return;
    }

    try {
      console.log('Creating child account...', { parentId: currentUser.uid });
      
      // Create child account in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      console.log('Child auth account created:', userCredential.user.uid);

      // Update display name
      await updateProfile(userCredential.user, {
        displayName: formData.name
      });

      console.log('Display name updated');

      // Create user document in Firestore with the same ID as auth
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      await setDoc(userDocRef, {
        uid: userCredential.user.uid,
        name: formData.name,
        email: formData.email,
        role: 'child',
        parentId: currentUser.uid,
        coins: 0,
        tasksCompleted: 0,
        createdAt: new Date().toISOString()
      });

      console.log('Firestore document created');

      // Add new child to local state
      setChildren(prev => [...prev, {
        id: userCredential.user.uid,
        name: formData.name,
        email: formData.email
      }]);

      // Reset form and close modal
      setFormData({ name: '', email: '', password: '' });
      setIsAdding(false);
      
      console.log('Child account creation completed successfully');
    } catch (error: any) {
      console.error('Error creating child account:', error);
      let errorMessage = 'Failed to create child account.';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters.';
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = 'Email/password sign up is not enabled.';
      }
      
      setError(`${errorMessage} (${error.code})`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (childId: string) => {
    if (!window.confirm('Are you sure you want to delete this child account?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'users', childId));
      setChildren(children.filter(child => child.id !== childId));
    } catch (error) {
      console.error('Error deleting child account:', error);
      setError('Failed to delete child account');
    }
  };

  if (!currentUser || !userData || userData.role !== 'parent') {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="text-center py-8 text-gray-500">
          You must be logged in as a parent to manage child accounts.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-900">Manage Children</h3>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center space-x-2 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Child</span>
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {children.map(child => (
          <div
            key={child.id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
          >
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">{child.name}</h4>
                <p className="text-sm text-gray-600">{child.email}</p>
              </div>
            </div>
            <button
              onClick={() => handleDelete(child.id)}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}

        {children.length === 0 && !isAdding && (
          <div className="text-center py-8 text-gray-500">
            No child accounts yet. Click "Add Child" to create one.
          </div>
        )}
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Add Child Account</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Child's Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2`}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <span>Create Account</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}