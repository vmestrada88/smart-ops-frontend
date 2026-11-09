import { useEffect, useState, useMemo } from 'react';

const TasksModal = ({ isOpen, onClose, onSave, initial = {}, clients = [], users = [], tasks = [] }) => {
  const [form, setForm] = useState({ description: '', clientId: '', assignedTo: [], startTime: '', endTime: '', status: 'scheduled' });
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setForm({ description: '', clientId: '', assignedTo: [], startTime: '', endTime: '', status: 'scheduled' });
      setErrors([]);
      setForm(f => ({ ...f, ...initial, assignedTo: initial.assignedTo || [] }));
    }
  }, [isOpen, initial]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleCheckboxChange = (e) => {
    const val = Number(e.target.value);
    setForm(f => {
      const current = Array.isArray(f.assignedTo) ? [...f.assignedTo] : [];
      if (e.target.checked) {
        if (!current.includes(val)) current.push(val);
      } else {
        const idx = current.indexOf(val);
        if (idx >= 0) current.splice(idx, 1);
      }
      return { ...f, assignedTo: current };
    });
  };

  const normalizedTasks = useMemo(() => (tasks || []).map(t => ({
    id: t.id,
    assignedTo: Array.isArray(t.assignedTo) ? t.assignedTo : (t.assignedTo ? [t.assignedTo] : []),
    start: t.startTime ? new Date(t.startTime) : null,
    end: t.endTime ? new Date(t.endTime) : null
  })), [tasks]);

  const findConflicts = (candidate) => {
    const conf = [];
    try {
      const newStart = new Date(candidate.startTime);
      const newEnd = new Date(candidate.endTime);
      if (!(newStart instanceof Date) || !(newEnd instanceof Date) || isNaN(newStart) || isNaN(newEnd)) {
        conf.push('Invalid start or end time');
        return conf;
      }
      if (newStart >= newEnd) {
        conf.push('Start must be before end');
        return conf;
      }

      const selectedTechs = Array.isArray(candidate.assignedTo) ? candidate.assignedTo.map(Number) : [];
      if (!selectedTechs.length) return conf;

      selectedTechs.forEach(techId => {
        const overlap = normalizedTasks.find(t =>
          t.id !== candidate.id && t.assignedTo.includes(techId) && t.start && t.end &&
          (t.start < newEnd && t.end > newStart)
        );
        if (overlap) {
          const u = users.find(x => String(x.id) === String(techId));
          conf.push(`${u?.name || u?.email || techId} is already assigned during that time`);
        }
      });
    } catch (e) {
      conf.push('Error validating times');
    }
    return conf;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...form, assignedTo: (form.assignedTo || []).map(v => (v === '' ? null : Number(v))) };
    const conf = findConflicts(payload);
    if (conf.length) {
      setErrors(conf);
      return;
    }
    setErrors([]);
    onSave(payload);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-lg p-6">
        <h3 className="text-xl font-semibold mb-4">{initial.id ? 'Edit Task' : 'Create Task'}</h3>
        {errors.length > 0 && (
          <div className="mb-4 p-2 border border-red-200 bg-red-50 text-sm text-red-700">
            {errors.map((err, i) => <div key={i}>• {err}</div>)}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <label className="block mb-2">
            <div className="text-sm">Description</div>
            <input name="description" value={form.description} onChange={handleChange} className="w-full border p-2" required />
          </label>

          <label className="block mb-2">
            <div className="text-sm">Client</div>
            <select name="clientId" value={form.clientId || ''} onChange={handleChange} className="w-full border p-2">
              <option value="">(none)</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.companyName || c.name}</option>)}
            </select>
          </label>

          <label className="block mb-2">
            <div className="text-sm mb-2">Assign technician(s)</div>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-auto border p-2">
              {users.map(u => (
                <label key={u.id} className="flex items-center gap-2">
                  <input type="checkbox" name="assignedTo" value={u.id} checked={(form.assignedTo || []).map(String).includes(String(u.id))} onChange={handleCheckboxChange} />
                  <span style={{ width: 12, height: 12, background: u.color || '#6b7280', display: 'inline-block', borderRadius: 2 }} title={u.name} />
                  <span className="text-sm">{u.name || u.email}</span>
                </label>
              ))}
            </div>
          </label>

          <div className="flex gap-2 mb-2">
            <label className="flex-1">
              <div className="text-sm">Start</div>
              <input type="datetime-local" name="startTime" value={form.startTime ? form.startTime.slice(0,16) : ''} onChange={handleChange} className="w-full border p-2" required />
            </label>
            <label className="flex-1">
              <div className="text-sm">End</div>
              <input type="datetime-local" name="endTime" value={form.endTime ? form.endTime.slice(0,16) : ''} onChange={handleChange} className="w-full border p-2" required />
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 mt-4">
            <button type="button" onClick={onClose} className="px-3 py-1 border rounded">Cancel</button>
            <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TasksModal;
