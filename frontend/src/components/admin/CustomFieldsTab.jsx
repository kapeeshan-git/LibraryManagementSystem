import React from 'react';

export default function CustomFieldsTab({
  customFieldMsg,
  isEditingCustomField, setIsEditingCustomField,
  customFieldForm, setCustomFieldForm,
  handleSaveCustomField,
  customFields,
  handleDeleteCustomField
}) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs">
        <h2 className="text-xl font-black text-slate-900 mb-2">Google Forms-Style Custom Fields</h2>
        <p className="text-sm text-slate-500 mb-6">Dynamically add new fields to Patrons & Users or Bibliographic Records without changing the database schema.</p>

        {customFieldMsg.text && (
          <div className={`p-4 rounded-xl mb-6 text-sm font-bold flex items-center ${customFieldMsg.type === 'error' ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>
            {customFieldMsg.text}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {/* Form to add/edit fields */}
          <div>
            <h3 className="font-bold text-slate-800 mb-4">{isEditingCustomField ? 'Edit Field' : 'Create New Field'}</h3>
            <form onSubmit={handleSaveCustomField} className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Entity Type</label>
                <select
                  value={customFieldForm.entity_type}
                  onChange={(e) => setCustomFieldForm({...customFieldForm, entity_type: e.target.value})}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-[#670047]"
                  disabled={isEditingCustomField}
                >
                  <option value="USER">Patron & User Profile</option>
                  <option value="BOOK">Bibliographic Record (Book)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Field Name (Label)</label>
                <input
                  type="text"
                  required
                  value={customFieldForm.name}
                  onChange={(e) => setCustomFieldForm({...customFieldForm, name: e.target.value})}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-[#670047]"
                  placeholder="e.g., Blood Group, Alternative Title"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Field Type</label>
                <select
                  value={customFieldForm.field_type}
                  onChange={(e) => setCustomFieldForm({...customFieldForm, field_type: e.target.value})}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-[#670047]"
                >
                  <option value="TEXT">Short Text</option>
                  <option value="NUMBER">Number</option>
                  <option value="DATE">Date</option>
                  <option value="BOOLEAN">Checkbox (Yes/No)</option>
                  <option value="DROPDOWN">Dropdown Options</option>
                </select>
              </div>
              
              {customFieldForm.field_type === 'DROPDOWN' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Dropdown Options (Comma separated)</label>
                  <input
                    type="text"
                    required
                    value={customFieldForm.options.join(', ')}
                    onChange={(e) => setCustomFieldForm({...customFieldForm, options: e.target.value.split(',').map(s => s.trim()).filter(s => s)})}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-[#670047]"
                    placeholder="e.g., A+, B+, O-, AB+"
                  />
                </div>
              )}

              <label className="flex items-center space-x-2 cursor-pointer mt-2">
                <input
                  type="checkbox"
                  checked={customFieldForm.is_required}
                  onChange={(e) => setCustomFieldForm({...customFieldForm, is_required: e.target.checked})}
                  className="rounded text-[#670047] focus:ring-[#670047]"
                />
                <span className="text-sm font-bold text-slate-700">Required Field</span>
              </label>

              <div className="pt-4 flex gap-2">
                <button type="submit" className="flex-1 bg-[#670047] hover:bg-[#4b0150] text-white py-2 rounded-xl text-sm font-bold transition">
                  {isEditingCustomField ? 'Save Changes' : 'Add Field'}
                </button>
                {isEditingCustomField && (
                  <button 
                    type="button" 
                    onClick={() => {
                      setIsEditingCustomField(false);
                      setCustomFieldForm({ entity_type: 'USER', name: '', field_type: 'TEXT', options: [], is_required: false });
                    }}
                    className="px-4 bg-slate-200 hover:bg-slate-300 text-slate-700 py-2 rounded-xl text-sm font-bold transition"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* List of existing fields */}
          <div>
            <h3 className="font-bold text-slate-800 mb-4">Configured Fields</h3>
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {customFields.length === 0 ? (
                <div className="text-center p-6 bg-slate-50 rounded-xl text-sm text-slate-500">No custom fields defined.</div>
              ) : (
                customFields.map(field => (
                  <div key={field.id} className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${field.entity_type === 'USER' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'}`}>
                          {field.entity_type === 'USER' ? 'Patron' : 'Book'}
                        </span>
                        {field.is_required && <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">Required</span>}
                      </div>
                      <h4 className="font-bold text-slate-900">{field.name}</h4>
                      <p className="text-xs text-slate-500 capitalize">{field.field_type.toLowerCase()} {field.field_type === 'DROPDOWN' ? `(${field.options.join(', ')})` : ''}</p>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          setCustomFieldForm(field);
                          setIsEditingCustomField(true);
                        }}
                        className="text-[#670047] hover:text-black font-bold text-xs"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteCustomField(field.id)}
                        className="text-rose-600 hover:text-rose-800 font-bold text-xs"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
