'use client';

import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { Loader2, UserCheck, ShieldAlert, BookOpen } from 'lucide-react';

interface Employee {
  id: number;
  employeeId: string;
  name: string;
  mobile: string;
  role: string;
  salary: number;
  attendance: string | null;
  leaveRecords: string | null;
  user: {
    email: string;
    createdAt: string;
  };
}

export default function EmployeesRegistryPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await api.get('/employees');
      setEmployees(res.data.employees);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Employee Registry</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Review employee records, payroll salary lists, attendance summaries, and active operational roles.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : employees.length === 0 ? (
          <div className="text-center py-20">
            <UserCheck className="mx-auto text-slate-400 mb-3" size={32} />
            <p className="text-sm text-slate-500">No employee profiles registered</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-slate-500 uppercase tracking-wider">
                  <th className="p-4 font-bold">Emp ID</th>
                  <th className="p-4 font-bold">Employee Name</th>
                  <th className="p-4 font-bold">System Email</th>
                  <th className="p-4 font-bold">Contact No</th>
                  <th className="p-4 font-bold">Assigned Role</th>
                  <th className="p-4 font-bold">Monthly Salary</th>
                  <th className="p-4 font-bold">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                    <td className="p-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                      {emp.employeeId}
                    </td>
                    <td className="p-4 font-semibold text-slate-900 dark:text-white">{emp.name}</td>
                    <td className="p-4 text-slate-500">{emp.user.email}</td>
                    <td className="p-4">{emp.mobile}</td>
                    <td className="p-4">
                      <span className="inline-block px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-[10px] font-bold uppercase tracking-wide rounded-lg text-slate-700 dark:text-slate-300">
                        {emp.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-slate-700 dark:text-slate-300">
                      ₹{emp.salary.toLocaleString('en-IN')}
                    </td>
                    <td className="p-4 text-slate-400">
                      {new Date(emp.user.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
