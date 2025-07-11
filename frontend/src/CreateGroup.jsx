import React from 'react';

export default function CreateGroup() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4 text-center text-blue-900">Create a Susu Group</h2>
        {/* Group creation form will go here */}
        <form>
          <input type="text" placeholder="Group Name" className="mb-3 w-full px-4 py-2 border rounded" />
          <input type="number" placeholder="Contribution Amount" className="mb-3 w-full px-4 py-2 border rounded" />
          <select className="mb-3 w-full px-4 py-2 border rounded">
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
          <input type="number" placeholder="Number of Members" className="mb-3 w-full px-4 py-2 border rounded" />
          <button type="submit" className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700">Create Group</button>
        </form>
      </div>
    </div>
  );
}
